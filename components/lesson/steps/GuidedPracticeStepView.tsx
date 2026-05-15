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
import type { FooterAction } from '../LessonPlayer';

const noop = () => undefined;

interface Props {
  step: GuidedPracticeStep;
  onCorrect?: () => void;
  onWrongAttempt?: (attempt: number) => void;
  onFooterAction?: (action: FooterAction | null) => void;
}

export default function GuidedPracticeStepView({
  step,
  onCorrect,
  onWrongAttempt,
  onFooterAction,
}: Props) {
  const { playSound } = useSound();
  const [wrongCount, setWrongCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [submitSignal, setSubmitSignal] = useState(0);
  const [draftValid, setDraftValid] = useState(false);

  useEffect(() => {
    setWrongCount(0);
    setSolved(false);
    setResetSignal((s) => s + 1);
    setDraftValid(false);
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
        setDraftValid(false);
      }
    },
    [solved, playSound, onCorrect, onWrongAttempt],
  );

  // Drive the footer: while not solved, show "ตรวจคำตอบ" that submits this
  // question; once solved, hand back to the player's default "ถัดไป" handler.
  useEffect(() => {
    if (!onFooterAction) return;
    if (solved) {
      onFooterAction(null);
      return;
    }
    const isMcq =
      step.question.format === 'mcq-text' || step.question.format === 'mcq-visual';
    if (isMcq) {
      onFooterAction({
        label: 'เลือกคำตอบ',
        enabled: false,
        // MCQ commits on click — the footer is disabled, so this never fires.
        onClick: noop,
      });
    } else {
      onFooterAction({
        label: 'ตรวจคำตอบ',
        enabled: draftValid,
        onClick: () => setSubmitSignal((s) => s + 1),
      });
    }
  }, [onFooterAction, solved, step.question.format, draftValid]);

  // Clear the footer override when this step view unmounts.
  useEffect(() => {
    return () => {
      onFooterAction?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <article className="space-y-5">
      <h2 className="text-2xl font-bold text-white">{step.title}</h2>

      <QuestionRenderer
        question={step.question}
        onAnswered={handleAnswered}
        disabled={solved}
        resetSignal={resetSignal}
        onDraftValidityChange={setDraftValid}
        submitSignal={submitSignal}
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
