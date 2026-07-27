// ============================================================
// statsStore.ts — V3 Track B (Replayability & Engagement)
// Aura Square — Game statistics (offline, localStorage persisted)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// New in V3 Track B:
//  - playStreak / bestPlayStreak: consecutive CALENDAR DAYS with
//    at least one game played (any game — independent from the
//    Daily Challenge-specific streak in dailyStore.ts).
//  - bestSessionStreak: longest run of consecutive games played
//    back-to-back via "Main Lagi" without returning to Home.
//    (current session streak itself lives in GamePage as a ref —
//    only the all-time BEST is persisted here.)
//  - pieceFrequency: how many times each piece preset has been
//    placed, used to surface the player's "favorite piece".

import { create }                     from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────

export interface GameRecord {
  id:           string;
  score:        number;
  date:         number;   // Unix ms
  piecesPlaced: number;
  linesCleared: number;
  duration:     number;   // ms
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

interface StatsState {
  // Aggregates
  totalGames:        number;
  bestScore:         number;
  totalScore:        number;
  totalLinesCleared: number;
  totalPiecesPlaced: number;

  // Daily play streak (any game, any day — NOT daily-challenge-specific)
  lastPlayedDate: string | null;
  playStreak:     number;
  bestPlayStreak: number;

  // Session streak (consecutive "Main Lagi" without leaving)
  bestSessionStreak: number;

  // Favorite piece tracking — presetId -> times placed
  pieceFrequency: Record<number, number>;

  // History (last 50 games)
  history: GameRecord[];

  // Actions
  addRecord:              (r: Omit<GameRecord, 'id'>) => void;
  clearHistory:           ()                          => void;
  recordPiecePlaced:      (presetId: number)          => void;
  reportSessionStreak:    (streak: number)            => void;

  // Derived (computed)
  averageScore:    () => number;
  favoritePiece:   () => { presetId: number; count: number } | null;
}

// ── Store ─────────────────────────────────────────────────────

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      totalGames:        0,
      bestScore:         0,
      totalScore:        0,
      totalLinesCleared: 0,
      totalPiecesPlaced: 0,

      lastPlayedDate: null,
      playStreak:     0,
      bestPlayStreak: 0,

      bestSessionStreak: 0,

      pieceFrequency: {},

      history: [],

      addRecord: (r) =>
        set((s) => {
          const record: GameRecord = { ...r, id: `${Date.now()}-${Math.random()}` };
          const history = [record, ...s.history].slice(0, 50);

          // Daily play streak — increments only once per calendar
          // day, regardless of how many games are played that day.
          const today = todayStr();
          let playStreak = s.playStreak;
          if (s.lastPlayedDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const wasYesterday = s.lastPlayedDate === yesterday.toISOString().slice(0, 10);
            playStreak = wasYesterday ? s.playStreak + 1 : 1;
          }

          return {
            totalGames:        s.totalGames + 1,
            bestScore:         Math.max(s.bestScore, r.score),
            totalScore:        s.totalScore + r.score,
            totalLinesCleared: s.totalLinesCleared + r.linesCleared,
            totalPiecesPlaced: s.totalPiecesPlaced + r.piecesPlaced,
            history,
            lastPlayedDate:    today,
            playStreak,
            bestPlayStreak:    Math.max(s.bestPlayStreak, playStreak),
          };
        }),

      clearHistory: () =>
        set({
          totalGames: 0, bestScore: 0, totalScore: 0,
          totalLinesCleared: 0, totalPiecesPlaced: 0, history: [],
          lastPlayedDate: null, playStreak: 0, bestPlayStreak: 0,
          bestSessionStreak: 0, pieceFrequency: {},
        }),

      recordPiecePlaced: (presetId) =>
        set((s) => ({
          pieceFrequency: {
            ...s.pieceFrequency,
            [presetId]: (s.pieceFrequency[presetId] ?? 0) + 1,
          },
        })),

      reportSessionStreak: (streak) =>
        set((s) => ({
          bestSessionStreak: Math.max(s.bestSessionStreak, streak),
        })),

      averageScore: () => {
        const s = get();
        return s.totalGames > 0
          ? Math.round(s.totalScore / s.totalGames)
          : 0;
      },

      favoritePiece: () => {
        const freq = get().pieceFrequency;
        const entries = Object.entries(freq);
        if (entries.length === 0) return null;
        const [presetId, count] = entries.reduce((best, cur) =>
          cur[1] > best[1] ? cur : best);
        return { presetId: Number(presetId), count };
      },
    }),
    {
      name:    'aura-stats-v1',
      storage: createJSONStorage(() => localStorage),
      version: 2, // v2 adds streak + piece-frequency tracking
    },
  ),
);

// Selectors
export const selectStatsBestScore   = (s: StatsState) => s.bestScore;
export const selectTotalGames       = (s: StatsState) => s.totalGames;
export const selectHistory          = (s: StatsState) => s.history;
export const selectStatsLoaded      = (s: StatsState) => s.totalGames >= 0;
export const selectPlayStreak       = (s: StatsState) => s.playStreak;
export const selectBestPlayStreak   = (s: StatsState) => s.bestPlayStreak;
export const selectBestSessionStreak= (s: StatsState) => s.bestSessionStreak;
