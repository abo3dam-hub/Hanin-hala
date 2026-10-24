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
import { cashierRoutes } from './routes/cashier.js';
import { wsHandler } from './plugins/ws.js';

dotenv.config();

const server = Fastify({
  logger: true
});

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

function validateEnv() {
  const jwtSecret = process.env.JWT_SECRET;
  if (NODE_ENV === 'production') {
    if (!jwtSecret || jwtSecret === 'dev-secret-change-in-production' || jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be set to a strong value in production');
    }
  } else {
    if (!jwtSecret) {
      process.env.JWT_SECRET = 'dev-secret-change-in-production';
      server.log.warn('Using default JWT_SECRET in development - change for production');
    }
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
}

async function start() {
  validateEnv();

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
  // test connection
  try {
    const c = await pool.connect();
    c.release();
  } catch (e) {
    server.log.error(e);
    throw e;
  }
  server.decorate('pg', pool);

  server.decorate('authenticate', async function(request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ ok: false, error: { code: 'UNAUTHORIZED', message: 'غير مصرح' } });
      throw err;
    }
  });

  await server.register(healthRoutes);
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(setupRoutes, { prefix: '/api/setup' });
  await server.register(menuRoutes, { prefix: '/api/menu' });
  await server.register(importRoutes, { prefix: '/api/import' });
  await server.register(tablesRoutes, { prefix: '/api/tables' });
  await server.register(ordersRoutes, { prefix: '/api/orders' });
  await server.register(cashierRoutes, { prefix: '/api/cashier' });
  await server.register(wsHandler);

  const close = async () => {
    try {
      await server.close();
    } catch (e) {}
    try {
      await pool.end();
    } catch (e) {}
    process.exit(0);
  };
  process.on('SIGINT', close);
  process.on('SIGTERM', close);

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
