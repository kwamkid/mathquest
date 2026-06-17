// components/curriculum/ChapterPage.tsx
//
// Shared "chapter detail" template. Used by both /learn (school curricula
// like BNC) and /life-math (everyday-skills curriculum). The route file
// resolves the curriculum/topic/sub-topic and feeds them in; everything
// below — 2-col layout, progress strip, continue card, numbered lesson list,
// cascade-unlock final-quiz ladder — lives here so changes ripple across
// every curriculum at once.
//
// Routes pass in `urlPrefix` (the URL up to and including this chapter) so
// internal links can stay namespaced — e.g. /learn/.../chapter/percentages
// vs /life-math/percentages — without this component caring about which.

'use client';

import { BookOpen, Trophy } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import LearnBreadcrumb, {
  BreadcrumbItem,
} from '@/components/lesson/LearnBreadcrumb';
import TopicIcon from '@/components/lesson/TopicIcon';
import {
  ContinueCard,
  LessonListItem,
  QuizLevelItem,
} from '@/components/lesson/ChapterTimeline';
import {
  getLessonRewardPreview,
  getSubTopicProgress,
  isLessonCompleted,
  lessonStarsEarned,
} from '@/lib/curricula/progress-helpers';
import type {
  CurriculumProgress,
  Lesson,
  SubTopic,
  Topic,
} from '@/types/curriculum';
import type { User } from '@/types';

interface Props {
  user: User | null;
  topic: Topic;
  subTopic: SubTopic;
  progress: CurriculumProgress | undefined;
  // Base URL for child lessons — appended with `/lesson/{id}`. Lets the
  // template stay namespace-agnostic between /learn/... and /life-math/...
  chapterUrl: string;
  // Breadcrumb items rendered above the hero. Empty array hides it.
  breadcrumb: BreadcrumbItem[];
  // Optional eyebrow above the title (e.g. "Year 3 · เศษส่วน"). Falls back
  // to nothing when the topic-level chrome would be redundant.
  eyebrow?: string;
  // If true, the topic name becomes the chapter title (used when a topic has
  // only one chapter, where echoing "topic > chapter" would just repeat).
  collapseTopicTitle?: boolean;
}

export default function ChapterPage({
  user,
  topic,
  subTopic,
  progress,
  chapterUrl,
  breadcrumb,
  eyebrow,
  collapseTopicTitle = false,
}: Props) {
  const sp = getSubTopicProgress(progress, subTopic, topic);

  // Split lessons by kind. Within each bucket, order by `order`.
  const sortedLessons = [...subTopic.lessons].sort((a, b) => a.order - b.order);
  const teaching: Lesson[] = sortedLessons.filter(
    (l) => (l.kind ?? 'lesson') === 'lesson',
  );
  const quizzes: Lesson[] = sortedLessons.filter((l) => l.kind === 'quiz');

  const allTeachingDone =
    teaching.length > 0 &&
    teaching.every((l) => isLessonCompleted(progress, l.id));

  // Continue target: first unfinished teaching lesson, else first unlocked
  // unfinished quiz.
  const firstUnfinishedLesson = teaching.find(
    (l) => !isLessonCompleted(progress, l.id),
  );
  let continueLesson: Lesson | null = firstUnfinishedLesson ?? null;
  if (!continueLesson && allTeachingDone) {
    for (const q of quizzes) {
      if (!isLessonCompleted(progress, q.id)) {
        continueLesson = q;
        break;
      }
    }
  }

  // Cascade unlock for quizzes — Level N is unlocked iff all teaching is
  // done AND Level N-1 is done. Returns the index (0-based) of the first
  // unlocked, undone quiz so the UI can tag it "พร้อมเล่น".
  const nextQuizIdx = (() => {
    if (!allTeachingDone) return -1;
    for (let i = 0; i < quizzes.length; i++) {
      const prevDone =
        i === 0 ? true : isLessonCompleted(progress, quizzes[i - 1].id);
      if (prevDone && !isLessonCompleted(progress, quizzes[i].id)) return i;
    }
    return -1;
  })();

  const continueLabel =
    sp.completed === 0
      ? 'เริ่มเรียน'
      : continueLesson?.kind === 'quiz'
        ? 'ลุย Final Quiz'
        : 'เรียนต่อ';

  const displayTitle = collapseTopicTitle
    ? topic.thaiTitle ?? topic.title
    : subTopic.thaiTitle ?? subTopic.title;

  // Compact progress strip + Continue CTA share one row on >=md.
  const progressStrip = sp.pct > 0 && (
    <div className="learn-accent-soft rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between text-sm font-semibold text-pink-100">
        <span>
          {sp.completed} / {sp.total} บทเรียน
        </span>
        <span>{Math.round(sp.pct * 100)}%</span>
      </div>
      <div className="learn-progress-track mt-1.5 h-2 w-full overflow-hidden rounded-full">
        <div
          className="learn-progress-fill h-full rounded-full transition-all"
          style={{ width: `${Math.round(sp.pct * 100)}%` }}
        />
      </div>
    </div>
  );

  const continueCard = continueLesson && (
    <ContinueCard
      href={`${chapterUrl}/lesson/${continueLesson.id}`}
      title={continueLesson.title}
      label={continueLabel}
      reward={
        continueLesson.kind === 'quiz'
          ? (() => {
              const r = getLessonRewardPreview(continueLesson);
              return { stars: r.stars, exp: r.exp };
            })()
          : undefined
      }
    />
  );

  const hero = (
    <div className="space-y-4">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-pink-300">
          {eyebrow}
        </p>
      )}
      <h1 className="flex items-center gap-3 text-3xl font-bold text-white lg:text-4xl">
        <TopicIcon
          topic={topic}
          className="h-9 w-9 shrink-0 text-pink-300 lg:h-10 lg:w-10"
          emojiClassName="text-3xl leading-none"
        />
        <span>{displayTitle}</span>
      </h1>
      <p className="text-base text-white/70">{subTopic.description}</p>
      {subTopic.learningObjectives.length > 0 && (
        <div className="learn-card rounded-2xl p-4">
          <p className="text-sm font-bold text-white">เป้าหมายของบทนี้</p>
          <ul className="mt-2 space-y-1 text-sm text-white/80">
            {subTopic.learningObjectives.map((obj, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-pink-300">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const lessonsColumn = (
    <div className="space-y-6">
      {(progressStrip || continueCard) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[4fr_1fr] md:items-stretch">
          {progressStrip}
          {continueCard}
        </div>
      )}

      {teaching.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white sm:text-2xl">
            <BookOpen className="h-6 w-6 text-pink-300 sm:h-7 sm:w-7" />
            บทเรียน
          </h2>
          <div className="space-y-3">
            {teaching.map((l, idx) => {
              const completed = isLessonCompleted(progress, l.id);
              return (
                <LessonListItem
                  key={l.id}
                  lesson={l}
                  number={idx + 1}
                  href={`${chapterUrl}/lesson/${l.id}`}
                  completed={completed}
                  stars={lessonStarsEarned(progress, l.id)}
                  isContinue={l.id === continueLesson?.id}
                />
              );
            })}
          </div>
        </section>
      )}

      {quizzes.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex flex-wrap items-center gap-2 text-xl font-bold text-white sm:text-2xl">
            <Trophy className="h-6 w-6 text-amber-300 sm:h-7 sm:w-7" />
            Final Quiz · {quizzes.length} Level
            {!allTeachingDone && (
              <span className="ml-2 text-xs font-normal text-white/50">
                (ต้องเรียนจบทุกบทก่อน)
              </span>
            )}
          </h2>
          <div className="space-y-3">
            {quizzes.map((q, idx) => {
              const completed = isLessonCompleted(progress, q.id);
              const prevDone =
                idx === 0
                  ? allTeachingDone
                  : isLessonCompleted(progress, quizzes[idx - 1].id) &&
                    allTeachingDone;
              return (
                <QuizLevelItem
                  key={q.id}
                  lesson={q}
                  level={idx + 1}
                  href={`${chapterUrl}/lesson/${q.id}`}
                  completed={completed}
                  stars={lessonStarsEarned(progress, q.id)}
                  unlocked={prevDone}
                  isNext={idx === nextQuizIdx}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );

  return (
    <div className="learn-bg min-h-screen">
      {user && <AppHeader user={user} />}
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
        {breadcrumb.length > 0 && <LearnBreadcrumb items={breadcrumb} />}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-20 lg:self-start">{hero}</aside>
          {lessonsColumn}
        </div>
      </div>
    </div>
  );
}
