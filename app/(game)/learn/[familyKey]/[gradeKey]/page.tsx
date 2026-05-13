// app/(game)/learn/[familyKey]/[gradeKey]/page.tsx
//
// Topic grid for one grade within a family.

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import LearnTopBar from '@/components/lesson/LearnTopBar';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getFamilyGrade } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import { getTopicProgress } from '@/lib/curricula/progress-helpers';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function GradeTopicsPage() {
  const params = useParams();
  const { user } = useAuth();
  const familyKey = String(params.familyKey);
  const gradeKey = String(params.gradeKey);

  const resolved = getFamilyGrade(familyKey, gradeKey);
  const curriculum = resolved?.grade.curriculumId
    ? getCurriculum(resolved.grade.curriculumId)
    : null;

  if (!resolved || !curriculum) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">ยังไม่พร้อมใช้งาน</p>
        </div>
      </AuthGuard>
    );
  }

  const { family, grade } = resolved;
  const progress = user?.curriculumProgress?.[curriculum.id];
  const sortedTopics = [...curriculum.topics].sort((a, b) => a.order - b.order);

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && <LearnTopBar user={user} />}
        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
          <Link
            href={`/learn/${family.key}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/70 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            กลับไป {family.thaiName ?? family.name}
          </Link>

          <header className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-pink-300">
              {family.thaiName ?? family.name}
            </p>
            <h1 className="text-3xl font-bold text-white">{grade.label}</h1>
            <p className="text-base text-white/70">{curriculum.description}</p>
            <p className="text-sm font-semibold text-white/50">เลือกหัวข้อ</p>
          </header>

          <div className="space-y-3">
            {sortedTopics.map((t) => {
              const tp = getTopicProgress(progress, t);
              const hasContent = t.subTopics.length > 0;
              const isDone = tp.done && tp.total > 0;
              return (
                <Link
                  key={t.id}
                  href={`/learn/${family.key}/${grade.key}/topic/${t.slug}`}
                  aria-disabled={!hasContent}
                  className={`flex items-center justify-between gap-3 rounded-2xl p-5 ${
                    !hasContent
                      ? 'learn-card-locked pointer-events-none'
                      : isDone
                        ? 'learn-card-done'
                        : 'learn-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl leading-none" aria-hidden="true">
                      {t.icon ?? '📘'}
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {t.thaiTitle ?? t.title}
                      </h2>
                      <p className="mt-0.5 text-sm text-white/70">{t.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/60">
                        <span>{t.subTopics.length} บท</span>
                        {tp.total > 0 && (
                          <span>
                            {tp.completed}/{tp.total} บทเรียน
                          </span>
                        )}
                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" /> เรียนจบ
                          </span>
                        )}
                      </div>
                      {tp.total > 0 && tp.pct > 0 && !isDone && (
                        <div className="learn-progress-track mt-2 h-1.5 w-40 overflow-hidden rounded-full">
                          <div
                            className="learn-progress-fill h-full rounded-full"
                            style={{ width: `${Math.round(tp.pct * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-400" aria-label="เรียนจบ" />
                  ) : (
                    <ChevronRight className="h-6 w-6 shrink-0 text-white/60" />
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
