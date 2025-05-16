import { create } from 'zustand';
import type { RoomState as SharedRoomState, Participant } from 'shared-types';
import {
  addParticipant,
  removeParticipant,
  updateParticipant,
} from 'shared-types';

interface UIRoomState {
  isConnected: boolean;
  error: string | null;
}

interface RoomState extends SharedRoomState, UIRoomState {}

interface RoomActions {
  setConnected: (isConnected: boolean) => void;
  setError: (error: string | null) => void;
  updateRoomState: (state: SharedRoomState) => void;
  addParticipant: (participant: { userId: string; name?: string }) => void;
  removeParticipant: (userId: string) => void;
  updateParticipant: (userId: string, updates: Partial<Participant>) => void;
  toggleCardStatus: () => void;
  resetRoom: () => void;
}

const initialState: RoomState = {
  roomId: '',
  participants: {},
  card_status: 'hidden',
  isConnected: false,
  error: null,
};

export const useRoomStore = create<RoomState & RoomActions>((set) => ({
  ...initialState,

  setConnected: (isConnected: boolean) => set({ isConnected }),
  setError: (error: string | null) => set({ error }),

  updateRoomState: (state: SharedRoomState) => set((current: RoomState) => ({
    ...current,
    ...state,
  })),

  addParticipant: (participant: { userId: string; name?: string }) =>
    set((state: RoomState) => ({
      ...state,
      ...addParticipant(state, participant),
    })),

  removeParticipant: (userId: string) =>
    set((state: RoomState) => ({
      ...state,
      ...removeParticipant(state, userId),
    })),

  updateParticipant: (userId: string, updates: Partial<Participant>) =>
    set((state: RoomState) => ({
      ...state,
      ...updateParticipant(state, userId, updates),
    })),

  toggleCardStatus: () =>
    set((state: RoomState) => ({
      ...state,
      card_status: state.card_status === 'hidden' ? 'revealed' : 'hidden',
    })),

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