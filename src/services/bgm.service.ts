// ============================================================
// bgm.service.ts
// Aura Square — Ambient Background Music (synthesized, looping)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Consistent with audio.service.ts's philosophy: no external audio
// files, everything generated at runtime with the Web Audio API.
// Shares the SAME AudioContext as SFX (via audio.service's exported
// getCtx()) — never create a second AudioContext per page.
//
// MUSICAL DESIGN: a slow 4-chord ambient pad loop in A minor
// (Am7 → Fmaj7 → Cmaj7 → G), each chord ~6s with long attack/
// release so chords crossfade into each other rather than
// cutting abruptly. A sparse "sparkle" arpeggio occasionally
// plays an octave-up note from the current chord for a bit of
// gentle movement, without becoming a distracting melody — this
// is meant to sit quietly behind gameplay, not compete with it.
//
// SCHEDULING: uses the standard Web Audio "look-ahead" pattern
// (schedule audio events using the audio clock's sample-accurate
// timestamps, decide WHEN to schedule them via a plain JS timer
// that just needs to run a bit before each deadline — not exactly
// on it). This avoids the drift/jitter you'd get from scheduling
// actual note start times off `setTimeout` directly.

import { getCtx } from './audio.service';

// ── Chord voicings (Hz) — A minor, calm/ambient ──────────────────
const CHORDS: number[][] = [
  [110.00, 130.81, 164.81, 196.00], // Am7:   A2 C3 E3 G3
  [174.61, 220.00, 261.63, 329.63], // Fmaj7: F3 A3 C4 E4
  [130.81, 164.81, 196.00, 246.94], // Cmaj7: C3 E3 G3 B3
  [98.00,  146.83, 196.00, 246.94], // G:     G2 D3 G3 B3
];

const CHORD_DURATION   = 6.4;  // seconds per chord
const PAD_ATTACK       = 1.8;
const PAD_RELEASE      = 2.2;
const LOOKAHEAD_WINDOW = 2.5;  // schedule chords starting within this many seconds
const SCHEDULER_TICK   = 1000; // ms between scheduler checks (well under the lookahead window)
const MASTER_VOLUME    = 0.05; // deliberately quiet — background ambience, not foreground

let masterGain:    GainNode | null = null;
let schedulerId:   ReturnType<typeof setInterval> | null = null;
let nextChordTime  = 0;
let chordIndex     = 0;
let isPlaying      = false;

function ensureMasterGain(audioCtx: AudioContext): GainNode {
  if (!masterGain) {
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);
  }
  return masterGain;
}

/** Plays one sustained pad chord, with a slow crossfade-style
 *  attack/release envelope per voice. */
function playPadChord(
  audioCtx: AudioContext, gainDest: GainNode,
  freqs: number[], startTime: number, duration: number,
): void {
  freqs.forEach((freq, i) => {
    const osc    = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain   = audioCtx.createGain();

    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    osc.detune.value = (i - (freqs.length - 1) / 2) * 3; // subtle chorus-like spread

    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    filter.Q.value = 0.6;

    const peak = 0.55; // relative — actual loudness controlled by masterGain
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peak, startTime + PAD_ATTACK);
    gain.gain.setValueAtTime(peak, startTime + duration - PAD_RELEASE);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(gainDest);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });
}

/** Occasionally plays a single soft plucked note an octave above
 *  one of the chord's tones, for gentle movement/sparkle. Sparse
 *  and randomized on purpose — this should read as ambient texture,
 *  never as a competing melody. */
function maybePlaySparkle(
  audioCtx: AudioContext, gainDest: GainNode,
  freqs: number[], startTime: number, duration: number,
): void {
  if (Math.random() > 0.35) return; // ~35% chance per chord

  const noteCount = 1 + Math.floor(Math.random() * 2); // 1-2 sparkle notes
  for (let i = 0; i < noteCount; i++) {
    const base   = freqs[Math.floor(Math.random() * freqs.length)] ?? freqs[0]!;
    const freq   = base * 2; // one octave up
    const offset = (duration * 0.2) + Math.random() * (duration * 0.5);
    const t      = startTime + offset;

    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const peak = 0.3;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peak, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    osc.connect(gain);
    gain.connect(gainDest);
    osc.start(t);
    osc.stop(t + 2.3);
  }
}

function schedulerTick(): void {
  const audioCtx = getCtx();
  if (!audioCtx || !masterGain || !isPlaying) return;

  while (nextChordTime < audioCtx.currentTime + LOOKAHEAD_WINDOW) {
    const freqs = CHORDS[chordIndex] ?? CHORDS[0]!;
    playPadChord(audioCtx, masterGain, freqs, nextChordTime, CHORD_DURATION);
    maybePlaySparkle(audioCtx, masterGain, freqs, nextChordTime, CHORD_DURATION);

    chordIndex    = (chordIndex + 1) % CHORDS.length;
    nextChordTime += CHORD_DURATION;
  }
}

/**
 * Starts the ambient loop, fading in gently. Safe to call repeatedly
 * — no-ops if already playing.
 */
export function startBgm(): void {
  const audioCtx = getCtx();
  if (!audioCtx || isPlaying) return;

  isPlaying = true;
  const gain = ensureMasterGain(audioCtx);
  gain.gain.cancelScheduledValues(audioCtx.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(MASTER_VOLUME, audioCtx.currentTime + 1.5);

  nextChordTime = audioCtx.currentTime + 0.1;
  chordIndex    = 0;
  schedulerTick(); // schedule the first batch immediately
  schedulerId = setInterval(schedulerTick, SCHEDULER_TICK);
}

/**
 * Stops the ambient loop with a graceful fade-out rather than an
 * abrupt cut. Already-scheduled chord oscillators finish naturally
 * per their own envelopes (their gain gets multiplied through the
 * fading masterGain, so nothing pops).
 */
export function stopBgm(): void {
  if (!isPlaying) return;
  isPlaying = false;

  if (schedulerId !== null) {
    clearInterval(schedulerId);
    schedulerId = null;
  }

  const audioCtx = getCtx();
  if (audioCtx && masterGain) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
  }
}

export function isBgmPlaying(): boolean {
  return isPlaying;
}
