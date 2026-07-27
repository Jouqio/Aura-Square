// AppRouter.tsx — Phase 6: Zero Auth
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppShell }   from '../components/layout/AppShell/AppShell';
import { Spinner }    from '../components/ui/Spinner/Spinner';
import { ROUTES }     from './routes';

const HomePage        = lazy(() => import('../pages/Home/HomePage'));
const GamePage        = lazy(() => import('../pages/Game/GamePage'));
const DailyPage       = lazy(() => import('../pages/Daily/DailyPage'));
const AchievementsPage= lazy(() => import('../pages/Achievements/AchievementsPage'));
const LeaderboardPage = lazy(() => import('../pages/Leaderboard/LeaderboardPage'));
const StatisticsPage  = lazy(() => import('../pages/Statistics/StatisticsPage'));
const ProfilePage     = lazy(() => import('../pages/Profile/ProfilePage'));
const SettingsPage    = lazy(() => import('../pages/Settings/SettingsPage'));
const AboutPage       = lazy(() => import('../pages/About/AboutPage'));

function Loader(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center h-[100dvh] bg-surface-50">
      <Spinner size={32} className="text-aura-600"/>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: ROUTES.GAME,
    element: <Suspense fallback={<Loader/>}><GamePage/></Suspense>,
  },
  {
    element: <AppShell/>,
    children: [
      { index:true, path:ROUTES.HOME,
        element:<Suspense fallback={<Loader/>}><HomePage/></Suspense> },
      { path:ROUTES.DAILY,
        element:<Suspense fallback={<Loader/>}><DailyPage/></Suspense> },
      { path:ROUTES.ACHIEVEMENTS,
        element:<Suspense fallback={<Loader/>}><AchievementsPage/></Suspense> },
      { path:ROUTES.LEADERBOARD,
        element:<Suspense fallback={<Loader/>}><LeaderboardPage/></Suspense> },
      { path:ROUTES.STATISTICS,
        element:<Suspense fallback={<Loader/>}><StatisticsPage/></Suspense> },
      { path:ROUTES.PROFILE,
        element:<Suspense fallback={<Loader/>}><ProfilePage/></Suspense> },
      { path:ROUTES.SETTINGS,
        element:<Suspense fallback={<Loader/>}><SettingsPage/></Suspense> },
      { path:ROUTES.ABOUT,
        element:<Suspense fallback={<Loader/>}><AboutPage/></Suspense> },
    ],
  },
  { path:'*', element:<Navigate to={ROUTES.HOME} replace/> },
]);

export function AppRouter(): React.JSX.Element {
  return <RouterProvider router={router}/>;
}
