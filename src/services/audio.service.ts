// ============================================================
// audio.service.ts
// Aura Square — Audio System (synthesized SFX, Web Audio API)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// All sound effects are synthesized at runtime with oscillators —
// no external audio files to download/host. This keeps the app
// lightweight and works instantly offline. Lazily creates/resumes
// the AudioContext on first user gesture (required by browser
// autoplay policies).

let ctx: AudioContext | null = null;

/**
 * Returns the single shared AudioContext for the whole app — both
 * sfxXxx() below and bgm.service.ts's ambient music use this same
 * instance. Browsers cap how many AudioContexts a page may create
 * (and each one has real overhead), so this is exported rather than
 * each module lazily creating its own.
 */
export function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => { /* ignore — will retry on next call */ });
  }
  return ctx;
}

interface ToneOpts {
  freq:        number;
  duration:    number;   // seconds
  type?:       OscillatorType;
  gain?:       number;
  delay?:      number;   // seconds, when to start relative to now
  glideTo?:    number;   // optional frequency glide target
}

function tone({ freq, duration, type = 'sine', gain = 0.18, delay = 0, glideTo }: ToneOpts): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  const osc  = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = type;
  const startTime = audioCtx.currentTime + delay;
  osc.frequency.setValueAtTime(freq, startTime);
  if (glideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(glideTo, startTime + duration);
  }

  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

// ── Public SFX API ──────────────────────────────────────────────

/** Soft tick — piece successfully placed on the board */
export function sfxPlace(): void {
  tone({ freq: 320, duration: 0.07, type: 'sine', gain: 0.14 });
}

/** Bright sweep — one or more lines cleared */
export function sfxClear(): void {
  tone({ freq: 440, duration: 0.18, type: 'triangle', gain: 0.16, glideTo: 880 });
}

/** Layered chime — combo (double/triple/quad) */
export function sfxCombo(multiplier: number): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  const count = Math.min(multiplier, notes.length);
  for (let i = 0; i < count; i++) {
    tone({ freq: notes[i] ?? notes[notes.length - 1] ?? 523.25, duration: 0.22, type: 'triangle', gain: 0.15, delay: i * 0.06 });
  }
}

/** Rising fanfare — achievement unlocked */
export function sfxAchievement(): void {
  tone({ freq: 392, duration: 0.12, type: 'square', gain: 0.1, delay: 0    });
  tone({ freq: 523, duration: 0.12, type: 'square', gain: 0.1, delay: 0.1  });
  tone({ freq: 659, duration: 0.25, type: 'square', gain: 0.12, delay: 0.2 });
}

/** Quick neutral click — button presses, nav taps */
export function sfxClick(): void {
  tone({ freq: 700, duration: 0.04, type: 'sine', gain: 0.08 });
}

/** Low buzz — invalid move / error feedback */
export function sfxError(): void {
  tone({ freq: 160, duration: 0.15, type: 'sawtooth', gain: 0.1 });
}

/** Descending tone — game over */
export function sfxGameOver(): void {
  tone({ freq: 440, duration: 0.5, type: 'sine', gain: 0.14, glideTo: 110 });
}

/** Triumphant rising arpeggio — new best score */
export function sfxNewBest(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((f, i) =>
    tone({ freq: f, duration: 0.18, type: 'triangle', gain: 0.13, delay: i * 0.07 }));
}
