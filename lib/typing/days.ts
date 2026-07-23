// lib/typing/days.ts
//
// The "แผน 100 วัน" — the typing mode's single main path. 100 ordered lessons
// ("days" — NOT calendar days; play as many per real day as you like) that
// wrap the existing 10-unit curriculum and then grow past it:
//
//   Phase A (1-50)  : 10 units × 5-day blocks — learn keys WITH their words
//   Phase B (51-70) : sentences become the main dish        (increment 3)
//   Phase C (71-90) : adaptive speed + WPM targets          (increment 4)
//   Phase D (91-100): marathon + day-100 Grand Test         (increment 4)
//
// A Phase-A block for unit u (day = (u-1)*5 + slot):
//   slot 1  แป้นใหม่     = stage 1 (keys)   → earns the unit's ⭐ star 1
//   slot 2  คำเทียม      = stage 2 (combos) → star 2
//   slot 3  คำจริง       = stage 3 (words)  → star 3
//   slot 4  ผสม+ทบทวน   = new practice day (ty-day id)
//   slot 5  ด่านท้าทาย   = new challenge day (ty-day id); unit ≥5 ends with
//                          2-3-word sentences (arrives with sentences.ts)
// Slot 1-3 days append a 12-rock practice segment (learn → drill in one run).
//
// Day ids `ty-day-{n}` are persisted — NEVER renumber days; the slot 1-3 ↔
// stage-star equivalence is what keeps old players' progress intact.

import { generateStageRocks, type Rock } from './content';
import { pickSentences } from './sentences';
import { wordsFor } from './words';
import {
  gameForStage,
  keysLearnedThrough,
  stageMods,
  unitDef,
  type GameId,
  type StageMods,
} from './config';

export const TOTAL_DAYS = 100;

// Phase bands for the landing's day list (labels are kid-facing content, so
// they live here beside dayPlan's labels, not in the i18n chrome strings).
export const PHASES: {
  key: 'A' | 'B' | 'C' | 'D';
  from: number;
  to: number;
  labelTh: string;
  labelEn: string;
  emoji: string;
}[] = [
  { key: 'A', from: 1, to: 50, labelTh: 'เรียนแป้น + คำศัพท์', labelEn: 'Keys & words', emoji: '⌨️' },
  { key: 'B', from: 51, to: 70, labelTh: 'ประโยค', labelEn: 'Sentences', emoji: '📖' },
  { key: 'C', from: 71, to: 90, labelTh: 'สปีดมาสเตอร์', labelEn: 'Speed master', emoji: '⚡' },
  { key: 'D', from: 91, to: 100, labelTh: 'มาราธอน', labelEn: 'Marathon', emoji: '🏆' },
];

// Streak milestones — one-time coin bonuses at N consecutive calendar days.
export const DAY_MILESTONES: Record<number, number> = {
  7: 15,
  30: 30,
  50: 50,
  100: 100,
};

// Phase-A generation tuning.
export const DAY_MIX_RATIO = 0.3; // share of word rocks interleaved into slot 1-2 cores
export const PRACTICE_SIZE = 12; // rocks in the appended practice segment (slot 1-3)
const MIX_REVIEW_SIZE = 26; // rocks on a slot-4 mix+review day
const CHALLENGE_SIZE = 24; // rocks on a slot-5 unit-challenge day

export type DayKind =
  | 'keys' // slot 1
  | 'combos' // slot 2
  | 'words' // slot 3
  | 'mixReview' // slot 4
  | 'unitChallenge' // slot 5
  | 'sentences' // Phase B
  | 'wpm' // Phase C
  | 'marathon'; // Phase D

export interface DayPlan {
  day: number;
  phase: 'A' | 'B' | 'C' | 'D';
  kind: DayKind;
  /** Kid-facing label — no typing-teacher jargon. */
  labelTh: string;
  labelEn: string;
  /** Content unit this day draws from (Phase A: the block's unit; B-D: 10). */
  unit: number;
  /** Phase A only: position in the unit's 5-day block. */
  slot?: 1 | 2 | 3 | 4 | 5;
  /** Set for slot 1-3 — completing the day clears this real stage (star). */
  stageRef?: { unit: number; stage: number };
  /** Which existing stage's fall-timing curve this day borrows. */
  timingStage: number;
  mods: StageMods;
  /** Multiplier on approach time (<1 = faster). */
  speedFactor: number;
  gameId: GameId;
  /** Phase C goal shown on the result screen (soft — never a fail). */
  wpmTarget?: number;
}

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const shuffle = <T,>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// ---------------------------------------------------------------------------
// dayPlan — pure metadata for one day (no randomness; safe for lists/grids).
// ---------------------------------------------------------------------------

export function dayPlan(day: number): DayPlan {
  const n = Math.min(Math.max(1, Math.floor(day)), TOTAL_DAYS);

  if (n <= 50) {
    const unit = Math.ceil(n / 5);
    const slot = (((n - 1) % 5) + 1) as 1 | 2 | 3 | 4 | 5;
    const keys = (unitDef(unit)?.newKeys ?? [])
      .map((k) => k.toUpperCase())
      .join(' ');
    const base = {
      day: n,
      phase: 'A' as const,
      unit,
      slot,
    };
    switch (slot) {
      case 1:
        return {
          ...base,
          kind: 'keys',
          labelTh: `แป้นใหม่ ${keys}`,
          labelEn: `New keys ${keys}`,
          stageRef: { unit, stage: 1 },
          timingStage: 1,
          mods: stageMods(unit, 1),
          speedFactor: 1,
          gameId: gameForStage(unit, 1),
        };
      case 2:
        return {
          ...base,
          kind: 'combos',
          labelTh: `คำเทียมของ ${keys}`,
          labelEn: `${keys} letter combos`,
          stageRef: { unit, stage: 2 },
          timingStage: 2,
          mods: stageMods(unit, 2),
          speedFactor: 1,
          gameId: gameForStage(unit, 2),
        };
      case 3:
        return {
          ...base,
          kind: 'words',
          labelTh: `คำศัพท์ของ ${keys}`,
          labelEn: `${keys} words`,
          stageRef: { unit, stage: 3 },
          timingStage: 3,
          mods: stageMods(unit, 3),
          speedFactor: 1,
          gameId: gameForStage(unit, 3),
        };
      case 4:
        return {
          ...base,
          kind: 'mixReview',
          labelTh: 'ผสมคำ + ทบทวน',
          labelEn: 'Mix & review',
          timingStage: 3,
          mods: {},
          speedFactor: 1,
          gameId: 'space',
        };
      default:
        return {
          ...base,
          kind: 'unitChallenge',
          labelTh: unit >= 5 ? 'ด่านท้าทาย + ประโยคแรก!' : 'ด่านท้าทาย',
          labelEn: unit >= 5 ? 'Challenge + first sentences!' : 'Unit challenge',
          timingStage: 3,
          mods: {},
          speedFactor: 0.9,
          gameId: 'space',
        };
    }
  }

  // Phases B-D — metadata now (labels for the dot grid / hero); content
  // generation arrives in increments 3-4. All draw on the full alphabet.
  if (n <= 70) {
    return {
      day: n,
      phase: 'B',
      kind: 'sentences',
      labelTh: n <= 60 ? 'ประโยคสั้น' : 'ประโยคยาวขึ้น',
      labelEn: n <= 60 ? 'Short sentences' : 'Longer sentences',
      unit: 10,
      timingStage: 3,
      mods: {
        timed: { secondsPerChar: 2.5, bonusExpMax: 5 },
        ...(n >= 66 ? { maxConcurrent: 2 } : {}),
      },
      speedFactor: 0.9,
      gameId: 'space',
    };
  }
  if (n <= 90) {
    // WPM target climbs 12 → 20 across the phase (result-screen goal, never
    // a fail condition — soft-fail philosophy holds to the end).
    const wpmTarget = Math.round(12 + ((n - 71) / (90 - 71)) * 8);
    return {
      day: n,
      phase: 'C',
      kind: 'wpm',
      labelTh: `สปีดมาสเตอร์ 🎯 ${wpmTarget} WPM`,
      labelEn: `Speed master 🎯 ${wpmTarget} WPM`,
      unit: 10,
      timingStage: 3,
      mods: {
        timed: {
          secondsPerChar: 2.5,
          bonusExpMax: 5,
          ...(n >= 81 ? { errorPenaltySeconds: 2 } : {}),
        },
      },
      wpmTarget,
      speedFactor: 0.85,
      gameId: 'space',
    };
  }
  return {
    day: n,
    phase: 'D',
    kind: 'marathon',
    labelTh: n === 100 ? 'Grand Test วันสุดท้าย! 🏆' : 'มาราธอน',
    labelEn: n === 100 ? 'Grand Test — final day! 🏆' : 'Marathon',
    unit: 10,
    timingStage: 3,
    mods: {
      timed: { secondsPerChar: 2.5, bonusExpMax: 5, errorPenaltySeconds: 2 },
    },
    speedFactor: 0.8,
    gameId: 'space',
  };
}

// ---------------------------------------------------------------------------
// Rock generation
// ---------------------------------------------------------------------------

// A sentence rendered as a run of rocks (word + space + word …) inside the
// round. The engine's tracker bar highlights the word being typed.
export interface SentenceSpan {
  text: string;
  /** Round index of the span's first rock (inclusive). */
  startIndex: number;
  /** Round index of the span's last rock (inclusive). */
  endIndex: number;
}

export interface DayRocks {
  rocks: Rock[];
  /** Index where the appended practice segment begins — equals rocks.length
    * when the day has no separate practice segment (slot 4-5, phases B-D). */
  practiceStartIndex: number;
  /** Sentence runs in this round (unit-challenge tails, Phase B), if any. */
  sentences?: SentenceSpan[];
}

// Append sentences to a rock queue as word-rocks + space-rocks, recording
// each sentence's span so the HUD can track it. Mutates `rocks`, returns
// the spans.
function appendSentenceRocks(
  rocks: Rock[],
  sentences: { text: string }[],
): SentenceSpan[] {
  const spans: SentenceSpan[] = [];
  for (const [si, s] of sentences.entries()) {
    const startIndex = rocks.length;
    const words = s.text.split(' ');
    words.forEach((word, wi) => {
      rocks.push({ id: `sent-${si}-w${wi}-${word}`, text: word });
      if (wi < words.length - 1) {
        rocks.push({ id: `sent-${si}-sp${wi}`, text: ' ' });
      }
    });
    spans.push({ text: s.text, startIndex, endIndex: rocks.length - 1 });
  }
  return spans;
}

// Short real words (≤4 chars) spellable through the given unit — or pseudo
// words from the learned keys when the pool is empty (units 1-3 can't spell
// anything real yet; the kid was explicitly fine with meaningless combos).
function shortWordPool(throughUnit: number): string[] {
  const learned = keysLearnedThrough(throughUnit);
  const real = wordsFor(learned).filter((w) => w.length <= 4);
  return real;
}

function pseudoWord(letters: string[], len: number): string {
  return Array.from({ length: len }, () => pick(letters)).join('');
}

// A word-ish rock text drawn from the unit's world: real short word when the
// pool allows, pseudo combo otherwise.
function wordish(throughUnit: number): string {
  const pool = shortWordPool(throughUnit);
  if (pool.length > 0) return pick(pool);
  return pseudoWord(keysLearnedThrough(throughUnit), randInt(2, 4));
}

// Interleave word rocks into a core queue: after every 3-4 core rocks, insert
// one word from the cumulative pool (DAY_MIX_RATIO caps the total share).
function interleaveMix(core: Rock[], unit: number): Rock[] {
  const maxInserts = Math.floor(core.length * DAY_MIX_RATIO);
  if (maxInserts === 0) return core;
  const out: Rock[] = [];
  let sinceInsert = 0;
  let gap = randInt(3, 4);
  let inserted = 0;
  for (const rock of core) {
    out.push(rock);
    sinceInsert++;
    if (inserted < maxInserts && sinceInsert >= gap && rock.text !== ' ') {
      out.push({ id: `mix-${inserted}-${out.length}`, text: wordish(unit) });
      inserted++;
      sinceInsert = 0;
      gap = randInt(3, 4);
    }
  }
  return out;
}

// The 12-rock practice segment appended to slot 1-3 days: half today's new
// keys (singles / combos / words containing them), half review of everything
// learned before — spaced repetition baked into every lesson.
function practiceBlock(unit: number): Rock[] {
  const newKeys = unitDef(unit)?.newKeys ?? ['f', 'j'];
  const prevLearned = keysLearnedThrough(unit).filter(
    (k) => !newKeys.includes(k),
  );
  const todayPool = shortWordPool(unit).filter((w) =>
    newKeys.some((k) => w.includes(k)),
  );
  const reviewPool =
    unit > 1 ? shortWordPool(unit - 1) : ([] as string[]);

  const todayCount = Math.ceil(PRACTICE_SIZE / 2);
  const texts: string[] = [];
  for (let i = 0; i < PRACTICE_SIZE; i++) {
    const today = i < todayCount;
    if (today) {
      // Today's keys: word containing a new key, or a new-key combo.
      texts.push(
        todayPool.length > 0 && Math.random() < 0.6
          ? pick(todayPool)
          : pseudoWord(newKeys, randInt(2, 3)),
      );
    } else if (reviewPool.length > 0 && Math.random() < 0.6) {
      texts.push(pick(reviewPool));
    } else if (prevLearned.length > 0) {
      texts.push(pseudoWord(prevLearned, randInt(2, 3)));
    } else {
      texts.push(pseudoWord(newKeys, randInt(2, 3)));
    }
  }
  return shuffle(texts).map((text, i) => ({
    id: `practice-${i}-${text}`,
    text,
  }));
}

// Slot 4 — mix + review day: half today's unit, half everything before it.
function mixReviewRocks(unit: number): Rock[] {
  const newKeys = unitDef(unit)?.newKeys ?? ['f', 'j'];
  const todayPool = shortWordPool(unit).filter((w) =>
    newKeys.some((k) => w.includes(k)),
  );
  const reviewPool = unit > 1 ? shortWordPool(unit - 1) : [];
  const texts: string[] = [];
  for (let i = 0; i < MIX_REVIEW_SIZE; i++) {
    const today = i % 2 === 0;
    const pool = today ? todayPool : reviewPool;
    if (pool.length > 0) {
      texts.push(pick(pool));
    } else {
      const letters = today ? newKeys : keysLearnedThrough(Math.max(1, unit - 1));
      texts.push(pseudoWord(letters, randInt(2, 4)));
    }
  }
  return shuffle(texts).map((text, i) => ({ id: `mix-${i}-${text}`, text }));
}

// Slot 5 — unit challenge: everything the unit taught, all shapes (single
// keys, combos, words), slightly faster (speedFactor 0.9 in the plan).
// From unit 5 the challenge ENDS with 2-3-word beginner sentences (letters
// filtered by minUnit), so sentences trickle in from day 25 instead of
// bunching up in Phase B — the mix is shortened to make room.
function challengeRocks(unit: number): DayRocks {
  const newKeys = unitDef(unit)?.newKeys ?? ['f', 'j'];
  const learned = keysLearnedThrough(unit);
  const pool = shortWordPool(unit);
  const sentences = unit >= 5 ? pickSentences(3, unit, { maxWords: 3 }) : [];
  const baseSize = sentences.length > 0 ? 16 : CHALLENGE_SIZE;

  const texts: string[] = [];
  for (let i = 0; i < baseSize; i++) {
    const r = Math.random();
    if (r < 0.25) {
      texts.push(pick(learned)); // single key
    } else if (r < 0.5 || pool.length === 0) {
      texts.push(pseudoWord(learned, randInt(2, 4))); // combo
    } else {
      texts.push(pick(pool)); // real word
    }
  }
  // Guarantee today's keys show up: force a few rocks onto the new keys.
  for (let i = 0; i < Math.min(4, texts.length); i++) {
    texts[i * 3 % texts.length] = pseudoWord(newKeys, randInt(2, 3));
  }
  const rocks: Rock[] = shuffle(texts).map((text, i) => ({
    id: `challenge-${i}-${text}`,
    text,
  }));
  const spans = appendSentenceRocks(rocks, sentences);
  return {
    rocks,
    practiceStartIndex: rocks.length,
    sentences: spans.length > 0 ? spans : undefined,
  };
}

// Phases B-D: a word warm-up, then sentences as the main dish. All draw on
// the full alphabet (a-z complete by day 50).
function lateDayRocks(day: number): DayRocks {
  const plan = dayPlan(day);
  const pool = wordsFor(keysLearnedThrough(10));

  // Shape per phase: B eases sentence length up; C is the speed phase (the
  // timed clock + wpmTarget carry the pressure); D is the long haul.
  const shape =
    plan.phase === 'B'
      ? day <= 60
        ? { warmup: 5, sentences: 6, minWords: 3, maxWords: 4 }
        : { warmup: 4, sentences: 6, minWords: 4, maxWords: 5 }
      : plan.phase === 'C'
        ? { warmup: 6, sentences: 4, minWords: 3, maxWords: 5 }
        : day === 100
          ? { warmup: 6, sentences: 8, minWords: 2, maxWords: 5 } // Grand Test
          : { warmup: 8, sentences: 6, minWords: 2, maxWords: 5 };

  const rocks: Rock[] = Array.from({ length: shape.warmup }, (_, i) => {
    const text = pick(pool);
    return { id: `warm-${i}-${text}`, text };
  });
  const sents = pickSentences(shape.sentences, 10, {
    minWords: shape.minWords,
    maxWords: shape.maxWords,
  });
  const spans = appendSentenceRocks(rocks, sents);
  return {
    rocks,
    practiceStartIndex: rocks.length,
    sentences: spans.length > 0 ? spans : undefined,
  };
}

// Freestyle round: 5 random sentences (any length, full alphabet) after a
// short word warm-up — the WPM arena's raw material. Same DayRocks shape so
// the engine's sentence tracker just works.
export function generateFreestyleRocks(): DayRocks {
  const pool = wordsFor(keysLearnedThrough(10));
  const rocks: Rock[] = Array.from({ length: 4 }, (_, i) => {
    const text = pick(pool);
    return { id: `warm-${i}-${text}`, text };
  });
  const spans = appendSentenceRocks(
    rocks,
    pickSentences(5, 10, { minWords: 2, maxWords: 5 }),
  );
  return {
    rocks,
    practiceStartIndex: rocks.length,
    sentences: spans.length > 0 ? spans : undefined,
  };
}

export function generateDayRocks(day: number): DayRocks {
  const plan = dayPlan(day);

  if (plan.phase !== 'A') {
    return lateDayRocks(day);
  }

  const unit = plan.unit;
  switch (plan.slot) {
    case 1:
    case 2: {
      // Core stage rocks with words woven in, then the practice segment.
      const core = interleaveMix(
        generateStageRocks(unit, plan.slot),
        unit,
      );
      const practice = practiceBlock(unit);
      return {
        rocks: [...core, ...practice],
        practiceStartIndex: core.length,
      };
    }
    case 3: {
      // Words core is already word practice — no interleave, just the
      // review-heavy practice segment after it.
      const core = generateStageRocks(unit, 3);
      const practice = practiceBlock(unit);
      return {
        rocks: [...core, ...practice],
        practiceStartIndex: core.length,
      };
    }
    case 4: {
      const rocks = mixReviewRocks(unit);
      return { rocks, practiceStartIndex: rocks.length };
    }
    default:
      return challengeRocks(unit);
  }
}
