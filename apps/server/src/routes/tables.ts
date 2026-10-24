import { FastifyInstance } from 'fastify';

export async function tablesRoutes(server: FastifyInstance) {
  server.get('/', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { rows } = await server.pg.query(
      `SELECT * FROM tables WHERE restaurant_id = $1 AND is_active = true ORDER BY code`,
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
}
