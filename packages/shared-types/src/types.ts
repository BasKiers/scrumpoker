export interface RoomState {
  roomId: string;
  participants: Record<string, Participant>;
  card_status: 'hidden' | 'revealed';
}

export interface Participant {
  userId: string;
  name?: string;
  selectedCard?: string;
  lastEventTimestamp?: number;
}

export interface BaseWebSocketEvent {
  eventId?: string;
}

export type WebSocketEvent =
  | ConnectEvent
  | DisconnectEvent
  | SelectCardEvent
  | SetNameEvent
  | ToggleCardsEvent
  | ResetEvent;

export interface ConnectEvent extends BaseWebSocketEvent, Participant {
  type: 'connect';
}

export interface DisconnectEvent extends BaseWebSocketEvent {
  type: 'disconnect';
  userId: string;
}

export interface SelectCardEvent extends BaseWebSocketEvent {
  type: 'select_card';
  userId: string;
  cardValue: string;
}

export interface SetNameEvent extends BaseWebSocketEvent {
  type: 'set_name';
  userId: string;
  name: string;
}

export interface ToggleCardsEvent extends BaseWebSocketEvent {
  type: 'toggle_cards';
  value: 'hidden' | 'revealed';
}

export interface ResetEvent extends BaseWebSocketEvent {
  type: 'reset';
}

// Type guards
export function isConnectEvent(event: WebSocketEvent): event is ConnectEvent {
  return event.type === 'connect';
}

export function isDisconnectEvent(event: WebSocketEvent): event is DisconnectEvent {
  return event.type === 'disconnect';
}

export function isSelectCardEvent(event: WebSocketEvent): event is SelectCardEvent {
  return event.type === 'select_card';
}

export function isSetNameEvent(event: WebSocketEvent): event is SetNameEvent {
  return event.type === 'set_name';
}

export function isToggleCardsEvent(event: WebSocketEvent): event is ToggleCardsEvent {
  return event.type === 'toggle_cards';
}

export function isResetEvent(event: WebSocketEvent): event is ResetEvent {
  return event.type === 'reset';
}

// State manipulation functions
export function addParticipant(state: RoomState, participant: Participant): RoomState {
  return {
    ...state,
    participants: {
      ...state.participants,
      [participant.userId]: participant,
    },
  };
}

export function removeParticipant(state: RoomState, userId: string): RoomState {
  const { [userId]: _removed, ...remaining } = state.participants;
  return {
    ...state,
    participants: remaining,
  };
}

export function updateParticipant(
  state: RoomState,
  userId: string,
  updates: Partial<Participant>,
): RoomState {
  const participant = state.participants[userId];
  if (!participant) return state;

  return {
    ...state,
    participants: {
      ...state.participants,
      [userId]: {
        ...participant,
        ...updates,
      },
    },
  };
}

// Response types
export type WebSocketResponse =
  | SuccessResponse
  | ErrorResponse
  | StateSyncResponse
  | EventBroadcastResponse;

export interface SuccessResponse {
  type: 'success';
  eventType: WebSocketEvent['type'];
  eventId?: string;
  message?: string;
}

export interface ErrorResponse {
  type: 'error';
  eventType: WebSocketEvent['type'];
  eventId?: string;
  error: string;
  code?: string;
}

export interface StateSyncResponse {
  type: 'state_sync';
  state: RoomState;
}

export interface EventBroadcastResponse {
  type: 'event_broadcast';
  message: WebSocketEvent;
}

// Type guards for responses
export function isSuccessResponse(response: WebSocketResponse): response is SuccessResponse {
  return response.type === 'success';
}

export function isErrorResponse(response: WebSocketResponse): response is ErrorResponse {
  return response.type === 'error';
}

export function isStateSyncResponse(response: WebSocketResponse): response is StateSyncResponse {
  return response.type === 'state_sync';
}

export function isEventBroadcastResponse(
  response: WebSocketResponse,
): response is EventBroadcastResponse {
  return response.type === 'event_broadcast';
}
