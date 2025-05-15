import React, { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Room = lazy(() => import('./pages/Room'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/room/:roomId',
    element: <Room />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
