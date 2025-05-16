import React, { createContext, useContext, useState, useCallback } from 'react';

export type RoomPhase = 'waiting' | 'voting' | 'results';

interface RoomState {
  phase: RoomPhase;
  isVotingSessionActive: boolean;
  cardsRevealed: boolean;
}

interface RoomContextType {
  state: RoomState;
  startVotingSession: () => void;
  endVotingSession: () => void;
  revealCards: () => void;
  hideCards: () => void;
  resetVotes: () => void;
  copyRoomLink: () => void;
}

const initialState: RoomState = {
  phase: 'waiting',
  isVotingSessionActive: false,
  cardsRevealed: false,
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<RoomState>(initialState);

  const startVotingSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'voting',
      isVotingSessionActive: true,
      cardsRevealed: false,
    }));
  }, []);

  const endVotingSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'waiting',
      isVotingSessionActive: false,
      cardsRevealed: false,
    }));
  }, []);

  const revealCards = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'results',
      cardsRevealed: true,
    }));
  }, []);

  const hideCards = useCallback(() => {
    setState(prev => ({
      ...prev,
      cardsRevealed: false,
    }));
  }, []);

  const resetVotes = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'voting',
      cardsRevealed: false,
    }));
  }, []);

  const copyRoomLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
  }, []);

  const value = {
    state,
    startVotingSession,
    endVotingSession,
    revealCards,
    hideCards,
    resetVotes,
    copyRoomLink,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}; 