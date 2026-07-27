// ============================================================
// weeklyStore.ts
// Aura Square — Weekly Challenge (separate from Daily, bigger reward)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Mirrors dailyStore's seeded-single-attempt mechanic, but keyed
// by ISO week instead of calendar day, with higher score
// thresholds and a bigger XP payout — a slower, more impactful
// rhythm of engagement alongside the Daily Challenge.

import { create }                     from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WeeklyRank = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface WeeklyCompletion {
  week:        string; // 'YYYY-Www'
  score:       number;
  rank:        WeeklyRank | null;
  completedAt: number;
}

/** ISO-ish week id: 'YYYY-Www' (Monday-start weeks, good enough
 *  for a deterministic per-week seed — doesn't need to be
 *  calendar-standard-compliant, just stable and unique). */
export function getWeekString(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const weekNum = 1 + Math.round(
    ((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function getSeedForWeek(weekStr: string): number {
  // Hash the week string into a stable positive integer.
  let hash = 0;
  for (let i = 0; i < weekStr.length; i++) {
    hash = (hash * 31 + weekStr.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function calcWeeklyRank(score: number): WeeklyRank | null {
  if (score >= 1800) return 'platinum';
  if (score >= 1000) return 'gold';
  if (score >= 500)  return 'silver';
  if (score >= 200)  return 'bronze';
  return null;
}

export const WEEKLY_THRESHOLDS = { bronze: 200, silver: 500, gold: 1000, platinum: 1800 } as const;
export const WEEKLY_LABELS: Record<WeeklyRank, string> = {
  bronze: 'Perunggu', silver: 'Perak', gold: 'Emas', platinum: 'Platinum',
};
export const WEEKLY_COLORS: Record<WeeklyRank, string> = {
  bronze: '#CD7F32', silver: '#C0C0C0', gold: '#F5C842', platinum: '#a7f3d0',
};

/** XP reward — roughly 4x the equivalent Daily Challenge bonus,
 *  reflecting the once-a-week cadence. */
export function xpFromWeeklyRank(rank: WeeklyRank | null): number {
  const base = 60;
  const bonus = rank === 'platinum' ? 220
    : rank === 'gold'     ? 140
    : rank === 'silver'   ? 80
    : rank === 'bronze'   ? 40
    : 0;
  return base + bonus;
}

/** Returns the ms remaining until the next ISO week starts (Monday 00:00). */
export function msUntilNextWeek(): number {
  const now = new Date();
  const dayNum = (now.getDay() + 6) % 7; // Mon=0..Sun=6
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + (7 - dayNum));
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.getTime() - now.getTime();
}

interface WeeklyState {
  completions: Record<string, WeeklyCompletion>;

  addCompletion: (week: string, score: number) => void;
  getCompletion: (week: string) => WeeklyCompletion | null;
  getThisWeekStr: () => string;
  getThisWeekSeed: () => number;
}

export const useWeeklyStore = create<WeeklyState>()(
  persist(
    (set, get) => ({
      completions: {},

      addCompletion: (week, score) =>
        set((s) => ({
          completions: {
            ...s.completions,
            [week]: { week, score, rank: calcWeeklyRank(score), completedAt: Date.now() },
          },
        })),

      getCompletion:   (week) => get().completions[week] ?? null,
      getThisWeekStr:  () => getWeekString(),
      getThisWeekSeed: () => getSeedForWeek(getWeekString()),
    }),
    { name: 'aura-weekly-v1', storage: createJSONStorage(() => localStorage) },
  ),
);
