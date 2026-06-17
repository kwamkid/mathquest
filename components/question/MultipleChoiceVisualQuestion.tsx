// components/question/MultipleChoiceVisualQuestion.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MultipleChoiceVisualQuestion } from '@/types/curriculum';
import ConceptBlockRenderer from '@/components/visuals/ConceptBlockRenderer';

interface Props {
  question: MultipleChoiceVisualQuestion;
  onAnswered: (result: { correct: boolean; value: string }) => void;
  disabled?: boolean;
  resetSignal?: number;
  // MCQ commits on click — these props are accepted (for API uniformity with
  // text-input/click-fraction) but ignored.
  onDraftValidityChange?: (valid: boolean) => void;
  submitSignal?: number;
}

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

export default function MultipleChoiceVisualQuestionView({
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
      <p className="text-xl font-medium text-white sm:text-2xl">{question.prompt}</p>
      {question.promptText && (
        <p className="text-base text-white/70">{question.promptText}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {choices.map((c) => {
          const isSelected = selected === c.id;
          const answered = selected !== null;
          const isCorrectChoice = c.id === question.correctChoiceId;
          let stateClass = '';
          if (answered) {
            if (isCorrectChoice) stateClass = 'learn-choice-correct';
            else if (isSelected) stateClass = 'learn-choice-wrong';
          } else if (isSelected) {
            stateClass = 'learn-choice-selected';
          }
          return (
            <button
              key={c.id}
              onClick={() => handlePick(c.id)}
              disabled={disabled}
              className={`learn-choice learn-choice-visual ${stateClass}`}
              aria-pressed={isSelected}
            >
              <ConceptBlockRenderer block={c.visual} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
