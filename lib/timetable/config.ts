// lib/timetable/config.ts
//
// Multiplication-tables (สูตรคูณ) practice config. This mode is a pure
// drill: questions are generated at runtime (not stored as curriculum data),
// the focus is repetition until recall is automatic. EXP is awarded but lower
// than the lesson/quiz modes since each round is short and repeatable.

// Teaching order, easy → hard (not numeric order). Front-loads the tables kids
// anchor on (2, 5, 10), then the "doubling" ones, then the genuinely hard
// middle tables. 11 & 12 close it out (UK-style).
export const TABLE_ORDER = [2, 5, 10, 4, 3, 6, 7, 8, 9, 11, 12] as const;

// Each multiplicand runs 1..12 (so "6 × 12" shows up too).
export const MULTIPLICAND_MAX = 12;
export const MULTIPLICAND_MIN = 1;

// Questions per round.
export const QUESTIONS_PER_ROUND = 20;

// EXP per round cleared (any pass). Deliberately small vs. lessons (which pay
// 50/star) — timetable is meant to be ground out many times.
export const EXP_PER_ROUND = 10;
export const EXP_PER_PERFECT_BONUS = 5; // extra when all 20 correct
export const SCORE_PER_ROUND = 2;

// Pass threshold (ratio of correct answers) to count a round as cleared.
export const PASSING_RATIO = 0.7;

// The 12 rounds per table, in order. `mode` drives how the generator builds
// each round's questions:
//   - 'direct'  : table × N         (table on the left)
//   - 'swapped' : table × N and N × table mixed (commutativity)
//   - 'mixed'   : this table swapped + a sprinkle of already-learned tables
//   - 'all'     : everything — this table both ways + review tables
export type RoundMode = 'direct' | 'swapped' | 'mixed' | 'all';

export interface RoundDef {
  // 1-based round number within the table.
  round: number;
  mode: RoundMode;
  // Short Thai/EN label for the round list UI.
  thaiLabel: string;
  enLabel: string;
}

export const ROUNDS: RoundDef[] = [
  { round: 1, mode: 'direct', thaiLabel: 'ตรงๆ รอบ 1', enLabel: 'Straight 1' },
  { round: 2, mode: 'direct', thaiLabel: 'ตรงๆ รอบ 2', enLabel: 'Straight 2' },
  { round: 3, mode: 'direct', thaiLabel: 'ตรงๆ รอบ 3', enLabel: 'Straight 3' },
  { round: 4, mode: 'direct', thaiLabel: 'ตรงๆ รอบ 4', enLabel: 'Straight 4' },
  { round: 5, mode: 'swapped', thaiLabel: 'สลับตำแหน่ง รอบ 1', enLabel: 'Swapped 1' },
  { round: 6, mode: 'swapped', thaiLabel: 'สลับตำแหน่ง รอบ 2', enLabel: 'Swapped 2' },
  { round: 7, mode: 'mixed', thaiLabel: 'ปนแม่เก่า รอบ 1', enLabel: 'Mixed review 1' },
  { round: 8, mode: 'mixed', thaiLabel: 'ปนแม่เก่า รอบ 2', enLabel: 'Mixed review 2' },
  { round: 9, mode: 'mixed', thaiLabel: 'ปนแม่เก่า รอบ 3', enLabel: 'Mixed review 3' },
  { round: 10, mode: 'all', thaiLabel: 'รวมทุกแบบ รอบ 1', enLabel: 'All-in 1' },
  { round: 11, mode: 'all', thaiLabel: 'รวมทุกแบบ รอบ 2', enLabel: 'All-in 2' },
  { round: 12, mode: 'all', thaiLabel: 'รวมทุกแบบ รอบ 3', enLabel: 'All-in 3' },
];

export const ROUNDS_PER_TABLE = ROUNDS.length;

// Tables learned BEFORE the given table (used by 'mixed'/'all' rounds to fold
// in earlier tables for spaced review).
export function tablesLearnedBefore(table: number): number[] {
  const idx = TABLE_ORDER.indexOf(table as (typeof TABLE_ORDER)[number]);
  if (idx <= 0) return [];
  return TABLE_ORDER.slice(0, idx) as unknown as number[];
}
