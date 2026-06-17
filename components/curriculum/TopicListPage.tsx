// components/curriculum/TopicListPage.tsx
//
// Shared "pick a topic" template. Used by /life-math (and reusable for any
// future single-grade-style curriculum). Renders a hero (curriculum name +
// description) and a grid of topic cards with per-topic progress chips.
//
// The route passes `buildTopicHref(topic)` so URLs stay namespace-agnostic
// — e.g. /life-math/percentages vs /learn/.../topic/percentages.

'use client';

import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import LearnBreadcrumb, {
  BreadcrumbItem,
} from '@/components/lesson/LearnBreadcrumb';
import TopicIcon from '@/components/lesson/TopicIcon';
import { getTopicProgress } from '@/lib/curricula/progress-helpers';
import type { Curriculum, CurriculumProgress, Topic } from '@/types/curriculum';
import type { User } from '@/types';

interface Props {
  user: User | null;
  curriculum: Curriculum;
  progress: CurriculumProgress | undefined;
  // Heading shown above the topic grid. Falls back to curriculum.name.
  title?: string;
  // Lead paragraph under the title. Falls back to curriculum.description.
  description?: string;
  // Optional icon next to the title (e.g. family flag).
  titleIcon?: string;
  // Returns the URL for the given topic. Pages that want a "skip topic
  // picker" experience can route to /chapter/... directly.
  buildTopicHref: (topic: Topic) => string;
  // Optional breadcrumb above the hero. Empty/undefined hides it.
  breadcrumb?: BreadcrumbItem[];
}

export default function TopicListPage({
  user,
  curriculum,
  progress,
  title,
  description,
  titleIcon,
  buildTopicHref,
  breadcrumb,
}: Props) {
  const sortedTopics = [...curriculum.topics].sort((a, b) => a.order - b.order);
  const headingTitle = title ?? curriculum.name;
  const headingBody = description ?? curriculum.description;

  return (
    <div className="learn-bg min-h-screen">
      {user && <AppHeader user={user} />}
      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
        {breadcrumb && breadcrumb.length > 0 && (
          <LearnBreadcrumb items={breadcrumb} />
        )}

        <header className="space-y-2">
          <div className="flex items-center gap-3">
            {titleIcon && (
              <span className="text-4xl leading-none" aria-hidden="true">
                {titleIcon}
              </span>
            )}
            <h1 className="text-3xl font-bold text-white">{headingTitle}</h1>
          </div>
          <p className="text-base text-white/70">{headingBody}</p>
          <p className="text-sm font-semibold text-white/50">
            เลือกหัวข้อที่อยากเรียน
          </p>
        </header>

        <div className="space-y-3">
          {sortedTopics.map((t) => {
            const tp = getTopicProgress(progress, t);
            const hasContent = t.subTopics.length > 0;
            const isDone = tp.done && tp.total > 0;
            return (
              <Link
                key={t.id}
                href={hasContent ? buildTopicHref(t) : '#'}
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
                  <TopicIcon
                    topic={t}
                    className="mt-1 h-8 w-8 shrink-0 text-pink-300"
                    emojiClassName="text-3xl leading-none"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {t.thaiTitle ?? t.title}
                    </h2>
                    <p className="mt-0.5 text-sm text-white/70">
                      {t.description}
                    </p>
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
                      <div className="learn-progress-track mt-2 h-1.5 w-full max-w-[10rem] overflow-hidden rounded-full">
                        <div
                          className="learn-progress-fill h-full rounded-full"
                          style={{ width: `${Math.round(tp.pct * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {isDone ? (
                  <CheckCircle2
                    className="h-10 w-10 shrink-0 text-emerald-400"
                    aria-label="เรียนจบ"
                  />
                ) : (
                  <ChevronRight className="h-6 w-6 shrink-0 text-white/60" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
