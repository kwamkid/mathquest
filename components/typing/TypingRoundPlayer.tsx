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
  useTransform,
} from 'framer-motion';
import { Check, ChevronRight, Rocket, Star, X } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import LessonHeader from '@/components/lesson/LessonHeader';
import HandsGuide from '@/components/typing/HandsGuide';
import VirtualKeyboard from '@/components/typing/VirtualKeyboard';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import { useSound } from '@/lib/game/soundManager';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { fingerForChar, LAYOUTS } from '@/lib/typing/layouts';
import { generateStageRocks, type Rock } from '@/lib/typing/content';
import {
  findNextStage,
  getTypingProgress,
  saveTypingStage,
  stageId,
} from '@/lib/typing/progress';
import {
  meteorSeconds,
  PASSING_ACCURACY,
  stageKind,
  stageMeta,
} from '@/lib/typing/config';

interface Props {
  unit: number;
  stage: number;
}

// Cheer lines for combo milestones (every 5 hits without a miss).
const CHEERS = {
  th: ['เก่งมาก! 🔥', 'สุดยอดเลย!', 'มือโปรชัดๆ!', 'ไปต่ออย่าหยุด!', 'เทพพิมพ์ดีด!'],
  en: ['Awesome! 🔥', 'On fire!', 'Like a pro!', 'Keep it going!', 'Typing hero!'],
} as const;

const WRONG_REPEAT_GUARD_MS = 120;
const ROCK_TRAVEL_PCT = 72; // rock falls from 0% → 72% of field height (shield line)

export default function TypingRoundPlayer({ unit, stage }: Props) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { lang, t } = useLanguage();
  const { playSound } = useSound();

  const meta = stageMeta(unit, stage);
  const kind = stageKind(unit, stage);
  const exitHref = `/typing/${unit}`;

  // ----- Round content (regenerated per attempt) -----
  const [attempt, setAttempt] = useState(0);
  const rocks: Rock[] = useMemo(
    () => generateStageRocks(unit, stage),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unit, stage, attempt],
  );
  // Horizontal position per rock (15%..85%), stable per attempt.
  const rockXs = useMemo(
    () => rocks.map(() => 15 + Math.random() * 70),
    [rocks],
  );

  // ----- Game state -----
  const [phase, setPhase] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [focused, setFocused] = useState(false);
  const [rockIndex, setRockIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [cheer, setCheer] = useState<string | null>(null);
  const [pressedChar, setPressedChar] = useState<string | null>(null);
  const [shakeTick, setShakeTick] = useState(0);
  const [laserTick, setLaserTick] = useState(0);
  const [boom, setBoom] = useState<{ x: number; tick: number } | null>(null);
  const [shieldFlash, setShieldFlash] = useState(0);
  const [reward, setReward] = useState<{ exp: number; firstClear: boolean } | null>(null);
  const [nextAfter, setNextAfter] = useState<{ unit: number; stage: number } | null>(null);
  const [compactViewport, setCompactViewport] = useState(false);
  // True while the OS keyboard is emitting Thai characters (forgot to switch
  // input language) — shows a how-to-switch banner instead of counting errors.
  const [wrongLang, setWrongLang] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const lastWrongRef = useRef<{ char: string; time: number } | null>(null);
  const pressedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cheerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeMsRef = useRef(0); // unpaused play time (drives WPM)
  const fallMsRef = useRef(meteorSeconds(unit, stage) * 1000);
  const elapsedRef = useRef(0); // current rock's fall time
  const shieldHitGuard = useRef(false);

  const rock = rocks[rockIndex] as Rock | undefined;
  const rockX = rockXs[rockIndex] ?? 50;
  const expectedChar = rock?.text[charIndex] ?? null;
  const isPlaying = phase === 'playing';
  const paused = isPlaying && !focused;

  // Rock fall progress 0..1 → top offset. MotionValue avoids re-render/frame.
  const fallProgress = useMotionValue(0);
  const rockTop = useTransform(fallProgress, (v) => `${v * ROCK_TRAVEL_PCT}%`);

  const accuracy = hits + errors > 0 ? hits / (hits + errors) : 1;

  // ----- Fall loop (pausable) -----
  useAnimationFrame((_, delta) => {
    if (!isPlaying || paused || !rock) return;
    activeMsRef.current += delta;
    elapsedRef.current += delta;
    const p = Math.min(1, elapsedRef.current / fallMsRef.current);
    fallProgress.set(p);
    if (p >= 1 && !shieldHitGuard.current) {
      shieldHitGuard.current = true;
      handleShieldHit();
    }
  });

  const resetRockFall = useCallback(() => {
    elapsedRef.current = 0;
    shieldHitGuard.current = false;
    fallProgress.set(0);
  }, [fallProgress]);

  // ----- Advance / finish -----
  const advanceRock = useCallback(
    (destroyed: boolean) => {
      if (destroyed) {
        setBoom({ x: rockX, tick: Date.now() });
        playSound('correct');
      }
      setCharIndex(0);
      resetRockFall();
      if (rockIndex + 1 >= rocks.length) {
        setPhase('finished');
      } else {
        setRockIndex((i) => i + 1);
      }
    },
    [rockIndex, rocks.length, rockX, playSound, resetRockFall],
  );

  const handleShieldHit = useCallback(() => {
    setErrors((e) => e + 1);
    setCombo(0);
    setShieldFlash((s) => s + 1);
    playSound('incorrect');
    advanceRock(false);
  }, [advanceRock, playSound]);

  // ----- Keystroke handling (single path for desktop + iPad) -----
  const processChar = useCallback(
    (raw: string) => {
      if (!isPlaying || paused || !rock) return;
      const ch = raw.toLowerCase(); // defeats residual iOS auto-capitalization
      // Thai character = the OS keyboard is still in Thai. Warn, don't punish
      // (not the kid's typing skill) — clears on the first Latin keystroke.
      if (/[\u0E00-\u0E7F]/.test(ch)) {
        setWrongLang(true);
        playSound('incorrect');
        return;
      }
      if (/[a-z ]/.test(ch)) setWrongLang(false);
      const expected = rock.text[charIndex];
      if (!expected) return;

      if (ch === expected) {
        lastWrongRef.current = null;
        setHits((h) => h + 1);
        setLaserTick((n) => n + 1);
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
          advanceRock(true);
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
      }
    },
    [isPlaying, paused, rock, charIndex, combo, lang, advanceRock, playSound],
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
      if (phase === 'intro' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault(); // space would scroll the page
        startGame();
      } else if (isPlaying && !focused && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, exitHref, phase, isPlaying, focused]);

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
    resetRockFall();
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
    setRockIndex(0);
    setCharIndex(0);
    setHits(0);
    setErrors(0);
    setCombo(0);
    setBestCombo(0);
    setCheer(null);
    setReward(null);
    setNextAfter(null);
    activeMsRef.current = 0;
    resetRockFall();
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
    void (async () => {
      const res = await saveTypingStage({ userId: user.id, unit, stage, perfect });
      setReward({ exp: res.expGained, firstClear: res.firstClear });
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
  }, [phase, passed, perfect, user, unit, stage, playSound, refreshUser]);
  // Reset the save guard on restart.
  useEffect(() => {
    if (phase === 'intro') savedRef.current = false;
  }, [phase]);

  const title = `${t.typing.unitWord} ${unit} · ${
    lang === 'en' ? meta.enTitle : meta.thaiTitle
  }`;

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

          {/* EXP banner — the payout, visually distinct from the stats. */}
          {passed && reward && (
            <div
              className={`mt-3 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-lg font-bold ${
                reward.firstClear
                  ? 'border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-orange-500/15 text-amber-200'
                  : 'bg-white/[0.04] text-base font-semibold text-white/60'
              }`}
            >
              {reward.firstClear ? (
                <>
                  <Star className="h-6 w-6 fill-current text-amber-300" />
                  {t.typing.expGained(reward.exp)}
                </>
              ) : (
                t.typing.stageAlreadyPaid
              )}
            </div>
          )}

          {/* Two buttons only: keep going (or retry on a fail) + back.
              Replaying a passed stage lives on the unit page instead. */}
          <div className="mt-8 flex flex-col gap-3">
            {passed && nextAfter ? (
              <button
                onClick={() =>
                  router.push(`/typing/${nextAfter.unit}/${nextAfter.stage}`)
                }
                className="learn-accent-pill flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
              >
                {t.typing.playNext(
                  nextAfter.unit,
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
        stepTitle={t.typing.rocksLeft(rocks.length - rockIndex)}
        currentStep={rockIndex}
        totalSteps={rocks.length}
        onClose={() => router.push(exitHref)}
      />

      {/* Game field. While playing, any press inside the field keeps the
          hidden input focused (preventDefault stops the browser stealing
          focus) — during the intro we leave defaults alone so the start
          button's click works untouched. */}
      <div
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
          <button
            onClick={startGame}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          >
            <span className="learn-accent-pill flex h-20 w-20 items-center justify-center rounded-full shadow-xl shadow-pink-500/40">
              <Rocket className="h-10 w-10" />
            </span>
            <span className="text-2xl font-bold text-white">
              {t.typing.tapToStart}
            </span>
            <span className="text-base text-white/70">{t.typing.getReady}</span>
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/70">
              {t.typing.orPressSpace}
            </span>
          </button>
        ) : (
          <>
            {/* Meteor — outer div owns position (top from the fall
                MotionValue, Tailwind centers on left%); inner motion.div owns
                the shake so framer's transform never clobbers the centering. */}
            {rock && (
              <motion.div
                style={{ top: rockTop, left: `${rockX}%` }}
                className="absolute z-10"
              >
                <motion.div
                  key={shakeTick}
                  animate={shakeTick ? { x: [0, -7, 7, -4, 0] } : undefined}
                  transition={{ duration: 0.3 }}
                  className="-translate-x-1/2"
                >
                  <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-600/90 to-slate-800/90 px-4 py-2.5 shadow-xl shadow-black/40">
                    <RockText
                      text={rock.text}
                      charIndex={charIndex}
                      spaceLabel={t.typing.spaceKey}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Laser flash */}
            <AnimatePresence>
              {laserTick > 0 && (
                <motion.div
                  key={laserTick}
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ left: `${rockX}%` }}
                  className="absolute bottom-14 top-0 z-0 w-1 -translate-x-1/2 rounded-full bg-gradient-to-t from-cyan-300 via-fuchsia-400 to-transparent"
                />
              )}
            </AnimatePresence>

            {/* Explosion particles */}
            <AnimatePresence>
              {boom && (
                <motion.div
                  key={boom.tick}
                  className="pointer-events-none absolute z-20"
                  style={{ left: `${boom.x}%`, top: '30%' }}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  onAnimationComplete={() => setBoom(null)}
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

            {/* Shield line */}
            <motion.div
              key={shieldFlash}
              initial={shieldFlash ? { opacity: 1 } : { opacity: 0.35 }}
              animate={{ opacity: 0.35 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-x-4 z-0 h-1 rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
              style={{ top: `${ROCK_TRAVEL_PCT + 8}%` }}
            />

            {/* Cannon slides under the rock */}
            <motion.div
              animate={{ left: `${rockX}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              className="absolute bottom-2 z-10 -translate-x-1/2"
            >
              <div className="mx-auto h-6 w-2.5 rounded-t-full bg-gradient-to-t from-fuchsia-500 to-cyan-300" />
              <div className="h-4 w-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg" />
            </motion.div>

            {/* Avatar cheerleader (bottom-left) + combo bubble */}
            <div className="pointer-events-none absolute bottom-1 left-2 z-10 hidden sm:block">
              <AnimatePresence>
                {cheer && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute -top-9 left-4 whitespace-nowrap rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-lg"
                  >
                    {cheer}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                animate={combo >= 5 ? { y: [0, -6, 0] } : { y: 0 }}
                transition={{ duration: 0.5, repeat: combo >= 5 ? Infinity : 0 }}
                className="scale-[0.6] origin-bottom-left"
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
            </div>

            {/* Combo badge */}
            {combo >= 3 && (
              <div className="absolute right-3 top-2 z-10 rounded-full bg-orange-500/20 px-3 py-1 text-sm font-extrabold text-orange-300">
                🔥 {t.typing.comboLabel} ×{combo}
              </div>
            )}

            {/* Wrong-input-language banner. */}
            <AnimatePresence>
              {wrongLang && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="absolute inset-x-3 top-2 z-40 rounded-2xl border border-amber-400/50 bg-amber-500/15 px-4 py-3 text-center backdrop-blur-sm"
                >
                  <p className="text-base font-bold text-amber-200">
                    ⚠️ {t.typing.wrongLangTitle}
                  </p>
                  <p className="mt-0.5 text-sm text-amber-100/80">
                    {t.typing.wrongLangHint}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Paused overlay (focus lost). Resume on pointerdown with
                preventDefault — a plain button onClick loses the race: the
                overlay unmounts mid-gesture and mousedown's default focus
                steal blurs the input right back. */}
            {paused && (
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
            )}
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
          compact={compactViewport}
        />
        {!compactViewport && (
          <HandsGuide
            activeFingers={
              isPlaying && expectedChar
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

// The rock's text: burned (typed) chars dim out, the current char glows.
// A bare-space rock renders as a SPACE pill so the kid knows to hit thumb.
function RockText({
  text,
  charIndex,
  spaceLabel,
}: {
  text: string;
  charIndex: number;
  spaceLabel: string;
}) {
  if (text === ' ') {
    return (
      <span className="rounded-lg bg-violet-500/30 px-3 py-0.5 font-mono text-lg font-bold text-violet-100">
        {spaceLabel}
      </span>
    );
  }
  return (
    <span className="font-mono text-2xl font-extrabold tracking-wider sm:text-3xl">
      {[...text].map((ch, i) => (
        <span
          key={i}
          className={
            i < charIndex
              ? 'text-emerald-400/40 line-through'
              : i === charIndex
                ? 'rounded bg-fuchsia-500/40 px-0.5 text-white'
                : 'text-white/75'
          }
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
