// ============================================================
// firestore.service.ts — V3 Track C
// Aura Square — Firestore helpers (graceful offline)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// PERFORMANCE NOTE: this file uses clean, fully tree-shakeable
// STATIC imports from the Firebase SDK — that's intentional and
// important. Dynamic-importing the SDK from *inside* this file
// (an earlier attempt) actually made the bundle LARGER, because
// `import('firebase/firestore')` captures the whole module
// namespace and Rollup can no longer tree-shake unused exports
// the way it can with named static imports.
//
// The lazy-loading instead happens at the CONSUMER side: this
// entire module is only ever reached via a dynamic
// `import('./firestore.service')` in LeaderboardPage.tsx, run
// only when the player opens an online tab. isFirebaseReady() is
// re-exported from firebaseConfig.ts (zero SDK cost) so UI code
// can check it on every render without ever triggering this
// module — and therefore the Firebase SDK — to load.

import {
  collection, doc, setDoc, getDoc,
  getDocs, query, orderBy, limit,
  onSnapshot, serverTimestamp,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

import { isFirebaseReady } from './firebaseConfig';

export interface OnlineEntry {
  uid:         string;
  displayName: string;
  score:       number;
  date:        string;
  submittedAt: number;
}

const LEADERBOARD_PATH = (date: string) => `leaderboard_daily/${date}/entries`;

export async function submitDailyScore(
  uid: string, displayName: string, score: number, date: string,
): Promise<void> {
  if (!isFirebaseReady()) return;
  try {
    const ref = doc(db as Firestore, LEADERBOARD_PATH(date), uid);
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data() as OnlineEntry).score : 0;
    if (score <= existing) return;
    await setDoc(ref, {
      uid, displayName, score, date,
      submittedAt: Date.now(), serverTime: serverTimestamp(),
    });
  } catch { /* offline — silent */ }
}

export async function getDailyTopScores(date: string, n = 20): Promise<OnlineEntry[]> {
  if (!isFirebaseReady()) return [];
  try {
    const q = query(
      collection(db as Firestore, LEADERBOARD_PATH(date)),
      orderBy('score', 'desc'), limit(n),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as OnlineEntry);
  } catch { return []; }
}

export function subscribeDailyScores(
  date: string, callback: (entries: OnlineEntry[]) => void, n = 20,
): Unsubscribe {
  if (!isFirebaseReady()) { callback([]); return () => {}; }
  try {
    const q = query(
      collection(db as Firestore, LEADERBOARD_PATH(date)),
      orderBy('score', 'desc'), limit(n),
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => d.data() as OnlineEntry));
    }, () => callback([]));
  } catch { callback([]); return () => {}; }
}

export async function getAllTimeTopScores(n = 20): Promise<OnlineEntry[]> {
  if (!isFirebaseReady()) return [];
  try {
    const q = query(
      collection(db as Firestore, 'leaderboard_alltime'),
      orderBy('score', 'desc'), limit(n),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as OnlineEntry);
  } catch { return []; }
}

export async function submitAllTimeScore(
  uid: string, displayName: string, score: number,
): Promise<void> {
  if (!isFirebaseReady()) return;
  try {
    const ref  = doc(db as Firestore, 'leaderboard_alltime', uid);
    const snap = await getDoc(ref);
    const prev = snap.exists() ? (snap.data() as OnlineEntry).score : 0;
    if (score <= prev) return;
    await setDoc(ref, {
      uid, displayName, score,
      date: new Date().toISOString().slice(0, 10),
      submittedAt: Date.now(),
    });
  } catch { /* offline — silent */ }
}
