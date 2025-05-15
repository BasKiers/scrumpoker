import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock WebSocket
class MockWebSocket {
	send = vi.fn();
	close = vi.fn(); // spy for close
	onopen: (() => void) | null = null;
	onmessage: ((event: MessageEvent) => void) | null = null;
	onclose: (() => void) | null = null;
	onerror: ((event: Event) => void) | null = null;

	constructor() {
		// Simulate connection after a short delay
		setTimeout(() => {
			if (this.onopen) {
				this.onopen();
			}
		}, 0);
	}
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as unknown as typeof WebSocket; 