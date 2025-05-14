import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import { loggerMiddleware } from './middleware/logger';
import { errorMiddleware } from './middleware/error';

const t = initTRPC.context<Context>().create();

// Base procedure with middleware
const baseProcedure = t.procedure.use(loggerMiddleware).use(errorMiddleware);

// Export procedures
export const publicProcedure = baseProcedure;
export const router = t.router;
export const middleware = t.middleware; 