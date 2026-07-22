// lib/timetable/config.ts
//
// Multiplication-tables (สูตรคูณ) practice config. This mode is a pure
// drill: questions are generated at runtime (not stored as curriculum data),
// the focus is repetition until recall is automatic. EXP is awarded but lower
// than the lesson/quiz modes since each round is short and repeatable.
//
// Progression model (v2 — "สะสมดาว"): each table has 9 rounds grouped into
// 3 stages of 3. Completing a stage earns the table a star (⭐/⭐⭐/⭐⭐⭐).
// The NEXT table unlocks as soon as the previous table has its FIRST star —
// so kids move forward after ~3 short rounds instead of grinding a whole
// table to 100% first. Stages 2–3 stay available for mastery at any time,
// which spreads review across tables (interleaving) instead of blocking it.

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
// เล่นซ้ำรอบที่เคยผ่านแล้วยังได้เหรียญเล็กน้อย (ฝึกซ้ำไม่ฟรีเปล่า แต่ไม่คุ้มไว้ปั๊ม)
export const EXP_PER_REPLAY = 3;

// Mix challenge (ด่านรวมพลัง): draws from every unlocked table, replayable
// forever, but pays EXP only once per calendar day.
export const EXP_MIX_DAILY = 15;
export const SCORE_MIX_DAILY = 3;

// Pass threshold (ratio of correct answers) to count a round as cleared.
export const PASSING_RATIO = 0.7;

// `mode` drives how the generator builds each round's questions:
//   - 'direct'  : table × N         (table on the left)
//   - 'swapped' : table × N and N × table mixed (commutativity)
//   - 'mixed'   : this table swapped + a sprinkle of already-learned tables
//   - 'all'     : everything — this table both ways + review tables
export type RoundMode = 'direct' | 'swapped' | 'mixed' | 'all';

export interface RoundDef {
  // 1-based round number within the table. Round ids (tt-{table}-r{n}) are
  // persisted in completedLessonIds — keep numbering stable across redesigns
  // so old clears keep their credit.
  round: number;
  mode: RoundMode;
  // Short Thai/EN label for the round list UI.
  thaiLabel: string;
  enLabel: string;
}

// A stage = 3 rounds; finishing all 3 earns the table one star.
export interface StageDef {
  stage: number; // 1-based
  thaiTitle: string;
  enTitle: string;
  // What this stage trains — shown as helper text under the stage header.
  thaiHint: string;
  enHint: string;
  rounds: RoundDef[];
}

export const STAGES: StageDef[] = [
  {
    stage: 1,
    thaiTitle: 'ฝึกจำ',
    enTitle: 'Learn',
    thaiHint: 'ท่องแม่นี้ให้คล่อง — จบระดับนี้แล้วแม่ถัดไปจะปลดล็อกเลย!',
    enHint: 'Get fluent in this table — finish this level and the next table unlocks!',
    rounds: [
      { round: 1, mode: 'direct', thaiLabel: 'ท่องตรง 1', enLabel: 'Straight 1' },
      { round: 2, mode: 'direct', thaiLabel: 'ท่องตรง 2', enLabel: 'Straight 2' },
      { round: 3, mode: 'swapped', thaiLabel: 'สลับตำแหน่ง', enLabel: 'Swapped' },
    ],
  },
  {
    stage: 2,
    thaiTitle: 'ปนแม่เก่า',
    enTitle: 'Review mix',
    thaiHint: 'แม่นี้สลับกับแม่ที่เคยเรียน — ทบทวนไปด้วยในตัว',
    enHint: 'This table mixed with earlier ones — built-in review',
    rounds: [
      { round: 4, mode: 'mixed', thaiLabel: 'ปนแม่เก่า 1', enLabel: 'Mixed 1' },
      { round: 5, mode: 'mixed', thaiLabel: 'ปนแม่เก่า 2', enLabel: 'Mixed 2' },
      { round: 6, mode: 'mixed', thaiLabel: 'ปนแม่เก่า 3', enLabel: 'Mixed 3' },
    ],
  },
  {
    stage: 3,
    thaiTitle: 'มาสเตอร์',
    enTitle: 'Master',
    thaiHint: 'รวมทุกแบบ — เก็บดาวดวงสุดท้ายให้แม่นี้',
    enHint: "Everything at once — earn this table's final star",
    rounds: [
      { round: 7, mode: 'all', thaiLabel: 'รวมทุกแบบ 1', enLabel: 'All-in 1' },
      { round: 8, mode: 'all', thaiLabel: 'รวมทุกแบบ 2', enLabel: 'All-in 2' },
      { round: 9, mode: 'all', thaiLabel: 'รวมทุกแบบ 3', enLabel: 'All-in 3' },
    ],
  },
];

export const STAGES_PER_TABLE = STAGES.length;

// Flat round list (kept for the round player / route validation).
export const ROUNDS: RoundDef[] = STAGES.flatMap((s) => s.rounds);

export const ROUNDS_PER_TABLE = ROUNDS.length;

// Which stage a round number belongs to (1-based; defaults to 1).
export const stageOfRound = (round: number): StageDef =>
  STAGES.find((s) => s.rounds.some((r) => r.round === round)) ?? STAGES[0];

// Tables learned BEFORE the given table (used by 'mixed'/'all' rounds to fold
// in earlier tables for spaced review).
export function tablesLearnedBefore(table: number): number[] {
  const idx = TABLE_ORDER.indexOf(table as (typeof TABLE_ORDER)[number]);
  if (idx <= 0) return [];
  return TABLE_ORDER.slice(0, idx) as unknown as number[];
}
