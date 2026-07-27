// ============================================================
// MiscIcons.tsx
// Aura Square — supplementary custom SVG icons
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/** Gamepad — "Dimainkan" (games played) stat */
export function GamepadIcon({ size = 18, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-pad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <path
        d="M7 8h10a4 4 0 0 1 4 4.6l-.6 3.4a2.4 2.4 0 0 1-4.2 1.2L15 16H9l-1.2 1.2a2.4 2.4 0 0 1-4.2-1.2L3 12.6A4 4 0 0 1 7 8z"
        fill={`url(#${id}-pad)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.4"/>
      <path d="M8 10.5v3M6.5 12h3" stroke="#0B0C14" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="16" cy="10.8" r="1" fill="#0B0C14"/>
      <circle cx="18" cy="12.8" r="1" fill="#0B0C14"/>
    </svg>
  );
}

/** Controller / joystick — used as a decorative header accent */
export function JoystickIcon({ size = 18, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3"/>
      <path d="M12 11v6"/>
      <path d="M8 21h8"/>
      <path d="M9 17l-1.5 4M15 17l1.5 4"/>
    </svg>
  );
}

/** Lock — locked/unavailable feature (e.g. online leaderboard) */
export function LockIcon({ size = 14, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="9" rx="2"/>
      <path d="M8 11V7a4 4 0 1 1 8 0v4"/>
    </svg>
  );
}

/** Globe — online/network feature indicator */
export function GlobeIcon({ size = 14, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18"/>
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>
    </svg>
  );
}

/** Checkmark — completion indicator (missions, settings, etc) */
export function CheckIcon({ size = 16, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5l5.5 5.5L20 7"/>
    </svg>
  );
}

/** Download — export/save data to a file */
export function DownloadIcon({ size = 16, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12"/>
      <path d="M7 10l5 5 5-5"/>
      <path d="M4 19h16"/>
    </svg>
  );
}

/** Upload — import/restore data from a file */
export function UploadIcon({ size = 16, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21V9"/>
      <path d="M7 14l5-5 5 5"/>
      <path d="M4 4h16"/>
    </svg>
  );
}

/** Warning triangle — used in confirmation/error states */
export function AlertTriangleIcon({ size = 16, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5l9.5 16.5h-19z"/>
      <path d="M12 9.5v4.5"/>
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/>
    </svg>
  );
}

/** Phone with download arrow — Install App CTA */
export function PhoneInstallIcon({ size = 20, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2.5" width="12" height="19" rx="2.4"/>
      <line x1="10" y1="19" x2="14" y2="19"/>
      <path d="M12 8.5v5.5"/>
      <path d="M9.5 11.5l2.5 2.5 2.5-2.5"/>
    </svg>
  );
}

/** Share-to-home-screen icon — iOS manual install instruction visual */
export function ShareSquareIcon({ size = 18, className = '' }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v11"/>
      <path d="M8.5 6.5L12 3l3.5 3.5"/>
      <rect x="5" y="9.5" width="14" height="11" rx="2.2"/>
    </svg>
  );
}

/** Hint lightbulb — Hint/Help feature, custom bulb+rays glyph */
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
      <path d="M12 2.5a6.5 6.5 0 0 0-3.7 11.8c.6.45 1 1.15 1 1.95v.5h5.4v-.5c0-.8.4-1.5 1-1.95A6.5 6.5 0 0 0 12 2.5z"
        fill={`url(#${id}-bulb)`} stroke="rgba(255,255,255,0.35)" strokeWidth="0.4"/>
      <rect x="9.3" y="18.2" width="5.4" height="1.6" rx="0.8" fill="#d4a017"/>
      <rect x="9.8" y="20.2" width="4.4" height="1.4" rx="0.7" fill="#a8790f"/>
      <path d="M12 6.5v3.2M9.8 8.2l1 1M14.2 8.2l-1 1" stroke="#7c3aed" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

/** Share — custom node/network glyph for the Share Score feature
 *  (deliberately not a generic "arrow out of box" icon pack shape) */
export function ShareIcon({ size = 18, className = '' }: IconProps): React.JSX.Element {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-share`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#c4b5fd"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <circle cx="6"  cy="12" r="3" fill={`url(#${id}-share)`}/>
      <circle cx="18" cy="5.5" r="3" fill={`url(#${id}-share)`}/>
      <circle cx="18" cy="18.5" r="3" fill={`url(#${id}-share)`}/>
      <path d="M8.6 10.6l6.8-3.7M8.6 13.4l6.8 3.7"
        stroke="rgba(196,181,253,0.6)" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
