// ============================================================
// piecePresets.ts
// Jouqio Square — All piece shape definitions
// Ported from: fts.PieceModel.PRESETS (PieceModel.js)
// Owner: Syauqi Nuzul Abdi
// ============================================================
//
// Tile value key
// ──────────────
//  0  = empty cell
//  1-9 = standard piece colours (maps to theme palette index)
//  11  = special: bomb / explosion marker
//
// Each preset is a 2-D matrix (rows × columns) where non-zero
// values define the shape.  The value itself controls which
// colour swatch the renderer picks from the active theme.

import type { TileMatrix } from '../types/engine.types';

export const PIECE_PRESETS: ReadonlyArray<TileMatrix> = [
  // Preset 00 — 1×1 single block
  [[2]],

  // Preset 01 — 1×2 horizontal domino
  [[1, 1]],

  // Preset 02 — 1×3 horizontal triomino
  [[3, 3, 3]],

  // Preset 03 — 1×4 horizontal tetromino (I)
  [[4, 4, 4, 4]],

  // Preset 04 — 2×2 full square (O)
  [
    [5, 5],
    [5, 5],
  ],

  // Preset 05 — L-corner 2×2
  [
    [6, 6],
    [6, 0],
  ],

  // Preset 06 — L-tetromino (J, tall)
  [
    [7, 0],
    [7, 0],
    [7, 7],
  ],

  // Preset 07 — J-tetromino (L, tall)
  [
    [0, 8],
    [0, 8],
    [8, 8],
  ],

  // Preset 08 — T-triomino rotated
  [
    [9, 0],
    [9, 9],
    [9, 0],
  ],

  // Preset 09 — C-shape (U open right)
  [
    [1, 1],
    [1, 0],
    [1, 1],
  ],

  // Preset 10 — irregular pentomino
  [
    [0, 3],
    [3, 3],
    [3, 3],
  ],

  // Preset 11 — irregular pentomino (mirror)
  [
    [4, 0],
    [4, 4],
    [4, 4],
  ],

  // Preset 12 — S-triomino
  [
    [0, 5],
    [5, 5],
    [5, 0],
  ],

  // Preset 13 — Z-triomino
  [
    [6, 0],
    [6, 6],
    [0, 6],
  ],

  // Preset 14 — tall Z-pentomino
  [
    [7, 0],
    [7, 7],
    [7, 7],
    [7, 0],
  ],

  // Preset 15 — T-pentomino (cross arm)
  [
    [8, 0],
    [8, 0],
    [8, 8],
    [8, 0],
  ],

  // Preset 16 — S-pentomino 3-wide
  [
    [9, 0, 0],
    [9, 9, 0],
    [0, 9, 9],
  ],

  // Preset 17 — Z-pentomino 3-wide
  [
    [0, 1, 1],
    [0, 1, 0],
    [1, 1, 0],
  ],

  // Preset 18 — plus / cross (+)
  [
    [0, 3, 0],
    [3, 3, 3],
    [0, 3, 0],
  ],

  // Preset 19 — T-pentomino (open top)
  [
    [0, 4, 0],
    [0, 4, 0],
    [4, 4, 4],
  ],

  // Preset 20 — 3×3 full square
  [
    [5, 5, 5],
    [5, 5, 5],
    [5, 5, 5],
  ],
] as const;

/** Total number of standard presets */
export const PRESET_COUNT = PIECE_PRESETS.length; // 21

// ── Special-piece matrices ────────────────────────────────────

/** 1×1 single-block boost (preset index 0) */
export const SINGLE_BLOCK_MATRIX: TileMatrix = [[2]];

/**
 * 3×3 bomb explosion area.
 * Value 11 is reserved for the bomb — the renderer maps it to
 * a distinct "blast" visual regardless of theme.
 */
export const BOMB_MATRIX: TileMatrix = [
  [11, 11, 11],
  [11, 11, 11],
  [11, 11, 11],
];
