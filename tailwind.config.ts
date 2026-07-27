// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  // Dark mode via class on <html> (controlled by ThemeProvider)
  darkMode: 'class',

  theme: {
    extend: {
      // ── Brand color palette ──────────────────────────────────
      colors: {
        aura: {
          50:  '#f0eeff',
          100: '#e3e0ff',
          200: '#cbc5ff',
          300: '#aa9fff',
          400: '#8b78fc',
          500: '#7c5af8',
          600: '#6c3aed',   // primary brand
          700: '#5b28d4',
          800: '#4b22b0',
          900: '#3e1e8e',
          950: '#260e5c',
        },
        surface: {
          0:   '#07080D',   // deepest background
          50:  '#0B0C14',   // body background
          100: '#0F1019',   // card surface
          200: '#13151F',   // elevated surface
          300: '#191C29',   // border/divider
          400: '#242838',   // subtle border
          500: '#343854',   // muted element
        },
        // Semantic aliases (map to CSS vars in globals.css)
        bg:      'rgb(var(--color-bg)   / <alpha-value>)',
        panel:   'rgb(var(--color-panel) / <alpha-value>)',
        border:  'rgb(var(--color-border)/ <alpha-value>)',
        muted:   'rgb(var(--color-muted) / <alpha-value>)',
      },

      // ── Typography ───────────────────────────────────────────
      fontFamily: {
        sans:  ['Outfit', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Menlo', 'monospace'],
        display: ['Bebas Neue', 'Outfit', 'sans-serif'],
      },

      // ── Spacing (game-specific) ──────────────────────────────
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-top':    'env(safe-area-inset-top,    0px)',
      },

      // ── Border radius ────────────────────────────────────────
      borderRadius: {
        '2xl':  '1rem',
        '3xl':  '1.25rem',
        '4xl':  '1.5rem',
      },

      // ── Animations ───────────────────────────────────────────
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108, 58, 237, 0)' },
          '50%':       { boxShadow: '0 0 20px 4px rgba(108, 58, 237, 0.3)' },
        },
      },
      animation: {
        'fade-in':   'fade-in 0.2s ease-out',
        'slide-up':  'slide-up 0.25s ease-out',
        'scale-in':  'scale-in 0.22s cubic-bezier(0.34, 1.4, 0.64, 1)',
        'glow':      'glow-pulse 2s ease-in-out infinite',
      },

      // ── Box shadow ───────────────────────────────────────────
      boxShadow: {
        'aura':    '0 0 24px -4px rgba(108, 58, 237, 0.45)',
        'aura-lg': '0 0 48px -8px rgba(108, 58, 237, 0.55)',
        'panel':   '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },

  plugins: [],
};

export default config;
