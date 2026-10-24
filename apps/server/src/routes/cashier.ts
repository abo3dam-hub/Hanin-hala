import { FastifyInstance } from 'fastify';
import { z } from 'zod';

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
    // compute totals from order items as well for accuracy
    const bills = [];
    for (const bill of rows) {
      const itemsRes = await server.pg.query(
        `SELECT SUM(quantity * unit_price_cents) as items_total, COUNT(*) as cnt
         FROM order_items WHERE order_id=$1 AND restaurant_id=$2`,
        [bill.order_id, restaurantId]
      );
      const paymentsRes = await server.pg.query(
        `SELECT COALESCE(SUM(amount_cents),0) as paid FROM payments WHERE bill_id=$1 AND restaurant_id=$2`,
        [bill.id, restaurantId]
      );
      const subtotal = Number(itemsRes.rows[0]?.items_total || bill.subtotal_cents || 0);
      const paid = Number(paymentsRes.rows[0]?.paid || 0);
      bills.push({ ...bill, subtotal_cents: subtotal, paid_cents: paid, remaining_cents: subtotal - paid });
    }
    return { ok: true, data: bills };
  });

  server.post('/bills/from-order/:orderId', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const { orderId } = request.params as any;
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query(`SELECT id FROM bills WHERE order_id=$1 AND restaurant_id=$2 AND status IN ('OPEN','PARTIALLY_PAID')`, [orderId, restaurantId]);
      if (existing.rows.length > 0) {
        await client.query('COMMIT');
        return { ok: true, data: { billId: existing.rows[0].id, existing: true } };
      }
      const itemsRes = await client.query(
        `SELECT COALESCE(SUM(quantity * unit_price_cents),0) as subtotal FROM order_items WHERE order_id=$1 AND restaurant_id=$2`,
        [orderId, restaurantId]
      );
      const subtotal = Number(itemsRes.rows[0].subtotal || 0);
      const numRes = await client.query(`SELECT COALESCE(MAX(bill_number),0)+1 as next FROM bills WHERE restaurant_id=$1`, [restaurantId]);
      const billNumber = numRes.rows[0].next;
      const { rows } = await client.query(
        `INSERT INTO bills (restaurant_id, order_id, bill_number, subtotal_cents, tax_cents, service_charge_cents, discount_cents, total_cents, status)
         VALUES ($1,$2,$3,$4,0,0,0,$4,'OPEN') RETURNING *`,
        [restaurantId, orderId, billNumber, subtotal]
      );
      await client.query('COMMIT');
      return { ok: true, data: rows[0] };
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
    const { billId, amountCents, method = 'CASH', reference, notes } = request.body as any;
    if (!billId || !amountCents || amountCents <= 0) {
      return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'بيانات الدفع غير صالحة' } });
    }
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      const billRes = await client.query(`SELECT * FROM bills WHERE id=$1 AND restaurant_id=$2 FOR UPDATE`, [billId, restaurantId]);
      if (billRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.code(404).send({ ok: false, error: { code: 'NOT_FOUND', message: 'الفاتورة غير موجودة' } });
      }
      const bill = billRes.rows[0];
      const itemsRes = await client.query(`SELECT COALESCE(SUM(quantity*unit_price_cents),0) as subtotal FROM order_items WHERE order_id=$1 AND restaurant_id=$2`, [bill.order_id, restaurantId]);
      const subtotal = Number(itemsRes.rows[0].subtotal || bill.total_cents || bill.subtotal_cents || 0);
      const paidRes = await client.query(`SELECT COALESCE(SUM(amount_cents),0) as paid FROM payments WHERE bill_id=$1 AND restaurant_id=$2 FOR UPDATE`, [billId, restaurantId]);
      const paidSoFar = Number(paidRes.rows[0].paid || 0);
      const remaining = subtotal - paidSoFar;
      if (amountCents > remaining + 1) { // allow small rounding? but be strict
        await client.query('ROLLBACK');
        return reply.code(400).send({ ok: false, error: { code: 'OVERPAY_NOT_ALLOWED', message: 'المبلغ أكبر من المتبقي' } });
      }
      // prevent duplicate same amount in very short time? simple idempotency by not allowing same exact payment twice quickly - check last payment
      const lastPay = await client.query(`SELECT id, amount_cents, created_at FROM payments WHERE bill_id=$1 ORDER BY created_at DESC LIMIT 1`, [billId]);
      if (lastPay.rows.length > 0 && lastPay.rows[0].amount_cents == amountCents && (Date.now() - new Date(lastPay.rows[0].created_at).getTime()) < 5000) {
        await client.query('ROLLBACK');
        return reply.code(409).send({ ok: false, error: { code: 'DUPLICATE_PAYMENT', message: 'تم تسجيل دفعة مشابهة مؤخراً' } });
      }
      await client.query(
        `INSERT INTO payments (restaurant_id, bill_id, amount_cents, method, received_by_user_id, reference, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [restaurantId, billId, amountCents, method, sub, reference || null, notes || null]
      );
      const newPaid = paidSoFar + amountCents;
      if (newPaid >= subtotal) {
        await client.query(`UPDATE bills SET status='PAID', paid_at=NOW(), updated_at=NOW() WHERE id=$1`, [billId]);
        await client.query(`UPDATE orders SET status='CLOSED', closed_at=NOW(), updated_at=NOW() WHERE id=$1`, [bill.order_id]);
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
