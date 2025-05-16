import type { RoomState, WebSocketEvent } from '../types';

export interface EventHandler {
  handle(state: RoomState, event: WebSocketEvent): RoomState;
} 