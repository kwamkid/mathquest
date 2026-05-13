// components/visuals/NumberLine.tsx
//
// SVG number line — horizontal axis from `from` to `to` with tick marks every `step`.
// `highlight` array shows colored dots on specific values.

'use client';

export interface NumberLineProps {
  from: number;
  to: number;
  step: number;
  highlight?: number[];
  width?: number;
  axisColor?: string;
  highlightColor?: string;
  labelColor?: string;
  ariaLabel?: string;
}

export default function NumberLine({
  from,
  to,
  step,
  highlight,
  width = 600,
  axisColor = 'rgba(255,255,255,0.55)',
  highlightColor = '#EC4899',
  labelColor = '#F5F5F5',
  ariaLabel,
}: NumberLineProps) {
  if (to <= from || step <= 0) return null;

  const padding = 40;
  const innerWidth = width - padding * 2;
  const span = to - from;
  const height = 80;
  const axisY = 40;

  // Round to 3 decimals so SSR/CSR emit byte-identical SVG attribute strings
  // (Node and V8 disagree in the 14th-decimal of float ops, breaking hydration).
  const toX = (value: number) =>
    Math.round((padding + ((value - from) / span) * innerWidth) * 1000) / 1000;

  const ticks: number[] = [];
  const tolerance = 1e-9;
  for (let v = from; v <= to + tolerance; v += step) {
    ticks.push(Number(v.toFixed(6)));
  }

  const highlighted = new Set(highlight ?? []);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel ?? `เส้นจำนวนจาก ${from} ถึง ${to}`}
      className="select-none"
    >
      <line
        x1={padding}
        y1={axisY}
        x2={width - padding}
        y2={axisY}
        stroke={axisColor}
        strokeWidth={2}
      />
      {ticks.map((value, i) => {
        const x = toX(value);
        const isHighlighted = highlighted.has(value);
        return (
          <g key={i}>
            <line
              x1={x}
              y1={axisY - 8}
              x2={x}
              y2={axisY + 8}
              stroke={axisColor}
              strokeWidth={2}
            />
            {isHighlighted && (
              <circle cx={x} cy={axisY} r={8} fill={highlightColor} stroke={axisColor} strokeWidth={2} />
            )}
            <text
              x={x}
              y={axisY + 26}
              textAnchor="middle"
              fontSize={14}
              fontWeight={600}
              fill={labelColor}
              style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
            >
              {value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
