import { useEffect, useCallback, useRef } from 'react';
import type { WebSocketEvent, WebSocketResponse } from 'shared-types';
import { isErrorResponse, isStateUpdateResponse } from 'shared-types';
import { useRoomStore } from '../store/roomStore';

interface UseWebSocketOptions {
	roomId: string;
	userId: string;
	name?: string;
	maxReconnectAttempts?: number;
	reconnectInterval?: number;
}

export function useWebSocket({
	roomId,
	userId,
	name,
	maxReconnectAttempts = 5,
	reconnectInterval = 2000,
}: UseWebSocketOptions) {
	const {
		setConnected,
		setError,
		updateRoomState,
	} = useRoomStore();

	const reconnectAttempts = useRef<number>(0);
	const reconnectTimeout = useRef<number | undefined>(undefined);
	const socketRef = useRef<WebSocket | null>(null);

	const connect = useCallback(() => {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = window.location.host;
		const url = `${protocol}//${host}/room/${roomId}/websocket?userId=${userId}`;

		const ws = new WebSocket(url);
		socketRef.current = ws;

		ws.addEventListener('open', () => {
			setConnected(true);
			reconnectAttempts.current = 0;

			// Send initial connect event
			if (name) {
				ws.send(
					JSON.stringify({
						type: 'connect',
						userId,
						name,
					} as WebSocketEvent),
				);
			}
		});

		ws.addEventListener('message', (event) => {
			try {
				const data = JSON.parse(event.data) as WebSocketResponse;

				if (isStateUpdateResponse(data)) {
					updateRoomState(data.state);
				} else if (isErrorResponse(data)) {
					setError(data.error);
				}
			} catch (error) {
				setError(error instanceof Error ? error.message : 'Failed to parse WebSocket message');
			}
		});

		ws.addEventListener('close', (event) => {
			setConnected(false);
			socketRef.current = null;

			// Only attempt to reconnect if the connection was closed unexpectedly
			// and we haven't exceeded the maximum number of attempts
			if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
				reconnectAttempts.current += 1;
				const delay = reconnectInterval * Math.pow(2, reconnectAttempts.current - 1); // Exponential backoff
				reconnectTimeout.current = window.setTimeout(connect, delay);
			} else if (reconnectAttempts.current >= maxReconnectAttempts) {
				setError('Maximum reconnection attempts reached. Please refresh the page.');
			}
		});

		ws.addEventListener('error', () => {
			setError('WebSocket connection error. Attempting to reconnect...');
			ws.close();
		});

		return ws;
	}, [roomId, userId, name, maxReconnectAttempts, reconnectInterval, setConnected, setError, updateRoomState]);

	useEffect(() => {
		const ws = connect();

		return () => {
			if (reconnectTimeout.current) {
				window.clearTimeout(reconnectTimeout.current);
			}
			ws.close();
		};
	}, [connect]);

	const sendEvent = useCallback(
		(event: WebSocketEvent) => {
			if (socketRef.current?.readyState === WebSocket.OPEN) {
				try {
					socketRef.current.send(JSON.stringify(event));
				} catch (error) {
					setError(error instanceof Error ? error.message : 'Failed to send WebSocket message');
				}
			} else {
				setError('Cannot send message: WebSocket is not connected');
			}
		},
		[setError],
	);

	return {
		sendEvent,
	};
} 