import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const categorySchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional()
});

const productSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  priceCents: z.number().int().min(0),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isAvailable: z.boolean().optional(),
  hasVariants: z.boolean().optional(),
  hasModifiers: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

export async function menuRoutes(server: FastifyInstance) {
  // Public-ish read for waiter apps (still require auth)
  server.get('/categories', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { rows } = await server.pg.query(
      `SELECT * FROM categories WHERE restaurant_id = $1 ORDER BY sort_order, name_ar`,
      [restaurantId]
    );
    return { ok: true, data: rows };
  });

  server.post('/categories', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const parsed = categorySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة' } });
    }
    const { nameAr, nameEn, sortOrder, isActive } = parsed.data;
    try {
      const { rows } = await server.pg.query(
        `INSERT INTO categories (restaurant_id, name_ar, name_en, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [restaurantId, nameAr, nameEn || null, sortOrder || 0, isActive !== false]
      );
      return { ok: true, data: rows[0] };
    } catch (e: any) {
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'CATEGORY_CREATE_FAILED', message: 'فشل إضافة الفئة' } });
    }
  });

  server.put('/categories/:id', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const { id } = request.params as any;
    const parsed = categorySchema.partial().safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة' } });
    }
    const fields = parsed.data;
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;
    if (fields.nameAr !== undefined) { sets.push(`name_ar=$${i++}`); vals.push(fields.nameAr); }
    if (fields.nameEn !== undefined) { sets.push(`name_en=$${i++}`); vals.push(fields.nameEn); }
    if (fields.sortOrder !== undefined) { sets.push(`sort_order=$${i++}`); vals.push(fields.sortOrder); }
    if (fields.isActive !== undefined) { sets.push(`is_active=$${i++}`); vals.push(fields.isActive); }
    sets.push(`updated_at=NOW()`);
    vals.push(id, restaurantId);
    try {
      const { rows } = await server.pg.query(
        `UPDATE categories SET ${sets.join(', ')} WHERE id=$${i++} AND restaurant_id=$${i++} RETURNING *`,
        vals
      );
      if (rows.length === 0) return reply.code(404).send({ ok: false, error: { code: 'NOT_FOUND', message: 'غير موجود' } });
      return { ok: true, data: rows[0] };
    } catch (e: any) {
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'CATEGORY_UPDATE_FAILED', message: 'فشل تحديث الفئة' } });
    }
  });

  server.get('/products', { preHandler: [server.authenticate] }, async (request: any) => {
    const { restaurantId } = request.user;
    const { rows } = await server.pg.query(
      `SELECT p.*, c.name_ar as category_name_ar
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.restaurant_id = $1
       ORDER BY COALESCE(c.sort_order,0), p.sort_order, p.name_ar`,
      [restaurantId]
    );
    return { ok: true, data: rows };
  });

  server.post('/products', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const parsed = productSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة' } });
    }
    const d = parsed.data;
    try {
      const { rows } = await server.pg.query(
        `INSERT INTO products (restaurant_id, category_id, name_ar, name_en, description_ar, description_en, price_cents, image_url, is_available, has_variants, has_modifiers, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [restaurantId, d.categoryId || null, d.nameAr, d.nameEn || null, d.descriptionAr || null, d.descriptionEn || null,
         d.priceCents, d.imageUrl || null, d.isAvailable !== false, d.hasVariants === true, d.hasModifiers === true, d.sortOrder || 0]
      );
      return { ok: true, data: rows[0] };
    } catch (e: any) {
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'PRODUCT_CREATE_FAILED', message: 'فشل إضافة الصنف' } });
    }
  });

  server.put('/products/:id', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const { id } = request.params as any;
    const parsed = productSchema.partial().safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة' } });
    }
    const fields = parsed.data as any;
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;
    const map: any = {
      categoryId: 'category_id', nameAr: 'name_ar', nameEn: 'name_en',
      descriptionAr: 'description_ar', descriptionEn: 'description_en',
      priceCents: 'price_cents', imageUrl: 'image_url', isAvailable: 'is_available',
      hasVariants: 'has_variants', hasModifiers: 'has_modifiers', sortOrder: 'sort_order'
    };
    for (const k of Object.keys(map)) {
      if (fields[k] !== undefined) {
        sets.push(`${map[k]}=$${i++}`);
        if (k === 'categoryId') vals.push(fields[k]);
        else if (k === 'imageUrl' && fields[k] === '') vals.push(null);
        else vals.push(fields[k]);
      }
    }
    if (sets.length === 0) return reply.code(400).send({ ok: false, error: { code: 'NO_CHANGES', message: 'لا توجد تعديلات' } });
    sets.push(`updated_at=NOW()`);
    vals.push(id, restaurantId);
    try {
      const { rows } = await server.pg.query(
        `UPDATE products SET ${sets.join(', ')} WHERE id=$${i++} AND restaurant_id=$${i++} RETURNING *`,
        vals
      );
      if (rows.length === 0) return reply.code(404).send({ ok: false, error: { code: 'NOT_FOUND', message: 'غير موجود' } });
      return { ok: true, data: rows[0] };
    } catch (e: any) {
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'PRODUCT_UPDATE_FAILED', message: 'فشل تحديث الصنف' } });
    }
  });

  // Prevent deleting products used in historical orders - soft disable instead
  server.delete('/products/:id', { preHandler: [server.authenticate] }, async (request: any, reply) => {
    const { restaurantId } = request.user;
    const { id } = request.params as any;
    try {
      const { rows } = await server.pg.query(
        `SELECT COUNT(*) as c FROM order_items WHERE product_id=$1 AND restaurant_id=$2`,
        [id, restaurantId]
      );
      if (Number(rows[0].c) > 0) {
        await server.pg.query(`UPDATE products SET is_available=false, updated_at=NOW() WHERE id=$1 AND restaurant_id=$2`, [id, restaurantId]);
        return { ok: true, message: 'تم تعطيل الصنف لأنه مستخدم في طلبات سابقة', disabled: true };
      }
      await server.pg.query(`DELETE FROM products WHERE id=$1 AND restaurant_id=$2`, [id, restaurantId]);
      return { ok: true, message: 'تم الحذف' };
    } catch (e: any) {
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'PRODUCT_DELETE_FAILED', message: 'فشل حذف الصنف' } });
    }
  });
}
