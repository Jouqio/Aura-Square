// ============================================================
// AchievementToast.tsx
// Aura Square Phase 4.0 — Achievement unlock toast
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation }          from 'react-i18next';
import type { NewUnlock }          from '../../../store/achievementStore';
import { AchievementIcon }         from '../../achievements/AchievementIcons';

interface AchievementToastProps {
  unlock:   NewUnlock | null;
  onClose:  () => void;
}

export function AchievementToast({
  unlock, onClose,
}: AchievementToastProps): React.JSX.Element {
  const { t } = useTranslation();

  useEffect(() => {
    if (!unlock) return;
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [unlock, onClose]);

  const title = unlock
    ? t(`achievements.items.${unlock.id}.title`, { defaultValue: unlock.title })
    : '';

  return (
    <AnimatePresence>
      {unlock && (
        <motion.div
          key={unlock.id}
          initial={{ opacity: 0, y: 60, scale: 0.88 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 40, scale: 0.92  }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="achievement-toast"
          onClick={onClose}
        >
          <div className="achievement-toast__icon"><AchievementIcon iconKey={unlock.icon} size={22}/></div>
          <div className="achievement-toast__body">
            <p className="achievement-toast__label">{t('game.achievement_unlocked', { defaultValue: 'Pencapaian Terbuka!' })}</p>
            <p className="achievement-toast__title">{title}</p>
          </div>
          <div className="achievement-toast__pts">+{unlock.points}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
