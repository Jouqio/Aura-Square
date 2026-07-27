// ============================================================
// PieceMini.tsx — Aura Square Upgrade (responsive preview)
// Miniature piece preview, used in two contexts:
//   1. Static tray slot  → cellSize omitted: fills its parent
//      fluidly via CSS Grid %, sized by the slot's clamp()'d box.
//   2. Floating drag ghost → cellSize passed as a px number so
//      it can be positioned with fixed dimensions that track the
//      pointer 1:1 with the real board cell size.
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { memo } from 'react';
import { TILE_COLORS } from '../../../constants/game.constants';
import type { PieceSnapshot } from '../../../types/engine.types';

interface PieceMiniProps {
  pieceData:  PieceSnapshot;
  /** Px per cell. Omit for fluid/responsive sizing (tray preview). */
  cellSize?:  number;
  /** Px gap between cells (only meaningful with fixed cellSize). */
  gap?:       number;
  dimmed?:    boolean;
}

function PieceMiniInner({
  pieceData,
  cellSize,
  gap = 2,
  dimmed = false,
}: PieceMiniProps): React.JSX.Element {
  const rows = pieceData.tiles.length;
  const cols = pieceData.tiles[0]?.length ?? 0;

  // ── Fixed-size mode (drag ghost) ──────────────────────────
  if (cellSize !== undefined) {
    const totalW = cols * cellSize + (cols - 1) * gap;
    const totalH = rows * cellSize + (rows - 1) * gap;
    return (
      <div
        style={{
          width: totalW, height: totalH,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows:    `repeat(${rows}, ${cellSize}px)`,
          gap: `${gap}px`,
          opacity: dimmed ? 0.35 : 1,
          transition: 'opacity 0.2s',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {pieceData.tiles.flatMap((row, ri) =>
          row.map((val, ci) => {
            const color = val ? TILE_COLORS[val] ?? '#888' : 'transparent';
            return (
              <div key={`${ri}-${ci}`} style={{
                width: cellSize, height: cellSize,
                borderRadius: cellSize * 0.2,
                backgroundColor: color,
                boxShadow: val
                  ? `0 1px 4px ${color}55, inset 0 1px 0 rgba(255,255,255,0.18)`
                  : 'none',
              }}/>
            );
          }),
        )}
      </div>
    );
  }

  // ── Fluid/responsive mode (tray preview) ──────────────────
  // No hardcoded pixel cell size at all — the grid fills
  // `piece-mini` (sized via clamp() in CSS, scaled to the
  // parent .piece-slot box) and each cell is simply `1fr`.
  // This is what makes the preview actually proportional to
  // the slot on every screen size instead of looking tiny in
  // a big slot on phones with a larger clamp() value.
  const aspect = cols / rows;
  return (
    <div
      className="piece-mini"
      style={{
        aspectRatio: `${cols} / ${rows}`,
        // Cap so very wide/tall pieces (e.g. 1x4 I-piece) don't
        // overflow the square-ish slot — width-bound or
        // height-bound depending on which dimension is larger.
        width:  aspect >= 1 ? '100%' : `calc(100% * ${aspect})`,
        height: aspect >= 1 ? `calc(100% / ${aspect})` : '100%',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows:    `repeat(${rows}, 1fr)`,
        gap: 'var(--piece-mini-gap, 6%)',
        opacity: dimmed ? 0.35 : 1,
        transition: 'opacity 0.2s',
        pointerEvents: 'none',
        userSelect: 'none',
        margin: 'auto',
      }}
    >
      {pieceData.tiles.flatMap((row, ri) =>
        row.map((val, ci) => {
          const color = val ? TILE_COLORS[val] ?? '#888' : 'transparent';
          return (
            <div key={`${ri}-${ci}`} style={{
              borderRadius: '22%',
              backgroundColor: color,
              boxShadow: val
                ? `0 1px 4px ${color}55, inset 0 1px 0 rgba(255,255,255,0.18)`
                : 'none',
            }}/>
          );
        }),
      )}
    </div>
  );
}

export const PieceMini = memo(PieceMiniInner);
