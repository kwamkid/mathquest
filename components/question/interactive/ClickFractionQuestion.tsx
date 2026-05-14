// components/question/interactive/ClickFractionQuestion.tsx
//
// Interactive fraction question — learner clicks parts of a bar or circle
// to match a target fraction (n/d).

'use client';

import { useEffect, useRef, useState } from 'react';
import type { ClickFractionQuestion } from '@/types/curriculum';
import FractionBar from '@/components/visuals/FractionBar';
import FractionCircle from '@/components/visuals/FractionCircle';

interface Props {
  question: ClickFractionQuestion;
  onAnswered: (result: { correct: boolean; value: string }) => void;
  disabled?: boolean;
  resetSignal?: number;
  onDraftValidityChange?: (valid: boolean) => void;
  submitSignal?: number;
}

export default function ClickFractionQuestionView({
  question,
  onAnswered,
  disabled,
  resetSignal,
  onDraftValidityChange,
  submitSignal,
}: Props) {
  const [filled, setFilled] = useState<number[]>([]);
  const filledRef = useRef<number[]>([]);
  filledRef.current = filled;

  useEffect(() => {
    setFilled([]);
    onDraftValidityChange?.(false);
  }, [resetSignal, question.id, onDraftValidityChange]);

  useEffect(() => {
    // Any selection counts as valid — the learner has expressed intent.
    onDraftValidityChange?.(filled.length > 0);
  }, [filled, onDraftValidityChange]);

  const togglePart = (i: number) => {
    if (disabled) return;
    setFilled((prev) =>
      prev.includes(i) ? prev.filter((p) => p !== i) : [...prev, i],
    );
  };

  const submit = () => {
    if (disabled) return;
    const f = filledRef.current;
    if (f.length === 0) return;
    const correct = f.length === question.expectedFilled;
    onAnswered({ correct, value: `${f.length}/${question.totalParts}` });
  };

  useEffect(() => {
    if (submitSignal === undefined) return;
    submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitSignal]);

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-white">{question.prompt}</p>
      <div className="flex flex-col items-center gap-2">
        {question.style === 'circle' ? (
          <FractionCircle
            numerator={filled.length}
            denominator={question.totalParts}
            size={220}
            interactive
            onPartClick={togglePart}
            filledIndices={filled}
          />
        ) : (
          <FractionBar
            numerator={filled.length}
            denominator={question.totalParts}
            width={320}
            height={80}
            interactive
            onPartClick={togglePart}
            filledIndices={filled}
          />
        )}
        <p
          className="text-base font-semibold text-white/80"
          style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
        >
          ระบายแล้ว: {filled.length} / {question.totalParts}
        </p>
      </div>
    </div>
  );
}
