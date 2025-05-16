import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Home', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the hero section with title and description', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('Collaborative Story Point Estimation')).toBeInTheDocument();
    expect(screen.getByText(/Create a room to start estimating story points with your team/)).toBeInTheDocument();
  });

  it('renders the create room button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const createButton = screen.getByText('Create Room');
    expect(createButton).toBeInTheDocument();
  });

  it('navigates to room creation when create button is clicked', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const createButton = screen.getByText('Create Room');
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith('/room/new');
  });

  it('renders feature sections', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('Real-time Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Fast & Simple')).toBeInTheDocument();
    expect(screen.getByText('No Account Required')).toBeInTheDocument();
    expect(screen.getByText('Works Everywhere')).toBeInTheDocument();
  });
});
