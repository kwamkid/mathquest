// components/curriculum/CurriculumTimeline.tsx
//
// Shared "Udemy-style" curriculum timeline: a stack of topics, each with
// collapsible chapters (accordions) that expand to a numbered lesson list.
// Used by BOTH the /learn landing (school curricula like BNC) and the
// /life-math landing — the route passes namespace-agnostic href builders so
// this component never cares which product it's rendering.
//
// Visual contract (kept in sync with ChapterPage's lesson rows):
//   - lesson numbers are big + emphasised so the sequence reads at a glance
//   - the "continue" lesson uses the full gradient pill (learn-accent-pill)
//     so the next thing to do pops, matching the Life Math chapter design.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopicIcon from '@/components/lesson/TopicIcon';
import CurriculumProgressHeader from '@/components/curriculum/CurriculumProgressHeader';
import {
  getSubTopicProgress,
  isLessonCompleted,
  isSubTopicUnlocked,
  lessonStarsEarned,
} from '@/lib/curricula/progress-helpers';
import type {
  Curriculum,
  CurriculumProgress,
  Lesson,
  SubTopic,
  Topic,
} from '@/types/curriculum';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lock,
  Star,
  Target,
  Trophy,
} from 'lucide-react';

interface Props {
  curriculum: Curriculum;
  progress: CurriculumProgress | undefined;
  // Heading shown in the header card (e.g. "BNC · Year 3" or "Life Math").
  heading: string;
  // The lesson the learner should resume; null when nothing's in progress.
  continueLessonId: string | null;
  // Tapping the top "Continue" CTA. Omit to hide the button.
  onContinue?: () => void;
  // Resolves a lesson's destination URL — keeps the timeline namespace-agnostic.
  buildLessonHref: (topic: Topic, subTopic: SubTopic, lesson: Lesson) => string;
  // Hide the per-topic <h3> headings — for single-topic curricula (e.g. the
  // timetable) where the page header already names the topic, so repeating it
  // above the accordions is just noise.
  hideTopicHeadings?: boolean;
}

export default function CurriculumTimeline({
  curriculum,
  progress,
  heading,
  continueLessonId,
  onContinue,
  buildLessonHref,
  hideTopicHeadings = false,
}: Props) {
  const totalLessons = curriculum.topics.reduce(
    (sum, t) => sum + t.subTopics.reduce((s, st) => s + st.lessons.length, 0),
    0,
  );
  const completedCount = progress?.completedLessonIds.length ?? 0;

  // Accordion is single-open: only one chapter expanded at a time. State lives
  // here (not per-chapter) so opening one collapses any other. Defaults to the
  // chapter that holds the continue lesson.
  const defaultOpenId =
    curriculum.topics
      .flatMap((t) => t.subTopics)
      .find((st) => st.lessons.some((l) => l.id === continueLessonId))?.id ??
    null;
  const [openChapterId, setOpenChapterId] = useState<string | null>(
    defaultOpenId,
  );
  const toggleChapter = (id: string) =>
    setOpenChapterId((cur) => (cur === id ? null : id));

  return (
    <div className="space-y-5">
      {/* Shared progress + continue strip — one row on md+. */}
      <CurriculumProgressHeader
        heading={heading}
        completedCount={completedCount}
        totalLessons={totalLessons}
        showContinue={!!continueLessonId}
        onContinue={onContinue}
      />

      {/* Timeline: topics → chapters → lessons */}
      <div className="space-y-6">
        {curriculum.topics.map((topic) => (
          <TopicTimeline
            key={topic.id}
            topic={topic}
            progress={progress}
            continueLessonId={continueLessonId}
            buildLessonHref={buildLessonHref}
            nothingStarted={completedCount === 0}
            openChapterId={openChapterId}
            onToggleChapter={toggleChapter}
            hideHeading={hideTopicHeadings}
          />
        ))}
      </div>
    </div>
  );
}

interface TopicTimelineProps {
  topic: Topic;
  progress: CurriculumProgress | undefined;
  continueLessonId: string | null;
  buildLessonHref: Props['buildLessonHref'];
  // True when no lesson in the whole curriculum is done yet — used so the
  // continue lesson reads "เริ่มเรียน" instead of "เรียนต่อ".
  nothingStarted: boolean;
  // Single-open accordion state, owned by CurriculumTimeline.
  openChapterId: string | null;
  onToggleChapter: (id: string) => void;
  // Force-hide this topic's heading (single-topic curricula).
  hideHeading?: boolean;
}

function TopicTimeline({
  topic,
  progress,
  continueLessonId,
  buildLessonHref,
  nothingStarted,
  openChapterId,
  onToggleChapter,
  hideHeading = false,
}: TopicTimelineProps) {
  const topicTitle = topic.thaiTitle ?? topic.title;

  // When a topic has a single chapter whose title matches the topic, the
  // "topic heading + accordion header" would just say the same thing twice.
  // In that case collapse to one level: drop the heading and let the chapter
  // header carry the topic icon instead.
  const onlySubTopic = topic.subTopics.length === 1 ? topic.subTopics[0] : null;
  const collapseHeading =
    !!onlySubTopic &&
    (onlySubTopic.thaiTitle ?? onlySubTopic.title) === topicTitle;

  const showHeading = !hideHeading && !collapseHeading;

  return (
    <section className="space-y-3">
      {showHeading && (
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          <TopicIcon
            topic={topic}
            className="h-6 w-6 text-pink-300"
            emojiClassName="text-2xl"
          />
          <span>{topicTitle}</span>
        </h3>
      )}

      <div className="space-y-3">
        {topic.subTopics.map((subTopic) => (
          <ChapterTimeline
            key={subTopic.id}
            topic={topic}
            subTopic={subTopic}
            progress={progress}
            continueLessonId={continueLessonId}
            buildLessonHref={buildLessonHref}
            showTopicIcon={collapseHeading}
            nothingStarted={nothingStarted}
            open={openChapterId === subTopic.id}
            onToggle={() => onToggleChapter(subTopic.id)}
          />
        ))}
      </div>
    </section>
  );
}

interface ChapterTimelineProps {
  topic: Topic;
  subTopic: SubTopic;
  progress: CurriculumProgress | undefined;
  continueLessonId: string | null;
  buildLessonHref: Props['buildLessonHref'];
  // When the parent collapsed the (redundant) topic heading, show the topic
  // icon in this chapter's header so the row still gets its visual anchor.
  showTopicIcon?: boolean;
  nothingStarted: boolean;
  // Single-open accordion: open/toggle are controlled by the parent.
  open: boolean;
  onToggle: () => void;
}

function ChapterTimeline({
  topic,
  subTopic,
  progress,
  continueLessonId,
  buildLessonHref,
  showTopicIcon = false,
  nothingStarted,
  open,
  onToggle,
}: ChapterTimelineProps) {
  const chapterProgress = getSubTopicProgress(progress, subTopic, topic);
  const unlocked = isSubTopicUnlocked(progress, subTopic, topic);

  // "กำลังเรียนอยู่" — this chapter holds the lesson the learner should resume.
  const isCurrent = subTopic.lessons.some((l) => l.id === continueLessonId);

  // Finished chapters get a green-tinted card so "done" reads at a glance;
  // locked chapters fade right back. Active chapters keep the default card.
  const wrapperClass = !unlocked
    ? 'learn-card opacity-40'
    : chapterProgress.done
      ? 'border border-emerald-400/30 bg-emerald-500/[0.07]'
      : 'learn-card';

  return (
    <div className={`overflow-hidden rounded-2xl ${wrapperClass}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {showTopicIcon && (
              <TopicIcon
                topic={topic}
                className="h-5 w-5 shrink-0 text-pink-300"
                emojiClassName="text-xl leading-none"
              />
            )}
            <h4
              className={`truncate text-base font-bold ${
                chapterProgress.done
                  ? 'text-white/50 line-through'
                  : !unlocked
                    ? 'text-white/50'
                    : 'text-white'
              }`}
            >
              {subTopic.thaiTitle ?? subTopic.title}
            </h4>
            {!unlocked && <Lock className="h-4 w-4 shrink-0 text-white/40" />}
            {isCurrent && !chapterProgress.done && (
              <span className="shrink-0 rounded-full bg-pink-500/25 px-2 py-0.5 text-[10px] font-bold text-pink-200">
                กำลังเรียนอยู่
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* Lesson count sits inline at the end of the row, before the chevron. */}
          <span className="text-xs text-white/45">
            {chapterProgress.done
              ? 'เรียนจบแล้ว'
              : `${chapterProgress.completed}/${chapterProgress.total} บทเรียน`}
          </span>
          {chapterProgress.done && (
            <CheckCircle2 className="h-5 w-5 text-emerald-400/70" />
          )}
          <ChevronDown
            className={`h-4 w-4 text-white/40 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {open && (
        <ol className="space-y-2 border-t border-white/10 p-3">
          {subTopic.lessons.map((lesson, idx) => {
            const completed = isLessonCompleted(progress, lesson.id);
            const stars = lessonStarsEarned(progress, lesson.id);
            const isContinue = lesson.id === continueLessonId;
            const isLocked = !unlocked;

            return (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                index={idx + 1}
                completed={completed}
                stars={stars}
                isContinue={isContinue}
                isStart={isContinue && nothingStarted}
                isLocked={isLocked}
                href={buildLessonHref(topic, subTopic, lesson)}
              />
            );
          })}
        </ol>
      )}
    </div>
  );
}

interface LessonRowProps {
  lesson: Lesson;
  index: number;
  completed: boolean;
  stars: number;
  isContinue: boolean;
  // True when this is the continue lesson AND nothing's been started yet, so
  // the badge reads "เริ่มเรียน" instead of "เรียนต่อ".
  isStart: boolean;
  isLocked: boolean;
  href: string;
}

function LessonRow({
  lesson,
  index,
  completed,
  stars,
  isContinue,
  isStart,
  isLocked,
  href,
}: LessonRowProps) {
  const kind = lesson.kind ?? 'lesson';

  const kindIcon =
    kind === 'mini' ? (
      <Target className="h-4 w-4 shrink-0 text-cyan-300" />
    ) : kind === 'quiz' ? (
      <Trophy className="h-4 w-4 shrink-0 text-amber-300" />
    ) : (
      <BookOpen className="h-4 w-4 shrink-0 text-white/50" />
    );

  // Big emphasised number box on the left — the focal point of each row.
  // Active = white-on-gradient (inherits pill bg), completed = green,
  // locked = faint, idle = subtle.
  const numberBox = isContinue
    ? 'bg-white/25 text-white'
    : completed
      ? 'bg-emerald-400/15 text-emerald-300'
      : isLocked
        ? 'bg-white/5 text-white/40'
        : 'bg-pink-500/15 text-pink-200';

  const titleClass = completed
    ? 'text-white/55 line-through'
    : isLocked
      ? 'text-white/40'
      : isContinue
        ? 'font-bold text-white'
        : 'text-white';

  // Active row = full gradient pill (matches the Life Math chapter design).
  // Completed rows get a green tint so "done" reads at a glance; quiz rows a
  // warm tint; locked rows the faintest. Idle rows stay neutral.
  const rowClass = isContinue
    ? 'learn-accent-pill flex items-center gap-3 rounded-2xl p-3 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]'
    : `flex items-center gap-3 rounded-2xl p-3 transition ${
        completed
          ? 'bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12]'
          : isLocked
            ? 'cursor-not-allowed bg-white/[0.02]'
            : kind === 'quiz'
              ? 'bg-amber-500/[0.06] hover:bg-amber-500/[0.1]'
              : 'bg-white/[0.03] hover:bg-white/[0.06]'
      }`;

  const kindBadge =
    kind === 'mini' ? (
      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
        ฝึก
      </span>
    ) : kind === 'quiz' ? (
      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
        QUIZ
      </span>
    ) : null;

  const metaTextClass = isContinue ? 'text-white/80' : 'text-white/50';

  const content = (
    <>
      {/* Big number */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-extrabold ${numberBox}`}
      >
        {isLocked ? <Lock className="h-5 w-5" /> : index}
      </div>

      {/* Title + kind icon/badge */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {kindIcon}
        <h5 className={`truncate text-sm sm:text-base ${titleClass}`}>
          {lesson.title}
        </h5>
        {kindBadge}
      </div>

      {/* Right side, all on one line: stars (done) · start/continue badge ·
        * minutes · chevron. */}
      {completed && stars > 0 && (
        <span className="flex shrink-0 items-center gap-0.5 text-amber-300">
          {Array.from({ length: stars }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-current" />
          ))}
        </span>
      )}

      {isContinue && (
        <span className="shrink-0 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {isStart ? 'เริ่มเรียน' : 'เรียนต่อ'}
        </span>
      )}

      <span className={`shrink-0 text-xs ${metaTextClass}`}>
        ⏱ {lesson.estimatedMinutes} นาที
      </span>

      {completed ? (
        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400/80" />
      ) : isLocked ? (
        <Lock className="h-5 w-5 shrink-0 text-white/30" />
      ) : (
        <ChevronRight
          className={`h-5 w-5 shrink-0 ${
            isContinue ? 'text-white' : 'text-white/40'
          }`}
        />
      )}
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
