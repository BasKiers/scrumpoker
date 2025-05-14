import { Hono } from 'hono';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@github-notifier/notification-trpc';
import { createContext } from './context';
import { WebSocketDO } from './websocket';
import type { Context } from 'hono';

interface Env {
  WEBSOCKET: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// WebSocket handler
app.get('/ws/demo', async (c: Context<{ Bindings: Env }>) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response(null, {
      status: 426,
      statusText: 'Expected Upgrade: websocket',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  const id = c.env.WEBSOCKET.idFromName('demo');
  const obj = c.env.WEBSOCKET.get(id);
  return obj.fetch(c.req.raw);
});

// tRPC handler
app.use('/trpc/*', async (c) => {
  return fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: () => ({ env: c.env }),
  });
});

export default app;
export { WebSocketDO }; 