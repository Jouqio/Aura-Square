// ============================================================
// MissionToast.tsx
// Aura Square — Daily Mission Board completion toast
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { MissionProgress } from '../../../store/missionStore';
import { ChestIcon } from '../../ui/icons/BadgeIcons';

interface MissionToastProps {
  data:     { completed: MissionProgress[]; bonus: boolean } | null;
  onClose:  () => void;
}

export function MissionToast({ data, onClose }: MissionToastProps): React.JSX.Element {
  const { t } = useTranslation();

  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [data, onClose]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key="mission-toast"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,  scale: 1   }}
          exit={{   opacity: 0, y: -16, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          className="mission-toast"
          onClick={onClose}
        >
          <div className="mission-toast__icon">
            <ChestIcon size={22} open={data.bonus}/>
          </div>
          <div className="mission-toast__body">
            {data.bonus ? (
              <>
                <p className="mission-toast__label">
                  {t('missions.all_done_title', { defaultValue: 'Semua misi harian selesai!' })}
                </p>
                <p className="mission-toast__title">
                  {t('missions.bonus_chest', { defaultValue: 'Bonus peti +75 XP' })}
                </p>
              </>
            ) : (
              <>
                <p className="mission-toast__label">
                  {t('missions.completed_label', { defaultValue: 'Misi selesai' })}
                </p>
                <p className="mission-toast__title">
                  {data.completed
                    .map((m) => t(`missions.${m.id}`, { defaultValue: m.label }))
                    .join(', ')}
                </p>
              </>
            )}
          </div>
          <span className="mission-toast__xp">
            +{data.completed.reduce((s, m) => s + m.xpReward, 0) + (data.bonus ? 75 : 0)} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
