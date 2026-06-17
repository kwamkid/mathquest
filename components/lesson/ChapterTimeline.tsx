// components/lesson/ChapterTimeline.tsx
//
// Reusable building blocks for the chapter detail page. Three pieces:
//   - <ContinueCard>     — big gradient CTA: "Continue from where you left off"
//   - <LessonListItem>   — lesson row with a giant order number, dimmed when done
//   - <QuizLevelItem>    — final-quiz row (Level 1-5) with cascade-unlock state
//
// Kept here so the chapter page stays small and we can drop the same widgets
// into future curricula (Unitary Method, …) without rewriting them.

'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  ChevronRight,
  Lock,
  PlayCircle,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import type { Lesson } from '@/types/curriculum';
import { getLessonRewardPreview } from '@/lib/curricula/progress-helpers';

// ---------------------------------------------------------------------------
// Continue card — "Resume the next thing you should do"
// ---------------------------------------------------------------------------

interface ContinueCardProps {
  href: string;
  title: string;
  // "เริ่มเรียน" first time, "เรียนต่อ" otherwise.
  label: string;
  // Optional reward preview — shown as a small chip on the right side of
  // the card. Pass when the next-up lesson is a quiz so the learner sees
  // "do this and earn N stars / +M EXP" before tapping in.
  reward?: { stars: number; exp: number };
}

export function ContinueCard({ href, title, label, reward }: ContinueCardProps) {
  return (
    <Link
      href={href}
      className="learn-accent-pill flex w-full items-center justify-between gap-3 rounded-2xl p-4 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
    >
      <div className="flex items-start gap-3 min-w-0">
        <PlayCircle className="mt-1 h-6 w-6 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            {label}
          </p>
          <p className="mt-0.5 truncate text-base font-bold">{title}</p>
          {reward && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-bold text-white">
                <Star className="h-3 w-3 fill-current" />
                สูงสุด {reward.stars}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-bold text-white">
                <Zap className="h-3 w-3 fill-current" />+{reward.exp} EXP
              </span>
            </div>
          )}
        </div>
      </div>
      <ChevronRight className="h-6 w-6 shrink-0" />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Lesson list item — number on the left, lesson info on the right.
// Completed lessons fade back so the active one pops.
// ---------------------------------------------------------------------------

interface LessonListItemProps {
  lesson: Lesson;
  number: number;
  href: string;
  completed: boolean;
  stars: number;
  isContinue: boolean;
}

export function LessonListItem({
  lesson,
  number,
  href,
  completed,
  stars,
  isContinue,
}: LessonListItemProps) {
  const dim = completed ? 'opacity-55' : '';

  // Active row uses the full gradient pill (matches ContinueCard) so it
  // reads as the next thing to do. Completed and idle rows stay subtle.
  const rowClass = isContinue
    ? 'learn-accent-pill rounded-2xl p-4 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]'
    : `learn-card flex items-center gap-3 rounded-2xl p-4 transition ${dim}`;

  const titleClass = isContinue
    ? 'text-base font-bold text-white'
    : completed
      ? 'truncate text-base text-white/60 line-through'
      : 'truncate text-base text-white';

  const numberBox = isContinue
    ? 'bg-white/25 text-white'
    : completed
      ? 'bg-emerald-400/10 text-emerald-300/70'
      : 'bg-white/5 text-white/80';

  const metaTextClass = isContinue ? 'text-white/80' : 'text-white/55';

  return (
    <Link href={href} className={rowClass}>
      <div className="flex items-center gap-3">
        {/* Big number — the focal point per user request */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl font-extrabold ${numberBox}`}
        >
          {number}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className={titleClass}>{lesson.title}</h3>
          {lesson.description && !completed && (
            <p
              className={`mt-0.5 truncate text-sm ${
                isContinue ? 'text-white/85' : 'text-white/60'
              }`}
            >
              {lesson.description}
            </p>
          )}
          <div className={`mt-1 flex items-center gap-2 text-xs ${metaTextClass}`}>
            <span>⏱ {lesson.estimatedMinutes} นาที</span>
            {stars > 0 && (
              <span className="inline-flex items-center gap-0.5 text-amber-200">
                <Star className="h-3 w-3 fill-current" />
                {stars}
              </span>
            )}
            {isContinue && (
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                เรียนต่อ
              </span>
            )}
          </div>
        </div>

        {completed ? (
          <CheckCircle2
            className="h-7 w-7 shrink-0 text-emerald-400/80"
            aria-label="เรียนแล้ว"
          />
        ) : (
          <ChevronRight
            className={`h-5 w-5 shrink-0 ${
              isContinue ? 'text-white' : 'text-white/50'
            }`}
          />
        )}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Quiz level item — cascade-unlock row. Level N is locked until Level N-1
// is completed. Final quizzes also fade when complete so the next active
// level is the obvious target.
// ---------------------------------------------------------------------------

interface QuizLevelItemProps {
  lesson: Lesson;
  level: number;            // 1-based — "Level 1", "Level 2" …
  href: string;
  completed: boolean;
  stars: number;
  // Whether this level is unlocked (previous level done, or it's level 1
  // and all teaching lessons are done).
  unlocked: boolean;
  // True when this is the next quiz to play (first unlocked + not done).
  isNext: boolean;
}

export function QuizLevelItem({
  lesson,
  level,
  href,
  completed,
  stars,
  unlocked,
  isNext,
}: QuizLevelItemProps) {
  const dim = completed ? 'opacity-55' : !unlocked ? 'opacity-40' : '';
  const ring = isNext
    ? 'ring-2 ring-amber-400/70 shadow-lg shadow-amber-500/20'
    : '';

  // Strip the heavy 🏆 + "Final Quiz · Level X — " from the row's main title
  // since the level chip already says "Quiz X". Keep the descriptor.
  const cleanTitle = lesson.title.replace(/^🏆\s*Final Quiz\s*·?\s*Level\s*\d+\s*[—–-]\s*/i, '');

  // Preview the reward so kids know what they're playing for before they
  // tap in. Once completed, switch to the actual stars they earned so the
  // row doubles as a trophy display.
  const reward = getLessonRewardPreview(lesson);

  const content = (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-4 transition ${dim} ${ring}`}
    >
      {/* Trophy-flavoured big number */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl font-extrabold ${
          completed
            ? 'bg-emerald-400/10 text-emerald-300/70'
            : !unlocked
              ? 'bg-white/5 text-white/40'
              : isNext
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow'
                : 'bg-amber-500/15 text-amber-200'
        }`}
      >
        {level}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 shrink-0 text-amber-300" />
          <h3 className={`truncate text-base font-bold ${completed ? 'text-white/60 line-through' : 'text-white'}`}>
            Quiz Level {level}
          </h3>
          {!unlocked && <Lock className="h-4 w-4 shrink-0 text-white/40" />}
        </div>
        <p className="mt-0.5 truncate text-sm text-white/65">{cleanTitle}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-white/55">⏱ {lesson.estimatedMinutes} นาที</span>
          {/* Reward preview — stars + EXP. Always shown so the learner sees
            * what they're earning even before unlocking. */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${
              completed
                ? 'bg-emerald-400/15 text-emerald-200/90'
                : 'bg-amber-400/15 text-amber-200'
            }`}
          >
            <Star className="h-3 w-3 fill-current" />
            {completed && stars > 0 ? `${stars}/${reward.stars}` : `สูงสุด ${reward.stars}`}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/15 px-2 py-0.5 font-bold text-fuchsia-200">
            <Zap className="h-3 w-3 fill-current" />+{reward.exp} EXP
          </span>
          {isNext && (
            <span className="rounded-full bg-amber-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200">
              พร้อมเล่น
            </span>
          )}
        </div>
      </div>

      {completed ? (
        <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-400/80" />
      ) : !unlocked ? (
        <Lock className="h-5 w-5 shrink-0 text-white/40" />
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-amber-200" />
      )}
    </div>
  );

  if (!unlocked) {
    return content;
  }
  return <Link href={href}>{content}</Link>;
}
