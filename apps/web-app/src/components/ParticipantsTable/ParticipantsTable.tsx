import React, { useEffect, useState } from 'react';
import { Reorder, motion } from 'framer-motion';
import type { Participant } from 'shared-types';
import '../../styles/participants-table.css';

interface ParticipantsTableProps {
  participants: Record<string, Participant>;
  cardsRevealed: boolean;
  currentUserId: string;
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  participants,
  cardsRevealed,
  currentUserId,
}) => {
  const [sortedParticipants, setSortedParticipants] = useState<Participant[]>([]);
  const [mostFrequentCard, setMostFrequentCard] = useState<string | null>(null);

  useEffect(() => {
    const cardCounts: Record<string, number> = {};
    Object.values(participants).forEach(participant => {
      if (participant.selectedCard) {
        cardCounts[participant.selectedCard] = (cardCounts[participant.selectedCard] || 0) + 1;
      }
    });

    let maxCount = 0;
    let mostFrequent: string | null = null;

    Object.entries(cardCounts).forEach(([card, count]) => {
      if (count > maxCount || (count === maxCount && parseInt(card) > parseInt(mostFrequent || '0'))) {
        maxCount = count;
        mostFrequent = card;
      }
    });

    setMostFrequentCard(mostFrequent);
  }, [participants]);

  useEffect(() => {
    const sorted = Object.values(participants).sort((a, b) => {
      // Current user always comes first
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;

      // If cards are revealed, sort by card value (highest to lowest)
      if (cardsRevealed) {
        const aValue = a.selectedCard ? parseInt(a.selectedCard) : -1;
        const bValue = b.selectedCard ? parseInt(b.selectedCard) : -1;
        return bValue - aValue;
      }

      // Otherwise, sort by voting status
      const aHasVoted = !!a.selectedCard;
      const bHasVoted = !!b.selectedCard;

      if (aHasVoted === bHasVoted) {
        // If same status, sort by name
        return (a.name || '').localeCompare(b.name || '');
      }

      // Waiting comes before voted
      return aHasVoted ? 1 : -1;
    });

    setSortedParticipants(sorted);
  }, [participants, cardsRevealed, currentUserId]);

  return (
    <div className="participants-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Vote</th>
          </tr>
        </thead>
        <Reorder.Group as="tbody" axis="y" values={sortedParticipants} onReorder={() => {}}>
          {sortedParticipants.map((participant) => (
            <Reorder.Item
              key={participant.userId}
              value={participant}
              className={participant.userId === currentUserId ? 'current-user' : ''}
              as='tr'
              drag={false}
              transition={{ delay: 0.25 }}
            >
              <td>
                <div className="flex items-center">
                  <div className="participant-avatar">
                    <span className="text-gray-500 font-medium">
                      {participant.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="participant-name">
                      {participant.name}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span className={`status-badge ${participant.selectedCard ? 'voted' : 'waiting'}`}>
                  {participant.selectedCard ? 'Voted' : 'Waiting'}
                </span>
              </td>
              <td>
                {participant.selectedCard ? (
                  <motion.div
                    className={`vote-card ${cardsRevealed ? 'revealed' : 'hidden'} ${
                      cardsRevealed && participant.selectedCard === mostFrequentCard ? 'most-frequent' : ''
                    }`}
                    initial={{ rotateY: 180 }}
                    animate={{
                      rotateY: cardsRevealed ? 0 : 180,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {!cardsRevealed ? '⸮' : participant.selectedCard}
                  </motion.div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </table>
    </div>
  );
};

export default ParticipantsTable; 