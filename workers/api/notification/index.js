import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@github-notifier/notification-trpc';
addEventListener('fetch', (event) => {
    event.respondWith(fetchRequestHandler({
        endpoint: '/trpc',
        req: event.request,
        router: appRouter,
        createContext: () => ({}),
    }));
});
//# sourceMappingURL=index.js.map