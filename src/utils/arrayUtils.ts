// ============================================================
// arrayUtils.ts
// Jouqio Square — Array utility functions
// Ported from: core.arrayHelpers (ArrayHelpers.js)
// Owner: Syauqi Nuzul Abdi
// ============================================================

/**
 * Shallow-clone a 1-D array (preserves numeric indices).
 *
 * Replaces `core.arrayHelpers.clone(array)`.
 * The original used a for-in loop which can iterate inherited
 * enumerable keys; this version is safe and explicit.
 */
export function cloneRow<T>(row: T[]): T[] {
  return row.slice();
}

/**
 * Deep-clone a 2-D matrix (array of arrays).
 *
 * Used when copying piece tile matrices to avoid shared references.
 */
export function cloneMatrix<T>(matrix: T[][]): T[][] {
  return matrix.map((row) => row.slice());
}

/**
 * Fisher–Yates in-place shuffle.
 *
 * Replaces `core.arrayHelpers.shuffle(array)`.
 * Accepts an optional RNG function so callers can pass a seeded
 * generator for reproducible results.
 *
 * @param array   Array to shuffle (mutated in place)
 * @param rng     RNG returning a float in [0,1); defaults to Math.random
 */
export function shuffle<T>(array: T[], rng: () => number = Math.random): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Convert a plain object's own enumerable values to an array.
 *
 * Replaces `core.arrayHelpers.fromObject(object)`.
 */
export function fromObject<T>(object: Record<string, T>): T[] {
  return Object.values(object);
}
