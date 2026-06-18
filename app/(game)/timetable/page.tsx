// app/(game)/timetable/page.tsx
//
// Timetable (สูตรคูณ) landing — renders through the SHARED <CurriculumTimeline>
// (same as /learn and /life-math) by adapting the timetable config into a
// synthetic curriculum. Each table is an accordion; rounds are the lesson list.

'use client';

import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import CurriculumTimeline from '@/components/curriculum/CurriculumTimeline';
import { useAuth } from '@/lib/contexts/AuthContext';
import { findContinueLesson } from '@/lib/curricula/progress-helpers';
import { buildTimetableCurriculum } from '@/lib/timetable/curriculum';
import { getTimetableProgress } from '@/lib/timetable/progress';

export default function TimetableHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const curriculum = buildTimetableCurriculum();
  const progress = getTimetableProgress(user);
  const continueLesson = findContinueLesson(curriculum, progress);

  // Lesson ids are roundId(table, round) = "tt-{table}-r{round}"; the round
  // player route is /timetable/{table}/{round}. Parse the id back out.
  const lessonHref = (subTopicSlug: string, lessonId: string) => {
    const round = lessonId.split('-r')[1] ?? '1';
    return `/timetable/${subTopicSlug}/${round}`;
  };

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
          <div className="mx-auto max-w-3xl space-y-6">
            <header>
              <div className="flex items-center gap-3">
                <span className="text-4xl leading-none" aria-hidden="true">
                  ✖️
                </span>
                <h1 className="text-3xl font-bold text-white">
                  สูตรคูณ <span className="text-white/60">Timetable</span>
                </h1>
              </div>
              <p className="mt-1 text-base text-white/70">
                ฝึกท่องสูตรคูณซ้ำๆ จนจำได้ขึ้นใจ — ไล่ทีละแม่ ฝึก 12 รอบต่อแม่
              </p>
            </header>

            <CurriculumTimeline
              curriculum={curriculum}
              progress={progress}
              heading="สูตรคูณ · ฝึกจนจำได้"
              continueLessonId={continueLesson?.lesson.id ?? null}
              onContinue={() => {
                if (!continueLesson) return;
                router.push(
                  lessonHref(continueLesson.subTopic.slug, continueLesson.lesson.id),
                );
              }}
              buildLessonHref={(_topic, subTopic, lesson) =>
                lessonHref(subTopic.slug, lesson.id)
              }
              hideTopicHeadings
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
