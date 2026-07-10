// lib/typing/config.ts
//
// Typing tutor (ฝึกพิมพ์ดีด) curriculum config — EN (QWERTY) track v1.
//
// Progression mirrors the timetable mode: 10 units in touch-typing order
// (home row index fingers first, out to the pinkies, then top/bottom rows),
// each unit = 3 stages = 3 stars. Passing stage 1 (the first star) unlocks
// the NEXT unit immediately; stages 2-3 are optional mastery.
//
// v1 is lowercase a-z + spacebar ONLY — no `;`/punctuation, because on the
// iPad on-screen keyboard those live behind the .?123 layer and the game
// must feel identical on desktop and iPad.
//
// Unit numbers are baked into persisted stage ids (ty-en-{unit}-s{stage}
// in completedLessonIds) — NEVER renumber units; append new ones instead.

export type StageKind = 'keys' | 'combos' | 'words' | 'runs';

export interface UnitDef {
  number: number;       // 1-based, persisted in ids — keep stable
  newKeys: string[];    // keys introduced by this unit (lowercase)
  thaiLabel: string;    // finger story, Thai
  enLabel: string;      // finger story, English
}

export const UNITS: UnitDef[] = [
  { number: 1, newKeys: ['f', 'j'], thaiLabel: 'นิ้วชี้ + Space', enLabel: 'Index fingers + Space' },
  { number: 2, newKeys: ['d', 'k'], thaiLabel: 'นิ้วกลาง', enLabel: 'Middle fingers' },
  { number: 3, newKeys: ['s', 'l'], thaiLabel: 'นิ้วนาง', enLabel: 'Ring fingers' },
  { number: 4, newKeys: ['a', 'g', 'h'], thaiLabel: 'ครบ home row!', enLabel: 'Home row complete!' },
  { number: 5, newKeys: ['e', 'i'], thaiLabel: 'แถวบน นิ้วกลาง', enLabel: 'Top row, middle fingers' },
  { number: 6, newKeys: ['r', 'u'], thaiLabel: 'แถวบน นิ้วชี้', enLabel: 'Top row, index fingers' },
  { number: 7, newKeys: ['t', 'y'], thaiLabel: 'นิ้วชี้เอื้อมเข้า', enLabel: 'Index reach-in' },
  { number: 8, newKeys: ['w', 'o', 'q', 'p'], thaiLabel: 'แถวบนด้านนอก', enLabel: 'Top row outer' },
  { number: 9, newKeys: ['v', 'm', 'b', 'n'], thaiLabel: 'แถวล่าง นิ้วชี้', enLabel: 'Bottom row, index' },
  { number: 10, newKeys: ['c', 'x', 'z'], thaiLabel: 'ครบทุกตัว a-z!', enLabel: 'Full alphabet!' },
];

export const STAGES_PER_UNIT = 3;

// Cumulative keys learned through (and including) the given unit.
export function keysLearnedThrough(unitNumber: number): string[] {
  return UNITS.filter((u) => u.number <= unitNumber).flatMap((u) => u.newKeys);
}

export const unitDef = (unitNumber: number): UnitDef | undefined =>
  UNITS.find((u) => u.number === unitNumber);

// Units 1-3 don't have enough letters (no vowels) to spell real words, so
// their stage 3 is rhythm "key runs" instead. Explicit here — no runtime
// fallback.
export const stage3Kind = (unitNumber: number): StageKind =>
  unitNumber <= 3 ? 'runs' : 'words';

export const stageKind = (unitNumber: number, stage: number): StageKind =>
  stage === 1 ? 'keys' : stage === 2 ? 'combos' : stage3Kind(unitNumber);

export interface StageMeta {
  stage: number;
  thaiTitle: string;
  enTitle: string;
  thaiHint: string;
  enHint: string;
}

// Titles/hints per stage; stage 3 differs for runs vs words units.
export function stageMeta(unitNumber: number, stage: number): StageMeta {
  if (stage === 1) {
    return {
      stage: 1,
      thaiTitle: 'รู้จักแป้น',
      enTitle: 'Keys',
      thaiHint: 'ยิงอุกกาบาตตัวอักษรทีละตัว — วางนิ้วตามสีบนแป้น!',
      enHint: 'Zap one letter at a time — match your fingers to the key colors!',
    };
  }
  if (stage === 2) {
    return {
      stage: 2,
      thaiTitle: 'จับคู่',
      enTitle: 'Combos',
      thaiHint: 'หินก้อนใหญ่ขึ้น มี 2-4 ตัวอักษร — พิมพ์รัวๆ ให้แตก!',
      enHint: 'Bigger rocks with 2-4 letters — type fast to smash them!',
    };
  }
  return stage3Kind(unitNumber) === 'runs'
    ? {
        stage: 3,
        thaiTitle: 'รัวแป้น',
        enTitle: 'Key runs',
        thaiHint: 'จังหวะยาวขึ้น — พิมพ์ให้ลื่นไม่สะดุด!',
        enHint: 'Longer rhythms — keep the flow going!',
      }
    : {
        stage: 3,
        thaiTitle: 'คำศัพท์',
        enTitle: 'Words',
        thaiHint: 'หินคำศัพท์ภาษาอังกฤษ — พิมพ์ทั้งคำให้ระเบิด!',
        enHint: 'English word rocks — type the whole word to blow them up!',
      };
}

// ----- Round sizing -----
export const TARGETS_S1 = 30;   // single-key targets in stage 1
export const COMBOS_S2 = 14;    // sequences in stage 2
export const WORDS_S3 = 12;     // words in stage 3
export const RUNS_S3 = 12;      // rhythm chunks in early-unit stage 3

// ----- Pass / reward (same economy as timetable) -----
export const PASSING_ACCURACY = 0.85; // accuracy = targets / (targets + errors)
export const EXP_PER_ROUND = 10;
export const EXP_PER_PERFECT_BONUS = 5; // perfect = zero errors
export const SCORE_PER_ROUND = 2;

// Meteor fall time (seconds) per rock — generous, eases down as units go up.
// Reaching the shield line is a soft miss (1 error), never a game over.
export function meteorSeconds(unitNumber: number, stage: number): number {
  const base = 14 - Math.min(unitNumber, 8) * 0.5; // 13.5s (U1) → 10s (U8+)
  return stage === 1 ? base : base + 4; // multi-char rocks get extra time
}
