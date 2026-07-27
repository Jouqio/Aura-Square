// ============================================================
// DailyPage.tsx — V3 (Daily Challenge + Mission Board + Weekly, full i18n)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate }  from 'react-router-dom';
import { motion }       from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PageWrapper }  from '../../components/layout/PageWrapper/PageWrapper';
import {
  useDailyStore,
  getTodayString,
  getSeedForDate,
  RANK_THRESHOLDS,
  RANK_COLORS,
  type DailyRank,
} from '../../store/dailyStore';
import { ROUTES }       from '../../router/routes';
import {
  StreakFlameIcon, RankMedalIcon, CalendarIcon,
} from '../../components/ui/icons/GameIcons';
import { useMissionStore, selectMissions, selectAllBonusClaimed } from '../../store/missionStore';
import { ChestIcon } from '../../components/ui/icons/BadgeIcons';
import { CheckIcon } from '../../components/ui/icons/MiscIcons';
import {
  useWeeklyStore, getWeekString, getSeedForWeek, msUntilNextWeek,
  WEEKLY_THRESHOLDS, WEEKLY_COLORS, type WeeklyRank,
} from '../../store/weeklyStore';

const stagger = { show: { transition: { staggerChildren: 0.08 } } };
const item    = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function DailyPage(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const navigate   = useNavigate();
  const today      = getTodayString();
  const seed       = getSeedForDate(today);
  const streak     = useDailyStore((s) => s.getStreak());
  const completion = useDailyStore((s) => s.getCompletion(today));
  const history    = useDailyStore((s) => s.completions);
  const dateLocale  = i18n.language === 'en' ? 'en-US' : 'id-ID';

  const rankLabel = (tier: string) => t(`ranks.${tier}`, { defaultValue: tier });
  const missionLabel = (id: string, fallback: string) =>
    t(`missions.${id}`, { defaultValue: fallback });

  const missions          = useMissionStore(selectMissions);
  const allBonusClaimed   = useMissionStore(selectAllBonusClaimed);
  const ensureTodayMissions = useMissionStore((s) => s.ensureToday);
  useEffect(() => { ensureTodayMissions(); }, [ensureTodayMissions]);
  const allMissionsDone   = missions.length > 0 && missions.every((m) => m.completed);

  // ── Weekly Challenge ──────────────────────────────────────
  const thisWeek          = getWeekString();
  const weeklySeed        = getSeedForWeek(thisWeek);
  const weeklyCompletion  = useWeeklyStore((s) => s.getCompletion(thisWeek));

  const [weeklyCountdown, setWeeklyCountdown] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = msUntilNextWeek();
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const unit = i18n.language === 'en' ? `${d}d ${h}h` : `${d} hari ${h} jam`;
      setWeeklyCountdown(unit);
    };
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, [i18n.language]);

  const handlePlayWeekly = useCallback(() => {
    navigate(`${ROUTES.GAME}?mode=weekly&seed=${weeklySeed}&week=${thisWeek}`);
  }, [navigate, weeklySeed, thisWeek]);

  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    const tick = () => {
      const now      = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff  = tomorrow.getTime() - now.getTime();
      const h     = Math.floor(diff / 3_600_000);
      const m     = Math.floor((diff % 3_600_000) / 60_000);
      const s     = Math.floor((diff % 60_000) / 1_000);
      setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const timer = setInterval(tick, 1_000);
    return () => clearInterval(timer);
  }, []);

  const handlePlay = useCallback(() => {
    navigate(`${ROUTES.GAME}?mode=daily&seed=${seed}&date=${today}`);
  }, [navigate, seed, today]);

  const dateLabel = new Date(today).toLocaleDateString(dateLocale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const past7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reverse();

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="flex flex-col gap-5">

        <motion.div variants={item}>
          <h1 className="text-xl font-bold text-white">
            {t('nav.daily', { defaultValue: 'Tantangan Harian' })}
          </h1>
          <p className="text-xs text-white/40 mt-0.5 capitalize">{dateLabel}</p>
        </motion.div>

        {streak > 0 && (
          <motion.div variants={item}
            className="flex items-center gap-3 rounded-2xl px-4 py-3
              bg-orange-500/10 border border-orange-500/25">
            <StreakFlameIcon size={26}/>
            <div>
              <p className="text-sm font-bold text-white">
                {t('daily.streak_days', { defaultValue: `${streak} Hari Berturut-turut!`, count: streak })}
              </p>
              <p className="text-xs text-white/40">
                {t('daily.streak_keep', { defaultValue: 'Jaga streak kamu setiap hari' })}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div variants={item}>
          {completion ? (
            <CompletedCard
              score={completion.score}
              rank={completion.rank}
              countdown={countdown}
              onViewLeaderboard={() => navigate(ROUTES.LEADERBOARD)}
            />
          ) : (
            <ChallengeCard onPlay={handlePlay} countdown={countdown}/>
          )}
        </motion.div>

        {/* ── Daily Mission Board (Daily Challenge V2) ────── */}
        <motion.div variants={item} className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">
              {t('missions.section_title', { defaultValue: 'Misi Harian' })}
            </p>
            <span className="text-xs font-mono text-white/30">
              {missions.filter((m) => m.completed).length}/{missions.length}
            </span>
          </div>

          {missions.map((m) => (
            <div key={m.id} className={`mission-card ${m.completed ? 'mission-card--done' : ''}`}>
              <div className="mission-card__check">
                {m.completed
                  ? <CheckIcon size={16} className="text-green-400"/>
                  : <span className="text-xs font-mono text-white/40">
                      {Math.min(m.current, m.target)}/{m.target}
                    </span>}
              </div>
              <div className="mission-card__body">
                <p className="mission-card__label">{missionLabel(m.id, m.label)}</p>
                <div className="mission-card__bar-track">
                  <motion.div className="mission-card__bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.round((m.current / m.target) * 100))}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}/>
                </div>
              </div>
              <span className="mission-card__xp">+{m.xpReward} XP</span>
            </div>
          ))}

          {allMissionsDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mission-bonus-banner"
            >
              <ChestIcon size={28} open/>
              <div>
                <p className="text-sm font-bold text-white">
                  {t('missions.all_done_title', { defaultValue: 'Semua misi selesai!' })}
                </p>
                <p className="text-xs text-white/40">
                  {allBonusClaimed
                    ? t('missions.all_done_claimed', { defaultValue: 'Bonus peti +75 XP sudah didapat hari ini' })
                    : t('missions.all_done_pending', { defaultValue: 'Bonus peti akan masuk otomatis' })}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Weekly Challenge ─────────────────────────────── */}
        <motion.div variants={item}>
          <p className="text-xs font-semibold text-white/30 uppercase
            tracking-widest px-1 mb-3">
            {t('weekly.section_title', { defaultValue: 'Tantangan Mingguan' })}
          </p>

          {weeklyCompletion ? (
            <div className="rounded-3xl bg-surface-200 border border-surface-400 p-5">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${weeklyCompletion.rank ? WEEKLY_COLORS[weeklyCompletion.rank] : '#888'}22`,
                    border: `1px solid ${weeklyCompletion.rank ? WEEKLY_COLORS[weeklyCompletion.rank] : '#888'}44`,
                  }}>
                  {weeklyCompletion.rank
                    ? <RankMedalIcon size={28} tier={weeklyCompletion.rank}/>
                    : <CheckIcon size={22} className="text-white"/>}
                </div>
                <p className="text-2xl font-black font-mono text-white">
                  {weeklyCompletion.score.toLocaleString()}
                </p>
                <p className="text-xs text-white/40">
                  {t('weekly.completed_this_week', {
                    defaultValue: `Minggu ini selesai · ${weeklyCountdown} lagi`,
                    time: weeklyCountdown,
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-gradient-to-br from-amber-700/30 to-aura-900
              border border-amber-600/30 p-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5"/>
              <p className="text-amber-300 text-xs font-semibold tracking-widest uppercase mb-2">
                {t('weekly.bigger_reward', { defaultValue: 'Reward Lebih Besar' })}
              </p>
              <p className="text-white text-lg font-bold mb-1">
                {t('weekly.one_chance', { defaultValue: 'Satu kesempatan, berlaku seminggu' })}
              </p>
              <p className="text-white/40 text-sm mb-5">
                {t('weekly.desc', { defaultValue: 'Berganti setiap Senin. Skor lebih tinggi, XP jauh lebih besar dari harian.' })}
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
                onClick={handlePlayWeekly}
                className="w-full py-3.5 rounded-2xl bg-white/15 border border-white/20
                  text-white font-bold text-base hover:bg-white/25 transition-colors
                  relative z-10 flex items-center justify-center gap-2">
                <CalendarIcon size={17}/> {t('weekly.cta', { defaultValue: 'Mulai Tantangan Mingguan' })}
              </motion.button>
              <p className="text-center text-xs text-white/30 mt-3">
                {t('daily.changes_in', { defaultValue: `Berganti dalam ${weeklyCountdown}`, time: weeklyCountdown })}
              </p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 mt-3">
            {(['bronze','silver','gold','platinum'] as WeeklyRank[]).map((r) => (
              <div key={r} className="rounded-xl bg-surface-200 border
                border-surface-400 p-2 text-center">
                <div className="flex justify-center mb-1">
                  <RankMedalIcon size={18} tier={r}/>
                </div>
                <p className="text-[10px] font-bold" style={{ color: WEEKLY_COLORS[r] }}>
                  {rankLabel(r)}
                </p>
                <p className="text-xs font-mono font-bold text-white">
                  {WEEKLY_THRESHOLDS[r]}+
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <p className="text-xs font-semibold text-white/30 uppercase
            tracking-widest px-1 mb-3">
            {t('daily.target_score', { defaultValue: 'Target Skor' })}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(['bronze','silver','gold'] as DailyRank[]).map((r) => (
              <div key={r} className="rounded-2xl bg-surface-200 border
                border-surface-400 p-3 text-center">
                <div className="flex justify-center mb-1">
                  <RankMedalIcon size={26} tier={r}/>
                </div>
                <p className="text-xs font-bold"
                  style={{color: RANK_COLORS[r]}}>
                  {rankLabel(r)}
                </p>
                <p className="text-sm font-mono font-bold text-white mt-0.5">
                  {RANK_THRESHOLDS[r]}+
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <p className="text-xs font-semibold text-white/30 uppercase
            tracking-widest px-1 mb-3">
            {t('daily.last_7_days', { defaultValue: '7 Hari Terakhir' })}
          </p>
          <div className="flex gap-2 justify-between">
            {past7.map((d) => {
              const c   = history[d];
              const isToday = d === today;
              return (
                <div key={d} className={`flex-1 flex flex-col items-center gap-1.5
                  rounded-xl py-2.5 border transition-colors
                  ${isToday
                    ? 'bg-aura-900/60 border-aura-700/40'
                    : 'bg-surface-200 border-surface-400'}`}>
                  <span className="flex items-center justify-center h-4">
                    {c
                      ? (c.rank
                          ? <RankMedalIcon size={16} tier={c.rank}/>
                          : <span className="text-white/60 text-xs">✓</span>)
                      : isToday
                        ? <CalendarIcon size={14} className="text-aura-300"/>
                        : <span className="text-white/15 text-xs">○</span>}
                  </span>
                  <span className="text-[9px] text-white/30">
                    {new Date(d).toLocaleDateString(dateLocale,{weekday:'short'}).slice(0,3)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

      </motion.div>
    </PageWrapper>
  );
}

function ChallengeCard({
  onPlay, countdown,
}: { onPlay: () => void; countdown: string }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="rounded-3xl bg-gradient-to-br from-aura-700 to-aura-900
      border border-aura-600/30 p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5"/>
      <p className="text-aura-300 text-xs font-semibold tracking-widest uppercase mb-2">
        {t('daily.challenge_today', { defaultValue: 'Tantangan Hari Ini' })}
      </p>
      <p className="text-white text-lg font-bold mb-1">
        {t('daily.same_pieces', { defaultValue: 'Potongan yang sama untuk semua pemain!' })}
      </p>
      <p className="text-white/40 text-sm mb-5">
        {t('daily.unique_sequence', { defaultValue: 'Setiap hari punya urutan potongan unik. Tunjukkan kemampuanmu!' })}
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
        onClick={onPlay}
        className="w-full py-3.5 rounded-2xl bg-white/15 border border-white/20
          text-white font-bold text-base hover:bg-white/25 transition-colors
          relative z-10">
        <span className="inline-flex items-center gap-2">
          <CalendarIcon size={17}/> {t('daily.start_challenge', { defaultValue: 'Mulai Tantangan' })}
        </span>
      </motion.button>
      <p className="text-center text-xs text-white/30 mt-3">
        {t('daily.changes_in', { defaultValue: `Berganti dalam ${countdown}`, time: countdown })}
      </p>
    </div>
  );
}

function CompletedCard({
  score, rank, countdown, onViewLeaderboard,
}: {
  score:              number;
  rank:               DailyRank | null;
  countdown:          string;
  onViewLeaderboard:  () => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const rankColor = rank ? RANK_COLORS[rank] : '#888';
  const rankLabelText = rank
    ? t(`ranks.${rank}`, { defaultValue: rank })
    : t('daily.done_label', { defaultValue: 'Selesai' });
  return (
    <div className="rounded-3xl bg-surface-200 border border-surface-400 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: `${rankColor}22`, border: `1px solid ${rankColor}44` }}>
          {rank
            ? <RankMedalIcon size={32} tier={rank}/>
            : <span className="text-white text-2xl">✓</span>}
        </motion.div>
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: rankColor }}>{rankLabelText}</p>
          <p className="text-4xl font-black font-mono text-white mt-1">
            {score.toLocaleString()}
          </p>
          <p className="text-xs text-white/40 mt-1">
            {t('daily.challenge_done_today', { defaultValue: 'Tantangan hari ini selesai!' })}
          </p>
        </div>
        <button
          onClick={onViewLeaderboard}
          className="px-5 py-2 rounded-xl bg-aura-700/40 border border-aura-600/30
            text-aura-300 text-sm font-semibold hover:bg-aura-700/60 transition-colors">
          {t('daily.view_leaderboard', { defaultValue: 'Lihat Klasemen →' })}
        </button>
        <p className="text-xs text-white/25">
          {t('daily.next_in', { defaultValue: `Tantangan berikutnya dalam ${countdown}`, time: countdown })}
        </p>
      </div>
    </div>
  );
}
