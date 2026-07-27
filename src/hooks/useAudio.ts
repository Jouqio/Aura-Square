// ============================================================
// useAudio.ts
// Aura Square — Audio System hook
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Thin wrapper around audio.service that respects the user's
// "Efek Suara" toggle in Settings. All calls are no-ops when
// soundEnabled is false, so callers never need to check the
// setting themselves.

import { useCallback, useMemo } from 'react';
import { useUiStore, selectSoundEnabled } from '../store/uiStore';
import * as sfx from '../services/audio.service';

export function useAudio() {
  const enabled = useUiStore(selectSoundEnabled);

  const place       = useCallback(() => { if (enabled) sfx.sfxPlace(); },       [enabled]);
  const clear       = useCallback(() => { if (enabled) sfx.sfxClear(); },       [enabled]);
  const combo       = useCallback((multiplier: number) => { if (enabled) sfx.sfxCombo(multiplier); }, [enabled]);
  const achievement = useCallback(() => { if (enabled) sfx.sfxAchievement(); }, [enabled]);
  const click       = useCallback(() => { if (enabled) sfx.sfxClick(); },       [enabled]);
  const error       = useCallback(() => { if (enabled) sfx.sfxError(); },       [enabled]);
  const gameOver    = useCallback(() => { if (enabled) sfx.sfxGameOver(); },    [enabled]);
  const newBest     = useCallback(() => { if (enabled) sfx.sfxNewBest(); },     [enabled]);

  // See useHaptics.ts for why the returned object itself must be
  // memoized, not just the individual methods.
  return useMemo(
    () => ({ place, clear, combo, achievement, click, error, gameOver, newBest }),
    [place, clear, combo, achievement, click, error, gameOver, newBest],
  );
}
