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
import type { TypingStreak, User } from '@/types';
import type { CurriculumProgress } from '@/types/curriculum';
import {
  dayBaseExp,
  EXP_PER_REPLAY,
  perfectBonus,
  SCORE_PER_ROUND,
  stageBaseExp,
  STAGES_PER_UNIT,
  UNITS,
} from './config';
import { DAY_MILESTONES, dayPlan, TOTAL_DAYS } from './days';

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

  // First clear pays full, scaled by unit difficulty (+ optional timed
  // bonus); replays pay a small practice bonus (score stays first-clear-only
  // — an admin-side metric now).
  const base = stageBaseExp(unit);
  const expGained = firstClear
    ? base + (perfect ? perfectBonus(base) : 0) + Math.max(0, bonusExp)
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

// ===========================================================================
// 100-day plan (แผน 100 วัน) — the day layer over the unit/stage curriculum.
// ===========================================================================

// Persisted id for a non-stage day (slot 4-5 and days 51+). NEVER change.
export const dayId = (day: number) => `ty-day-${day}`;

// Local calendar date as 'YYYY-MM-DD' (device timezone — a kid's "today").
export const localDayISO = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const yesterdayISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDayISO(d);
};

// Whether day n counts as completed. Slot 1-3 days ARE the old stages, so an
// existing star completes them retroactively (zero migration). Slot 4-5 days
// are also credited when the NEXT unit has any star ("surpass credit") — a
// player who already moved past unit u shouldn't be dragged back to grind
// unit u's new practice days.
export const isDayDone = (
  progress: CurriculumProgress | undefined,
  day: number,
): boolean => {
  const plan = dayPlan(day);
  if (plan.stageRef) {
    return isStageCleared(progress, plan.stageRef.unit, plan.stageRef.stage);
  }
  if (progress?.completedLessonIds.includes(dayId(day))) return true;
  if (plan.phase === 'A' && plan.unit < UNITS.length) {
    return unitStars(progress, plan.unit + 1) > 0; // surpass credit
  }
  return false;
};

// First not-done day, scanning 1→100. TOTAL_DAYS+1 = everything finished
// (Freestyle unlocks there). Derived fresh every call — can never desync.
export const currentTypingDay = (
  progress: CurriculumProgress | undefined,
): number => {
  for (let n = 1; n <= TOTAL_DAYS; n++) {
    if (!isDayDone(progress, n)) return n;
  }
  return TOTAL_DAYS + 1;
};

export interface TypingDayState {
  currentDay: number;
  doneDays: Set<number>;
  streak: TypingStreak;
  /** True when the streak already counted a play today. */
  playedToday: boolean;
}

const emptyStreak = (): TypingStreak => ({
  current: 0,
  best: 0,
  lastDayISO: '',
  milestonesPaid: [],
});

export const getTypingDayState = (user: User | null): TypingDayState => {
  const progress = getTypingProgress(user ?? null);
  const doneDays = new Set<number>();
  for (let n = 1; n <= TOTAL_DAYS; n++) {
    if (isDayDone(progress, n)) doneDays.add(n);
  }
  const streak = user?.typingStreak ?? emptyStreak();
  return {
    currentDay: currentTypingDay(progress),
    doneDays,
    streak,
    playedToday: streak.lastDayISO === localDayISO(),
  };
};

export interface SaveDayResult extends SaveStageResult {
  /** Streak after this save. */
  streak: TypingStreak;
  /** One-time streak-milestone coins paid by THIS save (0 = none). */
  milestoneBonus: number;
}

// Advance the calendar streak for "played a mission today" (day missions AND
// freestyle rounds both count — showing up is what the flame rewards) and
// collect any newly-crossed one-time milestone coins. Idempotent within a day.
const advanceStreak = (
  prev: TypingStreak | undefined,
): { streak: TypingStreak; milestoneBonus: number } => {
  const today = localDayISO();
  const before = prev ?? emptyStreak();
  let streak: TypingStreak;
  if (before.lastDayISO === today) {
    streak = before; // already counted today
  } else {
    const current =
      before.lastDayISO === yesterdayISO() ? before.current + 1 : 1;
    streak = {
      current,
      best: Math.max(before.best, current),
      lastDayISO: today,
      milestonesPaid: before.milestonesPaid ?? [],
    };
  }
  let milestoneBonus = 0;
  const paid = [...(streak.milestonesPaid ?? [])];
  for (const [thresholdStr, coins] of Object.entries(DAY_MILESTONES)) {
    const threshold = Number(thresholdStr);
    if (streak.current >= threshold && !paid.includes(threshold)) {
      milestoneBonus += coins;
      paid.push(threshold);
    }
  }
  return { streak: { ...streak, milestonesPaid: paid }, milestoneBonus };
};

// Persist a passed day mission: routes slot 1-3 days into the stage-star
// economy (identical ids + payouts as the old flow) and other days into
// `ty-day-{n}`, then advances the calendar streak + one-time milestones.
// ONE read + ONE update, mirroring saveTypingStage.
export const saveTypingDay = async (args: {
  userId: string;
  day: number;
  perfect: boolean;
  bonusExp?: number;
}): Promise<SaveDayResult> => {
  const { userId, day, perfect, bonusExp = 0 } = args;
  const plan = dayPlan(day);
  const id = plan.stageRef
    ? stageId(plan.stageRef.unit, plan.stageRef.stage)
    : dayId(day);

  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) {
    return {
      expGained: 0,
      scoreGained: 0,
      firstClear: false,
      streak: emptyStreak(),
      milestoneBonus: 0,
    };
  }
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

  // Day payouts scale with day-number difficulty: day 1 ≈ 15 max, day 100
  // perfect + full time bonus ≈ 60. First clear only; replays stay tiny.
  const base = dayBaseExp(day);
  const expGained = firstClear
    ? base + (perfect ? perfectBonus(base) : 0) + Math.max(0, bonusExp)
    : EXP_PER_REPLAY;
  const scoreGained = firstClear ? SCORE_PER_ROUND : 0;

  const { streak, milestoneBonus } = advanceStreak(user.typingStreak);

  const totalExp = expGained + milestoneBonus;
  await updateDoc(doc(db, 'users', userId), {
    [`curriculumProgress.${TYPING_CURRICULUM_ID}`]: next,
    experience: (user.experience ?? 0) + totalExp,
    ...(firstClear ? { totalScore: (user.totalScore ?? 0) + scoreGained } : {}),
    lifetimeExp: (user.lifetimeExp ?? user.experience ?? 0) + totalExp,
    typingStreak: streak,
  });

  return { expGained, scoreGained, firstClear, streak, milestoneBonus };
};

// ===========================================================================
// Freestyle mode — the post-day-100 WPM arena.
// ===========================================================================

// Coins for beating your own record. Farm-proof by nature: paying again
// requires actually typing faster than ever before.
const FREESTYLE_NEW_BEST_EXP = 10;

export interface SaveFreestyleResult {
  expGained: number;
  newBest: boolean;
  bestWpm: number;
  streak: TypingStreak;
  milestoneBonus: number;
}

// Persist a completed freestyle round: every round pays the small replay
// bonus, a new personal-best WPM pays extra, and the calendar streak advances
// (freestyle counts as "played today" — day-100 finishers keep their flame).
// The WPM the caller passes must already be accuracy-gated (engine only saves
// passed rounds), so a sloppy speed-run can't set a record.
export const saveFreestyle = async (args: {
  userId: string;
  wpm: number;
}): Promise<SaveFreestyleResult> => {
  const { userId, wpm } = args;
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) {
    return {
      expGained: 0,
      newBest: false,
      bestWpm: 0,
      streak: emptyStreak(),
      milestoneBonus: 0,
    };
  }
  const user = snap.data() as User;

  const prevBest = user.typingBestWpm ?? 0;
  const newBest = wpm > prevBest;
  const bestWpm = Math.max(prevBest, wpm);
  const { streak, milestoneBonus } = advanceStreak(user.typingStreak);
  const expGained = EXP_PER_REPLAY + (newBest ? FREESTYLE_NEW_BEST_EXP : 0);
  const totalExp = expGained + milestoneBonus;

  await updateDoc(doc(db, 'users', userId), {
    typingBestWpm: bestWpm,
    experience: (user.experience ?? 0) + totalExp,
    lifetimeExp: (user.lifetimeExp ?? user.experience ?? 0) + totalExp,
    typingStreak: streak,
  });

  return { expGained, newBest, bestWpm, streak, milestoneBonus };
};
