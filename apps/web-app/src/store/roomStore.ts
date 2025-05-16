import { create } from 'zustand';
import type { RoomState as SharedRoomState, ValidatedWebSocketEvent } from 'shared-types';
import {
  handleEvent,
} from 'shared-types';
import FIFO from 'fast-fifo';

interface UIRoomState {
  isConnected: boolean;
  isSynced: boolean;
  error: string | null;
  eventIdCache: Set<string>;
  eventIdCacheFifo: FIFO<string>;
}

interface RoomState extends SharedRoomState, UIRoomState {}

interface RoomActions {
  setConnected: (isConnected: boolean) => void;
  setError: (error: string | null) => void;
  updateRoomState: (state: SharedRoomState) => void;
  updateStateForEvent: (event: ValidatedWebSocketEvent) => void;
  resetRoom: () => void;
}

const initialState: RoomState = {
  roomId: '',
  participants: {},
  card_status: 'hidden',
  isConnected: false,
  isSynced: false,
  error: null,
  eventIdCache: new Set(),
  eventIdCacheFifo: new FIFO(),
};

export const useRoomStore = create<RoomState & RoomActions>((set) => ({
  ...initialState,

  setConnected: (isConnected: boolean) => set({ isConnected }),
  setError: (error: string | null) => set({ error }),

  updateRoomState: (state: SharedRoomState) => set((current: RoomState) => ({
    ...current,
    ...state,
    isSynced: true,
  })),

  updateStateForEvent: (event: ValidatedWebSocketEvent) => set((current: RoomState) => {
    if(event.eventId){
        if(current.eventIdCache.has(event.eventId)){
            return current;
        }
        current.eventIdCache.add(event.eventId);
        current.eventIdCacheFifo.push(event.eventId);
        while(current.eventIdCacheFifo.length > 100){
            current.eventIdCache.delete(current.eventIdCacheFifo.shift() as string);
        }
    }

    return ({
        ...current,
        ...handleEvent(current, event),
    })
  }),

  resetRoom: () =>
    set((state: RoomState) => ({
      ...state,
      participants: Object.fromEntries(
        Object.entries(state.participants).map(([userId, participant]) => [
          userId,
          { ...participant, selectedCard: undefined },
        ]),
      ),
      card_status: 'hidden',
    })),
})); 