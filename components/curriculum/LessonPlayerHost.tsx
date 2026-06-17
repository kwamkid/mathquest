// components/curriculum/LessonPlayerHost.tsx
//
// Shared wrapper around <LessonPlayer> that handles result persistence
// (Firestore) and progress tracking. Routes resolve curriculum/topic/lesson
// objects from the URL and hand them to this component; the player and
// save pipeline live here so /learn and /life-math share one save flow.

'use client';

import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import LessonPlayer, { LessonRunResult } from '@/components/lesson/LessonPlayer';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  saveLessonRunResult,
  updateLessonPosition,
} from '@/lib/firebase/curriculum-progress';
import type {
  Curriculum,
  Lesson,
  SubTopic,
  Topic,
} from '@/types/curriculum';

interface Props {
  curriculum: Curriculum;
  topic: Topic;
  subTopic: SubTopic;
  lesson: Lesson;
  // Where pressing "X" / Esc takes the learner. Each route knows its own
  // home — /learn lessons send back to /learn, life-math lessons go to
  // /life-math.
  exitHref: string;
}

export default function LessonPlayerHost({
  curriculum,
  topic,
  subTopic,
  lesson,
  exitHref,
}: Props) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const handleLessonComplete = async (result: LessonRunResult) => {
    if (!user) return;
    try {
      const unlocksSubTopicIds = topic.subTopics
        .filter((s) => s.prerequisites?.includes(subTopic.id))
        .map((s) => s.id);

      // Mini quizzes are reinforcement, not assessment — they still mark
      // the "lesson" complete, but award no stars / EXP / score. Star
      // delta clamps to 0 here so EXP_PER_STAR doesn't pay out for replays.
      const adjusted =
        lesson.kind === 'mini' ? { ...result, starsAwarded: 0 } : result;

      await saveLessonRunResult({
        userId: user.id,
        curriculumId: curriculum.id,
        topicId: topic.id,
        subTopicId: subTopic.id,
        result: adjusted,
        subTopicLessonIds: subTopic.lessons.map((l) => l.id),
        unlocksSubTopicIds,
      });
      await refreshUser();
    } catch (err) {
      console.error('Failed to save lesson result', err);
    }
  };

  const handleStepChange = (stepIndex: number) => {
    if (!user) return;
    // Fire-and-forget — persisting the pointer must not block the UI.
    void updateLessonPosition({
      userId: user.id,
      curriculumId: curriculum.id,
      topicId: topic.id,
      subTopicId: subTopic.id,
      lessonId: lesson.id,
      stepIndex,
    }).catch((err) => console.error('Failed to save lesson position', err));
  };

  // Resume mid-lesson if the saved position matches this lesson.
  const savedProgress = user?.curriculumProgress?.[curriculum.id];
  const startStepIndex =
    savedProgress?.currentLessonId === lesson.id
      ? savedProgress.currentStepIndex
      : undefined;

  return (
    <AuthGuard>
      <LessonPlayer
        lesson={lesson}
        topic={topic.slug}
        onClose={() => router.push(exitHref)}
        onLessonComplete={handleLessonComplete}
        startStepIndex={startStepIndex}
        onStepChange={handleStepChange}
      />
    </AuthGuard>
  );
}
