// lib/timetable/generator.ts
//
// Runtime question generator for the สูตรคูณ (multiplication tables) drill.
// Produces MCQ questions (4 choices) for a given table + round. Rounds escalate
// from straight "table × N" through commutativity (swapped) to mixed-review
// with earlier tables — see config.ts ROUNDS.

import { mcqText } from '@/lib/curricula/helpers/question-builders';
import type { MultipleChoiceTextQuestion } from '@/types/curriculum';
import {
  MULTIPLICAND_MAX,
  MULTIPLICAND_MIN,
  QUESTIONS_PER_ROUND,
  ROUNDS,
  tablesLearnedBefore,
  type RoundMode,
} from './config';

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

const shuffle = <T>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// One factor pair (a × b) chosen for a round, with the display orientation.
interface Fact {
  a: number; // left factor (shown first)
  b: number; // right factor
}

// Build the set of facts for a round before turning them into MCQs. The shape
// of the pool depends on the round mode.
function buildFacts(table: number, mode: RoundMode): Fact[] {
  const multiplicands = Array.from(
    { length: MULTIPLICAND_MAX - MULTIPLICAND_MIN + 1 },
    (_, i) => i + MULTIPLICAND_MIN,
  );
  const review = tablesLearnedBefore(table);

  // direct: always table × N
  const direct = (): Fact[] => multiplicands.map((n) => ({ a: table, b: n }));

  // swapped: half table×N, half N×table (commutativity)
  const swapped = (): Fact[] =>
    multiplicands.map((n) =>
      Math.random() < 0.5 ? { a: table, b: n } : { a: n, b: table },
    );

  let pool: Fact[];
  if (mode === 'direct') {
    pool = direct();
  } else if (mode === 'swapped') {
    pool = swapped();
  } else if (mode === 'mixed') {
    // This table (swapped) + a sprinkle of earlier tables for spaced review.
    pool = swapped();
    if (review.length > 0) {
      const reviewFacts: Fact[] = Array.from({ length: 8 }, () => {
        const t = pick(review);
        const n = randInt(MULTIPLICAND_MIN, MULTIPLICAND_MAX);
        return Math.random() < 0.5 ? { a: t, b: n } : { a: n, b: t };
      });
      pool = [...pool, ...reviewFacts];
    }
  } else {
    // 'all': current table both ways + a wider review draw across all earlier.
    pool = [...direct(), ...swapped()];
    if (review.length > 0) {
      const reviewFacts: Fact[] = Array.from({ length: 12 }, () => {
        const t = pick(review);
        const n = randInt(MULTIPLICAND_MIN, MULTIPLICAND_MAX);
        return Math.random() < 0.5 ? { a: t, b: n } : { a: n, b: t };
      });
      pool = [...pool, ...reviewFacts];
    }
  }

  return pool;
}

// Plausible wrong answers near the correct product: off-by-one-row, off-by-one
// factor, and a near miss. Kids should have to actually know the fact.
function distractors(a: number, b: number): number[] {
  const correct = a * b;
  const candidates = new Set<number>();
  const tries = [
    a * (b + 1),
    a * (b - 1),
    (a + 1) * b,
    (a - 1) * b,
    correct + a,
    correct - a,
    correct + b,
    correct - b,
    correct + 1,
    correct - 1,
  ];
  for (const c of tries) {
    if (c > 0 && c !== correct) candidates.add(c);
  }
  return shuffle([...candidates]).slice(0, 3);
}

// Generate one round's worth of MCQ questions.
export function generateRound(
  table: number,
  roundNumber: number,
): MultipleChoiceTextQuestion[] {
  const def = ROUNDS.find((r) => r.round === roundNumber) ?? ROUNDS[0];
  const pool = buildFacts(table, def.mode);

  const questions: MultipleChoiceTextQuestion[] = [];
  for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
    const fact = pick(pool);
    const correct = fact.a * fact.b;
    const wrongs = distractors(fact.a, fact.b);
    // Ensure exactly 4 unique choices even if distractors came up short.
    const choiceValues = new Set<number>([correct, ...wrongs]);
    let pad = correct + 2;
    while (choiceValues.size < 4) {
      if (pad !== correct && pad > 0) choiceValues.add(pad);
      pad += 1;
    }

    const choices = shuffle([...choiceValues]).map((v) => ({
      id: `c${v}`,
      text: String(v),
    }));

    questions.push(
      mcqText({
        id: `tt-${table}-r${roundNumber}-q${i}-${fact.a}x${fact.b}`,
        prompt: `${fact.a} × ${fact.b} = ?`,
        choices,
        correctChoiceId: `c${correct}`,
        // Choices are already shuffled here; don't reshuffle in the view or the
        // correctChoiceId mapping by value stays stable but positions wouldn't.
        shuffleChoices: false,
      }),
    );
  }

  return questions;
}
