import { router } from './trpc';
import { helloRouter } from './features/hello/router';
import { websocketRouter } from './features/websocket/router';

export const appRouter = router({
  hello: helloRouter,
  websocket: websocketRouter,
});

export type AppRouter = typeof appRouter; 