// ============================================================
// PieceGenerator.ts
// Jouqio Square — Weighted, recency-aware piece sequence generator
// Ported from: fts.PieceGenerator (PieceGenerator.js)
// Owner: Syauqi Nuzul Abdi
// ============================================================
//
// MIGRATION NOTES
// ───────────────
// • cc.Class.extend({...}) → ES6 class
// • Math.random() → injectable RNG (supports seeded mode)
// • core.mathHelpers.clamp → clamp (local import)
// • All fts.* namespace references removed
// • fts.PieceGenerator.RandMultipliers → RAND_MULTIPLIERS constant
//
// SEEDED MODE (new)
// ─────────────────
// Pass a seeded RNG from `createSeededRNG(seed)` so that all
// players in a multiplayer room see the same piece sequence, or
// so daily challenges are reproducible across all clients.
// ─────────────────────────────────────────────────────────────

import { clamp } from '../utils/mathUtils';
import { PieceModel } from './PieceModel';

// ── Constants ─────────────────────────────────────────────────

/**
 * Probability multipliers for each cycle position.
 * After every 6 pieces the cycle resets to position 0.
 *
 * At 0.25 only the first 25% of presets are reachable (small
 * pieces), at 1.0 all presets are reachable.
 * This creates a natural difficulty ramp within each cycle.
 *
 * Directly ported from `fts.PieceGenerator.RandMultipliers`.
 */
const RAND_MULTIPLIERS: readonly number[] = [0.25, 0.5, 1, 0.3, 0.8, 0.6];

/** How many recent presets to remember (avoids repetition). */
const RECENT_HISTORY_SIZE = 6;

/** Force a single-block piece if none appeared for this many rounds. */
const STANDALONE_FORCE_THRESHOLD = 5;

// ── PieceGenerator class ─────────────────────────────────────

export class PieceGenerator {
  // ── Private state ──────────────────────────────────────────

  /** Current position in the RAND_MULTIPLIERS cycle. */
  private _count: number = -1;

  /** Ring buffer of recently used preset IDs (excludes preset 0). */
  private _recentPresets: number[] = [];

  /** Counter tracking rounds without a single-block piece. */
  private _roundsSinceLastStandaloneBlock: number = 0;

  /** Injected RNG — either Math.random or a seeded generator. */
  private _rng: () => number;

  // ── Constructor ─────────────────────────────────────────────

  /**
   * @param rng  Random-number generator returning a float in [0,1).
   *             Pass `createSeededRNG(seed)` for reproducible sequences.
   *             Defaults to `Math.random`.
   */
  constructor(rng: () => number = Math.random) {
    this._rng = rng;
  }

  // ── Public API ──────────────────────────────────────────────

  /**
   * Generate the next piece in the sequence.
   *
   * Logic (mirrors original exactly):
   * 1. Advance the multiplier cycle counter.
   * 2. If no standalone block appeared for > 5 rounds AND coin
   *    flip succeeds → force preset 0 (single block).
   * 3. Otherwise pick a weighted-random preset, skipping recents.
   * 4. Apply 0–3 random rotations.
   *
   * @returns A fresh {@link PieceModel} ready for the piece tray.
   */
  makePieceModel(): PieceModel {
    // Advance cycle (wraps at RAND_MULTIPLIERS.length)
    this._count = (this._count + 1) % RAND_MULTIPLIERS.length;

    // Decide preset
    let presetId: number;

    if (
      this._roundsSinceLastStandaloneBlock > STANDALONE_FORCE_THRESHOLD &&
      this._rng() > 0.5
    ) {
      presetId = 0; // force single-block to prevent starvation
    } else {
      presetId = this._getRandomPresetId();
    }

    // Track standalone-block drought
    if (presetId === 0) {
      this._roundsSinceLastStandaloneBlock = 0;
    } else {
      this._roundsSinceLastStandaloneBlock++;
    }

    this._addToRecentPresets(presetId);

    // Build piece and apply random rotations
    const piece = new PieceModel(presetId);
    const rotations = Math.floor(this._rng() * 4);
    for (let i = 0; i < rotations; i++) {
      piece.rotate(); // counter-clockwise (matches original default)
    }

    return piece;
  }

  /**
   * Reset generator state — call when starting a new game.
   * Preserves the injected RNG.
   */
  reset(): void {
    this._count = -1;
    this._recentPresets = [];
    this._roundsSinceLastStandaloneBlock = 0;
  }

  // ── Private helpers ─────────────────────────────────────────

  /**
   * Pick a preset index using weighted randomness.
   *
   * The effective preset pool is
   *   `Math.floor(PRESET_COUNT × multiplier)`
   * so low multipliers bias toward simpler (lower-indexed) shapes.
   *
   * After random selection, walk forward through presets until we
   * land on one that is not in the recent history.
   */
  private _getRandomPresetId(): number {
    const multiplier = RAND_MULTIPLIERS[this._count];
    const poolSize   = PieceModel.PRESET_COUNT;
    const randLimit  = poolSize * multiplier;

    let presetId = Math.floor(this._rng() * randLimit);

    // Skip presets that appeared recently
    while (this._recentPresets.includes(presetId)) {
      presetId = clamp(presetId + 1, 0, poolSize);
      if (presetId === poolSize) presetId = 0;
    }

    return presetId;
  }

  /**
   * Add a preset to the recency buffer (ignores preset 0 so
   * single-block pieces don't count toward the history).
   *
   * Buffer is capped at RECENT_HISTORY_SIZE; oldest entry evicted
   * when the cap is exceeded — mirrors the original splice(0,1).
   */
  private _addToRecentPresets(presetId: number): void {
    if (presetId === 0) return;

    this._recentPresets.push(presetId);
    if (this._recentPresets.length > RECENT_HISTORY_SIZE) {
      this._recentPresets.shift(); // O(n) but n ≤ 6, acceptable
    }
  }
}
