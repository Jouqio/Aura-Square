// ============================================================
// TileGridModel.ts
// Jouqio Square — Grid state model
// Ported from: fts.TileGridModel (TileGridModel.js)
// Owner: Syauqi Nuzul Abdi
// ============================================================
//
// MIGRATION NOTES
// ───────────────
// • cc.Class.extend({...}) → ES6 class
// • ctor() → constructor()
// • core.mathHelpers.isEqualOrBetween → isEqualOrBetween (local import)
// • No Cocos2D dependencies remain
// ─────────────────────────────────────────────────────────────

import { isEqualOrBetween } from '../utils/mathUtils';
import type { GridSnapshot, TileMatrix } from '../types/engine.types';
import type { PieceModel } from './PieceModel';

export class TileGridModel {
  // ── Internal state ──────────────────────────────────────────

  private _grid: TileMatrix;

  // ── Constructor ─────────────────────────────────────────────

  /**
   * Build an empty square grid of `gridSize × gridSize` cells.
   *
   * @param gridSize  Side length (default 8 — matches original GRID_SIZE)
   */
  constructor(gridSize: number = 8) {
    this._grid = Array.from({ length: gridSize }, () =>
      new Array(gridSize).fill(0),
    );
  }

  // ── Public accessors ────────────────────────────────────────

  /** Side length of the grid (always square). */
  get size(): number {
    return this._grid.length;
  }

  /**
   * Return the tile value at (row, col).
   * 0 means empty; any other value is a coloured tile.
   */
  getFieldValue(row: number, col: number): number {
    return this._grid[row][col];
  }

  /**
   * Return a **deep copy** of the internal grid.
   * Useful for rendering without risk of mutation.
   */
  getGrid(): TileMatrix {
    return this._grid.map((row) => row.slice());
  }

  // ── Mutation ────────────────────────────────────────────────

  /** Zero every cell — used when starting a fresh game. */
  reset(): void {
    const n = this.size;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        this._grid[i][j] = 0;
      }
    }
  }

  /** Set a single cell to zero. */
  clearField(row: number, col: number): void {
    this._grid[row][col] = 0;
  }

  // ── Piece placement ─────────────────────────────────────────

  /**
   * Check whether a piece can be placed with its top-left corner
   * at (i, j).
   *
   * @param piece           The piece to test.
   * @param i               Target row for the piece's top-left corner.
   * @param j               Target column for the piece's top-left corner.
   * @param overlapAllowed  When true, occupied cells do not block
   *                        placement (used for bomb preview rendering).
   */
  canFit(
    piece: PieceModel,
    i: number,
    j: number,
    overlapAllowed = false,
  ): boolean {
    const n = this.size;

    for (let mI = 0; mI < piece.tiles.length; mI++) {
      for (let mJ = 0; mJ < piece.tiles[mI].length; mJ++) {
        if (piece.tiles[mI][mJ] === 0) continue;

        const gI = i + mI;
        const gJ = j + mJ;

        // Out-of-bounds check
        if (
          !isEqualOrBetween(gI, 0, n - 1) ||
          !isEqualOrBetween(gJ, 0, n - 1)
        ) {
          return false;
        }

        // Occupied-cell check
        if (this._grid[gI][gJ] !== 0 && !overlapAllowed) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Place a piece onto the grid at (i, j).
   *
   * @returns `true` on success, `false` if placement is invalid.
   */
  fit(piece: PieceModel, i: number, j: number): boolean {
    if (!this.canFit(piece, i, j)) return false;

    for (let mI = 0; mI < piece.tiles.length; mI++) {
      for (let mJ = 0; mJ < piece.tiles[mI].length; mJ++) {
        const val = piece.tiles[mI][mJ];
        if (val !== 0) {
          this._grid[i + mI][j + mJ] = val;
        }
      }
    }

    return true;
  }

  /**
   * Remove the cells occupied by a piece at (i, j) — used by the
   * bomb item and undo functionality.
   *
   * @returns Always `true` (mirrors original API).
   */
  erase(piece: PieceModel, i: number, j: number): boolean {
    for (let mI = 0; mI < piece.tiles.length; mI++) {
      for (let mJ = 0; mJ < piece.tiles[mI].length; mJ++) {
        if (piece.tiles[mI][mJ] !== 0) {
          this._grid[i + mI][j + mJ] = 0;
        }
      }
    }
    return true;
  }

  // ── Serialisation ───────────────────────────────────────────

  /**
   * Return a deep-copy snapshot suitable for JSON serialisation.
   *
   * The snapshot is a plain `number[][]` — no class instances —
   * so it can be passed to `JSON.stringify()` or stored in
   * Firestore without transformation.
   */
  getDataForSaving(): GridSnapshot {
    return this._grid.map((row) => row.slice());
  }

  /**
   * Restore grid state from a previously-saved snapshot.
   *
   * @param snapshot  A `number[][]` returned by `getDataForSaving()`.
   */
  loadDataFrom(snapshot: GridSnapshot): void {
    this._grid = snapshot.map((row) => row.slice());
  }
}
