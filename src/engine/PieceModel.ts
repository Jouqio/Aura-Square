// ============================================================
// PieceModel.ts
// Jouqio Square — Piece data model
// Ported from: fts.PieceModel (PieceModel.js)
// Owner: Syauqi Nuzul Abdi
// ============================================================
//
// MIGRATION NOTES
// ───────────────
// • cc.Class.extend({...}) → ES6 class
// • core.mathHelpers.generateUniqueIdentifier() → generateUniqueId()
// • core.arrayHelpers.clone(row) → row.slice()
// • fts.PieceModel.PRESETS → imported PIECE_PRESETS constant
// • Static factory `getRandom` now accepts optional seeded RNG
// • BOMB_PRESET / SINGLE_BLOCK_PRESET are now static getters to
//   avoid the "create instance before class is defined" ES5 footgun
// ─────────────────────────────────────────────────────────────

import { generateUniqueId } from '../utils/mathUtils';
import {
  PIECE_PRESETS,
  PRESET_COUNT,
  SINGLE_BLOCK_MATRIX,
  BOMB_MATRIX,
} from './piecePresets';
import type { TileMatrix, PieceSnapshot } from '../types/engine.types';

export class PieceModel {
  // ── Public fields (kept public to match original API) ───────

  /** Runtime-unique identifier — refreshed on every rotate(). */
  uuid: string;

  /**
   * Index into PIECE_PRESETS.
   * -1 means the piece was built from a custom matrix.
   */
  presetId: number;

  /**
   * 2-D tile matrix.
   * 0 = empty; any other positive integer = filled (colour index).
   */
  tiles: TileMatrix;

  // ── Constructor ─────────────────────────────────────────────

  /**
   * @param presetId  Optional preset index (0–20).
   *                  When omitted the piece is initialised with
   *                  an empty 1×1 matrix; call `setFromPreset` or
   *                  `setCustomMatrix` before use.
   */
  constructor(presetId?: number) {
    this.uuid     = generateUniqueId();
    this.presetId = -1;
    this.tiles    = [[0]];

    if (presetId !== undefined) {
      this.setFromPreset(presetId);
    }
  }

  // ── Dimension helpers ───────────────────────────────────────

  /** Number of rows in the tile matrix. */
  get totalLines(): number {
    return this.tiles.length;
  }

  /** Number of columns in the tile matrix. */
  get totalRows(): number {
    return this.tiles[0].length;
  }

  /** @deprecated Use `totalLines` — matches original `getTotalLines()`. */
  getTotalLines(): number { return this.totalLines; }

  /** @deprecated Use `totalRows` — matches original `getTotalRows()`. */
  getTotalRows(): number  { return this.totalRows;  }

  // ── Shape queries ───────────────────────────────────────────

  /**
   * Return `true` when every cell in the matrix is filled AND
   * the matrix is square (rows === cols).
   *
   * Used by the renderer to apply a "solid square" visual effect.
   */
  isSquare(): boolean {
    if (this.totalLines !== this.totalRows) return false;

    for (let i = 0; i < this.totalLines; i++) {
      for (let j = 0; j < this.totalRows; j++) {
        if (this.tiles[i][j] === 0) return false;
      }
    }
    return true;
  }

  /**
   * Count non-zero cells.
   *
   * Used by the score engine: placing a piece awards
   * `getTileCount()` base points.
   */
  getTileCount(): number {
    let count = 0;
    for (const row of this.tiles) {
      for (const cell of row) {
        if (cell !== 0) count++;
      }
    }
    return count;
  }

  // ── Mutation ────────────────────────────────────────────────

  /**
   * Load a standard preset shape by index.
   * Deep-copies the preset so mutations don't affect the constant.
   */
  setFromPreset(presetId: number): void {
    this.presetId = presetId;
    const preset  = PIECE_PRESETS[presetId];
    this.tiles    = preset.map((row) => row.slice());
  }

  /**
   * Apply an arbitrary matrix.
   * Used for the bomb item and tutorial custom states.
   */
  setCustomMatrix(matrix: TileMatrix): void {
    this.presetId = -1;
    this.tiles    = matrix.map((row) => row.slice());
  }

  /**
   * Rotate the tile matrix 90° in the requested direction.
   *
   * The uuid is refreshed so downstream consumers (React keys,
   * Zustand selectors) automatically detect the change without
   * deep equality checks.
   *
   * @param clockwise  Default `false` (counter-clockwise).
   */
  rotate(clockwise = false): void {
    const rows = this.totalLines;
    const cols = this.totalRows;

    // Allocate destination matrix (transposed dimensions)
    const rotated: TileMatrix = Array.from({ length: cols }, () =>
      new Array<number>(rows).fill(0),
    );

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (clockwise) {
          rotated[j][rows - 1 - i] = this.tiles[i][j];
        } else {
          rotated[cols - 1 - j][i] = this.tiles[i][j];
        }
      }
    }

    this.tiles = rotated;
    this.uuid  = generateUniqueId(); // invalidate caches
  }

  // ── Serialisation ───────────────────────────────────────────

  /**
   * Return a plain-object snapshot for Firestore / IndexedDB.
   */
  getDataForSaving(): PieceSnapshot {
    return {
      presetId: this.presetId,
      tiles:    this.tiles.map((row) => row.slice()),
    };
  }

  /**
   * Restore from a saved snapshot.
   * uuid is intentionally refreshed so the restored piece gets
   * a new identity (prevents stale React key collisions).
   */
  loadDataFrom(snapshot: PieceSnapshot): void {
    this.presetId = snapshot.presetId;
    this.tiles    = snapshot.tiles.map((row) => row.slice());
    this.uuid     = generateUniqueId();
  }

  // ── Static factories ────────────────────────────────────────

  /**
   * Create a random piece from the standard presets.
   *
   * @param rng  Optional seeded RNG — pass `createSeededRNG(seed)()`
   *             for daily challenges or multiplayer sessions.
   *             Defaults to `Math.random`.
   */
  static getRandom(rng: () => number = Math.random): PieceModel {
    const id = Math.floor(rng() * PRESET_COUNT);
    return new PieceModel(id);
  }

  /** 1×1 single-block boost piece (always fresh instance). */
  static getSingleBlock(): PieceModel {
    const p = new PieceModel();
    p.setCustomMatrix(SINGLE_BLOCK_MATRIX);
    return p;
  }

  /**
   * 3×3 bomb piece (tile value 11 = explosion marker).
   * Always fresh so callers can mutate independently.
   */
  static getBomb(): PieceModel {
    const p = new PieceModel();
    p.setCustomMatrix(BOMB_MATRIX);
    return p;
  }

  /** Total number of available standard presets. */
  static get PRESET_COUNT(): number {
    return PRESET_COUNT;
  }

  /** Read-only reference to the presets array. */
  static get PRESETS(): typeof PIECE_PRESETS {
    return PIECE_PRESETS;
  }
}
