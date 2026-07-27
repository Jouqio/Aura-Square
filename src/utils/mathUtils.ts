// ============================================================
// mathUtils.ts
// Jouqio Square — Math utility functions
// Ported from: core.mathHelpers (MathHelpers.js)
// Owner: Syauqi Nuzul Abdi
// ============================================================

/**
 * Clamp a value between min and max (inclusive).
 *
 * @example clamp(15, 0, 10) → 10
 * @example clamp(-5, 0, 10) → 0
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Return true when min < val < max (exclusive bounds).
 */
export function isBetween(val: number, min: number, max: number): boolean {
  return val > min && val < max;
}

/**
 * Return true when min ≤ val ≤ max (inclusive bounds).
 *
 * Used throughout the grid placement checks.
 */
export function isEqualOrBetween(
  val: number,
  min: number,
  max: number,
): boolean {
  return val >= min && val <= max;
}

// ── UUID helpers ─────────────────────────────────────────────

let _uuidCounter = 0;

/**
 * Generate a runtime-unique number.
 *
 * Replaces `core.mathHelpers.generateUniqueIdentifier()`.
 * Uses crypto.randomUUID when available (browser / Node ≥ 19),
 * falls back to a monotonic counter + Math.random().
 */
export function generateUniqueId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  _uuidCounter++;
  return `${_uuidCounter}-${Math.random().toString(36).slice(2)}`;
}

// ── Seeded RNG (Mulberry32) ──────────────────────────────────

/**
 * Create a deterministic pseudo-random number generator seeded
 * with the given integer.  Returns a function that produces a
 * float in [0, 1) on every call — identical to Math.random()
 * in interface but fully reproducible for daily challenges and
 * multiplayer sessions.
 *
 * Algorithm: Mulberry32 — fast, small, good statistical quality.
 *
 * @example
 *   const rng = createSeededRNG(42);
 *   rng(); // always 0.6270742775872648 for seed=42
 */
export function createSeededRNG(seed: number): () => number {
  let s = seed >>> 0; // force unsigned 32-bit
  return function (): number {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
