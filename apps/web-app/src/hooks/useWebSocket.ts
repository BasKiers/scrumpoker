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
  const eventQueue = useRef<Array<{ event: WebSocketEvent; timestamp: number }>>([]);
  const callbacksRef = useRef<
    Pick<UseWebSocketOptions, 'onConnect' | 'onDisconnect' | 'onMessage' | 'onError'>
  >({});

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onConnect, onDisconnect, onMessage, onError };
  }, [onConnect, onDisconnect, onMessage, onError]);

  // Helper function to send queued events
  const sendQueuedEvents = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN && eventQueue.current.length > 0) {
      const now = Date.now();
      const validEvents = eventQueue.current.filter(
        ({ timestamp }) => now - timestamp < 30000, // Only send events queued within last 30 seconds
      );

      validEvents.forEach(({ event }) => {
        try {
          socketRef.current!.send(JSON.stringify(event));
        } catch (error) {
          callbacksRef.current.onError?.(
            error instanceof Error ? error.message : 'Failed to send queued event',
          );
        }
      });

      eventQueue.current = [];
    }
  }, []);

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
    eventQueue.current = []; // Clear queued events on cleanup
  }, []);

  const connect = useCallback(() => {
    // Don't create a new connection if we already have one for this room/user
    if (
      socketRef.current?.readyState === WebSocket.OPEN &&
      connectionRef.current?.roomId === roomId &&
      connectionRef.current?.userId === userId
    ) {
      return;
    }

    // Clean up any existing connection
    if (socketRef.current) {
      cleanup();
    }

    if (!roomId || !userId) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname =
      import.meta.env.VITE_DEV === 'true'
        ? 'localhost:8787'
        : 'scrumpoker-api.kiers-bas.workers.dev';
    const wsUrl = `${protocol}//${hostname}/room/${roomId}/websocket?userId=${userId}`;

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      connectionRef.current = { roomId, userId };

      socket.onopen = () => {
        if (socketRef.current !== socket) {
          return;
        }

        reconnectAttempts.current = 0;
        callbacksRef.current.onConnect?.();

        // Send any queued events after connection is established
        sendQueuedEvents();
      };

      socket.onclose = () => {
        if (socketRef.current !== socket) {
          return;
        }

        callbacksRef.current.onDisconnect?.();
        socketRef.current = null;
        if (reconnectAttempts.current < 5) {
          reconnectTimeout.current = window.setTimeout(
            () => {
              reconnectAttempts.current++;
              connect();
            },
            Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000),
          );
        } else {
          // Clear queue if we've exhausted reconnection attempts
          eventQueue.current = [];
          callbacksRef.current.onError?.(
            'Failed to reconnect after 5 attempts. Queued events cleared.',
          );
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
          callbacksRef.current.onError?.(
            error instanceof Error ? error.message : 'Failed to parse message',
          );
        }
      };

      socket.onerror = (error) => {
        if (socketRef.current !== socket) {
          return;
        }

        callbacksRef.current.onError?.(
          error instanceof Error ? error.message : 'WebSocket error occurred',
        );
      };
    } catch (error) {
      callbacksRef.current.onError?.(
        error instanceof Error ? error.message : 'Failed to create WebSocket connection',
      );
    }
  }, [roomId, userId, cleanup, sendQueuedEvents]);

  const sendEvent = useCallback(
    (event: WebSocketEvent) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify(event));
        } catch (error) {
          callbacksRef.current.onError?.(
            error instanceof Error ? error.message : 'Failed to send event',
          );
        }
      } else {
        // Queue the event for sending when connection is reestablished
        eventQueue.current.push({
          event,
          timestamp: Date.now(),
        });

        // Attempt to reconnect if the connection is not open and not already connecting
        if (socketRef.current?.readyState !== WebSocket.CONNECTING) {
          connect();
        }
      }
    },
    [connect],
  );

  // Connect on mount and when roomId or userId changes
  useEffect(() => {
    cleanup();
    connect();
  }, [connect, cleanup]);

  return { sendEvent };
}
