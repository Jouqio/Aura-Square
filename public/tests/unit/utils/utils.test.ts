// ============================================================
// utils.test.ts
// Jouqio Square — Unit tests for mathUtils & arrayUtils
// Owner: Syauqi Nuzul Abdi
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  clamp,
  isBetween,
  isEqualOrBetween,
  generateUniqueId,
  createSeededRNG,
} from '../../../src/utils/mathUtils';
import {
  cloneRow,
  cloneMatrix,
  shuffle,
  fromObject,
} from '../../../src/utils/arrayUtils';

// ── mathUtils ─────────────────────────────────────────────────

describe('mathUtils', () => {

  describe('clamp()', () => {
    it('returns min when value < min', () => expect(clamp(-5, 0, 10)).toBe(0));
    it('returns max when value > max', () => expect(clamp(15, 0, 10)).toBe(10));
    it('returns value when in range',   () => expect(clamp(5, 0, 10)).toBe(5));
    it('handles value === min',         () => expect(clamp(0, 0, 10)).toBe(0));
    it('handles value === max',         () => expect(clamp(10, 0, 10)).toBe(10));
    it('handles min === max',           () => expect(clamp(5, 7, 7)).toBe(7));
  });

  describe('isBetween()', () => {
    it('returns true for strictly interior value', () => {
      expect(isBetween(5, 0, 10)).toBe(true);
    });
    it('returns false at boundary (exclusive)', () => {
      expect(isBetween(0, 0, 10)).toBe(false);
      expect(isBetween(10, 0, 10)).toBe(false);
    });
    it('returns false when below range', () => {
      expect(isBetween(-1, 0, 10)).toBe(false);
    });
  });

  describe('isEqualOrBetween()', () => {
    it('returns true at lower boundary (inclusive)', () => {
      expect(isEqualOrBetween(0, 0, 10)).toBe(true);
    });
    it('returns true at upper boundary (inclusive)', () => {
      expect(isEqualOrBetween(10, 0, 10)).toBe(true);
    });
    it('returns true for interior value', () => {
      expect(isEqualOrBetween(5, 0, 10)).toBe(true);
    });
    it('returns false below range', () => {
      expect(isEqualOrBetween(-1, 0, 10)).toBe(false);
    });
    it('returns false above range', () => {
      expect(isEqualOrBetween(11, 0, 10)).toBe(false);
    });
  });

  describe('generateUniqueId()', () => {
    it('returns a non-empty string', () => {
      expect(typeof generateUniqueId()).toBe('string');
      expect(generateUniqueId().length).toBeGreaterThan(0);
    });

    it('generates unique values across 1000 calls', () => {
      const ids = new Set(Array.from({ length: 1000 }, generateUniqueId));
      expect(ids.size).toBe(1000);
    });
  });

  describe('createSeededRNG()', () => {
    it('returns a function', () => {
      expect(typeof createSeededRNG(42)).toBe('function');
    });

    it('produces values in [0, 1)', () => {
      const rng = createSeededRNG(42);
      for (let i = 0; i < 100; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });

    it('is deterministic — same seed, same sequence', () => {
      const rng1 = createSeededRNG(99);
      const rng2 = createSeededRNG(99);
      const seq1 = Array.from({ length: 20 }, rng1);
      const seq2 = Array.from({ length: 20 }, rng2);
      expect(seq1).toEqual(seq2);
    });

    it('different seeds produce different sequences', () => {
      const seq1 = Array.from({ length: 10 }, createSeededRNG(1));
      const seq2 = Array.from({ length: 10 }, createSeededRNG(2));
      expect(seq1).not.toEqual(seq2);
    });

    it('is not trivially sequential (has statistical spread)', () => {
      const rng    = createSeededRNG(777);
      const values = Array.from({ length: 1000 }, rng);
      const avg    = values.reduce((a, b) => a + b, 0) / values.length;
      // Average of uniform [0,1) should be ~0.5 ± 0.05
      expect(avg).toBeGreaterThan(0.45);
      expect(avg).toBeLessThan(0.55);
    });
  });
});

// ── arrayUtils ────────────────────────────────────────────────

describe('arrayUtils', () => {

  describe('cloneRow()', () => {
    it('returns a copy with same contents', () => {
      const row  = [1, 2, 3];
      const copy = cloneRow(row);
      expect(copy).toEqual(row);
    });

    it('mutation of clone does not affect original', () => {
      const row  = [1, 2, 3];
      const copy = cloneRow(row);
      copy[0] = 99;
      expect(row[0]).toBe(1);
    });
  });

  describe('cloneMatrix()', () => {
    it('returns a copy with same contents', () => {
      const m    = [[1, 2], [3, 4]];
      const copy = cloneMatrix(m);
      expect(copy).toEqual(m);
    });

    it('deep copy — inner row mutation does not affect original', () => {
      const m    = [[1, 2], [3, 4]];
      const copy = cloneMatrix(m);
      copy[0][0] = 99;
      expect(m[0][0]).toBe(1);
    });

    it('outer row mutation does not affect original', () => {
      const m    = [[1, 2], [3, 4]];
      const copy = cloneMatrix(m);
      copy[0] = [99, 99];
      expect(m[0]).toEqual([1, 2]);
    });
  });

  describe('shuffle()', () => {
    it('preserves all elements', () => {
      const arr      = [1, 2, 3, 4, 5];
      const shuffled = shuffle([...arr]);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('mutates the input array in place', () => {
      const arr = [1, 2, 3, 4, 5];
      const ref = arr;
      shuffle(arr);
      expect(arr).toBe(ref); // same reference
    });

    it('is deterministic with a seeded RNG', () => {
      const rng1 = createSeededRNG(42);
      const rng2 = createSeededRNG(42);
      const a    = shuffle([1, 2, 3, 4, 5], rng1);
      const b    = shuffle([1, 2, 3, 4, 5], rng2);
      expect(a).toEqual(b);
    });

    it('handles empty array', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('handles single-element array', () => {
      expect(shuffle([42])).toEqual([42]);
    });
  });

  describe('fromObject()', () => {
    it('extracts values from a plain object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const arr = fromObject(obj);
      expect(arr).toEqual(expect.arrayContaining([1, 2, 3]));
      expect(arr.length).toBe(3);
    });

    it('returns empty array for empty object', () => {
      expect(fromObject({})).toEqual([]);
    });
  });
});
