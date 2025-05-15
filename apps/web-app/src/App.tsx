import React, { Suspense } from 'react';
import { BrowserRouter, useRoutes, Link } from 'react-router-dom';
import { routes } from './routes';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

function AppRoutes() {
  return useRoutes(routes);
}

interface AppProps {
  Router?: typeof BrowserRouter;
}

const App: React.FC<AppProps> = ({ Router = BrowserRouter }) => {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <div className="p-4 space-y-4">
        <Alert>Welcome to the app! This is a shadcn/ui Alert.</Alert>
        <Button>Click me</Button>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </Router>
  );
};

export default App;
