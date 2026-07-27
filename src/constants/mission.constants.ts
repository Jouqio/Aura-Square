// ============================================================
// mission.constants.ts
// Aura Square — Daily Mission Board (Daily Challenge V2)
// Owner: Syauqi Nuzul Abdi
// ============================================================
// 3 missions are picked deterministically each day (seeded by
// date, like the daily piece sequence) so everyone sees the same
// missions on the same day. Progress is tracked cumulatively
// (play_games, clear_lines, place_pieces) or as a single-game
// peak (single_score, combo) throughout the day.

export type MissionType =
  | 'play_games' | 'single_score' | 'clear_lines' | 'combo' | 'place_pieces';

export interface MissionTemplate {
  id:        string;
  type:      MissionType;
  target:    number;
  xpReward:  number;
  label:     string;
}

export const MISSION_POOL: MissionTemplate[] = [
  { id: 'play_2',    type: 'play_games',  target: 2,   xpReward: 20, label: 'Main 2 game'              },
  { id: 'play_3',    type: 'play_games',  target: 3,   xpReward: 30, label: 'Main 3 game'               },
  { id: 'play_5',    type: 'play_games',  target: 5,   xpReward: 50, label: 'Main 5 game'               },
  { id: 'score_100', type: 'single_score',target: 100, xpReward: 25, label: 'Raih skor 100 dalam 1 game'},
  { id: 'score_200', type: 'single_score',target: 200, xpReward: 40, label: 'Raih skor 200 dalam 1 game'},
  { id: 'score_350', type: 'single_score',target: 350, xpReward: 60, label: 'Raih skor 350 dalam 1 game'},
  { id: 'lines_10',  type: 'clear_lines', target: 10,  xpReward: 20, label: 'Bersihkan 10 baris'        },
  { id: 'lines_20',  type: 'clear_lines', target: 20,  xpReward: 35, label: 'Bersihkan 20 baris'        },
  { id: 'lines_40',  type: 'clear_lines', target: 40,  xpReward: 55, label: 'Bersihkan 40 baris'        },
  { id: 'combo_2',   type: 'combo',       target: 2,   xpReward: 15, label: 'Raih combo Double'         },
  { id: 'combo_3',   type: 'combo',       target: 3,   xpReward: 30, label: 'Raih combo Triple'         },
  { id: 'combo_4',   type: 'combo',       target: 4,   xpReward: 50, label: 'Raih combo Quad'           },
  { id: 'pieces_30', type: 'place_pieces',target: 30,  xpReward: 20, label: 'Tempatkan 30 potongan'     },
  { id: 'pieces_60', type: 'place_pieces',target: 60,  xpReward: 35, label: 'Tempatkan 60 potongan'     },
  { id: 'pieces_100',type: 'place_pieces',target: 100, xpReward: 50, label: 'Tempatkan 100 potongan'    },
];

/** Bonus XP granted once all 3 of today's missions are completed. */
export const ALL_MISSIONS_BONUS_XP = 75;

/**
 * Picks 3 distinct missions deterministically for a given date,
 * so every player sees the same 3 missions on the same calendar
 * day (mirrors the daily piece-sequence seeding approach).
 */
export function pickDailyMissions(dateSeed: number): MissionTemplate[] {
  // Simple LCG-style deterministic shuffle seeded by the date.
  let seed = dateSeed % 2147483647;
  if (seed <= 0) seed += 2147483646;
  const next = (): number => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const pool = [...MISSION_POOL];
  // Fisher-Yates shuffle using the seeded RNG
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [pool[i], pool[j]] = [pool[j] as MissionTemplate, pool[i] as MissionTemplate];
  }

  // Ensure variety — prefer 3 missions of different types when possible
  const picked: MissionTemplate[] = [];
  const usedTypes = new Set<MissionType>();
  for (const m of pool) {
    if (picked.length >= 3) break;
    if (!usedTypes.has(m.type)) {
      picked.push(m);
      usedTypes.add(m.type);
    }
  }
  // Fallback: fill remaining slots from whatever's left, if the
  // variety pass didn't find 3 (shouldn't happen with 5 types).
  for (const m of pool) {
    if (picked.length >= 3) break;
    if (!picked.includes(m)) picked.push(m);
  }
  return picked;
}
