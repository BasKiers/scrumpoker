import type { RoomState, WebSocketEvent } from '../types';
import { eventHandlers } from './handlers';

export * from './EventHandler';
export * from './handlers';

export function handleEvent(state: RoomState, event: WebSocketEvent): RoomState {
  const handler = eventHandlers.get(event.type);
  if (!handler) {
    throw new Error(`No handler found for event type: ${event.type}`);
  }

  try {
    return handler.handle(state, event);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}
