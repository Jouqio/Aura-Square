// ============================================================
// Button.tsx
// Aura Square — Reusable button component
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

// ── Variants ──────────────────────────────────────────────────

const VARIANTS = {
  primary:   'bg-aura-600 hover:bg-aura-500 text-white shadow-aura',
  secondary: 'bg-surface-300 hover:bg-surface-400 text-white border border-surface-400',
  ghost:     'hover:bg-surface-300 text-white/70 hover:text-white',
  danger:    'bg-red-600 hover:bg-red-500 text-white',
  google:    'bg-white hover:bg-gray-100 text-gray-800 font-medium',
} as const;

const SIZES = {
  sm:   'px-3 py-1.5 text-sm gap-1.5',
  md:   'px-5 py-2.5 text-sm gap-2',
  lg:   'px-6 py-3 text-base gap-2.5',
  full: 'w-full px-6 py-3.5 text-base gap-2.5 justify-center',
} as const;

// ── Types ─────────────────────────────────────────────────────

type ButtonVariant = keyof typeof VARIANTS;
type ButtonSize    = keyof typeof SIZES;

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  icon?:     React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

// ── Component ─────────────────────────────────────────────────

export function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  icon,
  iconRight,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps): React.JSX.Element {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={{ scale: isDisabled ? 1 : 0.96 }}
      transition={{ duration: 0.1 }}
      disabled={isDisabled}
      className={[
        'inline-flex items-center rounded-xl font-semibold',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-500/60',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 14 : 16} />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconRight && (
        <span className="flex-shrink-0 ml-auto">{iconRight}</span>
      )}
    </motion.button>
  );
}

// ── Inline spinner ────────────────────────────────────────────
function Spinner({ size }: { size: number }): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
