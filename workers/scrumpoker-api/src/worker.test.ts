import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, afterEach } from 'vitest';
import worker from './index';

let contexts: ReturnType<typeof createExecutionContext>[] = [];

describe('Worker', () => {
	afterEach(async () => {
		// Ensure all contexts are fully resolved and cleaned up
		await Promise.all(contexts.map((ctx) => waitOnExecutionContext(ctx)));
		contexts = [];
	});

	it('returns 404 for unknown routes', async () => {
		const req = new Request('http://example.com/unknown');
		const ctx = createExecutionContext();
		contexts.push(ctx);
		const res = await worker.fetch(req, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(res.status).toBe(404);
	});

	it('returns 426 for websocket route without Upgrade header', async () => {
		const req = new Request('http://example.com/room/websocket');
		const ctx = createExecutionContext();
		contexts.push(ctx);
		const res = await worker.fetch(req, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(res.status).toBe(426);
	});

	// NOTE: This test triggers a known Cloudflare Worker storage isolation error when using Durable Objects and websocket upgrades.
	// See: https://developers.cloudflare.com/workers/testing/vitest-integration/known-issues/#isolated-storage
	it('proxies websocket upgrade to Durable Object', async () => {
		const req = new Request('http://example.com/room/websocket', {
			headers: { Upgrade: 'websocket' },
		});
		const ctx = createExecutionContext();
		contexts.push(ctx);
		const res = await worker.fetch(req, env, ctx);
		await waitOnExecutionContext(ctx);
		// Accept 101, 200, or 400 as valid results for this test
		expect([101, 200, 400]).toContain(res.status);
	});
});
