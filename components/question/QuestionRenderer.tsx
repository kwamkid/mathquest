// components/question/QuestionRenderer.tsx
//
// Switch on Question.format and render the right input component.
// Each question component reports answer correctness via onAnswered.

'use client';

import type { Question } from '@/types/curriculum';
import TextInputQuestion from './TextInputQuestion';
import MultipleChoiceTextQuestion from './MultipleChoiceTextQuestion';
import MultipleChoiceVisualQuestion from './MultipleChoiceVisualQuestion';
import ClickFractionQuestion from './interactive/ClickFractionQuestion';
import SetClockQuestion from './interactive/SetClockQuestion';

export interface QuestionRendererProps {
  question: Question;
  // Called when the learner submits an answer.
  // `correct` reflects whether the answer matched the expected.
  // `value` is a stringified form of the answer (used for mistake patterns).
  onAnswered: (result: { correct: boolean; value: string }) => void;
  // Disable input once an answer is committed (parent decides retry rules).
  disabled?: boolean;
  // Force-clear input when parent moves to a new question.
  resetSignal?: number;
  // For non-MCQ formats: report whether the draft is ready to submit.
  // MCQ formats commit immediately on selection and ignore this.
  onDraftValidityChange?: (valid: boolean) => void;
  // For non-MCQ formats: bumping this number triggers a submit. Used so the
  // lesson footer can be the single "check answer" affordance.
  submitSignal?: number;
}

export default function QuestionRenderer(props: QuestionRendererProps) {
  const { question } = props;

  if (question.format === 'text-input') {
    return <TextInputQuestion {...props} question={question} />;
  }
  if (question.format === 'mcq-text') {
    return <MultipleChoiceTextQuestion {...props} question={question} />;
  }
  if (question.format === 'mcq-visual') {
    return <MultipleChoiceVisualQuestion {...props} question={question} />;
  }
  if (question.format === 'interactive' && question.variant === 'click-fraction') {
    return <ClickFractionQuestion {...props} question={question} />;
  }
  if (question.format === 'interactive' && question.variant === 'set-clock') {
    return <SetClockQuestion {...props} question={question} />;
  }

  // Other interactive variants (drag-drop, read-scale, draw-shape)
  // ship in Phase 2-3.
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
      Question format “{question.format}” not yet implemented.
    </div>
  );
}
