// ============================================================
// usePwaUpdate.ts
// Aura Square — Service Worker update notification
// Owner: Syauqi Nuzul Abdi
// ============================================================
// With registerType: 'autoUpdate' + injectRegister: false (see
// vite.config.ts), Aura Square registers its service worker
// manually via this hook instead of an auto-injected script tag.
// This lets us surface two states to the player that were
// previously silent:
//
//   1. needRefresh — a new version has been downloaded in the
//      background and is waiting to activate. Without telling the
//      player, they'd keep using the OLD cached version until they
//      happen to fully close and reopen the app — potentially for
//      days. We show a toast with a "Refresh" action instead.
//
//   2. offlineReady — first-time install confirmation that all
//      assets are now cached and the app will work without a
//      network connection from here on.
//
// TYPE NOTE: 'virtual:pwa-register/react' is a build-time virtual
// module supplied by vite-plugin-pwa — it only resolves during the
// actual Vite build/dev server, which is why the import is declared
// via the plugin's own type declarations (see vite-env.d.ts).

import { useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function usePwaUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Poll for updates periodically while the app is open, since
      // a long-lived open tab would otherwise only check for a new
      // service worker on the browser's own schedule (typically on
      // navigation), which could be a long time for a single-page
      // app the player leaves open.
      if (!registration) return;
      const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly is plenty
      setInterval(() => {
        registration.update().catch(() => { /* offline — ignore */ });
      }, CHECK_INTERVAL_MS);
    },
  });

  const applyUpdate = useCallback(() => {
    updateServiceWorker(true); // true = reload the page once activated
  }, [updateServiceWorker]);

  const dismissOfflineReady = useCallback(() => {
    setOfflineReady(false);
  }, [setOfflineReady]);

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  return {
    needRefresh,
    offlineReady,
    applyUpdate,
    dismissUpdate,
    dismissOfflineReady,
  };
}
