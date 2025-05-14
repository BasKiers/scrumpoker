import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { DurableObjectNamespace, FetchEvent } from '@cloudflare/workers-types';
import { appRouter } from '@github-notifier/notification-trpc';
import { WebSocketDO } from './src/websocket';

export { WebSocketDO };

interface Env {
  WEBSOCKET: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle WebSocket connections
    if (url.pathname.startsWith('/ws/')) {
      const id = url.pathname.split('/')[2];
      const doId = env.WEBSOCKET.idFromName(id);
      const doObj = env.WEBSOCKET.get(doId);
      return doObj.fetch(request);
    }

    // Handle tRPC requests
    if (url.pathname.startsWith('/trpc')) {
      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: appRouter,
        createContext: () => ({}),
      });
    }

    // Handle other requests
    return new Response('Not Found', { status: 404 });
  }
}; 