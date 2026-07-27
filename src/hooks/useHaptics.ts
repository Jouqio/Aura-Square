// ============================================================
// useHaptics.ts
// Aura Square — Haptic feedback (Web Vibration API)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import { useCallback, useMemo } from 'react';
import { useUiStore, selectVibrationEnabled } from '../store/uiStore';

const canVibrate =
  typeof navigator !== 'undefined' && 'vibrate' in navigator;

export function useHaptics() {
  const enabled = useUiStore(selectVibrationEnabled);

  const tap = useCallback(() => {
    if (canVibrate && enabled) navigator.vibrate(8);
  }, [enabled]);

  const place = useCallback(() => {
    if (canVibrate && enabled) navigator.vibrate(12);
  }, [enabled]);

  const clear = useCallback(() => {
    if (canVibrate && enabled) navigator.vibrate([20, 30, 20]);
  }, [enabled]);

  const combo = useCallback(() => {
    if (canVibrate && enabled) navigator.vibrate([30, 20, 40, 20, 60]);
  }, [enabled]);

  const error = useCallback(() => {
    if (canVibrate && enabled) navigator.vibrate([50, 30, 50]);
  }, [enabled]);

  // Memoize the returned object itself — without this, callers
  // that depend on the whole `haptics` object (e.g. placePiece's
  // useCallback deps) would get a new reference every render even
  // though every individual method above is already stable,
  // silently defeating any stability optimization built on top.
  return useMemo(
    () => ({ tap, place, clear, combo, error }),
    [tap, place, clear, combo, error],
  );
}
