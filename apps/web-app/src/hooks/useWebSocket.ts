import { useState, useEffect, useCallback } from 'react';
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
}

export function useWebSocket({ roomId, userId, name, onError }: UseWebSocketOptions) {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [connected, setConnected] = useState(false);
	const [roomState, setRoomState] = useState<RoomState>({
		roomId,
		participants: {},
		card_status: 'hidden',
	});

	const connect = useCallback(() => {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = window.location.host;
		const url = `${protocol}//${host}/room/${roomId}/websocket?userId=${userId}`;

		const ws = new WebSocket(url);

		ws.addEventListener('open', () => {
			setConnected(true);
			setSocket(ws);

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

		ws.addEventListener('close', () => {
			setConnected(false);
			setSocket(null);
			// Attempt to reconnect after a delay
			setTimeout(connect, 2000);
		});

		ws.addEventListener('error', () => {
			ws.close();
		});

		return ws;
	}, [roomId, userId, name, onError]);

	useEffect(() => {
		const ws = connect();

		return () => {
			ws.close();
		};
	}, [connect]);

	const sendEvent = useCallback(
		(event: WebSocketEvent) => {
			if (socket && connected) {
				socket.send(JSON.stringify(event));
			}
		},
		[socket, connected],
	);

	return {
		connected,
		roomState,
		sendEvent,
	};
} 