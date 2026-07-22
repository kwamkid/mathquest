// lib/timetable/progress.ts
//
// Progress + reward persistence for the สูตรคูณ drill. We piggy-back on the
// existing `curriculumProgress` map under a synthetic curriculum id so the
// data lives next to the other learning progress, but timetable has its own
// (much simpler) rules: a "round" is cleared when passed, stored as an id in
// completedLessonIds. EXP/score are paid once per round (no double-pay on
// replays), at a lower rate than lessons.
//
// Unlock rules (v2): a table's stages unlock in order (stage N needs stage
// N-1 done), rounds inside an unlocked stage are freely playable in any
// order, and the NEXT table needs only stage 1 (⭐) of the previous table —
// not the whole thing. Ids written under the old 12-round scheme stay in
// completedLessonIds; rounds 1–9 keep their credit, 10–12 are ignored.

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { User } from '@/types';
import type { CurriculumProgress } from '@/types/curriculum';
import {
  EXP_MIX_DAILY,
  EXP_PER_PERFECT_BONUS,
  EXP_PER_REPLAY,
  EXP_PER_ROUND,
  ROUNDS_PER_TABLE,
  SCORE_MIX_DAILY,
  SCORE_PER_ROUND,
  STAGES,
  STAGES_PER_TABLE,
  TABLE_ORDER,
} from './config';

export const TIMETABLE_CURRICULUM_ID = 'timetable';

// Stable id for a (table, round) round.
export const roundId = (table: number, round: number) => `tt-${table}-r${round}`;

// One id per calendar day for the mix challenge (EXP paid once a day).
export const mixDayId = (date: Date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `tt-mix-${y}${m}${d}`;
};

const emptyProgress = (): CurriculumProgress => ({
  curriculumId: TIMETABLE_CURRICULUM_ID,
  startedAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
  completedLessonIds: [],
  unlockedSubTopicIds: [],
  lessonScores: {},
  subTopicScores: {},
  mistakePatterns: [],
  totalMinutesSpent: 0,
  totalStarsEarned: 0,
});

// Read the timetable slice off a (already-loaded) user object.
export const getTimetableProgress = (
  user: User | null,
): CurriculumProgress | undefined =>
  user?.curriculumProgress?.[TIMETABLE_CURRICULUM_ID];

export const isRoundCleared = (
  progress: CurriculumProgress | undefined,
  table: number,
  round: number,
): boolean => !!progress?.completedLessonIds.includes(roundId(table, round));

// How many rounds of a table are cleared (0..ROUNDS_PER_TABLE).
export const tableRoundsCleared = (
  progress: CurriculumProgress | undefined,
  table: number,
): number => {
  if (!progress) return 0;
  let n = 0;
  for (let r = 1; r <= ROUNDS_PER_TABLE; r++) {
    if (progress.completedLessonIds.includes(roundId(table, r))) n++;
  }
  return n;
};

// A stage is complete when every round in it is cleared.
export const isStageComplete = (
  progress: CurriculumProgress | undefined,
  table: number,
  stage: number,
): boolean => {
  const def = STAGES.find((s) => s.stage === stage);
  if (!def) return false;
  return def.rounds.every((r) => isRoundCleared(progress, table, r.round));
};

// Stars a table has earned = number of completed stages (0..3).
export const tableStars = (
  progress: CurriculumProgress | undefined,
  table: number,
): number => {
  let stars = 0;
  for (const s of STAGES) {
    if (isStageComplete(progress, table, s.stage)) stars++;
  }
  return stars;
};

export const isTableComplete = (
  progress: CurriculumProgress | undefined,
  table: number,
): boolean => tableStars(progress, table) >= STAGES_PER_TABLE;

// A table is unlocked when the PREVIOUS table in TABLE_ORDER has its first
// star (stage 1 done). The first table is always unlocked.
export const isTableUnlocked = (
  progress: CurriculumProgress | undefined,
  table: number,
): boolean => {
  const idx = TABLE_ORDER.indexOf(table as (typeof TABLE_ORDER)[number]);
  if (idx <= 0) return true;
  return isStageComplete(progress, TABLE_ORDER[idx - 1], 1);
};

// Stage 1 opens with the table; each later stage needs the one before it.
export const isStageUnlocked = (
  progress: CurriculumProgress | undefined,
  table: number,
  stage: number,
): boolean => {
  if (!isTableUnlocked(progress, table)) return false;
  if (stage <= 1) return true;
  return isStageComplete(progress, table, stage - 1);
};

// Rounds inside an unlocked stage are freely playable (no per-round chain).
export const isRoundUnlocked = (
  progress: CurriculumProgress | undefined,
  table: number,
  round: number,
): boolean => {
  const def = STAGES.find((s) => s.rounds.some((r) => r.round === round));
  if (!def) return false;
  return isStageUnlocked(progress, table, def.stage);
};

// All tables currently unlocked, in teaching order (feeds the mix challenge).
export const unlockedTables = (
  progress: CurriculumProgress | undefined,
): number[] =>
  (TABLE_ORDER as readonly number[]).filter((t) =>
    isTableUnlocked(progress, t),
  );

// The round the learner should play next. Deliberately BREADTH-FIRST by
// stage: sweep stage 1 across all tables (each star unlocks the next table,
// so the recommended path is always fresh content), then stage 2 everywhere,
// then stage 3 — instead of grinding one table to 100% before moving on.
// Null when everything's done.
export const findNextRound = (
  progress: CurriculumProgress | undefined,
): { table: number; round: number } | null => {
  for (const stage of STAGES) {
    for (const table of TABLE_ORDER) {
      if (!isStageUnlocked(progress, table, stage.stage)) continue;
      for (const r of stage.rounds) {
        if (!isRoundCleared(progress, table, r.round)) {
          return { table, round: r.round };
        }
      }
    }
  }
  return null;
};

// Where a tap on this table's card should land: the first uncleared round in
// stage order (rounds within a stage in listed order), or the very last round
// for a fully-cleared table (free replay). Assumes the table is unlocked.
export const nextRoundInTable = (
  progress: CurriculumProgress | undefined,
  table: number,
): number => {
  for (const stage of STAGES) {
    if (!isStageUnlocked(progress, table, stage.stage)) break;
    for (const r of stage.rounds) {
      if (!isRoundCleared(progress, table, r.round)) return r.round;
    }
  }
  const last = STAGES[STAGES.length - 1];
  return last.rounds[last.rounds.length - 1].round;
};

// Whether today's mix challenge EXP has been claimed already.
export const isMixClaimedToday = (
  progress: CurriculumProgress | undefined,
): boolean => !!progress?.completedLessonIds.includes(mixDayId());

export interface SaveRoundResult {
  expGained: number;
  scoreGained: number;
  firstClear: boolean;
}

// Persist a cleared round + pay EXP/score once. `perfect` adds a small bonus.
export const saveTimetableRound = async (args: {
  userId: string;
  table: number;
  round: number;
  perfect: boolean;
}): Promise<SaveRoundResult> => {
  const { userId, table, round, perfect } = args;
  return saveClear({
    userId,
    id: roundId(table, round),
    exp: EXP_PER_ROUND + (perfect ? EXP_PER_PERFECT_BONUS : 0),
    score: SCORE_PER_ROUND,
  });
};

// Persist a passed mix challenge. Pays once per calendar day (the id embeds
// the date), replays after that are free practice.
export const saveMixChallenge = async (args: {
  userId: string;
  perfect: boolean;
}): Promise<SaveRoundResult> =>
  saveClear({
    userId: args.userId,
    id: mixDayId(),
    exp: EXP_MIX_DAILY + (args.perfect ? EXP_PER_PERFECT_BONUS : 0),
    score: SCORE_MIX_DAILY,
  });

// Shared write path: add `id` to completedLessonIds and pay EXP/score on
// first clear only.
const saveClear = async (args: {
  userId: string;
  id: string;
  exp: number;
  score: number;
}): Promise<SaveRoundResult> => {
  const { userId, id, exp, score } = args;
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return { expGained: 0, scoreGained: 0, firstClear: false };
  const user = snap.data() as User;

  const existing =
    user.curriculumProgress?.[TIMETABLE_CURRICULUM_ID] ?? emptyProgress();
  const firstClear = !existing.completedLessonIds.includes(id);

  const nowIso = new Date().toISOString();
  const next: CurriculumProgress = {
    ...existing,
    lastActiveAt: nowIso,
    completedLessonIds: firstClear
      ? [...existing.completedLessonIds, id]
      : existing.completedLessonIds,
  };

  // First clear pays full; replays pay a small practice bonus (score stays
  // first-clear-only — it's an admin-side metric now).
  const expGained = firstClear ? exp : EXP_PER_REPLAY;
  const scoreGained = firstClear ? score : 0;

  await updateDoc(doc(db, 'users', userId), {
    [`curriculumProgress.${TIMETABLE_CURRICULUM_ID}`]: next,
    experience: (user.experience ?? 0) + expGained,
    ...(firstClear
      ? { totalScore: (user.totalScore ?? 0) + scoreGained }
      : {}),
    // เหรียญสะสมตลอดกาล — `?? experience` คือ lazy backfill สำหรับ user เก่า
    lifetimeExp: (user.lifetimeExp ?? user.experience ?? 0) + expGained,
  });

  return { expGained, scoreGained, firstClear };
};
