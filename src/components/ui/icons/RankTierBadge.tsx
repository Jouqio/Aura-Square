// ============================================================
// RankTierBadge.tsx
// Aura Square — Rank Shield icon (Bronze → Grandmaster)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';
import type { RankTier } from '../../../constants/rank.constants';
import { RANK_TIERS } from '../../../constants/rank.constants';

interface RankTierBadgeProps {
  tier: RankTier;
  size?: number;
  className?: string;
}

export function RankTierBadge({
  tier, size = 28, className = '',
}: RankTierBadgeProps): React.JSX.Element {
  const id   = React.useId();
  const info = RANK_TIERS.find((t) => t.tier === tier) ?? RANK_TIERS[0];

  // Pip count communicates tier progression at a glance (1 pip for
  // bronze, up to 7 for grandmaster) — consistent visual language
  // similar to competitive-game rank icons.
  const pipCount = RANK_TIERS.findIndex((t) => t.tier === tier) + 1;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-shield`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={info?.colorFrom ?? '#a85c2e'} />
          <stop offset="100%" stopColor={info?.colorTo   ?? '#6b3a1a'} />
        </linearGradient>
      </defs>
      <path d="M12 2l7.2 2.6v6.1c0 5.1-3.3 8.5-7.2 10.6-3.9-2.1-7.2-5.5-7.2-10.6V4.6z"
        fill={`url(#${id}-shield)`} stroke="rgba(255,255,255,0.35)" strokeWidth="0.5"/>
      {/* Tier pips */}
      <g>
        {Array.from({ length: pipCount }, (_, i) => {
          const total = pipCount;
          const spread = Math.min(total * 2.6, 14);
          const x = 12 - spread / 2 + (i * spread) / Math.max(total - 1, 1);
          return (
            <circle key={i} cx={total === 1 ? 12 : x} cy={14.5} r="1.15"
              fill="rgba(255,255,255,0.92)"/>
          );
        })}
      </g>
    </svg>
  );
}
