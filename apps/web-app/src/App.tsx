import React, { Suspense } from 'react';
import { BrowserRouter, useRoutes, Link } from 'react-router-dom';
import { routes } from './routes';

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
      <Suspense fallback={<div>Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </Router>
  );
};

export default App;
