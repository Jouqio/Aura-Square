// ============================================================
// useAchievements.ts
// Aura Square Phase 4.0 — Achievement checker
// Owner: Syauqi Nuzul Abdi
// ============================================================
// IMPORTANT: this hook is consumed inside GamePage's game-over
// useEffect dependency array. Subscribing to whole-store objects
// here (e.g. `useAchievementStore()` with no selector) makes
// `checkAfterGame` get a brand-new reference on every store
// update, which can cause an infinite update loop with effects
// that depend on it. We only select the specific action
// functions we need (stable references from Zustand) plus
// primitive values, never the whole store object.

import { useCallback } from 'react';
import {
  useAchievementStore,
  selectPendingToast,
  selectUnlocked,
  selectTotalPoints,
} from '../store/achievementStore';
import { useStatsStore }  from '../store/statsStore';
import { usePlayerStore, getLevelProgress } from '../store/playerStore';
import { useDailyStore }  from '../store/dailyStore';
import { useWeeklyStore } from '../store/weeklyStore';
import { computeRankScore, getRankInfo } from '../constants/rank.constants';
import {
  ACHIEVEMENTS,
  type AchievementCheckData,
} from '../constants/achievement.constants';

export function useAchievements() {
  // Stable action references (Zustand actions never change identity)
  const updateMaxCombo = useAchievementStore((s) => s.updateMaxCombo);
  const updateSession  = useAchievementStore((s) => s.updateSession);
  const checkAndUnlock = useAchievementStore((s) => s.checkAndUnlock);
  const pendingToast   = useAchievementStore(selectPendingToast);
  const clearToast      = useAchievementStore((s) => s.clearToast);
  const unlocked        = useAchievementStore(selectUnlocked);
  const totalPoints     = useAchievementStore(selectTotalPoints);
  const addXp            = usePlayerStore((s) => s.addXp);
  const xp                = usePlayerStore((s) => s.xp);

  // Primitive stat values only — not the whole statsStore object
  const bestScore         = useStatsStore((s) => s.bestScore);
  const totalGames        = useStatsStore((s) => s.totalGames);
  const totalLinesCleared = useStatsStore((s) => s.totalLinesCleared);
  const totalPiecesPlaced = useStatsStore((s) => s.totalPiecesPlaced);

  // Daily/Weekly signals (V3: Daily + Mastery achievement categories)
  const dailyStreak           = useDailyStore((s) => s.getStreak());
  const bestDailyStreak        = useDailyStore((s) => s.bestStreak);
  const weeklyCompletionsCount = useWeeklyStore((s) => Object.keys(s.completions).length);

  /**
   * Call after every game over.
   * Checks all achievements and unlocks newly earned ones.
   */
  const checkAfterGame = useCallback(
    (gameData: {
      score:         number;
      comboInGame:   number;
      sessionMs:     number;
      linesCleared:  number;
    }) => {
      // Update lifetime trackers
      updateMaxCombo(gameData.comboInGame);
      updateSession(gameData.sessionMs);

      const level = getLevelProgress(xp).level;
      const rankTier = getRankInfo(computeRankScore({
        bestScore, achievementPoints: totalPoints, level,
      })).tier;

      const data: AchievementCheckData = {
        bestScore,
        totalGames,
        totalLinesCleared: totalLinesCleared + gameData.linesCleared,
        totalPiecesPlaced,
        maxComboEver:      Math.max(
          useAchievementStore.getState().maxComboEver,
          gameData.comboInGame,
        ),
        longestSession: Math.max(
          useAchievementStore.getState().longestSession,
          gameData.sessionMs,
        ),
        currentScore:    gameData.score,
        comboInLastGame: gameData.comboInGame,
        sessionDuration: gameData.sessionMs,
        dailyStreak,
        bestDailyStreak,
        weeklyCompletionsCount,
        level,
        rankTier,
      };

      // Find which achievements should now be unlocked
      const toUnlock = ACHIEVEMENTS
        .filter((a) => {
          const alreadyUnlocked = useAchievementStore
            .getState()
            .unlocked
            .some((u) => u.id === a.id);
          return !alreadyUnlocked && a.check(data);
        })
        .map((a) => a.id);

      if (toUnlock.length > 0) {
        const newUnlocks = checkAndUnlock(toUnlock, ACHIEVEMENTS);
        // XP reward — 1:1 with the achievement's point value, so
        // bigger achievements feel proportionally more rewarding.
        const xpEarned = newUnlocks.reduce((sum, u) => sum + u.points, 0);
        if (xpEarned > 0) addXp(xpEarned);
        return newUnlocks;
      }
      return [];
    },
    [
      updateMaxCombo, updateSession, checkAndUnlock, addXp,
      bestScore, totalGames, totalLinesCleared, totalPiecesPlaced,
      xp, totalPoints, dailyStreak, bestDailyStreak, weeklyCompletionsCount,
    ],
  );

  return {
    checkAfterGame,
    pendingToast,
    clearToast,
    unlocked,
    totalPoints,
  };
}
