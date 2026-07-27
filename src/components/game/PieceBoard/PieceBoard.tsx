// ============================================================
// PieceBoard.tsx
// Aura Square — 3-piece tray + floating drag ghost
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { memo } from 'react';
import { PieceSlot }    from './PieceSlot';
import { PieceMini }    from './PieceMini';
import type { PieceSnapshot } from '../../../types/engine.types';
import type { DragState } from '../../../hooks/useDragDrop';

interface PieceBoardProps {
  pieces:     (PieceSnapshot | null)[];
  drag:       DragState;
  deadSlots:  boolean[];   // which slots have no valid moves
  hintSlotIndex?: number | null;  // slot suggested by the Hint feature
  onDragStart:(index: number, e: React.PointerEvent) => void;
}

function PieceBoardInner({
  pieces, drag, deadSlots, hintSlotIndex, onDragStart,
}: PieceBoardProps): React.JSX.Element {
  // ── Compute drag ghost size dynamically ───────────────────
  const ghostPiece = drag.active ? drag.pieceData : null;
  const ghostRows  = ghostPiece?.tiles.length ?? 1;
  const ghostCols  = ghostPiece?.tiles[0]?.length ?? 1;

  // Ghost cell size now mirrors the REAL measured board cell —
  // see useDragDrop's startDrag, which measures the actual
  // rendered grid element instead of guessing a fixed pixel value.
  const GHOST_CS   = drag.cellSize;
  const GHOST_GAP  = 2;

  const ghostW = ghostCols * GHOST_CS + (ghostCols - 1) * GHOST_GAP;
  const ghostH = ghostRows * GHOST_CS + (ghostRows - 1) * GHOST_GAP;

  return (
    <>
      {/* ── Piece tray ──────────────────────────────────── */}
      <div className="piece-board">
        {pieces.map((p, i) => (
          <PieceSlot
            key={i}
            index={i}
            pieceData={p}
            isDragging={drag.active && drag.slotIndex === i}
            isDeadPiece={deadSlots[i] ?? false}
            isHint={hintSlotIndex === i}
            onDragStart={onDragStart}
          />
        ))}
      </div>

      {/* ── Floating drag ghost (fixed, follows pointer) ── */}
      {drag.active && ghostPiece && (
        <div
          className="drag-ghost"
          style={{
            left:   drag.pointerX - ghostW / 2,
            top:    drag.pointerY - ghostH / 2 - 12,
            width:  ghostW,
            height: ghostH,
          }}
        >
          <PieceMini
            pieceData={ghostPiece}
            cellSize={GHOST_CS}
            gap={GHOST_GAP}
          />
        </div>
      )}
    </>
  );
}

export const PieceBoard = memo(PieceBoardInner);
