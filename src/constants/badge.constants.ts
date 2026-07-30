// ============================================================
// badge.constants.ts
// Aura Square — Badge Collection
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Like titles, badges are always re-derived from current state —
// never stored as a separate unlocked list. A badge is "earned"
// the moment its check() passes, permanently (every signal it
// reads from — bestScore, achievementPoints, level, bestStreak,
// maxComboEver, themesTried — is monotonically non-decreasing,
// so a badge can never un-earn itself).

import type { RankTier } from "./rank.constants";
import { RANK_TIERS } from "./rank.constants";

export type BadgeKind = "rank" | "special";

export interface BadgeCheckContext {
  rankTier: RankTier;
  bestStreak: number;
  maxComboEver: number;
  themesTried: number; // count of distinct themes the player has selected
}

export interface BadgeDef {
  id: string;
  kind: BadgeKind;
  label: string;
  desc: string;
  /** Only present for kind: 'rank' — which tier this badge represents. */
  tier?: RankTier;
  check: (ctx: BadgeCheckContext) => boolean;
}

const RANK_ORDER: RankTier[] = RANK_TIERS.map((t) => t.tier);
function rankAtLeast(ctx: BadgeCheckContext, min: RankTier): boolean {
  return RANK_ORDER.indexOf(ctx.rankTier) >= RANK_ORDER.indexOf(min);
}

const RANK_BADGE_LABELS: Record<RankTier, string> = {
  bronze: "Lencana Perunggu",
  silver: "Lencana Perak",
  gold: "Lencana Emas",
  platinum: "Lencana Platinum",
  diamond: "Lencana Diamond",
  master: "Lencana Master",
  grandmaster: "Lencana Grandmaster",
};

export const BADGES: BadgeDef[] = [
  ...RANK_TIERS.map(
    (t): BadgeDef => ({
      id: `rank_${t.tier}`,
      kind: "rank",
      tier: t.tier,
      label: RANK_BADGE_LABELS[t.tier],
      desc: `Capai rank ${t.label}`,
      check: (c) => rankAtLeast(c, t.tier),
    }),
  ),
  {
    id: "theme_explorer",
    kind: "special",
    label: "Penjelajah Tema",
    desc: "Coba semua tema Aura",
    check: (c) => c.themesTried >= 4,
  },
  {
    id: "streak_master",
    kind: "special",
    label: "Maestro Streak",
    desc: "Raih streak harian 7 hari",
    check: (c) => c.bestStreak >= 7,
  },
  {
    id: "perfect_clear",
    kind: "special",
    label: "Pembersih Sempurna",
    desc: "Raih combo Quad (4 baris sekaligus)",
    check: (c) => c.maxComboEver >= 4,
  },
];

export function getUnlockedBadges(ctx: BadgeCheckContext): BadgeDef[] {
  return BADGES.filter((b) => b.check(ctx));
}
