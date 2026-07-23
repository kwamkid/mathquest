'use client';

// Dev-only playground for the typing GAME SKINS (DinoRunField / SpaceDefenseField)
// with NO menu, NO login. It drives the same GameFieldProps the real engine
// feeds, from local mock state:
//   • an auto-advancing `progress` loop (threat approaches, then respawns)
//   • real keyboard input: correct key → advance/boom, wrong key → shake
//   • the home-row ready gate (HomeRowGate), so you can test the ASDF-JKL;
//     ritual here too — it blocks the loop until completed, and the "🖐️ Gate"
//     button re-arms it.
// so leg-swap, jump, shake, stumble, destroy, and the ready ritual all fire
// like in-game.
//
// Not linked anywhere — reach it directly at /game-test.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import DinoRunField from '@/components/typing/games/DinoRunField';
import SpaceDefenseField from '@/components/typing/games/SpaceDefenseField';
import SushiBeltField from '@/components/typing/games/SushiBeltField';
import RacerField from '@/components/typing/games/RacerField';
import HomeRowGate from '@/components/typing/HomeRowGate';
import { comboPace } from '@/lib/typing/config';
import type { GameFieldProps, LiveTarget } from '@/components/typing/games/types';
import type { Rock } from '@/lib/typing/content';

type GameId = 'dino' | 'space' | 'sushi' | 'racer';

// A little canned queue so there's always something to type.
const SAMPLE_TEXTS = ['f', 'j', 'fj', 'jf', ' ', 'dk', 'fff', 'jack'];
const SPAWN_GAP = 0.45; // mirror lib/typing/config

interface Live {
  index: number;
  elapsed: number;
  x: number;
  /** Approach time for THIS target, fixed at spawn (mirrors the engine —
    * combo speed applies to newly-spawned targets, not ones in flight). */
  fallMs: number;
}

export default function GameTestPage() {
  const [game, setGame] = useState<GameId>('dino');
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(8); // seconds for the threat to arrive
  const [concurrent, setConcurrent] = useState(1); // obstacles at once (1 or 2)
  // Home-row ready gate — shown on load and re-armable, like the real intro.
  // The mock loop is frozen while it's up.
  const [showGate, setShowGate] = useState(true);
  // Wrong keyboard language (Thai keys on the EN track) — warn + freeze, like
  // the real engine. Clears on the first Latin keystroke.
  const [wrongLang, setWrongLang] = useState(false);

  // ----- Mock engine state (mirrors TypingRoundPlayer's shape) -----
  const [charIndex, setCharIndex] = useState(0);
  const [shakeTick, setShakeTick] = useState(0);
  const [laser, setLaser] = useState({ tick: 0, progress: 0 });
  const [arrivalTick, setArrivalTick] = useState(0);
  const [boom, setBoom] = useState<{
    x: number;
    progress: number;
    id: number;
    tick: number;
  } | null>(null);
  const [liveIndices, setLiveIndices] = useState<number[]>([0]);
  // Combo drives the adaptive speed (comboPace), same as the real engine.
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);

  const liveRef = useRef<Live[]>([
    { index: 0, elapsed: 0, x: 50, fallMs: 8000 },
  ]);
  const spawnedRef = useRef(1);
  const tickRef = useRef(0);

  const p0 = useMotionValue(0);
  const p1 = useMotionValue(0);
  const p2 = useMotionValue(0);
  const p3 = useMotionValue(0);
  const pool = useMemo(() => [p0, p1, p2, p3], [p0, p1, p2, p3]);

  const textFor = (index: number) => SAMPLE_TEXTS[index % SAMPLE_TEXTS.length];
  const frontProgress = () => {
    const f = liveRef.current[0];
    return f ? Math.min(1, f.elapsed / f.fallMs) : 0;
  };
  const backProgress = () => {
    const b = liveRef.current[liveRef.current.length - 1];
    return b ? Math.min(1, b.elapsed / b.fallMs) : 0;
  };

  const spawn = () => {
    const index = spawnedRef.current;
    spawnedRef.current += 1;
    const live = [
      ...liveRef.current,
      {
        index,
        elapsed: 0,
        x: 35 + Math.random() * 30,
        // Slider base × the live combo dial — same formula family as the
        // engine's spawnRock.
        fallMs: speed * 1000 * comboPace(comboRef.current),
      },
    ];
    liveRef.current = live;
    pool[live.length - 1]?.set(0);
    setLiveIndices(live.map((l) => l.index));
  };

  const resolveFront = (destroyed: boolean) => {
    const front = liveRef.current[0];
    if (!front) return;
    if (destroyed) {
      tickRef.current += 1;
      setBoom({
        x: front.x,
        progress: Math.min(1, front.elapsed / front.fallMs),
        id: front.index,
        tick: tickRef.current,
      });
    }
    const rest = liveRef.current.slice(1);
    liveRef.current = rest;
    rest.forEach((l, slot) => pool[slot]?.set(Math.min(1, l.elapsed / l.fallMs)));
    for (let s = rest.length; s < pool.length; s++) pool[s]?.set(0);
    setCharIndex(0);
    if (rest.length === 0) spawn();
    else setLiveIndices(rest.map((l) => l.index));
  };

  // ----- Progress loop -----
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = now - last;
      last = now;
      if (!paused && !showGate && !wrongLang) {
        const live = liveRef.current;
        for (let s = 0; s < live.length; s++) {
          live[s].elapsed += dt;
          pool[s]?.set(Math.min(1, live[s].elapsed / live[s].fallMs));
        }
        if (frontProgress() >= 1) {
          tickRef.current += 1;
          setArrivalTick(tickRef.current);
          comboRef.current = 0; // a miss resets the combo (and the speed)
          setCombo(0);
          resolveFront(false);
        }
        if (
          liveRef.current.length > 0 &&
          liveRef.current.length < concurrent &&
          backProgress() >= Math.min(SPAWN_GAP, 0.9 / concurrent)
        ) {
          spawn();
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, speed, concurrent, pool, showGate, wrongLang]);

  // ----- Keystrokes: correct advances, wrong shakes (like must-correct) -----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (showGate) return; // gate owns the keyboard until it's completed
      const ch = e.key === ' ' ? ' ' : e.key.toLowerCase();
      if (ch.length !== 1) return;
      // Wrong keyboard language (Thai on the EN track) — warn + freeze, don't
      // process. Clears on the next Latin keystroke (which just resumes).
      if (/[฀-๿]/.test(ch)) {
        e.preventDefault();
        setWrongLang(true);
        return;
      }
      if (wrongLang) {
        e.preventDefault();
        setWrongLang(false);
        return;
      }
      const activeIndex = liveRef.current[0]?.index;
      if (activeIndex === undefined) return;
      const text = textFor(activeIndex);
      const expected = text[charIndex];
      if (!expected) return;
      e.preventDefault();
      if (ch === expected) {
        tickRef.current += 1;
        comboRef.current += 1;
        setCombo(comboRef.current);
        setLaser({ tick: tickRef.current, progress: frontProgress() });
        if (charIndex + 1 >= text.length) {
          resolveFront(true);
        } else {
          setCharIndex((i) => i + 1);
        }
      } else {
        tickRef.current += 1;
        comboRef.current = 0; // wrong key resets the combo (and the speed)
        setCombo(0);
        setShakeTick(tickRef.current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charIndex, speed, showGate, wrongLang]);

  const targets: LiveTarget[] = liveIndices.flatMap((index, slot) => {
    const rock: Rock = { id: `t-${index}`, text: textFor(index) };
    return [
      {
        id: index,
        rock,
        charIndex: slot === 0 ? charIndex : 0,
        progress: pool[slot],
        x: liveRef.current[slot]?.x ?? 50,
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
    arrivalTick,
    spaceLabel: 'เว้นวรรค (Space)',
  };

  return (
    <div className="flex min-h-dvh flex-col bg-metaverse-black text-white">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3 text-sm">
        <span className="font-bold text-white/60">GAME TEST</span>
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {(['dino', 'space', 'sushi', 'racer'] as GameId[]).map((g) => (
            <button
              key={g}
              onClick={() => setGame(g)}
              className={`rounded-md px-3 py-1 font-semibold ${
                game === g ? 'bg-white/15 text-white' : 'text-white/50'
              }`}
            >
              {g === 'dino'
                ? '🦖 Dino Run'
                : g === 'sushi'
                  ? '🍣 Sushi Belt'
                  : g === 'racer'
                    ? '🏎️ Racer'
                    : '🚀 Space Defense'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          className="rounded-md bg-white/10 px-3 py-1 font-semibold"
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          onClick={() => setShowGate(true)}
          className="rounded-md bg-white/10 px-3 py-1 font-semibold"
        >
          🖐️ Gate
        </button>
        <label className="flex items-center gap-2 text-white/60">
          approach
          <input
            type="range"
            min={3}
            max={16}
            step={0.5}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span className="w-10 tabular-nums">{speed}s</span>
        </label>
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setConcurrent(n)}
              className={`rounded-md px-3 py-1 font-semibold ${
                concurrent === n ? 'bg-white/15 text-white' : 'text-white/50'
              }`}
            >
              {n}
            </button>
          ))}
          <span className="px-1 text-white/40">obstacles</span>
        </div>
        {/* Combo + live speed boost — proof the adaptive speed is working:
            the % applies to the NEXT spawned target. */}
        <span
          className={`rounded-md px-3 py-1 font-bold ${
            comboPace(combo) < 1
              ? 'bg-orange-500/20 text-orange-300'
              : 'bg-white/5 text-white/50'
          }`}
        >
          🔥 ×{combo}
          {comboPace(combo) < 1 &&
            ` ⚡ +${Math.round((1 - comboPace(combo)) * 100)}% (ก้อนถัดไป)`}
        </span>
        <span className="text-white/40">
          พิมพ์ตัวหน้าสุด (เช่น{' '}
          {targets[0]?.rock.text === ' ' ? 'SPACE' : targets[0]?.rock.text}) เพื่อยิง/กระโดด
        </span>
      </div>

      {/* The field — same shell dims the engine uses (max-w-2xl, overflow-hidden). */}
      <div className="flex flex-1 items-stretch justify-center p-4">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {game === 'dino' ? (
            <DinoRunField {...fieldProps} />
          ) : game === 'sushi' ? (
            <SushiBeltField {...fieldProps} />
          ) : game === 'racer' ? (
            <RacerField {...fieldProps} />
          ) : (
            <SpaceDefenseField {...fieldProps} />
          )}

          {/* Wrong-keyboard-language overlay — Thai keys on the EN track
              freeze the field and show how to switch, mirroring the real
              engine. Clears on the next Latin keystroke. */}
          {wrongLang && !showGate && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="max-w-md rounded-3xl border border-amber-400/50 bg-amber-500/15 px-6 py-6 text-center">
                <p className="text-4xl">⚠️</p>
                <p className="mt-2 text-xl font-bold text-amber-200 sm:text-2xl">
                  คีย์บอร์ดยังเป็นภาษาไทยอยู่!
                </p>
                <p className="mt-2 text-base text-amber-100/85">
                  สลับเป็น English ก่อนนะ — Mac: ⌘+Space · Windows: Alt+Shift · iPad: ปุ่มลูกโลก 🌐
                </p>
                <p className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/75">
                  เกมหยุดรอให้แล้ว — เปลี่ยนเสร็จ พิมพ์ตัวไหนก็ได้เพื่อเล่นต่อ
                </p>
              </div>
            </div>
          )}

          {/* Home-row ready gate — overlays the (frozen) field, exactly like
              the real intro. Completing it (or the button) dismisses it. */}
          {showGate && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/70 px-4 text-center backdrop-blur-sm">
              <p className="max-w-xs text-base font-bold text-white">
                วางนิ้วบนแป้นเหย้า แล้วกดให้ครบ 8 ปุ่ม — ทีละนิ้วได้เลย!
              </p>
              <HomeRowGate
                onReady={() => setShowGate(false)}
                readyLabel="พร้อมแล้ว! 🚀"
                wrongLangHint="⚠️ แป้นเป็นภาษาไทยอยู่ — สลับเป็น English ก่อนนะ 🌐"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
