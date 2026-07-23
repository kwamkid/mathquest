// lib/typing/sentences.ts
//
// Kid-simple English sentences for the typing game — lowercase a-z + spaces
// ONLY (no punctuation/capitals: iPad on-screen keyboard constraint, same as
// the word pool). Sentences are played as a queue of word-rocks with
// space-rocks between them; a tracker bar shows the whole sentence.
//
// Each sentence's `minUnit` — the earliest unit whose cumulative keys can
// spell it — is COMPUTED from the letters (not hand-tagged, so it can never
// drift from the curriculum). Sentences appear from day 25 (unit 5) onward,
// so bands minUnit ≤ 5..10 each need a healthy spread of 2-3 word sentences;
// longer ones (4-5 words) feed Phase B (days 51-70).

import { UNITS } from './config';

// letter → the unit that introduces it.
const LETTER_UNIT: Record<string, number> = {};
for (const u of UNITS) {
  for (const k of u.newKeys) LETTER_UNIT[k] = u.number;
}

export interface SentenceDef {
  text: string;
  /** Earliest unit whose cumulative keys can spell every letter. */
  minUnit: number;
  wordCount: number;
}

// Hand-authored pool. Keep words short and familiar (mostly from words.ts);
// silly-but-graspable beats formal. Grouped by the band they unlock in.
const RAW: string[] = [
  // --- spellable from unit 4 (f j d k s l a g h) ---
  'a glad dad',
  'half a glass',
  'a sad lad',
  'dad has a flag',
  // --- + e i (unit 5) ---
  'he is glad',
  'she is safe',
  'kids like fish',
  'he said hi',
  'she sails',
  'kids slide',
  'he hides',
  'a safe lake',
  'his idea',
  'dad likes fish',
  'she has skill',
  'a fish dish',
  'he feels glad',
  'she sees a seal',
  // --- + r u (unit 6) ---
  'she runs',
  'he reads',
  'he is sure',
  'kids run here',
  'she rides',
  'a red fish',
  'rulers are here',
  'her hair is red',
  'he hears her',
  'fresh air',
  'a rare shark',
  // --- + t y (unit 7) ---
  'try this',
  'stay here',
  'it is late',
  'they eat salad',
  'this is easy',
  'the yeti hides',
  'start the test',
  'the star is far',
  'they try hard',
  'a little turtle',
  'the tiger eats',
  'sisters share',
  'eight is great',
  // --- + w o q p (unit 8) ---
  'we play',
  'open the door',
  'stop the ship',
  'the sheep sleeps',
  'we go out',
  'hop to the top',
  'people like water',
  'the horse is happy',
  'we work together',
  'a purple tulip',
  'the pool is deep',
  'two plus two is four',
  'play at the park',
  'the quiet house',
  // --- + v m b n (unit 9) ---
  'my mom is here',
  'the moon is big',
  'monkeys jump',
  'we have fun',
  'seven plus nine',
  'the game begins',
  'ten men run',
  'a brave mouse',
  'the bear naps',
  'bananas are yummy',
  'my name is sam',
  'the sun is warm',
  'a bird sings',
  'time to begin',
  // --- + c x z (unit 10) ---
  'the cat is cool',
  'count to ten',
  'the zebra zooms',
  'we mix juice',
  'a nice cake',
  'the clock ticks',
  'six plus six',
  'crabs can zigzag',
  'the pizza is nice',
  'zero is a number',
  'the fox is quick',
  'i can see a star',
  'the red fox runs',
  'my mom makes cake',
  'we count the stars',
  'the crazy maze',
  'ice is very cold',
  'the excited monkey jumps',
];

// Validate + tag. Anything that slipped in with a bad character or a single
// word is dropped here rather than crashing a round.
export const SENTENCES: SentenceDef[] = RAW.flatMap((text) => {
  if (!/^[a-z]+( [a-z]+)+$/.test(text)) return [];
  let minUnit = 1;
  for (const ch of text) {
    if (ch === ' ') continue;
    const u = LETTER_UNIT[ch];
    if (u === undefined) return []; // letter outside the curriculum
    minUnit = Math.max(minUnit, u);
  }
  return [{ text, minUnit, wordCount: text.split(' ').length }];
});

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = <T,>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// Sentences a player at `maxUnit` can type, optionally bounded by length.
export function sentencesFor(
  maxUnit: number,
  opts: { minWords?: number; maxWords?: number } = {},
): SentenceDef[] {
  const { minWords = 2, maxWords = 5 } = opts;
  return SENTENCES.filter(
    (s) =>
      s.minUnit <= maxUnit &&
      s.wordCount >= minWords &&
      s.wordCount <= maxWords,
  );
}

// Random pick without repeats (falls back to fewer when the band is small).
export function pickSentences(
  count: number,
  maxUnit: number,
  opts: { minWords?: number; maxWords?: number } = {},
): SentenceDef[] {
  return shuffle(sentencesFor(maxUnit, opts)).slice(0, count);
}
