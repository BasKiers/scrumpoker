import React, { useEffect, useState } from 'react';
import { Reorder } from 'framer-motion';
import type { Participant } from 'shared-types';

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
  const [flipping, setFlipping] = useState(false);
  const [sortedParticipants, setSortedParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (cardsRevealed) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setFlipping(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [cardsRevealed]);

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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vote
            </th>
          </tr>
        </thead>
        <Reorder.Group as="tbody" axis="y" values={sortedParticipants} className="bg-white divide-y divide-gray-200">
          {sortedParticipants.map((participant) => (
            <Reorder.Item
              key={participant.userId}
              value={participant}
              className={`${participant.userId === currentUserId ? 'bg-blue-50' : ''}`}
              as='tr'
              drag={false}
              transition={{ delay: 0.2 }}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {participant.name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {participant.name || 'Anonymous'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  participant.selectedCard 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {participant.selectedCard ? 'Voted' : 'Waiting'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {participant.selectedCard ? (
                  <div className={`w-8 h-12 rounded border-2 flex items-center justify-center transition-transform duration-200 ease-in-out ${
                    flipping ? 'transform rotate-y-90' : ''
                  } ${(cardsRevealed && flipping) || (!cardsRevealed && !flipping) ? 'bg-gray-100 border-gray-300' : 'bg-white border-blue-500' }`}>
                    {(cardsRevealed && flipping) || (!cardsRevealed && !flipping) ? '?' : participant.selectedCard}
                  </div>
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