// components/lesson/steps/MiniQuizStepView.tsx
//
// Like IndependentPractice but tracks pass/perfect for stars and badge.
// Reports {correct, total, passed, perfect, stars, badge} on completion.

'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MiniQuizStep, Question } from '@/types/curriculum';
import QuestionRenderer from '@/components/question/QuestionRenderer';
import { useSound } from '@/lib/game/soundManager';

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
}

export default function MiniQuizStepView({ step, onComplete, onMistake }: Props) {
  const { playSound } = useSound();
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean }>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [done, setDone] = useState<MiniQuizResult | null>(null);

  useEffect(() => {
    setIndex(0);
    setCorrectCount(0);
    setFeedback(null);
    setDone(null);
    setResetSignal((s) => s + 1);
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

  const handleNext = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setFeedback(null);
      setResetSignal((s) => s + 1);
    } else {
      const perfect = correctCount === total;
      const passed = correctCount / total >= step.passingScore;
      const stars = perfect ? step.starsOnPerfect : passed ? step.starsOnPass : 0;
      const badge = perfect ? step.badgeOnPerfect : undefined;
      const result: MiniQuizResult = { correct: correctCount, total, passed, perfect, stars, badge };
      setDone(result);
      onComplete?.(result);
    }
  };

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
            {feedback.correct ? 'ถูกต้อง! 🎉' : 'ยังไม่ใช่'}
          </p>
          <button onClick={handleNext} className="learn-btn-primary mt-3 w-auto px-5">
            {index === total - 1 ? 'ดูผลทดสอบ' : 'ข้อถัดไป'}
          </button>
        </div>
      )}
    </article>
  );
}
