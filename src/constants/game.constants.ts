// ============================================================
// game.constants.ts
// Aura Square — Game-wide constants
// Owner: Syauqi Nuzul Abdi
// ============================================================

export const GRID_SIZE  = 8;
export const NUM_PIECES = 3;

/** Free hints allowed per game session (Hint/Help feature). Resets
 *  every time a new game starts. Deliberately limited so Hint stays
 *  a "gentle nudge when stuck" tool for beginners rather than a
 *  full auto-solver that removes the game's core challenge. */
export const MAX_HINTS_PER_GAME = 3;

/** Tile value → hex color.  0 = empty (no entry). */
export const TILE_COLORS: Record<number, string> = {
  1:  '#FF5E5E', // coral
  2:  '#F5C842', // gold  (single block)
  3:  '#4DCC7A', // green
  4:  '#4A9EFF', // blue
  5:  '#B06AFF', // purple
  6:  '#FF8C3A', // orange
  7:  '#00D4CC', // teal
  8:  '#FF5EAD', // pink
  9:  '#8B7FFF', // lavender
  11: '#FF2222', // bomb
};

/** Lighter version (ghost / shimmer) of each color — 55% opacity baked in. */
export const TILE_COLORS_GHOST: Record<number, string> = Object.fromEntries(
  Object.entries(TILE_COLORS).map(([k, v]) => [k, v + '8C']), // 8C ≈ 55%
);

/** Empty-cell background (Tailwind surface-300). */
export const EMPTY_CELL_COLOR = '#191C29';

/** Animation durations (ms). */
export const ANIM = {
  CELL_POP:   320,
  CELL_CLEAR: 280,
  SCORE_POP:  850,
  COMBO:      900,
  MODAL:      350,
} as const;

/** localStorage key for game state persistence. */
export const GAME_STORAGE_KEY = 'aura-game-v1';
