// app/(game)/life-math/[topicSlug]/page.tsx
//
// Topic page for Life Math — currently every topic has one sub-topic, so
// this page just redirects to it. Kept as a real route so future topics
// with multiple chapters slot in without a URL break.

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import LearnBreadcrumb from '@/components/lesson/LearnBreadcrumb';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getCurriculum } from '@/lib/curricula';
import {
  getSubTopicProgress,
  isSubTopicUnlocked,
} from '@/lib/curricula/progress-helpers';
import { CheckCircle2, ChevronRight, Lock } from 'lucide-react';

const CURRICULUM_ID = 'life-math-beginner';

export default function LifeMathTopicPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const topicSlug = String(params.topicSlug);

  const curriculum = getCurriculum(CURRICULUM_ID);
  const topic = curriculum?.topics.find((t) => t.slug === topicSlug);

  // Auto-skip the picker when the topic has exactly one chapter — there's
  // nothing to choose between, so don't make the user tap through.
  const onlyChapter =
    topic && topic.subTopics.length === 1 ? topic.subTopics[0] : null;
  const shouldSkip = !!(curriculum && topic && onlyChapter);

  useEffect(() => {
    if (shouldSkip && onlyChapter && topic) {
      router.replace(`/life-math/${topic.slug}/${onlyChapter.slug}`);
    }
  }, [shouldSkip, onlyChapter, topic, router]);

  if (!curriculum || !topic) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">ไม่พบหัวข้อนี้</p>
        </div>
      </AuthGuard>
    );
  }

  if (shouldSkip) {
    return null;
  }

  const progress = user?.curriculumProgress?.[curriculum.id];
  const sorted = [...topic.subTopics].sort((a, b) => a.order - b.order);

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="mx-auto max-w-3xl space-y-6 px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
          <LearnBreadcrumb
            items={[
              { label: 'Life Math', href: '/life-math' },
              { label: topic.thaiTitle ?? topic.title },
            ]}
          />
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
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
                  href={unlocked ? `/life-math/${topic.slug}/${st.slug}` : '#'}
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
                    </div>
                  </div>
                  {!unlocked ? (
                    <Lock className="h-5 w-5 shrink-0 text-white/40" />
                  ) : isDone ? (
                    <CheckCircle2
                      className="h-10 w-10 shrink-0 text-emerald-400"
                      aria-label="เรียนจบ"
                    />
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
