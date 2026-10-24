import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import websocket from '@fastify/websocket';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { createPool } from '@hanin-hala/db';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { setupRoutes } from './routes/setup.js';
import { menuRoutes } from './routes/menu.js';
import { importRoutes } from './routes/import.js';
import { tablesRoutes } from './routes/tables.js';
import { ordersRoutes } from './routes/orders.js';
import { wsHandler } from './plugins/ws.js';
import { cashierRoutes } from './routes/cashier.js';

dotenv.config();

const server = Fastify({
  logger: true
});

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  await server.register(cors, {
    origin: true,
    credentials: true
  });
  await server.register(helmet, {
    contentSecurityPolicy: false
  });
  await server.register(websocket);
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production'
  });

  const pool = createPool(process.env.DATABASE_URL || '');
  server.decorate('pg', pool);

  server.decorate('authenticate', async function(request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ ok: false, error: { code: 'UNAUTHORIZED', message: 'غير مصرح' } });
    }
  });

  await server.register(healthRoutes);
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(setupRoutes, { prefix: '/api/setup' });
  await server.register(menuRoutes, { prefix: '/api/menu' });
  await server.register(importRoutes, { prefix: '/api/import' });
  await server.register(tablesRoutes, { prefix: '/api/tables' });
  await server.register(ordersRoutes, { prefix: '/api/orders' });
  await server.register(wsHandler);

  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`Server running on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    pg: any;
    authenticate: any;
  }
}

start();
