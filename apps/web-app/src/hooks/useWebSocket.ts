import { useCallback, useEffect, useRef } from 'react';
import type { WebSocketEvent, WebSocketResponse } from 'shared-types';

interface UseWebSocketOptions {
	roomId: string;
	userId: string;
	name?: string;
	onConnect?: () => void;
	onDisconnect?: () => void;
	onMessage?: (data: WebSocketResponse) => void;
	onError?: (error: string) => void;
}

export function useWebSocket({
	roomId,
	userId,
	onConnect,
	onDisconnect,
	onMessage,
	onError,
}: UseWebSocketOptions) {
	const socketRef = useRef<WebSocket | null>(null);
	const reconnectAttempts = useRef<number>(0);
	const reconnectTimeout = useRef<number | undefined>(undefined);
	const connectionRef = useRef<{ roomId: string; userId: string } | null>(null);
	const callbacksRef = useRef<{
		onConnect?: () => void;
		onDisconnect?: () => void;
		onMessage?: (data: WebSocketResponse) => void;
		onError?: (error: string) => void;
	}>({});

	// Update callbacks ref when they change
	useEffect(() => {
		callbacksRef.current = { onConnect, onDisconnect, onMessage, onError };
	}, [onConnect, onDisconnect, onMessage, onError]);

	const connect = useCallback(() => {
		// Don't create a new connection if we already have one for this room/user
		if (connectionRef.current?.roomId === roomId && connectionRef.current?.userId === userId) {
			return;
		}

		// Clean up any existing connection
		if (socketRef.current) {
			socketRef.current.close();
			socketRef.current = null;
		}

		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//localhost:8787/room/${roomId}/websocket?userId=${userId}`;

		try {
			const socket = new WebSocket(wsUrl);
			socketRef.current = socket;
			connectionRef.current = { roomId, userId };

			socket.onopen = () => {

                console.log('OPEN!')
				if (socketRef.current !== socket) {
					return;
                }
                
				reconnectAttempts.current = 0;
				callbacksRef.current.onConnect?.();
			};

			socket.onclose = () => {
				if (socketRef.current !== socket) {
					return;
                }

				callbacksRef.current.onDisconnect?.();
                socketRef.current = null;
                if (reconnectAttempts.current < 5) {
                    reconnectTimeout.current = window.setTimeout(() => {
                        reconnectAttempts.current++;
                        connect();
                    }, Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000));
                }
			};

			socket.onmessage = (event) => {
				if (socketRef.current !== socket) {
					return;
                }

				try {
					const data = JSON.parse(event.data) as WebSocketResponse;
					callbacksRef.current.onMessage?.(data);
				} catch (error) {
					callbacksRef.current.onError?.(error instanceof Error ? error.message : 'Failed to parse message');
				}
			};

			socket.onerror = (error) => {
				if (socketRef.current !== socket) {
					return;
                }
                
				callbacksRef.current.onError?.(error instanceof Error ? error.message : 'WebSocket error occurred');
			};
		} catch (error) {
			callbacksRef.current.onError?.(error instanceof Error ? error.message : 'Failed to create WebSocket connection');
		}
	}, [roomId, userId]);

	// Cleanup function
	const cleanup = useCallback(() => {
		if (reconnectTimeout.current) {
			window.clearTimeout(reconnectTimeout.current);
			reconnectTimeout.current = undefined;
		}
		if (socketRef.current) {
			socketRef.current.close();
			socketRef.current = null;
		}
		connectionRef.current = null;
	}, []);

	// Connect on mount and when roomId or userId changes
	useEffect(() => {
		cleanup();
		connect();
	}, [connect, cleanup]);

	const sendEvent = useCallback(
		(event: WebSocketEvent) => {
			if (socketRef.current?.readyState === WebSocket.OPEN) {
				socketRef.current.send(JSON.stringify(event));
			} else {
				callbacksRef.current.onError?.('WebSocket is not connected');
			}
		},
		[],
	);

	return { sendEvent };
} 