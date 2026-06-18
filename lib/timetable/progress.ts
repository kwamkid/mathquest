// lib/timetable/progress.ts
//
// Progress + reward persistence for the สูตรคูณ drill. We piggy-back on the
// existing `curriculumProgress` map under a synthetic curriculum id so the
// data lives next to the other learning progress, but timetable has its own
// (much simpler) rules: a "round" is cleared when passed, stored as an id in
// completedLessonIds. EXP/score are paid once per round (no double-pay on
// replays), at a lower rate than lessons.

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { User } from '@/types';
import type { CurriculumProgress } from '@/types/curriculum';
import {
  EXP_PER_PERFECT_BONUS,
  EXP_PER_ROUND,
  ROUNDS_PER_TABLE,
  SCORE_PER_ROUND,
  TABLE_ORDER,
} from './config';

export const TIMETABLE_CURRICULUM_ID = 'timetable';

// Stable id for a (table, round) round.
export const roundId = (table: number, round: number) => `tt-${table}-r${round}`;

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

export const isTableComplete = (
  progress: CurriculumProgress | undefined,
  table: number,
): boolean => tableRoundsCleared(progress, table) >= ROUNDS_PER_TABLE;

// A table is unlocked when the PREVIOUS table in TABLE_ORDER is complete (the
// first table is always unlocked).
export const isTableUnlocked = (
  progress: CurriculumProgress | undefined,
  table: number,
): boolean => {
  const idx = TABLE_ORDER.indexOf(table as (typeof TABLE_ORDER)[number]);
  if (idx <= 0) return true;
  return isTableComplete(progress, TABLE_ORDER[idx - 1]);
};

// A round is unlocked when the previous round of the same table is cleared
// (round 1 is unlocked whenever the table itself is unlocked).
export const isRoundUnlocked = (
  progress: CurriculumProgress | undefined,
  table: number,
  round: number,
): boolean => {
  if (!isTableUnlocked(progress, table)) return false;
  if (round <= 1) return true;
  return isRoundCleared(progress, table, round - 1);
};

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
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return { expGained: 0, scoreGained: 0, firstClear: false };
  const user = snap.data() as User;

  const existing =
    user.curriculumProgress?.[TIMETABLE_CURRICULUM_ID] ?? emptyProgress();
  const id = roundId(table, round);
  const firstClear = !existing.completedLessonIds.includes(id);

  const nowIso = new Date().toISOString();
  const next: CurriculumProgress = {
    ...existing,
    lastActiveAt: nowIso,
    completedLessonIds: firstClear
      ? [...existing.completedLessonIds, id]
      : existing.completedLessonIds,
  };

  // Pay only on first clear so replays (for practice) don't farm EXP.
  const expGained = firstClear
    ? EXP_PER_ROUND + (perfect ? EXP_PER_PERFECT_BONUS : 0)
    : 0;
  const scoreGained = firstClear ? SCORE_PER_ROUND : 0;

  if (firstClear) {
    await updateDoc(doc(db, 'users', userId), {
      [`curriculumProgress.${TIMETABLE_CURRICULUM_ID}`]: next,
      experience: (user.experience ?? 0) + expGained,
      totalScore: (user.totalScore ?? 0) + scoreGained,
    });
  } else {
    await updateDoc(doc(db, 'users', userId), {
      [`curriculumProgress.${TIMETABLE_CURRICULUM_ID}`]: next,
    });
  }

  return { expGained, scoreGained, firstClear };
};
