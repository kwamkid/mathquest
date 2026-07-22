// components/lesson/steps/MiniQuizStepView.tsx
//
// Like IndependentPractice but tracks pass/perfect for stars and badge.
// Reports {correct, total, passed, perfect, stars, badge} on completion.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MiniQuizStep, Question } from '@/types/curriculum';
import QuestionRenderer from '@/components/question/QuestionRenderer';
import { useSound } from '@/lib/game/soundManager';
import type { FooterAction, StepFeedback } from '../LessonPlayer';

// Reveal hold before an MCQ auto-advances. Wrong answers linger longer so the
// learner can see the correct choice light up.
const REVEAL_CORRECT_MS = 650;
const REVEAL_WRONG_MS = 1500;

const noop = () => undefined;

export interface MiniQuizResult {
  correct: number;
  total: number;
  passed: boolean;
  perfect: boolean;
  stars: number;
  badge?: string;
}

interface Props {
  step: MiniQuizStep;
  onComplete?: (result: MiniQuizResult) => void;
  onMistake?: (question: Question, userAnswer: string) => void;
  onFooterAction?: (action: FooterAction | null) => void;
  onFeedback?: (feedback: StepFeedback | null) => void;
}

export default function MiniQuizStepView({
  step,
  onComplete,
  onMistake,
  onFooterAction,
  onFeedback,
}: Props) {
  const { playSound } = useSound();
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean }>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [submitSignal, setSubmitSignal] = useState(0);
  const [draftValid, setDraftValid] = useState(false);
  const [done, setDone] = useState<MiniQuizResult | null>(null);

  useEffect(() => {
    setIndex(0);
    setCorrectCount(0);
    setFeedback(null);
    setDone(null);
    setResetSignal((s) => s + 1);
    setDraftValid(false);
  }, [step.id]);

  const total = step.questions.length;
  const current = step.questions[index];

  const handleAnswered = useCallback(
    (result: { correct: boolean; value: string }) => {
      playSound(result.correct ? 'correct' : 'incorrect');
      setFeedback({ correct: result.correct });
      if (result.correct) {
        setCorrectCount((c) => c + 1);
      } else {
        onMistake?.(current, result.value);
      }
    },
    [playSound, onMistake, current],
  );

  const handleAdvance = useCallback(() => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setFeedback(null);
      setDraftValid(false);
      setResetSignal((s) => s + 1);
    } else {
      const perfect = correctCount === total;
      const passed = correctCount / total >= step.passingScore;
      const stars = perfect ? step.starsOnPerfect : passed ? step.starsOnPass : 0;
      const badge = perfect ? step.badgeOnPerfect : undefined;
      const result: MiniQuizResult = {
        correct: correctCount,
        total,
        passed,
        perfect,
        stars,
        badge,
      };
      setDone(result);
      onComplete?.(result);
    }
  }, [index, total, correctCount, step, onComplete]);

  // Tap-to-answer auto-advance, MCQ ONLY: picking a choice already commits the
  // answer, so there's nothing left to press — hold the reveal a beat, then
  // move on. Typed formats keep their "ตรวจคำตอบ" footer button (the learner
  // still has to submit), so they are deliberately excluded here.
  const isMcqCurrent =
    current?.format === 'mcq-text' || current?.format === 'mcq-visual';
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!feedback || done || !isMcqCurrent) return;
    advanceTimer.current = setTimeout(
      handleAdvance,
      feedback.correct ? REVEAL_CORRECT_MS : REVEAL_WRONG_MS,
    );
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [feedback, done, isMcqCurrent, handleAdvance]);

  // Surface feedback in the footer (bottom bar) rather than inline.
  useEffect(() => {
    if (!onFeedback) return;
    if (done || !feedback) {
      onFeedback(null);
      return;
    }
    onFeedback({
      correct: feedback.correct,
      message: feedback.correct ? 'ถูกต้อง! 🎉' : 'ยังไม่ใช่',
    });
  }, [onFeedback, feedback, done]);

  useEffect(() => {
    if (!onFooterAction) return;
    if (done) {
      onFooterAction(null);
      return;
    }
    if (feedback) {
      onFooterAction({
        label: index === total - 1 ? 'ดูผลทดสอบ' : 'ข้อถัดไป',
        // MCQ advances on its own (see the auto-advance effect) — show the
        // label but don't offer a press. Typed formats still advance by tap.
        enabled: !isMcqCurrent,
        onClick: handleAdvance,
      });
    } else {
      const isMcq =
        current?.format === 'mcq-text' || current?.format === 'mcq-visual';
      if (isMcq) {
        onFooterAction({
          label: 'เลือกคำตอบ',
          enabled: false,
          onClick: noop,
        });
      } else {
        onFooterAction({
          label: 'ตรวจคำตอบ',
          enabled: draftValid,
          onClick: () => setSubmitSignal((s) => s + 1),
        });
      }
    }
  }, [
    onFooterAction,
    done,
    feedback,
    index,
    total,
    handleAdvance,
    current,
    draftValid,
    isMcqCurrent,
  ]);

  // Clear the footer override when this step view unmounts so the player
  // falls back to its default goNext button.
  useEffect(() => {
    return () => {
      onFooterAction?.(null);
      onFeedback?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) {
    return (
      <article className="space-y-4 text-center">
        <h2 className="text-2xl font-bold text-white">ผลทดสอบ</h2>
        <p className="text-4xl font-bold text-pink-400">
          {done.correct}/{done.total}
        </p>
        <p className="text-base text-white/80">
          {done.perfect
            ? `เก่งมาก! เต็มทั้งหมด ได้ ${done.stars} ดาว ⭐`
            : done.passed
              ? `ผ่านแล้ว — ได้ ${done.stars} ดาว ⭐`
              : 'ยังไม่ผ่านเกณฑ์ — ฝึกอีกนิดนะ'}
        </p>
        {done.badge && (
          <p className="text-base font-semibold text-amber-300">🏅 ได้ตรา “{done.badge}”</p>
        )}
      </article>
    );
  }

  if (!current) return null;

  // EXP preview matches the curriculum-progress payout (50 EXP per star).
  // Kept local rather than importing so this view stays decoupled from the
  // firebase layer — keeping the magic number here is fine because it also
  // lives next to `starsOnPerfect` which sets the same ceiling.
  const maxExp = step.starsOnPerfect * 50;

  return (
    <article className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-white">{step.title}</h2>
        <span
          className="text-sm font-semibold text-white/60"
          style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
        >
          {index + 1}/{total}
        </span>
      </header>

      {/* Reward preview banner — only on question #1 so kids see what they're
        * playing for, but it doesn't keep nagging while they're working. */}
      {index === 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-500/[0.08] px-4 py-3">
          <span className="text-sm text-white/85">
            ทำให้ได้ {Math.ceil(step.passingScore * total)}/{total} ขึ้นไปได้
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-200">
            ⭐ ผ่าน {step.starsOnPass} ดาว · เพอร์เฟกต์ {step.starsOnPerfect} ดาว
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-xs font-bold text-fuchsia-200">
            ⚡ สูงสุด +{maxExp} EXP
          </span>
        </div>
      )}

      <QuestionRenderer
        question={current}
        onAnswered={handleAnswered}
        disabled={feedback !== null}
        resetSignal={resetSignal}
        onDraftValidityChange={setDraftValid}
        submitSignal={submitSignal}
      />
    </article>
  );
}
