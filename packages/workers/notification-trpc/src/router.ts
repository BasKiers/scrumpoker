import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return { greeting: `Hello, ${input.name ?? 'World'}!` };
    }),
  connect: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // The actual WebSocket upgrade will be handled by the worker
      // This route just returns the connection details
      return {
        url: `/ws/${input.id}`,
        protocol: 'ws',
      };
    }),
});

export type AppRouter = typeof appRouter; 