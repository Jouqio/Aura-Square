// ============================================================
// AchievementIcons.tsx
// Aura Square — Achievement Crystal Badge icon system
// One consistent "Aura Cyber Neon" badge frame (hex + glow ring)
// with a swappable glyph inside, used for all 24 achievements.
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';

export type AchievementIconKey =
  | 'sprout' | 'star' | 'flame' | 'burst' | 'trophy' | 'crown' | 'diamond'
  | 'controller' | 'target' | 'swords' | 'shield' | 'starburst'
  | 'broom' | 'wave' | 'bolt' | 'tornado'
  | 'combo2' | 'combo3' | 'combo4'
  | 'puzzle' | 'wrench' | 'tower' | 'timer' | 'clock'
  | 'calendar' | 'medal' | 'gem' | 'levelup';

interface AchievementIconProps {
  iconKey:  AchievementIconKey;
  size?:    number;
  locked?:  boolean;
  className?: string;
}

/** Inner glyph paths, drawn on a 0-24 viewBox centered grid. */
const GLYPHS: Record<AchievementIconKey, React.ReactNode> = {
  sprout: (
    <path d="M12 20v-6M12 14c0-3-2.5-5-5.5-5C7 12 9.5 14 12 14zm0 0c0-3 2.5-5 5.5-5C17 12 14.5 14 12 14z"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  star: (
    <path d="M12 6.5l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z"
      fill="currentColor"/>
  ),
  flame: (
    <path d="M12 5c1 2.6-2 3.4-2 6.4a2.5 2.5 0 0 0 5 0c0-.8-.8-1.3-.8-2.1C15.5 10.5 16.5 12.4 16.5 14a4.5 4.5 0 0 1-9 0C7.5 9 12 7.5 12 5z"
      fill="currentColor"/>
  ),
  burst: (
    <path d="M12 4l1.4 4.3L18 7l-2.3 4 4.3 1.4-4 2.3 1.6 4.3-4.3-2-1.3 4.3-1.3-4.3-4.3 2 1.6-4.3-4-2.3L8.3 11 6 7l4.6 1.3z"
      fill="currentColor"/>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" fill="currentColor"/>
      <path d="M8 5H5.5a2 2 0 0 0 0 4H7M16 5h2.5a2 2 0 0 1 0 4H16"
        fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <rect x="10.6" y="13" width="2.8" height="3" fill="currentColor"/>
      <path d="M8 19h8l-1 2.2H9z" fill="currentColor"/>
    </>
  ),
  crown: (
    <path d="M4 17l1.4-7.5L9 13l3-6 3 6 3.6-3.5L20 17z" fill="currentColor"
      stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round"/>
  ),
  diamond: (
    <path d="M7 4h10l3 5-8 11L4 9z" fill="currentColor"
      stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" strokeLinejoin="round"/>
  ),
  controller: (
    <path d="M7 8.5h10a3.8 3.8 0 0 1 3.8 4.4l-.5 3a2.2 2.2 0 0 1-4-1.1L16 14H8l-.3.8a2.2 2.2 0 0 1-4-1.1l-.5-3A3.8 3.8 0 0 1 7 8.5z"
      fill="currentColor"/>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="4"   fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="1.3" fill="currentColor"/>
    </>
  ),
  swords: (
    <path d="M5 19l5.5-5.5M19 5l-5.5 5.5M5 5l14 14M5 5l3 .5.5 3M19 19l-3-.5-.5-3"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  shield: (
    <path d="M12 3l7 2.6v5.6c0 5-3.2 8-7 9.8-3.8-1.8-7-4.8-7-9.8V5.6z"
      fill="currentColor" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4"/>
  ),
  starburst: (
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.5 3.5M14.9 14.9l3.5 3.5M18.4 5.6l-3.5 3.5M9.1 14.9l-3.5 3.5"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  ),
  broom: (
    <path d="M16 4l4 4-7 7-3-1-1-3z M9 14l-5 5M5 17l2 2"
      fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  wave: (
    <path d="M3 9c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M3 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  ),
  bolt: (
    <path d="M13 3L6 14h4.5L10 21l7-11h-4.5z" fill="currentColor"/>
  ),
  tornado: (
    <path d="M4 5h16M6 9h12M8 13h8M10 17h4M5 21h2" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  ),
  combo2: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
      <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="800" fill="currentColor">x2</text>
    </>
  ),
  combo3: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
      <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="800" fill="currentColor">x3</text>
    </>
  ),
  combo4: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/>
      <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="800" fill="currentColor">x4</text>
    </>
  ),
  puzzle: (
    <path d="M5 5h5.5v1.8a1.7 1.7 0 1 0 3 0V5H19v5.5h-1.8a1.7 1.7 0 1 0 0 3H19V19h-5.5v-1.8a1.7 1.7 0 1 0-3 0V19H5v-5.5h1.8a1.7 1.7 0 1 0 0-3H5z"
      fill="currentColor"/>
  ),
  wrench: (
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2z"
      fill="currentColor" strokeLinejoin="round"/>
  ),
  tower: (
    <path d="M6 21V11l3-2v3l3-2v3l3-2v3l3-2v9z" fill="currentColor"/>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M12 9v4l3 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M9.5 3h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M12 7.5V12l3.2 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M15 3v4M9 3v4M4 9.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M9 14l1.7 1.7L15 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  medal: (
    <>
      <path d="M9 3h6l-1.8 6h-2.4z" fill="currentColor" opacity="0.8"/>
      <circle cx="12" cy="14" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M12 11l1 2 2.2.3-1.6 1.55.4 2.2-2-1.05-2 1.05.4-2.2-1.6-1.55 2.2-.3z" fill="currentColor"/>
    </>
  ),
  gem: (
    <path d="M7.5 4h9l3.5 5-8 11L4 9z" fill="currentColor"
      stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" strokeLinejoin="round"/>
  ),
  levelup: (
    <path d="M12 4l6.5 7h-4v9h-5v-9h-4z" fill="currentColor"
      stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" strokeLinejoin="round"/>
  ),
};

/**
 * Achievement Crystal Badge — hex frame + glow ring + swappable
 * glyph. One consistent design language used for ALL achievement
 * icons (no emoji, no generic icon packs).
 */
export function AchievementIcon({
  iconKey, size = 24, locked = false, className = '',
}: AchievementIconProps): React.JSX.Element {
  const id = React.useId();
  const glyph = GLYPHS[iconKey];

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor={locked ? '#4b4b58' : '#F5C842'} />
          <stop offset="100%" stopColor={locked ? '#2c2c36' : '#a78bfa'} />
        </linearGradient>
      </defs>
      {/* Hex frame */}
      <path d="M12 1.3l8.7 5v11.4l-8.7 5-8.7-5V6.3z"
        fill="none" stroke={`url(#${id}-ring)`} strokeWidth="1.3"
        opacity={locked ? 0.45 : 0.9}/>
      {/* Glyph */}
      <g style={{ color: locked ? '#5a5a68' : '#c4b5fd' }} opacity={locked ? 0.55 : 1}>
        {glyph}
      </g>
    </svg>
  );
}
