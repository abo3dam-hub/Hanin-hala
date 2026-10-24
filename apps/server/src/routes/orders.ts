import { FastifyInstance } from 'fastify';

export async function ordersRoutes(server: FastifyInstance) {
  server.get('/', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { rows } = await server.pg.query(
      `SELECT o.*, t.code as table_code
       FROM orders o
       LEFT JOIN tables t ON t.id = o.table_id
       WHERE o.restaurant_id = $1 AND o.status NOT IN ('CLOSED','CANCELLED')
       ORDER BY o.created_at DESC`,
      [restaurantId]
    );
    return { ok: true, data: rows };
  });

  server.post('/', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId, sub } = request.user;
    const { tableId, source = 'WAITER', notes } = request.body as any;
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      const numRes = await client.query(`SELECT COALESCE(MAX(order_number), 0) + 1 as next FROM orders WHERE restaurant_id = $1`, [restaurantId]);
      const orderNumber = numRes.rows[0].next;
      const { rows } = await client.query(
        `INSERT INTO orders (restaurant_id, table_id, order_number, source, status, opened_by_user_id, waiter_user_id, notes)
         VALUES ($1, $2, $3, $4, 'OPEN', $5, $6, $7) RETURNING *`,
        [restaurantId, tableId || null, orderNumber, source, sub, sub, notes || null]
      );
      await client.query('COMMIT');
      return { ok: true, data: rows[0] };
    } catch (e) {
      await client.query('ROLLBACK');
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'ORDER_CREATE_FAILED', message: 'فشل إنشاء الطلب' } });
    } finally {
      client.release();
    }
  });

  server.post('/:id/items', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const { id } = request.params as any;
    const { items } = request.body as any; // [{productId, quantity, notes}]
    if (!Array.isArray(items) || items.length === 0) {
      return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'العناصر مطلوبة' } });
    }
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      for (const it of items) {
        const pRes = await client.query(`SELECT id, name_ar, price_cents FROM products WHERE id=$1 AND restaurant_id=$2`, [it.productId, restaurantId]);
        if (pRes.rows.length === 0) continue;
        const p = pRes.rows[0];
        await client.query(
          `INSERT INTO order_items (restaurant_id, order_id, product_id, product_name_snapshot, product_price_snapshot_cents, quantity, unit_price_cents, notes, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')`,
          [restaurantId, id, p.id, p.name_ar, p.price_cents, it.quantity || 1, p.price_cents, it.notes || null]
        );
      }
      await client.query(`UPDATE orders SET status='SENT_TO_KITCHEN', updated_at=NOW() WHERE id=$1 AND restaurant_id=$2`, [id, restaurantId]);
      await client.query('COMMIT');
      return { ok: true };
    } catch (e) {
      await client.query('ROLLBACK');
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'ORDER_ITEMS_FAILED', message: 'فشل إضافة عناصر الطلب' } });
    } finally {
      client.release();
    }
  });

  server.get('/kitchen', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { rows } = await server.pg.query(
      `SELECT oi.*, o.order_number, o.notes as order_notes, o.source, t.code as table_code
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN tables t ON t.id = o.table_id
       WHERE oi.restaurant_id = $1 AND oi.status IN ('PENDING','SENT','PREPARING')
       ORDER BY oi.created_at ASC`,
      [restaurantId]
    );
    return { ok: true, data: rows };
  });
}
