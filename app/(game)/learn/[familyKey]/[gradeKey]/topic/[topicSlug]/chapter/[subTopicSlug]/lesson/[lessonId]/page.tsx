// app/(game)/learn/[familyKey]/[gradeKey]/topic/[topicSlug]/chapter/[subTopicSlug]/lesson/[lessonId]/page.tsx
//
// Lesson player route — wraps LessonPlayer and persists results via Firestore.

'use client';

import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import LessonPlayer, { LessonRunResult } from '@/components/lesson/LessonPlayer';
import { getFamilyGrade } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import {
  saveLessonRunResult,
  updateLessonPosition,
} from '@/lib/firebase/curriculum-progress';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const familyKey = String(params.familyKey);
  const gradeKey = String(params.gradeKey);
  const topicSlug = String(params.topicSlug);
  const subTopicSlug = String(params.subTopicSlug);
  const lessonId = String(params.lessonId);

  const resolved = getFamilyGrade(familyKey, gradeKey);
  const curriculum = resolved?.grade.curriculumId
    ? getCurriculum(resolved.grade.curriculumId)
    : null;
  const topic = curriculum?.topics.find((t) => t.slug === topicSlug);
  const subTopic = topic?.subTopics.find((s) => s.slug === subTopicSlug);
  const lesson = subTopic?.lessons.find((l) => l.id === lessonId);

  // Send the learner back to /learn (the timeline they started from) on close.
  // The chapter detail page still exists for deep links, but jumping to it on
  // exit confused users — they don't recognise the page and lose their place.
  const exitHref = '/learn';

  if (!resolved || !curriculum || !topic || !subTopic || !lesson) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen items-center justify-center bg-[#FFFCF8] p-6">
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold text-gray-900">ไม่พบบทเรียนนี้</p>
            <button
              onClick={() => router.push('/learn')}
              className="rounded-2xl bg-[#FF6B9D] px-5 py-2 text-base font-bold text-white"
            >
              กลับหน้าเรียน
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const handleLessonComplete = async (result: LessonRunResult) => {
    if (!user) return;
    try {
      // Sub-topics whose prerequisites include this one — they unlock when
      // every lesson in this sub-topic is complete.
      const unlocksSubTopicIds = topic.subTopics
        .filter((s) => s.prerequisites?.includes(subTopic.id))
        .map((s) => s.id);

      await saveLessonRunResult({
        userId: user.id,
        curriculumId: curriculum.id,
        topicId: topic.id,
        subTopicId: subTopic.id,
        result,
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
    // Fire-and-forget: persisting the pointer must not block the UI.
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
