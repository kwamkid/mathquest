// lib/curricula/helpers/question-builders.ts
//
// Builders for the 4 question modalities — keep curriculum content terse.

import type {
  ClickFractionQuestion,
  ConceptBlock,
  MultipleChoiceTextQuestion,
  MultipleChoiceVisualQuestion,
  TextInputQuestion,
} from '@/types/curriculum';

export const textInput = (params: {
  id: string;
  prompt: string;
  expectedAnswer: number | string;
  answerType?: 'number' | 'fraction' | 'string';
  promptVisual?: ConceptBlock;
  tolerance?: number;
  unit?: string;
}): TextInputQuestion => ({
  id: params.id,
  format: 'text-input',
  prompt: params.prompt,
  expectedAnswer: params.expectedAnswer,
  answerType: params.answerType ?? 'number',
  promptVisual: params.promptVisual,
  tolerance: params.tolerance,
  unit: params.unit,
});

export const mcqText = (params: {
  id: string;
  prompt: string;
  choices: { id: string; text: string }[];
  correctChoiceId: string;
  promptVisual?: ConceptBlock;
  shuffleChoices?: boolean;
}): MultipleChoiceTextQuestion => ({
  id: params.id,
  format: 'mcq-text',
  prompt: params.prompt,
  choices: params.choices,
  correctChoiceId: params.correctChoiceId,
  promptVisual: params.promptVisual,
  shuffleChoices: params.shuffleChoices ?? true,
});

export const mcqVisual = (params: {
  id: string;
  prompt: string;
  choices: { id: string; visual: ConceptBlock }[];
  correctChoiceId: string;
  promptText?: string;
  shuffleChoices?: boolean;
}): MultipleChoiceVisualQuestion => ({
  id: params.id,
  format: 'mcq-visual',
  prompt: params.prompt,
  choices: params.choices,
  correctChoiceId: params.correctChoiceId,
  promptText: params.promptText,
  shuffleChoices: params.shuffleChoices ?? true,
});

export const clickFraction = (params: {
  id: string;
  prompt: string;
  totalParts: number;
  expectedFilled: number;
  style?: 'bar' | 'circle';
}): ClickFractionQuestion => ({
  id: params.id,
  format: 'interactive',
  variant: 'click-fraction',
  prompt: params.prompt,
  totalParts: params.totalParts,
  expectedFilled: params.expectedFilled,
  style: params.style ?? 'bar',
});
