// lib/firebase/curriculum-progress.ts
//
// Reads / writes the `curriculumProgress` map on a User document.
// One sub-document per curriculum, keyed by curriculum id (e.g. "bnc-y3").

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './client';
import type { User } from '@/types';
import type {
  CurriculumProgress,
  LessonScore,
  MistakePattern,
  SubTopicScore,
} from '@/types/curriculum';
import type { LessonRunResult } from '@/components/lesson/LessonPlayer';

// Cap how many mistake patterns we retain per curriculum to avoid unbounded growth.
const MISTAKE_CAP = 200;

const emptyProgress = (curriculumId: string): CurriculumProgress => ({
  curriculumId,
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

const getUser = async (userId: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return snap.data() as User;
};

export const getCurriculumProgress = async (
  userId: string,
  curriculumId: string,
): Promise<CurriculumProgress | null> => {
  const user = await getUser(userId);
  if (!user) return null;
  return user.curriculumProgress?.[curriculumId] ?? null;
};

export interface SaveLessonRunArgs {
  userId: string;
  curriculumId: string;
  topicId: string;
  subTopicId: string;
  result: LessonRunResult;
}

// Persist the outcome of one lesson run.
// Idempotent for replays — best score / max stars wins; attempts increment.
export const saveLessonRunResult = async (args: SaveLessonRunArgs): Promise<void> => {
  const { userId, curriculumId, topicId, subTopicId, result } = args;
  const user = await getUser(userId);
  if (!user) return;

  const existing = user.curriculumProgress?.[curriculumId] ?? emptyProgress(curriculumId);
  const nowIso = new Date().toISOString();

  const priorScore = existing.lessonScores[result.lessonId];
  const updatedLessonScore: LessonScore = {
    lessonId: result.lessonId,
    attempts: (priorScore?.attempts ?? 0) + 1,
    bestScore: Math.max(priorScore?.bestScore ?? 0, result.passed ? 1 : 0),
    totalTimeSeconds: (priorScore?.totalTimeSeconds ?? 0) + result.durationSeconds,
    lastAttemptAt: nowIso,
    completedAt: priorScore?.completedAt ?? (result.passed ? nowIso : undefined),
    starsAwarded: Math.max(priorScore?.starsAwarded ?? 0, result.starsAwarded),
  };

  const completedLessonIds =
    result.passed && !existing.completedLessonIds.includes(result.lessonId)
      ? [...existing.completedLessonIds, result.lessonId]
      : existing.completedLessonIds;

  const newMistakes: MistakePattern[] = result.mistakes.map((m) => ({
    questionId: m.questionId,
    lessonId: result.lessonId,
    topic: m.topic,
    userAnswer: m.userAnswer,
    correctAnswer: m.correctAnswer,
    timestamp: nowIso,
    reviewed: false,
  }));

  const mergedMistakes = [...newMistakes, ...existing.mistakePatterns].slice(0, MISTAKE_CAP);

  const next: CurriculumProgress = {
    ...existing,
    lastActiveAt: nowIso,
    currentTopicId: topicId,
    currentSubTopicId: subTopicId,
    currentLessonId: result.lessonId,
    completedLessonIds,
    lessonScores: {
      ...existing.lessonScores,
      [result.lessonId]: updatedLessonScore,
    },
    mistakePatterns: mergedMistakes,
    totalMinutesSpent: existing.totalMinutesSpent + Math.round(result.durationSeconds / 60),
    totalStarsEarned:
      existing.totalStarsEarned +
      Math.max(0, result.starsAwarded - (priorScore?.starsAwarded ?? 0)),
  };

  await updateDoc(doc(db, 'users', userId), {
    [`curriculumProgress.${curriculumId}`]: next,
    currentCurriculumId: user.currentCurriculumId ?? curriculumId,
  });
};

export interface UpdatePositionArgs {
  userId: string;
  curriculumId: string;
  topicId: string;
  subTopicId: string;
  lessonId: string;
  stepIndex: number;
}

// Lightweight save: record where the learner is mid-lesson so we can resume.
// Only writes pointer fields; other progress (scores, mistakes) untouched.
export const updateLessonPosition = async (args: UpdatePositionArgs): Promise<void> => {
  const { userId, curriculumId, topicId, subTopicId, lessonId, stepIndex } = args;
  const user = await getUser(userId);
  if (!user) return;

  const existing = user.curriculumProgress?.[curriculumId] ?? emptyProgress(curriculumId);
  // Skip the write if nothing changed — avoids the hot path hitting Firestore
  // on every keystroke-like state change.
  if (
    existing.currentLessonId === lessonId &&
    existing.currentStepIndex === stepIndex &&
    existing.currentTopicId === topicId &&
    existing.currentSubTopicId === subTopicId
  ) {
    return;
  }

  const next: CurriculumProgress = {
    ...existing,
    lastActiveAt: new Date().toISOString(),
    currentTopicId: topicId,
    currentSubTopicId: subTopicId,
    currentLessonId: lessonId,
    currentStepIndex: stepIndex,
  };

  await updateDoc(doc(db, 'users', userId), {
    [`curriculumProgress.${curriculumId}`]: next,
    currentCurriculumId: user.currentCurriculumId ?? curriculumId,
  });
};

export interface SaveSubTopicAssessmentArgs {
  userId: string;
  curriculumId: string;
  subTopicId: string;
  // ids of sub-topics that should unlock when this one passes
  unlocksSubTopicIds?: string[];
  score: number; // 0..1
  passed: boolean;
}

export const saveSubTopicAssessment = async (
  args: SaveSubTopicAssessmentArgs,
): Promise<void> => {
  const { userId, curriculumId, subTopicId, unlocksSubTopicIds, score, passed } = args;
  const user = await getUser(userId);
  if (!user) return;

  const existing = user.curriculumProgress?.[curriculumId] ?? emptyProgress(curriculumId);
  const nowIso = new Date().toISOString();
  const prior = existing.subTopicScores[subTopicId];

  const scoreEntry: SubTopicScore = {
    subTopicId,
    bestScore: Math.max(prior?.bestScore ?? 0, score),
    passed: prior?.passed || passed,
    attempts: (prior?.attempts ?? 0) + 1,
    completedAt: prior?.completedAt ?? (passed ? nowIso : undefined),
  };

  // Mark this sub-topic as unlocked once at least one attempt is recorded;
  // mark downstream sub-topics unlocked when this one passes.
  const newlyUnlocked = passed ? (unlocksSubTopicIds ?? []) : [];
  const unlockedSubTopicIds = Array.from(
    new Set([...existing.unlockedSubTopicIds, subTopicId, ...newlyUnlocked]),
  );

  const next: CurriculumProgress = {
    ...existing,
    lastActiveAt: nowIso,
    subTopicScores: {
      ...existing.subTopicScores,
      [subTopicId]: scoreEntry,
    },
    unlockedSubTopicIds,
  };

  await updateDoc(doc(db, 'users', userId), {
    [`curriculumProgress.${curriculumId}`]: next,
  });
};
