// AppShell.tsx — Phase 6: Zero Auth
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TopBar }    from '../TopBar/TopBar';
import { BottomNav } from '../BottomNav/BottomNav';
import { OfflineBanner } from '../OfflineBanner/OfflineBanner';

const VARIANTS = {
  initial: { opacity: 0, y: 6  },
  animate: { opacity: 1, y: 0  },
  exit:    { opacity: 0, y: -4 },
};

export function AppShell(): React.JSX.Element {
  const location = useLocation();
  return (
    <div className="relative flex flex-col h-[100dvh] max-w-lg mx-auto
      overflow-hidden bg-surface-50">
      <TopBar />
      <OfflineBanner />
      <main className="flex-1 overflow-y-auto overflow-x-hidden
        pb-nav scroll-smooth overscroll-y-contain">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.16, ease: 'easeInOut' }}
            className="min-h-full">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
