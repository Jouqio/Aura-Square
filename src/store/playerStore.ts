// ============================================================
// playerStore.ts — Player Progression (XP, Level), local profile
// Owner: Syauqi Nuzul Abdi
// ============================================================
// XP sources: playing games, unlocking achievements, completing
// daily challenges. Level is DERIVED from total XP (never stored
// directly) so it can never drift out of sync with the formula.

import { create }                     from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PlayerState {
  displayName:    string;
  avatarEmoji:    string;
  createdAt:      number;
  xp:             number;
  equippedTitle:  string;

  setDisplayName: (name: string)  => void;
  setAvatarEmoji: (emoji: string) => void;
  addXp:          (amount: number) => void;
  setEquippedTitle: (id: string)  => void;
}

export const AVATAR_EMOJIS = [
  '🐼','🦊','🐸','🦁','🐯','🐧','🦋','🐙',
  '🦄','🐲','🤖','👾','🎮','⚡','🔥','💎',
];

export const MAX_LEVEL = 100;

/** XP required to go from level N to level N+1. Gently increasing
 *  curve: early levels are fast (hooks the player), later levels
 *  take meaningfully longer (long-term progression goal). */
export function xpForLevel(level: number): number {
  return Math.round(80 + level * 14);
}

/** Total cumulative XP needed to REACH a given level (level 1 = 0 XP). */
export function cumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

export interface LevelProgress {
  level:          number;
  xpIntoLevel:    number;
  xpForNextLevel: number;
  pct:            number; // 0-100
  isMaxLevel:     boolean;
}

/** Derives the player's current level + progress bar info from total XP. */
export function getLevelProgress(totalXp: number): LevelProgress {
  let level = 1;
  let remaining = totalXp;

  while (level < MAX_LEVEL) {
    const need = xpForLevel(level);
    if (remaining < need) break;
    remaining -= need;
    level++;
  }

  const isMaxLevel = level >= MAX_LEVEL;
  const need = isMaxLevel ? 0 : xpForLevel(level);

  return {
    level,
    xpIntoLevel:    remaining,
    xpForNextLevel: need,
    pct:            isMaxLevel ? 100 : Math.round((remaining / need) * 100),
    isMaxLevel,
  };
}

// ── XP award constants ───────────────────────────────────────────
export const XP_PER_GAME_BASE   = 5;
export const XP_PER_10_SCORE    = 1;     // +1 XP per 10 score points
export const XP_DAILY_BASE      = 30;
export const XP_DAILY_BRONZE    = 10;
export const XP_DAILY_SILVER    = 25;
export const XP_DAILY_GOLD      = 50;

export function xpFromGameScore(score: number): number {
  return XP_PER_GAME_BASE + Math.floor(score / 10) * XP_PER_10_SCORE;
}

export function xpFromDailyRank(rank: 'bronze' | 'silver' | 'gold' | null): number {
  const bonus = rank === 'gold' ? XP_DAILY_GOLD
    : rank === 'silver' ? XP_DAILY_SILVER
    : rank === 'bronze' ? XP_DAILY_BRONZE
    : 0;
  return XP_DAILY_BASE + bonus;
}

// ── Store ─────────────────────────────────────────────────────

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      displayName:   'Pemain',
      avatarEmoji:   '🎮',
      createdAt:     Date.now(),
      xp:            0,
      equippedTitle: 'pemula',

      setDisplayName: (displayName) => set({ displayName }),
      setAvatarEmoji: (avatarEmoji) => set({ avatarEmoji }),
      addXp: (amount) => set((s) => ({
        xp: Math.max(0, s.xp + Math.round(amount)),
      })),
      setEquippedTitle: (id) => set({ equippedTitle: id }),
    }),
    {
      name:    'aura-player-v1',
      storage: createJSONStorage(() => localStorage),
      version: 3, // v3 adds `equippedTitle`
    },
  ),
);

export const selectDisplayName   = (s: PlayerState) => s.displayName;
export const selectAvatarEmoji   = (s: PlayerState) => s.avatarEmoji;
export const selectXp            = (s: PlayerState) => s.xp;
export const selectEquippedTitle = (s: PlayerState) => s.equippedTitle;
