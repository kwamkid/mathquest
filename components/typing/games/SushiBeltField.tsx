// components/typing/games/SushiBeltField.tsx
//
// "Sushi Belt" skin: word plates glide along a conveyor belt from the right
// toward a hungry panda customer on the left. Type the plate's word to feed
// the panda (destroy); a plate that reaches the panda untyped slides past —
// soft miss, sad panda, never a game over. Presentation only; all state
// comes from GameFieldProps.
//
// Maps each target's `progress` (0..1 threat-approach) to belt position:
// x = 105% (off-screen right) → 12% (the panda). Multi-obstacle stages put
// several plates on the belt in a line — the literal conveyor model.
//
// Art is pure CSS + emoji (plate ellipse, three sushi variants picked by rock
// id hash). Swap for SVGs in /public/game/sushi-belt/ later if wanted.
//
// bugs.md rules honored: positioning transforms live on plain never-animated
// nodes; effect restarts use animation CONTROLS, never key-remounts.

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

// The panda sits here; plates travel from off-screen right down to it.
const PANDA_X_PCT = 12;
const SPAWN_X_PCT = 105;
// The belt band's top edge, in % of field height. Plates ride ON this line.
const BELT_TOP_PCT = 66;

// Where a plate sits (in % of field width) at a given approach progress.
// Single source of truth: plates, the eat-effect and the sad-miss all use it.
const xAt = (progress: number) =>
  SPAWN_X_PCT - progress * (SPAWN_X_PCT - PANDA_X_PCT);

export default function SushiBeltField({
  targets,
  paused,
  shakeTick,
  laserTick,
  boom,
  onBoomDone,
  arrivalTick,
  spaceLabel,
}: GameFieldProps) {
  // Panda reactions on persistent nodes (no remounts): a happy hop per
  // correct key, a sad wobble when a plate slips past.
  const pandaControls = useAnimationControls();
  useEffect(() => {
    if (laserTick > 0) {
      void pandaControls.start({
        y: [0, -6, 0],
        transition: { duration: 0.22, ease: 'easeOut' },
      });
    }
  }, [laserTick, pandaControls]);
  useEffect(() => {
    if (arrivalTick > 0) {
      void pandaControls.start({
        rotate: [0, -12, 10, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
    }
  }, [arrivalTick, pandaControls]);

  return (
    <>
      {/* Belt band — two rails + a scrolling slat strip between them, so the
          belt reads as moving left (same two-tile loop as the dino ground). */}
      <div
        className="absolute inset-x-0 z-0 h-px bg-cyan-200/40"
        style={{ top: `${BELT_TOP_PCT}%` }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 z-0 overflow-hidden"
        style={{ top: `calc(${BELT_TOP_PCT}% + 2px)`, height: '14px' }}
      >
        <motion.div
          className="flex h-full w-[200%]"
          animate={paused ? { x: '0%' } : { x: ['0%', '-50%'] }}
          transition={
            paused
              ? { duration: 0 }
              : { duration: 5, repeat: Infinity, ease: 'linear' }
          }
        >
          <BeltSlats />
          <BeltSlats />
        </motion.div>
      </div>
      <div
        className="absolute inset-x-0 z-0 h-px bg-cyan-200/25"
        style={{ top: `calc(${BELT_TOP_PCT}% + 17px)` }}
      />

      {/* The customer — a hungry panda at the end of the belt. Outer div owns
          position (plain); reactions animate on the inner node only. */}
      <div
        className="absolute z-10 -translate-x-1/2 -translate-y-full"
        style={{ left: `${PANDA_X_PCT}%`, top: `${BELT_TOP_PCT}%` }}
      >
        <motion.div animate={pandaControls} className="text-4xl sm:text-5xl">
          <span aria-hidden>🐼</span>
        </motion.div>
        {/* Chopsticks resting beside the panda. */}
        <span
          className="absolute -right-4 top-1 rotate-45 text-lg sm:text-xl"
          aria-hidden
        >
          🥢
        </span>
      </div>

      {/* Plates — keyed by SLOT so slot 0's node always reads slot 0's
          MotionValue; when the front plate resolves, the one behind glides
          into the active spot with no remount (same as the other skins). */}
      {targets.map((target, slot) => (
        <Plate
          key={slot}
          target={target}
          shakeTick={shakeTick}
          laserTick={laserTick}
          spaceLabel={spaceLabel}
        />
      ))}

      {/* Eat effect: the sushi piece arcs off the plate into the panda, plus
          a little "yum" burst. Positioned where the plate actually was. */}
      <AnimatePresence>
        {boom && (
          <motion.div
            key={`eat-${boom.tick}`}
            className="pointer-events-none absolute z-20 -translate-x-1/2"
            style={{
              left: `${xAt(boom.progress)}%`,
              top: `calc(${BELT_TOP_PCT}% - 2.2rem)`,
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            onAnimationComplete={onBoomDone}
          >
            {/* The piece flies toward the panda's mouth... */}
            <motion.span
              className="absolute text-2xl"
              initial={{ x: 0, y: 0, scale: 1 }}
              animate={{ x: -60, y: -26, scale: 0.4 }}
              transition={{ duration: 0.4, ease: 'easeIn' }}
              aria-hidden
            >
              🍣
            </motion.span>
            {/* ...and sparkles pop where the plate was. */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-2 w-2 rounded-full bg-amber-200/90"
                initial={{ x: 0, y: 0, scale: 1 }}
                animate={{
                  x: (i - 2) * 16,
                  y: -Math.abs(i - 2) * 10 - 8,
                  scale: 0,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// One plate on the belt: ellipse dish + a CSS sushi piece + the word sign.
// Only the ACTIVE plate glows and reacts to keystrokes.
// ---------------------------------------------------------------------------

// Sushi variety by stable hash of the rock id — same rock keeps its look for
// its whole ride, different rocks vary. Three CSS pieces: salmon nigiri,
// tamago, maki roll.
type SushiKind = 0 | 1 | 2;
const sushiKindOf = (id: number): SushiKind => (Math.abs(id) % 3) as SushiKind;

function Plate({
  target,
  shakeTick,
  laserTick,
  spaceLabel,
}: {
  target: LiveTarget;
  shakeTick: number;
  laserTick: number;
  spaceLabel: string;
}) {
  const { active } = target;
  const left = useTransform(target.progress, (v) => `${xAt(v)}%`);
  const kind = sushiKindOf(target.id);

  // Wobble on a wrong key; happy bounce when a correct key lands. Controls on
  // persistent nodes (bugs.md 2026-07-23 — never key-remount for effects).
  const wobbleControls = useAnimationControls();
  useEffect(() => {
    if (active && shakeTick > 0) {
      void wobbleControls.start({
        rotate: [0, -8, 8, -4, 0],
        transition: { duration: 0.3 },
      });
    }
  }, [active, shakeTick, wobbleControls]);
  const bounceControls = useAnimationControls();
  useEffect(() => {
    if (active && laserTick > 0) {
      void bounceControls.start({
        y: [0, -5, 0],
        transition: { duration: 0.18, ease: 'easeOut' },
      });
    }
  }, [active, laserTick, bounceControls]);

  return (
    // Outer node owns position + centering; framer only ever drives its
    // style.left (a MotionValue), never transform — so the Tailwind
    // -translate-x-1/2 -translate-y-full survives (bugs.md 2026-07-12 rule;
    // same shape as the dino Boulder). Effects live on the inner nodes.
    <motion.div
      style={{ left, top: `${BELT_TOP_PCT}%` }}
      className={`absolute z-10 -translate-x-1/2 -translate-y-full ${
        active ? '' : 'opacity-60'
      }`}
    >
      <motion.div animate={wobbleControls}>
        <motion.div
          animate={bounceControls}
          className="relative flex flex-col items-center"
        >
          {/* Word sign above the dish. */}
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
          {/* The sushi piece. */}
          <Sushi kind={kind} />
          {/* The dish. */}
          <div
            className={`-mt-1 h-2.5 w-16 rounded-[50%] bg-slate-100 shadow-md sm:w-20 ${
              active ? 'ring-2 ring-cyan-300/60' : ''
            }`}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// CSS sushi, three variants. Small, bold shapes read well at belt size.
function Sushi({ kind }: { kind: SushiKind }) {
  if (kind === 0) {
    // Salmon nigiri: orange slab (with stripes) on a rice base.
    return (
      <div className="relative h-5 w-12 sm:w-14">
        <div className="absolute inset-x-1 bottom-0 h-3 rounded-md bg-slate-50" />
        <div className="absolute inset-x-0 top-0 h-3 rounded-md bg-gradient-to-b from-orange-300 to-orange-400">
          <div className="absolute inset-y-0 left-2 w-px bg-orange-200/80" />
          <div className="absolute inset-y-0 left-5 w-px bg-orange-200/80" />
          <div className="absolute inset-y-0 left-8 w-px bg-orange-200/80" />
        </div>
      </div>
    );
  }
  if (kind === 1) {
    // Tamago: yellow slab with a nori band.
    return (
      <div className="relative h-5 w-12 sm:w-14">
        <div className="absolute inset-x-1 bottom-0 h-3 rounded-md bg-slate-50" />
        <div className="absolute inset-x-0 top-0 h-3 rounded-md bg-gradient-to-b from-yellow-200 to-amber-300" />
        <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 rounded-sm bg-emerald-950/80" />
      </div>
    );
  }
  // Maki roll: nori ring, rice, salmon center.
  return (
    <div className="flex h-5 items-end justify-center gap-1">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="relative h-5 w-5 rounded-full bg-emerald-950"
        >
          <div className="absolute inset-[3px] rounded-full bg-slate-50" />
          <div className="absolute inset-[7px] rounded-full bg-orange-400" />
        </div>
      ))}
    </div>
  );
}

// One tile of belt slats (vertical ticks), looped side by side for the
// scroll. Fixed positions — SSR and client must match.
function BeltSlats() {
  return (
    <div className="relative h-full w-1/2 shrink-0">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-1 h-2.5 w-px bg-cyan-200/20"
          style={{ left: `${(i / 12) * 100}%` }}
        />
      ))}
    </div>
  );
}
