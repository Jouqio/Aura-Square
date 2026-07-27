// routes.ts — Phase 6
export const ROUTES = {
  HOME:         '/',
  GAME:         '/play',
  DAILY:        '/daily',
  ACHIEVEMENTS: '/achievements',
  LEADERBOARD:  '/leaderboard',
  STATISTICS:   '/stats',
  PROFILE:      '/profile',
  SETTINGS:     '/settings',
  ABOUT:        '/about',
} as const;
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
