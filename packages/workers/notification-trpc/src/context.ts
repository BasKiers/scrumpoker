import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { DurableObjectNamespace } from '@cloudflare/workers-types';

export interface Env {
  WEBSOCKET: DurableObjectNamespace;
}

export interface CreateContextOptions extends FetchCreateContextFnOptions {
  env: Env;
}

export interface Context {
  env: Env;
}

export async function createContext(opts: CreateContextOptions): Promise<Context> {
  return {
    env: opts.env,
  };
} 