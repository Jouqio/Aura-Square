// ============================================================
// shareCard.service.ts
// Aura Square — Shareable Score Card (Share Score feature)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Renders a branded PNG entirely client-side via Canvas 2D — no
// server round-trip needed. Sized 1080x1920 (9:16) to match
// Instagram Story / WhatsApp Status dimensions, since those were
// the explicitly named sharing targets.
//
// Uses only system-safe fonts (Arial Black / sans-serif), same
// choice as the static OG image generation (see
// public/og-image-source.svg) — this avoids canvas text rendering
// races against custom @font-face loading, which is a common
// source of "sometimes renders with fallback font" bugs.

const CARD_W = 1080;
const CARD_H = 1920;

export interface ShareCardParams {
  score:       number;
  bestScore:   number;
  isNewBest:   boolean;
  playerName?: string;
  /** Localized strings so the card matches the player's chosen
   *  app language — passed in rather than using i18next directly
   *  here, keeping this module framework-agnostic and testable. */
  labels: {
    appName:    string; // "AURA SQUARE"
    tagline:    string; // "Isi. Sapu. Menang."
    scoreLabel: string; // "SKOR"
    newBest:    string; // "REKOR BARU!"
    bestLabel:  string; // "Rekor Terbaik"
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

const PIECE_COLORS = ['#ff5e5e', '#F5C842', '#4DCC7A', '#4a9eff', '#b06aff', '#ff8c3a'];

/**
 * Draws the full share card onto a freshly-created off-screen
 * canvas and returns it as a PNG Blob. Pure function — takes no
 * DOM dependency beyond `document.createElement('canvas')`, so it
 * can run any time after the game-over score is known.
 */
export function generateShareCard(params: ShareCardParams): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width  = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Canvas 2D context unavailable'));
  }

  // ── Background ──────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_H);
  bgGrad.addColorStop(0,   '#0B0C14');
  bgGrad.addColorStop(1,   '#160a2e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Soft radial glow behind the score
  const glow = ctx.createRadialGradient(
    CARD_W / 2, CARD_H * 0.42, 0,
    CARD_W / 2, CARD_H * 0.42, CARD_W * 0.7,
  );
  glow.addColorStop(0, 'rgba(124,58,237,0.28)');
  glow.addColorStop(1, 'rgba(124,58,237,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // ── Decorative piece blocks (corners, subtle) ───────────
  const decorate = (x: number, y: number, opacity: number) => {
    const size = 64;
    const gap  = 10;
    [0, 1].forEach((row) => {
      [0, 1].forEach((col) => {
        ctx.globalAlpha = opacity;
        ctx.fillStyle = PIECE_COLORS[(row * 2 + col) % PIECE_COLORS.length] ?? '#888';
        roundRect(ctx, x + col * (size + gap), y + row * (size + gap), size, size, 14);
        ctx.fill();
      });
    });
    ctx.globalAlpha = 1;
  };
  decorate(CARD_W - 220, 100, 0.85);
  decorate(80, CARD_H - 260, 0.5);

  // ── Logo mark ────────────────────────────────────────────
  const logoSize = 140;
  const logoX = CARD_W / 2 - logoSize / 2;
  const logoY = 220;
  const logoGrad = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
  logoGrad.addColorStop(0, '#5b21d4');
  logoGrad.addColorStop(1, '#9333ea');
  ctx.fillStyle = logoGrad;
  roundRect(ctx, logoX, logoY, logoSize, logoSize, 32);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = '900 88px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', CARD_W / 2, logoY + logoSize / 2 + 6);

  // ── App name + tagline ───────────────────────────────────
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(params.labels.appName, CARD_W / 2, logoY + logoSize + 90);

  ctx.fillStyle = '#c4b5fd';
  ctx.font = '500 34px Arial, sans-serif';
  ctx.fillText(params.labels.tagline, CARD_W / 2, logoY + logoSize + 150);

  // ── New best badge ───────────────────────────────────────
  let scoreCenterY = CARD_H * 0.5;
  if (params.isNewBest) {
    const badgeY = scoreCenterY - 210;
    ctx.font = '700 32px Arial, sans-serif';
    const badgeText = params.labels.newBest;
    const textW = ctx.measureText(badgeText).width;
    const badgeW = textW + 80;
    const badgeH = 64;
    ctx.fillStyle = 'rgba(245,200,66,0.15)';
    roundRect(ctx, CARD_W / 2 - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,200,66,0.4)';
    ctx.lineWidth = 2;
    roundRect(ctx, CARD_W / 2 - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 32);
    ctx.stroke();
    ctx.fillStyle = '#F5C842';
    ctx.fillText(badgeText, CARD_W / 2, badgeY + 2);
  }

  // ── Score label + big number ─────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '700 40px Arial, sans-serif';
  ctx.fillText(params.labels.scoreLabel, CARD_W / 2, scoreCenterY - 130);

  const scoreGrad = ctx.createLinearGradient(0, scoreCenterY - 100, 0, scoreCenterY + 100);
  scoreGrad.addColorStop(0, '#c4b5fd');
  scoreGrad.addColorStop(1, '#7c3aed');
  ctx.fillStyle = scoreGrad;
  ctx.font = '900 190px "Arial Black", Impact, sans-serif';
  ctx.fillText(params.score.toLocaleString(), CARD_W / 2, scoreCenterY + 10);

  // ── Best score (only when this run wasn't itself the new best) ──
  if (!params.isNewBest) {
    const bestY = scoreCenterY + 190;
    ctx.font = '600 36px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(
      `${params.labels.bestLabel}: ${params.bestScore.toLocaleString()}`,
      CARD_W / 2, bestY,
    );
  }

  // ── Footer decorative blocks row ─────────────────────────
  const rowY = CARD_H - 160;
  const rowColors = PIECE_COLORS;
  const blockSize = 46;
  const totalW = rowColors.length * blockSize + (rowColors.length - 1) * 12;
  let bx = CARD_W / 2 - totalW / 2;
  rowColors.forEach((color) => {
    ctx.fillStyle = color;
    roundRect(ctx, bx, rowY, blockSize, blockSize, 10);
    ctx.fill();
    bx += blockSize + 12;
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode share card image'));
    }, 'image/png');
  });
}
