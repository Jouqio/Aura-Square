// ============================================================
// ThemeProvider.tsx
// Aura Square — Theme System V2 (Dark / Light / Green Aura)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Applies one of three named theme classes to <html>:
//   .theme-dark-aura | .theme-light-aura | .theme-green-aura
// 'system' resolves to dark-aura or light-aura based on OS
// preference (green-aura is always an explicit user choice).
// Persisted via uiStore + localStorage.

import React, { useEffect } from 'react';
import { useUiStore, selectTheme, selectResolvedTheme } from '../store/uiStore';
import type { ResolvedTheme } from '../types/user.types';

const DARK_MQ = window.matchMedia('(prefers-color-scheme: dark)');

function getSystemTheme(): ResolvedTheme {
  return DARK_MQ.matches ? 'dark-aura' : 'light-aura';
}

const THEME_META_COLOR: Record<ResolvedTheme, string> = {
  'dark-aura':  '#050816',
  'light-aura': '#f8fafc',
  'green-aura': '#07120c',
};

const ALL_THEME_CLASSES = ['theme-dark-aura', 'theme-light-aura', 'theme-green-aura'];

function applyThemeToDOM(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.remove(...ALL_THEME_CLASSES, 'dark', 'light');
  root.classList.add(`theme-${resolved}`);
  // Keep a plain 'dark'/'light' class too for any third-party
  // component (e.g. native form controls) that only understands
  // the binary color-scheme distinction.
  root.classList.add(resolved === 'light-aura' ? 'light' : 'dark');
  root.style.colorScheme = resolved === 'light-aura' ? 'light' : 'dark';
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const theme          = useUiStore(selectTheme);
  const resolvedTheme  = useUiStore(selectResolvedTheme);
  const setResolved    = useUiStore((s) => s.setResolvedTheme);

  // ── Resolve theme and apply to DOM ───────────────────────────
  useEffect(() => {
    const resolved: ResolvedTheme =
      theme === 'system' ? getSystemTheme() : theme;

    setResolved(resolved);
    applyThemeToDOM(resolved);
  }, [theme, setResolved]);

  // ── Listen for system preference changes (only matters when
  //    the user has explicitly chosen 'system') ─────────────────
  useEffect(() => {
    if (theme !== 'system') return;

    const handler = (e: MediaQueryListEvent) => {
      const resolved: ResolvedTheme = e.matches ? 'dark-aura' : 'light-aura';
      setResolved(resolved);
      applyThemeToDOM(resolved);
    };

    DARK_MQ.addEventListener('change', handler);
    return () => DARK_MQ.removeEventListener('change', handler);
  }, [theme, setResolved]);

  // ── Meta theme-color sync (browser chrome / status bar) ───────
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = THEME_META_COLOR[resolvedTheme];
  }, [resolvedTheme]);

  return <>{children}</>;
}
