import { useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useRoomStore } from '../store/roomStore';
import type { WebSocketResponse, RoomState } from 'shared-types';
import {
  isErrorResponse,
  isStateSyncResponse,
  isEventBroadcastResponse,
  handleEvent,
} from 'shared-types';

interface UseRoomActionsOptions {
  roomId: string;
  userId: string;
  name?: string;
}

export function useRoomActions({ roomId, userId, name }: UseRoomActionsOptions) {
  const { setConnected, setError, updateRoomState } = useRoomStore();
  const cardStatus = useRoomStore((state) => state.card_status);
  const { toggleCardStatus, resetRoom } = useRoomStore();

  const { sendEvent } = useWebSocket({
    roomId,
    userId,
    name,
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onMessage: (data: WebSocketResponse) => {
      if (isStateSyncResponse(data)) {
        updateRoomState(data.state);
      } else if (isEventBroadcastResponse(data)) {
        try {
          const currentState = useRoomStore.getState() as RoomState;
          const newState = handleEvent(currentState, data.message);
          updateRoomState(newState);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to handle event');
        }
      } else if (isErrorResponse(data)) {
        setError(data.error);
      }
    },
    onError: (error: string) => setError(error),
  });

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
      value: cardStatus === 'hidden' ? 'revealed' : 'hidden',
    });
    toggleCardStatus();
  }, [sendEvent, cardStatus, toggleCardStatus]);

  const reset = useCallback(() => {
    sendEvent({
      type: 'reset',
    });
    resetRoom();
  }, [sendEvent, resetRoom]);

  return {
    selectCard,
    setName,
    toggleCards,
    reset,
  };
} 