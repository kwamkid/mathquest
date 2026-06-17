// lib/curricula/progress-helpers.ts
//
// Read-only helpers that compute lesson/sub-topic/topic progress from a
// CurriculumProgress object. Used by the curriculum browser UI to render
// "completed" badges, percentages, and "continue from here" pointers.

import type {
  CurriculumProgress,
  Curriculum,
  Lesson,
  SubTopic,
  Topic,
} from '@/types/curriculum';
import {
  EXP_PER_STAR,
  SCORE_PER_STAR,
} from '@/lib/firebase/curriculum-progress';

export interface SubTopicProgress {
  total: number;
  completed: number;
  pct: number;            // 0..1
  done: boolean;
  unlocked: boolean;
  // First non-completed lesson — the "continue" pointer.
  nextLesson?: Lesson;
}

export interface TopicProgress {
  total: number;          // total lessons across all subTopics
  completed: number;
  pct: number;
  done: boolean;
}

export const isLessonCompleted = (
  progress: CurriculumProgress | undefined,
  lessonId: string,
): boolean => {
  if (!progress) return false;
  return progress.completedLessonIds.includes(lessonId);
};

export const lessonStarsEarned = (
  progress: CurriculumProgress | undefined,
  lessonId: string,
): number => {
  return progress?.lessonScores[lessonId]?.starsAwarded ?? 0;
};

// Maximum reward you can earn from a lesson — used by the UI to preview
// "do this and you'll get X stars / Y EXP" before the learner plays. Reads
// from a mini-quiz step if there is one (final quiz / assessment lessons);
// teaching lessons fall back to 3 stars max (the default in LessonPlayer).
export interface LessonReward {
  stars: number;   // max stars the learner can earn
  exp: number;     // max EXP from those stars
  score: number;   // max totalScore contribution from those stars
}

export const getLessonRewardPreview = (lesson: Lesson): LessonReward => {
  const mini = lesson.steps.find((s) => s.type === 'mini-quiz');
  const stars =
    mini && mini.type === 'mini-quiz'
      ? mini.starsOnPerfect
      : 3; // teaching lessons cap at 3 stars (LessonPlayer baseline)
  return {
    stars,
    exp: stars * EXP_PER_STAR,
    score: stars * SCORE_PER_STAR,
  };
};

// A sub-topic is unlocked when every prerequisite sub-topic is fully completed.
// Optional `topic` allows backfilled completion check: we look up each
// prerequisite's lessons and see if they're all in completedLessonIds.
// Falls back to the older flags (unlockedSubTopicIds / subTopicScores.passed)
// for compatibility with data that was written before backfill landed.
export const isSubTopicUnlocked = (
  progress: CurriculumProgress | undefined,
  subTopic: SubTopic,
  topic?: Topic,
): boolean => {
  // The very first sub-topic (no prerequisites) is always open.
  if (subTopic.prerequisites.length === 0) return true;
  if (!progress) return false;
  return subTopic.prerequisites.every((p) => {
    if (progress.unlockedSubTopicIds.includes(p)) return true;
    if (progress.subTopicScores[p]?.passed) return true;
    // Backfill: if we know the topic, treat "all lessons of prerequisite
    // completed" as equivalent to passed.
    const prereq = topic?.subTopics.find((s) => s.id === p);
    if (prereq && prereq.lessons.length > 0) {
      return prereq.lessons.every((l) => progress.completedLessonIds.includes(l.id));
    }
    return false;
  });
};

export const getSubTopicProgress = (
  progress: CurriculumProgress | undefined,
  subTopic: SubTopic,
  topic?: Topic,
): SubTopicProgress => {
  const total = subTopic.lessons.length;
  const completed = subTopic.lessons.filter((l) => isLessonCompleted(progress, l.id)).length;
  const nextLesson = subTopic.lessons.find((l) => !isLessonCompleted(progress, l.id));
  return {
    total,
    completed,
    pct: total > 0 ? completed / total : 0,
    done: total > 0 && completed === total,
    unlocked: isSubTopicUnlocked(progress, subTopic, topic),
    nextLesson,
  };
};

export const getTopicProgress = (
  progress: CurriculumProgress | undefined,
  topic: Topic,
): TopicProgress => {
  let total = 0;
  let completed = 0;
  for (const st of topic.subTopics) {
    total += st.lessons.length;
    completed += st.lessons.filter((l) => isLessonCompleted(progress, l.id)).length;
  }
  return {
    total,
    completed,
    pct: total > 0 ? completed / total : 0,
    done: total > 0 && completed === total,
  };
};

// Find the lesson the learner should jump to when they say "Continue".
// Strategy: their `currentLessonId` if still incomplete, else next incomplete
// lesson in curriculum order.
export const findContinueLesson = (
  curriculum: Curriculum,
  progress: CurriculumProgress | undefined,
): { topic: Topic; subTopic: SubTopic; lesson: Lesson } | null => {
  for (const topic of curriculum.topics) {
    for (const subTopic of topic.subTopics) {
      for (const lesson of subTopic.lessons) {
        if (!isLessonCompleted(progress, lesson.id)) {
          return { topic, subTopic, lesson };
        }
      }
    }
  }
  return null;
};

