import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { useWebSocket } from '../useWebSocket';
import type { WebSocketEvent } from 'shared-types';

// Create a wrapper component with Router context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/']}>
    {children}
  </MemoryRouter>
);

describe('useWebSocket', () => {
	const mockWebSocket = vi.fn();
	const originalWebSocket = global.WebSocket;

	beforeEach(() => {
		vi.clearAllMocks();
		global.WebSocket = mockWebSocket as unknown as typeof WebSocket;
	});

	afterEach(() => {
		global.WebSocket = originalWebSocket;
	});

	it('should connect to WebSocket server', () => {
		const mockWs = {
			send: vi.fn(),
			close: vi.fn(),
			onopen: null as (() => void) | null,
			onmessage: null as ((event: MessageEvent) => void) | null,
			onclose: null as (() => void) | null,
			onerror: null as ((event: Event) => void) | null,
		};

		mockWebSocket.mockImplementation(() => mockWs);

		const { result } = renderHook(
			() =>
				useWebSocket({
					roomId: 'test-room',
					userId: 'user1',
					onMessage: vi.fn(),
				}),
			{ wrapper }
		);

		expect(mockWebSocket).toHaveBeenCalledWith(
			expect.stringContaining('/test-room/websocket?userId=user1')
		);
		expect(result.current.isConnected).toBe(false);

		act(() => {
			mockWs.onopen?.();
		});

		expect(result.current.isConnected).toBe(true);
	});

	it('should handle incoming messages', () => {
		const mockWs = {
			send: vi.fn(),
			close: vi.fn(),
			onopen: null as (() => void) | null,
			onmessage: null as ((event: MessageEvent) => void) | null,
			onclose: null as (() => void) | null,
			onerror: null as ((event: Event) => void) | null,
		};

		mockWebSocket.mockImplementation(() => mockWs);

		const onMessage = vi.fn();
		renderHook(
			() =>
				useWebSocket({
					roomId: 'test-room',
					userId: 'user1',
					onMessage,
				}),
			{ wrapper }
		);

		const testMessage: WebSocketEvent = { type: 'connect', userId: 'user1' };
		act(() => {
			mockWs.onmessage?.({
				data: JSON.stringify(testMessage),
			} as MessageEvent);
		});

		expect(onMessage).toHaveBeenCalledWith(testMessage);
	});

	it('should handle connection errors', () => {
		const mockWs = {
			send: vi.fn(),
			close: vi.fn(),
			onopen: null as (() => void) | null,
			onmessage: null as ((event: MessageEvent) => void) | null,
			onclose: null as (() => void) | null,
			onerror: null as ((event: Event) => void) | null,
		};

		mockWebSocket.mockImplementation(() => mockWs);

		const { result } = renderHook(
			() =>
				useWebSocket({
					roomId: 'test-room',
					userId: 'user1',
					onMessage: vi.fn(),
				}),
			{ wrapper }
		);

		act(() => {
			mockWs.onerror?.(new Event('error'));
		});

		expect(result.current.isConnected).toBe(false);
	});

	it('should handle disconnection', () => {
		const mockWs = {
			send: vi.fn(),
			close: vi.fn(),
			onopen: null as (() => void) | null,
			onmessage: null as ((event: MessageEvent) => void) | null,
			onclose: null as (() => void) | null,
			onerror: null as ((event: Event) => void) | null,
		};

		mockWebSocket.mockImplementation(() => mockWs);

		const { result } = renderHook(
			() =>
				useWebSocket({
					roomId: 'test-room',
					userId: 'user1',
					onMessage: vi.fn(),
				}),
			{ wrapper }
		);

		act(() => {
			mockWs.onopen?.();
		});

		expect(result.current.isConnected).toBe(true);

		act(() => {
			mockWs.onclose?.();
		});

		expect(result.current.isConnected).toBe(false);
	});

	it('should send messages', () => {
		const mockWs = {
			send: vi.fn(),
			close: vi.fn(),
			onopen: null as (() => void) | null,
			onmessage: null as ((event: MessageEvent) => void) | null,
			onclose: null as (() => void) | null,
			onerror: null as ((event: Event) => void) | null,
		};

		mockWebSocket.mockImplementation(() => mockWs);

		const { result } = renderHook(
			() =>
				useWebSocket({
					roomId: 'test-room',
					userId: 'user1',
					onMessage: vi.fn(),
				}),
			{ wrapper }
		);

		act(() => {
			mockWs.onopen?.();
		});

		const testMessage: WebSocketEvent = { type: 'connect', userId: 'user1' };
		act(() => {
			result.current.sendMessage(testMessage);
		});

		expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
	});

	it('should not send messages when disconnected', () => {
		const mockWs = {
			send: vi.fn(),
			close: vi.fn(),
			onopen: null as (() => void) | null,
			onmessage: null as ((event: MessageEvent) => void) | null,
			onclose: null as (() => void) | null,
			onerror: null as ((event: Event) => void) | null,
		};

		mockWebSocket.mockImplementation(() => mockWs);

		const { result } = renderHook(
			() =>
				useWebSocket({
					roomId: 'test-room',
					userId: 'user1',
					onMessage: vi.fn(),
				}),
			{ wrapper }
		);

		const testMessage: WebSocketEvent = { type: 'connect', userId: 'user1' };
		act(() => {
			result.current.sendMessage(testMessage);
		});

		expect(mockWs.send).not.toHaveBeenCalled();
	});
}); 