// app/(game)/learn/page.tsx
//
// Curriculum learn landing — Udemy-style timeline of chapters & lessons.
// The timeline UI itself lives in the shared <CurriculumTimeline> so /learn
// and /life-math render identically; this route only resolves which school
// curriculum to resume and wires up namespaced hrefs.

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import CurriculumTimeline from '@/components/curriculum/CurriculumTimeline';
import { families } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import { findContinueLesson } from '@/lib/curricula/progress-helpers';
import { useAuth } from '@/lib/contexts/AuthContext';
import type {
  CurriculumFamily,
  CurriculumFamilyGrade,
} from '@/types/curriculum';
import { ChevronRight, Lock } from 'lucide-react';

export default function LearnHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showFamilies, setShowFamilies] = useState(false);

  const active = useMemo(() => {
    if (!user?.curriculumProgress) return null;
    const ids = Object.keys(user.curriculumProgress);
    if (ids.length === 0) return null;

    // Only resume curricula that still belong to a school-curriculum family
    // here — life-math lives on its own /life-math route and shouldn't hijack
    // the /learn landing page just because the user touched it.
    const schoolCurriculumIds = new Set(
      families.flatMap((f) => f.grades.map((g) => g.curriculumId).filter(Boolean) as string[]),
    );

    const preferredId =
      user.currentCurriculumId && schoolCurriculumIds.has(user.currentCurriculumId)
        ? user.currentCurriculumId
        : ids.find((id) => schoolCurriculumIds.has(id));
    if (!preferredId) return null;

    const curriculum = getCurriculum(preferredId);
    if (!curriculum) return null;

    let family: CurriculumFamily | null = null;
    let grade: CurriculumFamilyGrade | null = null;
    for (const f of families) {
      const g = f.grades.find((x) => x.curriculumId === preferredId);
      if (g) {
        family = f;
        grade = g;
        break;
      }
    }
    if (!family || !grade) return null;

    const progress = user.curriculumProgress[preferredId];
    const cont = findContinueLesson(curriculum, progress);
    return { family, grade, curriculum, progress, continueLesson: cont };
  }, [user]);

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
          <div className="mx-auto max-w-3xl space-y-6">
            <header>
              <h1 className="text-3xl font-bold text-white">เรียนคณิตศาสตร์</h1>
              <p className="mt-1 text-base text-white/70">
                {active ? 'ยินดีต้อนรับกลับมา' : 'เลือกหลักสูตร'}
              </p>
            </header>

            {active && !showFamilies && (
              <CurriculumTimeline
                curriculum={active.curriculum}
                progress={active.progress}
                heading={`${active.family.thaiName ?? active.family.name} · ${active.grade.label}`}
                continueLessonId={active.continueLesson?.lesson.id ?? null}
                onContinue={() => {
                  if (!active.continueLesson) return;
                  const c = active.continueLesson;
                  router.push(
                    `/learn/${active.family.key}/${active.grade.key}/topic/${c.topic.slug}/chapter/${c.subTopic.slug}/lesson/${c.lesson.id}`,
                  );
                }}
                buildLessonHref={(topic, subTopic, lesson) =>
                  `/learn/${active.family.key}/${active.grade.key}/topic/${topic.slug}/chapter/${subTopic.slug}/lesson/${lesson.id}`
                }
              />
            )}

            {active && !showFamilies && (
              <button
                onClick={() => setShowFamilies(true)}
                className="text-sm text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
              >
                เลือกหลักสูตรอื่น
              </button>
            )}

            {(!active || showFamilies) && (
              <div className="space-y-3">
                {active && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                    หลักสูตรทั้งหมด
                  </p>
                )}
                {families.map((f) => (
                  <Link
                    key={f.key}
                    href={f.comingSoon ? '#' : `/learn/${f.key}`}
                    aria-disabled={f.comingSoon}
                    className={`flex items-center justify-between gap-3 rounded-2xl p-5 ${
                      f.comingSoon ? 'learn-card-locked pointer-events-none' : 'learn-card'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-4xl leading-none" aria-hidden="true">
                        {f.flag ?? '📘'}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-white">
                            {f.thaiName ?? f.name}
                          </h2>
                          {f.comingSoon && (
                            <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-300">
                              เร็วๆ นี้
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-white/70">{f.description}</p>
                        <p className="mt-2 text-xs text-white/50">
                          {f.grades.filter((g) => g.curriculumId).length}/{f.grades.length} ระดับชั้นพร้อมใช้งาน
                        </p>
                      </div>
                    </div>
                    {f.comingSoon ? (
                      <Lock className="h-5 w-5 shrink-0 text-white/40" />
                    ) : (
                      <ChevronRight className="h-6 w-6 shrink-0 text-white/60" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
