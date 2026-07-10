// app/(game)/life-math/[topicSlug]/[subTopicSlug]/lesson/[lessonId]/page.tsx
//
// Life Math lesson player route. Resolves the lesson and hands it to the
// shared <LessonPlayerHost> — saving and progress tracking live there.

'use client';

import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import LessonPlayerHost from '@/components/curriculum/LessonPlayerHost';
import { getCurriculum } from '@/lib/curricula';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const CURRICULUM_ID = 'life-math-beginner';

const STR = {
  th: { lessonNotFound: 'ไม่พบบทเรียนนี้', backToLifeMath: 'กลับหน้า Life Math' },
  en: { lessonNotFound: 'Lesson not found', backToLifeMath: 'Back to Life Math' },
} as const;

export default function LifeMathLessonPlayer() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const L = STR[lang];
  const topicSlug = String(params.topicSlug);
  const subTopicSlug = String(params.subTopicSlug);
  const lessonId = String(params.lessonId);

  const curriculum = getCurriculum(CURRICULUM_ID);
  const topic = curriculum?.topics.find((t) => t.slug === topicSlug);
  const subTopic = topic?.subTopics.find((s) => s.slug === subTopicSlug);
  const lesson = subTopic?.lessons.find((l) => l.id === lessonId);

  if (!curriculum || !topic || !subTopic || !lesson) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen items-center justify-center bg-[#FFFCF8] p-6">
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold text-gray-900">{L.lessonNotFound}</p>
            <button
              onClick={() => router.push('/life-math')}
              className="rounded-2xl bg-[#FF6B9D] px-5 py-2 text-base font-bold text-white"
            >
              {L.backToLifeMath}
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
      // Exit takes the learner back to the chapter list — they keep their
      // place rather than getting punted out to the topic root.
      exitHref={`/life-math/${topic.slug}/${subTopic.slug}`}
    />
  );
}
