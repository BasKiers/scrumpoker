import { getUserId, clearUserId } from './localStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getUserId', () => {
    it('should generate and store a new user ID if none exists', () => {
      const userId = getUserId();
      expect(userId).toBeDefined();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('scrum-poker-user-id', userId);
    });

    it('should return existing user ID if one exists', () => {
      const existingId = 'test-user-id';
      localStorageMock.getItem.mockReturnValueOnce(existingId);
      
      const userId = getUserId();
      expect(userId).toBe(existingId);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('clearUserId', () => {
    it('should remove the user ID from localStorage', () => {
      clearUserId();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('scrum-poker-user-id');
    });
  });
}); 