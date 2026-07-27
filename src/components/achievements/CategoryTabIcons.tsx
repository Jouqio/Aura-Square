// ============================================================
// CategoryTabIcons.tsx
// Aura Square — Small monochrome icons for achievement category
// filter tabs. Deliberately simple/frameless (unlike AchievementIcon's
// hex-badge) since these render inline at ~12-14px inside compact
// pill tabs — a full badge frame would be too heavy at that size.
// All use `currentColor` so they automatically match the tab's
// active/inactive text color.
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';

interface IconProps { size?: number; className?: string; }

export function AllCategoriesIcon({ size = 13, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
}

export function ScoreTabIcon({ size = 13, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/>
      <path d="M7 6H4.5a2 2 0 0 0 0 4H6M17 6h2.5a2 2 0 0 1 0 4H16"/>
    </svg>
  );
}

export function GamesTabIcon({ size = 13, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="11" rx="4"/>
      <path d="M7 11v3M5.5 12.5h3"/>
      <circle cx="16" cy="10.5" r="1"/>
      <circle cx="18" cy="13" r="1"/>
    </svg>
  );
}

export function LinesTabIcon({ size = 13, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="14" y2="18"/>
    </svg>
  );
}

export function ComboTabIcon({ size = 13, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="currentColor" aria-label="combo">
      <path d="M13 2L5 14h5l-1 8 9-13h-6z"/>
    </svg>
  );
}

export function SpecialTabIcon({ size = 13, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>
    </svg>
  );
}

export function DailyTabIcon({ size = 13, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/>
      <path d="M16 3v4M8 3v4M3 10h18"/>
      <path d="M8 15l2 2 4-4"/>
    </svg>
  );
}

export function MasteryTabIcon({ size = 13, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l-1 7-5 4-5-4z"/>
      <path d="M12 14v4M9 21h6"/>
    </svg>
  );
}
