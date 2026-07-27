// ============================================================
// useDragDrop.ts
// Aura Square — Drag-and-drop system (mouse + touch)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import {
  useState, useRef, useCallback, useEffect, useMemo,
  type RefObject,
} from 'react';
import { PieceModel }  from '../engine/PieceModel';
import { TileGridModel } from '../engine/TileGridModel';
import { GRID_SIZE, TILE_COLORS } from '../constants/game.constants';
import type { PieceSnapshot, CellCoord } from '../types/engine.types';

// ── Types ─────────────────────────────────────────────────────

export interface GhostCell {
  coord:   CellCoord;
  valid:   boolean;
  color:   string;
}

export interface DragState {
  active:      boolean;
  slotIndex:   number;
  pieceData:   PieceSnapshot | null;
  pointerX:    number;
  pointerY:    number;
  ghost:       GhostCell[];
  /** Live px size of one board cell — derived from the actual
   *  rendered grid width, never hardcoded, so the floating drag
   *  ghost always matches the real board on any screen size. */
  cellSize:    number;
}

const INITIAL: DragState = {
  active:    false,
  slotIndex: -1,
  pieceData: null,
  pointerX:  0,
  pointerY:  0,
  ghost:     [],
  cellSize:  46, // sane fallback before first measurement
};

// ── Ghost calculation ─────────────────────────────────────────

function calcGhost(
  pointerX:   number,
  pointerY:   number,
  gridEl:     HTMLElement,
  gridModel:  TileGridModel,
  pieceData:  PieceSnapshot,
): GhostCell[] {
  const rect     = gridEl.getBoundingClientRect();
  const cellSize = rect.width / GRID_SIZE;
  const relX     = pointerX - rect.left;
  const relY     = pointerY - rect.top;

  const rows = pieceData.tiles.length;
  const cols  = pieceData.tiles[0]?.length ?? 0;

  // Center piece on pointer
  const targetI = Math.round(relY / cellSize - 0.5) - Math.floor(rows / 2);
  const targetJ = Math.round(relX / cellSize - 0.5) - Math.floor(cols / 2);

  const tmpPiece = new PieceModel();
  tmpPiece.loadDataFrom(pieceData);
  const valid   = gridModel.canFit(tmpPiece, targetI, targetJ);
  const firstVal = pieceData.tiles.flat().find((v) => v > 0) ?? 1;
  const color    = TILE_COLORS[firstVal] ?? '#888';

  const cells: GhostCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((pieceData.tiles[r]?.[c] ?? 0) === 0) continue;
      const gi = targetI + r;
      const gj = targetJ + c;
      if (gi < 0 || gi >= GRID_SIZE || gj < 0 || gj >= GRID_SIZE) continue;
      cells.push({ coord: [gi, gj], valid, color });
    }
  }
  return cells;
}

// ── Hook ──────────────────────────────────────────────────────

interface UseDragDropOptions {
  pieces:    (PieceSnapshot | null)[];
  gridRef:   RefObject<TileGridModel>;
  gridElRef: RefObject<HTMLDivElement>;
  onPlace:   (slotIndex: number, i: number, j: number) => void;
  enabled:   boolean;
}

export function useDragDrop({
  pieces,
  gridRef,
  gridElRef,
  onPlace,
  enabled,
}: UseDragDropOptions) {
  const [drag, setDrag] = useState<DragState>(INITIAL);

  // Use ref for stable access inside event listeners
  const dragRef = useRef<DragState>(INITIAL);
  dragRef.current = drag;

  // ── Resolve current grid position from pointer ─────────────
  const resolveTarget = useCallback(
    (px: number, py: number, pieceData: PieceSnapshot) => {
      const gridEl = gridElRef.current;
      if (!gridEl || !gridRef.current) return null;

      const rect    = gridEl.getBoundingClientRect();
      const margin  = 80;
      if (
        px < rect.left - margin || px > rect.right + margin ||
        py < rect.top  - margin || py > rect.bottom + margin
      ) return null;

      const cellSize = rect.width / GRID_SIZE;
      const rows     = pieceData.tiles.length;
      const cols     = pieceData.tiles[0]?.length ?? 0;
      const i = Math.round((py - rect.top)  / cellSize - 0.5) - Math.floor(rows / 2);
      const j = Math.round((px - rect.left) / cellSize - 0.5) - Math.floor(cols / 2);

      return { i, j };
    },
    [gridElRef, gridRef],
  );

  // ── Start drag from a piece slot ──────────────────────────
  const startDrag = useCallback(
    (slotIndex: number, e: React.PointerEvent) => {
      if (!enabled) return;
      const pieceData = pieces[slotIndex];
      if (!pieceData) return;

      e.preventDefault();
      // Measure the real board cell size right now, from the
      // actually-rendered grid element — never a hardcoded guess.
      const gridEl   = gridElRef.current;
      const measured = gridEl ? gridEl.getBoundingClientRect().width / GRID_SIZE : INITIAL.cellSize;

      const next: DragState = {
        active:    true,
        slotIndex,
        pieceData,
        pointerX:  e.clientX,
        pointerY:  e.clientY,
        ghost:     [],
        cellSize:  measured,
      };
      dragRef.current = next;
      setDrag(next);
    },
    [enabled, pieces, gridElRef],
  );

  // ── Global pointer move ────────────────────────────────────
  useEffect(() => {
    if (!drag.active) return;

    const handleMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active || !d.pieceData) return;

      const ghost = gridElRef.current && gridRef.current
        ? calcGhost(e.clientX, e.clientY, gridElRef.current, gridRef.current, d.pieceData)
        : [];

      const next: DragState = {
        ...d,
        pointerX: e.clientX,
        pointerY: e.clientY,
        ghost,
      };
      dragRef.current = next;
      setDrag(next);
    };

    const handleUp = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active || !d.pieceData) {
        setDrag(INITIAL);
        return;
      }

      const target = resolveTarget(e.clientX, e.clientY, d.pieceData);
      if (target) {
        onPlace(d.slotIndex, target.i, target.j);
      }

      dragRef.current = INITIAL;
      setDrag(INITIAL);
    };

    document.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('pointerup',   handleUp);
    document.addEventListener('pointercancel', handleUp);

    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup',   handleUp);
      document.removeEventListener('pointercancel', handleUp);
    };
  }, [drag.active, gridElRef, gridRef, onPlace, resolveTarget]);

  // ── Derived ghost map (coord key → GhostCell) ─────────────
  // Memoized: without this, a brand-new Map was created on every
  // single render (even when not dragging), which would silently
  // defeat React.memo() on TileGrid — its `ghostMap` prop would
  // never be reference-equal across renders, so memo's shallow
  // comparison would always see "changed" and re-render anyway.
  const ghostMap = useMemo(() => {
    const map = new Map<string, GhostCell>();
    drag.ghost.forEach((g) => {
      map.set(`${g.coord[0]}-${g.coord[1]}`, g);
    });
    return map;
  }, [drag.ghost]);

  return {
    drag,
    ghostMap,
    startDrag,
  };
}
