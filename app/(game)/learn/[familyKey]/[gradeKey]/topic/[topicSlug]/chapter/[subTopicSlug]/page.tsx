// app/(game)/learn/[familyKey]/[gradeKey]/topic/[topicSlug]/chapter/[subTopicSlug]/page.tsx
//
// Sub-topic detail — lesson list with strong "completed" affordances.
// Completed cards: green-tinted glass + big checkmark on the right.

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import LearnBreadcrumb from '@/components/lesson/LearnBreadcrumb';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getFamilyGrade } from '@/lib/curricula/families';
import { getCurriculum } from '@/lib/curricula';
import {
  getSubTopicProgress,
  isLessonCompleted,
  lessonStarsEarned,
} from '@/lib/curricula/progress-helpers';
import {
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Star,
  PlayCircle,
  Target,
  Trophy,
} from 'lucide-react';
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
  const sortedLessons = [...subTopic.lessons].sort((a, b) => a.order - b.order);
  const continueLesson = sp.nextLesson ?? sortedLessons[0];
  const base = `/learn/${family.key}/${grade.key}/topic/${topic.slug}/chapter/${subTopic.slug}`;

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="mx-auto max-w-3xl space-y-6 px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
          <LearnBreadcrumb
            items={[
              {
                label: family.thaiName ?? family.name,
                href: `/learn/${family.key}`,
              },
              {
                label: grade.label,
                href: `/learn/${family.key}/${grade.key}`,
              },
              {
                label: topic.thaiTitle ?? topic.title,
                href: `/learn/${family.key}/${grade.key}/topic/${topic.slug}`,
              },
              { label: subTopic.thaiTitle ?? subTopic.title },
            ]}
          />

          <header className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-pink-300">
              {grade.label} · {topic.thaiTitle ?? topic.title}
            </p>
            <h1 className="text-3xl font-bold text-white">
              {subTopic.thaiTitle ?? subTopic.title}
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

          {!sp.done && continueLesson && (
            <Link
              href={`${base}/lesson/${continueLesson.id}`}
              className="learn-accent-pill flex w-full items-center justify-between gap-3 rounded-2xl p-4 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <PlayCircle className="mt-1 h-6 w-6 shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                    {sp.completed === 0 ? 'เริ่มเรียน' : 'เรียนต่อ'}
                  </p>
                  <p className="mt-0.5 text-base font-bold">{continueLesson.title}</p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 shrink-0" />
            </Link>
          )}

          {(() => {
            // Bucket lessons by kind so each section shows up under its own
            // heading. Defaults to 'lesson' to keep older content backwards-
            // compatible (no `kind` field).
            const buckets = {
              lesson: [] as Lesson[],
              mini: [] as Lesson[],
              quiz: [] as Lesson[],
            };
            for (const l of sortedLessons) {
              const k = l.kind ?? 'lesson';
              buckets[k].push(l);
            }
            const renderRow = (lesson: Lesson) => {
              const done = isLessonCompleted(progress, lesson.id);
              const stars = lessonStarsEarned(progress, lesson.id);
              const kind = lesson.kind ?? 'lesson';
              const icon =
                kind === 'quiz' || lesson.isAssessment ? (
                  <Trophy className="mt-1 h-6 w-6 shrink-0 text-amber-300" />
                ) : kind === 'mini' ? (
                  <Target className="mt-1 h-6 w-6 shrink-0 text-cyan-300" />
                ) : (
                  <BookOpen
                    className={`mt-1 h-6 w-6 shrink-0 ${
                      done ? 'text-emerald-300' : 'text-pink-300'
                    }`}
                  />
                );
              return (
                <Link
                  key={lesson.id}
                  href={`${base}/lesson/${lesson.id}`}
                  className={`flex items-center justify-between gap-3 rounded-2xl p-4 ${
                    done ? 'learn-card-done' : 'learn-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {icon}
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
                        {kind === 'quiz'
                          ? 'Final Quiz'
                          : kind === 'mini'
                            ? 'ฝึก'
                            : `บทเรียน ${lesson.order}`}
                        {done && (
                          <span className="ml-2 text-emerald-300">· เรียนแล้ว</span>
                        )}
                      </span>
                      <h3 className="mt-0.5 text-base font-bold text-white">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="mt-0.5 text-sm text-white/70">
                          {lesson.description}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                        <span>⏱ {lesson.estimatedMinutes} นาที</span>
                        {stars > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-amber-300">
                            <Star className="h-3 w-3 fill-current" />
                            {stars}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {done ? (
                    <CheckCircle2
                      className="h-12 w-12 shrink-0 text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                      aria-label="เรียนแล้ว"
                    />
                  ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-white/60" />
                  )}
                </Link>
              );
            };

            return (
              <div className="space-y-6">
                {buckets.lesson.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="flex items-center gap-2 text-base font-bold text-white">
                      <BookOpen className="h-5 w-5 text-pink-300" />
                      บทเรียน
                    </h2>
                    {buckets.lesson.map(renderRow)}
                  </section>
                )}
                {buckets.mini.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="flex items-center gap-2 text-base font-bold text-white">
                      <Target className="h-5 w-5 text-cyan-300" />
                      ฝึกหลังเรียน
                    </h2>
                    {buckets.mini.map(renderRow)}
                  </section>
                )}
                {buckets.quiz.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="flex items-center gap-2 text-base font-bold text-white">
                      <Trophy className="h-5 w-5 text-amber-300" />
                      ทดสอบรวม
                    </h2>
                    {buckets.quiz.map(renderRow)}
                  </section>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </AuthGuard>
  );
}
