// components/question/TextInputQuestion.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import type { TextInputQuestion } from '@/types/curriculum';
import ConceptBlockRenderer from '@/components/visuals/ConceptBlockRenderer';

interface Props {
  question: TextInputQuestion;
  onAnswered: (result: { correct: boolean; value: string }) => void;
  disabled?: boolean;
  resetSignal?: number;
}

// Normalise a fraction-style string: "3 / 5" → "3/5", trims spaces.
const normaliseFraction = (raw: string): string =>
  raw.replace(/\s+/g, '').trim();

// Compare answer based on answerType.
const isCorrect = (q: TextInputQuestion, raw: string): boolean => {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return false;

  if (q.answerType === 'number') {
    const value = Number(trimmed);
    if (!Number.isFinite(value)) return false;
    const expected = Number(q.expectedAnswer);
    const tol = q.tolerance ?? 0;
    return Math.abs(value - expected) <= tol;
  }
  if (q.answerType === 'fraction') {
    return normaliseFraction(trimmed) === normaliseFraction(String(q.expectedAnswer));
  }
  // string
  return trimmed === String(q.expectedAnswer).trim();
};

export default function TextInputQuestionView({
  question,
  onAnswered,
  disabled,
  resetSignal,
}: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('');
    inputRef.current?.focus();
  }, [resetSignal, question.id]);

  const submit = () => {
    if (disabled) return;
    onAnswered({ correct: isCorrect(question, value), value: value.trim() });
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-white">{question.prompt}</p>
      {question.promptVisual && (
        <div className="flex justify-center">
          <ConceptBlockRenderer block={question.promptVisual} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          inputMode={question.answerType === 'number' ? 'decimal' : 'text'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          disabled={disabled}
          placeholder={
            question.answerType === 'fraction' ? 'เช่น 3/5' : 'พิมพ์คำตอบ'
          }
          className="learn-input flex-1"
          aria-label="พิมพ์คำตอบของคุณ"
        />
        {question.unit && (
          <span className="text-lg font-semibold text-white/80">{question.unit}</span>
        )}
      </div>
      <button
        onClick={submit}
        disabled={disabled || value.trim().length === 0}
        className="learn-btn-primary"
      >
        ตรวจคำตอบ
      </button>
    </div>
  );
}
