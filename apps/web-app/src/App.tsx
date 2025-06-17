import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import { UserProvider } from './contexts/UserContext';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Suspense
          fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}
        >
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Suspense>
      </Router>
    </UserProvider>
  );
};

export default App;
