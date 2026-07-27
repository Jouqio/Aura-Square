// ============================================================
// useGame.ts — Phase 7.1 (hardened against stale-closure game-over bugs)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// CRITICAL FIX: placePiece/checkGameOver now read `pieces` and
// `comboCount` directly from useGameStore.getState() instead of
// from React-state closures. A closure-captured value can only
// be as fresh as the render that created the callback; reading
// getState() is always the true, current value at the exact
// moment the code runs, with zero risk of acting on stale piece
// data. This also makes placePiece's identity 100% stable (no
// more `pieces`/`comboCount` in its dependency array), which
// means useDragDrop's pointer listeners never get torn down and
// re-subscribed mid-session — removing an entire class of
// potential drag/drop race conditions.

import { useRef, useCallback, useEffect } from 'react';
import { TileGridModel }    from '../engine/TileGridModel';
import { PieceModel }       from '../engine/PieceModel';
import { PieceGenerator }   from '../engine/PieceGenerator';
import { computeScore, findPossibleMove } from '../engine/ScoreEngine';
import { createSeededRNG }  from '../utils/mathUtils';
import {
  useGameStore,
  selectStatus, selectGrid, selectPieces,
  selectScore, selectBestScore, selectComboCount,
  selectHasSavedGame,
} from '../store/gameStore';
import { GRID_SIZE, NUM_PIECES, TILE_COLORS } from '../constants/game.constants';
import { useHaptics } from './useHaptics';
import { useAudio }   from './useAudio';
import { useStatsStore } from '../store/statsStore';
import type { CellCoord, PieceSnapshot } from '../types/engine.types';

const DEBUG_GAME_OVER = import.meta.env.DEV;

export function useGame() {
  const gridRef      = useRef(new TileGridModel(GRID_SIZE));
  const generatorRef = useRef(new PieceGenerator());

  const status      = useGameStore(selectStatus);
  const grid        = useGameStore(selectGrid);
  const pieces      = useGameStore(selectPieces);
  const score       = useGameStore(selectScore);
  const bestScore   = useGameStore(selectBestScore);
  const comboCount  = useGameStore(selectComboCount);
  const hasSavedGame= useGameStore(selectHasSavedGame);
  const haptics     = useHaptics();
  const audio       = useAudio();

  useEffect(() => {
    const saved = useGameStore.getState();
    if (saved.status === 'playing' || saved.status === 'paused') {
      gridRef.current.loadDataFrom(saved.grid);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateTray = useCallback((): PieceSnapshot[] =>
    Array.from({ length: NUM_PIECES }, () =>
      generatorRef.current.makePieceModel().getDataForSaving(),
    ), []);

  /**
   * Start a new game.
   * @param seed Optional seed for deterministic (daily challenge) mode.
   */
  const startGame = useCallback((seed?: number) => {
    gridRef.current.reset();
    generatorRef.current = seed !== undefined
      ? new PieceGenerator(createSeededRNG(seed))
      : new PieceGenerator();
    const tray = generateTray();
    const { resetGame, setGrid, setPieces, setStatus } = useGameStore.getState();
    resetGame();
    setGrid(gridRef.current.getDataForSaving());
    setPieces(tray);
    setStatus('playing');
  }, [generateTray]);

  const resumeGame  = useCallback(() => useGameStore.getState().setStatus('playing'), []);
  const pauseGame   = useCallback(() => useGameStore.getState().setStatus('paused'),  []);
  const unpauseGame = useCallback(() => useGameStore.getState().setStatus('playing'), []);

  /**
   * GAME OVER HAPPENS IF AND ONLY IF: none of the pieces currently
   * in the tray can be placed at ANY (row, col) on the board.
   * This checks every piece × every cell — exhaustively — against
   * the live grid. There is no other condition (score, move count,
   * partial board fill, single-piece failure) that triggers it.
   */
  const checkGameOver = useCallback((piecesData: (PieceSnapshot | null)[]) => {
    const live = piecesData
      .filter((p): p is PieceSnapshot => p !== null)
      .map((p) => { const m = new PieceModel(); m.loadDataFrom(p); return m; });

    if (DEBUG_GAME_OVER) {
      console.log('[checkGameOver] pieces to check:', live.length, live.map((p) => p.presetId));
    }

    // Defensive guard: an empty piece list should never legitimately
    // happen mid-game (the tray auto-refills before it can go empty).
    // If it ever does, treat it as "not game over" rather than
    // trusting an empty for-loop to vacuously declare game over —
    // this protects against any stale-pieces edge case upstream.
    if (live.length === 0) {
      if (DEBUG_GAME_OVER) console.warn('[checkGameOver] no pieces to check — skipping, NOT game over');
      return false;
    }

    for (const piece of live) {
      for (let i = 0; i < gridRef.current.size; i++) {
        for (let j = 0; j < gridRef.current.size; j++) {
          if (DEBUG_GAME_OVER) console.log('[checkGameOver] checking piece', piece.presetId, 'at', i, j);
          if (gridRef.current.canFit(piece, i, j)) {
            if (DEBUG_GAME_OVER) console.log('[checkGameOver] valid move found at', i, j);
            return false;
          }
        }
      }
    }

    if (DEBUG_GAME_OVER) console.warn('[checkGameOver] no valid moves — genuine game over');
    useGameStore.getState().setStatus('game_over');
    return true;
  }, []);

  const placePiece = useCallback((slotIndex: number, targetI: number, targetJ: number): boolean => {
    // Read the absolute latest pieces/comboCount directly from the
    // store rather than from this callback's closure. See the file
    // header comment for why this matters.
    const { pieces: currentPieces, comboCount: currentCombo } = useGameStore.getState();

    const pieceData = currentPieces[slotIndex];
    if (!pieceData) return false;

    const piece = new PieceModel();
    piece.loadDataFrom(pieceData);
    if (!gridRef.current.canFit(piece, targetI, targetJ)) return false;

    const result = computeScore(gridRef.current, piece, targetI, targetJ, currentCombo);
    gridRef.current.fit(piece, targetI, targetJ);
    useStatsStore.getState().recordPiecePlaced(piece.presetId);

    const placedCells: CellCoord[] = [];
    for (let r = 0; r < piece.tiles.length; r++)
      for (let c = 0; c < (piece.tiles[r]?.length ?? 0); c++)
        if ((piece.tiles[r]?.[c] ?? 0) !== 0)
          placedCells.push([targetI + r, targetJ + c]);

    for (const seq of result.sequences) {
      for (let k = 0; k < GRID_SIZE; k++) {
        if (seq.type === 'line')   gridRef.current.clearField(seq.index, k);
        else                        gridRef.current.clearField(k, seq.index);
      }
    }

    const newPieces = [...currentPieces] as (PieceSnapshot | null)[];
    newPieces[slotIndex] = null;
    if (newPieces.every((p): boolean => p === null)) {
      const fresh = generateTray();
      fresh.forEach((p, i) => { newPieces[i] = p; });
    }

    const newCombo = currentCombo + result.sequences.length;
    const {
      setGrid, setPieces, addScore, setComboCount,
      setLastPlaced, setLastCleared, triggerCombo,
    } = useGameStore.getState();
    setGrid(gridRef.current.getDataForSaving());
    setPieces(newPieces);
    addScore(result.total);
    setComboCount(newCombo);
    setLastPlaced(placedCells);
    setLastCleared(result.sequences);

    haptics.place();
    audio.place();
    if (result.sequences.length > 0) {
      haptics.clear();
      audio.clear();
      const LABELS = ['','','DOUBLE!','TRIPLE!','QUAD!!'];
      if (result.sequences.length >= 2) {
        haptics.combo();
        audio.combo(result.sequences.length);
        triggerCombo(LABELS[result.sequences.length] ?? 'COMBO!!');
      }
    }

    // Only the pieces tray actually changed by this exact move are
    // checked for game over — using the SAME newPieces array that
    // was just committed to the store, so there is zero chance of
    // checking against an out-of-date tray.
    checkGameOver(newPieces);
    return true;
  }, [generateTray, checkGameOver, haptics, audio]);

  const getPieceColor = useCallback((pd: PieceSnapshot | null): string => {
    if (!pd) return '#888';
    const v = pd.tiles.flat().find((v) => v > 0);
    return v ? (TILE_COLORS[v] ?? '#888') : '#888';
  }, []);

  const canPieceFitAnywhere = useCallback((pd: PieceSnapshot | null): boolean => {
    if (!pd) return false;
    const piece = new PieceModel(); piece.loadDataFrom(pd);
    return findPossibleMove(gridRef.current, [piece]) !== null;
  }, []);

  const canFitAt = useCallback((pd: PieceSnapshot, i: number, j: number): boolean => {
    const piece = new PieceModel(); piece.loadDataFrom(pd);
    return gridRef.current.canFit(piece, i, j);
  }, []);

  return {
    grid, pieces, score, bestScore, comboCount, status, hasSavedGame,
    startGame, resumeGame, pauseGame, unpauseGame, placePiece,
    getPieceColor, canFitAt, canPieceFitAnywhere,
  };
}
