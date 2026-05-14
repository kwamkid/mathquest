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

export const isSubTopicUnlocked = (
  progress: CurriculumProgress | undefined,
  subTopic: SubTopic,
): boolean => {
  // The very first sub-topic (no prerequisites) is always open.
  if (subTopic.prerequisites.length === 0) return true;
  if (!progress) return false;
  return subTopic.prerequisites.every((p) =>
    progress.unlockedSubTopicIds.includes(p) ||
    progress.subTopicScores[p]?.passed,
  );
};

export const getSubTopicProgress = (
  progress: CurriculumProgress | undefined,
  subTopic: SubTopic,
): SubTopicProgress => {
  const total = subTopic.lessons.length;
  const completed = subTopic.lessons.filter((l) => isLessonCompleted(progress, l.id)).length;
  const nextLesson = subTopic.lessons.find((l) => !isLessonCompleted(progress, l.id));
  return {
    total,
    completed,
    pct: total > 0 ? completed / total : 0,
    done: total > 0 && completed === total,
    unlocked: isSubTopicUnlocked(progress, subTopic),
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

