// app/(game)/learn/[familyKey]/[gradeKey]/topic/[topicSlug]/chapter/[subTopicSlug]/lesson/[lessonId]/page.tsx
//
// Lesson player route for /learn (school curricula). Resolves the lesson
// and hands it to the shared <LessonPlayerHost>; persistence and progress
// tracking live there so /learn and /life-math share one save pipeline.

'use client';

import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import LessonPlayerHost from '@/components/curriculum/LessonPlayerHost';
import { getFamilyGrade } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const STR = {
  th: { lessonNotFound: 'ไม่พบบทเรียนนี้', backToLearn: 'กลับหน้าเรียน' },
  en: { lessonNotFound: 'Lesson not found', backToLearn: 'Back to Learn' },
} as const;

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const L = STR[lang];

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

  if (!resolved || !curriculum || !topic || !subTopic || !lesson) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen items-center justify-center bg-[#FFFCF8] p-6">
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold text-gray-900">{L.lessonNotFound}</p>
            <button
              onClick={() => router.push('/learn')}
              className="rounded-2xl bg-[#FF6B9D] px-5 py-2 text-base font-bold text-white"
            >
              {L.backToLearn}
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <LessonPlayerHost
      curriculum={curriculum}
      topic={topic}
      subTopic={subTopic}
      lesson={lesson}
      // Exit goes to /learn (the timeline they started from) — keeps the
      // legacy behaviour for school-curriculum lessons.
      exitHref="/learn"
    />
  );
}
