import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './Home';

describe('Home page', () => {
  it('renders the Home Page heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /home page/i })).toBeInTheDocument();
  });
});
