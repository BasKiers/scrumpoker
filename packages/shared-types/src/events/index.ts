import type { RoomState, WebSocketEvent, WebSocketResponse } from '../types';
import { eventHandlers } from './handlers';

export * from './EventHandler';
export * from './handlers';

export function handleEvent(state: RoomState, event: WebSocketEvent): WebSocketResponse {
  const handler = eventHandlers.get(event.type);
  if (!handler) {
    return {
      type: 'error',
      eventType: event.type,
      error: `No handler found for event type: ${event.type}`,
      code: 'NO_HANDLER',
    };
  }

  try {
    const newState = handler.handle(state, event);
    return {
      type: 'state_sync',
      state: newState,
    };
  } catch (error) {
    return {
      type: 'error',
      eventType: event.type,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'HANDLER_ERROR',
    };
  }
} 