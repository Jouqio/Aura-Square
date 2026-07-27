// ============================================================
// useEffectiveReducedMotion.ts
// Aura Square — Combines OS `prefers-reduced-motion` with the
// in-app Settings toggle into one boolean.
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Motion should be reduced if EITHER:
//   (a) the OS-level media query says so, or
//   (b) the player explicitly turned on "Kurangi Animasi" in
//       Pengaturan, regardless of their OS setting.
// This is the single source of truth consumed by both the
// framer-motion MotionConfig wrapper (App.tsx) and any CSS that
// needs to branch on JS state rather than a pure media query.

import { useEffect, useState } from 'react';
import { useUiStore, selectReducedMotion } from '../store/uiStore';

function getOsPref(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useEffectiveReducedMotion(): boolean {
  const appSetting = useUiStore(selectReducedMotion);
  const [osPref, setOsPref] = useState(getOsPref);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setOsPref(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return appSetting || osPref;
}
