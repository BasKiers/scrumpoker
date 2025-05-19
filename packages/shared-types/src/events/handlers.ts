import type { EventHandler } from './EventHandler';
import type { RoomState, WebSocketEvent } from '../types';
import {
  isConnectEvent,
  isDisconnectEvent,
  isSelectCardEvent,
  isSetNameEvent,
  isToggleCardsEvent,
  isResetEvent,
  addParticipant,
  removeParticipant,
  updateParticipant,
} from '../types';

// Helper function to update participant with timestamp
const updateParticipantWithTimestamp = (
  state: RoomState,
  userId: string,
  updates: Partial<RoomState['participants'][string]>,
) => {
  return updateParticipant(state, userId, {
    ...updates,
    lastEventTimestamp: Date.now(),
  });
};

class ConnectEventHandler implements EventHandler {
  handle(state: RoomState, event: WebSocketEvent): RoomState {
    if (!isConnectEvent(event)) return state;
    return addParticipant(state, {
      userId: event.userId,
      name: event.name,
      lastEventTimestamp: Date.now(),
    });
  }
}

class DisconnectEventHandler implements EventHandler {
  handle(state: RoomState, event: WebSocketEvent): RoomState {
    if (!isDisconnectEvent(event)) return state;
    return removeParticipant(state, event.userId);
  }
}

class SelectCardEventHandler implements EventHandler {
  handle(state: RoomState, event: WebSocketEvent): RoomState {
    if (!isSelectCardEvent(event)) return state;
    return updateParticipantWithTimestamp(state, event.userId, { selectedCard: event.cardValue });
  }
}

class SetNameEventHandler implements EventHandler {
  handle(state: RoomState, event: WebSocketEvent): RoomState {
    if (!isSetNameEvent(event)) return state;
    return updateParticipantWithTimestamp(state, event.userId, { name: event.name });
  }
}

class ToggleCardsEventHandler implements EventHandler {
  handle(state: RoomState, event: WebSocketEvent): RoomState {
    if (!isToggleCardsEvent(event)) return state;
    return {
      ...state,
      card_status: event.value,
    };
  }
}

class ResetEventHandler implements EventHandler {
  handle(state: RoomState, event: WebSocketEvent): RoomState {
    if (!isResetEvent(event)) return state;
    return {
      ...state,
      participants: Object.fromEntries(
        Object.entries(state.participants).map(([userId, participant]) => [
          userId,
          {
            ...participant,
            selectedCard: undefined,
            lastEventTimestamp: Date.now(),
          },
        ]),
      ),
      card_status: 'hidden',
    };
  }
}

export const eventHandlers = new Map<string, EventHandler>([
  ['connect', new ConnectEventHandler()],
  ['disconnect', new DisconnectEventHandler()],
  ['select_card', new SelectCardEventHandler()],
  ['set_name', new SetNameEventHandler()],
  ['toggle_cards', new ToggleCardsEventHandler()],
  ['reset', new ResetEventHandler()],
]); 