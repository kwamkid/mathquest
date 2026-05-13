// components/lesson/steps/GuidedPracticeStepView.tsx
//
// One question with progressive hints.
// Retry rules (per spec §10): 2 wrong → first hint; 4 wrong → full explanation.
// More general: hint i unlocks at (i+1)*2 wrong attempts; full explanation after
// max(hints.length * 2, 4) wrong attempts.

'use client';

import { useCallback, useEffect, useState } from 'react';
import type { GuidedPracticeStep } from '@/types/curriculum';
import ConceptBlockRenderer from '@/components/visuals/ConceptBlockRenderer';
import QuestionRenderer from '@/components/question/QuestionRenderer';
import { useSound } from '@/lib/game/soundManager';

interface Props {
  step: GuidedPracticeStep;
  onCorrect?: () => void;
  onWrongAttempt?: (attempt: number) => void;
}

export default function GuidedPracticeStepView({
  step,
  onCorrect,
  onWrongAttempt,
}: Props) {
  const { playSound } = useSound();
  const [wrongCount, setWrongCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    setWrongCount(0);
    setSolved(false);
    setResetSignal((s) => s + 1);
  }, [step.id]);

  const hintsToShow = Math.min(step.hints.length, Math.floor(wrongCount / 2));
  const showFullExplanation = wrongCount >= Math.max(step.hints.length * 2, 4);

  const handleAnswered = useCallback(
    (result: { correct: boolean; value: string }) => {
      if (solved) return;
      if (result.correct) {
        playSound('correct');
        setSolved(true);
        onCorrect?.();
      } else {
        playSound('incorrect');
        setWrongCount((c) => {
          const next = c + 1;
          onWrongAttempt?.(next);
          return next;
        });
        // allow another try
        setResetSignal((s) => s + 1);
      }
    },
    [solved, playSound, onCorrect, onWrongAttempt],
  );

  return (
    <article className="space-y-5">
      <h2 className="text-2xl font-bold text-white">{step.title}</h2>

      <QuestionRenderer
        question={step.question}
        onAnswered={handleAnswered}
        disabled={solved}
        resetSignal={resetSignal}
      />

      {solved && (
        <div className="learn-feedback-correct">
          <p className="text-lg font-bold">ถูกต้อง! 🎉</p>
          <p className="text-sm">กด “ถัดไป” เพื่อไปต่อ</p>
        </div>
      )}

      {!solved && hintsToShow > 0 && (
        <div className="space-y-2">
          {step.hints.slice(0, hintsToShow).map((hint, i) => (
            <div key={i} className="learn-hint">
              <span aria-hidden="true">💡</span>
              <p>
                <span className="font-bold">ใบ้ {i + 1}:</span> {hint}
              </p>
            </div>
          ))}
        </div>
      )}

      {!solved && showFullExplanation && (
        <div className="learn-explanation space-y-3">
          <p className="text-base font-bold">เฉลยอย่างละเอียด</p>
          <p className="text-sm leading-relaxed">{step.fullExplanation}</p>
          {step.fullExplanationVisual && (
            <div className="flex justify-center">
              <ConceptBlockRenderer block={step.fullExplanationVisual} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}
