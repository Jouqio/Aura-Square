// ============================================================
// TileGrid.tsx
// Aura Square — 8×8 game grid
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, {
  forwardRef, useEffect, useRef, useCallback, memo,
} from 'react';
import { TileCell }  from './TileCell';
import { GRID_SIZE, ANIM } from '../../../constants/game.constants';
import type { TileMatrix, ClearedSequence, CellCoord } from '../../../types/engine.types';
import type { GhostCell }  from '../../../hooks/useDragDrop';

interface TileGridProps {
  grid:             TileMatrix;
  ghostMap:         Map<string, GhostCell>;
  lastPlacedCells:  CellCoord[];
  lastClearedSeqs:  ClearedSequence[];
  hintCells?:       Set<string>;   // 'i-j' keys — Hint feature highlight
}

export const TileGrid = memo(forwardRef<HTMLDivElement, TileGridProps>(
  function TileGrid(
    { grid, ghostMap, lastPlacedCells, lastClearedSeqs, hintCells },
    ref,
  ) {
    // ── Track which cells are animating ───────────────────
    const placingRef  = useRef(new Set<string>());
    const clearingRef = useRef(new Set<string>());
    const forceUpdate = useCallback(() => {
      // Trigger a re-render by using a counter stored in a ref
      (ref as React.RefObject<HTMLDivElement>)?.current?.setAttribute(
        'data-anim', Date.now().toString(),
      );
    }, [ref]);

    // ── Placement animation ───────────────────────────────
    useEffect(() => {
      if (lastPlacedCells.length === 0) return;
      lastPlacedCells.forEach(([i, j]) => {
        placingRef.current.add(`${i}-${j}`);
      });
      const timer = setTimeout(() => {
        lastPlacedCells.forEach(([i, j]) => {
          placingRef.current.delete(`${i}-${j}`);
        });
      }, ANIM.CELL_POP);
      return () => clearTimeout(timer);
    }, [lastPlacedCells]);

    // ── Clearance animation ───────────────────────────────
    useEffect(() => {
      if (lastClearedSeqs.length === 0) return;
      lastClearedSeqs.forEach((seq) => {
        for (let k = 0; k < GRID_SIZE; k++) {
          const i = seq.type === 'line'   ? seq.index : k;
          const j = seq.type === 'column' ? seq.index : k;
          clearingRef.current.add(`${i}-${j}`);
        }
      });
      const timer = setTimeout(() => {
        lastClearedSeqs.forEach((seq) => {
          for (let k = 0; k < GRID_SIZE; k++) {
            const i = seq.type === 'line'   ? seq.index : k;
            const j = seq.type === 'column' ? seq.index : k;
            clearingRef.current.delete(`${i}-${j}`);
          }
        });
        forceUpdate();
      }, ANIM.CELL_CLEAR + 50);
      return () => clearTimeout(timer);
    }, [lastClearedSeqs, forceUpdate]);

    // ── Render ────────────────────────────────────────────
    return (
      <div
        ref={ref}
        className="tile-grid"
        style={{ touchAction: 'none' }}
      >
        {Array.from({ length: GRID_SIZE }, (_, i) =>
          Array.from({ length: GRID_SIZE }, (_, j) => {
            const key      = `${i}-${j}`;
            const value    = (grid[i]?.[j]) ?? 0;
            const ghost    = ghostMap.get(key);
            const isPlace  = placingRef.current.has(key);
            const isClear  = clearingRef.current.has(key);
            const isHint   = hintCells?.has(key) ?? false;

            return (
              <TileCell
                key={key}
                value={value}
                isPlacing={isPlace}
                isClearing={isClear}
                isHint={isHint}
                ghost={ghost}
              />
            );
          }),
        )}
      </div>
    );
  },
));
