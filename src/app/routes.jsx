// File: src/app/routes.jsx
import { Navigate } from 'react-router-dom';
import { RoleGuard, PublicView, WorkspaceView } from './routeViews';
import SearchResultsLayout from '../features/search/components/SearchResultsLayout';
import AppShell from '../components/layout/AppShell';
import NotificationFeed from '../features/notifications/components/NotificationFeed';
const candidateRoutes = [
  {
    path: '/',
    element: (
      <WorkspaceView
        title="Your overview"
        description="Your professional workspace is ready for live data."
      />
    ),
  },
  {
    path: '/jobs',
    element: (
      <WorkspaceView
        title="Find work"
        description="Search and apply to roles from the connected jobs service."
      />
    ),
  },
  {
    path: '/profile',
    element: (
      <WorkspaceView
        title="Your profile"
        description="Your experience and skills will appear here."
      />
    ),
  },
  {
    path: '/network',
    element: (
      <WorkspaceView
        title="Network feed"
        description="Professional updates will appear here."
      />
    ),
  },
  {
    path: '/messages',
    element: (
      <WorkspaceView
        title="Messages"
        description="Your conversations will appear here."
      />
    ),
  },
  {
    path: '/search',
    element: <SearchResultsLayout />,
  },
  {
    path: '/notifications',
    element: <NotificationFeed />,
  },
];
const routeConfig = [
  { path: '/login', element: <PublicView mode="login" /> },
  { path: '/signup', element: <PublicView mode="signup" /> },
  {
    element: <AppShell />,
    children: [
      {
        element: <RoleGuard roles={['candidate', 'recruiter']} />,
        children: candidateRoutes,
      },
      {
        element: <RoleGuard roles={['recruiter']} />,
        children: [
          {
            path: '/pipeline',
            element: (
              <WorkspaceView
                title="Talent pipeline"
                description="Move candidates through each hiring stage."
              />
            ),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
export default routeConfig;
