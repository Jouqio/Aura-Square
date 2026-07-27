// ============================================================
// OfflineBanner.tsx
// Aura Square — Offline indicator banner
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Purely informational — Aura Square is offline-first by design,
// so gameplay is never blocked. This just tells the player WHY
// something like the online leaderboard tab might be unavailable,
// rather than leaving them guessing.

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

export function OfflineBanner(): React.JSX.Element {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="offline-banner"
        >
          <span className="offline-banner__dot"/>
          {t('common.offline_notice', { defaultValue: 'Kamu sedang offline — data lokal tetap aman' })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
