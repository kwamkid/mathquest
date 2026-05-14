// app/(game)/learn/page.tsx
//
// Curriculum learn landing — Udemy-style timeline of chapters & lessons.
// Completed lessons show a strikethrough, the next lesson is highlighted as
// "Continue", and locked lessons are dimmed.

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import LearnTopBar from '@/components/lesson/LearnTopBar';
import { families } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import {
  findContinueLesson,
  getSubTopicProgress,
  isLessonCompleted,
  isSubTopicUnlocked,
  lessonStarsEarned,
} from '@/lib/curricula/progress-helpers';
import { useAuth } from '@/lib/contexts/AuthContext';
import type {
  CurriculumFamily,
  CurriculumFamilyGrade,
  Lesson,
  SubTopic,
  Topic,
} from '@/types/curriculum';
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Lock,
  PlayCircle,
  Star,
} from 'lucide-react';

export default function LearnHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showFamilies, setShowFamilies] = useState(false);

  const active = useMemo(() => {
    if (!user?.curriculumProgress) return null;
    const ids = Object.keys(user.curriculumProgress);
    if (ids.length === 0) return null;
    const preferredId = user.currentCurriculumId ?? ids[0];
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
        {user && <LearnTopBar user={user} />}
        <div className="p-4 sm:p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <header>
              <h1 className="text-3xl font-bold text-white">เรียนคณิตศาสตร์</h1>
              <p className="mt-1 text-base text-white/70">
                {active ? 'ยินดีต้อนรับกลับมา' : 'เลือกหลักสูตร'}
              </p>
            </header>

            {active && !showFamilies && (
              <CurriculumTimeline
                family={active.family}
                grade={active.grade}
                curriculum={active.curriculum}
                progress={active.progress}
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

// ---------------------------------------------------------------------------
// CurriculumTimeline — Udemy-style flat timeline of chapters & lessons.
// ---------------------------------------------------------------------------

interface CurriculumTimelineProps {
  family: CurriculumFamily;
  grade: CurriculumFamilyGrade;
  curriculum: ReturnType<typeof getCurriculum> extends infer T
    ? T extends null
      ? never
      : NonNullable<T>
    : never;
  progress: NonNullable<NonNullable<ReturnType<typeof useAuth>['user']>['curriculumProgress']>[string];
  continueLessonId: string | null;
  onContinue: () => void;
  buildLessonHref: (topic: Topic, subTopic: SubTopic, lesson: Lesson) => string;
}

function CurriculumTimeline({
  family,
  grade,
  curriculum,
  progress,
  continueLessonId,
  onContinue,
  buildLessonHref,
}: CurriculumTimelineProps) {
  const totalLessons = curriculum.topics.reduce(
    (sum, t) => sum + t.subTopics.reduce((s, st) => s + st.lessons.length, 0),
    0,
  );
  const completedCount = progress?.completedLessonIds.length ?? 0;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header card: curriculum name + progress bar + Continue CTA */}
      <div className="learn-card rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
              หลักสูตรของคุณ
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              {family.thaiName ?? family.name} · {grade.label}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{pct}%</p>
            <p className="text-xs text-white/60">
              {completedCount}/{totalLessons} บทเรียน
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-metaverse-purple to-metaverse-pink"
            style={{ width: `${pct}%` }}
          />
        </div>

        {continueLessonId && (
          <button
            onClick={onContinue}
            className="learn-accent-pill mt-4 flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left shadow-lg shadow-pink-500/20 transition hover:brightness-110 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <PlayCircle className="h-6 w-6 shrink-0" />
              <span className="text-sm font-bold">เรียนต่อจากที่ค้างไว้</span>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0" />
          </button>
        )}
      </div>

      {/* Timeline: topics → chapters → lessons */}
      <div className="space-y-6">
        {curriculum.topics.map((topic) => (
          <TopicTimeline
            key={topic.id}
            topic={topic}
            progress={progress}
            continueLessonId={continueLessonId}
            buildLessonHref={buildLessonHref}
          />
        ))}
      </div>
    </div>
  );
}

interface TopicTimelineProps {
  topic: Topic;
  progress: CurriculumTimelineProps['progress'];
  continueLessonId: string | null;
  buildLessonHref: CurriculumTimelineProps['buildLessonHref'];
}

function TopicTimeline({
  topic,
  progress,
  continueLessonId,
  buildLessonHref,
}: TopicTimelineProps) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-lg font-bold text-white">
        {topic.icon && <span className="text-2xl">{topic.icon}</span>}
        <span>{topic.thaiTitle ?? topic.title}</span>
      </h3>

      <div className="space-y-3">
        {topic.subTopics.map((subTopic) => (
          <ChapterTimeline
            key={subTopic.id}
            topic={topic}
            subTopic={subTopic}
            progress={progress}
            continueLessonId={continueLessonId}
            buildLessonHref={buildLessonHref}
          />
        ))}
      </div>
    </section>
  );
}

interface ChapterTimelineProps {
  topic: Topic;
  subTopic: SubTopic;
  progress: CurriculumTimelineProps['progress'];
  continueLessonId: string | null;
  buildLessonHref: CurriculumTimelineProps['buildLessonHref'];
}

function ChapterTimeline({
  topic,
  subTopic,
  progress,
  continueLessonId,
  buildLessonHref,
}: ChapterTimelineProps) {
  const chapterProgress = getSubTopicProgress(progress, subTopic);
  const unlocked = isSubTopicUnlocked(progress, subTopic);

  return (
    <div className="learn-card overflow-hidden rounded-2xl">
      {/* Chapter header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`truncate text-base font-bold ${
                chapterProgress.done ? 'text-white/60 line-through' : 'text-white'
              }`}
            >
              {subTopic.thaiTitle ?? subTopic.title}
            </h4>
            {!unlocked && <Lock className="h-4 w-4 shrink-0 text-white/40" />}
          </div>
          <p className="mt-0.5 text-xs text-white/50">
            {chapterProgress.completed}/{chapterProgress.total} บทเรียน
          </p>
        </div>
        {chapterProgress.done && (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
        )}
      </div>

      {/* Lesson list */}
      <ol className="divide-y divide-white/5">
        {subTopic.lessons.map((lesson, idx) => {
          const completed = isLessonCompleted(progress, lesson.id);
          const stars = lessonStarsEarned(progress, lesson.id);
          const isContinue = lesson.id === continueLessonId;
          const isLocked = !unlocked;
          const isLast = idx === subTopic.lessons.length - 1;

          return (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={idx + 1}
              completed={completed}
              stars={stars}
              isContinue={isContinue}
              isLocked={isLocked}
              isLast={isLast}
              href={buildLessonHref(topic, subTopic, lesson)}
            />
          );
        })}
      </ol>
    </div>
  );
}

interface LessonRowProps {
  lesson: Lesson;
  index: number;
  completed: boolean;
  stars: number;
  isContinue: boolean;
  isLocked: boolean;
  isLast: boolean;
  href: string;
}

function LessonRow({
  lesson,
  index,
  completed,
  stars,
  isContinue,
  isLocked,
  isLast,
  href,
}: LessonRowProps) {
  // Visual node on the left of each row — completed = green check,
  // continue = pulsing play, locked = lock, otherwise = empty circle.
  const node = isLocked ? (
    <Lock className="h-5 w-5 text-white/30" />
  ) : completed ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
  ) : isContinue ? (
    <PlayCircle className="h-5 w-5 text-pink-300" />
  ) : (
    <Circle className="h-5 w-5 text-white/40" />
  );

  const titleClass = completed
    ? 'text-white/55 line-through'
    : isLocked
      ? 'text-white/40'
      : isContinue
        ? 'text-white font-bold'
        : 'text-white';

  const rowClass = `relative flex items-center gap-3 px-4 py-3 transition ${
    isLocked
      ? 'cursor-not-allowed'
      : 'hover:bg-white/[0.03] active:bg-white/[0.06]'
  } ${isContinue ? 'bg-pink-500/[0.08]' : ''}`;

  const content = (
    <>
      {/* Timeline rail (vertical line + node) */}
      <div className="relative flex w-6 shrink-0 items-center justify-center self-stretch">
        {/* connecting line — drawn behind the node */}
        {!isLast && (
          <span className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 bg-white/10" />
        )}
        <span className="relative z-10 rounded-full bg-[var(--learn-card-bg,#1a0f2e)] p-0.5">
          {node}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/40">{index}.</span>
          <h5 className={`truncate text-sm sm:text-base ${titleClass}`}>
            {lesson.title}
          </h5>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
          <span>{lesson.estimatedMinutes} นาที</span>
          {completed && stars > 0 && (
            <span className="flex items-center gap-0.5 text-amber-300">
              {Array.from({ length: stars }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
            </span>
          )}
          {isContinue && (
            <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pink-200">
              เรียนต่อ
            </span>
          )}
        </div>
      </div>

      {!isLocked && <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />}
    </>
  );

  if (isLocked) {
    return <li className={rowClass}>{content}</li>;
  }

  return (
    <li>
      <Link href={href} className={rowClass}>
        {content}
      </Link>
    </li>
  );
}
