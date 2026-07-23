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

// Which game "skin" plays a given stage. Chosen by CONTEXT, not at random:
// single-key drills (stage 1) suit Dino Shoot — one keystroke = one shot,
// punchy rhythm; WORD stages race the Typing Racer — a whole word rides the
// rival's roof sign with read-ahead time as you close in; combos/runs keep
// Space Defense. One function so the mapping lives in exactly one place.
// ('sushi' was built too but read as silly — it survives in /game-test only.)
export type GameId = 'space' | 'dino' | 'sushi' | 'racer';

export const gameForStage = (unitNumber: number, stage: number): GameId => {
  const kind = stageKind(unitNumber, stage);
  if (kind === 'keys') return 'dino';
  if (kind === 'words') return 'racer';
  return 'space';
};

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
      thaiHint: 'ช่วยไดโนยิงก้อนหินที่กลิ้งมาทีละตัว — วางนิ้วตามสีบนแป้น!',
      enHint: 'Help Dino blast the rolling rocks — match your fingers to the key colors!',
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
        thaiHint: 'คำศัพท์อยู่บนหลังคารถคันหน้า 🏎️ — พิมพ์ทั้งคำให้จบ เหยียบไนโตรแซงเลย!',
        enHint: 'Words ride the rival car ahead 🏎️ — type the whole word to hit nitro and overtake!',
      };
}

// ----- Round sizing -----
export const TARGETS_S1 = 30;   // single-key targets in stage 1
export const COMBOS_S2 = 14;    // sequences in stage 2
export const WORDS_S3 = 12;     // words in stage 3
export const RUNS_S3 = 12;      // rhythm chunks in early-unit stage 3

// ----- Pass / reward -----
export const PASSING_ACCURACY = 0.85; // accuracy = targets / (targets + errors)
// Difficulty-scaled payout (2026-07-23 rebalance — flat 10 read as stingy on
// hard days): the base climbs +3 every 10 days, perfect pays HALF the base on
// top, so a late-game perfect run lands ~50-60 coins while day 1 stays ~15.
// Anti-farm (rule #13) intact: full payout is FIRST CLEAR ONLY; replays pay
// the same small flat bonus as ever.
export const dayBaseExp = (day: number) =>
  10 + Math.floor((day - 1) / 10) * 3; // day 1-10 → 10 … day 91-100 → 37
export const stageBaseExp = (unit: number) => 10 + (unit - 1) * 2; // classic route
export const perfectBonus = (base: number) => Math.floor(base / 2);
export const EXP_PER_ROUND = 10; // floor/base for anything unscaled
export const EXP_PER_PERFECT_BONUS = 5; // legacy flat perfect (classic paths)
export const SCORE_PER_ROUND = 2;
// เล่นซ้ำรอบที่เคยผ่านแล้วยังได้เหรียญเล็กน้อย (ฝึกซ้ำไม่ฟรีเปล่า แต่ไม่คุ้มไว้ปั๊ม)
export const EXP_PER_REPLAY = 3;

// Meteor fall time (seconds) per rock — generous, eases down as units go up.
// Reaching the shield line is a soft miss (1 error), never a game over.
// The dino runner feels sluggish at the meteor's leisurely drift, so its
// obstacles arrive faster (endless-runner pace) via GAME_SPEED below.
export function meteorSeconds(unitNumber: number, stage: number): number {
  const base = 14 - Math.min(unitNumber, 8) * 0.5; // 13.5s (U1) → 10s (U8+)
  const seconds = stage === 1 ? base : base + 4; // multi-char rocks get extra time
  return seconds * GAME_SPEED[gameForStage(unitNumber, stage)];
}

// Per-game pace multiplier on the approach time. 1 = meteor's leisurely drift;
// < 1 = faster. Dino Run is a runner — its obstacles rush in.
const GAME_SPEED: Record<GameId, number> = {
  space: 1,
  dino: 0.6,
  sushi: 1, // the belt glides at the meteor's leisurely read-ahead pace
  racer: 0.85, // rivals close in a touch quicker — it's a race
};

// Within-round pace ramp: the first target gets the full approach time, the
// last gets RAMP_END × that — the round speeds up as the kid warms up, so
// late-round targets feel like a streak instead of the same slow drift.
// Applies on top of the per-unit easing and GAME_SPEED.
const RAMP_END = 0.7;

export function roundPace(rockIndex: number, totalRocks: number): number {
  if (totalRocks <= 1) return 1;
  const t = Math.min(1, rockIndex / (totalRocks - 1));
  return 1 - t * (1 - RAMP_END);
}

// ----- Combo-driven adaptive speed -----
// The kid's live combo IS the difficulty dial: every 5 combo, newly-spawned
// targets approach 5% faster, capped at 25% (floor 0.75). Any error or miss
// resets the combo — and with it the speed — so the rubber band loosens the
// moment the pace outruns the kid. Feedback is free: the 🔥×N badge they
// already watch is literally the speed knob (⚡ appears when boosted).
export const COMBO_SPEED_STEP = 5;   // combo per speed step
export const COMBO_SPEED_DROP = 0.05; // approach-time cut per step
export const COMBO_SPEED_FLOOR = 0.75; // max 25% faster

export const comboPace = (combo: number): number =>
  Math.max(
    COMBO_SPEED_FLOOR,
    1 - Math.floor(combo / COMBO_SPEED_STEP) * COMBO_SPEED_DROP,
  );

// ----- Stage modifiers (opt-in per stage; see stageMods) -----
// Timed = the round has a countdown; typing fast leaves time on the clock,
// which pays a small first-clear-only EXP bonus. Running out of time is NEVER
// a fail — the kid keeps playing, they just forfeit the bonus (soft-fail
// philosophy preserved). maxConcurrent lets 2+ obstacles share the field.
export interface StageMods {
  timed?: {
    /** Time limit = ceil(total keystrokes × secondsPerChar). */
    secondsPerChar: number;
    /** Max EXP for finishing with time to spare (0..this, first clear only). */
    bonusExpMax: number;
    /** Each counted wrong key subtracts this many seconds from the remaining
      * clock. undefined = no penalty. Only ever eats the bonus (clamps at 0);
      * never fails the round. Wired but disabled in v1 (no stage enables it). */
    errorPenaltySeconds?: number;
  };
  /** Obstacles allowed on the field at once. Default 1 (classic single-rock).
    * The active target is always the frontmost; the rest are visible-but-dim. */
  maxConcurrent?: number;
}

export const TIMED_SECONDS_PER_CHAR = 2.5; // ~12 words ≈ 48 keys ≈ 120s — generous
export const EXP_TIME_BONUS_MAX = 5;       // same ceiling as the perfect bonus
export const SPAWN_GAP = 0.45;             // next rock spawns when the front rock
                                           // reaches this progress (multi-obstacle)

// Which modifiers apply to a stage. ONE place to change the rollout. v1:
//   • stage 1 (learning new keys) → never modified (focus on one key)
//   • stage 2, units 6-10 → two obstacles at once (kids are fluent by then)
//   • stage 3, units 4-10 (words) → timed bonus
//   • units 1-3 → nothing (beginners)
//   • never stack both mods on one stage in v1
export function stageMods(unit: number, stage: number): StageMods {
  if (stage === 3 && unit >= 4) {
    return {
      timed: {
        secondsPerChar: TIMED_SECONDS_PER_CHAR,
        bonusExpMax: EXP_TIME_BONUS_MAX,
        // errorPenaltySeconds intentionally omitted in v1 — flip on here later.
      },
    };
  }
  if (stage === 2 && unit >= 6) {
    return { maxConcurrent: 2 };
  }
  return {};
}
