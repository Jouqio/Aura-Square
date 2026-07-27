// ============================================================
// TileGridModel.test.ts
// Jouqio Square — Unit tests for TileGridModel
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Run: npx vitest run tests/unit/engine/TileGridModel.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { TileGridModel } from '../../../src/engine/TileGridModel';
import { PieceModel }    from '../../../src/engine/PieceModel';

// ── Fixtures ──────────────────────────────────────────────────

/** Create a piece from a raw matrix without going through presets. */
function makePiece(matrix: number[][]): PieceModel {
  const p = new PieceModel();
  p.setCustomMatrix(matrix);
  return p;
}

// ── Test suite ───────────────────────────────────────────────

describe('TileGridModel', () => {
  let grid: TileGridModel;

  beforeEach(() => {
    grid = new TileGridModel(8);
  });

  // ── Constructor / size ─────────────────────────────────────

  describe('constructor', () => {
    it('creates an 8×8 grid by default', () => {
      expect(grid.size).toBe(8);
    });

    it('creates a custom-sized grid', () => {
      const g = new TileGridModel(5);
      expect(g.size).toBe(5);
    });

    it('initialises all cells to 0', () => {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          expect(grid.getFieldValue(i, j)).toBe(0);
        }
      }
    });
  });

  // ── reset ──────────────────────────────────────────────────

  describe('reset()', () => {
    it('zeroes every cell after placement', () => {
      const piece = makePiece([[1, 1], [1, 1]]);
      grid.fit(piece, 0, 0);
      grid.reset();

      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          expect(grid.getFieldValue(i, j)).toBe(0);
        }
      }
    });
  });

  // ── clearField ────────────────────────────────────────────

  describe('clearField()', () => {
    it('sets a single cell to 0', () => {
      const piece = makePiece([[3]]);
      grid.fit(piece, 4, 4);
      expect(grid.getFieldValue(4, 4)).toBe(3);

      grid.clearField(4, 4);
      expect(grid.getFieldValue(4, 4)).toBe(0);
    });
  });

  // ── canFit ────────────────────────────────────────────────

  describe('canFit()', () => {
    it('allows placing a piece on an empty grid', () => {
      const piece = makePiece([[1, 1], [1, 1]]);
      expect(grid.canFit(piece, 0, 0)).toBe(true);
    });

    it('rejects placement that goes out-of-bounds (right)', () => {
      const piece = makePiece([[1, 1, 1, 1]]); // 4-wide
      expect(grid.canFit(piece, 0, 6)).toBe(false); // col 6,7,8,9 → 8,9 OOB
    });

    it('rejects placement that goes out-of-bounds (bottom)', () => {
      const piece = makePiece([[1], [1], [1], [1]]); // 4-tall
      expect(grid.canFit(piece, 6, 0)).toBe(false); // row 6,7,8,9 → 8,9 OOB
    });

    it('rejects placement on occupied cell', () => {
      const p1 = makePiece([[1]]);
      const p2 = makePiece([[2]]);
      grid.fit(p1, 3, 3);
      expect(grid.canFit(p2, 3, 3)).toBe(false);
    });

    it('allows overlap when overlapAllowed = true', () => {
      const p1 = makePiece([[1]]);
      const p2 = makePiece([[2]]);
      grid.fit(p1, 3, 3);
      expect(grid.canFit(p2, 3, 3, true)).toBe(true);
    });

    it('allows piece positioned exactly at bottom-right corner', () => {
      const piece = makePiece([[1]]);
      expect(grid.canFit(piece, 7, 7)).toBe(true);
    });
  });

  // ── fit ───────────────────────────────────────────────────

  describe('fit()', () => {
    it('places piece tiles onto the grid', () => {
      const piece = makePiece([[5, 5], [5, 0]]);
      const result = grid.fit(piece, 2, 3);

      expect(result).toBe(true);
      expect(grid.getFieldValue(2, 3)).toBe(5);
      expect(grid.getFieldValue(2, 4)).toBe(5);
      expect(grid.getFieldValue(3, 3)).toBe(5);
      expect(grid.getFieldValue(3, 4)).toBe(0); // empty cell in piece
    });

    it('returns false and leaves grid unchanged on invalid placement', () => {
      const p1 = makePiece([[1]]);
      const p2 = makePiece([[2]]);
      grid.fit(p1, 0, 0);
      const result = grid.fit(p2, 0, 0); // overlap

      expect(result).toBe(false);
      expect(grid.getFieldValue(0, 0)).toBe(1); // original value preserved
    });

    it('preserves empty cells of the piece matrix', () => {
      const lPiece = makePiece([[1, 0], [1, 0], [1, 1]]);
      grid.fit(lPiece, 0, 0);

      expect(grid.getFieldValue(0, 1)).toBe(0);
      expect(grid.getFieldValue(1, 1)).toBe(0);
    });
  });

  // ── erase ─────────────────────────────────────────────────

  describe('erase()', () => {
    it('removes all tiles belonging to the piece', () => {
      const piece = makePiece([[3, 3], [3, 3]]);
      grid.fit(piece, 1, 1);
      grid.erase(piece, 1, 1);

      expect(grid.getFieldValue(1, 1)).toBe(0);
      expect(grid.getFieldValue(1, 2)).toBe(0);
      expect(grid.getFieldValue(2, 1)).toBe(0);
      expect(grid.getFieldValue(2, 2)).toBe(0);
    });

    it('does not erase cells outside piece bounds', () => {
      const other = makePiece([[7]]);
      grid.fit(other, 5, 5);

      const piece = makePiece([[3, 3], [3, 3]]);
      grid.fit(piece, 1, 1);
      grid.erase(piece, 1, 1);

      expect(grid.getFieldValue(5, 5)).toBe(7); // unaffected
    });
  });

  // ── serialisation ─────────────────────────────────────────

  describe('getDataForSaving() / loadDataFrom()', () => {
    it('round-trips the grid state correctly', () => {
      const piece = makePiece([[4, 0], [4, 4]]);
      grid.fit(piece, 3, 3);

      const snapshot = grid.getDataForSaving();
      const grid2   = new TileGridModel(8);
      grid2.loadDataFrom(snapshot);

      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          expect(grid2.getFieldValue(i, j)).toBe(grid.getFieldValue(i, j));
        }
      }
    });

    it('snapshot is a deep copy — mutations do not affect the model', () => {
      const piece = makePiece([[1]]);
      grid.fit(piece, 0, 0);
      const snapshot = grid.getDataForSaving();
      snapshot[0][0] = 99;

      expect(grid.getFieldValue(0, 0)).toBe(1); // unchanged
    });
  });

  // ── getGrid() ─────────────────────────────────────────────

  describe('getGrid()', () => {
    it('returns a deep copy (mutations do not affect the model)', () => {
      const copy = grid.getGrid();
      copy[0][0] = 42;
      expect(grid.getFieldValue(0, 0)).toBe(0);
    });
  });

  // ── edge cases ────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles a 1×1 grid', () => {
      const g = new TileGridModel(1);
      const p = makePiece([[5]]);
      expect(g.canFit(p, 0, 0)).toBe(true);
      g.fit(p, 0, 0);
      expect(g.getFieldValue(0, 0)).toBe(5);
    });

    it('handles piece with all-zero matrix (no-op)', () => {
      const empty = makePiece([[0, 0], [0, 0]]);
      const result = grid.fit(empty, 0, 0);
      // canFit returns true because no non-zero cells violate constraints
      expect(result).toBe(true);
      // Nothing written
      expect(grid.getFieldValue(0, 0)).toBe(0);
    });
  });
});
