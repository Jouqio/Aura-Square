// ============================================================
// achievementStore.ts
// Aura Square Phase 4.0 — Achievement state
// Owner: Syauqi Nuzul Abdi
// ============================================================

import { create }                     from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ACHIEVEMENTS }               from '../constants/achievement.constants';
import type { AchievementIconKey }    from '../components/achievements/AchievementIcons';

// ── Types ─────────────────────────────────────────────────────

export interface UnlockedAchievement {
  id:         string;
  unlockedAt: number; // Unix ms
  notified:   boolean;
}

export interface NewUnlock {
  id:         string;
  title:      string;
  icon:       AchievementIconKey;
  points:     number;
}

interface AchievementState {
  unlocked:       UnlockedAchievement[];
  maxComboEver:   number;
  longestSession: number;
  pendingToast:   NewUnlock | null;

  // Actions
  unlock:          (id: string) => void;
  markNotified:    (id: string) => void;
  updateMaxCombo:  (combo: number) => void;
  updateSession:   (ms: number) => void;
  clearToast:      () => void;
  checkAndUnlock:  (ids: string[], defs: typeof ACHIEVEMENTS) => NewUnlock[];
}

// ── Store ─────────────────────────────────────────────────────

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked:       [],
      maxComboEver:   0,
      longestSession: 0,
      pendingToast:   null,

      unlock: (id) =>
        set((s) => {
          if (s.unlocked.some((u) => u.id === id)) return s;
          return {
            unlocked: [
              ...s.unlocked,
              { id, unlockedAt: Date.now(), notified: false },
            ],
          };
        }),

      markNotified: (id) =>
        set((s) => ({
          unlocked: s.unlocked.map((u) =>
            u.id === id ? { ...u, notified: true } : u,
          ),
        })),

      updateMaxCombo: (combo) =>
        set((s) => {
          const next = Math.max(s.maxComboEver, combo);
          // Skip update entirely if nothing actually changes — avoids
          // creating a new store reference (and re-rendering subscribers)
          // for no reason, which can cascade into update loops in
          // consumers that depend on this store's identity.
          return next === s.maxComboEver ? s : { maxComboEver: next };
        }),

      updateSession: (ms) =>
        set((s) => {
          const next = Math.max(s.longestSession, ms);
          return next === s.longestSession ? s : { longestSession: next };
        }),

      clearToast: () => set({ pendingToast: null }),

      checkAndUnlock: (ids, defs) => {
        const newUnlocks: NewUnlock[] = [];
        const state = get();

        for (const id of ids) {
          if (state.unlocked.some((u) => u.id === id)) continue;
          const def = defs.find((d) => d.id === id);
          if (!def) continue;

          state.unlock(id);
          newUnlocks.push({
            id:     def.id,
            title:  def.title,
            icon:   def.icon,
            points: def.points,
          });
        }

        if (newUnlocks.length > 0) {
          set({ pendingToast: newUnlocks[0] ?? null });
        }

        return newUnlocks;
      },
    }),
    {
      name:    'aura-achievements-v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Selectors
export const selectUnlocked      = (s: AchievementState) => s.unlocked;
export const selectUnlockedCount = (s: AchievementState) => s.unlocked.length;
export const selectPendingToast  = (s: AchievementState) => s.pendingToast;
export const selectIsUnlocked    = (id: string) =>
  (s: AchievementState) => s.unlocked.some((u) => u.id === id);
export const selectTotalPoints   = (s: AchievementState) =>
  ACHIEVEMENTS.filter((a) => s.unlocked.some((u) => u.id === a.id))
    .reduce((sum, a) => sum + a.points, 0);
