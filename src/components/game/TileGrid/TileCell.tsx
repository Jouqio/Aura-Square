// ============================================================
// TileCell.tsx
// Aura Square — Single grid cell
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { memo } from 'react';
import { TILE_COLORS, EMPTY_CELL_COLOR } from '../../../constants/game.constants';
import type { GhostCell } from '../../../hooks/useDragDrop';

interface TileCellProps {
  value:       number;       // 0 = empty, 1–9/11 = filled
  isPlacing:   boolean;      // just placed → pop animation
  isClearing:  boolean;      // being cleared → burst animation
  isHint?:     boolean;      // suggested placement from Hint feature
  ghost?:      GhostCell;    // drag preview overlay
}

function TileCellInner({
  value,
  isPlacing,
  isClearing,
  isHint = false,
  ghost,
}: TileCellProps): React.JSX.Element {
  // ── Determine cell appearance ────────────────────────────
  const isFilled = value !== 0;
  const fillColor = isFilled ? (TILE_COLORS[value] ?? '#888') : EMPTY_CELL_COLOR;

  // Ghost overrides fill
  const showGhost   = !!ghost && !isFilled;
  const ghostColor  = ghost?.color ?? 'transparent';
  const ghostValid  = ghost?.valid ?? false;

  // ── CSS classes ──────────────────────────────────────────
  const classes = [
    'tile-cell',
    isFilled    ? 'tile-cell--filled'   : 'tile-cell--empty',
    isPlacing   ? 'tile-cell--placing'  : '',
    isClearing  ? 'tile-cell--clearing' : '',
    showGhost && ghostValid   ? 'tile-cell--ghost-valid'   : '',
    showGhost && !ghostValid  ? 'tile-cell--ghost-invalid' : '',
    isHint && !isFilled       ? 'tile-cell--hint'          : '',
  ].filter(Boolean).join(' ');

  const bg = showGhost
    ? (ghostValid ? ghostColor : '#FF2222')
    : fillColor;

  const opacity = showGhost ? 0.45 : 1;

  return (
    <div
      className={classes}
      style={{
        backgroundColor: bg,
        opacity,
      }}
    >
      {/* Shine overlay on filled cells */}
      {isFilled && !isClearing && (
        <div className="tile-cell__shine" />
      )}
    </div>
  );
}

export const TileCell = memo(TileCellInner);
