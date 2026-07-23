// components/typing/games/SpaceDefenseField.tsx
//
// "Space Defense" skin: letter/word meteors drift DOWN toward a shield line;
// the kid types the meteor's text to zap it with the laser cannon.
// Presentation only — all game state comes from GameFieldProps.
//
// Maps each target's `progress` (0..1 threat-approach) to its top offset:
// 0% → ROCK_TRAVEL_PCT% of the field height (the shield line). Stages with
// maxConcurrent > 1 hand us more than one target: the frontmost (lowest on
// screen) is the live one, the rest hang higher up, dimmed.

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

// Meteor falls from 0% → 72% of field height (where the shield sits).
const ROCK_TRAVEL_PCT = 72;

export default function SpaceDefenseField({
  targets,
  shakeTick,
  laserTick,
  boom,
  onBoomDone,
  arrivalTick,
  spaceLabel,
}: GameFieldProps) {
  // The cannon tracks the target being typed; it holds still (center) only in
  // the blink between the last rock resolving and the round ending.
  const activeX = targets[0]?.x ?? 50;

  return (
    <>
      {/* Keyed by SLOT, not by rock id: slot 0's node always reads slot 0's
          MotionValue. When the front meteor is destroyed the engine re-seats
          the pool (the trailing rock's progress moves into slot 0), so this
          node keeps rendering the right meteor at the right height with no
          remount and no jump. */}
      {targets.map((target, slot) => (
        <Meteor
          key={slot}
          target={target}
          shakeTick={shakeTick}
          spaceLabel={spaceLabel}
        />
      ))}

      {/* Laser flash */}
      <AnimatePresence>
        {laserTick > 0 && (
          <motion.div
            key={laserTick}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ left: `${activeX}%` }}
            className="absolute bottom-16 top-0 z-0 w-1 -translate-x-1/2 rounded-full bg-gradient-to-t from-cyan-300 via-fuchsia-400 to-transparent"
          />
        )}
      </AnimatePresence>

      {/* Explosion particles */}
      <AnimatePresence>
        {boom && (
          <motion.div
            key={boom.tick}
            className="pointer-events-none absolute z-20"
            style={{
              left: `${boom.x}%`,
              // Burst where the meteor actually was, not at a fixed height.
              top: `${boom.progress * ROCK_TRAVEL_PCT}%`,
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onAnimationComplete={onBoomDone}
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, scale: 1 }}
                animate={{
                  x: Math.cos((i / 7) * Math.PI * 2) * 42,
                  y: Math.sin((i / 7) * Math.PI * 2) * 42,
                  scale: 0,
                }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute h-2.5 w-2.5 rounded-full bg-amber-300"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shield line — flashes when a meteor reaches it (soft miss). */}
      <motion.div
        key={arrivalTick}
        initial={arrivalTick ? { opacity: 1 } : { opacity: 0.35 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-x-4 z-0 h-1 rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
        style={{ top: `${ROCK_TRAVEL_PCT + 8}%` }}
      />

      {/* Spaceship slides under the active rock */}
      <motion.div
        animate={{ left: `${activeX}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="absolute bottom-1 z-10 -translate-x-1/2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/game/space-defense/aerospace.svg"
          alt=""
          className="h-16 w-auto drop-shadow-[0_0_10px_rgba(217,70,239,0.45)] sm:h-20"
          draggable={false}
        />
      </motion.div>
    </>
  );
}

// One meteor. Outer div owns BOTH position (top from the fall MotionValue,
// left%) AND horizontal centering (-translate-x-1/2). Centering MUST live
// there, not on the inner shake div: framer's shake sets
// `transform: translateX(...)` which would clobber a Tailwind -translate-x-1/2
// on that same node, leaving the pill left-anchored (long rocks then overflow
// the right edge). The inner div only owns the shake.
function Meteor({
  target,
  shakeTick,
  spaceLabel,
}: {
  target: LiveTarget;
  shakeTick: number;
  spaceLabel: string;
}) {
  const top = useTransform(target.progress, (v) => `${v * ROCK_TRAVEL_PCT}%`);
  const { active } = target;

  // Shake restarts via controls on a persistent node — a key-remount here
  // rebuilt the pill DOM every wrong key (occasional paint flash; same
  // flicker family as the dino's mask remounts).
  const shakeControls = useAnimationControls();
  useEffect(() => {
    if (active && shakeTick > 0) {
      void shakeControls.start({
        x: [0, -7, 7, -4, 0],
        transition: { duration: 0.3 },
      });
    }
  }, [active, shakeTick, shakeControls]);

  return (
    <motion.div
      style={{ top, left: `${target.x}%` }}
      className={`absolute z-10 -translate-x-1/2 ${active ? '' : 'opacity-50'}`}
    >
      {/* Only the live meteor reacts to keystrokes — a wrong key must not
          rattle the one queued behind it (the controls effect guards on
          `active`). */}
      <motion.div animate={shakeControls}>
        <div
          className={`rounded-2xl border bg-gradient-to-br px-4 py-2.5 shadow-xl shadow-black/40 ${
            active
              ? 'border-white/20 from-slate-600/90 to-slate-800/90'
              : 'border-white/10 from-slate-700/80 to-slate-900/80'
          }`}
        >
          <RockText
            text={target.rock.text}
            charIndex={target.charIndex}
            spaceLabel={spaceLabel}
            highlight={active}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
