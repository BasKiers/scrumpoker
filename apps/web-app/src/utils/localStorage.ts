import { nanoid } from 'nanoid';

const USER_ID_KEY = 'scrum-poker-user-id';

/**
 * Gets the user ID from localStorage or generates a new one if it doesn't exist
 * @returns The user ID
 */
export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = nanoid();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

/**
 * Clears the user ID from localStorage
 */
export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
} 