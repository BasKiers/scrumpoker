import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFound from './NotFound';

describe('NotFound page', () => {
  it('renders the 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument();
  });
}); 