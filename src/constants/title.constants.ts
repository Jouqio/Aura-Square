// ============================================================
// title.constants.ts
// Aura Square — Title Collection
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Titles are NEVER stored as a separate "unlocked" list — they're
// always re-derived from current level/rank/combo/achievement
// state. This means a title can never desync from the stats that
// earned it. Only the currently EQUIPPED title id is persisted
// (in playerStore), and equipping silently falls back to the
// default if the player somehow no longer qualifies (e.g. a
// future rebalance) — see getEquippableTitle().

import type { RankTier } from './rank.constants';

export interface TitleCheckContext {
  level:            number;
  rankTier:         RankTier;
  maxComboEver:     number;
  unlockedCount:    number;
  totalAchievements: number;
}

export interface TitleDef {
  id:    string;
  label: string;
  check: (ctx: TitleCheckContext) => boolean;
}

const RANK_ORDER: RankTier[] = [
  'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster',
];
function rankAtLeast(ctx: TitleCheckContext, min: RankTier): boolean {
  return RANK_ORDER.indexOf(ctx.rankTier) >= RANK_ORDER.indexOf(min);
}

export const TITLES: TitleDef[] = [
  { id: 'pemula',          label: 'Pemula',           check: () => true },
  { id: 'penjelajah',      label: 'Penjelajah',       check: (c) => c.level >= 10 },
  { id: 'ahli_strategi',   label: 'Ahli Strategi',    check: (c) => c.level >= 25 },
  { id: 'veteran',         label: 'Veteran',          check: (c) => c.level >= 50 },
  { id: 'master_blok',     label: 'Master Blok',      check: (c) => c.level >= 75 },
  { id: 'legenda_aura',    label: 'Legenda Aura',     check: (c) => c.level >= 100 },
  { id: 'sang_juara',      label: 'Sang Juara',       check: (c) => rankAtLeast(c, 'gold') },
  { id: 'penakluk',        label: 'Penakluk',         check: (c) => rankAtLeast(c, 'diamond') },
  { id: 'grandmaster_sejati', label: 'Grandmaster Sejati', check: (c) => c.rankTier === 'grandmaster' },
  { id: 'raja_combo',      label: 'Raja Combo',       check: (c) => c.maxComboEver >= 4 },
  { id: 'kolektor',        label: 'Kolektor',         check: (c) => c.unlockedCount >= c.totalAchievements && c.totalAchievements > 0 },
];

export const DEFAULT_TITLE_ID = 'pemula';

export function isTitleUnlocked(title: TitleDef, ctx: TitleCheckContext): boolean {
  return title.check(ctx);
}

export function getUnlockedTitles(ctx: TitleCheckContext): TitleDef[] {
  return TITLES.filter((t) => isTitleUnlocked(t, ctx));
}

/** Returns the title to actually display: the equipped one if the
 *  player still qualifies for it, otherwise the default. */
export function getEquippableTitle(equippedId: string, ctx: TitleCheckContext): TitleDef {
  const equipped = TITLES.find((t) => t.id === equippedId);
  if (equipped && isTitleUnlocked(equipped, ctx)) return equipped;
  return TITLES.find((t) => t.id === DEFAULT_TITLE_ID) ?? (TITLES[0] as TitleDef);
}
