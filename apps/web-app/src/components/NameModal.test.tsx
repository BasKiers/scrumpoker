import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NameModal from './NameModal';

describe('NameModal', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSkip = jest.fn();
  const mockRoomUrl = 'http://localhost:3000/room/123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <NameModal
        isOpen={true}
        onSubmit={mockOnSubmit}
        onSkip={mockOnSkip}
        roomUrl={mockRoomUrl}
      />
    );

    expect(screen.getByText('Enter Your Name')).toBeInTheDocument();
    expect(screen.getByText('Choose a name to identify yourself in the room')).toBeInTheDocument();
    expect(screen.getByLabelText('Room URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <NameModal
        isOpen={false}
        onSubmit={mockOnSubmit}
        onSkip={mockOnSkip}
        roomUrl={mockRoomUrl}
      />
    );

    expect(screen.queryByText('Enter Your Name')).not.toBeInTheDocument();
  });

  it('validates name input for alphanumeric characters and spaces', () => {
    render(
      <NameModal
        isOpen={true}
        onSubmit={mockOnSubmit}
        onSkip={mockOnSkip}
        roomUrl={mockRoomUrl}
      />
    );

    const nameInput = screen.getByLabelText('Your Name');
    
    // Test invalid character
    fireEvent.change(nameInput, { target: { value: 'John@Doe' } });
    expect(screen.getByText('Name can only contain letters, numbers, and spaces')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join' })).toBeDisabled();

    // Test valid input
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(screen.queryByText('Name can only contain letters, numbers, and spaces')).not.toBeInTheDocument();
  });

  it('calls onSubmit with trimmed name when form is submitted', () => {
    render(
      <NameModal
        isOpen={true}
        onSubmit={mockOnSubmit}
        onSkip={mockOnSkip}
        roomUrl={mockRoomUrl}
      />
    );

    const nameInput = screen.getByLabelText('Your Name');
    fireEvent.change(nameInput, { target: { value: '  John Doe  ' } });
    
    const submitButton = screen.getByRole('button', { name: 'Join' });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('John Doe');
  });

  it('calls onSkip when skip button is clicked', () => {
    render(
      <NameModal
        isOpen={true}
        onSubmit={mockOnSubmit}
        onSkip={mockOnSkip}
        roomUrl={mockRoomUrl}
      />
    );

    const skipButton = screen.getByRole('button', { name: 'Skip' });
    fireEvent.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('copies room URL when copy button is clicked', () => {
    const mockClipboard = {
      writeText: jest.fn(),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });

    render(
      <NameModal
        isOpen={true}
        onSubmit={mockOnSubmit}
        onSkip={mockOnSkip}
        roomUrl={mockRoomUrl}
      />
    );

    const copyButton = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(mockRoomUrl);
  });
}); 