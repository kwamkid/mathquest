// components/typing/games/types.ts
//
// Shared contract between the typing engine (TypingRoundPlayer) and a game
// "skin". A skin is a PRESENTATION-ONLY component: it owns no game state, it
// only renders the live targets + effects from these props. All gameplay
// logic (keystroke handling, must-correct, combo/accuracy, the pausable fall
// loop, spawning, save/reward) lives in the engine and is shared by every game.
//
// The engine's timing signal is `progress` (0..1) PER TARGET: how close that
// threat is to reaching the player. Each skin maps it to its own axis — Space
// Defense maps it to a falling meteor's top offset; Dino Run maps it to a
// boulder rolling in from the right.
//
// Multi-obstacle model ("conveyor", not ZType): a stage may put 2+ targets on
// the field at once, but only ONE is typeable — `targets[0]`, the frontmost.
// The rest are visible-but-dim: they build tension without ever making it
// ambiguous which rock a keystroke belongs to (must-correct needs exactly one
// expected char). Classic single-rock stages simply get a length-1 array.

import type { MotionValue } from 'framer-motion';
import type { Rock } from '@/lib/typing/content';

export interface LiveTarget {
  /** Index of this rock within the round — stable id for the whole flight. */
  id: number;
  rock: Rock;
  /** Chars already typed. Only meaningful on the active target (0 otherwise). */
  charIndex: number;
  /** 0..1 approach progress for THIS target. */
  progress: MotionValue<number>;
  /** Clamped horizontal position (%) so a long target never overflows. */
  x: number;
  /** True only for `targets[0]` — the one the kid is typing at. */
  active: boolean;
}

export interface GameFieldProps {
  /** Live targets, frontmost first. `[0]` is the active one; may be empty
    * for a frame at the very end of a round. */
  targets: LiveTarget[];
  /** True while play is paused (focus lost) — freeze motion. */
  paused: boolean;
  /** Bumped on a wrong key → shake the active target. */
  shakeTick: number;
  /** Bumped on a correct key → fire the laser / fireball. */
  laserTick: number;
  /** The active target's progress AT THE MOMENT the shot was fired. Skins that
    * animate a projectile must aim here, NOT at the live MotionValue: on the
    * killing keystroke the target resolves in the same tick, so reading the
    * live value would aim the shot at wherever the NEXT rock just spawned. */
  laserProgress: number;
  /** Set when a target is destroyed → play the destroy effect. `progress` is
    * the target's approach value at destroy time, so position-based skins can
    * place the burst exactly where the rock was. */
  boom: { x: number; progress: number; tick: number } | null;
  /** Called when the destroy effect finishes so the engine can clear `boom`. */
  onBoomDone: () => void;
  /** Bumped when a target reaches the player (soft miss). */
  arrivalTick: number;
  /** Localized label for the SPACE pill (t.typing.spaceKey). */
  spaceLabel: string;
}
