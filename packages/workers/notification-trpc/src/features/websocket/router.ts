import { router } from '../../trpc';
import { publicProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { connectInputSchema } from './schema';

export const websocketRouter = router({
  connect: publicProcedure
    .input(connectInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // The actual WebSocket upgrade will be handled by the worker
        // This route just returns the connection details
        return {
          url: `/ws/${input.id}`,
          protocol: 'ws',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to establish WebSocket connection',
          cause: error,
        });
      }
    }),
}); 