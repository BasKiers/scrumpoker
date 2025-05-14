import { Hono } from 'hono';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@github-notifier/notification-trpc';
import { createContext } from '@github-notifier/notification-trpc/src/context';
import { WebSocketDO } from './websocket';
import type { Context } from 'hono';

interface Env {
  WEBSOCKET: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// tRPC handler
app.use('/trpc/*', async (c) => {
  return fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: () => ({ env: c.env }),
  });
});

// WebSocket handler
app.get('/ws/:id', async (c) => {
  const id = c.req.param('id');
  const doId = c.env.WEBSOCKET.idFromName(id);
  const doObj = c.env.WEBSOCKET.get(doId);
  return doObj.fetch(c.req.raw);
});

export default app; 
export { WebSocketDO }; 