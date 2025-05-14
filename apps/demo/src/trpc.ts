import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@github-notifier/notification-trpc';

export const trpc = createTRPCReact<AppRouter>(); 