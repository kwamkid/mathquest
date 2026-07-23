// components/typing/games/RacerField.tsx
//
// "Typing Racer" skin: the kid's race car speeds along a road; rival cars
// appear ahead and drift closer (you're catching up). Type the word on a
// rival's roof sign to hit NITRO and blast past — the rival spins out in
// smoke. Reach a rival without finishing its word = a bump (soft miss, you
// wobble, the rival zooms off). Presentation only; state from GameFieldProps.
//
// Maps each target's `progress` (0..1 threat-approach) to road position:
// x = 105% (far ahead, off-screen right) → 24% (right at your bumper).
// Multi-obstacle = a line of rivals ahead, closest one active.
//
// Art is pure CSS (cars, wheels, road) + a few emoji effects. Swap for SVGs
// in /public/game/typing-racer/ later if wanted.
//
// bugs.md rules: positioning on plain/never-transform-animated nodes; effect
// restarts via animation CONTROLS, never key-remounts.

'use client';

import { useEffect } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useTransform,
} from 'framer-motion';
import RockText from '../RockText';
import type { GameFieldProps, LiveTarget } from './types';

// Your car's nose sits here; rivals close in from the right.
const PLAYER_X_PCT = 24;
const SPAWN_X_PCT = 105;
// The road surface line (cars sit on it), in % of field height.
const ROAD_TOP_PCT = 76;

const xAt = (progress: number) =>
  SPAWN_X_PCT - progress * (SPAWN_X_PCT - PLAYER_X_PCT);

// Rival paint jobs, picked by rock id so each rival keeps its color.
const RIVAL_COLORS = [
  { body: 'from-violet-400 to-violet-600', glass: 'bg-violet-200/80' },
  { body: 'from-rose-400 to-rose-600', glass: 'bg-rose-200/80' },
  { body: 'from-amber-300 to-amber-500', glass: 'bg-amber-100/80' },
  { body: 'from-emerald-400 to-emerald-600', glass: 'bg-emerald-100/80' },
] as const;

export default function RacerField({
  targets,
  paused,
  shakeTick,
  laserTick,
  boom,
  onBoomDone,
  arrivalTick,
  spaceLabel,
}: GameFieldProps) {
  // Player-car reactions on persistent nodes: nitro lunge per correct key,
  // bump wobble when a rival reaches the bumper.
  const carControls = useAnimationControls();
  useEffect(() => {
    if (laserTick > 0) {
      void carControls.start({
        x: [0, 10, 0],
        transition: { duration: 0.28, ease: 'easeOut' },
      });
    }
  }, [laserTick, carControls]);
  useEffect(() => {
    if (arrivalTick > 0) {
      void carControls.start({
        x: [0, -12, 0],
        rotate: [0, -4, 3, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
    }
  }, [arrivalTick, carControls]);
  // The finishing keystroke (boom = a rival got passed) gets a BIGGER surge
  // than a normal key — nose lifts, car leaps forward: we're the one passing.
  useEffect(() => {
    if (boom) {
      void carControls.start({
        x: [0, 22, 0],
        rotate: [0, -3, 0],
        transition: { duration: 0.55, ease: 'easeOut' },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boom?.tick, carControls]);
  const wrongControls = useAnimationControls();
  useEffect(() => {
    if (shakeTick > 0) {
      void wrongControls.start({
        y: [0, -3, 0, -2, 0],
        transition: { duration: 0.25 },
      });
    }
  }, [shakeTick, wrongControls]);

  return (
    <>
      {/* Speed lines — thin streaks racing by to sell velocity. */}
      <div className="pointer-events-none absolute inset-x-0 top-[12%] z-0 h-[40%] overflow-hidden">
        <motion.div
          className="flex h-full w-[200%]"
          animate={paused ? { x: '0%' } : { x: ['0%', '-50%'] }}
          transition={
            paused
              ? { duration: 0 }
              : { duration: 1.6, repeat: Infinity, ease: 'linear' }
          }
        >
          <SpeedLines />
          <SpeedLines />
        </motion.div>
      </div>

      {/* Road — surface line + scrolling center dashes (fast!). */}
      <div
        className="absolute inset-x-0 z-0 h-px bg-cyan-200/50"
        style={{ top: `${ROAD_TOP_PCT}%` }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 z-0 overflow-hidden"
        style={{ top: `calc(${ROAD_TOP_PCT}% + 10px)`, height: '6px' }}
      >
        <motion.div
          className="flex h-full w-[200%]"
          animate={paused ? { x: '0%' } : { x: ['0%', '-50%'] }}
          transition={
            paused
              ? { duration: 0 }
              : { duration: 0.9, repeat: Infinity, ease: 'linear' }
          }
        >
          <RoadDashes />
          <RoadDashes />
        </motion.div>
      </div>

      {/* Your car. Outer div owns position + centering (plain, never
          animated); lunge/bump/wrong-wobble live on inner control nodes. */}
      <div
        className="absolute z-10 -translate-x-1/2 -translate-y-full"
        style={{ left: `${PLAYER_X_PCT}%`, top: `${ROAD_TOP_PCT}%` }}
      >
        <motion.div animate={carControls}>
          <motion.div animate={wrongControls}>
            <Car
              body="from-cyan-300 to-blue-600"
              glass="bg-cyan-100/90"
              paused={paused}
              player
            />
          </motion.div>
        </motion.div>
        {/* Nitro flame — flares on each correct key. Behind the car, its own
            node (AnimatePresence keyed per shot is fine: flame has no mask
            and lives outside the car's DOM). */}
        <AnimatePresence>
          {laserTick > 0 && (
            <motion.div
              key={laserTick}
              className="absolute -left-9 bottom-2 flex items-center"
              initial={{ opacity: 1, scaleX: 0.4 }}
              animate={{ opacity: 0, scaleX: 1.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ transformOrigin: 'right center' }}
            >
              <div className="h-3 w-9 rounded-full bg-gradient-to-l from-amber-300 via-orange-500/80 to-transparent blur-[1px]" />
              <div className="-ml-2 h-2 w-2 rounded-full bg-white/90 shadow-[0_0_8px_3px_rgba(251,146,60,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rival cars ahead — keyed by SLOT (pool re-seat pattern). */}
      {targets.map((target, slot) => (
        <Rival
          key={slot}
          target={target}
          paused={paused}
          shakeTick={shakeTick}
          spaceLabel={spaceLabel}
        />
      ))}

      {/* OVERTAKE: the beaten rival doesn't vanish — it falls behind. The
          same car (same paint, via boom.id) slides from where it was, drifts
          to the far lane (up + slightly smaller, BEHIND our car via z-order)
          and accelerates off the LEFT edge — the classic side-scroller
          "we're faster" illusion. Smoke puffs trail the pass. */}
      <AnimatePresence>
        {boom && (
          <motion.div
            key={`pass-${boom.tick}`}
            className="pointer-events-none absolute z-0"
            style={{ top: `${ROAD_TOP_PCT}%` }}
            initial={{ left: `${xAt(boom.progress)}%`, opacity: 1 }}
            animate={{ left: '-18%', opacity: [1, 1, 0.9] }}
            exit={{ opacity: 0 }}
            transition={{
              left: { duration: 0.8, ease: [0.5, 0, 0.9, 0.4] },
              opacity: { duration: 0.8, times: [0, 0.85, 1] },
            }}
            onAnimationComplete={onBoomDone}
          >
            {/* Centering + lift on a plain child (bugs.md rule: framer owns
                the parent's left, so transforms live one node down). The
                drift to the far lane is its own animation layer. */}
            <div className="-translate-x-1/2 -translate-y-full">
              <motion.div
                initial={{ y: 0, scale: 1, rotate: 0 }}
                animate={{ y: -14, scale: 0.88, rotate: -3 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="opacity-80"
              >
                <div className="-scale-x-100">
                  <OvertakenCar id={boom.id} />
                </div>
              </motion.div>
              {/* Smoke kicked up as we blow past. */}
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute bottom-0 text-base"
                  style={{ left: `${i * 18 + 8}px` }}
                  initial={{ opacity: 0.8, x: 0, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, x: 22 + i * 8, y: -8 - i * 4, scale: 1.3 }}
                  transition={{ duration: 0.55, delay: i * 0.06 }}
                  aria-hidden
                >
                  💨
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// One rival ahead on the road, word sign on its roof.
// ---------------------------------------------------------------------------

function Rival({
  target,
  paused,
  shakeTick,
  spaceLabel,
}: {
  target: LiveTarget;
  paused: boolean;
  shakeTick: number;
  spaceLabel: string;
}) {
  const { active } = target;
  const left = useTransform(target.progress, (v) => `${xAt(v)}%`);
  const paint = RIVAL_COLORS[Math.abs(target.id) % RIVAL_COLORS.length];

  // Wrong key rattles the ACTIVE rival's sign (controls, no remount).
  const rattleControls = useAnimationControls();
  useEffect(() => {
    if (active && shakeTick > 0) {
      void rattleControls.start({
        x: [0, -6, 6, -3, 0],
        transition: { duration: 0.3 },
      });
    }
  }, [active, shakeTick, rattleControls]);

  return (
    // Outer node: framer drives style.left only; Tailwind centering + lift
    // stay safe (bugs.md rule).
    <motion.div
      style={{ left, top: `${ROAD_TOP_PCT}%` }}
      className={`absolute z-10 -translate-x-1/2 -translate-y-full ${
        active ? '' : 'opacity-60'
      }`}
    >
      <motion.div animate={rattleControls} className="flex flex-col items-center">
        <div
          className={`mb-1 rounded-lg bg-slate-900/85 px-2 py-1 shadow-lg ring-1 ${
            active ? 'ring-cyan-300/50' : 'ring-white/10'
          }`}
        >
          <RockText
            text={target.rock.text}
            charIndex={target.charIndex}
            spaceLabel={spaceLabel}
            highlight={active}
          />
        </div>
        {/* Rivals face LEFT (toward you) — mirror the car. */}
        <div className="-scale-x-100">
          <Car body={paint.body} glass={paint.glass} paused={paused} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// The just-overtaken rival re-drawn for the pass-by animation — same paint
// job as the live rival it replaces (both hash boom.id / target.id the same
// way), wheels still spinning: it's still driving, we're just faster.
function OvertakenCar({ id }: { id: number }) {
  const paint = RIVAL_COLORS[Math.abs(id) % RIVAL_COLORS.length];
  return <Car body={paint.body} glass={paint.glass} paused={false} />;
}

// ---------------------------------------------------------------------------
// A cartoon race car in CSS: low body, cabin window, spoiler, two spinning
// wheels (spoke line shows the spin; freezes on pause).
// ---------------------------------------------------------------------------

function Car({
  body,
  glass,
  paused,
  player = false,
}: {
  body: string;
  glass: string;
  paused: boolean;
  player?: boolean;
}) {
  return (
    <div className={`relative ${player ? 'h-12 w-24 sm:h-14 sm:w-28' : 'h-10 w-20 sm:h-12 sm:w-24'}`}>
      {/* Spoiler */}
      <div className="absolute left-0 top-[30%] h-[12%] w-[14%] rounded-sm bg-slate-300/90" />
      <div className="absolute left-[5%] top-[38%] h-[26%] w-[6%] rounded-sm bg-slate-400/90" />
      {/* Cabin */}
      <div className={`absolute left-[30%] top-0 h-[52%] w-[38%] rounded-t-xl bg-gradient-to-b ${body}`}>
        <div className={`absolute left-[15%] top-[22%] h-[55%] w-[55%] rounded-md ${glass}`} />
      </div>
      {/* Body */}
      <div className={`absolute bottom-[18%] left-0 h-[38%] w-full rounded-full bg-gradient-to-b ${body} shadow-md`} />
      {/* Headlight */}
      <div className="absolute bottom-[30%] right-0 h-[12%] w-[6%] rounded-full bg-amber-200" />
      {/* Wheels */}
      <Wheel className="left-[14%]" paused={paused} />
      <Wheel className="right-[14%]" paused={paused} />
    </div>
  );
}

function Wheel({ className, paused }: { className: string; paused: boolean }) {
  return (
    <div className={`absolute bottom-0 h-[38%] aspect-square ${className}`}>
      <motion.div
        className="relative h-full w-full rounded-full bg-slate-800 ring-2 ring-slate-600"
        animate={paused ? undefined : { rotate: 360 }}
        transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
      >
        {/* Spokes make the spin visible. */}
        <div className="absolute left-1/2 top-[12%] h-[76%] w-px -translate-x-1/2 bg-slate-400/90" />
        <div className="absolute left-[12%] top-1/2 h-px w-[76%] -translate-y-1/2 bg-slate-400/90" />
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300" />
      </motion.div>
    </div>
  );
}

// Speed streaks tile (fixed layout — SSR/client must match).
const STREAKS: { top: number; left: number; w: number; o: number }[] = [
  { top: 8, left: 5, w: 34, o: 0.16 },
  { top: 24, left: 42, w: 22, o: 0.1 },
  { top: 38, left: 15, w: 42, o: 0.14 },
  { top: 55, left: 60, w: 26, o: 0.1 },
  { top: 70, left: 30, w: 36, o: 0.14 },
  { top: 88, left: 72, w: 20, o: 0.08 },
];

function SpeedLines() {
  return (
    <div className="relative h-full w-1/2 shrink-0">
      {STREAKS.map((s, i) => (
        <span
          key={i}
          className="absolute h-px rounded-full bg-cyan-100"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.w}px`,
            opacity: s.o,
          }}
        />
      ))}
    </div>
  );
}

// Center-lane dashes tile.
function RoadDashes() {
  return (
    <div className="relative h-full w-1/2 shrink-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-1/2 h-[3px] w-7 -translate-y-1/2 rounded-full bg-cyan-200/30"
          style={{ left: `${(i / 6) * 100}%` }}
        />
      ))}
    </div>
  );
}
