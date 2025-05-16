import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

// Mock human-id to return a predictable value
jest.mock('human-id', () => ({
  humanId: () => 'happy-cats-jump-quickly'
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

describe('Home', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderHome = () => {
    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  it('renders hero section with title and description', () => {
    renderHome();
    
    expect(screen.getByText('Collaborative Story Point Estimation')).toBeInTheDocument();
    expect(screen.getByText(/Create a room to start estimating story points with your team/)).toBeInTheDocument();
  });

  it('renders create room button', () => {
    renderHome();
    
    expect(screen.getByRole('button', { name: /create room/i })).toBeInTheDocument();
  });

  it('navigates to new room when create room button is clicked', () => {
    renderHome();
    
    fireEvent.click(screen.getByRole('button', { name: /create room/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/room/happy-cats-jump-quickly');
  });

  it('validates room ID format when joining', () => {
    renderHome();
    
    const input = screen.getByPlaceholderText('Enter room ID');
    const joinButton = screen.getByRole('button', { name: /join room/i });

    // Test invalid characters
    fireEvent.change(input, { target: { value: 'invalid@format' } });
    fireEvent.click(joinButton);
    expect(screen.getByText('Room ID can only contain letters, numbers, and the following characters: - _ ~ .')).toBeInTheDocument();

    // Test valid URL-safe characters
    const validIds = [
      'happy-cats-jump-quickly',
      'room123',
      'my.room',
      'room~name',
      'room_name'
    ];

    validIds.forEach(validId => {
      fireEvent.change(input, { target: { value: validId } });
      fireEvent.click(joinButton);
      expect(mockNavigate).toHaveBeenCalledWith(`/room/${validId}`);
      mockNavigate.mockClear();
    });
  });

  it('renders feature sections', () => {
    renderHome();
    
    expect(screen.getByText('Real-time Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Fast & Simple')).toBeInTheDocument();
    expect(screen.getByText('No Account Required')).toBeInTheDocument();
    expect(screen.getByText('Works Everywhere')).toBeInTheDocument();
  });
});
