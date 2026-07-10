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

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Star, X } from 'lucide-react';
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
  PASSING_RATIO,
  QUESTIONS_PER_ROUND,
  ROUNDS,
  stageOfRound,
} from '@/lib/timetable/config';

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
  const exitHref =
    variant.kind === 'mix' ? '/timetable' : `/timetable/${variant.table}`;

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

  const total = questions.length;
  const current = questions[index];
  const isLastQuestion = index === total - 1;

  const handleAnswered = (result: { correct: boolean; value: string }) => {
    if (feedback) return;
    playSound(result.correct ? 'correct' : 'incorrect');
    setFeedback({ correct: result.correct });
    if (result.correct) setCorrectCount((c) => c + 1);
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

  const handleAdvance = () => {
    const finalCorrect = correctCount;
    if (isLastQuestion) {
      void finishRound(finalCorrect);
      return;
    }
    setIndex((i) => i + 1);
    setFeedback(null);
    setResetSignal((s) => s + 1);
  };

  // Full local restart with a fresh question set (router.refresh() would keep
  // client state, so it can't restart the drill).
  const restart = () => {
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
            <p className="mt-2 text-base font-semibold text-fuchsia-200">
              {reward.firstClear
                ? t.timetable.expGained(reward.exp)
                : variant.kind === 'mix'
                  ? t.timetable.mixAlreadyPaid
                  : t.timetable.roundAlreadyPaid}
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
              {variant.kind === 'mix'
                ? t.timetable.backToTimetable
                : t.timetable.backToTable(variant.table)}
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
        <MultipleChoiceTextQuestion
          key={current.id}
          question={current}
          onAnswered={handleAnswered}
          disabled={feedback !== null}
          resetSignal={resetSignal}
        />
      </div>

      {/* Bottom bar: feedback icon + next button. */}
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
          <button
            onClick={handleAdvance}
            disabled={!feedback}
            className="learn-accent-pill flex h-12 items-center gap-1 rounded-2xl px-6 text-base font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {isLastQuestion ? t.timetable.seeResult : t.timetable.nextQuestion}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
