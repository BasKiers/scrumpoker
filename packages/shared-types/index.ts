/**
 * Represents a participant in a room.
 */
export interface Participant {
  /** Unique user identifier */
  userId: string;
  /** Display name of the participant */
  name?: string;
  /** The card selected by the participant, if any */
  selectedCard?: string;
  /** Connection status (e.g., 'online', 'offline') */
  status?: 'online' | 'offline';
  /** Video enabled state */
  videoEnabled?: boolean;
  /** Audio enabled state */
  audioEnabled?: boolean;
}

/**
 * Represents the state of a room.
 */
export interface RoomState {
  /** Unique room identifier */
  roomId: string;
  /** All participants in the room, keyed by userId */
  participants: Record<string, Participant>;
  /** The userId of the active speaker, if any */
  activeSpeaker?: string;
  /** Card status: hidden or revealed */
  card_status: 'hidden' | 'revealed';
  /** Optional configuration for the room */
  config?: RoomConfig;
}

/**
 * Configuration options for a room.
 */
export interface RoomConfig {
  /** Maximum number of participants allowed */
  maxParticipants?: number;
  /** Allow guests to join without authentication */
  allowGuests?: boolean;
  /** Custom room name */
  roomName?: string;
}

// Type assertion tests (for development only, not compiled in production)
// These are not runtime tests, but will cause TypeScript errors if the types are incompatible
const sampleParticipant: Participant = {
  userId: 'user-123',
  name: 'Alice',
  selectedCard: '5',
  status: 'online',
  videoEnabled: true,
  audioEnabled: false,
};

const sampleRoomState: RoomState = {
  roomId: 'room-abc',
  participants: {
    'user-123': sampleParticipant,
  },
  activeSpeaker: 'user-123',
  card_status: 'hidden',
  config: {
    maxParticipants: 10,
    allowGuests: true,
    roomName: 'Planning Room',
  },
};
