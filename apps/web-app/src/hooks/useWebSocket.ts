import { useState, useEffect, useCallback, useRef } from 'react';
import type { WebSocketEvent } from 'shared-types';

interface UseWebSocketOptions {
	roomId: string;
	userId: string;
	onMessage: (message: WebSocketEvent) => void;
}

interface UseWebSocketResult {
	isConnected: boolean;
	sendMessage: (message: WebSocketEvent) => void;
}

export function useWebSocket({ roomId, userId, onMessage }: UseWebSocketOptions): UseWebSocketResult {
	const [isConnected, setIsConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);

	const connect = useCallback(() => {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${window.location.host}/${roomId}/websocket?userId=${encodeURIComponent(userId)}`;
		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			setIsConnected(true);
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				onMessage(data);
			} catch (err) {
				console.error('Error parsing WebSocket message:', err);
			}
		};

		ws.onclose = () => {
			setIsConnected(false);
			wsRef.current = null;
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
			setIsConnected(false);
		};

		wsRef.current = ws;
	}, [roomId, userId, onMessage]);

	useEffect(() => {
		connect();

		return () => {
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
	}, [connect]);

	const sendMessage = useCallback(
		(message: WebSocketEvent) => {
			if (wsRef.current && isConnected) {
				wsRef.current.send(JSON.stringify(message));
			}
		},
		[isConnected]
	);

	return {
		isConnected,
		sendMessage,
	};
} 