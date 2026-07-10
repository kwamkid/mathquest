// lib/typing/content.ts
//
// Runtime content generator for typing rounds (mirrors the timetable
// generator's role). A round is a queue of "rocks" (meteor targets): each
// rock carries the text the kid must type, char by char. Spaces never appear
// inside a rock — the thumb/space practice happens IN stage-1 rounds as a
// dedicated space rock between letter chunks.

import { wordsFor } from './words';
import {
  COMBOS_S2,
  keysLearnedThrough,
  RUNS_S3,
  stageKind,
  TARGETS_S1,
  unitDef,
  WORDS_S3,
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

// One meteor. `text` is what the kid types to destroy it (1..n chars).
export interface Rock {
  id: string;
  text: string;
}

export function generateStageRocks(unit: number, stage: number): Rock[] {
  const kind = stageKind(unit, stage);
  const def = unitDef(unit);
  const newKeys = def?.newKeys ?? ['f', 'j'];
  const learned = keysLearnedThrough(unit);
  // Review pool = keys from EARLIER units (empty for unit 1).
  const review = learned.filter((k) => !newKeys.includes(k));

  // Weighted single key: 60% new, 40% review (all-new when no review yet).
  const weightedKey = () =>
    review.length > 0 && Math.random() < 0.4 ? pick(review) : pick(newKeys);

  let texts: string[];

  if (kind === 'keys') {
    // Stage 1: single-letter rocks + a space rock after every few letters
    // (space is a real target from unit 1 — teaches the thumb).
    texts = [];
    let sinceSpace = 0;
    while (texts.length < TARGETS_S1) {
      if (sinceSpace >= randInt(3, 5)) {
        texts.push(' ');
        sinceSpace = 0;
      } else {
        texts.push(weightedKey());
        sinceSpace++;
      }
    }
  } else if (kind === 'combos') {
    // Stage 2: 2-4 char sequences, each containing ≥1 new key.
    texts = Array.from({ length: COMBOS_S2 }, () => {
      const len = randInt(2, 4);
      const chars = Array.from({ length: len }, weightedKey);
      if (!chars.some((c) => newKeys.includes(c))) {
        chars[randInt(0, len - 1)] = pick(newKeys);
      }
      return chars.join('');
    });
  } else if (kind === 'runs') {
    // Early-unit stage 3: rhythm runs like "fjf", "ffjj", "jfjf" — longer
    // than combos, tiny key pool.
    texts = Array.from({ length: RUNS_S3 }, () => {
      const len = randInt(4, 6);
      return Array.from({ length: len }, weightedKey).join('');
    });
  } else {
    // Words: sample from the filtered pool, biased so at least a third of
    // the round exercises this unit's new keys.
    const pool = wordsFor(learned);
    const withNew = shuffle(pool.filter((w) => newKeys.some((k) => w.includes(k))));
    const rest = shuffle(pool.filter((w) => !withNew.includes(w)));
    const minNew = Math.min(withNew.length, Math.ceil(WORDS_S3 / 3));
    texts = shuffle(
      [...withNew.slice(0, minNew), ...rest, ...withNew.slice(minNew)].slice(0, WORDS_S3),
    );
  }

  return texts.map((text, i) => ({ id: `rock-${i}-${text}`, text }));
}

// Total keystrokes in a round (accuracy denominator base).
export const totalTargets = (rocks: Rock[]): number =>
  rocks.reduce((sum, r) => sum + r.text.length, 0);
