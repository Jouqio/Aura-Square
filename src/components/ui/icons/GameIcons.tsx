// ============================================================
// GameIcons.tsx
// Aura Square — AURA CYBER NEON custom icon set
// Replaces emoji throughout the app with cohesive, glowing
// SVG icons matching the neon-purple/gold premium game theme.
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';

interface IconProps {
  size?:  number;
  className?: string;
}

/** Neon Crystal Trophy — best score / "Terbaik" */
export function TrophyIcon({ size = 20, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#c4b5fd" />
          <stop offset="55%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id={`${id}-base`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5C842" />
          <stop offset="100%" stopColor="#C9941F" />
        </linearGradient>
      </defs>
      <path d="M8 2h8v6a4 4 0 0 1-8 0V2z" fill={`url(#${id}-body)`}
        stroke="rgba(255,255,255,0.5)" strokeWidth="0.4"/>
      <path d="M8 3.2H5.2a2 2 0 0 0 0 4H7" fill="none"
        stroke={`url(#${id}-body)`} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M16 3.2h2.8a2 2 0 0 1 0 4H17" fill="none"
        stroke={`url(#${id}-body)`} strokeWidth="1.4" strokeLinecap="round"/>
      <rect x="10.6" y="11.4" width="2.8" height="3.6" fill={`url(#${id}-body)`}/>
      <path d="M7.5 18.5h9l-1 2.6h-7l-1-2.6z" fill={`url(#${id}-base)`}/>
      <rect x="8.5" y="15.4" width="7" height="2.4" rx="0.6" fill={`url(#${id}-base)`}/>
      <ellipse cx="10.3" cy="5.4" rx="0.9" ry="1.6" fill="rgba(255,255,255,0.55)"/>
    </svg>
  );
}

/** Achievement Crystal Badge — pencapaian / achievements */
export function AchievementCrystalIcon({ size = 20, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5C842"/>
          <stop offset="100%" stopColor="#a78bfa"/>
        </linearGradient>
        <linearGradient id={`${id}-core`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="none" stroke={`url(#${id}-ring)`} strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="10" fill="none" stroke={`url(#${id}-ring)`}
        strokeWidth="1.6" strokeDasharray="3 4" opacity="0.5"/>
      <path d="M12 6.5l4 3.2-1.6 5.3h-4.8L8 9.7z" fill={`url(#${id}-core)`}
        stroke="rgba(255,255,255,0.6)" strokeWidth="0.4"/>
      <path d="M12 6.5v8.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
    </svg>
  );
}

/** Rank Shield — klasemen / leaderboard */
export function RankShieldIcon({ size = 20, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-shield`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#6d28d9"/>
        </linearGradient>
      </defs>
      <path d="M12 2.5l7 2.5v6c0 5-3.2 8.4-7 10.5-3.8-2.1-7-5.5-7-10.5v-6l7-2.5z"
        fill={`url(#${id}-shield)`} stroke="rgba(245,200,66,0.6)" strokeWidth="0.6"/>
      <path d="M9 11.6l2 2 4-4.4" fill="none" stroke="#F5C842"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Analytics Hologram — statistik */
export function AnalyticsIcon({ size = 20, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bar`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#c4b5fd"/>
        </linearGradient>
      </defs>
      <rect x="3" y="13" width="4" height="8" rx="1" fill={`url(#${id}-bar)`}/>
      <rect x="10" y="8"  width="4" height="13" rx="1" fill={`url(#${id}-bar)`}/>
      <rect x="17" y="3"  width="4" height="18" rx="1" fill={`url(#${id}-bar)`}/>
      <path d="M3 9l6-3 5 2 7-5" fill="none" stroke="#F5C842"
        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
    </svg>
  );
}

/** Sci-Fi Hex Gear — pengaturan / settings */
export function HexGearIcon({ size = 20, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-gear`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <path d="M12 2l3 1.7v3.4L18 9l3 1.7v2.6L18 15l-3 1.9v3.4L12 22l-3-1.7v-3.4L6 15l-3-1.7v-2.6L6 9l3-1.9V3.7z"
        fill="none" stroke={`url(#${id}-gear)`} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3.4" fill="none" stroke={`url(#${id}-gear)`} strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="1.2" fill="#F5C842"/>
    </svg>
  );
}

/** Refresh / replay — "Main Lagi" */
export function ReplayIcon({ size = 18, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7"/>
      <path d="M3 4v5h5"/>
    </svg>
  );
}

/** Share — Share Score feature (native share sheet / export card) */
export function ShareIcon({ size = 18, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5"  r="2.6"/>
      <circle cx="6"  cy="12" r="2.6"/>
      <circle cx="18" cy="19" r="2.6"/>
      <path d="M8.3 10.7l7.4-4.2M8.3 13.3l7.4 4.2"/>
    </svg>
  );
}

/** Play arrow — "Main Sekarang" */
export function PlayIcon({ size = 18, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 4.5v15a1 1 0 0 0 1.5.87l12-7.5a1 1 0 0 0 0-1.74l-12-7.5A1 1 0 0 0 6 4.5z"
        fill="currentColor"/>
    </svg>
  );
}

/** Streak flame — daily streak indicator */
export function StreakFlameIcon({ size = 18, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-flame`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#fb923c"/>
          <stop offset="100%" stopColor="#F5C842"/>
        </linearGradient>
      </defs>
      <path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c0-1-1-1.6-1-2.6 1.6 1.4 3 3.8 3 6.1A5 5 0 0 1 7 13.5C7 8 12 6 12 2z"
        fill={`url(#${id}-flame)`}/>
    </svg>
  );
}

/** Medal — daily/weekly challenge rank (bronze/silver/gold/platinum) */
export function RankMedalIcon({
  size = 20, className = '', tier = 'bronze',
}: IconProps & { tier?: 'bronze' | 'silver' | 'gold' | 'platinum' }): React.JSX.Element {
  const COLORS: Record<string, [string, string]> = {
    bronze:   ['#e8a268', '#a85c2e'],
    silver:   ['#e8e8ec', '#9a9aa6'],
    gold:     ['#fde68a', '#d4a017'],
    platinum: ['#d7fbe8', '#34a883'],
  };
  const [light, dark] = COLORS[tier] ?? COLORS.bronze;
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-medal`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={light}/>
          <stop offset="100%" stopColor={dark}/>
        </linearGradient>
      </defs>
      <path d="M9 3h6l-2.4 6.4h-1.2L9 3z" fill="#7c3aed" opacity="0.7"/>
      <circle cx="12" cy="14" r="7" fill={`url(#${id}-medal)`}
        stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
      <circle cx="12" cy="14" r="4.4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7"/>
      <path d="M12 11.5l1 2.1 2.3.3-1.65 1.6.4 2.3-2.05-1.1-2.05 1.1.4-2.3-1.65-1.6 2.3-.3z"
        fill="rgba(255,255,255,0.85)"/>
    </svg>
  );
}

/** Calendar — daily challenge */
export function CalendarIcon({ size = 20, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5"/>
      <line x1="16" y1="2.5" x2="16" y2="6.5"/>
      <line x1="8"  y1="2.5" x2="8"  y2="6.5"/>
      <line x1="3"  y1="9.5" x2="21" y2="9.5"/>
      <path d="M8 14l2.5 2.5L16 11" strokeWidth="2"/>
    </svg>
  );
}

/** Save / data — used in settings */
export function DiskIcon({ size = 18, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <path d="M17 21v-8H7v8"/>
      <path d="M7 3v5h8"/>
    </svg>
  );
}

/** Lightbulb — Hint / Help feature */
export function HintBulbIcon({ size = 18, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bulb`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#F5C842"/>
        </linearGradient>
      </defs>
      <path d="M12 2.5a6.5 6.5 0 0 0-3.8 11.8c.7.5 1.1 1.3 1.1 2.2v.5h5.4v-.5c0-.9.4-1.7 1.1-2.2A6.5 6.5 0 0 0 12 2.5z"
        fill={`url(#${id}-bulb)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.4"/>
      <rect x="9.3" y="18" width="5.4" height="1.8" rx="0.6" fill="rgba(255,255,255,0.85)"/>
      <rect x="9.7" y="20.2" width="4.6" height="1.4" rx="0.6" fill="rgba(255,255,255,0.6)"/>
      <path d="M12 6.2a3.6 3.6 0 0 0-2 6.6" fill="none" stroke="rgba(255,255,255,0.5)"
        strokeWidth="0.9" strokeLinecap="round"/>
    </svg>
  );
}
