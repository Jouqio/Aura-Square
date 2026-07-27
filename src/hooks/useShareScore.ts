// ============================================================
// useShareScore.ts
// Aura Square — Share Score feature orchestration
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Fallback chain, most-capable to least-capable browser support:
//   1. navigator.share({ files: [image] })  — mobile Chrome/Safari,
//      shows the native share sheet (WhatsApp/Instagram/etc) with
//      the branded image attached directly.
//   2. navigator.share({ text })            — some browsers support
//      the Web Share API for text/url but not files.
//   3. Download the image + copy caption text to clipboard — every
//      other browser (most desktop browsers). The player can then
//      manually attach the downloaded image wherever they want.
//
// NOTE: `navigator.share`/`canShare` require a real user gesture
// (the share button's onClick) to be called synchronously-ish —
// image generation happens first (async), which is still fine in
// practice across current browsers, but if this ever regresses on
// a specific browser, generating the image eagerly (before the
// click) and only awaiting on click would be the next step.

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateShareCard } from '../services/shareCard.service';

export type ShareStatus =
  | 'idle' | 'generating' | 'shared'
  | 'downloaded' | 'error';

interface ShareScoreParams {
  score:     number;
  bestScore: number;
  isNewBest: boolean;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useShareScore() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ShareStatus>('idle');

  const share = useCallback(async (params: ShareScoreParams) => {
    setStatus('generating');

    const shareText = t('game.share_caption', {
      defaultValue: `Aku baru dapat skor ${params.score.toLocaleString()} di Aura Square! Coba kalahkan aku.`,
      score: params.score.toLocaleString(),
    });

    let blob: Blob | null = null;
    try {
      blob = await generateShareCard({
        score:      params.score,
        bestScore:  params.bestScore,
        isNewBest:  params.isNewBest,
        labels: {
          appName:    'AURA SQUARE',
          tagline:    t('about.tagline',        { defaultValue: 'Isi. Sapu. Menang.' }),
          scoreLabel: t('game.score',           { defaultValue: 'Skor' }).toUpperCase(),
          newBest:    t('game.new_best',        { defaultValue: 'Rekor Baru!' }).toUpperCase(),
          bestLabel:  t('game.best',            { defaultValue: 'Rekor Terbaik' }),
        },
      });
    } catch {
      // Canvas generation failed for some reason (very old browser,
      // out of memory, etc.) — still try a text-only share/fallback
      // rather than giving up entirely.
      blob = null;
    }

    const file = blob
      ? new File([blob], 'aura-square-score.png', { type: 'image/png' })
      : null;

    // ── Attempt 1: native share with the image attached ──────
    if (file
        && typeof navigator.canShare === 'function'
        && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Aura Square', text: shareText });
        setStatus('shared');
        return;
      } catch (err) {
        // AbortError = user closed the share sheet themselves —
        // that's a normal cancellation, not a failure to fall back from.
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus('idle');
          return;
        }
        // Any other error: fall through to the next attempt.
      }
    }

    // ── Attempt 2: native share, text-only ────────────────────
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Aura Square', text: shareText });
        setStatus('shared');
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus('idle');
          return;
        }
      }
    }

    // ── Attempt 3: download image + copy caption text ─────────
    try {
      if (blob) downloadBlob(blob, 'aura-square-score.png');
      if (typeof navigator.clipboard?.writeText === 'function') {
        await navigator.clipboard.writeText(shareText);
      }
      setStatus('downloaded');
    } catch {
      setStatus('error');
    }
  }, [t]);

  const reset = useCallback(() => setStatus('idle'), []);

  return { share, status, reset };
}
