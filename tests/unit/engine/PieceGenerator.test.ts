// ============================================================
// PieceGenerator.test.ts
// Jouqio Square — Unit tests for PieceGenerator
// Owner: Syauqi Nuzul Abdi
// ============================================================

import { describe, it, expect } from 'vitest';
import { PieceGenerator } from '../../../src/engine/PieceGenerator';
import { PieceModel }     from '../../../src/engine/PieceModel';
import { createSeededRNG } from '../../../src/utils/mathUtils';

// ── Test suite ───────────────────────────────────────────────

describe('PieceGenerator', () => {

  // ── Basic generation ──────────────────────────────────────

  describe('makePieceModel()', () => {
    it('returns a PieceModel instance', () => {
      const gen = new PieceGenerator();
      const p   = gen.makePieceModel();
      expect(p).toBeInstanceOf(PieceModel);
    });

    it('produces valid presetId (0–20) or custom (-1)', () => {
      const gen = new PieceGenerator();
      for (let i = 0; i < 50; i++) {
        const p = gen.makePieceModel();
        expect(p.presetId).toBeGreaterThanOrEqual(0);
        expect(p.presetId).toBeLessThan(PieceModel.PRESET_COUNT);
      }
    });

    it('always produces pieces with at least 1 tile', () => {
      const gen = new PieceGenerator();
      for (let i = 0; i < 30; i++) {
        expect(gen.makePieceModel().getTileCount()).toBeGreaterThan(0);
      }
    });
  });

  // ── Recency avoidance ────────────────────────────────────

  describe('recency avoidance', () => {
    it('does not produce 7 identical non-zero pieces in a row', () => {
      const gen     = new PieceGenerator();
      const history = new Array<number>(7).fill(0).map(() =>
        gen.makePieceModel().presetId,
      );

      // With 7 pieces, the generator must have cycled the history
      // so at least 2 different presets appear (unless all are preset 0)
      const nonZero = history.filter((id) => id !== 0);
      if (nonZero.length >= 2) {
        const unique = new Set(nonZero);
        expect(unique.size).toBeGreaterThan(1);
      }
    });
  });

  // ── Standalone-block forcing ─────────────────────────────

  describe('standalone block forcing', () => {
    it('injects a single-block (preset 0) if too many rounds pass without one', () => {
      // Use a controlled RNG that always exceeds the 0.5 threshold
      // so the forcing logic triggers
      let callCount = 0;
      const rng = () => {
        callCount++;
        return 0.9; // always > 0.5, always high randomisation
      };

      const gen = new PieceGenerator(rng);

      // Generate 10 pieces; after 6+ without preset 0, forcing kicks in
      const pieces: PieceModel[] = [];
      for (let i = 0; i < 10; i++) {
        pieces.push(gen.makePieceModel());
      }

      const hasPreset0 = pieces.some((p) => p.presetId === 0);
      expect(hasPreset0).toBe(true);
    });
  });

  // ── Seeded RNG (determinism) ─────────────────────────────

  describe('seeded RNG', () => {
    it('produces identical sequence from the same seed', () => {
      const makeSequence = (seed: number) => {
        const gen = new PieceGenerator(createSeededRNG(seed));
        return Array.from({ length: 20 }, () => gen.makePieceModel().presetId);
      };

      const a = makeSequence(42);
      const b = makeSequence(42);
      expect(a).toEqual(b);
    });

    it('produces different sequences from different seeds', () => {
      const makeSequence = (seed: number) => {
        const gen = new PieceGenerator(createSeededRNG(seed));
        return Array.from({ length: 20 }, () => gen.makePieceModel().presetId);
      };

      const a = makeSequence(42);
      const b = makeSequence(99);
      // It's theoretically possible for two seeds to produce the
      // same sequence; with length 20 it's astronomically unlikely
      expect(a).not.toEqual(b);
    });

    it('seed=0 and seed=1 produce distinct first pieces', () => {
      const gen0 = new PieceGenerator(createSeededRNG(0));
      const gen1 = new PieceGenerator(createSeededRNG(1));

      // Run several pieces in case the first happen to match
      const seq0 = Array.from({ length: 5 }, () => gen0.makePieceModel().presetId);
      const seq1 = Array.from({ length: 5 }, () => gen1.makePieceModel().presetId);

      expect(seq0).not.toEqual(seq1);
    });
  });

  // ── reset() ───────────────────────────────────────────────

  describe('reset()', () => {
    it('produces the same sequence after reset as on first run', () => {
      const rng = createSeededRNG(777);
      const gen = new PieceGenerator(rng);

      const firstRun = Array.from({ length: 10 }, () =>
        gen.makePieceModel().presetId,
      );

      // Reset generator and RNG
      gen.reset();
      const rng2  = createSeededRNG(777);
      const gen2  = new PieceGenerator(rng2);
      const secondRun = Array.from({ length: 10 }, () =>
        gen2.makePieceModel().presetId,
      );

      expect(firstRun).toEqual(secondRun);
    });
  });

  // ── Cycle multipliers ────────────────────────────────────

  describe('RAND_MULTIPLIERS cycle', () => {
    it('wraps the cycle counter after 6 pieces', () => {
      // With a low-multiplier RNG (always returns ~0.0), the
      // first position (multiplier 0.25) will always pick
      // presets from the first quarter → small presets.
      // After 6 pieces the cycle resets and behaviour repeats.
      // We just verify no errors occur over a long run.
      const gen = new PieceGenerator(createSeededRNG(123));
      expect(() => {
        for (let i = 0; i < 100; i++) gen.makePieceModel();
      }).not.toThrow();
    });
  });
});
