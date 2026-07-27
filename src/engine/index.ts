// ============================================================
// engine/index.ts
// Jouqio Square — Engine barrel export
// Owner: Syauqi Nuzul Abdi
// ============================================================
//
// Import from '@/engine' instead of deep-linking individual files.
// Keeps consumer imports stable when internal paths change.

export { TileGridModel }    from './TileGridModel';
export { PieceModel }       from './PieceModel';
export { PieceGenerator }   from './PieceGenerator';
export { computeScore, findPossibleMove } from './ScoreEngine';
export { PIECE_PRESETS, PRESET_COUNT, SINGLE_BLOCK_MATRIX, BOMB_MATRIX } from './piecePresets';
export { createSeededRNG }  from '../utils/mathUtils';
export type { ScoreEngineOptions } from './ScoreEngine';
