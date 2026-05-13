// components/lesson/steps/IndependentPracticeStepView.tsx
//
// Sequence of questions, no hints, immediate feedback on each.
// After the last question the learner sees a summary screen with their score.
// Reports {correct, total, passed} via onComplete once the summary renders.

'use client';

import { useCallback, useEffect, useState } from 'react';
import type { IndependentPracticeStep, Question } from '@/types/curriculum';
import QuestionRenderer from '@/components/question/QuestionRenderer';
import { useSound } from '@/lib/game/soundManager';

interface SummaryResult {
  correct: number;
  total: number;
  passed: boolean;
}

interface Props {
  step: IndependentPracticeStep;
  onComplete?: (result: SummaryResult) => void;
  onMistake?: (question: Question, userAnswer: string) => void;
}

export default function IndependentPracticeStepView({
  step,
  onComplete,
  onMistake,
}: Props) {
  const { playSound } = useSound();
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean }>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [summary, setSummary] = useState<SummaryResult | null>(null);

  useEffect(() => {
    setIndex(0);
    setCorrectCount(0);
    setFeedback(null);
    setSummary(null);
    setResetSignal((s) => s + 1);
  }, [step.id]);

  const total = step.questions.length;
  const current = step.questions[index];
  const finished = feedback !== null && index === total - 1;

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

  const handleNext = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setFeedback(null);
      setResetSignal((s) => s + 1);
    } else {
      const passed = correctCount / total >= step.passingScore;
      const result: SummaryResult = { correct: correctCount, total, passed };
      setSummary(result);
      onComplete?.(result);
    }
  };

  if (summary) {
    const pct = Math.round((summary.correct / summary.total) * 100);
    return (
      <article className="space-y-4 text-center">
        <h2 className="text-2xl font-bold text-white">สรุปผล</h2>
        <p className="text-5xl font-bold text-pink-400">
          {summary.correct}/{summary.total}
        </p>
        <p className="text-base text-white/80">
          {summary.passed
            ? `ทำได้ ${pct}% — ${summary.correct === summary.total ? 'เก่งมาก! ตอบถูกทุกข้อ 🎉' : 'ผ่านเกณฑ์แล้ว 👏'}`
            : `ทำได้ ${pct}% — ฝึกอีกนิดจะคล่องขึ้น`}
        </p>
        <p className="text-sm text-white/60">กด “ถัดไป” เพื่อไปขั้นถัดไป</p>
      </article>
    );
  }

  if (!current) return null;

  return (
    <article className="space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{step.title}</h2>
        <span
          className="text-sm font-semibold text-white/60"
          style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
        >
          {index + 1}/{total}
        </span>
      </header>

      <QuestionRenderer
        question={current}
        onAnswered={handleAnswered}
        disabled={feedback !== null}
        resetSignal={resetSignal}
      />

      {feedback && (
        <div className={feedback.correct ? 'learn-feedback-correct' : 'learn-feedback-wrong'}>
          <p className="text-lg font-bold">
            {feedback.correct ? 'ถูกต้อง! 🎉' : 'ยังไม่ใช่ ลองครั้งต่อไปนะ'}
          </p>
          <button onClick={handleNext} className="learn-btn-primary mt-3 w-auto px-5">
            {finished ? 'ดูสรุป' : 'ข้อถัดไป'}
          </button>
        </div>
      )}
    </article>
  );
}
