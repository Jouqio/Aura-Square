import React from 'react';
import { motion }         from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button }         from '../../ui/Button/Button';

interface PauseModalProps {
  score:    number;
  onResume: () => void;
  onQuit:   () => void;
}

export function PauseModal({ score, onResume, onQuit }: PauseModalProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="overlay overlay--blur">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="modal-card"
      >
        <p className="modal-card__label">{t('game.pause')}</p>
        <p className="modal-card__score">{score.toLocaleString()}</p>
        <p className="modal-card__sublabel">{t('game.score')}</p>

        <div className="flex flex-col gap-3 w-full mt-6">
          <Button variant="primary" size="full" onClick={onResume}>
            ▶ {t('game.resume')}
          </Button>
          <Button variant="ghost" size="full" onClick={onQuit}>
            {t('common.back')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
