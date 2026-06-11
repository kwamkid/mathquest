// components/question/interactive/SetClockQuestion.tsx
//
// Interactive analog-clock question — learner drags the hour & minute hands
// to set a target time. Validation snaps to the nearest minute and accepts
// answers within ±question.tolerance minutes.
//
// Touch + mouse via Pointer Events; one active pointer at a time so two-finger
// taps don't fight over hand selection.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SetClockQuestion } from '@/types/curriculum';

interface Props {
  question: SetClockQuestion;
  onAnswered: (result: { correct: boolean; value: string }) => void;
  disabled?: boolean;
  resetSignal?: number;
  onDraftValidityChange?: (valid: boolean) => void;
  submitSignal?: number;
}

const SIZE = 260;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 8;

// Cartesian → polar degrees (0 = 12 o'clock, clockwise positive).
const angleFromPoint = (x: number, y: number): number => {
  const dx = x - CENTER;
  const dy = y - CENTER;
  const rad = Math.atan2(dx, -dy); // y axis is inverted in screen coords
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
};

const polar = (r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
};

const formatTime = (h: number, m: number): string =>
  `${h}:${m.toString().padStart(2, '0')}`;

export default function SetClockQuestionView({
  question,
  onAnswered,
  disabled,
  resetSignal,
  onDraftValidityChange,
  submitSignal,
}: Props) {
  // Start at 12:00 so the learner sees an obvious "untouched" state.
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [draggedAny, setDraggedAny] = useState(false);

  const draggingRef = useRef<'hour' | 'minute' | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const stateRef = useRef({ hours, minutes });
  stateRef.current = { hours, minutes };

  // Reset when the parent flips resetSignal or the question changes.
  useEffect(() => {
    setHours(12);
    setMinutes(0);
    setDraggedAny(false);
    onDraftValidityChange?.(false);
  }, [resetSignal, question.id, onDraftValidityChange]);

  useEffect(() => {
    onDraftValidityChange?.(draggedAny);
  }, [draggedAny, onDraftValidityChange]);

  const updateFromPointer = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Map screen pixels back to the SVG's 0..SIZE viewBox.
    const x = ((clientX - rect.left) / rect.width) * SIZE;
    const y = ((clientY - rect.top) / rect.height) * SIZE;
    const deg = angleFromPoint(x, y);
    const hand = draggingRef.current;

    if (hand === 'minute') {
      // 6° per minute; snap to whole minutes.
      const m = Math.round(deg / 6) % 60;
      setMinutes(m);
    } else if (hand === 'hour') {
      // 30° per hour; advance through 12 → 1 → … → 11.
      const raw = Math.floor(deg / 30) || 12;
      const h = raw === 0 ? 12 : raw;
      setHours(h);
    }
  }, []);

  const onPointerDownHand = (hand: 'hour' | 'minute') => (e: React.PointerEvent) => {
    if (disabled) return;
    if (pointerIdRef.current !== null) return;
    pointerIdRef.current = e.pointerId;
    draggingRef.current = hand;
    setDraggedAny(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerId !== pointerIdRef.current) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (e.pointerId !== pointerIdRef.current) return;
    pointerIdRef.current = null;
    draggingRef.current = null;
  };

  const submit = useCallback(() => {
    if (disabled) return;
    const { hours: h, minutes: m } = stateRef.current;
    // Tolerance applies to minutes-of-day distance, wrapping at 12*60 = 720.
    const target = (question.expectedHours % 12) * 60 + question.expectedMinutes;
    const actual = (h % 12) * 60 + m;
    let diff = Math.abs(target - actual);
    if (diff > 360) diff = 720 - diff; // shortest distance around the dial
    const correct = diff <= question.tolerance;
    onAnswered({ correct, value: formatTime(h, m) });
  }, [disabled, onAnswered, question]);

  useEffect(() => {
    if (submitSignal === undefined) return;
    submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitSignal]);

  // Hour hand: 30° per hour + 0.5° per minute (so it inches between numerals).
  const hourDeg = ((hours % 12) * 30 + minutes * 0.5) % 360;
  const minuteDeg = (minutes * 6) % 360;

  const hourEnd = polar(RADIUS * 0.5, hourDeg);
  const minuteEnd = polar(RADIUS * 0.78, minuteDeg);

  const hourMarks = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const pos = polar(RADIUS - 22, num * 30);
    return { num, ...pos };
  });

  const minuteTicks = Array.from({ length: 60 }, (_, i) => {
    const major = i % 5 === 0;
    const outer = polar(RADIUS - 2, i * 6);
    const inner = polar(RADIUS - (major ? 12 : 6), i * 6);
    return { i, outer, inner, major };
  });

  return (
    <div className="space-y-4">
      <p className="text-xl font-medium text-white sm:text-2xl">{question.prompt}</p>
      <div className="flex flex-col items-center gap-3">
        <svg
          ref={svgRef}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ touchAction: 'none' }}
          className="select-none"
          role="img"
          aria-label={`นาฬิกาแบบโต้ตอบ ปัจจุบัน ${formatTime(hours, minutes)}`}
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#FFFCF4" stroke="#3a2f5f" strokeWidth={3} />

          {minuteTicks.map((t) => (
            <line
              key={t.i}
              x1={t.outer.x}
              y1={t.outer.y}
              x2={t.inner.x}
              y2={t.inner.y}
              stroke="#5b4b87"
              strokeWidth={t.major ? 2 : 1}
            />
          ))}

          {hourMarks.map((h) => (
            <text
              key={h.num}
              x={h.x}
              y={h.y}
              fontSize={SIZE * 0.1}
              fontWeight="bold"
              fill="#2b2150"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="ui-sans-serif, system-ui"
            >
              {h.num}
            </text>
          ))}

          {/* hour hand (thicker, easier to grab) */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={hourEnd.x}
            y2={hourEnd.y}
            stroke="#2b2150"
            strokeWidth={8}
            strokeLinecap="round"
            onPointerDown={onPointerDownHand('hour')}
            style={{ cursor: disabled ? 'not-allowed' : 'grab' }}
          />

          {/* minute hand */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={minuteEnd.x}
            y2={minuteEnd.y}
            stroke="#7c3aed"
            strokeWidth={5}
            strokeLinecap="round"
            onPointerDown={onPointerDownHand('minute')}
            style={{ cursor: disabled ? 'not-allowed' : 'grab' }}
          />

          {/* center pin */}
          <circle cx={CENTER} cy={CENTER} r={6} fill="#2b2150" />
        </svg>

        <div className="flex items-center gap-3 text-base text-white/80">
          <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-lg font-bold text-white">
            {formatTime(hours, minutes)}
          </span>
          <span className="text-sm text-white/60">ลากเข็มเพื่อตั้งเวลา</span>
        </div>
      </div>
    </div>
  );
}
