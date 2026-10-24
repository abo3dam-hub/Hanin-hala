import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export async function authRoutes(server: FastifyInstance) {
  server.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'بيانات غير صالحة' } });
    }
    const { username, password } = parsed.data;
    const { rows } = await server.pg.query(
      `SELECT u.id, u.restaurant_id, u.username, u.display_name, u.password_hash, u.is_active, r.name as role
       FROM users u LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.username = $1`,
      [username]
    );
    if (rows.length === 0) {
      return reply.code(401).send({ ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'بيانات الدخول غير صحيحة' } });
    }
    const user = rows[0];
    if (!user.is_active) {
      return reply.code(403).send({ ok: false, error: { code: 'USER_DISABLED', message: 'المستخدم معطل' } });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return reply.code(401).send({ ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'بيانات الدخول غير صحيحة' } });
    }
    const token = server.jwt.sign({ sub: user.id, restaurantId: user.restaurant_id, role: user.role });
    return { ok: true, token, user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role, restaurantId: user.restaurant_id } };
  });

  server.get('/me', { preHandler: [server.authenticate] }, async (request: any) => {
    const user = request.user;
    return { ok: true, user };
  });
}
