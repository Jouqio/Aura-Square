// ============================================================
// LeaderboardPage.tsx — V3 (local + online tabs, full i18n)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useMemo, useState, useEffect } from 'react';
import { motion }          from 'framer-motion';
import { useNavigate }     from 'react-router-dom';
import { useTranslation }  from 'react-i18next';
import { PageWrapper }     from '../../components/layout/PageWrapper/PageWrapper';
import { useStatsStore }   from '../../store/statsStore';
import { useGameStore, selectBestScore } from '../../store/gameStore';
import { useDailyStore, getTodayString } from '../../store/dailyStore';
import {
  isFirebaseReady,
} from '../../services/firebaseConfig';
import type { OnlineEntry } from '../../services/firestore.service';
import { ROUTES }          from '../../router/routes';
import { TrophyIcon, RankMedalIcon } from '../../components/ui/icons/GameIcons';
import { LockIcon, GlobeIcon }       from '../../components/ui/icons/MiscIcons';

const stagger = { show: { transition: { staggerChildren: 0.05 } } };
const row     = { hidden:{ opacity:0, x:-10 }, show:{ opacity:1, x:0 } };
type Tab      = 'personal' | 'daily_online' | 'alltime_online';

export default function LeaderboardPage(): React.JSX.Element {
  const { t, i18n }     = useTranslation();
  const [tab, setTab]   = useState<Tab>('personal');
  const navigate        = useNavigate();
  const history         = useStatsStore((s) => s.history);
  const bestScore       = useGameStore(selectBestScore);
  const today           = getTodayString();
  const todayCompletion = useDailyStore((s) => s.getCompletion(today));
  const firebaseReady   = isFirebaseReady();
  const dateLocale      = i18n.language === 'en' ? 'en-US' : 'id-ID';

  const [onlineEntries, setOnlineEntries]   = useState<OnlineEntry[]>([]);
  const [onlineLoading, setOnlineLoading]   = useState(false);
  const [onlineError,   setOnlineError]     = useState('');

  useEffect(() => {
    if (!firebaseReady) return;
    if (tab !== 'daily_online' && tab !== 'alltime_online') return;

    let cancelled = false;
    setOnlineLoading(true);
    setOnlineError('');

    // PERFORMANCE: firestore.service.ts (and the ~300KB Firebase
    // SDK chunk behind it) is only fetched here, the first time
    // the player actually opens an online tab — never on initial
    // page load, and never just from visiting the Personal tab.
    import('../../services/firestore.service')
      .then((mod) => tab === 'daily_online'
        ? mod.getDailyTopScores(today, 20)
        : mod.getAllTimeTopScores(20))
      .then((entries) => { if (!cancelled) setOnlineEntries(entries); })
      .catch(() => { if (!cancelled) setOnlineError(t('leaderboard.load_error', { defaultValue: 'Gagal memuat data online.' })); })
      .finally(() => { if (!cancelled) setOnlineLoading(false); });

    return () => { cancelled = true; };
  }, [tab, today, firebaseReady, t]);

  const personalTop = useMemo(() =>
    [...history].sort((a,b) => b.score - a.score).slice(0, 15),
    [history]);

  const TABS = [
    { id: 'personal',       label: t('leaderboard.tab_personal',     { defaultValue: 'Personal' })      },
    { id: 'daily_online',   label: t('leaderboard.tab_daily_online', { defaultValue: 'Harian Online' })  },
    { id: 'alltime_online', label: t('leaderboard.tab_global',       { defaultValue: 'Global' })         },
  ] as const;

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="flex flex-col gap-5">

        <motion.div variants={row}>
          <h1 className="text-xl font-bold text-white">
            {t('leaderboard.page_title', { defaultValue: 'Klasemen' })}
          </h1>
          <p className="text-xs text-white/40 mt-0.5">
            {firebaseReady
              ? t('leaderboard.subtitle_online',  { defaultValue: 'Online & skor personalmu' })
              : t('leaderboard.subtitle_offline', { defaultValue: 'Skor personalmu' })}
          </p>
        </motion.div>

        <motion.div variants={row}
          className="rounded-3xl bg-gradient-to-br from-aura-700 to-aura-900 p-5
            border border-aura-600/30 shadow-aura relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5"/>
          <p className="text-aura-300 text-xs font-semibold tracking-widest uppercase mb-1">
            {t('leaderboard.your_best', { defaultValue: 'Rekor Terbaikmu' })}
          </p>
          <p className="text-5xl font-black font-mono text-white">
            {bestScore > 0 ? bestScore.toLocaleString() : '—'}
          </p>
          {todayCompletion && (
            <p className="text-xs text-aura-300 mt-1">
              {t('leaderboard.daily_today', { defaultValue: 'Harian hari ini' })}: <strong>{todayCompletion.score.toLocaleString()}</strong>
              {todayCompletion.rank && (
                <span className="inline-flex items-center ml-1">
                  · <RankMedalIcon size={13} tier={todayCompletion.rank} className="ml-1"/>
                </span>
              )}
            </p>
          )}
        </motion.div>

        <motion.div variants={row}
          className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tabDef) => {
            const isOnlineTab = tabDef.id !== 'personal';
            const locked = isOnlineTab && !firebaseReady;
            return (
              <button key={tabDef.id}
                onClick={() => !locked && setTab(tabDef.id)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5
                  rounded-xl text-xs font-semibold transition-all
                  ${tab === tabDef.id
                    ? 'bg-aura-600 text-white'
                    : locked
                    ? 'bg-surface-300 border border-surface-400 text-white/20 cursor-not-allowed'
                    : 'bg-surface-300 border border-surface-400 text-white/50 hover:text-white/80'}`}
              >
                {isOnlineTab && (firebaseReady ? <GlobeIcon size={11}/> : <LockIcon size={11}/>)}
                {tabDef.label}
              </button>
            );
          })}
        </motion.div>

        <motion.div variants={row}>
          {tab === 'personal' ? (
            personalTop.length === 0 ? (
              <EmptyState onPlay={() => navigate(ROUTES.GAME)}/>
            ) : (
              <div className="flex flex-col gap-2">
                {personalTop.map((e, i) => {
                  const dur = Math.round(e.duration / 1000);
                  const ds  = dur > 60 ? `${Math.floor(dur/60)}m ${dur%60}s` : `${dur}s`;
                  const dt  = new Date(e.date).toLocaleDateString(dateLocale,
                    {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
                  return (
                    <BoardRow key={e.id} rank={i+1} score={e.score}
                      name={dt}
                      sub={t('leaderboard.row_sub', {
                        defaultValue: `${e.piecesPlaced} potongan · ${ds}`,
                        pieces: e.piecesPlaced, dur: ds,
                      })}/>
                  );
                })}
              </div>
            )
          ) : !firebaseReady ? (
            <FirebaseNotice/>
          ) : onlineLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-aura-600 border-t-transparent
                rounded-full animate-spin"/>
            </div>
          ) : onlineError ? (
            <div className="rounded-2xl bg-surface-200 border border-surface-400
              p-6 text-center text-sm text-white/50">{onlineError}</div>
          ) : onlineEntries.length === 0 ? (
            <div className="rounded-2xl bg-surface-200 border border-surface-400
              p-8 text-center">
              <p className="text-sm text-white/50">
                {t('leaderboard.no_online_score', { defaultValue: 'Belum ada skor online.' })}
                {tab === 'daily_online' && ` ${t('leaderboard.play_daily_hint', { defaultValue: 'Mainkan tantangan harian untuk tampil di sini!' })}`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {onlineEntries.map((e, i) => (
                <BoardRow key={e.uid} rank={i+1} score={e.score}
                  name={e.displayName} sub={e.date}/>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>
    </PageWrapper>
  );
}

function BoardRow({ rank, score, name, sub }: {
  rank:number; score:number; name:string; sub:string;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 border
      ${rank<=3 ? 'bg-aura-950/60 border-aura-800/40' : 'bg-surface-200 border-surface-400'}`}>
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        {rank <= 3
          ? <RankMedalIcon size={22} tier={rank===1?'gold':rank===2?'silver':'bronze'}/>
          : <span className="text-sm font-bold font-mono text-white/30">#{rank}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{name}</p>
        <p className="text-xs text-white/30">{sub}</p>
      </div>
      <span className={`font-mono font-bold text-lg flex-shrink-0
        ${rank===1?'text-yellow-400':rank===2?'text-gray-300':rank===3?'text-amber-600':'text-white'}`}>
        {score.toLocaleString()}
      </span>
    </div>
  );
}

function EmptyState({ onPlay }: { onPlay: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-surface-200 border border-surface-400
      p-10 flex flex-col items-center gap-3 text-center">
      <TrophyIcon size={40}/>
      <p className="text-sm font-semibold text-white">
        {t('leaderboard.no_score_yet', { defaultValue: 'Belum ada skor' })}
      </p>
      <button onClick={onPlay}
        className="px-5 py-2.5 rounded-xl bg-aura-600 text-white text-sm
          font-bold hover:bg-aura-500 transition-colors">
        ▶ {t('common.play_now', { defaultValue: 'Main Sekarang' })}
      </button>
    </div>
  );
}

function FirebaseNotice() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-surface-200 border border-surface-400 p-5
      flex items-start gap-3">
      <LockIcon size={22} className="text-aura-300"/>
      <div>
        <p className="text-sm font-semibold text-white">
          {t('leaderboard.firebase_required', { defaultValue: 'Membutuhkan Firebase' })}
        </p>
        <p className="text-xs text-white/40 mt-1 leading-relaxed">
          {t('leaderboard.firebase_desc', { defaultValue: 'Klasemen online membutuhkan konfigurasi Firebase yang valid di' })}{' '}
          <code className="font-mono bg-surface-300 px-1 rounded">.env.local</code>.
          {' '}{t('leaderboard.firebase_demo_note', { defaultValue: 'Saat ini menggunakan nilai demo.' })}
        </p>
      </div>
    </div>
  );
}
