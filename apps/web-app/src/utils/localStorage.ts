import { nanoid } from 'nanoid';

const USER_ID_KEY = 'scrum_poker_user_id';
const LAST_KNOWN_NAME_KEY = 'scrum_poker_last_known_name';

/**
 * Gets the user ID from localStorage or generates a new one if it doesn't exist
 * @returns The user ID
 */
export const getUserId = (): string => {
  const storedId = localStorage.getItem(USER_ID_KEY);
  if (storedId) {
    return storedId;
  }
  const newId = nanoid();
  localStorage.setItem(USER_ID_KEY, newId);
  return newId;
};

/**
 * Clears the user ID from localStorage
 */
export const clearUserId = (): void => {
  localStorage.removeItem(USER_ID_KEY);
};

export const getLastKnownName = (): string | null => {
  return localStorage.getItem(LAST_KNOWN_NAME_KEY);
};

export const setLastKnownName = (name: string): void => {
  localStorage.setItem(LAST_KNOWN_NAME_KEY, name);
};

export const clearLastKnownName = (): void => {
  localStorage.removeItem(LAST_KNOWN_NAME_KEY);
}; 