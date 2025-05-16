import { useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useRoomStore } from '../store/roomStore';
import type { WebSocketResponse, ValidatedWebSocketEvent } from 'shared-types';
import {
  isErrorResponse,
  isStateSyncResponse,
  isEventBroadcastResponse,
} from 'shared-types';
import { nanoid } from 'nanoid';

interface UseRoomActionsOptions {
  roomId: string;
  userId: string;
  name?: string;
}

export function useRoomActions({ roomId, userId, name }: UseRoomActionsOptions) {
  const { setConnected, setError, updateRoomState, updateStateForEvent, card_status: cardStatus, isConnected, resetRoom } = useRoomStore();
  
  const { sendEvent } = useWebSocket({
    roomId,
    userId,
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onMessage: (data: WebSocketResponse) => {
      if (isStateSyncResponse(data)) {
        updateRoomState(data.state);
      } else if (isEventBroadcastResponse(data)) {
        try {
          updateStateForEvent(data.message)
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to handle event');
        }
      } else if (isErrorResponse(data)) {
        setError(data.error);
      }
    },
    onError: (error: string) => setError(error),
  });

  const sendEventAndUpdateState = useCallback((event: ValidatedWebSocketEvent) => {
    event.eventId = nanoid();
    sendEvent(event);
    updateStateForEvent(event);
  }, [sendEvent, updateStateForEvent]);

  useEffect(() => {
      if(isConnected && name){
        sendEventAndUpdateState({
            type: 'set_name',
            userId,
            name,
        })
      }
  },[userId, name, sendEventAndUpdateState, isConnected])

  const selectCard = useCallback(
    (cardValue: string) => {
    sendEventAndUpdateState({
        type: 'select_card',
        userId,
        cardValue,
      });
    },
    [sendEventAndUpdateState, userId],
  );

  const setName = useCallback(
    (name: string) => {
      sendEventAndUpdateState({
        type: 'set_name',
        userId,
        name,
      });

    },
    [sendEventAndUpdateState, userId],
  );

  const toggleCards = useCallback(() => {
    sendEventAndUpdateState({
      type: 'toggle_cards',
      value: cardStatus === 'hidden' ? 'revealed' : 'hidden',
    });
  }, [sendEventAndUpdateState, cardStatus]);

  const reset = useCallback(() => {
    sendEventAndUpdateState({
      type: 'reset',
    });
    resetRoom();
  }, [sendEventAndUpdateState, resetRoom]);

  return {
    selectCard,
    setName,
    toggleCards,
    reset,
  };
} 