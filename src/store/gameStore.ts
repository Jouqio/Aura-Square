// ============================================================
// gameStore.ts
// Aura Square — Game state (Zustand + localStorage persist)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import { create }                         from 'zustand';
import { persist, createJSONStorage }     from 'zustand/middleware';
import { subscribeWithSelector }          from 'zustand/middleware';
import type { TileMatrix, ClearedSequence, CellCoord } from '../types/engine.types';
import type { PieceSnapshot }             from '../types/engine.types';
import { GRID_SIZE, GAME_STORAGE_KEY } from '../constants/game.constants';

// Tracks the pending auto-hide timer for the combo toast so a new
// combo can cancel/replace an in-flight hide from a previous one.
let comboHideTimer: ReturnType<typeof setTimeout> | null = null;
const COMBO_TOAST_DURATION = 1400; // ms — matches ComboToast's pop+hold+exit feel

// ── Types ─────────────────────────────────────────────────────

export type GameStatus =
  | 'idle'        // never started
  | 'welcome'     // welcome screen
  | 'playing'     // in progress
  | 'paused'      // paused
  | 'game_over';  // game over

/** Floating score pop event (transient, not persisted). */
export interface ScorePopEvent {
  id:    string;
  value: number;
  x:     number;
  y:     number;
  combo: boolean;
}

/** Line-clear shockwave ring event (transient, not persisted). */
export interface ShockwaveEvent {
  id:        string;
  x:         number;
  y:         number;
  axis:      'row' | 'col';
  intensity: number; // 1 = single line, 2+ = combo (bigger/brighter)
}

// ── Empty grid helper ─────────────────────────────────────────

function emptyGrid(): TileMatrix {
  return Array.from({ length: GRID_SIZE }, () =>
    new Array<number>(GRID_SIZE).fill(0),
  );
}

// ── State & actions ───────────────────────────────────────────

interface GameState {
  // ── Persisted game state ──────────────────────────────────
  grid:       TileMatrix;
  pieces:     (PieceSnapshot | null)[];
  score:      number;
  bestScore:  number;
  comboCount: number;
  status:     GameStatus;

  // ── Transient animation state (not persisted) ─────────────
  lastPlacedCells:      CellCoord[];
  lastClearedSequences: ClearedSequence[];
  scorePops:            ScorePopEvent[];
  shockwaves:           ShockwaveEvent[];
  comboKey:             string;   // keyed string to re-trigger toast
  comboLabel:           string;   // e.g. "DOUBLE!" "TRIPLE!"

  // ── Actions ───────────────────────────────────────────────
  setGrid:          (grid: TileMatrix)                    => void;
  setPieces:        (pieces: (PieceSnapshot | null)[])    => void;
  pushShockwave:    (wave: ShockwaveEvent)                 => void;
  removeShockwave:  (id: string)                           => void;
  setStatus:        (status: GameStatus)                  => void;
  setComboCount:    (n: number)                           => void;
  setBestScore:     (n: number)                           => void;
  addScore:         (pts: number)                         => void;

  // Animation triggers
  setLastPlaced:    (cells: CellCoord[])                  => void;
  setLastCleared:   (seqs: ClearedSequence[])             => void;
  pushScorePop:     (pop: ScorePopEvent)                  => void;
  removeScorePop:   (id: string)                          => void;
  triggerCombo:     (label: string)                       => void;

  // Full reset (keeps bestScore)
  resetGame:        ()                                    => void;
}

// ── Store ─────────────────────────────────────────────────────

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        // ── Initial state ─────────────────────────────────
        grid:       emptyGrid(),
        pieces:     [null, null, null],
        score:      0,
        bestScore:  0,
        comboCount: 0,
        status:     'idle',

        // Transient
        lastPlacedCells:      [],
        lastClearedSequences: [],
        scorePops:            [],
        shockwaves:           [],
        comboKey:             '',
        comboLabel:           '',

        // ── Actions ───────────────────────────────────────
        setGrid:    (grid)    => set({ grid }),
        setPieces:  (pieces)  => set({ pieces }),
        setStatus:  (status)  => set({ status }),
        setComboCount: (comboCount) => set({ comboCount }),
        setBestScore:  (bestScore)  => set({ bestScore }),

        addScore: (pts) =>
          set((s) => {
            const score    = s.score + pts;
            const bestScore = score > s.bestScore ? score : s.bestScore;
            return { score, bestScore };
          }),

        setLastPlaced: (lastPlacedCells) => set({ lastPlacedCells }),

        setLastCleared: (lastClearedSequences) =>
          set({ lastClearedSequences }),

        pushScorePop: (pop) =>
          set((s) => ({ scorePops: [...s.scorePops, pop] })),

        removeScorePop: (id) =>
          set((s) => ({ scorePops: s.scorePops.filter((p) => p.id !== id) })),

        pushShockwave: (wave) =>
          set((s) => ({ shockwaves: [...s.shockwaves, wave] })),

        removeShockwave: (id) =>
          set((s) => ({ shockwaves: s.shockwaves.filter((w) => w.id !== id) })),

        triggerCombo: (label) => {
          const key = `${Date.now()}-${label}`;
          set({ comboKey: key, comboLabel: label });

          // Auto-hide after the toast has had time to animate in,
          // hold, and animate out. Without this, comboLabel/comboKey
          // is never reset and the toast (e.g. "TRIPLE!!") stays
          // frozen on screen until the next combo or a new game.
          if (comboHideTimer) clearTimeout(comboHideTimer);
          comboHideTimer = setTimeout(() => {
            // Only clear if no newer combo has been triggered meanwhile
            if (useGameStore.getState().comboKey === key) {
              set({ comboLabel: '' });
            }
          }, COMBO_TOAST_DURATION);
        },

        resetGame: () =>
          set((s) => ({
            grid:                 emptyGrid(),
            pieces:               [null, null, null],
            score:                0,
            comboCount:           0,
            status:               'idle',
            lastPlacedCells:      [],
            lastClearedSequences: [],
            scorePops:            [],
            shockwaves:           [],
            comboKey:             '',
            comboLabel:           '',
            // Keep bestScore intact
            bestScore:            s.bestScore,
          })),
      }),

      // ── Persistence config ────────────────────────────────
      {
        name:    GAME_STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        // Only persist game progress fields
        partialize: (s) => ({
          grid:       s.grid,
          pieces:     s.pieces,
          score:      s.score,
          bestScore:  s.bestScore,
          comboCount: s.comboCount,
          // Persist 'playing' and 'paused'; reset 'game_over'
          status: s.status === 'game_over' ? 'idle' : s.status,
        }),
      },
    ),
  ),
);

// ── Selectors ─────────────────────────────────────────────────

export const selectGrid          = (s: GameState) => s.grid;
export const selectPieces        = (s: GameState) => s.pieces;
export const selectScore         = (s: GameState) => s.score;
export const selectBestScore     = (s: GameState) => s.bestScore;
export const selectComboCount    = (s: GameState) => s.comboCount;
export const selectStatus        = (s: GameState) => s.status;
export const selectLastPlaced    = (s: GameState) => s.lastPlacedCells;
export const selectLastCleared   = (s: GameState) => s.lastClearedSequences;
export const selectScorePops     = (s: GameState) => s.scorePops;
export const selectShockwaves    = (s: GameState) => s.shockwaves;
export const selectComboKey      = (s: GameState) => s.comboKey;
export const selectComboLabel    = (s: GameState) => s.comboLabel;
export const selectHasSavedGame  = (s: GameState) =>
  (s.status === 'playing' || s.status === 'paused') && s.score > 0;
