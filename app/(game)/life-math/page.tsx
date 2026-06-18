// app/(game)/life-math/page.tsx
//
// Life Math landing — top-level route (not nested under /learn) so the
// home page can advertise it as its own product alongside Learn / Play.
// Renders the shared <CurriculumTimeline> so it matches the BNC /learn
// landing exactly (accordion chapters → numbered lesson list).

'use client';

import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import CurriculumTimeline from '@/components/curriculum/CurriculumTimeline';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getCurriculum } from '@/lib/curricula';
import { findContinueLesson } from '@/lib/curricula/progress-helpers';

const CURRICULUM_ID = 'life-math-beginner';

export default function LifeMathHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const curriculum = getCurriculum(CURRICULUM_ID);

  if (!curriculum) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">ยังไม่พร้อมใช้งาน</p>
        </div>
      </AuthGuard>
    );
  }

  const progress = user?.curriculumProgress?.[curriculum.id];
  const continueLesson = findContinueLesson(curriculum, progress);

  // Life Math lessons live at /life-math/{topic}/{subtopic}/lesson/{id}.
  const buildLessonHref = (
    topicSlug: string,
    subTopicSlug: string,
    lessonId: string,
  ) => `/life-math/${topicSlug}/${subTopicSlug}/lesson/${lessonId}`;

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
          <div className="mx-auto max-w-3xl space-y-6">
            <header>
              <div className="flex items-center gap-3">
                <span className="text-4xl leading-none" aria-hidden="true">
                  💡
                </span>
                <h1 className="text-3xl font-bold text-white">Life Math</h1>
              </div>
              <p className="mt-1 text-base text-white/70">
                คณิตศาสตร์ที่ใช้ในชีวิตจริง — เปอร์เซ็นต์ บัญญัติไตรยางศ์ ลดราคา ของคุ้มราคา
              </p>
            </header>

            <CurriculumTimeline
              curriculum={curriculum}
              progress={progress}
              heading="Life Math · ทักษะคำนวณในชีวิตประจำวัน"
              continueLessonId={continueLesson?.lesson.id ?? null}
              onContinue={() => {
                if (!continueLesson) return;
                router.push(
                  buildLessonHref(
                    continueLesson.topic.slug,
                    continueLesson.subTopic.slug,
                    continueLesson.lesson.id,
                  ),
                );
              }}
              buildLessonHref={(topic, subTopic, lesson) =>
                buildLessonHref(topic.slug, subTopic.slug, lesson.id)
              }
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
