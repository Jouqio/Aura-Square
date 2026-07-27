// ============================================================
// WelcomeScreen.tsx
// Aura Square — Welcome / resume screen overlay
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';
import { motion }           from 'framer-motion';
import { useTranslation }   from 'react-i18next';
import { Button }           from '../../ui/Button/Button';

interface WelcomeScreenProps {
  hasSavedGame: boolean;
  bestScore:    number;
  onNewGame:    () => void;
  onResume:     () => void;
}

const card = {
  hidden: { opacity: 0, scale: 0.88, y: 24 },
  show:   { opacity: 1, scale: 1,    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 26 } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const row = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function WelcomeScreen({
  hasSavedGame, bestScore, onNewGame, onResume,
}: WelcomeScreenProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="overlay overlay--welcome">
      <motion.div
        variants={card}
        initial="hidden"
        animate="show"
        className="welcome-card"
      >
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="flex flex-col items-center gap-6">

          {/* Logo */}
          <motion.div variants={row} className="welcome-logo">
            <div className="welcome-logo__square">
              <span>A</span>
            </div>
            <h1 className="welcome-logo__title">AURA SQUARE</h1>
            <p className="welcome-logo__tagline">{t('app.tagline')}</p>
          </motion.div>

          {/* Best score */}
          {bestScore > 0 && (
            <motion.div variants={row} className="welcome-best">
              <span className="welcome-best__label">🏆 {t('game.best')}</span>
              <span className="welcome-best__value">
                {bestScore.toLocaleString()}
              </span>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div variants={row} className="flex flex-col gap-3 w-full">
            {hasSavedGame ? (
              <>
                <Button variant="primary" size="full" onClick={onResume}>
                  ▶ {t('common.done')} — {t('game.resume')}
                </Button>
                <Button variant="ghost" size="full" onClick={onNewGame}>
                  {t('game.restart')}
                </Button>
              </>
            ) : (
              <Button variant="primary" size="full" onClick={onNewGame}>
                ▶ {t('home.quick_play')}
              </Button>
            )}
          </motion.div>

          {/* Mini instructions */}
          <motion.p variants={row} className="welcome-hint">
            Seret potongan ke papan. Penuhkan baris atau kolom untuk membersihkannya!
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
