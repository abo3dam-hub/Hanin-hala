import { FastifyInstance } from 'fastify';

export async function healthRoutes(server: FastifyInstance) {
  server.get('/health', async () => {
    return { ok: true, status: 'up' };
  });
  server.get('/api/health', async () => {
    return { ok: true, status: 'up' };
  });
}
