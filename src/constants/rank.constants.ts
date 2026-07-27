// ============================================================
// rank.constants.ts
// Aura Square — Rank System (Bronze → Grandmaster)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Rank is a composite "prestige" tier derived from three signals:
// best score, total achievement points, and player level. It is
// NEVER stored directly — always recomputed from those sources so
// it can't drift or get corrupted in persisted storage.

export type RankTier =
  | 'bronze' | 'silver' | 'gold' | 'platinum'
  | 'diamond' | 'master' | 'grandmaster';

export interface RankInfo {
  tier:        RankTier;
  label:       string;
  minScore:    number;   // composite rank-score threshold
  colorFrom:   string;
  colorTo:     string;
}

export const RANK_TIERS: RankInfo[] = [
  { tier: 'bronze',      label: 'Perunggu',   minScore: 0,     colorFrom: '#a85c2e', colorTo: '#6b3a1a' },
  { tier: 'silver',      label: 'Perak',      minScore: 300,   colorFrom: '#cfd2dc', colorTo: '#8c8f9c' },
  { tier: 'gold',        label: 'Emas',       minScore: 700,   colorFrom: '#fde68a', colorTo: '#c9941f' },
  { tier: 'platinum',    label: 'Platinum',   minScore: 1500,  colorFrom: '#a7f3d0', colorTo: '#34a883' },
  { tier: 'diamond',     label: 'Diamond',    minScore: 3000,  colorFrom: '#bae6fd', colorTo: '#2563eb' },
  { tier: 'master',      label: 'Master',     minScore: 6000,  colorFrom: '#e9d5ff', colorTo: '#9333ea' },
  { tier: 'grandmaster', label: 'Grandmaster',minScore: 12000, colorFrom: '#fecaca', colorTo: '#dc2626' },
];

/**
 * Composite score combining best score, achievement points, and
 * player level into a single number used to look up the rank tier.
 * Weights are an initial balance pass — tune freely without
 * touching any other system, since rank is always re-derived.
 */
export function computeRankScore(opts: {
  bestScore:          number;
  achievementPoints:  number;
  level:              number;
}): number {
  return Math.round(
    opts.bestScore +
    opts.achievementPoints +
    opts.level * 25,
  );
}

export function getRankInfo(rankScore: number): RankInfo {
  let current = RANK_TIERS[0] as RankInfo;
  for (const tier of RANK_TIERS) {
    if (rankScore >= tier.minScore) current = tier;
  }
  return current;
}

/** Progress (0-100) toward the NEXT rank tier, or 100 if maxed out. */
export function getRankProgress(rankScore: number): {
  current: RankInfo;
  next:    RankInfo | null;
  pct:     number;
} {
  const idx = RANK_TIERS.findIndex((t) => t.tier === getRankInfo(rankScore).tier);
  const current = RANK_TIERS[idx] as RankInfo;
  const next = RANK_TIERS[idx + 1] ?? null;

  if (!next) return { current, next: null, pct: 100 };

  const span = next.minScore - current.minScore;
  const into = rankScore - current.minScore;
  return { current, next, pct: Math.min(100, Math.round((into / span) * 100)) };
}
