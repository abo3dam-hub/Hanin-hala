import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';

function money(v: any) {
  const n = typeof v === 'string' ? parseInt(v.replace(/[^\d-]/g, ''), 10) : Number(v);
  if (isNaN(n)) return 0;
  return Math.trunc(n);
}

export async function cashierRoutes(server: FastifyInstance) {
  server.get('/open-bills', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { rows } = await server.pg.query(
      `SELECT b.*, o.order_number, t.code as table_code, o.id as order_id
       FROM bills b
       JOIN orders o ON o.id = b.order_id
       LEFT JOIN tables t ON t.id = o.table_id
       WHERE b.restaurant_id = $1 AND b.status IN ('OPEN','PARTIALLY_PAID')
       ORDER BY b.created_at ASC`,
      [restaurantId]
    );
    const bills = [];
    for (const bill of rows) {
      const itemsRes = await server.pg.query(
        `SELECT COALESCE(SUM(quantity * unit_price_cents),0) as items_total
         FROM order_items WHERE order_id=$1 AND restaurant_id=$2`,
        [bill.order_id, restaurantId]
      );
      const paymentsRes = await server.pg.query(
        `SELECT COALESCE(SUM(amount_cents),0) as paid FROM payments WHERE bill_id=$1 AND restaurant_id=$2`,
        [bill.id, restaurantId]
      );
      const subtotal = money(itemsRes.rows[0]?.items_total || bill.total_cents || bill.subtotal_cents || 0);
      const paid = money(paymentsRes.rows[0]?.paid || 0);
      bills.push({ ...bill, subtotal_cents: subtotal, paid_cents: paid, remaining_cents: subtotal - paid });
    }
    return { ok: true, data: bills };
  });

  server.post('/bills/from-order/:orderId', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const { orderId } = request.params as any;
    if (!orderId) return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'معرف الطلب مطلوب' } });
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      const orderRes = await client.query(`SELECT * FROM orders WHERE id=$1 AND restaurant_id=$2 FOR UPDATE`, [orderId, restaurantId]);
      if (orderRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.code(404).send({ ok: false, error: { code: 'NOT_FOUND', message: 'الطلب غير موجود' } });
      }
      const order = orderRes.rows[0];
      if (order.status === 'CLOSED' || order.status === 'CANCELLED') {
        await client.query('ROLLBACK');
        return reply.code(400).send({ ok: false, error: { code: 'INVALID_ORDER_STATE', message: 'لا يمكن إنشاء فاتورة لهذا الطلب' } });
      }
      const existing = await client.query(`SELECT id FROM bills WHERE order_id=$1 AND restaurant_id=$2 AND status IN ('OPEN','PARTIALLY_PAID') FOR UPDATE`, [orderId, restaurantId]);
      if (existing.rows.length > 0) {
        await client.query('COMMIT');
        return { ok: true, data: { billId: existing.rows[0].id, existing: true } };
      }
      const itemsRes = await client.query(
        `SELECT COALESCE(SUM(quantity * unit_price_cents),0) as subtotal FROM order_items WHERE order_id=$1 AND restaurant_id=$2`,
        [orderId, restaurantId]
      );
      const subtotal = money(itemsRes.rows[0].subtotal || 0);
      if (subtotal <= 0) {
        await client.query('ROLLBACK');
        return reply.code(400).send({ ok: false, error: { code: 'EMPTY_ORDER', message: 'لا يمكن إنشاء فاتورة لطلب فارغ' } });
      }
      let billNumber = 0;
      for (let i = 0; i < 5; i++) {
        try {
          const numRes = await client.query(`SELECT COALESCE(MAX(bill_number),0)+1 as next FROM bills WHERE restaurant_id=$1`, [restaurantId]);
          billNumber = numRes.rows[0].next;
          const { rows } = await client.query(
            `INSERT INTO bills (restaurant_id, order_id, bill_number, subtotal_cents, tax_cents, service_charge_cents, discount_cents, total_cents, status)
             VALUES ($1,$2,$3,$4,0,0,0,$4,'OPEN') RETURNING *`,
            [restaurantId, orderId, billNumber, subtotal]
          );
          await client.query('COMMIT');
          return { ok: true, data: rows[0] };
        } catch (e: any) {
          if (e.code === '23505') {
            await client.query('ROLLBACK');
            await client.query('BEGIN');
            continue;
          }
          throw e;
        }
      }
      await client.query('ROLLBACK');
      return reply.code(500).send({ ok: false, error: { code: 'BILL_NUMBER_CONFLICT', message: 'تعذر إنشاء رقم فاتورة' } });
    } catch (e) {
      await client.query('ROLLBACK');
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'BILL_CREATE_FAILED', message: 'فشل إنشاء الفاتورة' } });
    } finally {
      client.release();
    }
  });

  server.post('/payments', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId, sub } = request.user;
    const { billId, amountCents, method = 'CASH', reference, notes, idempotencyKey } = request.body as any;
    if (!billId) return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'معرف الفاتورة مطلوب' } });
    const amt = money(amountCents);
    if (amt <= 0) return reply.code(400).send({ ok: false, error: { code: 'INVALID_AMOUNT', message: 'المبلغ غير صالح' } });
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      // idempotency check if key provided
      if (idempotencyKey) {
        const idem = await client.query(`SELECT p.* FROM payments p JOIN bills b ON b.id=p.bill_id WHERE b.restaurant_id=$1 AND p.reference=$2`, [restaurantId, `idem:${idempotencyKey}`]);
        if (idem.rows.length > 0) {
          // return existing result
          const billQ = await client.query(`SELECT b.* FROM bills b WHERE b.id=$1 AND b.restaurant_id=$2`, [billId, restaurantId]);
          const bill = billQ.rows[0];
          const itemsRes = await client.query(`SELECT COALESCE(SUM(quantity*unit_price_cents),0) as subtotal FROM order_items WHERE order_id=$1 AND restaurant_id=$2`, [bill.order_id, restaurantId]);
          const subtotal = money(itemsRes.rows[0].subtotal || bill.total_cents || 0);
          const paidRes = await client.query(`SELECT COALESCE(SUM(amount_cents),0) as paid FROM payments WHERE bill_id=$1 AND restaurant_id=$2`, [billId, restaurantId]);
          const paid = money(paidRes.rows[0].paid || 0);
          await client.query('COMMIT');
          return { ok: true, paid, remaining: subtotal - paid, status: bill.status, idempotent: true };
        }
      }

      const billRes = await client.query(`SELECT * FROM bills WHERE id=$1 AND restaurant_id=$2 FOR UPDATE`, [billId, restaurantId]);
      if (billRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.code(404).send({ ok: false, error: { code: 'NOT_FOUND', message: 'الفاتورة غير موجودة' } });
      }
      const bill = billRes.rows[0];
      if (bill.status === 'PAID' || bill.status === 'CANCELLED' || bill.status === 'VOID') {
        await client.query('ROLLBACK');
        return reply.code(400).send({ ok: false, error: { code: 'INELIGIBLE_BILL', message: 'لا يمكن الدفع على هذه الفاتورة' } });
      }
      const itemsRes = await client.query(`SELECT COALESCE(SUM(quantity*unit_price_cents),0) as subtotal FROM order_items WHERE order_id=$1 AND restaurant_id=$2`, [bill.order_id, restaurantId]);
      const subtotal = money(itemsRes.rows[0].subtotal || bill.total_cents || bill.subtotal_cents || 0);
      if (subtotal <= 0) {
        await client.query('ROLLBACK');
        return reply.code(400).send({ ok: false, error: { code: 'INVALID_TOTAL', message: 'إجمالي الفاتورة غير صالح' } });
      }
      const paidRes = await client.query(`SELECT COALESCE(SUM(amount_cents),0) as paid FROM payments WHERE bill_id=$1 AND restaurant_id=$2 FOR UPDATE`, [billId, restaurantId]);
      const paidSoFar = money(paidRes.rows[0].paid || 0);
      const remaining = subtotal - paidSoFar;
      if (amt > remaining) {
        await client.query('ROLLBACK');
        return reply.code(400).send({ ok: false, error: { code: 'OVERPAY_NOT_ALLOWED', message: 'المبلغ أكبر من المتبقي' } });
      }
      const ref = idempotencyKey ? `idem:${idempotencyKey}` : (reference || null);
      await client.query(
        `INSERT INTO payments (restaurant_id, bill_id, amount_cents, method, received_by_user_id, reference, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [restaurantId, billId, amt, method, sub, ref, notes || null]
      );
      const newPaid = paidSoFar + amt;
      if (newPaid >= subtotal) {
        await client.query(`UPDATE bills SET status='PAID', paid_at=NOW(), updated_at=NOW() WHERE id=$1`, [billId]);
        await client.query(`UPDATE orders SET status='CLOSED', closed_at=NOW(), updated_at=NOW() WHERE id=$1 AND restaurant_id=$2`, [bill.order_id, restaurantId]);
      } else {
        await client.query(`UPDATE bills SET status='PARTIALLY_PAID', updated_at=NOW() WHERE id=$1`, [billId]);
      }
      await client.query('COMMIT');
      return { ok: true, paid: newPaid, remaining: subtotal - newPaid, status: newPaid >= subtotal ? 'PAID' : 'PARTIALLY_PAID' };
    } catch (e) {
      await client.query('ROLLBACK');
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'PAYMENT_FAILED', message: 'فشل تسجيل الدفع' } });
    } finally {
      client.release();
    }
  });
}
