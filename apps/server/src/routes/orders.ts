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
    const { tableId, tableSessionId, source = 'WAITER', notes } = request.body as any;
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      const numRes = await client.query(`SELECT COALESCE(MAX(order_number), 0) + 1 as next FROM orders WHERE restaurant_id = $1`, [restaurantId]);
      const orderNumber = numRes.rows[0].next;
      const { rows } = await client.query(
        `INSERT INTO orders (restaurant_id, table_id, table_session_id, order_number, source, status, opened_by_user_id, waiter_user_id, notes)
         VALUES ($1, $2, $3, $4, $5, 'OPEN', $6, $7, $8) RETURNING *`,
        [restaurantId, tableId || null, tableSessionId || null, orderNumber, source, sub, sub, notes || null]
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

  server.get('/:id/items', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { id } = request.params as any;
    const { rows } = await server.pg.query(
      `SELECT * FROM order_items WHERE order_id=$1 AND restaurant_id=$2 ORDER BY created_at ASC`,
      [id, restaurantId]
    );
    return { ok: true, data: rows };
  });

  server.post('/:id/items', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const { id } = request.params as any;
    const { items } = request.body as any;
    if (!Array.isArray(items) || items.length === 0) {
      return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'العناصر مطلوبة' } });
    }
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      // ensure order belongs to restaurant
      const ord = await client.query(`SELECT id, status FROM orders WHERE id=$1 AND restaurant_id=$2 FOR UPDATE`, [id, restaurantId]);
      if (ord.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.code(404).send({ ok: false, error: { code: 'NOT_FOUND', message: 'الطلب غير موجود' } });
      }
      if (ord.rows[0].status === 'CLOSED' || ord.rows[0].status === 'CANCELLED') {
        await client.query('ROLLBACK');
        return reply.code(400).send({ ok: false, error: { code: 'INVALID_ORDER_STATE', message: 'لا يمكن تعديل هذا الطلب' } });
      }
      for (const it of items) {
        if (!it.productId) {
          await client.query('ROLLBACK');
          return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'معرف الصنف مطلوب' } });
        }
        const qty = Number(it.quantity) || 0;
        if (qty <= 0 || !Number.isInteger(qty)) {
          await client.query('ROLLBACK');
          return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'الكمية غير صالحة' } });
        }
        const pRes = await client.query(`SELECT id, name_ar, price_cents, is_available FROM products WHERE id=$1 AND restaurant_id=$2`, [it.productId, restaurantId]);
        if (pRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return reply.code(400).send({ ok: false, error: { code: 'INVALID_PRODUCT', message: 'صنف غير موجود' } });
        }
        const p = pRes.rows[0];
        if (p.is_available === false) {
          await client.query('ROLLBACK');
          return reply.code(400).send({ ok: false, error: { code: 'PRODUCT_UNAVAILABLE', message: 'الصنف غير متوفر' } });
        }
        let unitPrice = p.price_cents;
        let variantName: string | null = null;
        let variantId: string | null = null;
        if (it.variantId) {
          const vRes = await client.query(`SELECT id, name_ar, price_cents, is_active FROM product_variants WHERE id=$1 AND product_id=$2 AND restaurant_id=$3`, [it.variantId, p.id, restaurantId]);
          if (vRes.rows.length === 0 || vRes.rows[0].is_active === false) {
            await client.query('ROLLBACK');
            return reply.code(400).send({ ok: false, error: { code: 'INVALID_VARIANT', message: 'متغير غير صالح' } });
          }
          variantName = vRes.rows[0].name_ar;
          variantId = vRes.rows[0].id;
          unitPrice = vRes.rows[0].price_cents;
        }
        // don't trust client modifiers total blindly; store as-is only if structure valid
        await client.query(
          `INSERT INTO order_items (restaurant_id, order_id, product_id, product_name_snapshot, product_price_snapshot_cents, quantity, unit_price_cents, notes, status, variant_id, variant_name_snapshot, modifiers_snapshot, modifiers_total_cents)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9, $10, $11, $12)`,
          [restaurantId, id, p.id, p.name_ar, unitPrice, qty, unitPrice, it.notes || null, variantId, variantName, it.modifiers ? JSON.stringify(it.modifiers) : null, Number(it.modifiersTotalCents) || 0]
        );
      }
      await client.query(`UPDATE orders SET status='SENT_TO_KITCHEN', updated_at=NOW() WHERE id=$1 AND restaurant_id=$2`, [id, restaurantId]);
      await client.query('COMMIT');
      try {
        if ((server as any).websocketServer) {
          const msg = JSON.stringify({ type: 'order_updated', payload: { orderId: id, restaurantId } });
          const wss = (server as any).websocketServer;
          if (wss.clients) {
            wss.clients.forEach((client: any) => { if (client.readyState === 1) client.send(msg); });
          }
        }
      } catch (e) {}
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

  server.patch('/items/:itemId/status', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const { itemId } = request.params as any;
    const { status } = request.body as any;
    const allowed = ['PENDING', 'SENT', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      return reply.code(400).send({ ok: false, error: { code: 'INVALID_STATUS', message: 'حالة غير صالحة' } });
    }
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      const cur = await client.query(`SELECT status, order_id FROM order_items WHERE id=$1 AND restaurant_id=$2 FOR UPDATE`, [itemId, restaurantId]);
      if (cur.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.code(404).send({ ok: false, error: { code: 'NOT_FOUND', message: 'غير موجود' } });
      }
      // basic transition guard
      const current = cur.rows[0].status;
      const transitions: any = { PENDING: ['SENT','PREPARING','CANCELLED'], SENT: ['PREPARING','READY','CANCELLED'], PREPARING: ['READY','CANCELLED'], READY: ['SERVED','CANCELLED'], SERVED: [], CANCELLED: [] };
      if (!(transitions[current] || []).includes(status) && !(current === status)) {
        await client.query('ROLLBACK');
        return reply.code(400).send({ ok: false, error: { code: 'INVALID_TRANSITION', message: 'انتقال حالة غير مسموح' } });
      }
      await client.query(`UPDATE order_items SET status=$1, updated_at=NOW() WHERE id=$2 AND restaurant_id=$3`, [status, itemId, restaurantId]);
      await client.query('COMMIT');
      try {
        if ((server as any).websocketServer) {
          const msg = JSON.stringify({ type: 'item_status_changed', payload: { itemId, status, orderId: cur.rows[0].order_id } });
          const wss = (server as any).websocketServer;
          if (wss.clients) {
            wss.clients.forEach((client: any) => { if (client.readyState === 1) client.send(msg); });
          }
        }
      } catch (e) {}
      return { ok: true };
    } catch (e) {
      await client.query('ROLLBACK');
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'UPDATE_FAILED', message: 'فشل التحديث' } });
    } finally {
      client.release();
    }
  });
}
