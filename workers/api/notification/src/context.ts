import { Context } from 'hono';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

interface Env {
  WEBSOCKET: DurableObjectNamespace;
}

export const createContext = () => {
  return {
    env: {} as Env,
  };
}; 