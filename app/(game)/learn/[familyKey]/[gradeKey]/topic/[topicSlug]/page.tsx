// app/(game)/learn/[familyKey]/[gradeKey]/topic/[topicSlug]/page.tsx
//
// Chapter list for a topic.

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import LearnBreadcrumb from '@/components/lesson/LearnBreadcrumb';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getFamilyGrade } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import {
  getSubTopicProgress,
  isSubTopicUnlocked,
} from '@/lib/curricula/progress-helpers';
import { ChevronRight, CheckCircle2, Lock } from 'lucide-react';

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const familyKey = String(params.familyKey);
  const gradeKey = String(params.gradeKey);
  const topicSlug = String(params.topicSlug);

  const resolved = getFamilyGrade(familyKey, gradeKey);
  const curriculum = resolved?.grade.curriculumId
    ? getCurriculum(resolved.grade.curriculumId)
    : null;
  const topic = curriculum?.topics.find((t) => t.slug === topicSlug);

  // Skip the chapter picker entirely when a topic has only one chapter —
  // there's nothing to pick, so we'd just be making the learner take an
  // extra tap through an empty list.
  const onlyChapter =
    topic && topic.subTopics.length === 1 ? topic.subTopics[0] : null;
  const shouldSkip = !!(resolved && curriculum && topic && onlyChapter);

  useEffect(() => {
    if (shouldSkip && onlyChapter && resolved && topic) {
      router.replace(
        `/learn/${familyKey}/${gradeKey}/topic/${topic.slug}/chapter/${onlyChapter.slug}`,
      );
    }
  }, [shouldSkip, onlyChapter, resolved, topic, familyKey, gradeKey, router]);

  if (!resolved || !curriculum || !topic) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">ไม่พบหัวข้อนี้</p>
        </div>
      </AuthGuard>
    );
  }

  if (shouldSkip) {
    // Render nothing while the redirect kicks in — avoids a layout flash.
    return null;
  }

  const { family, grade } = resolved;
  const progress = user?.curriculumProgress?.[curriculum.id];
  const sorted = [...topic.subTopics].sort((a, b) => a.order - b.order);
  const hideGrade = !!family.skipGradePicker;

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="mx-auto max-w-3xl space-y-6 px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
          <LearnBreadcrumb
            items={[
              {
                label: family.thaiName ?? family.name,
                href: `/learn/${family.key}/${grade.key}`,
              },
              ...(hideGrade
                ? []
                : [
                    {
                      label: grade.label,
                      href: `/learn/${family.key}/${grade.key}`,
                    },
                  ]),
              { label: topic.thaiTitle ?? topic.title },
            ]}
          />
          <header className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-pink-300">
              {hideGrade ? (family.thaiName ?? family.name) : grade.label}
            </p>
            <h1 className="text-3xl font-bold text-white">
              <span className="mr-2" aria-hidden="true">{topic.icon ?? '📘'}</span>
              {topic.thaiTitle ?? topic.title}
            </h1>
            <p className="text-base text-white/70">{topic.description}</p>
          </header>

          <div className="space-y-3">
            {sorted.map((st, i) => {
              const unlocked = isSubTopicUnlocked(progress, st, topic);
              const sp = getSubTopicProgress(progress, st, topic);
              const isDone = sp.done && sp.total > 0;
              return (
                <Link
                  key={st.id}
                  href={
                    unlocked
                      ? `/learn/${family.key}/${grade.key}/topic/${topic.slug}/chapter/${st.slug}`
                      : '#'
                  }
                  aria-disabled={!unlocked}
                  className={`flex items-center justify-between gap-3 rounded-2xl p-4 ${
                    !unlocked
                      ? 'learn-card-locked pointer-events-none'
                      : isDone
                        ? 'learn-card-done'
                        : 'learn-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-pink-500/15 text-pink-300'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                        บทที่ {i + 1}
                      </p>
                      <h2 className="mt-0.5 text-lg font-bold text-white">
                        {st.thaiTitle ?? st.title}
                      </h2>
                      <p className="mt-1 text-sm text-white/70">{st.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/60">
                        <span>⏱ {st.estimatedTotalMinutes} นาที</span>
                        <span>{st.lessons.length} บทเรียน</span>
                        {sp.completed > 0 && (
                          <span>{sp.completed}/{sp.total} เรียนแล้ว</span>
                        )}
                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" /> ผ่าน
                          </span>
                        )}
                      </div>
                      {sp.pct > 0 && !isDone && (
                        <div className="learn-progress-track mt-2 h-1.5 w-full max-w-[10rem] overflow-hidden rounded-full">
                          <div
                            className="learn-progress-fill h-full rounded-full"
                            style={{ width: `${Math.round(sp.pct * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {!unlocked ? (
                    <Lock className="h-5 w-5 shrink-0 text-white/40" />
                  ) : isDone ? (
                    <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-400" aria-label="เรียนจบ" />
                  ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-white/60" />
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
