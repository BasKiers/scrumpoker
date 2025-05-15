# Project Structure

... existing structure documentation ...

## Cloudflare Worker Test Limitation

- The file `workers/scrumpoker-api/src/worker.test.ts` contains a test for proxying websocket upgrades to Durable Objects.
- This test triggers a known Cloudflare Worker storage isolation error when using Durable Objects and websocket upgrades.
- See: https://developers.cloudflare.com/workers/testing/vitest-integration/known-issues/#isolated-storage
- The error does not affect production code, but will cause the test suite to fail or show errors locally and in CI.
- The test is intentionally kept as-is for future compatibility and to track Cloudflare's progress on this issue. 