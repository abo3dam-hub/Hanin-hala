import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const setupSchema = z.object({
  restaurantName: z.string().min(1),
  restaurantNameAr: z.string().optional(),
  username: z.string().min(3),
  password: z.string().min(6),
  displayName: z.string().min(1)
});

export async function setupRoutes(server: FastifyInstance) {
  server.get('/status', async () => {
    const { rows } = await server.pg.query('SELECT COUNT(*) as count FROM restaurants');
    return { ok: true, initialized: Number(rows[0].count) > 0 };
  });

  server.post('/', async (request, reply) => {
    const parsed = setupSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة' } });
    }
    const { rows: existing } = await server.pg.query('SELECT COUNT(*) as count FROM restaurants');
    if (Number(existing[0].count) > 0) {
      return reply.code(409).send({ ok: false, error: { code: 'ALREADY_INITIALIZED', message: 'تم التهيئة مسبقاً' } });
    }
    const { restaurantName, restaurantNameAr, username, password, displayName } = parsed.data;
    const client = await server.pg.connect();
    try {
      await client.query('BEGIN');
      const restRes = await client.query(
        `INSERT INTO restaurants (name, name_ar) VALUES ($1, $2) RETURNING id`,
        [restaurantName, restaurantNameAr || restaurantName]
      );
      const restaurantId = restRes.rows[0].id;
      const roleRes = await client.query(
        `INSERT INTO roles (restaurant_id, name, permissions) VALUES ($1, 'ADMIN', $2) RETURNING id`,
        [restaurantId, JSON.stringify(['*'])]
      );
      const roleId = roleRes.rows[0].id;
      const passwordHash = await bcrypt.hash(password, 10);
      await client.query(
        `INSERT INTO users (restaurant_id, username, display_name, password_hash, role_id) VALUES ($1, $2, $3, $4, $5)`,
        [restaurantId, username, displayName, passwordHash, roleId]
      );
      await client.query('COMMIT');
      return { ok: true, message: 'تم التهيئة بنجاح' };
    } catch (e) {
      await client.query('ROLLBACK');
      server.log.error(e);
      return reply.code(500).send({ ok: false, error: { code: 'SETUP_FAILED', message: 'فشل التهيئة' } });
    } finally {
      client.release();
    }
  });
}
