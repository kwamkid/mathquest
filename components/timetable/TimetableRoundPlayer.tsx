// components/timetable/TimetableRoundPlayer.tsx
//
// Plays one timetable round: generates 20 MCQ questions, walks through them
// with instant feedback (green/red on the picked choice — same as lessons),
// then shows a result + awards EXP on a pass. Self-contained drill UI, not the
// full LessonPlayer, since timetable has no concept/worked-example steps.
//
// Two variants:
//   - { kind: 'table', table, round } : one round of one แม่
//   - { kind: 'mix', tables }         : the daily mix challenge across every
//                                       unlocked table (EXP once per day)

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpenCheck, Check, ChevronDown, ChevronRight, Star, X } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import LessonHeader from '@/components/lesson/LessonHeader';
import MultipleChoiceTextQuestion from '@/components/question/MultipleChoiceTextQuestion';
import { useSound } from '@/lib/game/soundManager';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { generateMixRound, generateRound } from '@/lib/timetable/generator';
import {
  findNextRound,
  getTimetableProgress,
  roundId,
  saveMixChallenge,
  saveTimetableRound,
} from '@/lib/timetable/progress';
import {
  MULTIPLICAND_MAX,
  PASSING_RATIO,
  QUESTIONS_PER_ROUND,
  ROUNDS,
  stageOfRound,
} from '@/lib/timetable/config';
import type { Strings } from '@/lib/i18n/strings';

// Tap-to-answer reveal hold before auto-advancing. A wrong answer lingers
// longer so the kid can read the correct choice that just lit up.
const REVEAL_CORRECT_MS = 650;
const REVEAL_WRONG_MS = 1500;

export type RoundPlayerVariant =
  | { kind: 'table'; table: number; round: number }
  | { kind: 'mix'; tables: number[] };

interface Props {
  variant: RoundPlayerVariant;
}

export default function TimetableRoundPlayer({ variant }: Props) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { lang, t } = useLanguage();
  const { playSound } = useSound();

  // Fresh questions per attempt; "ฝึกอีกครั้ง" bumps `attempt` to regenerate.
  const [attempt, setAttempt] = useState(0);
  const questions = useMemo(
    () =>
      variant.kind === 'mix'
        ? generateMixRound(variant.tables)
        : generateRound(variant.table, variant.round),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt],
  );

  const roundDef =
    variant.kind === 'table'
      ? ROUNDS.find((r) => r.round === variant.round)
      : undefined;
  const title =
    variant.kind === 'mix'
      ? `${t.timetable.mixTitle} · Mix Challenge`
      : `${t.timetable.table} ${variant.table} · ${
          (lang === 'en' ? roundDef?.enLabel : roundDef?.thaiLabel) ?? ''
        }`;
  // The per-table picker page is gone (cards play directly), so every exit
  // goes back to the timetable landing.
  const exitHref = '/timetable';

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean }>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [reward, setReward] = useState<{ exp: number; firstClear: boolean } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [nextAfter, setNextAfter] = useState<{ table: number; round: number } | null>(
    null,
  );
  // Pending auto-advance (see handleAnswered). Cleared on restart/unmount so a
  // queued jump can't fire into a round that's already been reset.
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = questions.length;
  const current = questions[index];
  const isLastQuestion = index === total - 1;

  // Tap-to-answer: picking a choice IS the answer — no Next button. The
  // reveal holds just long enough to read, then the round moves on by itself.
  // A wrong answer holds longer so the kid can see the correct choice light up.
  const handleAnswered = (result: { correct: boolean; value: string }) => {
    if (feedback) return;
    playSound(result.correct ? 'correct' : 'incorrect');
    setFeedback({ correct: result.correct });
    // Compute the running total explicitly: the auto-advance timer below fires
    // from THIS render's closure, where a setCorrectCount update hasn't landed
    // yet — reading state there would finish the round one answer short.
    const nextCorrect = correctCount + (result.correct ? 1 : 0);
    if (result.correct) setCorrectCount(nextCorrect);

    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(
      () => {
        if (isLastQuestion) {
          void finishRound(nextCorrect);
          return;
        }
        setIndex((i) => i + 1);
        setFeedback(null);
        setResetSignal((s) => s + 1);
      },
      result.correct ? REVEAL_CORRECT_MS : REVEAL_WRONG_MS,
    );
  };

  const finishRound = async (finalCorrect: number) => {
    const passed = finalCorrect / total >= PASSING_RATIO;
    setFinished(true);
    if (passed && user) {
      setSaving(true);
      playSound('levelUp');
      try {
        const res =
          variant.kind === 'mix'
            ? await saveMixChallenge({
                userId: user.id,
                perfect: finalCorrect === total,
              })
            : await saveTimetableRound({
                userId: user.id,
                table: variant.table,
                round: variant.round,
                perfect: finalCorrect === total,
              });
        setReward({ exp: res.expGained, firstClear: res.firstClear });
        // Suggest the next round as if this clear is already saved (refreshUser
        // updates context, but returns void — simulate the new id locally).
        const before = getTimetableProgress(user);
        const simulated =
          variant.kind === 'table'
            ? {
                ...(before ?? {
                  curriculumId: 'timetable',
                  startedAt: '',
                  lastActiveAt: '',
                  unlockedSubTopicIds: [],
                  lessonScores: {},
                  subTopicScores: {},
                  mistakePatterns: [],
                  totalMinutesSpent: 0,
                  totalStarsEarned: 0,
                  completedLessonIds: [],
                }),
                completedLessonIds: [
                  ...(before?.completedLessonIds ?? []),
                  roundId(variant.table, variant.round),
                ],
              }
            : before;
        setNextAfter(findNextRound(simulated));
        await refreshUser();
      } finally {
        setSaving(false);
      }
    }
  };

  // Drop any queued auto-advance on unmount so it can't fire after the player
  // is gone (or after an exit mid-reveal).
  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  // Full local restart with a fresh question set (router.refresh() would keep
  // client state, so it can't restart the drill).
  const restart = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setAttempt((a) => a + 1);
    setIndex(0);
    setCorrectCount(0);
    setFeedback(null);
    setResetSignal((s) => s + 1);
    setFinished(false);
    setReward(null);
    setNextAfter(null);
  };

  // ----- Result screen -----
  if (finished) {
    const pct = Math.round((correctCount / total) * 100);
    const passed = correctCount / total >= PASSING_RATIO;
    const perfect = correctCount === total;

    // Earned this table a new star? (stage done = star; cheap heuristic: the
    // cleared round was the stage's last uncleared one — we just show the
    // celebratory line whenever the stage is now complete.)
    return (
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              passed
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            {passed ? (
              perfect ? (
                <Star className="h-10 w-10 fill-current text-amber-300" />
              ) : (
                <Check className="h-10 w-10" strokeWidth={3} />
              )
            ) : (
              <X className="h-10 w-10" strokeWidth={3} />
            )}
          </div>
          <h1 className="mt-5 text-2xl font-bold text-white">
            {perfect
              ? t.timetable.perfectScore
              : passed
                ? t.timetable.passed
                : t.timetable.failed}
          </h1>
          <p className="mt-2 text-lg text-white/80">
            {t.timetable.answeredRight(correctCount, total, pct)}
          </p>
          {passed && reward && (
            <p
              className={`mt-2 text-base font-semibold ${
                reward.firstClear ? 'text-fuchsia-200' : 'text-amber-200/80'
              }`}
            >
              {reward.firstClear
                ? t.timetable.expGained(reward.exp)
                : t.timetable.replayGained(reward.exp)}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            {/* Primary: keep the flow going — next recommended round. */}
            {passed && nextAfter && (
              <button
                onClick={() =>
                  router.push(`/timetable/${nextAfter.table}/${nextAfter.round}`)
                }
                className="learn-accent-pill flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
              >
                {t.timetable.playNext(
                  nextAfter.table,
                  stageOfRound(nextAfter.round).stage,
                  lang === 'en'
                    ? stageOfRound(nextAfter.round).enTitle
                    : stageOfRound(nextAfter.round).thaiTitle,
                )}
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={restart}
              disabled={saving}
              className={`rounded-2xl px-6 py-3 font-semibold transition disabled:opacity-50 ${
                passed
                  ? 'glass text-white/80 hover:bg-white/10'
                  : 'learn-accent-pill font-bold shadow-lg shadow-pink-500/30 hover:brightness-110'
              }`}
            >
              {passed ? t.timetable.replay : t.timetable.retry}
            </button>
            <button
              onClick={() => router.push(exitHref)}
              className="glass rounded-2xl px-6 py-3 font-semibold text-white/80 transition hover:bg-white/10"
            >
              {t.timetable.backToTimetable}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----- Question screen -----
  return (
    <div className="learn-bg flex min-h-screen flex-col">
      {/* Shared header — same X-to-exit + progress used by the lesson player. */}
      <LessonHeader
        lessonTitle={title}
        stepTitle={t.timetable.questionOf(index + 1, total)}
        currentStep={index}
        totalSteps={total}
        onClose={() => router.push(exitHref)}
      />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-32 pt-6 sm:px-6">
        {/* Peek-able reference chart — moved here from the removed table page
            so kids can still review the แม่ before (or while) drilling. */}
        {variant.kind === 'table' && (
          <div className="mb-4">
            <ReferenceChart table={variant.table} t={t} />
          </div>
        )}
        <MultipleChoiceTextQuestion
          key={current.id}
          question={current}
          onAnswered={handleAnswered}
          disabled={feedback !== null}
          resetSignal={resetSignal}
        />
      </div>

      {/* Bottom bar: score + the answer feedback icon. No Next button —
          tapping a choice answers AND advances (see handleAnswered). */}
      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0a0a0a]/85 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <span className="text-sm text-white/55">
            {t.timetable.correctSoFar(correctCount, QUESTIONS_PER_ROUND)}
          </span>
          {feedback && (
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                feedback.correct
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
              role="status"
              aria-label={
                feedback.correct ? t.timetable.correct : t.timetable.incorrect
              }
            >
              {feedback.correct ? (
                <Check className="h-6 w-6" strokeWidth={3} />
              ) : (
                <X className="h-6 w-6" strokeWidth={3} />
              )}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}

// Collapsible "peek at the table" reference — review before drilling.
// (Lifted from the removed /timetable/[table] picker page.)
function ReferenceChart({ table, t }: { table: number; t: Strings }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="learn-card overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white/85">
          <BookOpenCheck className="h-4 w-4 text-cyan-300" />
          {t.timetable.peekChart(table)}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 border-t border-white/10 p-4 sm:grid-cols-3">
          {Array.from({ length: MULTIPLICAND_MAX }, (_, i) => i + 1).map((n) => (
            <p key={n} className="text-sm tabular-nums text-white/80">
              {table} × {n} ={' '}
              <span className="font-bold text-white">{table * n}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
