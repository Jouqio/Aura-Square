// ============================================================
// firebase.ts
// Aura Square — Firebase SDK initialization (Firestore only)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Phase 6 is zero-auth: only Firestore is used (for the optional
// online leaderboard). We deliberately do NOT initialize Firebase
// Auth here — calling getAuth() eagerly validates the API key
// format immediately and throws if it's a placeholder/demo value,
// which would crash the entire app on import. Firestore's
// getFirestore() does not validate eagerly, so it's safe even
// with demo/placeholder config values — it simply fails silently
// per-request, which firestore.service.ts already handles.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';

// ── Firebase config (from environment variables) ─────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
} as const;

// ── Singleton initialization (safe for HMR / SSR) ────────────
function createFirebaseApp(): FirebaseApp {
  const existingApps = getApps();
  if (existingApps.length > 0) return existingApps[0] as FirebaseApp;
  return initializeApp(firebaseConfig);
}

// ── Exported singletons ───────────────────────────────────────
export const app: FirebaseApp = createFirebaseApp();
export const db:  Firestore   = getFirestore(app);

// ── Emulator connection (development only) ────────────────────
if (import.meta.env.VITE_APP_ENV === 'development' &&
    import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.info('[Firebase] Connected to local Firestore emulator');
  } catch {
    // Already connected — ignore during HMR
  }
}
