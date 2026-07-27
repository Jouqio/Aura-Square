// ============================================================
// dailyStore.ts
// Aura Square Phase 5 — Daily Challenge state
// Owner: Syauqi Nuzul Abdi
// ============================================================

import { create }                     from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type DailyRank = 'bronze' | 'silver' | 'gold';

export interface DailyCompletion {
  date:        string;
  score:       number;
  rank:        DailyRank | null;
  completedAt: number;
}

interface DailyState {
  completions: Record<string, DailyCompletion>;
  bestStreak:  number;
  addCompletion: (date: string, score: number) => void;
  getCompletion: (date: string) => DailyCompletion | null;
  getStreak:     ()             => number;
  getTodayStr:   ()             => string;
  getTodaySeed:  ()             => number;
}

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getSeedForDate(dateStr: string): number {
  return parseInt(dateStr.replace(/-/g, ''), 10);
}

export function calcRank(score: number): DailyRank | null {
  if (score >= 600) return 'gold';
  if (score >= 300) return 'silver';
  if (score >= 100) return 'bronze';
  return null;
}

export const RANK_THRESHOLDS = { bronze: 100, silver: 300, gold: 600 } as const;
export const RANK_LABELS: Record<DailyRank, string> = {
  bronze: 'Perunggu', silver: 'Perak', gold: 'Emas',
};
export const RANK_COLORS: Record<DailyRank, string> = {
  bronze: '#CD7F32', silver: '#C0C0C0', gold: '#F5C842',
};

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => {
      // Pure helper — no side effects. Safe to call from render
      // (e.g. via `useDailyStore(s => s.getStreak())`).
      const computeStreak = (completions: Record<string, DailyCompletion>): number => {
        let streak = 0;
        const d = new Date();
        const today = getTodayString();
        if (!completions[today]) d.setDate(d.getDate() - 1);
        for (let i = 0; i < 365; i++) {
          const key = d.toISOString().slice(0, 10);
          if (completions[key]) { streak++; d.setDate(d.getDate() - 1); }
          else break;
        }
        return streak;
      };

      return {
        completions: {},
        bestStreak:  0,

        addCompletion: (date, score) =>
          set((s) => {
            const completions = {
              ...s.completions,
              [date]: { date, score, rank: calcRank(score), completedAt: Date.now() },
            };
            // bestStreak only ever needs recomputing right after a
            // completion is added (streak is a pure function of
            // `completions`, which only changes here) — so updating
            // it as part of THIS action, rather than as a side
            // effect inside a render-time getter, is both correct
            // and safe (no setState-during-render risk).
            const newStreak = computeStreak(completions);
            return {
              completions,
              bestStreak: Math.max(s.bestStreak, newStreak),
            };
          }),

        getCompletion: (date) => get().completions[date] ?? null,
        getTodayStr:   () => getTodayString(),
        getTodaySeed:  () => getSeedForDate(getTodayString()),
        getStreak:     () => computeStreak(get().completions),
      };
    },
    { name: 'aura-daily-v1', storage: createJSONStorage(() => localStorage) },
  ),
);
