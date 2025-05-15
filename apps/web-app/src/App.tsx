import React, { Suspense } from 'react';
import { BrowserRouter, useRoutes, Link } from 'react-router-dom';
import { routes } from './routes';
import './App.css'

function AppRoutes() {
  return useRoutes(routes);
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Suspense fallback={<div>Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
