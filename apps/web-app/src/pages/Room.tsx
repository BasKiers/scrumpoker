import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import StoryPointCard from '../components/StoryPointCard';
import ParticipantsTable from '../components/ParticipantsTable';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useWebSocket } from '../hooks/useWebSocket';
import { getUserId } from '../utils/localStorage';
import type { WebSocketResponse, RoomState } from 'shared-types';

const STORY_POINTS = ['?', '1', '2', '3', '5', '8', '13', '20'];

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [currentUserId] = React.useState(getUserId());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string>();
  const [roomState, setRoomState] = useState<RoomState>({
    roomId: roomId || '',
    participants: {},
    card_status: 'hidden'
  });

  const handleMessage = useCallback((data: WebSocketResponse) => {
    if (data.type === 'state_sync') {
      setRoomState(data.state);
      setError(undefined);
    } else if (data.type === 'error') {
      setError(data.error);
    }
  }, []);

  const { sendEvent } = useWebSocket({
    roomId: roomId || '',
    userId: currentUserId,
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onMessage: handleMessage,
    onError: (error) => setError(error)
  });

  const handleCardSelect = (value: string) => {
    sendEvent({ type: 'select_card', userId: currentUserId, cardValue: value });
  };

  const handleShowCards = () => {
    sendEvent({ type: 'toggle_cards', value: roomState.card_status === 'hidden' ? 'revealed' : 'hidden' });
  };

  const handleReset = () => {
    sendEvent({ type: 'reset' });
  };

  if (!connected) {
    return (
      <div className="room-page min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert>
          <AlertDescription>Connecting to room...</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="room-page min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Room: {roomId}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participants Section */}
            <section className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Participants</h2>
                <ParticipantsTable
                  participants={roomState.participants}
                  cardsRevealed={roomState.card_status === 'revealed'}
                  currentUserId={currentUserId}
                />
              </div>
            </section>

            {/* Voting Section */}
            <section className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Voting</h2>
                <div className="flex flex-wrap gap-4 justify-center">
                  {STORY_POINTS.map((value) => (
                    <StoryPointCard
                      key={value}
                      value={value}
                      selected={roomState.participants[currentUserId]?.selectedCard === value}
                      onClick={() => handleCardSelect(value)}
                    />
                  ))}
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <Button
                    variant="default"
                    onClick={handleShowCards}
                    disabled={Object.values(roomState.participants).some(p => !p.selectedCard)}
                  >
                    {roomState.card_status === 'revealed' ? 'Hide Cards' : 'Show Cards'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Room; 