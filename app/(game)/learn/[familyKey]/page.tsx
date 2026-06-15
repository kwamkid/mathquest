// app/(game)/learn/[familyKey]/page.tsx
//
// Grade picker — Year 1 / Year 2 / ... within one curriculum family.

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import LearnBreadcrumb from '@/components/lesson/LearnBreadcrumb';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getFamily } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import { getTopicProgress } from '@/lib/curricula/progress-helpers';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function GradePickerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const familyKey = String(params.familyKey);
  const family = getFamily(familyKey);

  // Families that don't have grade levels (e.g. Life Math) skip this picker
  // and go straight to the topic list of their first playable grade.
  const playableGrade = family?.grades.find((g) => !!g.curriculumId);
  const shouldSkip = !!(family?.skipGradePicker && playableGrade);

  useEffect(() => {
    if (shouldSkip && playableGrade) {
      router.replace(`/learn/${familyKey}/${playableGrade.key}`);
    }
  }, [shouldSkip, playableGrade, familyKey, router]);

  if (!family) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">ไม่พบหลักสูตรนี้</p>
        </div>
      </AuthGuard>
    );
  }

  if (shouldSkip) {
    // Render nothing while the redirect kicks in — saves a layout flash.
    return null;
  }

  const summariseGrade = (curriculumId: string) => {
    const curriculum = getCurriculum(curriculumId);
    if (!curriculum) return { total: 0, completed: 0, hasContent: false };
    const progress = user?.curriculumProgress?.[curriculumId];
    let total = 0;
    let completed = 0;
    curriculum.topics.forEach((t) => {
      const tp = getTopicProgress(progress, t);
      total += tp.total;
      completed += tp.completed;
    });
    return { total, completed, hasContent: total > 0 };
  };

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="mx-auto max-w-3xl space-y-6 px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
          <LearnBreadcrumb
            items={[{ label: family.thaiName ?? family.name }]}
          />

          <header className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-4xl leading-none" aria-hidden="true">
                {family.flag ?? '📘'}
              </span>
              <h1 className="text-3xl font-bold text-white">
                {family.thaiName ?? family.name}
              </h1>
            </div>
            <p className="text-base text-white/70">{family.description}</p>
            <p className="text-sm font-semibold text-white/50">เลือกระดับชั้น</p>
          </header>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {family.grades.map((g) => {
              const playable = !!g.curriculumId;
              const summary = playable
                ? summariseGrade(g.curriculumId!)
                : { total: 0, completed: 0, hasContent: false };
              const done = summary.hasContent && summary.completed === summary.total;
              return (
                <Link
                  key={g.key}
                  href={playable ? `/learn/${family.key}/${g.key}` : '#'}
                  aria-disabled={!playable}
                  className={`flex min-h-[130px] flex-col justify-between rounded-2xl p-4 ${
                    playable ? 'learn-card' : 'learn-card-locked pointer-events-none'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white">{g.label}</h2>
                      {!playable && <Lock className="h-4 w-4 text-white/40" />}
                      {done && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-label="เรียนจบ" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-white/50">{g.ageRange}</p>
                  </div>
                  {!playable ? (
                    <p className="mt-2 text-xs font-semibold text-amber-300">เร็วๆ นี้</p>
                  ) : summary.hasContent ? (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-white/70">
                        {summary.completed}/{summary.total} บทเรียน
                      </p>
                      {summary.completed > 0 && (
                        <div className="learn-progress-track h-1.5 w-full overflow-hidden rounded-full">
                          <div
                            className="learn-progress-fill h-full rounded-full"
                            style={{
                              width: `${Math.round((summary.completed / summary.total) * 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-white/60">เริ่มเรียนเลย</p>
                  )}
                </Link>
              );
            })}
        </div>
        </div>
      </div>
    </AuthGuard>
  );
}
