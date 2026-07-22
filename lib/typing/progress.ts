// lib/typing/progress.ts
//
// Progress + reward persistence for the typing game — a direct port of the
// timetable pattern (lib/timetable/progress.ts): synthetic curriculum id in
// user.curriculumProgress, cleared stage ids in completedLessonIds, EXP/score
// paid once per id. Stage ids embed the track (`ty-en-…`) so a future Thai
// track adds `ty-th-…` ids with zero migration.
//
// Unlock rules (same shape as timetable): stages within a unit unlock in
// order; the NEXT unit needs only stage 1 (⭐) of the previous unit.

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { User } from '@/types';
import type { CurriculumProgress } from '@/types/curriculum';
import {
  EXP_PER_PERFECT_BONUS,
  EXP_PER_REPLAY,
  EXP_PER_ROUND,
  SCORE_PER_ROUND,
  STAGES_PER_UNIT,
  UNITS,
} from './config';

export const TYPING_CURRICULUM_ID = 'typing';

// Stable id for a (unit, stage) round on the EN track. NEVER change format.
export const stageId = (unit: number, stage: number) => `ty-en-${unit}-s${stage}`;

const emptyProgress = (): CurriculumProgress => ({
  curriculumId: TYPING_CURRICULUM_ID,
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

export const getTypingProgress = (
  user: User | null,
): CurriculumProgress | undefined =>
  user?.curriculumProgress?.[TYPING_CURRICULUM_ID];

export const isStageCleared = (
  progress: CurriculumProgress | undefined,
  unit: number,
  stage: number,
): boolean => !!progress?.completedLessonIds.includes(stageId(unit, stage));

// Stars a unit has earned = cleared stages (0..3).
export const unitStars = (
  progress: CurriculumProgress | undefined,
  unit: number,
): number => {
  let stars = 0;
  for (let s = 1; s <= STAGES_PER_UNIT; s++) {
    if (isStageCleared(progress, unit, s)) stars++;
  }
  return stars;
};

export const isUnitComplete = (
  progress: CurriculumProgress | undefined,
  unit: number,
): boolean => unitStars(progress, unit) >= STAGES_PER_UNIT;

// A unit is unlocked when the PREVIOUS unit has its first star (stage 1).
export const isUnitUnlocked = (
  progress: CurriculumProgress | undefined,
  unit: number,
): boolean => {
  const idx = UNITS.findIndex((u) => u.number === unit);
  if (idx <= 0) return idx === 0;
  return isStageCleared(progress, UNITS[idx - 1].number, 1);
};

// Stage 1 opens with the unit; each later stage needs the one before it.
export const isStageUnlocked = (
  progress: CurriculumProgress | undefined,
  unit: number,
  stage: number,
): boolean => {
  if (!isUnitUnlocked(progress, unit)) return false;
  if (stage <= 1) return true;
  return isStageCleared(progress, unit, stage - 1);
};

// Recommended next stage — breadth-first by stage across units (sweep every
// unit's ⭐ first, then ⭐⭐, then ⭐⭐⭐), same rationale as the timetable's
// findNextRound. Null when everything's done.
// The "play next" recommendation. DEPTH-FIRST: finish every stage of the
// CURRENT unit (1→2→3, all 3 stars) before moving on to the next unit — so
// the button never skips a half-done unit, which read as confusing ("I only
// have 1 star, why is it sending me ahead?"). NOTE: this only steers the
// recommendation. Unlocking is unchanged (isUnitUnlocked: next unit opens on
// the FIRST star), so a kid who WANTS to jump ahead can still tap that unit's
// card directly.
export const findNextStage = (
  progress: CurriculumProgress | undefined,
): { unit: number; stage: number } | null => {
  for (const u of UNITS) {
    for (let stage = 1; stage <= STAGES_PER_UNIT; stage++) {
      if (!isStageUnlocked(progress, u.number, stage)) continue;
      if (!isStageCleared(progress, u.number, stage)) {
        return { unit: u.number, stage };
      }
    }
  }
  return null;
};

// Where a tap on this unit's card should land: the first uncleared stage that
// is unlocked, or stage 3 for a fully-cleared unit (free replay of the last,
// hardest stage). Assumes the unit itself is unlocked.
export const nextStageInUnit = (
  progress: CurriculumProgress | undefined,
  unit: number,
): number => {
  for (let s = 1; s <= STAGES_PER_UNIT; s++) {
    if (!isStageCleared(progress, unit, s)) return s;
  }
  return STAGES_PER_UNIT;
};

export interface SaveStageResult {
  expGained: number;
  scoreGained: number;
  firstClear: boolean;
}

// Persist a passed stage + pay EXP/score once. `perfect` = zero errors.
export const saveTypingStage = async (args: {
  userId: string;
  unit: number;
  stage: number;
  perfect: boolean;
  /** Timed-stage time bonus (EXP). Banked on first clear only. */
  bonusExp?: number;
}): Promise<SaveStageResult> => {
  const { userId, unit, stage, perfect, bonusExp = 0 } = args;
  const id = stageId(unit, stage);

  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return { expGained: 0, scoreGained: 0, firstClear: false };
  const user = snap.data() as User;

  const existing =
    user.curriculumProgress?.[TYPING_CURRICULUM_ID] ?? emptyProgress();
  const firstClear = !existing.completedLessonIds.includes(id);

  const next: CurriculumProgress = {
    ...existing,
    lastActiveAt: new Date().toISOString(),
    completedLessonIds: firstClear
      ? [...existing.completedLessonIds, id]
      : existing.completedLessonIds,
  };

  // First clear pays full (+ optional timed bonus); replays pay a small
  // practice bonus (score stays first-clear-only — an admin-side metric now).
  const expGained = firstClear
    ? EXP_PER_ROUND + (perfect ? EXP_PER_PERFECT_BONUS : 0) + Math.max(0, bonusExp)
    : EXP_PER_REPLAY;
  const scoreGained = firstClear ? SCORE_PER_ROUND : 0;

  await updateDoc(doc(db, 'users', userId), {
    [`curriculumProgress.${TYPING_CURRICULUM_ID}`]: next,
    experience: (user.experience ?? 0) + expGained,
    ...(firstClear
      ? { totalScore: (user.totalScore ?? 0) + scoreGained }
      : {}),
    // เหรียญสะสมตลอดกาล — `?? experience` คือ lazy backfill สำหรับ user เก่า
    lifetimeExp: (user.lifetimeExp ?? user.experience ?? 0) + expGained,
  });

  return { expGained, scoreGained, firstClear };
};
