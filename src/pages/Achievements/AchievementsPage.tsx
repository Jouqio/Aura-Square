// ============================================================
// AchievementsPage.tsx
// Aura Square Phase 4.0 — Achievements browser
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation }   from 'react-i18next';
import { PageWrapper }      from '../../components/layout/PageWrapper/PageWrapper';
import { AchievementCard }  from '../../components/achievements/AchievementCard';
import {
  useAchievementStore,
  selectUnlocked,
  selectTotalPoints,
} from '../../store/achievementStore';
import {
  ACHIEVEMENTS,
  TOTAL_ACHIEVEMENT_POINTS,
  CATEGORY_LABELS,
  type AchievementCategory,
} from '../../constants/achievement.constants';
import {
  AllCategoriesIcon, ScoreTabIcon, GamesTabIcon, LinesTabIcon,
  ComboTabIcon, SpecialTabIcon, DailyTabIcon, MasteryTabIcon,
} from '../../components/achievements/CategoryTabIcons';

const CATS: (AchievementCategory | 'all')[] = [
  'all', 'score', 'games', 'lines', 'combo', 'special', 'daily', 'mastery',
];
const CAT_ICON_COMPONENTS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  all: AllCategoriesIcon, score: ScoreTabIcon, games: GamesTabIcon,
  lines: LinesTabIcon, combo: ComboTabIcon, special: SpecialTabIcon,
  daily: DailyTabIcon, mastery: MasteryTabIcon,
};

const stagger = { show: { transition: { staggerChildren: 0.04 } } };
const item    = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function AchievementsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [cat, setCat] = useState<AchievementCategory | 'all'>('all');

  const unlocked    = useAchievementStore(selectUnlocked);
  const totalPoints = useAchievementStore(selectTotalPoints);

  const unlockedIds = useMemo(
    () => new Set(unlocked.map((u) => u.id)),
    [unlocked],
  );

  const sorted = useMemo(() => {
    const filtered = cat === 'all'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter((a) => a.category === cat);

    // Sort: unlocked first, then locked
    return [...filtered].sort((a, b) => {
      const aU = unlockedIds.has(a.id) ? 0 : 1;
      const bU = unlockedIds.has(b.id) ? 0 : 1;
      return aU - bU;
    });
  }, [cat, unlockedIds]);

  const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  return (
    <PageWrapper>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5"
      >
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-xl font-bold text-white">
            {t('achievements.page_title', { defaultValue: 'Pencapaian' })}
          </h1>
          <p className="text-xs text-white/40 mt-0.5">
            {t('achievements.unlocked_count', {
              defaultValue: `${unlocked.length} / ${ACHIEVEMENTS.length} terbuka`,
              count: unlocked.length, total: ACHIEVEMENTS.length,
            })}
          </p>
        </motion.div>

        {/* Progress card */}
        <motion.div variants={item}
          className="rounded-2xl bg-aura-950/60 border border-aura-800/40 p-4">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-2xl font-bold font-mono text-white">
                {totalPoints.toLocaleString()}
              </p>
              <p className="text-xs text-white/40">
                {t('achievements.points_total', {
                  defaultValue: `dari ${TOTAL_ACHIEVEMENT_POINTS.toLocaleString()} poin total`,
                  total: TOTAL_ACHIEVEMENT_POINTS.toLocaleString(),
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-aura-400">{pct}%</p>
              <p className="text-xs text-white/40">
                {t('achievements.percent_complete', { defaultValue: 'selesai' })}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-surface-400 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-aura-500 to-aura-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </motion.div>

        {/* Category filter tabs */}
        <motion.div variants={item}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATS.map((c) => {
            const count = c === 'all'
              ? unlocked.length
              : unlocked.filter((u) =>
                  ACHIEVEMENTS.find((a) => a.id === u.id)?.category === c,
                ).length;
            const TabIcon = CAT_ICON_COMPONENTS[c] ?? AllCategoriesIcon;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5
                  rounded-xl text-xs font-semibold transition-all
                  ${cat === c
                    ? 'bg-aura-600 text-white'
                    : 'bg-surface-300 border border-surface-400 text-white/50 hover:text-white/80'
                  }`}
              >
                <TabIcon size={13}/>
                <span>
                  {c === 'all'
                    ? t('achievements.categories.all', { defaultValue: 'Semua' })
                    : t(`achievements.categories.${c}`, { defaultValue: CATEGORY_LABELS[c as AchievementCategory] })}
                </span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.5
                  ${cat === c ? 'bg-white/20 text-white' : 'bg-surface-400 text-white/40'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Achievement grid */}
        <motion.div variants={item}>
          <AnimatePresence mode="wait">
            <motion.div
              key={cat}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2"
            >
              {sorted.map((def) => (
                <AchievementCard
                  key={def.id}
                  def={def}
                  unlocked={unlockedIds.has(def.id)}
                  unlockedAt={unlocked.find((u) => u.id === def.id)?.unlockedAt}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
}
