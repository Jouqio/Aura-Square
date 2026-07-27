// ============================================================
// ScoreEngine.test.ts
// Jouqio Square — Unit tests for ScoreEngine
// Owner: Syauqi Nuzul Abdi
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { TileGridModel }  from '../../../src/engine/TileGridModel';
import { PieceModel }     from '../../../src/engine/PieceModel';
import { computeScore, findPossibleMove } from '../../../src/engine/ScoreEngine';
import { SequenceType }   from '../../../src/types/engine.types';

// ── Fixtures ──────────────────────────────────────────────────

function makePiece(matrix: number[][]): PieceModel {
  const p = new PieceModel();
  p.setCustomMatrix(matrix);
  return p;
}

/** Fill an entire row of an 8×8 grid with value 1, leaving one gap at `gapCol`. */
function fillRowWithGap(grid: TileGridModel, row: number, gapCol: number): void {
  for (let j = 0; j < 8; j++) {
    if (j !== gapCol) {
      const p = makePiece([[1]]);
      grid.fit(p, row, j);
    }
  }
}

/** Fill an entire column of an 8×8 grid with value 1, leaving one gap at `gapRow`. */
function fillColWithGap(grid: TileGridModel, col: number, gapRow: number): void {
  for (let i = 0; i < 8; i++) {
    if (i !== gapRow) {
      const p = makePiece([[1]]);
      grid.fit(p, i, col);
    }
  }
}

// ── Tests ─────────────────────────────────────────────────────

describe('ScoreEngine — computeScore()', () => {
  let grid: TileGridModel;

  beforeEach(() => {
    grid = new TileGridModel(8);
  });

  // ── Base points ───────────────────────────────────────────

  describe('base points', () => {
    it('awards 1 pt per tile for a 1×1 piece (no clear)', () => {
      const piece  = makePiece([[1]]);
      const result = computeScore(grid, piece, 0, 0);
      expect(result.basePts).toBe(1);
      expect(result.sequences.length).toBe(0);
      expect(result.total).toBe(1);
    });

    it('awards 4 pts for a 2×2 piece (no clear)', () => {
      const piece  = makePiece([[1, 1], [1, 1]]);
      const result = computeScore(grid, piece, 0, 0);
      expect(result.basePts).toBe(4);
    });

    it('awards 9 pts for a 3×3 full block (no clear)', () => {
      const piece  = makePiece([[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
      const result = computeScore(grid, piece, 0, 0);
      expect(result.basePts).toBe(9);
    });
  });

  // ── Line clearance ────────────────────────────────────────

  describe('line clearance', () => {
    it('detects a single cleared row', () => {
      fillRowWithGap(grid, 0, 7); // row 0 has gap at col 7
      const piece  = makePiece([[1]]);
      const result = computeScore(grid, piece, 0, 7); // fills the gap

      expect(result.sequences.length).toBe(1);
      expect(result.sequences[0].type).toBe(SequenceType.LINE);
      expect(result.sequences[0].index).toBe(0);
      expect(result.sequences[0].combo).toBe(1);
      expect(result.sequences[0].coins).toBe(20);
    });

    it('detects a single cleared column', () => {
      fillColWithGap(grid, 3, 7); // col 3 has gap at row 7
      const piece  = makePiece([[1]]);
      const result = computeScore(grid, piece, 7, 3); // fills the gap

      expect(result.sequences.length).toBe(1);
      expect(result.sequences[0].type).toBe(SequenceType.COLUMN);
      expect(result.sequences[0].index).toBe(3);
    });

    it('awards combo coins for simultaneous row + column clear', () => {
      // Row 0: gap at col 3
      fillRowWithGap(grid, 0, 3);
      // Col 3: gap at row 0 (both gaps are the same cell!)
      fillColWithGap(grid, 3, 0);

      const piece  = makePiece([[1]]);
      const result = computeScore(grid, piece, 0, 3);

      expect(result.sequences.length).toBe(2);
      expect(result.sequences[0].coins).toBe(20); // combo 1
      expect(result.sequences[1].coins).toBe(40); // combo 2
    });

    it('tracks combo correctly with priorCombo', () => {
      fillRowWithGap(grid, 0, 7);
      const piece  = makePiece([[1]]);
      const result = computeScore(grid, piece, 0, 7, 3); // prior combo = 3

      expect(result.sequences[0].combo).toBe(4); // 3 + 1
      expect(result.sequences[0].coins).toBe(80); // 4 × 20
    });

    it('does not detect a clear when row is not full', () => {
      // Fill only 6 of 8 cells in row 0
      for (let j = 0; j < 6; j++) {
        const p = makePiece([[1]]);
        grid.fit(p, 0, j);
      }
      const piece  = makePiece([[1]]);
      const result = computeScore(grid, piece, 0, 6); // still one gap

      expect(result.sequences.length).toBe(0);
    });
  });

  // ── Multiplier ────────────────────────────────────────────

  describe('scoreMultiplier option', () => {
    it('applies multiplier to total score', () => {
      const piece   = makePiece([[1]]);
      const normal  = computeScore(grid, piece, 0, 0);
      const doubled = computeScore(grid, piece, 0, 0, 0, { scoreMultiplier: 2 });
      expect(doubled.total).toBe(normal.total * 2);
    });

    it('rounds the total to an integer', () => {
      const piece  = makePiece([[1, 1, 1]]);
      const result = computeScore(grid, piece, 0, 0, 0, { scoreMultiplier: 1.5 });
      expect(Number.isInteger(result.total)).toBe(true);
    });
  });

  // ── Combo bonus (Jouqio Square extension) ─────────────────

  describe('comboBonus', () => {
    it('is 0 for a single clear', () => {
      fillRowWithGap(grid, 0, 7);
      const piece  = makePiece([[1]]);
      const result = computeScore(grid, piece, 0, 7);
      expect(result.comboBonus).toBe(0);
    });

    it('adds 20 pts per additional simultaneous clear', () => {
      fillRowWithGap(grid, 0, 3);
      fillColWithGap(grid, 3, 0);
      const piece  = makePiece([[1]]);
      const result = computeScore(grid, piece, 0, 3);
      // 2 sequences → comboBonus = (2-1) × 20 = 20
      expect(result.comboBonus).toBe(20);
    });
  });

  // ── No mutation ───────────────────────────────────────────

  describe('immutability', () => {
    it('does not mutate the grid', () => {
      fillRowWithGap(grid, 0, 7);
      const before = grid.getDataForSaving();
      const piece  = makePiece([[1]]);
      computeScore(grid, piece, 0, 7);
      const after  = grid.getDataForSaving();
      expect(after).toEqual(before);
    });
  });
});

// ─────────────────────────────────────────────────────────────

describe('ScoreEngine — findPossibleMove()', () => {
  it('returns null when no pieces can be placed', () => {
    // Fill the entire 8×8 grid
    const grid  = new TileGridModel(8);
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const p = makePiece([[1]]);
        grid.fit(p, i, j);
      }
    }

    const pieces = [new PieceModel(4)]; // 2×2 — won't fit anywhere
    expect(findPossibleMove(grid, pieces)).toBeNull();
  });

  it('returns a valid placement when one exists', () => {
    const grid  = new TileGridModel(8);
    const piece = makePiece([[1]]);
    const move  = findPossibleMove(grid, [piece]);

    expect(move).not.toBeNull();
    expect(move!.i).toBeGreaterThanOrEqual(0);
    expect(move!.j).toBeGreaterThanOrEqual(0);
  });

  it('finds a move for any piece in the list', () => {
    const grid   = new TileGridModel(8);
    const pieces = [new PieceModel(3), new PieceModel(0)]; // 1×4 and 1×1
    const move   = findPossibleMove(grid, pieces);
    expect(move).not.toBeNull();
  });
});
