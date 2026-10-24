import { FastifyInstance } from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';

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
  server.post('/menu/excel/preview', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { filePath: bodyPath, sheetName: bodySheet } = (request.body as any) || {};
    const filePath = bodyPath || join(process.cwd(), '../../malaki-menu-final.xlsx');
    try {
      const XLSX = await import('xlsx');
      const buf = readFileSync(filePath);
      const wb = XLSX.read(buf, { type: 'buffer' });
      const sheetName = bodySheet || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws);
      // Map to normalized preview
      const preview = json.slice(0, 30).map((row: any) => ({
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
    const { sheetName: bodySheet, mapping, strategy = 'merge' } = (request.body as any) || {};
    // strategy: merge (default) - don't auto-delete; only add/update as chosen
    const filePath = join(process.cwd(), '../../malaki-menu-final.xlsx');
    const client = await server.pg.connect();
    try {
      const XLSX = await import('xlsx');
      const buf = readFileSync(filePath);
      const wb = XLSX.read(buf, { type: 'buffer' });
      const sheetName = bodySheet || wb.SheetNames.find((n: string) => n.includes('منيو')) || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(ws);
      
      await client.query('BEGIN');
      const jobRes = await client.query(
        `INSERT INTO menu_import_jobs (restaurant_id, filename, status, created_by_user_id, summary)
         VALUES ($1, $2, 'RUNNING', $3, $4) RETURNING id`,
        [restaurantId, 'malaki-menu-final.xlsx', request.user.sub, JSON.stringify({ sheetName, strategy })]
      );
      const jobId = jobRes.rows[0].id;

      let imported = 0;
      let updated = 0;
      let skipped = 0;
      let errors: any[] = [];
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
            else {
              skipped++;
              errors.push({ row: i + 1, reason: 'category_failed' });
              continue;
            }
          }
        }
        const catId = categoriesMap.get(String(catName));
        let priceCents = 0;
        if (priceRaw !== undefined && priceRaw !== null && priceRaw !== '') {
          // treat as numeric value in the currency unit as-is (no forced /100 assuming cents)
          const num = typeof priceRaw === 'string' ? priceRaw.replace(/[^\d.-]/g, '') : priceRaw;
          priceCents = Math.round(Number(num));
          if (isNaN(priceCents)) {
            errors.push({ row: i + 1, reason: 'invalid_price', value: priceRaw });
            priceCents = 0;
          }
        } else {
          errors.push({ row: i + 1, reason: 'missing_price' });
        }
        const isAvailable = availRaw === 'لا' || availRaw === false ? false : true;
        // Check if exists
        const existing = await client.query(`SELECT id FROM products WHERE restaurant_id=$1 AND name_ar=$2`, [restaurantId, String(nameAr)]);
        if (existing.rows.length > 0 && strategy === 'merge') {
          // update matching product (don't delete)
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
