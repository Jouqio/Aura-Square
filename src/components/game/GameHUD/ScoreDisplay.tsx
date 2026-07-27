// ============================================================
// ScoreDisplay.tsx
// Aura Square — Animated score number with spring transition
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useEffect, useRef, useState, memo } from 'react';
import { animate } from 'framer-motion';

interface ScoreDisplayProps {
  value:    number;
  label:    string;
  large?:   boolean;
  glow?:    boolean;
}

export const ScoreDisplay = memo(function ScoreDisplay({
  value, label, large = false, glow = false,
}: ScoreDisplayProps): React.JSX.Element {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (prev === value) return;

    const controls = animate(prev, value, {
      duration:   0.45,
      ease:       [0.16, 1, 0.3, 1],
      onUpdate:   (v) => setDisplay(Math.round(v)),
    });

    return controls.stop;
  }, [value]);

  return (
    <div className="score-display">
      <p className="score-display__label">{label}</p>
      <p
        className={[
          'score-display__value',
          large ? 'score-display__value--large' : '',
          glow  ? 'score-display__value--glow'  : '',
        ].filter(Boolean).join(' ')}
      >
        {display.toLocaleString()}
      </p>
    </div>
  );
});
