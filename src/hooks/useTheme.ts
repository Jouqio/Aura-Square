// ============================================================
// useTheme.ts
// Aura Square — Theme System V2 control hook
// Owner: Syauqi Nuzul Abdi
// ============================================================

import { useCallback } from 'react';
import {
  useUiStore,
  selectTheme,
  selectResolvedTheme,
  selectLocale,
  selectSoundEnabled,
  selectMusicEnabled,
  selectVibrationEnabled,
  selectReducedMotion,
} from '../store/uiStore';
import type { AppTheme, AppLocale, ResolvedTheme } from '../types/user.types';

interface UseThemeReturn {
  theme:            AppTheme;
  resolvedTheme:    ResolvedTheme;
  isDark:           boolean;
  locale:           AppLocale;
  soundEnabled:     boolean;
  musicEnabled:     boolean;
  vibrationEnabled: boolean;
  reducedMotion:    boolean;

  setTheme:      (theme: AppTheme) => void;
  toggleTheme:   () => void;
  setLocale:     (locale: AppLocale) => void;
  toggleLocale:  () => void;
  setSound:      (v: boolean) => void;
  setMusic:      (v: boolean) => void;
  setVibration:  (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
}

export function useTheme(): UseThemeReturn {
  const theme            = useUiStore(selectTheme);
  const resolvedTheme    = useUiStore(selectResolvedTheme);
  const locale           = useUiStore(selectLocale);
  const soundEnabled     = useUiStore(selectSoundEnabled);
  const musicEnabled     = useUiStore(selectMusicEnabled);
  const vibrationEnabled = useUiStore(selectVibrationEnabled);
  const reducedMotion    = useUiStore(selectReducedMotion);
  const setThemeStore    = useUiStore((s) => s.setTheme);
  const setLocaleStore   = useUiStore((s) => s.setLocale);
  const setSoundStore    = useUiStore((s) => s.setSoundEnabled);
  const setMusicStore    = useUiStore((s) => s.setMusicEnabled);
  const setVibrationStore= useUiStore((s) => s.setVibrationEnabled);
  const setReducedMotionStore = useUiStore((s) => s.setReducedMotion);

  const setLocale = useCallback((loc: AppLocale) => {
    setLocaleStore(loc);
  }, [setLocaleStore]);

  const toggleTheme = useCallback(() => {
    // Cycle through the 3 named presets (skips 'system' — that's
    // an explicit opt-in from Settings, not part of the quick cycle)
    const next: Record<AppTheme, AppTheme> = {
      'dark-aura':  'light-aura',
      'light-aura': 'green-aura',
      'green-aura': 'dark-aura',
      'system':     'dark-aura',
    };
    setThemeStore(next[theme]);
  }, [theme, setThemeStore]);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'id' : 'en');
  }, [locale, setLocale]);

  return {
    theme,
    resolvedTheme,
    isDark:       resolvedTheme !== 'light-aura',
    locale,
    soundEnabled,
    musicEnabled,
    vibrationEnabled,
    reducedMotion,
    setTheme:     setThemeStore,
    toggleTheme,
    setLocale,
    toggleLocale,
    setSound:     setSoundStore,
    setMusic:     setMusicStore,
    setVibration: setVibrationStore,
    setReducedMotion: setReducedMotionStore,
  };
}
