// ============================================================
// useBgm.ts
// Aura Square — Background music toggle wiring
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Bridges the `musicEnabled` setting (Settings page toggle) to the
// actual bgm.service playback. This is the piece that was
// previously MISSING — the toggle existed and persisted a value,
// but nothing ever read it to start/stop any audio.
//
// BROWSER AUTOPLAY POLICY: browsers block audio (including
// AudioContext) from making sound until the page has received a
// user gesture (click/tap/keypress). So even with musicEnabled
// already true from a previous session, music can't just start
// automatically on page load — it starts on the first tap/click
// anywhere in the app, IF musicEnabled is true at that point.
// This hook listens for that first-interaction moment app-wide.

import { useEffect, useRef } from 'react';
import { useUiStore, selectMusicEnabled } from '../store/uiStore';
import { startBgm, stopBgm } from '../services/bgm.service';

export function useBgm(): void {
  const musicEnabled = useUiStore(selectMusicEnabled);
  const hasInteracted = useRef(false);

  // Start/stop playback whenever the toggle changes (only takes
  // effect for real once the user has interacted at least once —
  // see the interaction listener effect below).
  useEffect(() => {
    if (!hasInteracted.current) return;
    if (musicEnabled && document.visibilityState === 'visible') startBgm();
    else stopBgm();
  }, [musicEnabled]);

  // Pause music while the tab is hidden/backgrounded (switched tabs,
  // minimized, screen locked) and resume it when the player comes
  // back — without this, a backgrounded tab keeps generating audio
  // indefinitely (wasted battery), and if the player has multiple
  // tabs of the app open, an unpaused background tab would overlap
  // audibly with whichever tab is actually in focus.
  useEffect(() => {
    const handleVisibility = () => {
      if (!hasInteracted.current) return;
      if (document.visibilityState === 'hidden') {
        stopBgm();
      } else if (musicEnabled) {
        startBgm();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [musicEnabled]);

  // One-time listener: on the very first user interaction anywhere
  // in the app, start music if the setting is already enabled. This
  // satisfies the browser autoplay gesture requirement without
  // forcing the player through any "tap to enable sound" splash
  // screen — it just quietly starts as soon as it's allowed to.
  useEffect(() => {
    if (hasInteracted.current) return;

    const handleFirstInteraction = () => {
      if (hasInteracted.current) return;
      hasInteracted.current = true;
      if (musicEnabled && document.visibilityState === 'visible') startBgm();
      cleanup();
    };

    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown'];
    events.forEach((ev) => window.addEventListener(ev, handleFirstInteraction, { once: true }));

    function cleanup() {
      events.forEach((ev) => window.removeEventListener(ev, handleFirstInteraction));
    }

    return cleanup;
    // Deliberately only runs once on mount — `musicEnabled` is read
    // fresh at interaction time via closure, and the toggle-driven
    // effect above handles all SUBSEQUENT changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
