/**
 * Represents a participant in a room.
 */
export interface Participant {
  /** Unique user identifier */
  userId: string;
  /** Display name of the participant */
  name?: string;
  /** The card selected by the participant, if any */
  selectedCard?: string;
  /** Connection status (e.g., 'online', 'offline') */
  status?: 'online' | 'offline';
  /** Video enabled state */
  videoEnabled?: boolean;
  /** Audio enabled state */
  audioEnabled?: boolean;
}

/**
 * Represents the state of a room.
 */
export interface RoomState {
  /** Unique room identifier */
  roomId: string;
  /** All participants in the room, keyed by userId */
  participants: Record<string, Participant>;
  /** The userId of the active speaker, if any */
  activeSpeaker?: string;
  /** Card status: hidden or revealed */
  card_status: 'hidden' | 'revealed';
  /** Optional configuration for the room */
  config?: RoomConfig;
}

/**
 * Configuration options for a room.
 */
export interface RoomConfig {
  /** Maximum number of participants allowed */
  maxParticipants?: number;
  /** Allow guests to join without authentication */
  allowGuests?: boolean;
  /** Custom room name */
  roomName?: string;
}

/**
 * WebSocket event types for room communication.
 */
export type WebSocketEvent =
  | { type: 'connect'; userId: string; name?: string }
  | { type: 'disconnect'; userId: string }
  | { type: 'select_card'; userId: string; cardValue: string }
  | { type: 'set_name'; userId: string; name: string }
  | { type: 'toggle_cards'; value: 'hidden' | 'revealed' }
  | { type: 'reset' };

/**
 * Type guard for connect event
 */
export function isConnectEvent(event: WebSocketEvent): event is Extract<WebSocketEvent, { type: 'connect' }> {
  return event.type === 'connect';
}

/**
 * Type guard for disconnect event
 */
export function isDisconnectEvent(event: WebSocketEvent): event is Extract<WebSocketEvent, { type: 'disconnect' }> {
  return event.type === 'disconnect';
}

/**
 * Type guard for select_card event
 */
export function isSelectCardEvent(event: WebSocketEvent): event is Extract<WebSocketEvent, { type: 'select_card' }> {
  return event.type === 'select_card';
}

/**
 * Type guard for set_name event
 */
export function isSetNameEvent(event: WebSocketEvent): event is Extract<WebSocketEvent, { type: 'set_name' }> {
  return event.type === 'set_name';
}

/**
 * Type guard for toggle_cards event
 */
export function isToggleCardsEvent(event: WebSocketEvent): event is Extract<WebSocketEvent, { type: 'toggle_cards' }> {
  return event.type === 'toggle_cards';
}

/**
 * Type guard for reset event
 */
export function isResetEvent(event: WebSocketEvent): event is Extract<WebSocketEvent, { type: 'reset' }> {
  return event.type === 'reset';
}

// Type assertion tests (for development only, not compiled in production)
// These are not runtime tests, but will cause TypeScript errors if the types are incompatible
const sampleParticipant: Participant = {
  userId: 'user-123',
  name: 'Alice',
  selectedCard: '5',
  status: 'online',
  videoEnabled: true,
  audioEnabled: false,
};

const sampleRoomState: RoomState = {
  roomId: 'room-abc',
  participants: {
    'user-123': sampleParticipant,
  },
  activeSpeaker: 'user-123',
  card_status: 'hidden',
  config: {
    maxParticipants: 10,
    allowGuests: true,
    roomName: 'Planning Room',
  },
};

// Example usage (type assertion)
const exampleEvent: WebSocketEvent = { type: 'connect', userId: 'user-123', name: 'Alice' };
if (isConnectEvent(exampleEvent)) {
  // TypeScript knows exampleEvent is a connect event here
}

// Type assertion tests for type guards
const connectEvent: WebSocketEvent = { type: 'connect', userId: 'u1', name: 'Bob' };
const disconnectEvent: WebSocketEvent = { type: 'disconnect', userId: 'u1' };
const selectCardEvent: WebSocketEvent = { type: 'select_card', userId: 'u1', cardValue: '3' };
const setNameEvent: WebSocketEvent = { type: 'set_name', userId: 'u1', name: 'Bob' };
const toggleCardsEvent: WebSocketEvent = { type: 'toggle_cards', value: 'hidden' };
const resetEvent: WebSocketEvent = { type: 'reset' };

// These should all be true (compile-time check)
const _test1 = isConnectEvent(connectEvent) as true;
const _test2 = isDisconnectEvent(disconnectEvent) as true;
const _test3 = isSelectCardEvent(selectCardEvent) as true;
const _test4 = isSetNameEvent(setNameEvent) as true;
const _test5 = isToggleCardsEvent(toggleCardsEvent) as true;
const _test6 = isResetEvent(resetEvent) as true;
