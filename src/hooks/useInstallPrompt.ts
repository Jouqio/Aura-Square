// ============================================================
// useInstallPrompt.ts
// Aura Square — "Install App" button support
// Owner: Syauqi Nuzul Abdi
// ============================================================
// The browser only fires `beforeinstallprompt` (Android Chrome/
// Edge and some other Chromium browsers) if the app hasn't already
// been installed AND meets the PWA install criteria (valid
// manifest, service worker, HTTPS — all already true for Aura
// Square). We capture that event, prevent its default mini-infobar,
// and expose a `promptInstall()` function to trigger it from our
// own styled button instead.
//
// iOS Safari and some other browsers NEVER fire this event (no
// programmatic install API exists there) — installation is only
// possible via Share → "Add to Home Screen", a manual OS-level
// flow we can't trigger from JS. We detect iOS separately so the
// UI can show manual instructions instead of a button that would
// otherwise silently do nothing.

import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    // iPadOS 13+ reports as "MacIntel" but has touch support, unlike real Macs
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    // iOS Safari's own (non-standard) flag for "launched from home screen"
    || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // The captured event can only be used once — clear it regardless
    // of outcome so the UI reflects that a fresh prompt isn't available
    // until the browser fires the event again (if ever).
    setDeferredPrompt(null);
    return outcome;
  }, [deferredPrompt]);

  return {
    /** True once the app is confirmed running in standalone/installed mode. */
    installed,
    /** True when the native install prompt is available RIGHT NOW (Android Chrome/Edge etc). */
    canPromptInstall: deferredPrompt !== null,
    /** True on iOS, where installation is manual-only (Share → Add to Home Screen) —
     *  never has a programmatic prompt, so the UI should show instructions instead. */
    isIosManualInstall: isIos() && !installed,
    promptInstall,
  };
}
