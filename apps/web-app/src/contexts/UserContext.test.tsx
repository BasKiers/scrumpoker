import React from 'react';
import { render, act } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import { getUserId, getLastKnownName, setLastKnownName, clearLastKnownName } from '@/utils/localStorage';

// Mock localStorage functions
jest.mock('@/utils/localStorage', () => ({
  getUserId: jest.fn(),
  getLastKnownName: jest.fn(),
  setLastKnownName: jest.fn(),
  clearLastKnownName: jest.fn(),
}));

const TestComponent = () => {
  const { userId, name, setName, clearName } = useUser();
  return (
    <div>
      <div data-testid="userId">{userId}</div>
      <div data-testid="name">{name}</div>
      <button onClick={() => setName('Test Name')}>Set Name</button>
      <button onClick={clearName}>Clear Name</button>
    </div>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserId as jest.Mock).mockReturnValue('test-user-id');
    (getLastKnownName as jest.Mock).mockReturnValue(null);
  });

  it('provides user ID and name from localStorage', () => {
    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(getByTestId('userId')).toHaveTextContent('test-user-id');
    expect(getByTestId('name')).toHaveTextContent('');
  });

  it('allows setting and clearing name', () => {
    const { getByTestId, getByText } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    act(() => {
      getByText('Set Name').click();
    });

    expect(setLastKnownName).toHaveBeenCalledWith('Test Name');
    expect(getByTestId('name')).toHaveTextContent('Test Name');

    act(() => {
      getByText('Clear Name').click();
    });

    expect(clearLastKnownName).toHaveBeenCalled();
    expect(getByTestId('name')).toHaveTextContent('');
  });

  it('throws error when useUser is used outside provider', () => {
    const consoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUser must be used within a UserProvider');

    console.error = consoleError;
  });
}); 