// ============================================================
// capacitor.config.ts
// Aura Square — Native wrapper readiness (Capacitor)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// IMPORTANT: this file alone does NOT produce an installable app.
// Capacitor needs native build tooling (Xcode for iOS, Android
// Studio + Android SDK for Android) that only exists on YOUR local
// machine — this sandboxed environment has neither, so the actual
// `npx cap add ios` / `npx cap add android` / `npx cap sync` /
// `npx cap open ios|android` commands must be run locally. See
// README.md → "Membungkus ke Native (Capacitor)" for the exact
// step-by-step.
//
// What THIS file does: pre-configures Capacitor correctly for
// when you do run those commands, so the wrap "just works" against
// this project's actual build output, app id, and theming.

import type { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId:   'com.syauqinuzulabdi.aurasquare',
  appName: 'Aura Square',

  // Capacitor serves the already-built static SPA from here —
  // matches Vite's `build.outDir` (see vite.config.ts).
  webDir: 'dist',

  // Keep the same offline-first behavior inside the native shell:
  // no special server config needed since the app is fully static
  // and works without a network connection.
  server: {
    androidScheme: 'https',
  },

  plugins: {
    SplashScreen: {
      // Matches the in-app JS splash already in index.html, so
      // the native splash → web splash handoff is visually
      // seamless instead of a color flash.
      backgroundColor:        '#0B0C14',
      showSpinner:            false,
      androidSpinnerStyle:    'none',
      splashFullScreen:       true,
      splashImmersive:        true,
      launchAutoHide:         true,
      launchShowDuration:     800, // matches index.html's splash timing
    },
    StatusBar: {
      style:           'DARK',
      backgroundColor: '#0B0C14',
    },
  },
};

export default config;
