import { FastifyInstance } from 'fastify';

export async function menuRoutes(server: FastifyInstance) {
  server.get('/categories', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { rows } = await server.pg.query(
      `SELECT * FROM categories WHERE restaurant_id = $1 AND is_active = true ORDER BY sort_order, name_ar`,
      [restaurantId]
    );
    return { ok: true, data: rows };
  });

  server.get('/products', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { rows } = await server.pg.query(
      `SELECT p.*, c.name_ar as category_name_ar
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.restaurant_id = $1 AND p.is_available = true
       ORDER BY c.sort_order, p.sort_order, p.name_ar`,
      [restaurantId]
    );
    return { ok: true, data: rows };
  });
}
