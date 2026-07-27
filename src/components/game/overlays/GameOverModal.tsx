// ============================================================
// GameOverModal.tsx — Aura Cyber Neon upgrade
// Score counting animation, custom SVG icons (no emoji),
// glow effects on final score.
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { useTranslation }          from 'react-i18next';
import { Button }                  from '../../ui/Button/Button';
import { TrophyIcon, ReplayIcon, ShareIcon }  from '../../ui/icons/GameIcons';
import { useShareScore }           from '../../../hooks/useShareScore';

interface GameOverModalProps {
  show:          boolean;
  score:         number;
  bestScore:     number;
  averageScore:  number;
  isNewBest:     boolean;
  onPlayAgain:   () => void;
  onHome:        () => void;
}

const backdrop = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
};

const card = {
  hidden: { opacity: 0, scale: 0.75, y: 30 },
  show:   {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 25, delay: 0.05 },
  },
  exit:   { opacity: 0, scale: 0.88, y: 20,
    transition: { duration: 0.2 } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/** Counts up from 0 to `value` once when it first becomes visible. */
function useCountUp(value: number, active: boolean, delay = 0.25): number {
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active) { startedRef.current = false; setDisplay(0); return; }
    if (startedRef.current) return;
    startedRef.current = true;

    const t = setTimeout(() => {
      const controls = animate(0, value, {
        duration: 1.1,
        ease:     [0.16, 1, 0.3, 1],
        onUpdate: (v) => setDisplay(Math.round(v)),
      });
      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(t);
  }, [active, value, delay]);

  return display;
}

export function GameOverModal({
  show, score, bestScore, averageScore, isNewBest, onPlayAgain, onHome,
}: GameOverModalProps): React.JSX.Element {
  const { t } = useTranslation();
  const animatedScore = useCountUp(score, show);
  const { share, status: shareStatus, reset: resetShare } = useShareScore();

  // Score-vs-average comparison. `averageScore` includes this very
  // game's score too (it's read from statsStore AFTER addRecord has
  // already run for this game) — that's intentional: "your average"
  // is meant as a general historical benchmark, and most players
  // read it that way rather than expecting a strict "before this
  // game" baseline.
  const hasAverage  = averageScore > 0;
  const diffPct     = hasAverage ? Math.round(((score - averageScore) / averageScore) * 100) : 0;

  // Reset any lingering share feedback state whenever the modal is
  // reopened for a fresh game over, so an old "Berhasil!" message
  // from a previous round never bleeds into the next one.
  useEffect(() => {
    if (show) resetShare();
  }, [show, resetShare]);

  const handleShare = () => {
    share({ score, bestScore, isNewBest });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="game-over-backdrop"
          variants={backdrop}
          initial="hidden"
          animate="show"
          exit="hidden"
          className="overlay overlay--blur"
        >
          <motion.div
            key="game-over-card"
            variants={card}
            initial="hidden"
            animate="show"
            exit="exit"
            className="modal-card modal-card--gameover"
          >
            <motion.div variants={stagger} initial="hidden" animate="show"
              className="flex flex-col items-center gap-4 w-full">

              {/* New best badge */}
              {isNewBest && (
                <motion.div
                  variants={item}
                  className="new-best-badge"
                  initial={{ scale: 0.6 }}
                  animate={{ scale: [0.6, 1.15, 1] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <TrophyIcon size={15}/>
                  <span>{t('game.new_best')}</span>
                </motion.div>
              )}

              {/* Title */}
              <motion.p variants={item} className="modal-card__label">
                {t('game.game_over')}
              </motion.p>

              {/* Final score — counts up with glow */}
              <motion.p
                variants={item}
                className="modal-card__score modal-card__score--xl modal-card__score--glow"
              >
                {animatedScore.toLocaleString()}
              </motion.p>

              {/* Best score */}
              <motion.div variants={item} className="gameover-best">
                <span className="gameover-best__label">
                  <TrophyIcon size={14}/> {t('game.best')}
                </span>
                <span className="gameover-best__value">{bestScore.toLocaleString()}</span>
              </motion.div>

              {/* Score vs personal average */}
              <motion.p variants={item} className={`gameover-compare
                ${hasAverage && diffPct > 0 ? 'gameover-compare--up'
                  : hasAverage && diffPct < 0 ? 'gameover-compare--down' : ''}`}>
                {!hasAverage
                  ? t('game.first_game_note', { defaultValue: 'Permainan pertamamu!' })
                  : diffPct > 0
                  ? t('game.vs_average_above', { defaultValue: `${diffPct}% di atas rata-ratamu`, pct: diffPct })
                  : diffPct < 0
                  ? t('game.vs_average_below', { defaultValue: `${Math.abs(diffPct)}% di bawah rata-ratamu`, pct: Math.abs(diffPct) })
                  : t('game.vs_average_same', { defaultValue: 'Sama seperti rata-ratamu' })}
              </motion.p>

              {/* Buttons */}
              <motion.div variants={item}
                className="flex flex-col gap-3 w-full mt-2">
                <Button variant="primary" size="full" onClick={onPlayAgain}>
                  <span className="flex items-center justify-center gap-2">
                    <ReplayIcon size={17}/> {t('game.play_again')}
                  </span>
                </Button>

                <button
                  onClick={handleShare}
                  disabled={shareStatus === 'generating'}
                  className="share-score-btn"
                >
                  <ShareIcon size={16}/>
                  <span>
                    {shareStatus === 'generating'
                      ? t('game.share_generating', { defaultValue: 'Membuat kartu skor...' })
                      : shareStatus === 'downloaded'
                      ? t('game.share_downloaded',  { defaultValue: 'Gambar diunduh & teks disalin!' })
                      : shareStatus === 'error'
                      ? t('game.share_error',       { defaultValue: 'Gagal membagikan. Coba lagi.' })
                      : t('game.share',             { defaultValue: 'Bagikan Skor' })}
                  </span>
                </button>

                <Button variant="secondary" size="full" onClick={onHome}>
                  {t('common.back')}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
