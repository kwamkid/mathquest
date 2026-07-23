// components/typing/HomeRowGate.tsx
//
// The "fingers on home row" readiness ritual: before a round starts (and,
// optionally, before resuming) the kid places each finger on ASDF JKL; and
// presses the keys — ANY order, ANY pace, one finger at a time is fine. A
// pressed key lights up and STAYS lit; when all eight are collected the gate
// flashes "Ready!" and fires onReady a beat later.
//
// Why collect-the-set, NOT "press together": consumer keyboards physically
// can't report 6-8 simultaneous keys (matrix ghosting) — pressing all eight
// at once means some keydowns NEVER arrive, so a simultaneity/rolling-window
// gate randomly refuses to complete and kids get stuck (we shipped that
// version; it tested terribly). Sequential taps always register.
//
// Input is read from WINDOW-level keydown (not the game's hidden input), so it
// works before the input is focused and needs no on-screen keyboard — exactly
// why the typing tutor is gated to real keyboards (phones are blocked).

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FINGER_COLORS, type Finger } from '@/lib/typing/layouts';

// ASDF (left hand) + JKL; (right hand). `;` isn't in the a–z curriculum
// layout, so its finger (right pinky) is set explicitly here — the ritual
// teaches the true resting position, even though `;` is never typed in-game.
const HOME_ROW: { key: string; label: string; finger: Finger }[] = [
  { key: 'a', label: 'A', finger: 'lp' },
  { key: 's', label: 'S', finger: 'lr' },
  { key: 'd', label: 'D', finger: 'lm' },
  { key: 'f', label: 'F', finger: 'li' },
  { key: 'j', label: 'J', finger: 'ri' },
  { key: 'k', label: 'K', finger: 'rm' },
  { key: 'l', label: 'L', finger: 'rr' },
  { key: ';', label: ';', finger: 'rp' },
];

const READY_HOLD_MS = 450; // "Ready!" beat before firing onReady

export default function HomeRowGate({
  onReady,
  readyLabel,
  wrongLangHint,
}: {
  onReady: () => void;
  /** Localized "Ready!" flash text. */
  readyLabel: string;
  /** Localized "your keyboard is in Thai" warning — shown when Thai keystrokes
    * arrive, since they can't ever complete the Latin home row (the kid would
    * otherwise be stuck pressing keys that do nothing). */
  wrongLangHint: string;
}) {
  const [lit, setLit] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [wrongLang, setWrongLang] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      // Wrong keyboard language: Thai keys can never satisfy the Latin home
      // row, so warn instead of silently ignoring them.
      if (/[฀-๿]/.test(k)) {
        e.preventDefault();
        setWrongLang(true);
        return;
      }
      if (!HOME_ROW.some((h) => h.key === k)) {
        // Any other Latin key means they've switched back — clear the warning.
        if (/[a-z]/.test(k)) setWrongLang(false);
        return;
      }
      e.preventDefault(); // don't let ASDF scroll or leak anywhere
      setWrongLang(false);
      // Collect the set: once pressed, a key stays lit — no expiry, no
      // simultaneity. Complete on the press that fills the eighth slot.
      setLit((prev) => {
        if (prev.has(k)) return prev;
        const next = new Set(prev);
        next.add(k);
        if (!doneRef.current && HOME_ROW.every((h) => next.has(h.key))) {
          doneRef.current = true;
          setReady(true);
          setTimeout(onReady, READY_HOLD_MS);
        }
        return next;
      });
    };
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, [onReady]);

  const renderKey = (h: (typeof HOME_ROW)[number]) => {
    const on = lit.has(h.key) || ready;
    const colors = FINGER_COLORS[h.finger];
    return (
      <motion.span
        key={h.key}
        animate={on ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 }}
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-extrabold shadow-md ring-2 transition-colors sm:h-12 sm:w-12 ${
          on ? `${colors.active} ring-white/40` : `${colors.key} ring-transparent`
        }`}
      >
        {h.label}
      </motion.span>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Wrong-language warning — the ritual can't complete on a Thai keyboard,
          so surface it right here rather than leaving the kid stuck. */}
      {wrongLang && (
        <p className="max-w-xs text-sm font-bold text-amber-300">
          {wrongLangHint}
        </p>
      )}
      {/* Two hand groups with a thumb-gap between them, so the shape mirrors
          real hands on the keyboard. */}
      <div className="flex items-center gap-1.5">
        <div className="flex gap-1.5">{HOME_ROW.slice(0, 4).map(renderKey)}</div>
        <div className="w-5 sm:w-8" aria-hidden />
        <div className="flex gap-1.5">{HOME_ROW.slice(4).map(renderKey)}</div>
      </div>
      {ready && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-lg font-extrabold text-emerald-300"
        >
          {readyLabel}
        </motion.span>
      )}
    </div>
  );
}
