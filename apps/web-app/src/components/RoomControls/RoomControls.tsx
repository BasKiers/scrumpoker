import React, { useState } from 'react';
import { useRoom } from './RoomContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export const RoomControls: React.FC = () => {
  const {
    state,
    startVotingSession,
    endVotingSession,
    revealCards,
    hideCards,
    resetVotes,
    copyRoomLink,
  } = useRoom();

  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleEndSession = () => {
    setShowEndSessionModal(true);
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center p-4 bg-gray-50 rounded-lg">
      {!state.isVotingSessionActive ? (
        <button
          onClick={startVotingSession}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Start Voting Session
        </button>
      ) : (
        <>
          {state.phase === 'voting' && (
            <button
              onClick={revealCards}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reveal Cards
            </button>
          )}
          {state.phase === 'results' && (
            <button
              onClick={hideCards}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Hide Cards
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Reset Votes
          </button>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            End Session
          </button>
        </>
      )}
      <button
        onClick={copyRoomLink}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Copy Room Link
      </button>

      <ConfirmationModal
        isOpen={showEndSessionModal}
        title="End Voting Session"
        message="Are you sure you want to end the current voting session? This will clear all votes."
        onConfirm={() => {
          endVotingSession();
          setShowEndSessionModal(false);
        }}
        onCancel={() => setShowEndSessionModal(false)}
      />

      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Votes"
        message="Are you sure you want to reset all votes? This action cannot be undone."
        onConfirm={() => {
          resetVotes();
          setShowResetModal(false);
        }}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
}; 