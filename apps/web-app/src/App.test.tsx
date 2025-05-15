import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App routing', () => {
  it('renders Home page on default route', async () => {
    render(<App Router={MemoryRouter} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /home page/i })).toBeInTheDocument();
    });
  });

  it('renders NotFound page on unknown route', async () => {
    const CustomRouter = (props: React.PropsWithChildren<object>) => <MemoryRouter initialEntries={['/unknown']} {...props} />;
    render(<App Router={CustomRouter} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument();
    });
  });
});
