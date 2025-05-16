import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import StoryPointCard from '../components/StoryPointCard';
import ParticipantsTable from '../components/ParticipantsTable';
import type { Participant } from 'shared-types';

const STORY_POINTS = ['?', '1', '2', '3', '5', '8', '13', '20'];

// Mock data for testing
const MOCK_PARTICIPANTS: Record<string, Participant> = {
  'user-1': {
    userId: 'user-1',
    name: 'Alice Smith',
    selectedCard: '5'
  },
  'user-2': {
    userId: 'user-2',
    name: 'Bob Johnson',
    selectedCard: '8'
  },
  'user-3': {
    userId: 'user-3',
    name: 'Carol Williams',
    selectedCard: '5'
  },
  'user-4': {
    userId: 'user-4',
    name: 'Dave Brown',
    selectedCard: undefined
  },
  'user-5': {
    userId: 'user-5',
    name: 'Eve Davis',
    selectedCard: '13'
  }
};

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [participants, setParticipants] = useState<Record<string, Participant>>(MOCK_PARTICIPANTS);
  const [currentUserId] = useState('user-1'); // TODO: Replace with actual user ID

  const handleCardSelect = (value: string) => {
    if (!cardsRevealed) {
      setSelectedCard(value);
      // TODO: Send card selection to WebSocket
    }
  };

  const handleShowCards = () => {
    setCardsRevealed(!cardsRevealed);
    // TODO: Send show/hide cards event to WebSocket
  };

  const handleReset = () => {
    setSelectedCard(null);
    setCardsRevealed(false);
    // TODO: Send reset event to WebSocket
  };

  return (
    <div className="room-page min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Room: {roomId}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participants Section */}
            <section className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Participants</h2>
                <ParticipantsTable
                  participants={participants}
                  cardsRevealed={cardsRevealed}
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
                      selected={selectedCard === value}
                      onClick={() => handleCardSelect(value)}
                      disabled={cardsRevealed}
                    />
                  ))}
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleShowCards}
                  >
                    {cardsRevealed ? 'Hide Cards' : 'Show Cards'}
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
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