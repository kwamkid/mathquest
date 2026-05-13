// app/(game)/learn/page.tsx
//
// Curriculum-family picker — top of the learn flow.
// Dark metaverse theme to match the rest of the app.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import LearnTopBar from '@/components/lesson/LearnTopBar';
import { families } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import { findContinueLesson } from '@/lib/curricula/progress-helpers';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ChevronRight, PlayCircle, Lock } from 'lucide-react';

export default function LearnHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  // When the learner has continue-progress, the curriculum cards are hidden by
  // default — they can reopen them with a small link.
  const [showFamilies, setShowFamilies] = useState(false);

  const continueTarget = (() => {
    if (!user?.curriculumProgress) return null;
    const ids = Object.keys(user.curriculumProgress);
    if (ids.length === 0) return null;
    const preferredId = user.currentCurriculumId ?? ids[0];
    const c = getCurriculum(preferredId);
    if (!c) return null;
    const cont = findContinueLesson(c, user.curriculumProgress[preferredId]);
    if (!cont) return null;
    for (const family of families) {
      const grade = family.grades.find((g) => g.curriculumId === preferredId);
      if (grade) return { family, grade, curriculum: c, ...cont };
    }
    return null;
  })();

  // Show the picker when there is no continue-progress, or when the user
  // explicitly asked to switch curricula.
  const familiesVisible = !continueTarget || showFamilies;

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && <LearnTopBar user={user} />}
        <div className="p-4 sm:p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <header>
              <h1 className="text-3xl font-bold text-white">เรียนคณิตศาสตร์</h1>
              <p className="mt-1 text-base text-white/70">
                {continueTarget ? 'ยินดีต้อนรับกลับมา' : 'เลือกหลักสูตร'}
              </p>
            </header>

            {continueTarget && (
              <button
                onClick={() =>
                  router.push(
                    `/learn/${continueTarget.family.key}/${continueTarget.grade.key}/topic/${continueTarget.topic.slug}/chapter/${continueTarget.subTopic.slug}/lesson/${continueTarget.lesson.id}`,
                  )
                }
                className="learn-accent-pill flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left shadow-lg shadow-pink-500/20 transition hover:brightness-110 active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <PlayCircle className="mt-1 h-6 w-6 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                      เรียนต่อจากที่ค้างไว้
                    </p>
                    <p className="mt-0.5 text-base font-bold">
                      {continueTarget.lesson.title}
                    </p>
                    <p className="text-sm text-white/80">
                      {continueTarget.family.thaiName ?? continueTarget.family.name} ·{' '}
                      {continueTarget.grade.label} ·{' '}
                      {continueTarget.subTopic.thaiTitle ?? continueTarget.subTopic.title}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 shrink-0" />
              </button>
            )}

            {continueTarget && !showFamilies && (
              <button
                onClick={() => setShowFamilies(true)}
                className="text-sm text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
              >
                เลือกหลักสูตรอื่น
              </button>
            )}

            {familiesVisible && (
              <div className="space-y-3">
                {continueTarget && (
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
