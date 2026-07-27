// ============================================================
// PieceModel.test.ts
// Jouqio Square — Unit tests for PieceModel
// Owner: Syauqi Nuzul Abdi
// ============================================================

import { describe, it, expect } from 'vitest';
import { PieceModel }  from '../../../src/engine/PieceModel';
import { PIECE_PRESETS, PRESET_COUNT } from '../../../src/engine/piecePresets';

// ── Test suite ───────────────────────────────────────────────

describe('PieceModel', () => {

  // ── Constructor ───────────────────────────────────────────

  describe('constructor', () => {
    it('creates an instance with a uuid', () => {
      const p = new PieceModel();
      expect(typeof p.uuid).toBe('string');
      expect(p.uuid.length).toBeGreaterThan(0);
    });

    it('sets presetId = -1 when no preset is given', () => {
      const p = new PieceModel();
      expect(p.presetId).toBe(-1);
    });

    it('loads the correct preset when presetId is supplied', () => {
      const p = new PieceModel(0); // single block
      expect(p.presetId).toBe(0);
      expect(p.tiles).toEqual([[2]]);
    });

    it('produces unique uuids for separate instances', () => {
      const a = new PieceModel(0);
      const b = new PieceModel(0);
      expect(a.uuid).not.toBe(b.uuid);
    });
  });

  // ── setFromPreset ────────────────────────────────────────

  describe('setFromPreset()', () => {
    it('deep-copies the preset (mutation does not affect PRESETS)', () => {
      const p = new PieceModel(4); // 2×2 square
      p.tiles[0][0] = 99;
      expect(PIECE_PRESETS[4][0][0]).toBe(5); // original unchanged
    });

    it('loads all 21 presets without throwing', () => {
      for (let id = 0; id < PRESET_COUNT; id++) {
        expect(() => new PieceModel(id)).not.toThrow();
      }
    });
  });

  // ── setCustomMatrix ───────────────────────────────────────

  describe('setCustomMatrix()', () => {
    it('sets presetId to -1', () => {
      const p = new PieceModel(1);
      p.setCustomMatrix([[1, 1, 1]]);
      expect(p.presetId).toBe(-1);
    });

    it('deep-copies the matrix', () => {
      const matrix = [[1, 2], [3, 4]];
      const p = new PieceModel();
      p.setCustomMatrix(matrix);
      matrix[0][0] = 99;
      expect(p.tiles[0][0]).toBe(1); // copy, not reference
    });
  });

  // ── Dimension getters ─────────────────────────────────────

  describe('totalLines / totalRows', () => {
    it('returns correct dimensions for a wide piece', () => {
      const p = new PieceModel(3); // 1×4
      expect(p.totalLines).toBe(1);
      expect(p.totalRows).toBe(4);
    });

    it('returns correct dimensions for a tall piece', () => {
      const p = new PieceModel(6); // 3×2 L
      expect(p.totalLines).toBe(3);
      expect(p.totalRows).toBe(2);
    });
  });

  // ── isSquare ─────────────────────────────────────────────

  describe('isSquare()', () => {
    it('returns true for 1×1 single block', () => {
      const p = new PieceModel(0);
      expect(p.isSquare()).toBe(true);
    });

    it('returns true for 2×2 full block', () => {
      const p = new PieceModel(4);
      expect(p.isSquare()).toBe(true);
    });

    it('returns true for 3×3 full block', () => {
      const p = new PieceModel(20);
      expect(p.isSquare()).toBe(true);
    });

    it('returns false for non-square (1×4 horizontal)', () => {
      const p = new PieceModel(3);
      expect(p.isSquare()).toBe(false);
    });

    it('returns false for L-shape (has zeroes)', () => {
      const p = new PieceModel(5); // 2×2 with one zero
      expect(p.isSquare()).toBe(false);
    });
  });

  // ── getTileCount ─────────────────────────────────────────

  describe('getTileCount()', () => {
    it('counts 1 for single block', () => {
      expect(new PieceModel(0).getTileCount()).toBe(1);
    });

    it('counts 2 for horizontal domino', () => {
      expect(new PieceModel(1).getTileCount()).toBe(2);
    });

    it('counts 4 for 2×2 square', () => {
      expect(new PieceModel(4).getTileCount()).toBe(4);
    });

    it('counts 9 for 3×3 full block', () => {
      expect(new PieceModel(20).getTileCount()).toBe(9);
    });

    it('counts correctly for L-shape with zeroes', () => {
      const p = new PieceModel(6); // [[7,0],[7,0],[7,7]] → 4 filled
      expect(p.getTileCount()).toBe(4);
    });
  });

  // ── rotate ───────────────────────────────────────────────

  describe('rotate()', () => {
    it('rotates a horizontal piece 90° counter-clockwise → vertical', () => {
      const p = new PieceModel();
      p.setCustomMatrix([[1, 1, 1]]); // 1×3 horizontal
      p.rotate(false); // counter-clockwise
      expect(p.tiles).toEqual([[1], [1], [1]]); // 3×1 vertical
    });

    it('rotates a horizontal piece 90° clockwise → vertical', () => {
      const p = new PieceModel();
      p.setCustomMatrix([[1, 1, 1]]);
      p.rotate(true);
      expect(p.tiles).toEqual([[1], [1], [1]]);
    });

    it('four rotations return to original shape', () => {
      const p = new PieceModel(6); // L-shape
      const original = p.tiles.map((r) => r.slice());
      for (let i = 0; i < 4; i++) p.rotate();
      expect(p.tiles).toEqual(original);
    });

    it('updates uuid after rotation', () => {
      const p = new PieceModel(0);
      const before = p.uuid;
      p.rotate();
      expect(p.uuid).not.toBe(before);
    });

    it('rotates L-piece clockwise correctly', () => {
      // [[7, 0], [7, 0], [7, 7]] CW →
      // [[7, 7, 7], [7, 0, 0]]
      const p = new PieceModel(6);
      p.rotate(true);
      expect(p.tiles).toEqual([
        [7, 7, 7],
        [7, 0, 0],
      ]);
    });
  });

  // ── Static factories ──────────────────────────────────────

  describe('static factories', () => {
    it('getRandom() returns a PieceModel with valid tiles', () => {
      const p = PieceModel.getRandom();
      expect(p.tiles.length).toBeGreaterThan(0);
      expect(p.presetId).toBeGreaterThanOrEqual(0);
    });

    it('getRandom() with seeded RNG is deterministic', () => {
      let seed = 12345;
      const rng = () => {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        return (seed >>> 0) / 0x100000000;
      };

      const a = PieceModel.getRandom(rng).presetId;
      seed = 12345; // reset seed
      const b = PieceModel.getRandom(rng).presetId;
      expect(a).toBe(b);
    });

    it('getSingleBlock() returns a 1×1 piece', () => {
      const p = PieceModel.getSingleBlock();
      expect(p.getTileCount()).toBe(1);
      expect(p.totalLines).toBe(1);
      expect(p.totalRows).toBe(1);
    });

    it('getBomb() returns a 3×3 piece with all 11s', () => {
      const p = PieceModel.getBomb();
      expect(p.totalLines).toBe(3);
      expect(p.totalRows).toBe(3);
      for (const row of p.tiles) {
        for (const cell of row) {
          expect(cell).toBe(11);
        }
      }
    });

    it('getBomb() and getSingleBlock() return independent instances', () => {
      const a = PieceModel.getBomb();
      const b = PieceModel.getBomb();
      a.tiles[0][0] = 99;
      expect(b.tiles[0][0]).toBe(11);
    });
  });

  // ── Serialisation ─────────────────────────────────────────

  describe('getDataForSaving() / loadDataFrom()', () => {
    it('round-trips preset piece correctly', () => {
      const original = new PieceModel(8);
      const snap     = original.getDataForSaving();
      const restored = new PieceModel();
      restored.loadDataFrom(snap);

      expect(restored.presetId).toBe(original.presetId);
      expect(restored.tiles).toEqual(original.tiles);
    });

    it('round-trips custom matrix correctly', () => {
      const original = new PieceModel();
      original.setCustomMatrix([[1, 2], [3, 4]]);
      const snap     = original.getDataForSaving();
      const restored = new PieceModel();
      restored.loadDataFrom(snap);

      expect(restored.presetId).toBe(-1);
      expect(restored.tiles).toEqual([[1, 2], [3, 4]]);
    });

    it('snapshot tiles are a deep copy', () => {
      const p    = new PieceModel(1);
      const snap = p.getDataForSaving();
      snap.tiles[0][0] = 99;
      expect(p.tiles[0][0]).toBe(1); // original unchanged
    });

    it('loadDataFrom() assigns a new uuid', () => {
      const a    = new PieceModel(0);
      const uuid = a.uuid;
      const snap = a.getDataForSaving();
      a.loadDataFrom(snap);
      expect(a.uuid).not.toBe(uuid);
    });
  });
});
