// ============================================================
// StatisticsPage.tsx — V3 Track B (Replayability & Engagement)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';
import { motion }           from 'framer-motion';
import { useTranslation }   from 'react-i18next';
import { PageWrapper }      from '../../components/layout/PageWrapper/PageWrapper';
import {
  useStatsStore, selectPlayStreak, selectBestPlayStreak, selectBestSessionStreak,
} from '../../store/statsStore';
import type { GameRecord }  from '../../store/statsStore';
import { ScoreTrendChart }  from '../../components/ui/ScoreTrendChart';
import { PieceMini }        from '../../components/game/PieceBoard/PieceMini';
import { PIECE_PRESETS }    from '../../engine/piecePresets';
import {
  TrophyIcon, AnalyticsIcon, StreakFlameIcon,
} from '../../components/ui/icons/GameIcons';
import { GamepadIcon } from '../../components/ui/icons/MiscIcons';

const item = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22 } },
};
const list = { show: { transition: { staggerChildren: 0.06 } } };

export default function StatisticsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const {
    bestScore, totalGames, totalLinesCleared,
    totalPiecesPlaced, history, clearHistory, averageScore, favoritePiece,
  } = useStatsStore();

  const playStreak        = useStatsStore(selectPlayStreak);
  const bestPlayStreak     = useStatsStore(selectBestPlayStreak);
  const bestSessionStreak  = useStatsStore(selectBestSessionStreak);

  const avg  = averageScore();
  const fav  = favoritePiece();

  const handleClear = () => {
    if (window.confirm(t('statistics.clear_confirm', { defaultValue: 'Hapus semua riwayat statistik?' }))) {
      clearHistory();
    }
  };

  return (
    <PageWrapper>
      <motion.div
        variants={list}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5"
      >
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-xl font-bold text-white">
            {t('statistics.page_title', { defaultValue: 'Statistik' })}
          </h1>
          <p className="text-xs text-white/40 mt-0.5">
            {t('statistics.games_recorded', { defaultValue: `${totalGames} permainan tercatat`, count: totalGames })}
          </p>
        </motion.div>

        {/* Top stat cards */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <BigStatCard icon={<TrophyIcon size={16}/>}    value={bestScore > 0 ? bestScore.toLocaleString() : '—'} label={t('statistics.best_record', { defaultValue: 'Rekor Terbaik' })} accent />
          <BigStatCard icon={<AnalyticsIcon size={16}/>} value={avg > 0 ? avg.toLocaleString() : '—'}             label={t('statistics.average', { defaultValue: 'Rata-rata' })} />
          <BigStatCard icon={<GamepadIcon size={16}/>}   value={String(totalGames)}                                label={t('statistics.total_game', { defaultValue: 'Total Game' })} />
          <BigStatCard icon={<AnalyticsIcon size={16}/>} value={String(totalLinesCleared)}                         label={t('statistics.lines_cleared', { defaultValue: 'Baris Dibersihkan' })} />
        </motion.div>

        {/* ── Score Trend Graph ────────────────────────────── */}
        <motion.div variants={item}>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">
            {t('statistics.score_trend', { defaultValue: 'Tren Skor (30 game terakhir)' })}
          </p>
          <div className="rounded-2xl bg-surface-200 border border-surface-400 p-3">
            <ScoreTrendChart history={history}/>
          </div>
        </motion.div>

        {/* ── Win Streak cards ─────────────────────────────── */}
        <motion.div variants={item}>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">
            {t('statistics.win_streak', { defaultValue: 'Win Streak' })}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <StreakCard value={playStreak} label={t('statistics.streak_days_label', { defaultValue: 'Hari Beruntun' })} highlight/>
            <StreakCard value={bestPlayStreak} label={t('statistics.streak_record', { defaultValue: 'Rekor Hari' })} />
            <StreakCard value={bestSessionStreak} label={t('statistics.streak_session', { defaultValue: 'Game Beruntun' })} />
          </div>
        </motion.div>

        {/* ── Favorite Piece ───────────────────────────────── */}
        {fav && (
          <motion.div variants={item}>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">
              {t('statistics.favorite_piece', { defaultValue: 'Piece Favorit' })}
            </p>
            <div className="rounded-2xl bg-surface-200 border border-surface-400 p-4
              flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-surface-300 border
                border-surface-400 flex items-center justify-center p-2 flex-shrink-0">
                <PieceMini pieceData={{ presetId: fav.presetId, tiles: PIECE_PRESETS[fav.presetId] ?? [[1]] }}/>
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {t('statistics.shape_label', { defaultValue: `Bentuk #${fav.presetId + 1}`, num: fav.presetId + 1 })}
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {t('statistics.placed_count', { defaultValue: `Ditempatkan ${fav.count.toLocaleString()} kali`, placedCount: fav.count.toLocaleString() })}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pieces placed */}
        <motion.div variants={item}>
          <div className="rounded-2xl bg-surface-200 border border-surface-400 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">{t('statistics.pieces_placed_total', { defaultValue: 'Total Potongan Diletakkan' })}</span>
              <span className="font-mono text-lg font-bold text-white">
                {totalPiecesPlaced.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Game history */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">
              {t('statistics.recent_history', { defaultValue: 'Riwayat Terakhir' })}
            </p>
            {history.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
              >
                {t('statistics.clear_all', { defaultValue: 'Hapus semua' })}
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="rounded-2xl bg-surface-200 border border-surface-400 p-10
              flex flex-col items-center justify-center gap-2">
              <GamepadIcon size={36} className="text-white/20"/>
              <p className="text-sm text-white/40">
                {t('profile.no_history', { defaultValue: 'Belum ada riwayat' })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.slice(0, 20).map((r) => (
                <HistoryRow key={r.id} record={r} />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
}

// ── Sub-components ────────────────────────────────────────────

function BigStatCard({
  icon, value, label, accent,
}: {
  icon: React.ReactNode; value: string; label: string; accent?: boolean;
}): React.JSX.Element {
  return (
    <div className={`rounded-2xl border p-4 ${
      accent
        ? 'bg-aura-950/60 border-aura-800/50'
        : 'bg-surface-200 border-surface-400'
    }`}>
      <div className={`mb-1 ${accent ? 'text-aura-300' : 'text-white/50'}`}>{icon}</div>
      <p className={`text-2xl font-bold font-mono ${accent ? 'text-aura-300' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
    </div>
  );
}

function StreakCard({ value, label, highlight }: {
  value: number; label: string; highlight?: boolean;
}): React.JSX.Element {
  return (
    <div className={`rounded-2xl border p-3 text-center
      ${highlight ? 'bg-orange-500/10 border-orange-500/25' : 'bg-surface-200 border-surface-400'}`}>
      <div className="flex justify-center mb-1">
        <StreakFlameIcon size={18} className={highlight ? '' : 'opacity-40'}/>
      </div>
      <p className={`text-lg font-bold font-mono ${highlight ? 'text-orange-300' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-[10px] text-white/35 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function HistoryRow({ record }: { record: GameRecord }): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const date = new Date(record.date);
  const dateStr = date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  const dur = Math.round(record.duration / 1000);
  const durStr = dur > 60
    ? `${Math.floor(dur / 60)}m ${dur % 60}s`
    : `${dur}s`;

  return (
    <div className="flex items-center justify-between gap-3
      rounded-xl bg-surface-200 border border-surface-400 px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-white/40">{dateStr}</span>
        <span className="text-xs text-white/30">
          {t('statistics.history_row', {
            defaultValue: `${record.piecesPlaced} potongan · ${record.linesCleared} baris · ${durStr}`,
            pieces: record.piecesPlaced, lines: record.linesCleared, dur: durStr,
          })}
        </span>
      </div>
      <span className="font-mono font-bold text-white text-base flex-shrink-0">
        {record.score.toLocaleString()}
      </span>
    </div>
  );
}
