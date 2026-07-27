// ============================================================
// firebaseConfig.ts
// Aura Square — Firebase readiness check (NO SDK import)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// This file deliberately imports NOTHING from the Firebase SDK.
// It's safe to import from anywhere (e.g. on every render of
// LeaderboardPage, to decide whether to show a lock icon) without
// ever pulling in the ~300KB+ vendor-firebase chunk. The actual
// SDK only loads via firestore.service.ts, which itself is only
// reached through a dynamic import — see LeaderboardPage.tsx.

export function isFirebaseReady(): boolean {
  const pid = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '';
  return pid.length > 0 && pid !== 'demo-project';
}
