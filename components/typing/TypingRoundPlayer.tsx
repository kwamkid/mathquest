// components/typing/TypingRoundPlayer.tsx
//
// "Space Typing Defense" — plays one typing stage as a game: letter/word
// meteors drift down one at a time, the kid types the rock's text to zap it
// with the laser cannon. Must-correct model: a wrong key never advances (it
// shakes the rock + counts an error) so the target and the highlighted key
// hold still until hit. Rocks that reach the shield are a soft miss (+1
// error, rock dissolves) — there is no game over; accuracy decides the pass.
//
// Input comes from a hidden <input> read via beforeinput/input events (NOT
// keydown — the iOS software keyboard doesn't fire reliable keydowns), which
// makes desktop physical keyboards and the iPad OS keyboard share one path.
// iOS only opens its keyboard from a real user gesture, hence the mandatory
// "tap to start" intro and the tap-to-resume overlay on focus loss.

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
} from 'framer-motion';
import { Check, ChevronRight, Coins, Rocket, Star, X } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import LessonHeader from '@/components/lesson/LessonHeader';
import HandsGuide from '@/components/typing/HandsGuide';
import HomeRowGate from '@/components/typing/HomeRowGate';
import VirtualKeyboard from '@/components/typing/VirtualKeyboard';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import SpaceDefenseField from '@/components/typing/games/SpaceDefenseField';
import DinoRunField from '@/components/typing/games/DinoRunField';
import SushiBeltField from '@/components/typing/games/SushiBeltField';
import RacerField from '@/components/typing/games/RacerField';
import { useSound } from '@/lib/game/soundManager';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useDeviceClass } from '@/lib/useDeviceClass';
import { FINGER_COLORS, fingerForChar, LAYOUTS } from '@/lib/typing/layouts';
import { generateStageRocks, type Rock } from '@/lib/typing/content';
import {
  dayPlan,
  generateDayRocks,
  generateFreestyleRocks,
  TOTAL_DAYS,
} from '@/lib/typing/days';
import {
  findNextStage,
  getTypingProgress,
  saveFreestyle,
  saveTypingDay,
  saveTypingStage,
  stageId,
} from '@/lib/typing/progress';
import {
  comboPace,
  gameForStage,
  meteorSeconds,
  PASSING_ACCURACY,
  roundPace,
  SPAWN_GAP,
  stageKind,
  stageMeta,
  stageMods,
  unitDef,
} from '@/lib/typing/config';
import { totalTargets } from '@/lib/typing/content';
import type { GameFieldProps, LiveTarget } from '@/components/typing/games/types';

interface Props {
  /** Classic mode: play one raw unit/stage (old routes + day 1-30 surface). */
  unit?: number;
  stage?: number;
  /** 100-day plan mode: play day N — content, save path, and result CTA all
    * come from dayPlan(N)/generateDayRocks(N) instead of the raw stage. */
  day?: number;
  /** Freestyle mode (post-day-100 WPM arena): random sentences, live WPM
    * HUD, personal-best save — no stars, no timer, no fail-pressure. */
  freestyle?: boolean;
}

// Cheer lines for combo milestones (every 5 hits without a miss).
const CHEERS = {
  th: ['เก่งมาก! 🔥', 'สุดยอดเลย!', 'มือโปรชัดๆ!', 'ไปต่ออย่าหยุด!', 'เทพพิมพ์ดีด!'],
  en: ['Awesome! 🔥', 'On fire!', 'Like a pro!', 'Keep it going!', 'Typing hero!'],
} as const;

const WRONG_REPEAT_GUARD_MS = 120;

// Start always requires the full home-row ritual (all 8 fingers). Resume is
// gentler by default — 'anykey' = tap / press any key to continue. Flip to
// 'homerow' to demand the full placement on every resume too (wired and ready;
// left off because re-placing 8 fingers after a brief blur felt heavy).
const RESUME_READY: 'anykey' | 'homerow' = 'anykey';

// How long the intro waits before offering a "skip finger check" escape — so a
// keyboard-less tablet (warned, not blocked) is never trapped at the gate.
const SKIP_OFFER_MS = 5000;

// How many obstacles the field can ever hold at once — the size of the fixed
// MotionValue pool below (hooks can't be created per-target). A stage asks for
// fewer via stageMods().maxConcurrent (1 = classic single-rock). Raise this
// (and add a matching useMotionValue) to allow more at high levels.
const MAX_LIVE = 4;

// One in-flight obstacle. `elapsedMs / fallMs` is its own 0..1 approach
// progress — each rock keeps its own clock, so a trailing rock does NOT
// restart when the rock in front of it is destroyed.
interface LiveRock {
  index: number; // position in `rocks`
  elapsedMs: number;
  fallMs: number;
}

// Which script this player drills. v1 ships the EN track only; the future
// Thai track flips the wrong-keyboard check below (a LATIN keystroke would
// then mean "switch to Thai"), so the check is written per-track, not as a
// blanket "Thai = wrong".
const TRACK: 'en' | 'th' = 'en';

// True when a keystroke's script says the OS keyboard doesn't match the
// track being played — EN track: Thai chars are the giveaway; TH track:
// Latin letters are.
const wrongScriptForTrack = (ch: string): boolean =>
  TRACK === 'en' ? /[฀-๿]/.test(ch) : /[a-z]/.test(ch);

// A keystroke that positively confirms the keyboard matches the track (used
// to clear the warning): the track's own script.
const matchesTrackScript = (ch: string): boolean =>
  TRACK === 'en' ? /[a-z ]/.test(ch) : /[฀-๿ ]/.test(ch);

export default function TypingRoundPlayer({
  unit: unitProp,
  stage: stageProp,
  day,
  freestyle = false,
}: Props) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { lang, t } = useLanguage();
  const { playSound } = useSound();
  // Touch typing needs a physical keyboard: phones are blocked outright,
  // tablets get a gentle "plug in a keyboard" hint (see below). null until
  // mounted, so we never flash the block screen during hydration.
  const device = useDeviceClass();

  // Day mode resolves to an effective unit/stage: slot 1-3 days ARE real
  // stages (star + same feel); other days borrow a stage's timing curve.
  // Freestyle borrows the full-alphabet words timing (unit 10, stage 3).
  const plan = useMemo(() => (day !== undefined ? dayPlan(day) : null), [day]);
  const unit = plan ? plan.unit : freestyle ? 10 : (unitProp ?? 1);
  const stage = plan
    ? (plan.stageRef?.stage ?? plan.timingStage)
    : freestyle
      ? 3
      : (stageProp ?? 1);

  const meta = stageMeta(unit, stage);
  const kind = stageKind(unit, stage);
  // The unit's new keys — the intro doubles as the finger lesson now that the
  // per-unit page is gone (space joins in unit 1, where the thumb is taught).
  const lessonKeys = useMemo(() => {
    const keys = unitDef(unit)?.newKeys ?? [];
    return unit === 1 ? [...keys, ' '] : keys;
  }, [unit]);
  const lessonFingers = useMemo(
    () =>
      lessonKeys
        .map((k) => (k === ' ' ? 'thumb' : fingerForChar(LAYOUTS.en, k)))
        .filter((f): f is NonNullable<typeof f> => f !== null),
    [lessonKeys],
  );
  // The per-unit picker page is gone (cards play directly), so exits go back
  // to the typing landing.
  const exitHref = '/typing';

  // ----- Round content (regenerated per attempt) -----
  const [attempt, setAttempt] = useState(0);
  const dayRocks = useMemo(
    () =>
      day !== undefined
        ? generateDayRocks(day)
        : freestyle
          ? generateFreestyleRocks()
          : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [day, freestyle, attempt],
  );
  const rocks: Rock[] = useMemo(
    () => (dayRocks ? dayRocks.rocks : generateStageRocks(unit, stage)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayRocks, unit, stage, attempt],
  );
  // Where the appended practice segment starts (== rocks.length when none).
  const practiceStartIndex = dayRocks?.practiceStartIndex ?? rocks.length;
  // Stage modifiers (timed bonus, multi-obstacle). Day mode carries its own;
  // freestyle runs clean — no clock, no concurrent pressure, just speed.
  const mods = useMemo(
    () => (freestyle ? {} : plan ? plan.mods : stageMods(unit, stage)),
    [freestyle, plan, unit, stage],
  );
  // Timed stages: total seconds on the clock = keystrokes × secondsPerChar.
  const timeLimitMs = useMemo(
    () =>
      mods.timed
        ? Math.ceil(totalTargets(rocks) * mods.timed.secondsPerChar) * 1000
        : 0,
    [mods, rocks],
  );

  // Horizontal position per rock (15%..85%), stable per attempt.
  const rockXs = useMemo(
    () => rocks.map(() => 15 + Math.random() * 70),
    [rocks],
  );

  // ----- Game state -----
  const [phase, setPhase] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [focused, setFocused] = useState(false);
  // Live obstacles, frontmost first. The ref is the 60fps source of truth
  // (mutated in the fall loop); the state mirrors just the ids so React
  // re-renders when the SET changes — which is rare (spawn / resolve), not
  // every frame. Position data rides MotionValues instead.
  const liveRef = useRef<LiveRock[]>([]);
  const [liveIndices, setLiveIndices] = useState<number[]>([]);
  const spawnedRef = useRef(0);  // rocks sent out so far
  const resolvedRef = useRef(0); // rocks destroyed or missed so far
  const [resolvedCount, setResolvedCount] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  // Mirror of `combo` for the spawn path (fall loop closures read the ref so
  // spawnRock's deps don't churn every keystroke).
  const comboRef = useRef(0);
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);
  const [cheer, setCheer] = useState<string | null>(null);
  const [pressedChar, setPressedChar] = useState<string | null>(null);
  const [shakeTick, setShakeTick] = useState(0);
  // Shot: the tick drives the effect, `progress` records where the target was
  // when the key was pressed so a projectile can actually be aimed at it (the
  // live value is already reset/re-seated by the time the skin renders).
  const [laser, setLaser] = useState({ tick: 0, progress: 0 });
  const [boom, setBoom] = useState<{
    x: number;
    progress: number;
    id: number;
    tick: number;
  } | null>(null);
  const [shieldFlash, setShieldFlash] = useState(0);
  const [reward, setReward] = useState<{
    exp: number;
    firstClear: boolean;
    timeBonus: number;
    /** One-time streak-milestone coins paid with this save (day mode). */
    milestoneBonus: number;
  } | null>(null);
  const [nextAfter, setNextAfter] = useState<{ unit: number; stage: number } | null>(null);
  const [compactViewport, setCompactViewport] = useState(false);
  // Intro only: reveal the "skip finger check" link after a beat, so nobody
  // is stuck at the home-row gate (see SKIP_OFFER_MS).
  const [showSkip, setShowSkip] = useState(false);
  // True while the OS keyboard is emitting Thai characters (forgot to switch
  // input language) — shows a how-to-switch banner instead of counting errors.
  const [wrongLang, setWrongLang] = useState(false);
  // Timed stages only: whole seconds left on the clock (state so the HUD
  // re-renders per second, NOT per frame), and a flash tick when a wrong key
  // costs time. penaltyMsRef accumulates error penalties (see processChar).
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [penaltyFlash, setPenaltyFlash] = useState(0);
  const penaltyMsRef = useRef(0);
  // Freestyle: live WPM readout (updated once per second, like the clock)
  // and the personal-best verdict after saving.
  const [liveWpm, setLiveWpm] = useState(0);
  const hitsRef = useRef(0);
  useEffect(() => {
    hitsRef.current = hits;
  }, [hits]);
  const [freestyleBest, setFreestyleBest] = useState<{
    newBest: boolean;
    bestWpm: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const lastWrongRef = useRef<{ char: string; time: number } | null>(null);
  const pressedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cheerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeMsRef = useRef(0); // unpaused play time (drives WPM)
  const shieldHitGuard = useRef(false);
  // Brief input-swallow right after the home-row ritual: the kid's fingers are
  // resting ON the home row (f, j = unit 1's first targets), so OS key-repeat
  // could fire a stray keystroke into the game the instant it starts. Ignore
  // input until this timestamp so the round starts on a clean, intentional key.
  const startGuardRef = useRef(0);

  // Approach MotionValues, one per SLOT (not per rock): slot 0 always feeds
  // the active target, slot 1 the one behind it, etc. Fixed count because
  // hooks can't be created per-target; the fall loop re-seats them when the
  // set shifts, so a trailing rock keeps its position as it becomes active.
  // To support more concurrent obstacles, add a useMotionValue + one array
  // entry and bump MAX_LIVE — nothing else changes (skins map over the array).
  const p0 = useMotionValue(0);
  const p1 = useMotionValue(0);
  const p2 = useMotionValue(0);
  const p3 = useMotionValue(0);
  const progressPool = useMemo(() => [p0, p1, p2, p3], [p0, p1, p2, p3]);

  const activeIndex = liveIndices[0] ?? -1;
  const rock = (activeIndex >= 0 ? rocks[activeIndex] : undefined) as
    | Rock
    | undefined;

  // Clamp each rock's x so its (centered) text never hangs past the field
  // edge — the raw 15–85% range overflows with long rocks on narrow fields.
  const [fieldW, setFieldW] = useState(0);
  useEffect(() => {
    const measure = () => setFieldW(fieldRef.current?.clientWidth ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  // Half the rock's rendered width, roughly: mono chars ≈ 24px + padding;
  // the bare-space rock renders the wide "เว้นวรรค (Space)" pill instead.
  const clampedX = useCallback(
    (index: number) => {
      const text = rocks[index]?.text ?? '';
      const halfPx = text === ' ' ? 80 : 24 + (text.length || 1) * 12;
      const edgePct = fieldW > 0 ? Math.min(42, (halfPx / fieldW) * 100) : 25;
      const rawX = rockXs[index] ?? 50;
      return Math.min(100 - edgePct, Math.max(edgePct, rawX));
    },
    [rocks, rockXs, fieldW],
  );
  const expectedChar = rock?.text[charIndex] ?? null;
  const isPlaying = phase === 'playing';
  const paused = isPlaying && !focused;

  // How many obstacles this stage puts on the field at once (1 = classic).
  const maxConcurrent = Math.min(MAX_LIVE, Math.max(1, mods.maxConcurrent ?? 1));
  // Spacing between obstacles, as approach-progress. Tightens as the count
  // grows so N rocks actually fit on screen together instead of the front
  // resolving before the back spawns. Capped at SPAWN_GAP so 1-2 obstacles
  // keep their original roomy feel (0.9/2 = 0.45 = SPAWN_GAP, unchanged).
  const spawnGap = Math.min(SPAWN_GAP, 0.9 / maxConcurrent);

  // Which game skin plays this stage (context-based; see gameForStage).
  // Day mode carries its own pick; freestyle races — the WPM arena IS the
  // racer, speedometer and all.
  const gameId = freestyle ? 'racer' : plan ? plan.gameId : gameForStage(unit, stage);

  const accuracy = hits + errors > 0 ? hits / (hits + errors) : 1;

  // ----- Spawn / resolve -----
  // Progress of the frontmost live rock right now (0 when the field is empty).
  const frontProgress = useCallback(() => {
    const front = liveRef.current[0];
    return front ? Math.min(1, front.elapsedMs / front.fallMs) : 0;
  }, []);
  // Progress of the BACKMOST live rock — the newest one. New rocks are spaced
  // off this (not the front), so obstacles stay evenly spread no matter how
  // many are on the field (front-based spacing would dump 3rd/4th rocks on top
  // of each other the instant the front passed the gap).
  const backProgress = useCallback(() => {
    const back = liveRef.current[liveRef.current.length - 1];
    return back ? Math.min(1, back.elapsedMs / back.fallMs) : 0;
  }, []);

  // Send out the next rock in the queue. Its approach time is fixed at spawn
  // (per-rock roundPace ramp), so rocks in flight keep the pace they launched
  // with even as later ones get faster.
  const spawnRock = useCallback(() => {
    const index = spawnedRef.current;
    if (index >= rocks.length) return;
    spawnedRef.current = index + 1;
    const live = [
      ...liveRef.current,
      {
        index,
        elapsedMs: 0,
        // Base pace × in-round ramp × day speedFactor × the live combo dial
        // (comboPace) — a hot streak makes NEW targets come in faster; any
        // miss resets the combo and the pace relaxes with it.
        fallMs:
          meteorSeconds(unit, stage) *
          1000 *
          roundPace(index, rocks.length) *
          (plan?.speedFactor ?? (freestyle ? 0.9 : 1)) *
          comboPace(comboRef.current),
      },
    ];
    liveRef.current = live;
    progressPool[live.length - 1]?.set(0);
    setLiveIndices(live.map((l) => l.index));
  }, [rocks.length, unit, stage, progressPool, plan, freestyle]);

  // Retire the frontmost rock (destroyed by typing, or missed at the player).
  // Everything behind it shifts one slot forward AND KEEPS ITS OWN PROGRESS —
  // that continuity is the whole point of the multi-obstacle mode.
  const resolveFront = useCallback(
    (destroyed: boolean) => {
      const front = liveRef.current[0];
      if (!front) return;
      if (destroyed) {
        setBoom({
          x: clampedX(front.index),
          progress: Math.min(1, front.elapsedMs / front.fallMs),
          id: front.index,
          tick: Date.now(),
        });
        playSound('correct');
      }
      const rest = liveRef.current.slice(1);
      liveRef.current = rest;
      rest.forEach((l, slot) =>
        progressPool[slot]?.set(Math.min(1, l.elapsedMs / l.fallMs)),
      );
      for (let slot = rest.length; slot < progressPool.length; slot++) {
        progressPool[slot]?.set(0);
      }
      setCharIndex(0);
      shieldHitGuard.current = false;

      const resolved = resolvedRef.current + 1;
      resolvedRef.current = resolved;
      setResolvedCount(resolved);
      if (resolved >= rocks.length) {
        setLiveIndices([]);
        setPhase('finished');
        return;
      }
      // Single-obstacle stages: the field would sit empty, so the next rock
      // launches immediately (identical to the classic one-at-a-time feel).
      if (rest.length === 0) spawnRock();
      else setLiveIndices(rest.map((l) => l.index));
    },
    [rocks.length, clampedX, playSound, progressPool, spawnRock],
  );

  const handleShieldHit = useCallback(() => {
    setErrors((e) => e + 1);
    setCombo(0);
    setShieldFlash((s) => s + 1);
    playSound('incorrect');
    resolveFront(false);
  }, [resolveFront, playSound]);

  // ----- Fall loop (pausable) -----
  // wrongLang freezes the fall too: switching the OS language takes a moment,
  // and losing the rock to the shield while doing it would feel unfair.
  useAnimationFrame((_, delta) => {
    if (!isPlaying || paused || wrongLang || liveRef.current.length === 0) return;
    activeMsRef.current += delta;

    const live = liveRef.current;
    for (let slot = 0; slot < live.length; slot++) {
      live[slot].elapsedMs += delta;
      progressPool[slot]?.set(
        Math.min(1, live[slot].elapsedMs / live[slot].fallMs),
      );
    }

    // Arrival is checked on the FRONT rock only — the spawn gap guarantees a
    // trailing rock is nowhere near the player while the front one is there.
    if (frontProgress() >= 1 && !shieldHitGuard.current) {
      shieldHitGuard.current = true;
      handleShieldHit(); // may pop/spawn → re-read liveRef below
    }

    // Send out the next one once the newest (backmost) rock has travelled far
    // enough to leave a readable gap behind it — so with 3-4 concurrent they
    // stay evenly spaced instead of stacking.
    if (
      liveRef.current.length > 0 &&
      liveRef.current.length < maxConcurrent &&
      spawnedRef.current < rocks.length &&
      backProgress() >= spawnGap
    ) {
      spawnRock();
    }

    // Timed stages: tick the visible clock down (state changes only when the
    // whole-second value changes, so this stays ~1 re-render/sec, not 60).
    if (timeLimitMs > 0) {
      const leftMs = Math.max(
        0,
        timeLimitMs - activeMsRef.current - penaltyMsRef.current,
      );
      const leftSec = Math.ceil(leftMs / 1000);
      if (leftSec !== timeLeftSec) setTimeLeftSec(leftSec);
    }

    // Freestyle: live WPM readout (1 word = 5 keys), same 1/sec cadence.
    if (freestyle) {
      const minutes = Math.max(activeMsRef.current / 60000, 1 / 60);
      const wpmNow = Math.round(hitsRef.current / 5 / minutes);
      if (wpmNow !== liveWpm) setLiveWpm(wpmNow);
    }
  });

  // Clear the field (start / restart).
  const resetLive = useCallback(() => {
    liveRef.current = [];
    spawnedRef.current = 0;
    resolvedRef.current = 0;
    shieldHitGuard.current = false;
    setResolvedCount(0);
    setLiveIndices([]);
    progressPool.forEach((p) => p.set(0));
  }, [progressPool]);

  // ----- Keystroke handling (single path for desktop + iPad) -----
  const processChar = useCallback(
    (raw: string) => {
      if (!isPlaying || paused || !rock) return;
      // Swallow residual key-repeat from the home-row ritual (see startGuardRef).
      if (performance.now() < startGuardRef.current) return;
      const ch = raw.toLowerCase(); // defeats residual iOS auto-capitalization
      // OS keyboard doesn't match the track's language (e.g. Thai keys while
      // playing the EN track). Warn + freeze, don't punish (not the kid's
      // typing skill) — clears on the first keystroke in the right script.
      if (wrongScriptForTrack(ch)) {
        setWrongLang(true);
        playSound('incorrect');
        return;
      }
      if (matchesTrackScript(ch) && wrongLang) {
        setWrongLang(false);
        // The overlay says "press any letter to continue" — so the resuming
        // keystroke is free: count it only when it happens to be correct.
        if (ch !== rock.text[charIndex]) return;
      }
      const expected = rock.text[charIndex];
      if (!expected) return;

      if (ch === expected) {
        lastWrongRef.current = null;
        setHits((h) => h + 1);
        // Capture WHERE the target is NOW, eagerly — the killing keystroke
        // calls resolveFront() below, which shifts this rock out of liveRef.
        // Reading frontProgress() lazily inside the state updater would run
        // after that shift and aim the shot at the next rock instead.
        const shotProgress = frontProgress();
        setLaser((l) => ({ tick: l.tick + 1, progress: shotProgress }));
        setPressedChar(ch);
        if (pressedTimer.current) clearTimeout(pressedTimer.current);
        pressedTimer.current = setTimeout(() => setPressedChar(null), 140);

        const newCombo = combo + 1;
        setCombo(newCombo);
        setBestCombo((b) => Math.max(b, newCombo));
        if (newCombo > 0 && newCombo % 5 === 0) {
          const lines = CHEERS[lang];
          setCheer(lines[Math.floor(Math.random() * lines.length)]);
          if (cheerTimer.current) clearTimeout(cheerTimer.current);
          cheerTimer.current = setTimeout(() => setCheer(null), 1400);
        }

        if (charIndex + 1 >= rock.text.length) {
          resolveFront(true);
        } else {
          playSound('click');
          setCharIndex((i) => i + 1);
        }
      } else {
        // Key-repeat guard: same wrong char again within 120ms doesn't stack.
        const now = performance.now();
        const last = lastWrongRef.current;
        if (last && last.char === ch && now - last.time < WRONG_REPEAT_GUARD_MS) {
          return;
        }
        lastWrongRef.current = { char: ch, time: now };
        setErrors((e) => e + 1);
        setCombo(0);
        setShakeTick((s) => s + 1);
        playSound('incorrect');
        // Timed stages with an error penalty: this counted miss costs seconds
        // off the clock (only eats the bonus — the timer floors at 0, never
        // fails the round). Wired but off in v1 (no stage sets the field).
        const penalty = mods.timed?.errorPenaltySeconds;
        if (penalty) {
          penaltyMsRef.current += penalty * 1000;
          setPenaltyFlash((f) => f + 1);
        }
      }
    },
    [
      isPlaying,
      paused,
      wrongLang,
      rock,
      charIndex,
      combo,
      lang,
      resolveFront,
      frontProgress,
      playSound,
      mods,
    ],
  );

  const handleBeforeInput = (e: FormEvent<HTMLInputElement>) => {
    const ev = e.nativeEvent as InputEvent;
    // Only single-character insertions matter; ignore deletes/compositions.
    if (ev.inputType === 'insertText' && ev.data && ev.data.length === 1) {
      e.preventDefault();
      processChar(ev.data);
    } else if (ev.inputType && ev.inputType.startsWith('delete')) {
      e.preventDefault(); // Backspace is a no-op in must-correct mode
    }
  };

  // Safety net for browsers that skip beforeinput: consume whatever landed.
  const handleInputFallback = (e: FormEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (el.value) {
      const ch = el.value[el.value.length - 1];
      el.value = '';
      processChar(ch);
    }
  };

  // Window-level keys: Escape exits; on desktop (hands already on the
  // keyboard) SPACE/Enter starts from the intro and any key resumes from
  // pause — no need to reach for the mouse. iOS still uses the tap (its
  // software keyboard isn't even open at the intro).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push(exitHref);
        return;
      }
      // Intro start is the home-row ritual (HomeRowGate), not a keypress —
      // nothing to do here for the intro anymore.
      // Resume: in 'anykey' mode any key refocuses the input to continue; in
      // 'homerow' mode the paused overlay's HomeRowGate handles resume instead.
      if (
        RESUME_READY === 'anykey' &&
        isPlaying &&
        !focused &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, exitHref, phase, isPlaying, focused]);

  // Practice-segment boundary (day mode, slot 1-3): when the last core rock
  // resolves, cheer "ต่อด้วยฝึกฝน!" once and flip the HUD badge — same round,
  // no interstitial, the flow never stops.
  const inPractice =
    isPlaying &&
    practiceStartIndex < rocks.length &&
    resolvedCount >= practiceStartIndex;
  const practiceCheeredRef = useRef(false);
  useEffect(() => {
    if (phase === 'intro') practiceCheeredRef.current = false;
  }, [phase]);
  useEffect(() => {
    if (
      !practiceCheeredRef.current &&
      isPlaying &&
      practiceStartIndex > 0 &&
      practiceStartIndex < rocks.length &&
      resolvedCount === practiceStartIndex
    ) {
      practiceCheeredRef.current = true;
      setCheer(t.typing.practiceCheer);
      if (cheerTimer.current) clearTimeout(cheerTimer.current);
      cheerTimer.current = setTimeout(() => setCheer(null), 1800);
    }
  }, [resolvedCount, practiceStartIndex, rocks.length, isPlaying, t]);

  // Sentence section (day mode: unit-challenge tails, Phase B rounds).
  // The tracker bar shows the sentence whose rocks are being typed, with the
  // current word highlighted; entering the section cheers once.
  const sentenceSpans = dayRocks?.sentences;
  const activeSpan =
    isPlaying && sentenceSpans
      ? sentenceSpans.find(
          (s) => activeIndex >= s.startIndex && activeIndex <= s.endIndex,
        )
      : undefined;
  // Words fully typed within the active span = non-space rocks resolved
  // before the active one (a space rock in flight highlights the NEXT word).
  const activeWordPos = activeSpan
    ? rocks
        .slice(activeSpan.startIndex, activeIndex)
        .filter((r) => r.text !== ' ').length
    : 0;
  const sentenceCheeredRef = useRef(false);
  useEffect(() => {
    if (phase === 'intro') sentenceCheeredRef.current = false;
  }, [phase]);
  useEffect(() => {
    const firstStart = sentenceSpans?.[0]?.startIndex;
    if (
      !sentenceCheeredRef.current &&
      isPlaying &&
      firstStart !== undefined &&
      firstStart > 0 &&
      resolvedCount === firstStart
    ) {
      sentenceCheeredRef.current = true;
      setCheer(t.typing.sentenceCheer);
      if (cheerTimer.current) clearTimeout(cheerTimer.current);
      cheerTimer.current = setTimeout(() => setCheer(null), 1800);
    }
  }, [resolvedCount, sentenceSpans, isPlaying, t]);

  // Offer the skip-finger-check escape a few seconds into the intro; hide it
  // again whenever we leave the intro (start / restart).
  useEffect(() => {
    if (phase !== 'intro') {
      setShowSkip(false);
      return;
    }
    const id = setTimeout(() => setShowSkip(true), SKIP_OFFER_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // iPad OS keyboard shrinks the visual viewport → compact keyboard guide.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setCompactViewport(vv.height < 560);
    onResize();
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  useEffect(
    () => () => {
      if (pressedTimer.current) clearTimeout(pressedTimer.current);
      if (cheerTimer.current) clearTimeout(cheerTimer.current);
    },
    [],
  );

  // ----- Start / resume (must run inside a user gesture for iOS) -----
  const startGame = () => {
    setPhase('playing');
    resetLive();
    spawnRock(); // launch the first obstacle
    startGuardRef.current = performance.now() + 350; // swallow home-row repeat
    penaltyMsRef.current = 0;
    if (timeLimitMs > 0) setTimeLeftSec(Math.ceil(timeLimitMs / 1000));
    inputRef.current?.focus({ preventScroll: true });
  };

  // Refocus MUST preventDefault on pointerdown: the browser's default action
  // for pointerdown/mousedown is to move focus to the pressed element (or
  // body), which would instantly blur the input we just focused — that's
  // exactly the "tap to resume does nothing" loop. Cancelling the default
  // keeps our programmatic focus in place; the gesture still counts for iOS.
  const refocus = (e?: { preventDefault: () => void }) => {
    e?.preventDefault();
    if (isPlaying) inputRef.current?.focus({ preventScroll: true });
  };

  const restart = () => {
    setAttempt((a) => a + 1);
    setCharIndex(0);
    setHits(0);
    setErrors(0);
    setCombo(0);
    setBestCombo(0);
    setCheer(null);
    setReward(null);
    setNextAfter(null);
    activeMsRef.current = 0;
    penaltyMsRef.current = 0;
    setTimeLeftSec(0);
    setLiveWpm(0);
    setFreestyleBest(null);
    resetLive();
    setPhase('intro');
  };

  // ----- Save on finish -----
  const passed = accuracy >= PASSING_ACCURACY;
  const perfect = errors === 0;
  const savedRef = useRef(false);
  useEffect(() => {
    if (phase !== 'finished' || savedRef.current) return;
    savedRef.current = true;
    if (!passed || !user) return;
    playSound('levelUp');
    // Timed bonus: fraction of the clock left × the cap, floored. Uses the
    // final activeMs + penalties captured at finish. Zero for untimed stages.
    let timeBonus = 0;
    if (mods.timed && timeLimitMs > 0) {
      const leftMs = Math.max(
        0,
        timeLimitMs - activeMsRef.current - penaltyMsRef.current,
      );
      timeBonus = Math.floor((leftMs / timeLimitMs) * mods.timed.bonusExpMax);
    }
    void (async () => {
      if (freestyle) {
        // Freestyle: record the run — the round's WPM is the score. Only
        // passed (accuracy-gated) rounds reach here, so records are earned.
        const minutes = Math.max(activeMsRef.current / 60000, 1 / 60);
        const finalWpm = Math.round(hitsRef.current / 5 / minutes);
        const res = await saveFreestyle({ userId: user.id, wpm: finalWpm });
        setFreestyleBest({ newBest: res.newBest, bestWpm: res.bestWpm });
        setReward({
          exp: res.expGained,
          firstClear: res.newBest, // loud coin banner on a new record
          timeBonus: 0,
          milestoneBonus: res.milestoneBonus,
        });
        setNextAfter(null);
        await refreshUser();
        return;
      }
      if (day !== undefined) {
        // Day-mission save: routes into the stage-star economy for slot 1-3
        // days, ty-day ids otherwise; also advances the calendar streak.
        const res = await saveTypingDay({
          userId: user.id,
          day,
          perfect,
          bonusExp: timeBonus,
        });
        setReward({
          exp: res.expGained,
          firstClear: res.firstClear,
          timeBonus: res.firstClear ? timeBonus : 0,
          milestoneBonus: res.milestoneBonus,
        });
        setNextAfter(null); // day mode uses the "next day" CTA instead
        await refreshUser();
        return;
      }
      const res = await saveTypingStage({
        userId: user.id,
        unit,
        stage,
        perfect,
        bonusExp: timeBonus,
      });
      setReward({
        exp: res.expGained,
        firstClear: res.firstClear,
        // Only first clears actually bank the bonus (saveTypingStage gates it);
        // show the line only when it was really awarded.
        timeBonus: res.firstClear ? timeBonus : 0,
        milestoneBonus: 0,
      });
      // Recommend "next" as if this clear is already saved (refreshUser is void).
      const before = getTypingProgress(user);
      setNextAfter(
        findNextStage({
          ...(before ?? {
            curriculumId: 'typing',
            startedAt: '',
            lastActiveAt: '',
            unlockedSubTopicIds: [],
            lessonScores: {},
            subTopicScores: {},
            mistakePatterns: [],
            totalMinutesSpent: 0,
            totalStarsEarned: 0,
            completedLessonIds: [],
          }),
          completedLessonIds: [
            ...(before?.completedLessonIds ?? []),
            stageId(unit, stage),
          ],
        }),
      );
      await refreshUser();
    })();
    // mods/timeLimitMs are stable for a given unit/stage; activeMsRef read at
    // finish. eslint wants them but they don't change within a round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, passed, perfect, user, unit, stage, day, freestyle, playSound, refreshUser]);
  // Reset the save guard on restart.
  useEffect(() => {
    if (phase === 'intro') savedRef.current = false;
  }, [phase]);

  // Day mode: "วันที่ 7/100 · แป้นใหม่ T Y" — kid-facing day labels, no
  // typing-teacher jargon. Classic mode keeps the unit/part title.
  const title = freestyle
    ? t.typing.freestyleTitle
    : plan
      ? `${t.typing.dayOf(plan.day)} · ${lang === 'en' ? plan.labelEn : plan.labelTh}`
      : `${t.typing.unitWord} ${unit} · ${t.typing.stageOf(
          stage,
          lang === 'en' ? meta.enTitle : meta.thaiTitle,
        )}`;

  // ----- Phone block — touch typing can't be practised on a phone screen
  // (no home row, on-screen keyboard eats the field). Show a friendly
  // "use a computer" card instead of the game. Tablets fall through (they
  // may have a keyboard) and only get a soft hint on the intro. -----
  if (device === 'phone') {
    return (
      <div className="learn-bg flex min-h-dvh flex-col">
        {user && <AppHeader user={user} />}
        <div className="mx-auto flex max-w-md flex-1 select-none flex-col items-center justify-center px-6 py-12 text-center">
          <span className="text-6xl" aria-hidden>
            💻
          </span>
          <h1 className="mt-5 text-2xl font-bold text-white">
            {t.typing.phoneBlockTitle}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/75">
            {t.typing.phoneBlockBody}
          </p>
          <button
            onClick={() => router.push('/')}
            className="learn-accent-pill mt-8 rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
          >
            {t.typing.phoneBlockBack}
          </button>
        </div>
      </div>
    );
  }

  // ----- Result screen -----
  if (phase === 'finished') {
    const pct = Math.round(accuracy * 100);
    const minutes = Math.max(activeMsRef.current / 60000, 1 / 60);
    const wpm = Math.round(hits / 5 / minutes);
    return (
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="mx-auto max-w-lg select-none px-4 py-12 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              passed
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            {passed ? (
              perfect ? (
                <Star className="h-10 w-10 fill-current text-amber-300" />
              ) : (
                <Check className="h-10 w-10" strokeWidth={3} />
              )
            ) : (
              <X className="h-10 w-10" strokeWidth={3} />
            )}
          </div>
          <h1 className="mt-5 text-2xl font-bold text-white">
            {perfect && passed
              ? t.typing.perfectRound
              : passed
                ? t.typing.passed
                : t.typing.failed}
          </h1>

          {/* Day-100 Grand Test cleared — the big one. */}
          {passed && day === TOTAL_DAYS && (
            <div className="mt-4 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-4 py-4 text-lg font-extrabold text-amber-200">
              {t.typing.day100Congrats}
            </div>
          )}

          {/* Freestyle verdict — new record trumpets, otherwise show the bar
              to beat. */}
          {passed && freestyle && freestyleBest && (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-base font-extrabold ${
                freestyleBest.newBest
                  ? 'border border-cyan-400/50 bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-100'
                  : 'bg-white/[0.05] text-white/70'
              }`}
            >
              {freestyleBest.newBest
                ? t.typing.newRecord(freestyleBest.bestWpm)
                : t.typing.myBest(freestyleBest.bestWpm)}
            </div>
          )}
          {/* Score tiles — the numbers ARE the reward, make them big. */}
          <div
            className={`mt-6 grid gap-3 ${
              kind === 'words' ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            <div className="learn-card rounded-2xl px-3 py-4">
              <p
                className={`text-3xl font-extrabold tabular-nums ${
                  passed ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {pct}%
              </p>
              <p className="mt-1 text-xs text-white/55">
                {t.typing.accuracyLabel} · {t.typing.missCount(errors)}
              </p>
            </div>
            <div className="learn-card rounded-2xl px-3 py-4">
              <p className="text-3xl font-extrabold tabular-nums text-orange-300">
                🔥 {bestCombo}
              </p>
              <p className="mt-1 text-xs text-white/55">{t.typing.bestCombo}</p>
            </div>
            {kind === 'words' && (
              <div className="learn-card rounded-2xl px-3 py-4">
                <p className="text-3xl font-extrabold tabular-nums text-cyan-300">
                  {wpm}
                </p>
                <p className="mt-1 text-xs text-white/55">WPM</p>
              </div>
            )}
          </div>

          {/* Coin banner — the payout. First clear = full amber celebration;
              replays still pay a small practice bonus, shown quieter. */}
          {passed && reward && (
            <div
              className={`mt-3 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 ${
                reward.firstClear
                  ? 'border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-orange-500/15 text-lg font-bold text-amber-200'
                  : 'bg-white/[0.05] text-base font-semibold text-amber-200/80'
              }`}
            >
              <Coins
                className={reward.firstClear ? 'h-6 w-6 text-amber-300' : 'h-5 w-5 text-amber-300/80'}
              />
              {reward.firstClear
                ? t.typing.expGained(reward.exp)
                : t.typing.replayGained(reward.exp)}
            </div>
          )}

          {/* Time-bonus breakdown — only when a timed stage actually paid one
              (first clear + bonus > 0). The total above already includes it;
              this line shows where the extra came from. */}
          {passed && reward && reward.timeBonus > 0 && (
            <p className="mt-2 text-sm font-semibold text-cyan-200/90">
              {t.typing.timeBonus(reward.timeBonus)}
            </p>
          )}

          {/* Streak-milestone coins (7/30/50/100 consecutive days) — a rare,
              loud moment; the line only exists when it just got paid. */}
          {passed && reward && reward.milestoneBonus > 0 && (
            <p className="mt-2 text-sm font-bold text-orange-300">
              {t.typing.streakBonus(reward.milestoneBonus)}
            </p>
          )}

          {/* Phase C WPM goal — soft target: celebrated when hit, gently
              encouraged when not. Never gates the pass. */}
          {passed && plan?.wpmTarget !== undefined && (
            <p
              className={`mt-2 text-sm font-bold ${
                wpm >= plan.wpmTarget ? 'text-emerald-300' : 'text-white/60'
              }`}
            >
              {wpm >= plan.wpmTarget
                ? t.typing.wpmGoalHit(wpm, plan.wpmTarget)
                : t.typing.wpmGoalMiss(wpm, plan.wpmTarget)}
            </p>
          )}

          {/* Two buttons only: keep going (or retry on a fail) + back.
              Day mode chains straight into the next day (no daily lock —
              binge away); the streak line nudges tomorrow's return. */}
          <div className="mt-8 flex flex-col gap-3">
            {freestyle && passed ? (
              <button
                onClick={restart}
                className="learn-accent-pill rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
              >
                {t.typing.playAgain}
              </button>
            ) : day !== undefined && passed ? (
              <>
                {day < TOTAL_DAYS && (
                  <button
                    onClick={() => router.push(`/typing/day/${day + 1}`)}
                    className="learn-accent-pill flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
                  >
                    {t.typing.playNextDay(day + 1)}
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
                <p className="text-sm text-white/60">{t.typing.keepStreakHint}</p>
              </>
            ) : passed && nextAfter ? (
              <button
                onClick={() =>
                  router.push(`/typing/${nextAfter.unit}/${nextAfter.stage}`)
                }
                className="learn-accent-pill flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
              >
                {t.typing.playNext(
                  nextAfter.unit,
                  nextAfter.stage,
                  lang === 'en'
                    ? stageMeta(nextAfter.unit, nextAfter.stage).enTitle
                    : stageMeta(nextAfter.unit, nextAfter.stage).thaiTitle,
                )}
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              !passed && (
                <button
                  onClick={restart}
                  className="learn-accent-pill rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
                >
                  {t.typing.retry}
                </button>
              )
            )}
            {/* Back to the unit MAP (landing) — "กลับหน้าด่าน N" confused the
                kid; the map is the mental home base. */}
            <button
              onClick={() => router.push('/typing')}
              className="glass rounded-2xl px-6 py-3 font-semibold text-white/80 transition hover:bg-white/10"
            >
              {t.typing.backToTyping}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----- Intro + game screens share the field shell -----
  return (
    // select-none: fast tapping/dragging must never text-select the rock,
    // stats, or keyboard labels (nothing in the player is copy-worthy).
    <div className="learn-bg flex min-h-dvh select-none flex-col">
      <LessonHeader
        lessonTitle={title}
        stepTitle={t.typing.rocksLeft(rocks.length - resolvedCount)}
        currentStep={resolvedCount}
        totalSteps={rocks.length}
        onClose={() => router.push(exitHref)}
      />

      {/* Sentence tracker bar — the whole sentence being typed, word by
          word: done words struck through, the live word highlighted. Sits
          BETWEEN header and field (plain flow node — never overlaps the
          timer pill or the game, no framer transforms to clobber). */}
      {activeSpan && (
        <div className="mx-auto w-full max-w-2xl px-4 pt-1.5">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-xl bg-white/[0.06] px-3 py-1.5 font-mono text-base font-bold">
            {activeSpan.text.split(' ').map((w, i) => (
              <span
                key={i}
                className={
                  i < activeWordPos
                    ? 'text-emerald-400/60 line-through'
                    : i === activeWordPos
                      ? 'rounded bg-fuchsia-500/35 px-1 text-white'
                      : 'text-white/45'
                }
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Game field. While playing, any press inside the field keeps the
          hidden input focused (preventDefault stops the browser stealing
          focus) — during the intro we leave defaults alone so the start
          button's click works untouched. */}
      <div
        ref={fieldRef}
        className="relative mx-auto w-full max-w-2xl flex-1 overflow-hidden px-2"
        style={{ minHeight: compactViewport ? 220 : 300 }}
        onPointerDown={isPlaying ? refocus : undefined}
      >
        {/* Hidden input INSIDE the visible area (iOS: display:none is
            unfocusable; offscreen positions cause scroll jumps). */}
        <input
          ref={inputRef}
          type="text"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="done"
          aria-label={t.typing.typeHere}
          onBeforeInput={handleBeforeInput}
          onInput={handleInputFallback}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute left-1/2 top-1/2 h-px w-px opacity-0"
        />

        {phase === 'intro' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
            <span className="learn-accent-pill flex h-12 w-12 items-center justify-center rounded-full shadow-xl shadow-pink-500/40 sm:h-14 sm:w-14">
              {gameId === 'dino' ? (
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  🦖
                </span>
              ) : gameId === 'sushi' ? (
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  🍣
                </span>
              ) : gameId === 'racer' ? (
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  🏎️
                </span>
              ) : (
                <Rocket className="h-7 w-7 sm:h-8 sm:w-8" />
              )}
            </span>

            {/* Today's lesson keys — compact, so the ritual below is the star
                but the kid still sees which new keys this stage teaches (the
                bottom keyboard + hands highlight them too). Freestyle teaches
                nothing new — hide the row. */}
            <span
              className={`flex flex-wrap items-center justify-center gap-2 ${
                freestyle ? 'hidden' : ''
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-white/45">
                {t.typing.todayKeys}
              </span>
              {lessonKeys.map((keyChar) => {
                const finger =
                  keyChar === ' ' ? 'thumb' : fingerForChar(LAYOUTS.en, keyChar);
                const colors = finger ? FINGER_COLORS[finger] : null;
                return (
                  <span
                    key={keyChar}
                    className={`flex h-9 items-center justify-center rounded-lg text-lg font-extrabold uppercase shadow ${
                      keyChar === ' ' ? 'w-24 text-sm' : 'w-9'
                    } ${colors ? colors.active : 'bg-white/10 text-white'}`}
                  >
                    {keyChar === ' ' ? 'SPACE' : keyChar}
                  </span>
                );
              })}
            </span>

            {/* Home-row readiness ritual — rest all 8 fingers, then press. */}
            <p className="max-w-xs text-base font-bold text-white">
              {t.typing.placeFingers}
            </p>
            <HomeRowGate
              onReady={startGame}
              readyLabel={t.typing.placeFingersReady}
              wrongLangHint={t.typing.fingersWrongLang}
            />

            {/* Modifier badge — tells the kid what's special about this stage
                before they start (timed / two-at-once). */}
            {(mods.timed || (mods.maxConcurrent ?? 1) > 1) && (
              <span className="rounded-full bg-cyan-500/15 px-4 py-1.5 text-sm font-bold text-cyan-200 ring-1 ring-cyan-400/30">
                {mods.timed
                  ? t.typing.timedIntro
                  : t.typing.multiIntro(mods.maxConcurrent ?? 2)}
              </span>
            )}
            {/* Tablet: we can't tell if a keyboard is attached, so nudge. */}
            {device === 'tablet' && (
              <span className="rounded-full bg-amber-500/15 px-4 py-1.5 text-sm font-semibold text-amber-200 ring-1 ring-amber-400/30">
                {t.typing.tabletKeyboardHint}
              </span>
            )}
            {/* Escape hatch — appears a few seconds in so a keyboard-less
                device isn't trapped at the gate. */}
            {showSkip && (
              <button
                onClick={startGame}
                className="mt-1 rounded-full px-4 py-1.5 text-sm font-semibold text-white/45 underline decoration-white/25 underline-offset-4 transition hover:text-white/70"
              >
                {t.typing.skipFingers}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Game skin — presentation only; all state comes from these
                props. Which skin plays is context-based (gameForStage). */}
            {(() => {
              // Slot order IS render order: [0] is the frontmost/active rock.
              const targets: LiveTarget[] = liveIndices.flatMap((index, slot) => {
                const r = rocks[index];
                if (!r) return [];
                return [
                  {
                    id: index,
                    rock: r,
                    charIndex: slot === 0 ? charIndex : 0,
                    progress: progressPool[slot],
                    x: clampedX(index),
                    active: slot === 0,
                  },
                ];
              });
              const fieldProps: GameFieldProps = {
                targets,
                paused,
                shakeTick,
                laserTick: laser.tick,
                laserProgress: laser.progress,
                boom,
                onBoomDone: () => setBoom(null),
                arrivalTick: shieldFlash,
                spaceLabel: t.typing.spaceKey,
              };
              return gameId === 'dino' ? (
                <DinoRunField {...fieldProps} />
              ) : gameId === 'sushi' ? (
                <SushiBeltField {...fieldProps} />
              ) : gameId === 'racer' ? (
                <RacerField {...fieldProps} />
              ) : (
                <SpaceDefenseField {...fieldProps} />
              );
            })()}

            {/* Avatar cheerleader — top-left corner (out of the play area; it
                used to sit at bottom-left where it floated awkwardly under the
                ground). Cheer bubble now drops BELOW it. */}
            <div className="pointer-events-none absolute left-2 top-1 z-10 hidden sm:block">
              <motion.div
                animate={combo >= 5 ? { y: [0, -6, 0] } : { y: 0 }}
                transition={{ duration: 0.5, repeat: combo >= 5 ? Infinity : 0 }}
                className="origin-top-left scale-[0.5]"
              >
                {user && (
                  <EnhancedAvatarDisplay
                    userId={user.id}
                    avatarData={user.avatarData}
                    basicAvatar={user.avatar}
                    size="tiny"
                    showEffects={false}
                    showTitle={false}
                  />
                )}
              </motion.div>
              <AnimatePresence>
                {cheer && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-1 top-12 whitespace-nowrap rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-lg"
                  >
                    {cheer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Combo badge — ⚡ marks the combo-speed boost kicking in (the
                combo IS the speed dial; see comboPace). */}
            {combo >= 3 && (
              <div className="absolute right-3 top-2 z-10 rounded-full bg-orange-500/20 px-3 py-1 text-sm font-extrabold text-orange-300">
                🔥 {t.typing.comboLabel} ×{combo}
                {comboPace(combo) < 1 && ' ⚡'}
              </div>
            )}

            {/* Practice-segment badge (day mode) — the lesson part is done,
                now we're drilling. Positioned clear of the avatar corner. */}
            {inPractice && (
              <div className="absolute left-2 top-2 z-10 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-extrabold text-emerald-300 sm:left-16">
                💪 {t.typing.practiceBadge}
              </div>
            )}

            {/* Freestyle live WPM — top-center (the spot the timer would use;
                freestyle never has a timer, so no collision). */}
            {freestyle && (
              <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2">
                <div className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-extrabold text-cyan-200">
                  ⚡ {liveWpm} WPM
                </div>
              </div>
            )}

            {/* Timer pill (timed stages only) — engine-level HUD, top-center.
                Turns amber under 10s, shows "bonus time up" at 0. A wrong key
                flashes it red + floats a "−Ns" penalty (v1: penalty is off, so
                penaltyFlash never bumps; the markup is ready for when it's on). */}
            {timeLimitMs > 0 && (
              <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2">
                <motion.div
                  key={penaltyFlash}
                  animate={penaltyFlash ? { scale: [1, 1.15, 1] } : undefined}
                  transition={{ duration: 0.3 }}
                  className={`rounded-full px-3 py-1 text-sm font-extrabold ${
                    timeLeftSec <= 0
                      ? 'bg-rose-500/25 text-rose-200'
                      : timeLeftSec < 10
                        ? 'bg-amber-500/25 text-amber-200'
                        : 'bg-cyan-500/20 text-cyan-200'
                  }`}
                >
                  {timeLeftSec <= 0 ? t.typing.timeBonusOver : t.typing.timeLeft(timeLeftSec)}
                </motion.div>
              </div>
            )}

            {/* Wrong-input-language overlay — the game freezes (see the fall
                loop) and a big center card tells the kid to switch language.
                Clears itself on the first Latin keystroke; taps just keep the
                hidden input focused so that keystroke can arrive. */}
            <AnimatePresence>
              {wrongLang && !paused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onPointerDown={refocus}
                  className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 8 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-md rounded-3xl border border-amber-400/50 bg-amber-500/15 px-6 py-6 text-center"
                  >
                    <p className="text-4xl">⚠️</p>
                    <p className="mt-2 text-xl font-bold text-amber-200 sm:text-2xl">
                      {t.typing.wrongLangTitle}
                    </p>
                    <p className="mt-2 text-base text-amber-100/85">
                      {t.typing.wrongLangHint}
                    </p>
                    <p className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/75">
                      {t.typing.wrongLangResume}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Paused overlay (focus lost). 'homerow' resume mode asks the kid
                to re-place all 8 fingers; the default 'anykey' mode resumes on
                any tap/keypress. Resume on pointerdown with preventDefault — a
                plain button onClick loses the race: the overlay unmounts
                mid-gesture and mousedown's default focus steal blurs the input
                right back. */}
            {paused &&
              (RESUME_READY === 'homerow' ? (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/70 px-4 text-center backdrop-blur-sm">
                  <p className="max-w-xs text-base font-bold text-white">
                    {t.typing.placeFingers}
                  </p>
                  <HomeRowGate
                    onReady={refocus}
                    readyLabel={t.typing.placeFingersReady}
                    wrongLangHint={t.typing.fingersWrongLang}
                  />
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={-1}
                  onPointerDown={refocus}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={refocus}
                  className="absolute inset-0 z-30 flex cursor-pointer items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                  <span className="rounded-2xl bg-white/10 px-6 py-3 text-lg font-bold text-white">
                    {t.typing.tapToResume}
                  </span>
                </div>
              ))}
          </>
        )}
      </div>

      {/* Stats strip */}
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-1.5 text-sm text-white/60">
        <span>
          {t.typing.accuracyLabel}{' '}
          <span
            className={`font-bold ${
              accuracy >= PASSING_ACCURACY ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            {Math.round(accuracy * 100)}%
          </span>
        </span>
        <span>
          {t.typing.bestCombo}: <span className="font-bold text-white/80">{bestCombo}</span>
        </span>
      </div>

      {/* Finger-guide keyboard with translucent hands laid over it (typing-
          poster style) — the needed finger lifts + its nail glows. Hands hide
          when the iPad OS keyboard already eats the viewport. */}
      <div className="relative mx-auto w-full max-w-2xl px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <VirtualKeyboard
          highlightChar={isPlaying ? expectedChar : null}
          pressedChar={pressedChar}
          // Intro = finger lesson: light up this unit's new keys.
          emphasizeKeys={phase === 'intro' ? lessonKeys : undefined}
          compact={compactViewport}
        />
        {!compactViewport && (
          <HandsGuide
            activeFingers={
              phase === 'intro'
                ? lessonFingers
                : isPlaying && expectedChar
                  ? ([fingerForChar(LAYOUTS.en, expectedChar)].filter(
                      Boolean,
                    ) as NonNullable<ReturnType<typeof fingerForChar>>[])
                  : []
            }
          />
        )}
      </div>
    </div>
  );
}

