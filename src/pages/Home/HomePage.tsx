// ============================================================
// HomePage.tsx — Aura Cyber Neon upgrade
// Custom SVG icons replace all emoji. Zero login, instant play.
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate }    from 'react-router-dom';
import { motion }         from 'framer-motion';
import { ROUTES }         from '../../router/routes';
import {
  useGameStore,
  selectBestScore,
  selectHasSavedGame,
  selectScore,
} from '../../store/gameStore';
import { useStatsStore }    from '../../store/statsStore';
import {
  useAchievementStore,
  selectUnlockedCount,
} from '../../store/achievementStore';
import {
  useDailyStore,
  getTodayString,
  RANK_COLORS,
} from '../../store/dailyStore';
import {
  usePlayerStore,
  selectDisplayName,
  selectAvatarEmoji,
} from '../../store/playerStore';
import { ACHIEVEMENTS }   from '../../constants/achievement.constants';
import {
  TrophyIcon, PlayIcon, StreakFlameIcon, CalendarIcon,
  AchievementCrystalIcon, RankShieldIcon, AnalyticsIcon, HexGearIcon,
  RankMedalIcon,
} from '../../components/ui/icons/GameIcons';
import { GamepadIcon } from '../../components/ui/icons/MiscIcons';
import { useAudio }    from '../../hooks/useAudio';
import { useTranslation } from 'react-i18next';

const stagger = {
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const fadeUp  = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};
const popIn   = {
  hidden: { opacity: 0, scale: 0.88 },
  show:   { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 24 } },
};

export default function HomePage(): React.JSX.Element {
  const navigate      = useNavigate();
  const audio          = useAudio();
  const { t }          = useTranslation();

  const displayName   = usePlayerStore(selectDisplayName);
  const avatarEmoji   = usePlayerStore(selectAvatarEmoji);

  const bestScore     = useGameStore(selectBestScore);
  const hasSavedGame  = useGameStore(selectHasSavedGame);
  const currentScore  = useGameStore(selectScore);

  const totalGames    = useStatsStore((s) => s.totalGames);
  const avgScore      = useStatsStore((s) => s.averageScore());

  const unlockedCount = useAchievementStore(selectUnlockedCount);
  const totalAch      = ACHIEVEMENTS.length;
  const achPct        = Math.round((unlockedCount / totalAch) * 100);

  const today         = getTodayString();
  const dailyDone     = useDailyStore((s) => !!s.getCompletion(today));
  const dailyScore    = useDailyStore((s) => s.getCompletion(today)?.score);
  const dailyRank     = useDailyStore((s) => s.getCompletion(today)?.rank ?? null);
  const streak        = useDailyStore((s) => s.getStreak());

  const [hour, setHour] = useState(new Date().getHours());
  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(t);
  }, []);

  const greeting =
    hour < 5  ? t('common.greeting_night',     { defaultValue: 'Selamat Malam' }) :
    hour < 12 ? t('common.greeting_morning',   { defaultValue: 'Selamat Pagi' })  :
    hour < 15 ? t('common.greeting_afternoon', { defaultValue: 'Selamat Siang' }) :
    hour < 19 ? t('common.greeting_evening',   { defaultValue: 'Selamat Sore' })  :
                t('common.greeting_night',     { defaultValue: 'Selamat Malam' });

  return (
    <div className="home-page">
      {[
        [160, 160, '5%',  '70%', 25,  0.04],
        [90,  90,  '20%', '3%', -15,  0.03],
        [220, 220, '55%', '60%', 38,  0.025],
        [70,  70,  '75%', '6%',  50,  0.035],
        [120, 120, '40%', '82%',-28,  0.03],
      ].map(([w, h, top, left, rot, op], i) => (
        <div key={i} className="home-bg-sq" style={{
          width: w as number, height: h as number,
          top: top as string, left: left as string,
          transform: `rotate(${rot}deg)`, opacity: op as number,
        }} />
      ))}

      <div className="home-scroll">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="home-inner"
        >

          {/* ── Header ───────────────────────────────────── */}
          <motion.div variants={fadeUp}
            className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest">
                {greeting}
                {streak > 1 && (
                  <span className="streak-badge ml-2">
                    <StreakFlameIcon size={12}/> {streak} {t('common.streak_suffix', { defaultValue: 'hari' })}
                  </span>
                )}
              </p>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {displayName}
              </h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(ROUTES.PROFILE)}
              className="w-11 h-11 rounded-2xl bg-surface-200 border
                border-surface-400 flex items-center justify-center text-2xl
                hover:border-aura-700 transition-colors"
            >
              {avatarEmoji}
            </motion.button>
          </motion.div>

          {/* ── Play button ──────────────────────────────── */}
          <motion.div variants={popIn}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01, filter: 'brightness(1.08)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={() => { audio.click(); navigate(ROUTES.GAME); }}
              className="btn-play-xl"
            >
              <motion.div
                className="btn-play-xl__ring"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              />

              <div className="btn-play-xl__content">
                <span className="btn-play-xl__icon">
                  <PlayIcon size={26}/>
                </span>
                <div className="btn-play-xl__text-wrap">
                  <span className="btn-play-xl__label">
                    {hasSavedGame
                      ? t('common.continue_game', { defaultValue: 'Lanjutkan Permainan' })
                      : t('common.play_now', { defaultValue: 'Main Sekarang' })}
                  </span>
                  {hasSavedGame ? (
                    <span className="btn-play-xl__sub">
                      {t('home.current_score', { defaultValue: `Skor saat ini: ${currentScore.toLocaleString()} pts`, score: currentScore.toLocaleString() })}
                    </span>
                  ) : (
                    <span className="btn-play-xl__sub">
                      {t('home.play_offline_hint', { defaultValue: 'Langsung bermain — tanpa login' })}
                    </span>
                  )}
                </div>
              </div>

              {bestScore > 0 && (
                <span className="btn-play-xl__chip">
                  <TrophyIcon size={13}/> {bestScore.toLocaleString()}
                </span>
              )}
            </motion.button>

            {hasSavedGame && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileTap={{ scale: 0.95 }}
                className="btn-newgame"
                onClick={() => {
                  useGameStore.getState().resetGame();
                  navigate(ROUTES.GAME);
                }}
              >
                ✚ {t('home.new_game_cta', { defaultValue: 'Mulai Game Baru' })}
              </motion.button>
            )}
          </motion.div>

          {/* ── Stats pills ──────────────────────────────── */}
          <motion.div variants={fadeUp} className="stats-pills">
            <StatPill icon={<TrophyIcon size={18}/>}
              value={bestScore > 0 ? bestScore.toLocaleString() : '—'}
              label={t('home.stat_best', { defaultValue: 'Terbaik' })} />
            <StatPill icon={<GamepadIcon size={18}/>}
              value={String(totalGames)}
              label={t('home.stat_played', { defaultValue: 'Dimainkan' })} />
            <StatPill icon={<AnalyticsIcon size={18}/>}
              value={avgScore > 0 ? avgScore.toLocaleString() : '—'}
              label={t('home.stat_average', { defaultValue: 'Rata-rata' })} />
          </motion.div>

          {/* ── Daily challenge card ─────────────────────── */}
          <motion.div variants={fadeUp}>
            <DailyCard
              done={dailyDone}
              score={dailyScore}
              rank={dailyRank}
              onPlay={() => navigate(ROUTES.DAILY)}
            />
          </motion.div>

          {/* ── Achievement progress ─────────────────────── */}
          {totalGames > 0 && (
            <motion.div
              variants={fadeUp}
              className="ach-banner"
              onClick={() => navigate(ROUTES.ACHIEVEMENTS)}
            >
              <div className="ach-banner__left">
                <AchievementCrystalIcon size={22}/>
                <div>
                  <p className="ach-banner__title">
                    {t('home.achievements_progress', { defaultValue: `${unlockedCount} / ${totalAch} Pencapaian`, count: unlockedCount, total: totalAch })}
                  </p>
                  <p className="ach-banner__sub">
                    {t('home.percent_done', { defaultValue: `${achPct}% selesai`, pct: achPct })}
                  </p>
                </div>
              </div>
              <div className="ach-banner__right">
                <div className="ach-banner__bar">
                  <motion.div
                    className="ach-banner__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${achPct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
                  />
                </div>
                <span className="ach-banner__arrow">›</span>
              </div>
            </motion.div>
          )}

          {/* ── Quick access ──────────────────────────────── */}
          <motion.div variants={fadeUp} className="quick-grid">
            <QuickCard icon={<AchievementCrystalIcon size={24}/>}
              label={t('nav.achievements', { defaultValue: 'Pencapaian' })}
              sub={`${unlockedCount}/${totalAch}`} onClick={() => navigate(ROUTES.ACHIEVEMENTS)} />
            <QuickCard icon={<RankShieldIcon size={24}/>}
              label={t('nav.leaderboard', { defaultValue: 'Klasemen' })}
              sub={t('home.quick_best_score', { defaultValue: 'Skor terbaik' })} onClick={() => navigate(ROUTES.LEADERBOARD)} />
            <QuickCard icon={<AnalyticsIcon size={24}/>}
              label={t('nav.statistics', { defaultValue: 'Statistik' })}
              sub={t('home.quick_n_games', { defaultValue: `${totalGames} game`, count: totalGames })} onClick={() => navigate(ROUTES.STATISTICS)} />
            <QuickCard icon={<HexGearIcon size={24}/>}
              label={t('nav.settings', { defaultValue: 'Pengaturan' })}
              sub={t('home.quick_theme_lang', { defaultValue: 'Tema & Bahasa' })} onClick={() => navigate(ROUTES.SETTINGS)} />
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function StatPill({ icon, value, label }: {
  icon: React.ReactNode; value: string; label: string;
}): React.JSX.Element {
  return (
    <div className="stat-pill">
      <span className="stat-pill__icon">{icon}</span>
      <span className="stat-pill__val">{value}</span>
      <span className="stat-pill__lbl">{label}</span>
    </div>
  );
}

function QuickCard({ icon, label, sub, onClick }: {
  icon: React.ReactNode; label: string; sub: string; onClick: () => void;
}): React.JSX.Element {
  return (
    <motion.button whileTap={{ scale: 0.93 }} onClick={onClick} className="quick-card">
      <span className="quick-card__icon">{icon}</span>
      <span className="quick-card__lbl">{label}</span>
      <span className="quick-card__sub">{sub}</span>
    </motion.button>
  );
}

function DailyCard({ done, score, rank, onPlay }: {
  done:   boolean;
  score?: number;
  rank:   string | null;
  onPlay: () => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const rankColor = rank
    ? (RANK_COLORS as Record<string, string>)[rank] ?? '#888'
    : '#888';
  const rankLabel = rank ? t(`ranks.${rank}`, { defaultValue: rank }) : t('daily.done_label', { defaultValue: 'Selesai' });

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onPlay}
      className={`w-full text-left rounded-2xl p-4 border transition-all
        ${done
          ? 'bg-green-900/20 border-green-700/30'
          : 'bg-aura-950/50 border-aura-800/40 hover:border-aura-600/50'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center
            ${done ? 'bg-green-800/40' : 'bg-aura-800/40'}`}>
            {done
              ? <RankMedalIcon size={20} tier={(rank as any) ?? 'bronze'}/>
              : <CalendarIcon size={20} className="text-aura-300"/>}
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {t('nav.daily', { defaultValue: 'Tantangan Harian' })}
            </p>
            <p className="text-xs mt-0.5"
              style={{ color: done ? rankColor : 'rgba(255,255,255,0.4)' }}>
              {done
                ? `${score?.toLocaleString() ?? 0} pts · ${rankLabel}`
                : t('daily.next_available', { defaultValue: 'Tantangan baru tersedia setiap hari!' })}
            </p>
          </div>
        </div>
        <span className="text-white/30 text-xl">›</span>
      </div>
    </motion.button>
  );
}
