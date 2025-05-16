import React from 'react';
import { useParams } from 'react-router-dom';
import StoryPointCard from '../components/StoryPointCard';
import ParticipantsTable from '../components/ParticipantsTable';
import { useRoomActions } from '../hooks/useRoomActions';
import { useRoomStore } from '../store/roomStore';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { getUserId } from '@/utils/localStorage';

const STORY_POINTS = ['?', '1', '2', '3', '5', '8', '13', '20'];

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [currentUserId] = React.useState(getUserId());

  const { selectCard, toggleCards, reset } = useRoomActions({
    roomId: roomId || 'default',
    userId: currentUserId,
  });

  const { participants, card_status, error } = useRoomStore();

  const handleCardSelect = (value: string) => {
    selectCard(value);
  };

  const handleShowCards = () => {
    toggleCards();
  };

  const handleReset = () => {
    reset();
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
                  participants={participants}
                  cardsRevealed={card_status === 'revealed'}
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
                      selected={participants[currentUserId]?.selectedCard === value}
                      onClick={() => handleCardSelect(value)}
                    />
                  ))}
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <Button
                    variant="default"
                    onClick={handleShowCards}
                    disabled={Object.values(participants).some(p => !p.selectedCard)}
                  >
                    {card_status === 'revealed' ? 'Hide Cards' : 'Show Cards'}
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