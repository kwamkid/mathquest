// app/(game)/learn/[familyKey]/[gradeKey]/topic/[topicSlug]/chapter/[subTopicSlug]/page.tsx
//
// Sub-topic detail — lesson timeline.
// Layout:
//   1. Continue / Next CTA (the one thing the learner should do right now)
//   2. Numbered lesson list (📚, dimmed when complete)
//   3. Final quiz levels (🏆, cascade-unlocked: L1 needs lessons done,
//      L2 needs L1 done, …)
//
// Mini quizzes are no longer separate items — they're folded into each
// lesson as its final independent-practice step.

'use client';

import { useParams } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import LearnBreadcrumb from '@/components/lesson/LearnBreadcrumb';
import {
  ContinueCard,
  LessonListItem,
  QuizLevelItem,
} from '@/components/lesson/ChapterTimeline';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getFamilyGrade } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import {
  getLessonRewardPreview,
  getSubTopicProgress,
  isLessonCompleted,
  lessonStarsEarned,
} from '@/lib/curricula/progress-helpers';
import { BookOpen, Trophy } from 'lucide-react';
import type { Lesson } from '@/types/curriculum';

export default function SubTopicPage() {
  const params = useParams();
  const { user } = useAuth();
  const familyKey = String(params.familyKey);
  const gradeKey = String(params.gradeKey);
  const topicSlug = String(params.topicSlug);
  const subTopicSlug = String(params.subTopicSlug);

  const resolved = getFamilyGrade(familyKey, gradeKey);
  const curriculum = resolved?.grade.curriculumId
    ? getCurriculum(resolved.grade.curriculumId)
    : null;
  const topic = curriculum?.topics.find((t) => t.slug === topicSlug);
  const subTopic = topic?.subTopics.find((s) => s.slug === subTopicSlug);

  if (!resolved || !curriculum || !topic || !subTopic) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">ไม่พบบทเรียนนี้</p>
        </div>
      </AuthGuard>
    );
  }

  const { family, grade } = resolved;
  const progress = user?.curriculumProgress?.[curriculum.id];
  const sp = getSubTopicProgress(progress, subTopic, topic);
  const base = `/learn/${family.key}/${grade.key}/topic/${topic.slug}/chapter/${subTopic.slug}`;
  const hideGrade = !!family.skipGradePicker;

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
    // Walk quizzes; the first one not yet done is the next target.
    for (const q of quizzes) {
      if (!isLessonCompleted(progress, q.id)) {
        continueLesson = q;
        break;
      }
    }
  }

  // Cascade unlock: quiz N is unlocked iff (all teaching done) AND (quiz N-1 done).
  // Returns the index (0-based) of the first unlocked, undone quiz so we can
  // tag it "พร้อมเล่น" in the UI.
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

  // When the topic only has one chapter, the topic picker is skipped — so
  // showing "topic > chapter" in the breadcrumb would read like the same
  // page twice (e.g. "เปอร์เซ็นต์ > เปอร์เซ็นต์"). Collapse to the chapter
  // title alone in that case and use the chapter as the page heading.
  const collapseTopic = topic.subTopics.length === 1;
  const displayTitle = collapseTopic
    ? topic.thaiTitle ?? topic.title
    : subTopic.thaiTitle ?? subTopic.title;

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
              ...(collapseTopic
                ? []
                : [
                    {
                      label: topic.thaiTitle ?? topic.title,
                      href: `/learn/${family.key}/${grade.key}/topic/${topic.slug}`,
                    },
                  ]),
              { label: displayTitle },
            ]}
          />

          <header className="space-y-2">
            {/* Eyebrow only when there's something the breadcrumb + title
              * don't already say. For collapsed-topic pages (one chapter
              * only) the title is the topic itself — no eyebrow needed. */}
            {!collapseTopic && !hideGrade && (
              <p className="text-sm font-semibold uppercase tracking-wide text-pink-300">
                {`${grade.label} · ${topic.thaiTitle ?? topic.title}`}
              </p>
            )}
            <h1 className="text-3xl font-bold text-white">
              {topic.icon && (
                <span className="mr-2" aria-hidden="true">
                  {topic.icon}
                </span>
              )}
              {displayTitle}
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
            {sp.pct > 0 && (
              <div className="learn-accent-soft rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between text-sm font-semibold text-pink-100">
                  <span>
                    เรียนแล้ว {sp.completed} จาก {sp.total} บทเรียน
                  </span>
                  <span>{Math.round(sp.pct * 100)}%</span>
                </div>
                <div className="learn-progress-track mt-1 h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="learn-progress-fill h-full rounded-full transition-all"
                    style={{ width: `${Math.round(sp.pct * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </header>

          {continueLesson && (
            <ContinueCard
              href={`${base}/lesson/${continueLesson.id}`}
              title={continueLesson.title}
              label={continueLabel}
              // Surface reward only when "what's next" is a quiz — teaching
              // lessons already imply the standard 3-star payout and the
              // chip would feel like noise on every card.
              reward={
                continueLesson.kind === 'quiz'
                  ? (() => {
                      const r = getLessonRewardPreview(continueLesson);
                      return { stars: r.stars, exp: r.exp };
                    })()
                  : undefined
              }
            />
          )}

          {/* Teaching lessons (numbered timeline) */}
          {teaching.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <BookOpen className="h-5 w-5 text-pink-300" />
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
                      href={`${base}/lesson/${l.id}`}
                      completed={completed}
                      stars={lessonStarsEarned(progress, l.id)}
                      isContinue={l.id === continueLesson?.id}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Final quiz levels (cascade-unlock) */}
          {quizzes.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <Trophy className="h-5 w-5 text-amber-300" />
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
                      href={`${base}/lesson/${q.id}`}
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
      </div>
    </AuthGuard>
  );
}
