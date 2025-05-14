import { middleware } from '../trpc';
import { TRPCError } from '@trpc/server';

export const errorMiddleware = middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    
    console.error('Unhandled error:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      cause: error,
    });
  }
}); 