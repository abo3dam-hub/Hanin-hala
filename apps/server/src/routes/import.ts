import { FastifyInstance } from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function importRoutes(server: FastifyInstance) {
  server.post('/menu/excel/preview', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    // Read malaki-menu-final.xlsx from repo root
    const filePath = join(process.cwd(), '../../malaki-menu-final.xlsx');
    try {
      const XLSX = await import('xlsx');
      const buf = readFileSync(filePath);
      const wb = XLSX.read(buf, { type: 'buffer' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws);
      return { ok: true, sheetName, count: json.length, preview: json.slice(0, 20) };
    } catch (e: any) {
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'IMPORT_PREVIEW_FAILED', message: e.message } });
    }
  });

  server.post('/menu/excel/apply', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const filePath = join(process.cwd(), '../../malaki-menu-final.xlsx');
    const client = await server.pg.connect();
    try {
      const XLSX = await import('xlsx');
      const buf = readFileSync(filePath);
      const wb = XLSX.read(buf, { type: 'buffer' });
      const sheetName = wb.SheetNames.find((n: string) => n.includes('منيو')) || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(ws);
      await client.query('BEGIN');
      // Create job
      const jobRes = await client.query(
        `INSERT INTO menu_import_jobs (restaurant_id, filename, status, created_by_user_id) VALUES ($1, $2, 'RUNNING', $3) RETURNING id`,
        [restaurantId, 'malaki-menu-final.xlsx', request.user.sub]
      );
      const jobId = jobRes.rows[0].id;
      let imported = 0;
      const categoriesMap = new Map<string, string>();
      for (const row of json) {
        const catName = row['الفئة'];
        const nameAr = row['اسم الصنف'];
        const price = row['السعر (ل.س)'];
        if (!catName || !nameAr) continue;
        if (!categoriesMap.has(catName)) {
          const cRes = await client.query(
            `INSERT INTO categories (restaurant_id, name_ar, sort_order) VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING RETURNING id`,
            [restaurantId, catName, categoriesMap.size]
          );
          if (cRes.rows[0]?.id) {
            categoriesMap.set(catName, cRes.rows[0].id);
          } else {
            const c2 = await client.query(`SELECT id FROM categories WHERE restaurant_id=$1 AND name_ar=$2`, [restaurantId, catName]);
            if (c2.rows[0]) categoriesMap.set(catName, c2.rows[0].id);
          }
        }
        const catId = categoriesMap.get(catName);
        const priceCents = Number(price) || 0;
        await client.query(
          `INSERT INTO products (restaurant_id, category_id, name_ar, price_cents, is_available)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [restaurantId, catId, nameAr, priceCents, row['متوفر'] === 'لا' ? false : true]
        );
        imported++;
      }
      await client.query(
        `UPDATE menu_import_jobs SET status='COMPLETED', summary=$1, completed_at=NOW() WHERE id=$2`,
        [JSON.stringify({ imported, total: json.length }), jobId]
      );
      await client.query('COMMIT');
      return { ok: true, imported, total: json.length };
    } catch (e: any) {
      await client.query('ROLLBACK');
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'IMPORT_APPLY_FAILED', message: e.message } });
    } finally {
      client.release();
    }
  });
}
