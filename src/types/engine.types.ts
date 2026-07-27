// ============================================================
// engine.types.ts
// Jouqio Square — Core engine type definitions
// Owner: Syauqi Nuzul Abdi
// ============================================================

// ── Grid ─────────────────────────────────────────────────────

/** A single row in a grid or piece matrix */
export type TileRow = number[];

/** 2-D matrix of tile values (0 = empty) */
export type TileMatrix = TileRow[];

/** Zero-indexed [row, col] coordinate pair */
export type CellCoord = [row: number, col: number];

/** Snapshot returned by TileGridModel.getDataForSaving() */
export type GridSnapshot = TileMatrix;

// ── Piece ─────────────────────────────────────────────────────

/** All data needed to persist and restore a PieceModel */
export interface PieceSnapshot {
  presetId: number;
  tiles: TileMatrix;
}

/** Direction for PieceModel.rotate() */
export type RotateDirection = 'clockwise' | 'counter-clockwise';

// ── Game state ────────────────────────────────────────────────

/** Full game state as persisted to storage */
export interface GameStateSnapshot {
  score: number;
  gridModel: GridSnapshot;
  pieceModels: PieceSnapshot[];
}

// ── Clearance ─────────────────────────────────────────────────

export const SequenceType = {
  LINE:   'line',
  COLUMN: 'column',
} as const;

export type SequenceType = (typeof SequenceType)[keyof typeof SequenceType];

/** One fully-cleared row or column */
export interface ClearedSequence {
  type:   SequenceType;
  index:  number;   // Which row / column index was cleared
  coins:  number;   // Coins awarded for this clear
  combo:  number;   // Combo multiplier at time of clear
}

// ── Score engine ──────────────────────────────────────────────

export interface ScoreResult {
  basePts:    number;
  clearBonus: number;
  comboBonus: number;
  total:      number;
  sequences:  ClearedSequence[];
}

// ── Piece generator ──────────────────────────────────────────

/** Seeded-RNG state shape (Mulberry32) */
export interface RNGState {
  seed: number;
}
