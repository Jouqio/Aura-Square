// ============================================================
// GameHUD.tsx
// Aura Square — In-game HUD (score, best, pause)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { memo } from 'react';
import { motion }           from 'framer-motion';
import { useNavigate }      from 'react-router-dom';
import { useTranslation }   from 'react-i18next';
import { ScoreDisplay }     from './ScoreDisplay';
import { HintBulbIcon }     from '../../ui/icons/GameIcons';
import { ROUTES }           from '../../../router/routes';

interface GameHUDProps {
  score:    number;
  best:     number;
  onPause:  () => void;
  onHint?:       () => void;
  hintsRemaining?: number;
  canHint?:        boolean;
}

export const GameHUD = memo(function GameHUD({
  score, best, onPause, onHint, hintsRemaining, canHint,
}: GameHUDProps): React.JSX.Element {
  const { t }    = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="game-hud">
      {/* Back button */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => navigate(ROUTES.HOME)}
        className="game-hud__back"
        aria-label={t('common.back')}
      >
        <ChevronLeft />
      </motion.button>

      {/* Scores */}
      <div className="game-hud__scores">
        <ScoreDisplay label={t('game.best')}  value={best}  />
        <ScoreDisplay label={t('game.score')} value={score} large glow />
      </div>

      {/* Hint + Pause */}
      <div className="game-hud__actions">
        {onHint && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onHint}
            disabled={!canHint}
            className="game-hud__hint"
            aria-label={t('game.hint', { defaultValue: 'Bantuan' })}
          >
            <HintBulbIcon size={17}/>
            {typeof hintsRemaining === 'number' && (
              <span className="game-hud__hint-badge">{hintsRemaining}</span>
            )}
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onPause}
          className="game-hud__pause"
          aria-label={t('game.pause')}
        >
          <PauseIcon />
        </motion.button>
      </div>
    </header>
  );
});

// ── Icons ──────────────────────────────────────────────────────
function ChevronLeft(): React.JSX.Element {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function PauseIcon(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6"  y="4" width="4" height="16" rx="2" />
      <rect x="14" y="4" width="4" height="16" rx="2" />
    </svg>
  );
}
