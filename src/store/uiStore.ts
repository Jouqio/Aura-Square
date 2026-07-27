// uiStore.ts — Phase 8 (Theme V2) + V3 (Accessibility: reduced motion + vibration toggle)
import { create }                     from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppTheme, AppLocale, ResolvedTheme,
} from '../types/user.types';

interface UiState {
  theme:          AppTheme;
  resolvedTheme:  ResolvedTheme;
  locale:         AppLocale;
  soundEnabled:   boolean;
  musicEnabled:   boolean;
  vibrationEnabled: boolean;
  /** Explicit in-app override — when true, motion is reduced
   *  REGARDLESS of the OS-level prefers-reduced-motion setting.
   *  When false, the OS preference (if any) still applies via
   *  CSS media query + MotionConfig — this toggle only adds a
   *  forced ON, it never forces things OFF against the OS pref. */
  reducedMotion:  boolean;
  globalLoading:  boolean;
  activeModal:    string | null;
  /** Distinct resolved themes the player has ever selected —
   *  powers the "Penjelajah Tema" badge. Never shrinks. */
  themesTried:    ResolvedTheme[];

  setTheme:           (t: AppTheme)      => void;
  setResolvedTheme:   (t: ResolvedTheme) => void;
  setLocale:          (l: AppLocale)     => void;
  setSoundEnabled:    (v: boolean)       => void;
  setMusicEnabled:    (v: boolean)       => void;
  setVibrationEnabled:(v: boolean)       => void;
  setReducedMotion:   (v: boolean)       => void;
  setGlobalLoading:   (v: boolean)       => void;
  openModal:          (id: string)       => void;
  closeModal:         ()                 => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme:         'dark-aura',
      resolvedTheme: 'dark-aura',
      locale:        'id',
      soundEnabled:  true,
      musicEnabled:  true,
      vibrationEnabled: true,
      reducedMotion:    false,
      globalLoading: false,
      activeModal:   null,
      themesTried:   ['dark-aura'],

      setTheme:        (theme)         => set({ theme }),
      setResolvedTheme:(resolvedTheme) => set((s) => ({
        resolvedTheme,
        themesTried: s.themesTried.includes(resolvedTheme)
          ? s.themesTried
          : [...s.themesTried, resolvedTheme],
      })),
      setLocale:           (locale)           => set({ locale }),
      setSoundEnabled:     (soundEnabled)      => set({ soundEnabled }),
      setMusicEnabled:     (musicEnabled)      => set({ musicEnabled }),
      setVibrationEnabled: (vibrationEnabled)  => set({ vibrationEnabled }),
      setReducedMotion:    (reducedMotion)     => set({ reducedMotion }),
      setGlobalLoading:    (globalLoading)     => set({ globalLoading }),
      openModal:           (id)                => set({ activeModal: id }),
      closeModal:          ()                  => set({ activeModal: null }),
    }),
    {
      name:    'aura-ui-prefs',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme:            s.theme,
        locale:           s.locale,
        soundEnabled:     s.soundEnabled,
        musicEnabled:     s.musicEnabled,
        vibrationEnabled: s.vibrationEnabled,
        reducedMotion:    s.reducedMotion,
        themesTried:      s.themesTried,
      }),
      // Migrate old 'dark'/'light' values (pre-V2) to the new
      // named Aura theme presets so existing users don't get an
      // invalid/blank theme after the upgrade.
      migrate: (persisted: any) => {
        if (persisted?.theme === 'dark')  persisted.theme = 'dark-aura';
        if (persisted?.theme === 'light') persisted.theme = 'light-aura';
        if (!Array.isArray(persisted?.themesTried)) {
          persisted.themesTried = persisted?.theme ? [persisted.theme] : ['dark-aura'];
        }
        if (typeof persisted?.vibrationEnabled !== 'boolean') persisted.vibrationEnabled = true;
        if (typeof persisted?.reducedMotion    !== 'boolean') persisted.reducedMotion    = false;
        return persisted;
      },
      version: 4,
    },
  ),
);

export const selectTheme            = (s: UiState) => s.theme;
export const selectResolvedTheme    = (s: UiState) => s.resolvedTheme;
export const selectLocale           = (s: UiState) => s.locale;
export const selectSoundEnabled     = (s: UiState) => s.soundEnabled;
export const selectMusicEnabled     = (s: UiState) => s.musicEnabled;
export const selectVibrationEnabled = (s: UiState) => s.vibrationEnabled;
export const selectReducedMotion    = (s: UiState) => s.reducedMotion;
export const selectActiveModal      = (s: UiState) => s.activeModal;
export const selectThemesTried      = (s: UiState) => s.themesTried;
