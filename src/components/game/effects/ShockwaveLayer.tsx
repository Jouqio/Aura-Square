// ============================================================
// ShockwaveLayer.tsx
// Aura Square — Line-clear shockwave ring effect
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, selectShockwaves } from '../../../store/gameStore';

export function ShockwaveLayer(): React.JSX.Element {
  const waves  = useGameStore(selectShockwaves);
  const remove = useGameStore((s) => s.removeShockwave);

  return (
    <>
      {waves.map((w) => (
        <ShockwaveItem key={w.id} {...w} onDone={() => remove(w.id)} />
      ))}
    </>
  );
}

interface ShockwaveItemProps {
  id: string; x: number; y: number;
  axis: 'row' | 'col'; intensity: number;
  onDone: () => void;
}

function ShockwaveItem({ x, y, axis, intensity, onDone }: ShockwaveItemProps): React.JSX.Element {
  useEffect(() => {
    const t = setTimeout(onDone, 480);
    return () => clearTimeout(t);
  }, [onDone]);

  const color = intensity >= 2 ? '#F5C842' : '#a78bfa';
  const maxScale = axis === 'row' ? 14 : 10; // rows are wider on this layout

  return (
    <motion.div
      className="shockwave-ring"
      style={{
        left: x, top: y,
        borderColor: color,
        boxShadow: `0 0 24px ${color}`,
      }}
      initial={{ opacity: 0.8, scale: 0 }}
      animate={{ opacity: 0, scale: maxScale * (1 + (intensity - 1) * 0.25) }}
      transition={{ duration: 0.46, ease: 'easeOut' }}
    />
  );
}
