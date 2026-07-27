// ============================================================
// BadgeIcons.tsx
// Aura Square — Badge Collection + Mission reward icons
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/** Reward chest — Daily Mission Board completion reward */
export function ChestIcon({
  size = 22, className = '', open = false,
}: IconProps & { open?: boolean }): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-chest`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={open ? '#fde68a' : '#c4b5fd'}/>
          <stop offset="100%" stopColor={open ? '#d4a017' : '#7c3aed'}/>
        </linearGradient>
      </defs>
      {open && (
        <path d="M6 9l-1.5-5M12 9V3M18 9l1.5-5" fill="none" stroke="#F5C842"
          strokeWidth="1.3" strokeLinecap="round"/>
      )}
      <path d="M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H4z" fill={`url(#${id}-chest)`}/>
      <rect x="4" y="13" width="16" height="7" rx="1.2" fill={`url(#${id}-chest)`}
        stroke="rgba(0,0,0,0.15)" strokeWidth="0.4"/>
      <rect x="10.4" y="13" width="3.2" height="3.2" rx="0.6" fill="rgba(0,0,0,0.25)"/>
    </svg>
  );
}

/** Theme explorer badge — tried all 3 Aura themes */
export function PaletteIcon({ size = 24, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-pal`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#c4b5fd"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <path d="M12 3a9 8 0 1 0 0 16c1.2 0 1.6-.7 1.6-1.4 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.7-1.4 1.5-1.4H16a5 5 0 0 0 5-5c0-3.4-4-6.2-9-6.2z"
        fill={`url(#${id}-pal)`}/>
      <circle cx="8"   cy="10.5" r="1.3" fill="#22c55e"/>
      <circle cx="12"  cy="8"    r="1.3" fill="#F5C842"/>
      <circle cx="16"  cy="10.5" r="1.3" fill="#ff5e5e"/>
    </svg>
  );
}

/** Perfect-clear badge — landed a Quad (4-line) combo */
export function PerfectClearIcon({ size = 24, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-pc`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#d4a017"/>
        </linearGradient>
      </defs>
      <rect x="3"  y="4"  width="7" height="7" rx="1.4" fill={`url(#${id}-pc)`}/>
      <rect x="14" y="4"  width="7" height="7" rx="1.4" fill={`url(#${id}-pc)`}/>
      <rect x="3"  y="13" width="7" height="7" rx="1.4" fill={`url(#${id}-pc)`}/>
      <rect x="14" y="13" width="7" height="7" rx="1.4" fill={`url(#${id}-pc)`}/>
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

/** Generic collection badge frame — circular medallion + ribbon,
 *  used to wrap a glyph for Badge Collection items. */
export function BadgeFrame({
  size = 48, locked = false, colorFrom = '#c4b5fd', colorTo = '#7c3aed', children,
}: {
  size?: number; locked?: boolean; colorFrom?: string; colorTo?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const id = React.useId();
  return (
    <div className={`badge-frame ${locked ? 'badge-frame--locked' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-ribbon`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"  stopColor={locked ? '#3a3a45' : colorFrom}/>
            <stop offset="100%" stopColor={locked ? '#26262e' : colorTo}/>
          </linearGradient>
        </defs>
        <path d="M16 30l-4 14 8-4 4 4 4-4 8 4-4-14z" fill={`url(#${id}-ribbon)`} opacity="0.9"/>
        <circle cx="24" cy="20" r="16" fill={`url(#${id}-ribbon)`}
          stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
        <circle cx="24" cy="20" r="12.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6"/>
      </svg>
      <div className="badge-frame__glyph">{children}</div>
    </div>
  );
}
