import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function tablesRoutes(server: FastifyInstance) {
  server.get('/', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { rows } = await server.pg.query(
      `SELECT t.*, 
              (SELECT COUNT(*) FROM orders o WHERE o.table_id=t.id AND o.restaurant_id=t.restaurant_id AND o.status NOT IN ('CLOSED','CANCELLED')) as open_orders
       FROM tables t 
       WHERE t.restaurant_id = $1 AND t.is_active = true 
       ORDER BY t.code`,
      [restaurantId]
    );
    return { ok: true, data: rows };
  });

  server.post('/', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const { code, seats, area } = request.body as any;
    if (!code) return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'رقم الطاولة مطلوب' } });
    try {
      const { rows } = await server.pg.query(
        `INSERT INTO tables (restaurant_id, code, seats, area) VALUES ($1, $2, $3, $4) RETURNING *`,
        [restaurantId, code, seats || null, area || null]
      );
      return { ok: true, data: rows[0] };
    } catch (e: any) {
      return reply.code(409).send({ ok: false, error: { code: 'DUPLICATE', message: 'الطاولة موجودة' } });
    }
  });

  server.post('/:id/open-session', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId, sub } = request.user;
    const { id } = request.params as any;
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      // check existing open session
      const existing = await client.query(`SELECT id FROM table_sessions WHERE table_id=$1 AND restaurant_id=$2 AND status='OPEN'`, [id, restaurantId]);
      if (existing.rows.length > 0) {
        await client.query('COMMIT');
        return { ok: true, data: { sessionId: existing.rows[0].id, existing: true } };
      }
      const { rows } = await client.query(
        `INSERT INTO table_sessions (restaurant_id, table_id, opened_by_user_id, status)
         VALUES ($1,$2,$3,'OPEN') RETURNING *`,
        [restaurantId, id, sub]
      );
      await client.query('COMMIT');
      return { ok: true, data: rows[0] };
    } catch (e) {
      await client.query('ROLLBACK');
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'SESSION_FAILED', message: 'فشل فتح الجلسة' } });
    } finally {
      client.release();
    }
  });
}
