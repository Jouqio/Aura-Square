// ============================================================
// MotionPreferenceProvider.tsx
// Aura Square — Reduced Motion accessibility provider
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Wraps the app in framer-motion's <MotionConfig> so EVERY
// motion.* component in the tree automatically respects the
// combined OS + in-app reduced-motion preference — reducing most
// transform/scale animations down to simple opacity fades. Also
// applies a `.reduce-motion` class to <html> so plain CSS
// keyframe animations (particles, shockwave, squish, score pulse
// — none of which go through framer-motion) can branch on the
// same single source of truth via `:root.reduce-motion`.

import React, { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { useEffectiveReducedMotion } from '../hooks/useEffectiveReducedMotion';

interface Props { children: React.ReactNode; }

export function MotionPreferenceProvider({ children }: Props): React.JSX.Element {
  const reduced = useEffectiveReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced);
  }, [reduced]);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      {children}
    </MotionConfig>
  );
}
