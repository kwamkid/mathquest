// components/question/MultipleChoiceTextQuestion.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MultipleChoiceTextQuestion } from '@/types/curriculum';
import ConceptBlockRenderer from '@/components/visuals/ConceptBlockRenderer';

interface Props {
  question: MultipleChoiceTextQuestion;
  onAnswered: (result: { correct: boolean; value: string }) => void;
  disabled?: boolean;
  resetSignal?: number;
  // MCQ commits on click — these props are accepted (for API uniformity with
  // text-input/click-fraction) but ignored.
  onDraftValidityChange?: (valid: boolean) => void;
  submitSignal?: number;
}

// Stable Fisher-Yates with a string seed (question id) for deterministic shuffles.
const shuffle = <T,>(arr: T[], seed: string): T[] => {
  const out = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export default function MultipleChoiceTextQuestionView({
  question,
  onAnswered,
  disabled,
  resetSignal,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [resetSignal, question.id]);

  const choices = useMemo(() => {
    return question.shuffleChoices === false
      ? question.choices
      : shuffle(question.choices, question.id);
  }, [question]);

  const handlePick = (id: string) => {
    if (disabled) return;
    setSelected(id);
    onAnswered({
      correct: id === question.correctChoiceId,
      value: id,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-white">{question.prompt}</p>
      {question.promptVisual && (
        <div className="flex justify-center">
          <ConceptBlockRenderer block={question.promptVisual} />
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {choices.map((c) => {
          const isSelected = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => handlePick(c.id)}
              disabled={disabled}
              className={`learn-choice ${isSelected ? 'learn-choice-selected' : ''}`}
            >
              {c.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
