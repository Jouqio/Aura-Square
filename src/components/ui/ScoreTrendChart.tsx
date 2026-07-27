// ============================================================
// ScoreTrendChart.tsx
// Aura Square — Score history trend graph (Statistics V2)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// A lightweight, fully custom SVG line+area chart — no charting
// library dependency. Plots score over the player's last N games
// (chronological order) with a gradient fill, smooth curve, and
// the personal-best point highlighted.

import React, { useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { GameRecord } from '../../store/statsStore';

interface ScoreTrendChartProps {
  /** Newest-first, same order as statsStore.history. */
  history: GameRecord[];
  height?: number;
}

const VIEW_W = 320;
const PAD_X  = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 22;

export function ScoreTrendChart({
  history, height = 140,
}: ScoreTrendChartProps): React.JSX.Element {
  const gradId = useId();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Chronological order (oldest -> newest), capped to last 30 for
  // a readable chart even with the full 50-game history available.
  const points = useMemo(() => [...history].reverse().slice(-30), [history]);

  if (points.length < 2) {
    return (
      <div className="score-chart score-chart--empty" style={{ height }}>
        <p>Main beberapa game lagi untuk melihat tren skormu di sini.</p>
      </div>
    );
  }

  const scores   = points.map((p) => p.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(0, Math.min(...scores));
  const range    = Math.max(1, maxScore - minScore);

  const plotW = VIEW_W - PAD_X * 2;
  const plotH = height - PAD_TOP - PAD_BOTTOM;

  const xAt = (i: number) => PAD_X + (i / (points.length - 1)) * plotW;
  const yAt = (score: number) => PAD_TOP + plotH - ((score - minScore) / range) * plotH;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(p.score).toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${xAt(points.length - 1).toFixed(1)} ${PAD_TOP + plotH} `
    + `L ${xAt(0).toFixed(1)} ${PAD_TOP + plotH} Z`;

  const bestIdx = scores.indexOf(maxScore);
  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="score-chart" style={{ height }}>
      <svg viewBox={`0 0 ${VIEW_W} ${height}`} width="100%" height={height}
        preserveAspectRatio="none" className="score-chart__svg">
        <defs>
          <linearGradient id={`${gradId}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#a78bfa" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f}
            x1={PAD_X} x2={VIEW_W - PAD_X}
            y1={PAD_TOP + plotH * f} y2={PAD_TOP + plotH * f}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradId}-fill)`}/>

        {/* Line */}
        <motion.path
          d={linePath} fill="none" stroke="#a78bfa" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />

        {/* Best score marker */}
        <circle cx={xAt(bestIdx)} cy={yAt(maxScore)} r="4"
          fill="#F5C842" stroke="#0B0C14" strokeWidth="1.5"/>

        {/* Hover targets (invisible, wide hit area per point) */}
        {points.map((p, i) => (
          <rect key={p.id}
            x={xAt(i) - (plotW / points.length) / 2} y={0}
            width={plotW / points.length} height={height}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            onTouchStart={() => setHoverIdx(i)}
          />
        ))}

        {hoverIdx !== null && (
          <circle cx={xAt(hoverIdx)} cy={yAt(points[hoverIdx]!.score)} r="3.5"
            fill="#fff" stroke="#a78bfa" strokeWidth="1.5"/>
        )}
      </svg>

      <div className="score-chart__labels">
        <span>{new Date(points[0]!.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
        <span>{new Date(points[points.length - 1]!.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
      </div>

      {hovered && (
        <div className="score-chart__tooltip">
          {hovered.score.toLocaleString()} pts ·{' '}
          {new Date(hovered.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}
