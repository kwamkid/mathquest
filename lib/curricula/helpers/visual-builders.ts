// lib/curricula/helpers/visual-builders.ts
//
// Builders for ConceptBlocks — keep curriculum content terse.

import type { ConceptBlock } from '@/types/curriculum';

export const text = (markdown: string): ConceptBlock => ({
  kind: 'text',
  markdown,
});

export const callout = (
  tone: 'info' | 'tip' | 'warning',
  markdown: string,
): ConceptBlock => ({
  kind: 'callout',
  tone,
  markdown,
});

export const fractionBar = (
  numerator: number,
  denominator: number,
  label?: string,
): ConceptBlock => ({
  kind: 'fractionBar',
  numerator,
  denominator,
  label,
});

export const fractionCircle = (
  numerator: number,
  denominator: number,
  label?: string,
): ConceptBlock => ({
  kind: 'fractionCircle',
  numerator,
  denominator,
  label,
});

export const fractionAddition = (params: {
  left: { numerator: number; denominator: number };
  right: { numerator: number; denominator: number };
  result: { numerator: number; denominator: number };
  style?: 'bar' | 'circle';
}): ConceptBlock => ({
  kind: 'fractionAddition',
  left: params.left,
  right: params.right,
  result: params.result,
  style: params.style ?? 'bar',
});

export const numberLine = (params: {
  from: number;
  to: number;
  step: number;
  highlight?: number[];
}): ConceptBlock => ({
  kind: 'numberLine',
  from: params.from,
  to: params.to,
  step: params.step,
  highlight: params.highlight,
});

export const mathExpression = (latex: string): ConceptBlock => ({
  kind: 'mathExpression',
  latex,
});

export const analogClock = (hours: number, minutes: number): ConceptBlock => ({
  kind: 'analogClock',
  hours,
  minutes,
  interactive: false,
});

export const percentBar = (percent: number, label?: string): ConceptBlock => ({
  kind: 'percentBar',
  percent,
  label,
});
