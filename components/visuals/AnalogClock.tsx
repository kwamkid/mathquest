// components/visuals/AnalogClock.tsx
//
// Read-only analog clock SVG. Hours (1-12) and minutes (0-59) drive the two
// hands; the hour hand inches forward by the minute fraction so 3:30 lands
// halfway between 3 and 4 — the way a real clock looks.
//
// Used both as a passive ConceptBlock visual and as the render layer behind
// the interactive SetClockQuestion (which adds drag handlers on top).

'use client';

interface Props {
  hours: number;
  minutes: number;
  size?: number;
  // Optional caption rendered below the clock.
  caption?: string;
}

// Hour-hand angle for h:m. 12 o'clock = 0°; clockwise positive.
// Each hour is 30°; each minute nudges the hour hand 0.5°.
const hourAngle = (h: number, m: number): number =>
  ((h % 12) * 30 + m * 0.5) % 360;

// Minute-hand angle for m. 0 = 0°; 15 = 90°; 30 = 180°.
const minuteAngle = (m: number): number => (m * 6) % 360;

// Polar → Cartesian for SVG. degrees are measured clockwise from 12 o'clock.
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

export default function AnalogClock({ hours, minutes, size = 180, caption }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;

  const hourHandLen = r * 0.5;
  const minuteHandLen = r * 0.78;

  const hourEnd = polar(cx, cy, hourHandLen, hourAngle(hours, minutes));
  const minuteEnd = polar(cx, cy, minuteHandLen, minuteAngle(minutes));

  // 12 hour numbers + 60 minute ticks (major every 5).
  const hourMarks = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const pos = polar(cx, cy, r - 18, num * 30);
    return { num, ...pos };
  });

  const minuteTicks = Array.from({ length: 60 }, (_, i) => {
    const major = i % 5 === 0;
    const outer = polar(cx, cy, r - 2, i * 6);
    const inner = polar(cx, cy, r - (major ? 10 : 5), i * 6);
    return { i, outer, inner, major };
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`นาฬิกาแสดงเวลา ${hours}:${minutes.toString().padStart(2, '0')}`}
      >
        {/* face */}
        <circle cx={cx} cy={cy} r={r} fill="#FFFCF4" stroke="#3a2f5f" strokeWidth={3} />

        {/* minute ticks */}
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

        {/* hour numerals */}
        {hourMarks.map((h) => (
          <text
            key={h.num}
            x={h.x}
            y={h.y}
            fontSize={size * 0.11}
            fontWeight="bold"
            fill="#2b2150"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="ui-sans-serif, system-ui"
          >
            {h.num}
          </text>
        ))}

        {/* hour hand */}
        <line
          x1={cx}
          y1={cy}
          x2={hourEnd.x}
          y2={hourEnd.y}
          stroke="#2b2150"
          strokeWidth={5}
          strokeLinecap="round"
        />

        {/* minute hand */}
        <line
          x1={cx}
          y1={cy}
          x2={minuteEnd.x}
          y2={minuteEnd.y}
          stroke="#7c3aed"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* center pin */}
        <circle cx={cx} cy={cy} r={4} fill="#2b2150" />
      </svg>
      {caption && <span className="text-sm text-white/70">{caption}</span>}
    </div>
  );
}
