// components/visuals/PercentBar.tsx
//
// Horizontal bar split into 10 segments (each = 10%). Fills proportionally
// to `percent` so 35% lights up 3.5 segments. Used by the Percentages topic
// to make "% of a whole" concrete for early learners.

'use client';

interface Props {
  percent: number;
  label?: string;
}

const WIDTH = 320;
const HEIGHT = 44;
const SEGMENTS = 10; // each segment = 10%
const SEGMENT_W = WIDTH / SEGMENTS;

export default function PercentBar({ percent, label }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillW = (clamped / 100) * WIDTH;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={WIDTH}
        height={HEIGHT + 18}
        viewBox={`0 0 ${WIDTH} ${HEIGHT + 18}`}
        role="img"
        aria-label={`แท่งเปอร์เซ็นต์แสดง ${clamped}%`}
      >
        {/* track */}
        <rect
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
          rx={8}
          ry={8}
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1.5}
        />

        {/* fill */}
        {fillW > 0 && (
          <rect
            x={0}
            y={0}
            width={fillW}
            height={HEIGHT}
            rx={8}
            ry={8}
            fill="url(#pctGrad)"
          />
        )}

        {/* segment dividers (every 10%) */}
        {Array.from({ length: SEGMENTS - 1 }, (_, i) => {
          const x = (i + 1) * SEGMENT_W;
          return (
            <line
              key={i}
              x1={x}
              y1={0}
              x2={x}
              y2={HEIGHT}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
            />
          );
        })}

        {/* tick labels (0, 50, 100) */}
        <text x={2} y={HEIGHT + 14} fontSize={11} fill="rgba(255,255,255,0.6)">
          0
        </text>
        <text
          x={WIDTH / 2}
          y={HEIGHT + 14}
          fontSize={11}
          fill="rgba(255,255,255,0.6)"
          textAnchor="middle"
        >
          50
        </text>
        <text
          x={WIDTH - 2}
          y={HEIGHT + 14}
          fontSize={11}
          fill="rgba(255,255,255,0.6)"
          textAnchor="end"
        >
          100
        </text>

        <defs>
          <linearGradient id="pctGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-base font-bold text-white">
        {label ?? `${clamped}%`}
      </span>
    </div>
  );
}
