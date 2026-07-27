// ============================================================
// AchievementCard.tsx
// Aura Square — Achievement display card (i18n-aware)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { memo }    from 'react';
import { motion }         from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { AchievementDef } from '../../constants/achievement.constants';
import { AchievementIcon } from './AchievementIcons';
import { LockIcon }        from '../ui/icons/MiscIcons';

interface AchievementCardProps {
  def:        AchievementDef;
  unlocked:   boolean;
  unlockedAt?: number;
}

function AchievementCardInner({
  def, unlocked, unlockedAt,
}: AchievementCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const title = t(`achievements.items.${def.id}.title`,       { defaultValue: def.title });
  const desc  = t(`achievements.items.${def.id}.description`, { defaultValue: def.description });

  return (
    <motion.div
      className={`achievement-card ${unlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'}`}
      whileTap={unlocked ? { scale: 0.98 } : {}}
      layout
    >
      {/* Icon */}
      <div className={`achievement-card__icon ${unlocked ? '' : 'achievement-card__icon--locked'}`}>
        {unlocked
          ? <AchievementIcon iconKey={def.icon} size={26}/>
          : <LockIcon size={18} className="text-white/30"/>}
      </div>

      {/* Body */}
      <div className="achievement-card__body">
        <p className={`achievement-card__title ${unlocked ? '' : 'achievement-card__title--locked'}`}>
          {title}
        </p>
        <p className="achievement-card__desc">
          {desc}
        </p>
        {unlocked && unlockedAt && (
          <p className="achievement-card__date">
            {new Date(unlockedAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Points badge */}
      <div className={`achievement-card__pts ${unlocked ? 'achievement-card__pts--earned' : ''}`}>
        +{def.points}
      </div>

      {/* Unlocked glow */}
      {unlocked && <div className="achievement-card__glow" />}
    </motion.div>
  );
}

export const AchievementCard = memo(AchievementCardInner);
