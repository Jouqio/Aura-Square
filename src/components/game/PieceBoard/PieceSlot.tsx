// ============================================================
// PieceSlot.tsx
// Aura Square — Individual draggable piece slot in the tray
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { memo } from 'react';
import { motion }       from 'framer-motion';
import { PieceMini }    from './PieceMini';
import type { PieceSnapshot } from '../../../types/engine.types';

interface PieceSlotProps {
  index:       number;
  pieceData:   PieceSnapshot | null;
  isDragging:  boolean;  // THIS slot is being dragged
  isDeadPiece: boolean;  // piece has no valid moves (game ending)
  isHint?:     boolean;  // suggested by the Hint feature — use this piece
  onDragStart: (index: number, e: React.PointerEvent) => void;
}

function PieceSlotInner({
  index,
  pieceData,
  isDragging,
  isDeadPiece,
  isHint = false,
  onDragStart,
}: PieceSlotProps): React.JSX.Element {
  const isEmpty = pieceData === null;

  return (
    <motion.div
      className={[
        'piece-slot',
        isEmpty     ? 'piece-slot--empty'    : '',
        isDragging  ? 'piece-slot--dragging' : '',
        isDeadPiece ? 'piece-slot--dead'     : '',
        isHint      ? 'piece-slot--hint'     : '',
      ].filter(Boolean).join(' ')}
      whileHover={!isEmpty ? { scale: 1.05 } : {}}
      whileTap={!isEmpty   ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onPointerDown={(e) => {
        if (isEmpty) return;
        e.preventDefault();
        onDragStart(index, e);
      }}
      style={{ touchAction: 'none', cursor: isEmpty ? 'default' : 'grab' }}
    >
      {pieceData && (
        <PieceMini
          pieceData={pieceData}
          dimmed={isDeadPiece}
        />
      )}
    </motion.div>
  );
}

export const PieceSlot = memo(PieceSlotInner);
