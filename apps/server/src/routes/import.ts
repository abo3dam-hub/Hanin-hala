import { FastifyInstance } from 'fastify';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

function normalizeKey(k: any) {
  if (!k) return '';
  return String(k).trim().toLowerCase().replace(/\s+/g, ' ');
}

function findField(row: any, candidates: string[]) {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const nc = normalizeKey(c);
    for (const k of keys) {
      if (normalizeKey(k) === nc || normalizeKey(k).includes(nc)) {
        return row[k];
      }
    }
  }
  return undefined;
}

export async function importRoutes(server: FastifyInstance) {
  server.get('/menu/excel/default', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    try {
      const filePath = join(process.cwd(), '../../malaki-menu-final.xlsx');
      const XLSX = await import('xlsx');
      const buf = readFileSync(filePath);
      const wb = XLSX.read(buf, { type: 'buffer' });
      return { ok: true, sheets: wb.SheetNames };
    } catch (e: any) {
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'READ_FAILED', message: e.message } });
    }
  });

  server.post('/menu/excel/preview', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { filePath: bodyPath, sheetName: bodySheet, uploadedBase64 } = (request.body as any) || {};
    try {
      const XLSX = await import('xlsx');
      let buf: Buffer;
      if (uploadedBase64) {
        const b64 = String(uploadedBase64).replace(/^data:.*;base64,/, '');
        buf = Buffer.from(b64, 'base64');
      } else {
        const filePath = bodyPath || join(process.cwd(), '../../malaki-menu-final.xlsx');
        // prevent path traversal outside repo root roughly
        if (filePath.includes('..')) return reply.code(400).send({ ok: false, error: { code: 'INVALID_PATH', message: 'مسار غير صالح' } });
        buf = readFileSync(filePath);
      }
      const wb = XLSX.read(buf, { type: 'buffer' });
      const sheetName = bodySheet || wb.SheetNames[0];
      if (!wb.Sheets[sheetName]) return reply.code(400).send({ ok: false, error: { code: 'SHEET_NOT_FOUND', message: 'ورقة العمل غير موجودة' } });
      const ws = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws);
      const preview = json.slice(0, 50).map((row: any) => ({
        category: findField(row, ['الفئة', 'التصنيف', 'فئة']),
        name: findField(row, ['اسم الصنف', 'الصنف', 'الاسم', 'اسم المنتج']),
        description: findField(row, ['الوصف', 'شرح']),
        price: findField(row, ['السعر', 'السعر (ل.س)', 'سعر', 'السعر بالليرة']),
        imageUrl: findField(row, ['رابط الصورة', 'الصورة', 'image', 'صورة']),
        available: findField(row, ['متوفر', 'التوفر', 'متاح'])
      }));
      return { ok: true, sheets: wb.SheetNames, sheetName, count: json.length, preview, headers: json.length > 0 && json[0] ? Object.keys(json[0] as any) : [] };
    } catch (e: any) {
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'IMPORT_PREVIEW_FAILED', message: e.message } });
    }
  });

  server.post('/menu/excel/apply', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const { sheetName: bodySheet, mapping, strategy = 'merge', uploadedBase64, confirm = false } = (request.body as any) || {};
    if (!confirm) {
      return reply.code(400).send({ ok: false, error: { code: 'CONFIRM_REQUIRED', message: 'يجب تأكيد الاستيراد صراحةً' } });
    }
    try {
      const XLSX = await import('xlsx');
      let buf: Buffer;
      if (uploadedBase64) {
        const b64 = String(uploadedBase64).replace(/^data:.*;base64,/, '');
        buf = Buffer.from(b64, 'base64');
      } else {
        const filePath = join(process.cwd(), '../../malaki-menu-final.xlsx');
        if (filePath.includes('..')) return reply.code(400).send({ ok: false, error: { code: 'INVALID_PATH', message: 'مسار غير صالح' } });
        buf = readFileSync(filePath);
      }
      const wb = XLSX.read(buf, { type: 'buffer' });
      const sheetName = bodySheet || wb.SheetNames.find((n: string) => n.includes('منيو')) || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(ws);

      const client = await server.pg.connect();
      try {
        await client.query('BEGIN');
        const jobRes = await client.query(
          `INSERT INTO menu_import_jobs (restaurant_id, filename, status, created_by_user_id, summary)
           VALUES ($1, $2, 'RUNNING', $3, $4) RETURNING id`,
          [restaurantId, uploadedBase64 ? 'uploaded.xlsx' : 'malaki-menu-final.xlsx', request.user.sub, JSON.stringify({ sheetName, strategy, mode: uploadedBase64 ? 'upload' : 'default' })]
        );
        const jobId = jobRes.rows[0].id;

        let imported = 0, updated = 0, skipped = 0;
        const errors: any[] = [];
        const categoriesMap = new Map<string, string>();

        for (let i = 0; i < json.length; i++) {
          const row = json[i];
          const catName = (mapping?.category ? row[mapping.category] : findField(row, ['الفئة', 'التصنيف', 'فئة']));
          const nameAr = (mapping?.name ? row[mapping.name] : findField(row, ['اسم الصنف', 'الصنف', 'الاسم', 'اسم المنتج']));
          let priceRaw = (mapping?.price ? row[mapping.price] : findField(row, ['السعر', 'السعر (ل.س)', 'سعر']));
          const desc = (mapping?.description ? row[mapping.description] : findField(row, ['الوصف', 'شرح']));
          const imageUrl = (mapping?.imageUrl ? row[mapping.imageUrl] : findField(row, ['رابط الصورة', 'الصورة']));
          const availRaw = (mapping?.available ? row[mapping.available] : findField(row, ['متوفر', 'التوفر']));

          if (!catName || !nameAr) {
            skipped++;
            errors.push({ row: i + 1, reason: 'missing_category_or_name' });
            continue;
          }
          if (!categoriesMap.has(String(catName))) {
            const cRes = await client.query(
              `INSERT INTO categories (restaurant_id, name_ar, sort_order)
               VALUES ($1, $2, (SELECT COALESCE(MAX(sort_order),-1)+1 FROM categories WHERE restaurant_id=$1))
               ON CONFLICT DO NOTHING RETURNING id`,
              [restaurantId, String(catName)]
            );
            if (cRes.rows[0]?.id) {
              categoriesMap.set(String(catName), cRes.rows[0].id);
            } else {
              const c2 = await client.query(`SELECT id FROM categories WHERE restaurant_id=$1 AND name_ar=$2`, [restaurantId, String(catName)]);
              if (c2.rows[0]) categoriesMap.set(String(catName), c2.rows[0].id);
              else { skipped++; errors.push({ row: i + 1, reason: 'category_failed' }); continue; }
            }
          }
          const catId = categoriesMap.get(String(catName));
          let priceCents = 0;
          if (priceRaw !== undefined && priceRaw !== null && priceRaw !== '') {
            const num = typeof priceRaw === 'string' ? priceRaw.replace(/[^\d.-]/g, '') : priceRaw;
            priceCents = Math.round(Number(num));
            if (isNaN(priceCents)) { errors.push({ row: i + 1, reason: 'invalid_price', value: priceRaw }); priceCents = 0; }
          } else {
            errors.push({ row: i + 1, reason: 'missing_price' });
          }
          const isAvailable = availRaw === 'لا' || availRaw === false ? false : true;
          const existing = await client.query(`SELECT id FROM products WHERE restaurant_id=$1 AND name_ar=$2`, [restaurantId, String(nameAr)]);
          if (existing.rows.length > 0 && strategy === 'merge') {
            await client.query(
              `UPDATE products SET category_id=$1, price_cents=$2, description_ar=COALESCE($3, description_ar), image_url=COALESCE($4, image_url), is_available=$5, updated_at=NOW() WHERE id=$6 AND restaurant_id=$7`,
              [catId, priceCents, desc ? String(desc) : null, imageUrl ? String(imageUrl) : null, isAvailable, existing.rows[0].id, restaurantId]
            );
            updated++;
          } else if (existing.rows.length > 0) {
            skipped++;
          } else {
            await client.query(
              `INSERT INTO products (restaurant_id, category_id, name_ar, price_cents, image_url, is_available)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [restaurantId, catId, String(nameAr), priceCents, imageUrl ? String(imageUrl) : null, isAvailable]
            );
            imported++;
          }
        }

        const summary = { imported, updated, skipped, errorsCount: errors.length, errors: errors.slice(0, 100), strategy, sheetName };
        await client.query(
          `UPDATE menu_import_jobs SET status='COMPLETED', summary=$1, completed_at=NOW() WHERE id=$2`,
          [JSON.stringify(summary), jobId]
        );
        await client.query('COMMIT');
        return { ok: true, jobId, ...summary };
      } catch (e: any) {
        await client.query('ROLLBACK');
        server.log.error(e);
        return reply.code(500).send({ ok: false, error: { code: 'IMPORT_APPLY_FAILED', message: e.message } });
      } finally {
        client.release();
      }
    } catch (e: any) {
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'IMPORT_APPLY_FAILED', message: e.message } });
    }
  });

  server.get('/menu/excel/jobs', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { rows } = await server.pg.query(
      `SELECT * FROM menu_import_jobs WHERE restaurant_id=$1 ORDER BY created_at DESC LIMIT 20`,
      [restaurantId]
    );
    return { ok: true, data: rows };
  });
}
