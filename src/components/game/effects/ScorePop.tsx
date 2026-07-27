import React, { useEffect } from 'react';
import { motion }           from 'framer-motion';
import { useGameStore, selectScorePops } from '../../../store/gameStore';

export function ScorePopLayer(): React.JSX.Element {
  const pops   = useGameStore(selectScorePops);
  const remove = useGameStore((s) => s.removeScorePop);

  return (
    <>
      {pops.map((pop) => (
        <ScorePopItem
          key={pop.id}
          id={pop.id}
          value={pop.value}
          x={pop.x}
          y={pop.y}
          combo={pop.combo}
          onDone={() => remove(pop.id)}
        />
      ))}
    </>
  );
}

interface ScorePopItemProps {
  id:     string;
  value:  number;
  x:      number;
  y:      number;
  combo:  boolean;
  onDone: () => void;
}

function ScorePopItem({ value, x, y, combo, onDone }: ScorePopItemProps): React.JSX.Element {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className={`score-pop ${combo ? 'score-pop--combo' : ''}`}
      style={{ left: x, top: y }}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -64, scale: 0.85 }}
      transition={{ duration: 0.85, ease: 'easeOut' }}
    >
      +{value}
    </motion.div>
  );
}
