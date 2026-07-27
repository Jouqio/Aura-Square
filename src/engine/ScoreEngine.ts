// ============================================================
// ScoreEngine.ts
// Jouqio Square — Score computation (pure, side-effect-free)
// Extracted from: fts.FillTheSquareGameManager (GameManager.js)
// Owner: Syauqi Nuzul Abdi
// ============================================================
//
// All scoring logic is now a single pure function with no
// dependency on React, Zustand, or Firebase — making it trivial
// to unit-test and to reuse in Cloud Functions for server-side
// score validation (anti-cheat).
//
// SCORING RULES (matches original exactly)
// ─────────────────────────────────────────
//  • Placing a piece:  +1 pt per tile occupied by that piece
//  • Clearing a line:  coins = (clearedSoFar + 1) × 20
//                      (combo 1 → 20 coins, combo 2 → 40, etc.)
//  • Score for clears is additive per sequence in the same move.
//
// EXTENSIONS (new for Jouqio Square)
// ────────────────────────────────────
//  • comboBonus: additional score points for multi-line clears
//    (20 pts per simultaneous clear beyond the first)
//  • Daily challenge multipliers can be injected via options
// ─────────────────────────────────────────────────────────────

import type {
  TileMatrix,
  ClearedSequence,
  ScoreResult,
  SequenceType,
  CellCoord,
} from '../types/engine.types';
import { SequenceType as ST } from '../types/engine.types';
import type { PieceModel } from './PieceModel';
import type { TileGridModel } from './TileGridModel';

// ── Constants ─────────────────────────────────────────────────

/** Coins awarded for the nth clear in one move (1-indexed).
 *  NOTE: the resulting `coins` field on ClearedSequence is kept
 *  for engine/API completeness (mirrors the original game this
 *  was ported from) but is NOT currently displayed anywhere in
 *  the V3 UI — `total`/`comboBonus` are what the UI actually
 *  shows. Safe to ignore; not a bug, just unused by design. */
const COINS_PER_CLEAR = (combo: number) => combo * 20;

/** Extra score points per simultaneous clear (beyond the first). */
const COMBO_SCORE_BONUS = 20;

// ── Public API ────────────────────────────────────────────────

export interface ScoreEngineOptions {
  /** Multiplier applied to the final score (e.g. 1.5 for daily challenges). */
  scoreMultiplier?: number;
}

/**
 * Compute the full scoring result for placing `piece` at (i, j).
 *
 * This function is **pure**: it does not mutate the grid or any
 * external state.  The caller is responsible for actually applying
 * the placement and clearances to the model.
 *
 * @param grid            Current grid **before** placement.
 * @param piece           Piece being placed.
 * @param i               Target row.
 * @param j               Target column.
 * @param priorCombo      Number of sequences already cleared this
 *                        game session (used to compute ongoing
 *                        combo multiplier).
 * @param options         Optional scoring tweaks.
 *
 * @returns               {@link ScoreResult} with point breakdown
 *                        and the list of cleared sequences.
 */
export function computeScore(
  grid: TileGridModel,
  piece: PieceModel,
  i: number,
  j: number,
  priorCombo: number = 0,
  options: ScoreEngineOptions = {},
): ScoreResult {
  const multiplier = options.scoreMultiplier ?? 1;

  // 1. Base points — one point per tile placed
  const basePts = piece.getTileCount();

  // 2. Simulate the placement on a temporary grid copy to find
  //    which lines/columns will clear without mutating the real grid.
  const sequences = _findClearances(grid, piece, i, j, priorCombo);

  // 3. Combo score bonus (Jouqio Square extension)
  const comboBonus =
    sequences.length > 1 ? (sequences.length - 1) * COMBO_SCORE_BONUS : 0;

  // 4. Total score contribution of this move
  const clearBonus = sequences.reduce((acc, s) => acc + s.combo * 2, 0);
  const rawTotal   = basePts + clearBonus + comboBonus;
  const total      = Math.round(rawTotal * multiplier);

  return { basePts, clearBonus, comboBonus, total, sequences };
}

/**
 * Check whether ANY of the supplied pieces can be placed on the grid.
 *
 * Returns the first valid placement found, or `null` if game over.
 */
export function findPossibleMove(
  grid: TileGridModel,
  pieces: PieceModel[],
): { piece: PieceModel; i: number; j: number } | null {
  const n = grid.size;

  for (const piece of pieces) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (grid.canFit(piece, i, j)) {
          return { piece, i, j };
        }
      }
    }
  }

  return null;
}

/**
 * Computes the exact board cells a piece would occupy if placed at
 * (targetI, targetJ) — does NOT check validity, does NOT mutate the
 * grid. Pure geometry only, mirroring the cell-computation used when
 * a piece is actually committed via placePiece() in useGame.ts, so
 * hint highlighting always matches the real placement pixel-for-pixel.
 */
export function getPlacementCells(
  piece:    PieceModel,
  targetI:  number,
  targetJ:  number,
): CellCoord[] {
  const cells: CellCoord[] = [];
  for (let r = 0; r < piece.tiles.length; r++) {
    for (let c = 0; c < (piece.tiles[r]?.length ?? 0); c++) {
      if ((piece.tiles[r]?.[c] ?? 0) !== 0) {
        cells.push([targetI + r, targetJ + c]);
      }
    }
  }
  return cells;
}

export interface HintResult {
  slotIndex: number;
  cells:     CellCoord[];
}

/**
 * Finds a hint for the Hint/Help feature: given the player's current
 * piece tray (with nulls for empty slots), returns which slot to use
 * and exactly which board cells it would fill — or `null` if no
 * piece in the tray has a valid placement anywhere (i.e. the game
 * is actually over; callers should not normally reach this state
 * since game-over is already detected elsewhere, but it's handled
 * defensively rather than assumed).
 *
 * Deliberately returns only the FIRST valid placement found (same
 * search order as findPossibleMove) rather than an "optimal" one —
 * this is meant as a gentle nudge for players who feel stuck, not
 * a solver that plays the game for them.
 */
export function findHintForTray(
  grid: TileGridModel,
  trayPieces: ReadonlyArray<{ slotIndex: number; piece: PieceModel }>,
): HintResult | null {
  const n = grid.size;

  for (const { slotIndex, piece } of trayPieces) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (grid.canFit(piece, i, j)) {
          return { slotIndex, cells: getPlacementCells(piece, i, j) };
        }
      }
    }
  }

  return null;
}

// ── Private helpers ───────────────────────────────────────────

/**
 * Simulate the placement and detect full rows/columns.
 * Returns the list of cleared sequences in order of discovery.
 *
 * Mirrors the logic of `_checkTiles`, `_clearLine`, `_clearRow`
 * from the original GameManager without touching real state.
 */
function _findClearances(
  grid: TileGridModel,
  piece: PieceModel,
  i: number,
  j: number,
  priorCombo: number,
): ClearedSequence[] {
  const n = grid.size;

  // Build a temporary matrix with the piece applied
  const sim: TileMatrix = grid.getGrid(); // already a deep copy
  for (let mI = 0; mI < piece.tiles.length; mI++) {
    for (let mJ = 0; mJ < piece.tiles[mI].length; mJ++) {
      const val = piece.tiles[mI][mJ];
      if (val !== 0) sim[i + mI][j + mJ] = val;
    }
  }

  // Count filled cells per row and column
  const rowCount = new Array<number>(n).fill(0);
  const colCount = new Array<number>(n).fill(0);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (sim[r][c] > 0) {
        rowCount[r]++;
        colCount[c]++;
      }
    }
  }

  const sequences: ClearedSequence[] = [];
  let comboIdx = priorCombo; // rolling combo counter

  // Full rows (lines) first, then full columns — matches original order
  for (let k = 0; k < n; k++) {
    if (rowCount[k] === n) {
      comboIdx++;
      sequences.push(_buildSequence(ST.LINE, k, comboIdx));
    }
  }

  for (let k = 0; k < n; k++) {
    if (colCount[k] === n) {
      comboIdx++;
      sequences.push(_buildSequence(ST.COLUMN, k, comboIdx));
    }
  }

  return sequences;
}

function _buildSequence(
  type: SequenceType,
  index: number,
  combo: number,
): ClearedSequence {
  return {
    type,
    index,
    coins: COINS_PER_CLEAR(combo),
    combo,
  };
}
