import { useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useRoomStore } from '../store/roomStore';

interface UseRoomActionsOptions {
  roomId: string;
  userId: string;
  name?: string;
}

export function useRoomActions({ roomId, userId, name }: UseRoomActionsOptions) {
  const { sendEvent } = useWebSocket({ roomId, userId, name });
  const cardStatus = useRoomStore((state) => state.card_status);
  const { toggleCardStatus, resetRoom } = useRoomStore();

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