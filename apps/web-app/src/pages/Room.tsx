import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StoryPointCard from '../components/StoryPointCard';
import ParticipantsTable from '../components/ParticipantsTable';
import { useRoomActions } from '../hooks/useRoomActions';
import { useRoomStore } from '../store/roomStore';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useUser } from '@/contexts/UserContext';
import NameModal from '../components/NameModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ArrowLeft, Copy } from 'lucide-react';
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import '../styles/responsive.css';

const STORY_POINTS = ['?', '1', '2', '3', '5', '8', '13', '20'];
const ACTIVE_PARTICPANT_TIMEOUT = 1000 * 60 * 30; // 30 minutes

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { userId, name, setName, clearName } = useUser();
  const [showNameModal, setShowNameModal] = React.useState<'joining' | 'done' | 're-enter'>('done');
  const [showResetConfirmation, setShowResetConfirmation] = React.useState(false);
  const [showCopied, setShowCopied] = React.useState(false);

  const {
    selectCard,
    toggleCards,
    reset,
    setName: setRoomName,
  } = useRoomActions({
    roomId: roomId || 'default',
    userId,
  });

  const { participants, card_status, error, isSynced } = useRoomStore();
  const activeParticipants = Object.fromEntries(
    Object.entries(participants).filter(
      ([, { name, lastEventTimestamp }]) =>
        Boolean(name) && Date.now() - (lastEventTimestamp || 0) < ACTIVE_PARTICPANT_TIMEOUT,
    ),
  );

  // Check if user needs to set their name after state sync
  React.useEffect(() => {
    if (!isSynced) return;
    const currentParticipant = participants[userId];
    if (currentParticipant?.name === undefined) {
      if (name) {
        setRoomName(name);
        setShowNameModal('done');
      } else {
        setShowNameModal('joining');
      }
    } else if (showNameModal === 'joining') {
      setShowNameModal('done');
    }
  }, [userId, isSynced, participants, showNameModal, name, setRoomName]);

  const handleCardSelect = (value: string) => {
    selectCard(value);
  };

  const handleShowCards = () => {
    toggleCards();
  };

  const handleReset = () => {
    const hasSelectedCards = Object.values(activeParticipants).some((p) => p.selectedCard);
    if (card_status !== 'revealed' && hasSelectedCards) {
      setShowResetConfirmation(true);
    } else {
      reset();
    }
  };

  const handleResetConfirm = () => {
    reset();
    setShowResetConfirmation(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirmation(false);
  };

  const handleNameSubmit = (newName: string) => {
    setName(newName);
    setRoomName(newName);
    setShowNameModal('done');
  };

  const handleNameSkip = () => {
    clearName();
    setRoomName('');
    setShowNameModal('done');
  };

  const hasName = Boolean(participants[userId]?.name);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <header className="bg-[#f7f8fa] flex justify-center px-2">
          <div className="w-full max-w-7xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/')}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Room:</span>
                  <span className="text-sm font-medium">{roomId}</span>
                  <TooltipRoot open={showCopied}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyUrl}
                        className="hover:bg-primary/10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={2}>Copied to clipboard!</TooltipContent>
                  </TooltipRoot>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex justify-center px-2 room-page">
          <div className="w-full max-w-7xl bg-white rounded-t-2xl shadow-xl p-4 lg:p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
              {/* Participants Section */}
              <section className="bg-white rounded-xl border shadow-sm order-2 lg:order-1 participants-section">
                <div className="p-4 lg:p-6">
                  <h2 className="text-lg font-medium mb-4">Participants</h2>
                  <ParticipantsTable
                    participants={activeParticipants}
                    cardsRevealed={card_status === 'revealed'}
                    currentUserId={userId}
                  />
                </div>
              </section>

              {/* Voting Section */}
              <section className="bg-white rounded-xl border shadow-sm h-fit order-1 lg:order-2">
                <div className="p-4 lg:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Voting</h2>
                    <Button
                      variant="outline"
                      onClick={() => (hasName ? handleNameSkip() : setShowNameModal('re-enter'))}
                    >
                      {hasName ? 'Spectate Voting' : 'Join Voting'}
                    </Button>
                  </div>
                  <div
                    className={`flex flex-wrap gap-4 justify-center story-point-cards ${!hasName ? 'hidden lg:flex' : ''}`}
                  >
                    {STORY_POINTS.map((value) => (
                      <StoryPointCard
                        key={value}
                        value={value}
                        selected={activeParticipants[userId]?.selectedCard === value}
                        onClick={() => handleCardSelect(value)}
                        disabled={!hasName}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center gap-4 room-controls">
                    <Button
                      variant="primary"
                      onClick={handleShowCards}
                      disabled={!Object.values(activeParticipants).some((p) => p.selectedCard)}
                    >
                      {card_status === 'revealed' ? 'Hide Cards' : 'Show Cards'}
                    </Button>
                    <Button variant="warning" onClick={handleReset}>
                      Reset
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        <NameModal
          isOpen={showNameModal !== 'done'}
          onSubmit={handleNameSubmit}
          onSkip={handleNameSkip}
          roomUrl={window.location.href}
        />

        <ConfirmationModal
          isOpen={showResetConfirmation}
          message="Are you sure you want to reset all story point estimations?"
          onConfirm={handleResetConfirm}
          onCancel={handleResetCancel}
        />
      </div>
    </TooltipProvider>
  );
};

export default Room;
