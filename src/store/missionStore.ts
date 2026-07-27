// ============================================================
// missionStore.ts
// Aura Square — Daily Mission Board progress (Daily Challenge V2)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import { create }                     from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  pickDailyMissions, ALL_MISSIONS_BONUS_XP,
  type MissionTemplate, type MissionType,
} from '../constants/mission.constants';
import { getTodayString, getSeedForDate } from './dailyStore';

export interface MissionProgress extends MissionTemplate {
  current:       number;
  completed:     boolean;
  rewardClaimed: boolean; // XP for this specific mission already granted
}

export interface GameResultForMissions {
  score:        number;
  linesCleared: number;
  piecesPlaced: number;
  maxCombo:     number;
}

interface MissionState {
  date:                 string;
  missions:             MissionProgress[];
  allBonusClaimed:      boolean;

  /** Regenerates today's missions if the stored date has rolled over. */
  ensureToday:    () => void;
  /**
   * Records one game's results against all of today's missions.
   * Returns { newlyCompleted, xpEarned, allJustCompleted } so the
   * caller can grant XP and show celebration UI without this store
   * needing to know about XP/audio/etc itself.
   */
  recordGame: (result: GameResultForMissions) => {
    newlyCompleted:   MissionProgress[];
    xpEarned:         number;
    allJustCompleted: boolean;
  };
}

function buildFreshMissions(date: string): MissionProgress[] {
  return pickDailyMissions(getSeedForDate(date)).map((m) => ({
    ...m,
    current:       0,
    completed:      false,
    rewardClaimed:  false,
  }));
}

function progressDelta(type: MissionType, current: number, result: GameResultForMissions): number {
  switch (type) {
    case 'play_games':    return current + 1;
    case 'clear_lines':   return current + result.linesCleared;
    case 'place_pieces':  return current + result.piecesPlaced;
    // "Peak" style missions — track the best single value seen
    // today, not a cumulative sum.
    case 'single_score':  return Math.max(current, result.score);
    case 'combo':         return Math.max(current, result.maxCombo);
    default:               return current;
  }
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      date:            getTodayString(),
      missions:        buildFreshMissions(getTodayString()),
      allBonusClaimed: false,

      ensureToday: () => {
        const today = getTodayString();
        if (get().date !== today) {
          set({
            date:            today,
            missions:        buildFreshMissions(today),
            allBonusClaimed: false,
          });
        }
      },

      recordGame: (result) => {
        // Always make sure we're scored against TODAY's mission
        // set before recording — guards against the edge case of
        // a game finishing right as the date rolls over.
        get().ensureToday();

        const before = get().missions;
        const wasAllComplete = before.every((m) => m.completed);

        let xpEarned = 0;
        const newlyCompleted: MissionProgress[] = [];

        const updated = before.map((m) => {
          if (m.completed) return m;
          const current = progressDelta(m.type, m.current, result);
          const completed = current >= m.target;
          if (completed && !m.rewardClaimed) {
            xpEarned += m.xpReward;
            const done = { ...m, current, completed, rewardClaimed: true };
            newlyCompleted.push(done);
            return done;
          }
          return { ...m, current, completed };
        });

        const allJustCompleted =
          !wasAllComplete && updated.every((m) => m.completed) && !get().allBonusClaimed;

        if (allJustCompleted) xpEarned += ALL_MISSIONS_BONUS_XP;

        set({
          missions:        updated,
          allBonusClaimed: get().allBonusClaimed || allJustCompleted,
        });

        return { newlyCompleted, xpEarned, allJustCompleted };
      },
    }),
    { name: 'aura-missions-v1', storage: createJSONStorage(() => localStorage) },
  ),
);

export const selectMissions        = (s: MissionState) => s.missions;
export const selectAllBonusClaimed = (s: MissionState) => s.allBonusClaimed;
