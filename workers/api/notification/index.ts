import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { FetchEvent, Request, Response } from '@cloudflare/workers-types';
import { appRouter } from '@github-notifier/notification-trpc';

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    fetchRequestHandler({
      endpoint: '/trpc',
      req: event.request as unknown as Request,
      router: appRouter,
      createContext: () => ({}),
    }) as unknown as Promise<Response>
  );
}); 