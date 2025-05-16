import { useState, useEffect, useCallback, useRef } from 'react';
import type {
	RoomState,
	WebSocketEvent,
	WebSocketResponse,
} from 'shared-types';
import {
	isErrorResponse,
	isStateUpdateResponse,
} from 'shared-types';

interface UseWebSocketOptions {
	roomId: string;
	userId: string;
	name?: string;
	onError?: (error: string) => void;
	maxReconnectAttempts?: number;
	reconnectInterval?: number;
}

export function useWebSocket({
	roomId,
	userId,
	name,
	onError,
	maxReconnectAttempts = 5,
	reconnectInterval = 2000,
}: UseWebSocketOptions) {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [connected, setConnected] = useState(false);
	const [roomState, setRoomState] = useState<RoomState>({
		roomId,
		participants: {},
		card_status: 'hidden',
	});

	const reconnectAttempts = useRef<number>(0);
	const reconnectTimeout = useRef<number>();

	const connect = useCallback(() => {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = window.location.host;
		const url = `${protocol}//${host}/room/${roomId}/websocket?userId=${userId}`;

		const ws = new WebSocket(url);

		ws.addEventListener('open', () => {
			setConnected(true);
			setSocket(ws);
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
					setRoomState(data.state);
				} else if (isErrorResponse(data)) {
					onError?.(data.error);
				}
			} catch (error) {
				onError?.(error instanceof Error ? error.message : 'Failed to parse WebSocket message');
			}
		});

		ws.addEventListener('close', (event) => {
			setConnected(false);
			setSocket(null);

			// Only attempt to reconnect if the connection was closed unexpectedly
			// and we haven't exceeded the maximum number of attempts
			if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
				reconnectAttempts.current += 1;
				const delay = reconnectInterval * Math.pow(2, reconnectAttempts.current - 1); // Exponential backoff
				reconnectTimeout.current = window.setTimeout(connect, delay);
			} else if (reconnectAttempts.current >= maxReconnectAttempts) {
				onError?.('Maximum reconnection attempts reached. Please refresh the page.');
			}
		});

		ws.addEventListener('error', () => {
			onError?.('WebSocket connection error. Attempting to reconnect...');
			ws.close();
		});

		return ws;
	}, [roomId, userId, name, onError, maxReconnectAttempts, reconnectInterval]);

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
			if (socket && connected) {
				try {
					socket.send(JSON.stringify(event));
				} catch (error) {
					onError?.(error instanceof Error ? error.message : 'Failed to send WebSocket message');
				}
			} else {
				onError?.('Cannot send message: WebSocket is not connected');
			}
		},
		[socket, connected, onError],
	);

	const selectCard = useCallback(
		(cardValue: string) => {
			sendEvent({
				type: 'select_card',
				userId,
				cardValue,
			});
		},
		[sendEvent, userId],
	);

	const setName = useCallback(
		(name: string) => {
			sendEvent({
				type: 'set_name',
				userId,
				name,
			});
		},
		[sendEvent, userId],
	);

	const toggleCards = useCallback(() => {
		sendEvent({
			type: 'toggle_cards',
			value: roomState.card_status === 'hidden' ? 'revealed' : 'hidden',
		});
	}, [sendEvent, roomState.card_status]);

	const resetRoom = useCallback(() => {
		sendEvent({
			type: 'reset',
		});
	}, [sendEvent]);

	return {
		connected,
		roomState,
		selectCard,
		setName,
		toggleCards,
		resetRoom,
	};
} 