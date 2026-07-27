// ============================================================
// ProfilePage.tsx — V3 (local profile, zero auth, full i18n)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useState } from 'react';
import { motion }           from 'framer-motion';
import { useTranslation }   from 'react-i18next';
import { PageWrapper }      from '../../components/layout/PageWrapper/PageWrapper';
import {
  usePlayerStore,
  selectDisplayName,
  selectAvatarEmoji,
  selectXp,
  selectEquippedTitle,
  getLevelProgress,
  AVATAR_EMOJIS,
}                           from '../../store/playerStore';
import {
  computeRankScore, getRankInfo, getRankProgress, RANK_TIERS,
}                           from '../../constants/rank.constants';
import { RankTierBadge }    from '../../components/ui/icons/RankTierBadge';
import { DiskIcon, StreakFlameIcon } from '../../components/ui/icons/GameIcons';
import { useStatsStore }    from '../../store/statsStore';
import { useGameStore, selectBestScore } from '../../store/gameStore';
import {
  useAchievementStore,
  selectUnlockedCount,
  selectTotalPoints,
}                           from '../../store/achievementStore';
import { ACHIEVEMENTS }     from '../../constants/achievement.constants';
import {
  TITLES, getEquippableTitle, isTitleUnlocked, type TitleCheckContext,
}                           from '../../constants/title.constants';
import {
  BADGES, type BadgeCheckContext,
}                           from '../../constants/badge.constants';
import { BadgeFrame, PaletteIcon, PerfectClearIcon } from '../../components/ui/icons/BadgeIcons';
import { useDailyStore }    from '../../store/dailyStore';
import { useUiStore, selectThemesTried } from '../../store/uiStore';
import { CheckIcon }        from '../../components/ui/icons/MiscIcons';

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const item    = { hidden: { opacity:0, y:12 }, show: { opacity:1, y:0 } };

export default function ProfilePage(): React.JSX.Element {
  const { t } = useTranslation();
  const displayName = usePlayerStore(selectDisplayName);
  const avatarEmoji = usePlayerStore(selectAvatarEmoji);
  const setName     = usePlayerStore((s) => s.setDisplayName);
  const setAvatar   = usePlayerStore((s) => s.setAvatarEmoji);

  const bestScore   = useGameStore(selectBestScore);
  const totalGames  = useStatsStore((s) => s.totalGames);
  const avgScore    = useStatsStore((s) => s.averageScore());
  const totalLines  = useStatsStore((s) => s.totalLinesCleared);
  const totalPieces = useStatsStore((s) => s.totalPiecesPlaced);

  const unlocked    = useAchievementStore(selectUnlockedCount);
  const achPoints   = useAchievementStore(selectTotalPoints);
  const totalAch    = ACHIEVEMENTS.length;
  const achPct      = Math.round((unlocked / totalAch) * 100);

  const xp           = usePlayerStore(selectXp);
  const levelInfo     = getLevelProgress(xp);
  const rankScore      = computeRankScore({
    bestScore, achievementPoints: achPoints, level: levelInfo.level,
  });
  const rankInfo       = getRankInfo(rankScore);
  const rankProgress   = getRankProgress(rankScore);
  const rankLabel       = (tier: string) => t(`ranks.${tier}`, { defaultValue: tier });

  // ── Title Collection ──────────────────────────────────────
  const equippedTitleId = usePlayerStore(selectEquippedTitle);
  const setEquippedTitle = usePlayerStore((s) => s.setEquippedTitle);
  const maxComboEver      = useAchievementStore((s) => s.maxComboEver);
  const titleCtx: TitleCheckContext = {
    level: levelInfo.level, rankTier: rankInfo.tier, maxComboEver,
    unlockedCount: unlocked, totalAchievements: totalAch,
  };
  const displayedTitle = getEquippableTitle(equippedTitleId, titleCtx);
  const titleLabel = (id: string, fallback: string) =>
    t(`titles.${id}`, { defaultValue: fallback });
  const [showTitlePicker, setShowTitlePicker] = useState(false);

  // ── Badge Collection ──────────────────────────────────────
  const bestStreak  = useDailyStore((s) => s.bestStreak);
  const themesTried = useUiStore(selectThemesTried);
  const badgeCtx: BadgeCheckContext = {
    rankTier: rankInfo.tier, bestStreak, maxComboEver,
    themesTried: themesTried.length,
  };
  const unlockedBadgeIds = new Set(
    BADGES.filter((b) => b.check(badgeCtx)).map((b) => b.id),
  );

  const [editName,   setEditName]   = useState(false);
  const [nameInput,  setNameInput]  = useState(displayName);
  const [showPicker, setShowPicker] = useState(false);

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) setName(trimmed);
    setEditName(false);
  };

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="flex flex-col gap-5">

        <motion.div variants={item}
          className="flex flex-col items-center gap-4 pt-4 pb-2">

          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setShowPicker((v) => !v)}
            className="avatar-frame w-20 h-20 rounded-3xl bg-surface-200
              flex items-center justify-center text-5xl relative select-none"
            style={{
              '--frame-from': rankInfo.colorFrom,
              '--frame-to':   rankInfo.colorTo,
            } as React.CSSProperties}>
            {avatarEmoji}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full
              bg-aura-600 border-2 border-surface-50 flex items-center
              justify-center text-xs pointer-events-none">✏️</span>
          </motion.button>

          {showPicker && (
            <motion.div
              initial={{ opacity:0, y:-8, scale:0.95 }}
              animate={{ opacity:1, y:0,  scale:1   }}
              className="grid grid-cols-8 gap-2 p-3 rounded-2xl
                bg-surface-200 border border-surface-400 w-full">
              {AVATAR_EMOJIS.map((e) => (
                <button key={e}
                  onClick={() => { setAvatar(e); setShowPicker(false); }}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center
                    justify-center transition-all hover:scale-110
                    ${avatarEmoji===e
                      ? 'bg-aura-700/60 border-2 border-aura-400 scale-110'
                      : 'bg-surface-300 hover:bg-surface-400'}`}>
                  {e}
                </button>
              ))}
            </motion.div>
          )}

          {editName ? (
            <div className="flex items-center gap-2 w-full max-w-xs">
              <input autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key==='Enter') saveName(); if (e.key==='Escape') setEditName(false); }}
                maxLength={20}
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-200
                  border border-aura-600 text-white text-center text-lg
                  font-bold outline-none caret-aura-400"/>
              <button onClick={saveName}
                className="w-10 h-10 rounded-xl bg-aura-600 hover:bg-aura-500
                  text-white font-bold text-lg transition-colors flex-shrink-0">
                ✓
              </button>
            </div>
          ) : (
            <button onClick={() => { setNameInput(displayName); setEditName(true); }}
              className="flex items-center gap-2 group cursor-pointer">
              <span className="text-xl font-bold text-white">{displayName}</span>
              <span className="text-white/30 group-hover:text-aura-400
                transition-colors">✏️</span>
            </button>
          )}

          <button onClick={() => setShowTitlePicker((v) => !v)}
            className="title-chip">
            {titleLabel(displayedTitle.id, displayedTitle.label)}
            <span className="title-chip__caret">›</span>
          </button>

          {showTitlePicker && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-2xl bg-surface-200 border
                border-surface-400 p-2 flex flex-col gap-1 max-h-64 overflow-y-auto"
            >
              {TITLES.map((titleDef) => {
                const titleUnlocked = isTitleUnlocked(titleDef, titleCtx);
                const isEquipped = titleDef.id === displayedTitle.id;
                return (
                  <button key={titleDef.id}
                    disabled={!titleUnlocked}
                    onClick={() => { setEquippedTitle(titleDef.id); setShowTitlePicker(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl
                      text-sm transition-colors
                      ${isEquipped ? 'bg-aura-700/40 text-aura-200' :
                        titleUnlocked ? 'text-white/70 hover:bg-surface-300' :
                        'text-white/25 cursor-not-allowed'}`}>
                    <span>{titleLabel(titleDef.id, titleDef.label)}</span>
                    {isEquipped && <CheckIcon size={14}/>}
                  </button>
                );
              })}
            </motion.div>
          )}

          <div className="flex gap-2">
            <span className="no-login-badge">
              ✓ {t('profile.no_login_badge', { defaultValue: 'Tanpa Login' })}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold
              bg-surface-300 border border-surface-400 text-white/50">
              {t('profile.local_data_badge', { defaultValue: 'Data Lokal' })}
            </span>
          </div>
        </motion.div>

        {/* ── Player Card: Level + Rank ───────────────────── */}
        <motion.div variants={item} className="player-card">
          <div className="player-card__row">
            <div className="player-card__level">
              <span className="player-card__level-num">{levelInfo.level}</span>
              <span className="player-card__level-lbl">
                {t('player_card.level', { defaultValue: 'LEVEL' })}
              </span>
            </div>
            <div className="player-card__rank">
              <RankTierBadge tier={rankInfo.tier} size={34}/>
              <span className="player-card__rank-lbl">{rankLabel(rankInfo.tier)}</span>
            </div>
          </div>

          <div className="player-card__bar-wrap">
            <div className="player-card__bar-labels">
              <span>{t('player_card.xp', { defaultValue: 'XP' })}</span>
              <span>
                {levelInfo.isMaxLevel
                  ? t('player_card.max_level', { defaultValue: 'Level Maksimum!' })
                  : `${levelInfo.xpIntoLevel} / ${levelInfo.xpForNextLevel}`}
              </span>
            </div>
            <div className="player-card__bar-track">
              <motion.div className="player-card__bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.pct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}/>
            </div>
          </div>

          {rankProgress.next && (
            <div className="player-card__bar-wrap">
              <div className="player-card__bar-labels">
                <span>
                  {t('player_card.rank_progress_to', {
                    defaultValue: `Menuju ${rankLabel(rankProgress.next.tier)}`,
                    rank: rankLabel(rankProgress.next.tier),
                  })}
                </span>
                <span>{rankProgress.pct}%</span>
              </div>
              <div className="player-card__bar-track">
                <motion.div className="player-card__bar-fill player-card__bar-fill--rank"
                  initial={{ width: 0 }}
                  animate={{ width: `${rankProgress.pct}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.35 }}/>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Badge Collection ─────────────────────────────── */}
        <motion.div variants={item}>
          <Label>
            {t('profile.badge_collection', { defaultValue: 'Koleksi Lencana' })} ({unlockedBadgeIds.size}/{BADGES.length})
          </Label>
          <div className="grid grid-cols-4 gap-3 mt-2">
            {BADGES.map((b) => {
              const isUnlocked = unlockedBadgeIds.has(b.id);
              const ownTier = b.tier
                ? RANK_TIERS.find((rt) => rt.tier === b.tier)
                : null;
              const colorFrom = ownTier?.colorFrom ?? '#c4b5fd';
              const colorTo   = ownTier?.colorTo   ?? '#7c3aed';
              const badgeLabel = t(`badges.${b.id}.label`, { defaultValue: b.label });
              const badgeDesc  = t(`badges.${b.id}.desc`,  { defaultValue: b.desc });
              return (
                <div key={b.id} className="flex flex-col items-center gap-1.5" title={badgeDesc}>
                  <BadgeFrame
                    size={52}
                    locked={!isUnlocked}
                    colorFrom={colorFrom}
                    colorTo={colorTo}
                  >
                    {b.kind === 'rank'
                      ? <RankTierBadge tier={b.tier!} size={26}/>
                      : b.id === 'theme_explorer' ? <PaletteIcon size={24}/>
                      : b.id === 'streak_master'  ? <StreakFlameIcon size={22}/>
                      : <PerfectClearIcon size={24}/>}
                  </BadgeFrame>
                  <span className={`text-[10px] text-center leading-tight
                    ${isUnlocked ? 'text-white/70' : 'text-white/25'}`}>
                    {badgeLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <Label>{t('profile.stats_section', { defaultValue: 'Statistik Permainan' })}</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <StatCard v={bestScore>0?bestScore.toLocaleString():'—'}
              l={t('profile.best_score', { defaultValue: 'Skor Terbaik' })} accent/>
            <StatCard v={String(totalGames)}
              l={t('profile.total_games', { defaultValue: 'Total Permainan' })}/>
            <StatCard v={avgScore>0?avgScore.toLocaleString():'—'}
              l={t('profile.avg_score', { defaultValue: 'Rata-rata Skor' })}/>
            <StatCard v={String(totalLines)}
              l={t('profile.lines_cleared', { defaultValue: 'Baris Dibersihkan' })}/>
          </div>
        </motion.div>

        <motion.div variants={item}
          className="rounded-2xl bg-surface-200 border border-surface-400
            px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-white/60">
            {t('profile.pieces_placed_total', { defaultValue: 'Total Potongan Diletakkan' })}
          </span>
          <span className="font-mono font-bold text-white">
            {totalPieces.toLocaleString()}
          </span>
        </motion.div>

        <motion.div variants={item}>
          <Label>{t('profile.achievements_section', { defaultValue: 'Pencapaian' })}</Label>
          <div className="mt-2 rounded-2xl bg-surface-200 border
            border-surface-400 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/60">
                {t('profile.unlocked_of', {
                  defaultValue: `${unlocked} / ${totalAch} terbuka`,
                  count: unlocked, total: totalAch,
                })}
              </span>
              <span className="text-sm font-mono font-bold text-aura-400">
                {achPoints} {t('profile.points', { defaultValue: 'poin' })}
              </span>
            </div>
            <div className="h-2.5 bg-surface-400 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full
                  bg-gradient-to-r from-aura-600 to-aura-400"
                initial={{ width: 0 }}
                animate={{ width: `${achPct}%` }}
                transition={{ duration: 0.9, ease:'easeOut', delay:0.2 }}/>
            </div>
            <p className="text-xs text-white/30 mt-2 text-right">
              {achPct}% {t('achievements.percent_complete', { defaultValue: 'selesai' })}
            </p>
          </div>
        </motion.div>

        <motion.div variants={item}
          className="rounded-2xl bg-surface-200 border border-surface-400
            p-4 flex items-start gap-3">
          <DiskIcon size={20} className="text-aura-300 flex-shrink-0"/>
          <div>
            <p className="text-sm font-semibold text-white">
              {t('profile.local_data_title', { defaultValue: 'Profil Tersimpan Lokal' })}
            </p>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              {t('profile.local_data_desc', {
                defaultValue: 'Semua data tersimpan di perangkat ini menggunakan localStorage. Tidak ada server, tidak ada akun yang diperlukan. Ganti nama atau avatar kapanpun kamu mau!',
              })}
            </p>
          </div>
        </motion.div>

      </motion.div>
    </PageWrapper>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-white/30 uppercase
      tracking-widest px-1">{children}</p>
  );
}

function StatCard({ v, l, accent }: { v:string; l:string; accent?:boolean }) {
  return (
    <div className={`rounded-2xl border p-4
      ${accent
        ? 'bg-aura-950/60 border-aura-800/50'
        : 'bg-surface-200 border-surface-400'}`}>
      <p className={`text-2xl font-bold font-mono
        ${accent ? 'text-aura-300' : 'text-white'}`}>{v}</p>
      <p className="text-xs text-white/40 mt-0.5">{l}</p>
    </div>
  );
}
