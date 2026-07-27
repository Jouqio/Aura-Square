// ============================================================
// useParticleCanvas.ts
// Aura Square — Lightweight particle effect system
// Owner: Syauqi Nuzul Abdi
// ============================================================
// PERFORMANCE DESIGN:
//  - Single <canvas> overlay, NOT one DOM element per particle —
//    canvas draw calls are far cheaper than DOM/CSS animations
//    at the particle counts used here.
//  - Particle state lives in a plain array via useRef, NEVER in
//    React state — so spawning/animating particles causes ZERO
//    re-renders. Only the imperative `burst()` call and the
//    rAF loop touch this array.
//  - The requestAnimationFrame loop SELF-STOPS the moment the
//    particle array is empty, instead of running forever — no
//    idle CPU/battery cost between bursts.
//  - Particle counts are deliberately small (12-18 per burst).
//    At 60fps, drawing 18 simple arcs is trivial; this is about
//    visual punch, not a fireworks show.

import { useCallback, useEffect, useRef } from 'react';
import { useEffectiveReducedMotion } from './useEffectiveReducedMotion';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;     // 0..1, counts down
  decay: number;     // life lost per frame
  size: number;
  color: string;
  gravity: number;
}

export interface BurstOptions {
  colors?:  string[];
  count?:   number;
  spread?:  number;   // initial speed range
  size?:    [number, number];
  gravity?: number;
  life?:    number;    // frames-equivalent decay rate, smaller = longer-lived
}

const DEFAULT_COLORS = ['#a78bfa', '#F5C842', '#7c3aed', '#ffffff'];

export function useParticleCanvas() {
  const canvasRef   = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef       = useRef<number | null>(null);
  const sizeRef       = useRef({ w: 0, h: 0, dpr: 1 });
  const reducedMotion = useEffectiveReducedMotion();

  // Keep the canvas sized to the viewport (cheap — only runs on
  // resize, not per-frame).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR for perf
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h, dpr };
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) { rafRef.current = null; return; }

    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (particles.length > 0) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null; // self-stop — no idle work between bursts
    }
  }, []);

  const burst = useCallback((x: number, y: number, opts: BurstOptions = {}) => {
    // Motion-sensitive players get none of this — the line-clear/
    // achievement event is still communicated via sound + score
    // pop + the (now-instant) shockwave ring, just without the
    // flying-particle motion itself.
    if (reducedMotion) return;

    const {
      colors  = DEFAULT_COLORS,
      count   = 14,
      spread  = 4.5,
      size    = [2, 5],
      gravity = 0.12,
      life    = 0.025,
    } = opts;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const speed = spread * (0.5 + Math.random() * 0.5);
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - speed * 0.3, // slight upward bias
        life: 1,
        decay: life * (0.7 + Math.random() * 0.6),
        size: size[0] + Math.random() * (size[1] - size[0]),
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#a78bfa',
        gravity,
      });
    }

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick, reducedMotion]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { canvasRef, burst };
}
