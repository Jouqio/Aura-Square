// ============================================================
// achievement.constants.ts
// Aura Square Phase 4.0 — Achievement definitions
// Owner: Syauqi Nuzul Abdi
// ============================================================

import type { AchievementIconKey } from '../components/achievements/AchievementIcons';
import type { RankTier } from './rank.constants';

export type AchievementCategory =
  | 'score' | 'games' | 'lines' | 'combo' | 'special' | 'daily' | 'mastery';

export interface AchievementDef {
  id:          string;
  category:    AchievementCategory;
  icon:        AchievementIconKey;
  title:       string;
  description: string;
  points:      number;
  /** Return true when achievement should unlock */
  check:       (data: AchievementCheckData) => boolean;
}

export interface AchievementCheckData {
  bestScore:         number;
  totalGames:        number;
  totalLinesCleared: number;
  totalPiecesPlaced: number;
  maxComboEver:      number;     // highest combo in any single game
  longestSession:    number;     // longest session ms
  currentScore:      number;     // score of game just finished
  comboInLastGame:   number;     // max combo in the last game
  sessionDuration:   number;     // last game duration ms

  // V3: Daily/Mastery category signals
  dailyStreak:            number;    // current consecutive daily-challenge days
  bestDailyStreak:         number;    // best ever
  weeklyCompletionsCount:  number;    // total weekly challenges completed (lifetime)
  level:                   number;    // current player level (1-100)
  rankTier:                RankTier;  // current composite rank tier
}

// ── Achievement definitions ───────────────────────────────────

export const ACHIEVEMENTS: AchievementDef[] = [

  // ── 🎯 Score ──────────────────────────────────────────────
  {
    id: 'score_50',   category: 'score', icon: 'sprout',
    title: 'Awal Perjalanan',
    description: 'Capai skor 50 pertama kali',
    points: 10,
    check: (d) => d.bestScore >= 50,
  },
  {
    id: 'score_100',  category: 'score', icon: 'star',
    title: 'Seratus!',
    description: 'Capai skor 100',
    points: 20,
    check: (d) => d.bestScore >= 100,
  },
  {
    id: 'score_250',  category: 'score', icon: 'flame',
    title: 'Melesat',
    description: 'Capai skor 250',
    points: 30,
    check: (d) => d.bestScore >= 250,
  },
  {
    id: 'score_500',  category: 'score', icon: 'burst',
    title: 'Petarung',
    description: 'Capai skor 500',
    points: 50,
    check: (d) => d.bestScore >= 500,
  },
  {
    id: 'score_1000', category: 'score', icon: 'trophy',
    title: 'Juara',
    description: 'Capai skor 1.000',
    points: 100,
    check: (d) => d.bestScore >= 1000,
  },
  {
    id: 'score_2500', category: 'score', icon: 'crown',
    title: 'Legenda',
    description: 'Capai skor 2.500',
    points: 200,
    check: (d) => d.bestScore >= 2500,
  },
  {
    id: 'score_5000', category: 'score', icon: 'diamond',
    title: 'Tak Tertandingi',
    description: 'Capai skor 5.000',
    points: 500,
    check: (d) => d.bestScore >= 5000,
  },

  // ── 🎮 Games ──────────────────────────────────────────────
  {
    id: 'games_1',  category: 'games', icon: 'controller',
    title: 'Permainan Pertama',
    description: 'Selesaikan 1 permainan',
    points: 10,
    check: (d) => d.totalGames >= 1,
  },
  {
    id: 'games_5',  category: 'games', icon: 'target',
    title: 'Ketekunan',
    description: 'Mainkan 5 permainan',
    points: 20,
    check: (d) => d.totalGames >= 5,
  },
  {
    id: 'games_10', category: 'games', icon: 'swords',
    title: 'Pejuang',
    description: 'Mainkan 10 permainan',
    points: 40,
    check: (d) => d.totalGames >= 10,
  },
  {
    id: 'games_25', category: 'games', icon: 'shield',
    title: 'Veteran',
    description: 'Mainkan 25 permainan',
    points: 80,
    check: (d) => d.totalGames >= 25,
  },
  {
    id: 'games_50', category: 'games', icon: 'starburst',
    title: 'Master',
    description: 'Mainkan 50 permainan',
    points: 150,
    check: (d) => d.totalGames >= 50,
  },

  // ── ✨ Lines ──────────────────────────────────────────────
  {
    id: 'lines_10',  category: 'lines', icon: 'broom',
    title: 'Bersih-bersih',
    description: 'Bersihkan 10 baris',
    points: 15,
    check: (d) => d.totalLinesCleared >= 10,
  },
  {
    id: 'lines_50',  category: 'lines', icon: 'wave',
    title: 'Sapu Bersih',
    description: 'Bersihkan 50 baris',
    points: 35,
    check: (d) => d.totalLinesCleared >= 50,
  },
  {
    id: 'lines_100', category: 'lines', icon: 'bolt',
    title: 'Pembasmi',
    description: 'Bersihkan 100 baris',
    points: 70,
    check: (d) => d.totalLinesCleared >= 100,
  },
  {
    id: 'lines_250', category: 'lines', icon: 'tornado',
    title: 'Penghancur',
    description: 'Bersihkan 250 baris',
    points: 150,
    check: (d) => d.totalLinesCleared >= 250,
  },

  // ── ⚡ Combo ──────────────────────────────────────────────
  {
    id: 'combo_double', category: 'combo', icon: 'combo2',
    title: 'Dobel!',
    description: 'Bersihkan 2 baris sekaligus',
    points: 25,
    check: (d) => d.maxComboEver >= 2,
  },
  {
    id: 'combo_triple', category: 'combo', icon: 'combo3',
    title: 'Triple!',
    description: 'Bersihkan 3 baris sekaligus',
    points: 60,
    check: (d) => d.maxComboEver >= 3,
  },
  {
    id: 'combo_quad',   category: 'combo', icon: 'combo4',
    title: 'Quad!',
    description: 'Bersihkan 4 baris sekaligus',
    points: 150,
    check: (d) => d.maxComboEver >= 4,
  },

  // ── 🏅 Special ────────────────────────────────────────────
  {
    id: 'pieces_100',  category: 'special', icon: 'puzzle',
    title: 'Penempatan Presisi',
    description: 'Letakkan 100 potongan',
    points: 20,
    check: (d) => d.totalPiecesPlaced >= 100,
  },
  {
    id: 'pieces_500',  category: 'special', icon: 'wrench',
    title: 'Rajin',
    description: 'Letakkan 500 potongan',
    points: 60,
    check: (d) => d.totalPiecesPlaced >= 500,
  },
  {
    id: 'pieces_1000', category: 'special', icon: 'tower',
    title: 'Pekerja Keras',
    description: 'Letakkan 1.000 potongan',
    points: 120,
    check: (d) => d.totalPiecesPlaced >= 1000,
  },
  {
    id: 'session_3min', category: 'special', icon: 'timer',
    title: 'Sesi Panjang',
    description: 'Bermain lebih dari 3 menit dalam satu sesi',
    points: 30,
    check: (d) => d.longestSession >= 3 * 60 * 1000,
  },
  {
    id: 'session_5min', category: 'special', icon: 'clock',
    title: 'Maraton',
    description: 'Bermain lebih dari 5 menit dalam satu sesi',
    points: 75,
    check: (d) => d.longestSession >= 5 * 60 * 1000,
  },

  // ── 📅 Daily ──────────────────────────────────────────────
  {
    id: 'daily_first', category: 'daily', icon: 'calendar',
    title: 'Tantangan Pertama',
    description: 'Selesaikan 1 Tantangan Harian',
    points: 15,
    check: (d) => d.dailyStreak >= 1 || d.bestDailyStreak >= 1,
  },
  {
    id: 'daily_streak_3', category: 'daily', icon: 'calendar',
    title: 'Konsisten',
    description: 'Raih streak harian 3 hari berturut-turut',
    points: 35,
    check: (d) => d.bestDailyStreak >= 3,
  },
  {
    id: 'daily_streak_7', category: 'daily', icon: 'medal',
    title: 'Pejuang Mingguan',
    description: 'Raih streak harian 7 hari berturut-turut',
    points: 70,
    check: (d) => d.bestDailyStreak >= 7,
  },
  {
    id: 'weekly_first', category: 'daily', icon: 'medal',
    title: 'Penakluk Mingguan',
    description: 'Selesaikan 1 Tantangan Mingguan',
    points: 50,
    check: (d) => d.weeklyCompletionsCount >= 1,
  },

  // ── ⭐ Mastery ────────────────────────────────────────────
  {
    id: 'level_10', category: 'mastery', icon: 'gem',
    title: 'Naik Level',
    description: 'Capai Level 10',
    points: 40,
    check: (d) => d.level >= 10,
  },
  {
    id: 'level_50', category: 'mastery', icon: 'gem',
    title: 'Setengah Jalan',
    description: 'Capai Level 50',
    points: 120,
    check: (d) => d.level >= 50,
  },
  {
    id: 'level_100', category: 'mastery', icon: 'gem',
    title: 'Maksimal',
    description: 'Capai Level 100 — level tertinggi',
    points: 300,
    check: (d) => d.level >= 100,
  },
  {
    id: 'rank_grandmaster', category: 'mastery', icon: 'levelup',
    title: 'Grandmaster',
    description: 'Capai rank Grandmaster — pencapaian tersulit',
    points: 400,
    check: (d) => d.rankTier === 'grandmaster',
  },
];

export const TOTAL_ACHIEVEMENT_POINTS = ACHIEVEMENTS.reduce(
  (sum, a) => sum + a.points, 0,
);

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  score:   'Skor',
  games:   'Permainan',
  lines:   'Baris',
  combo:   'Combo',
  special: 'Spesial',
  daily:   'Harian',
  mastery: 'Mastery',
};
