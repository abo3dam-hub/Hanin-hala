import { FastifyInstance } from 'fastify';

export async function healthRoutes(server: FastifyInstance) {
  server.get('/health', async () => {
    return { ok: true, status: 'healthy', timestamp: new Date().toISOString() };
  });
}
