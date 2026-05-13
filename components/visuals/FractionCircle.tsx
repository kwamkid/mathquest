// components/visuals/FractionCircle.tsx
//
// SVG fraction circle — pizza-style visual. Divides circle into `denominator` wedges
// and fills `numerator` of them. Used by ConceptBlock { kind: 'fractionCircle' }
// and by click-fraction interactive question (style: 'circle').

'use client';

import { useMemo } from 'react';

export interface FractionCircleProps {
  numerator: number;
  denominator: number;
  size?: number;             // diameter
  filledColor?: string;
  emptyColor?: string;
  borderColor?: string;
  showLabel?: boolean;
  interactive?: boolean;
  onPartClick?: (partIndex: number) => void;
  filledIndices?: number[];
  ariaLabel?: string;
}

// Build an SVG path for one wedge of a circle.
// Angle 0 = top of circle, sweeps clockwise.
//
// Coordinates are rounded to 3 decimals so SSR (Node) and CSR (V8) emit
// byte-identical strings — Node's Math.sin/cos diverges from V8's in the
// 14th decimal, which trips React's hydration text comparison.
const round = (n: number): number => Math.round(n * 1000) / 1000;

const wedgePath = (
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number,
): string => {
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const startA = toRad(startAngleDeg);
  const endA = toRad(endAngleDeg);
  const x1 = round(cx + r * Math.cos(startA));
  const y1 = round(cy + r * Math.sin(startA));
  const x2 = round(cx + r * Math.cos(endA));
  const y2 = round(cy + r * Math.sin(endA));
  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
};

export default function FractionCircle({
  numerator,
  denominator,
  size = 200,
  filledColor = '#EC4899',
  emptyColor = 'rgba(255,255,255,0.10)',
  borderColor = 'rgba(255,255,255,0.45)',
  showLabel = false,
  interactive = false,
  onPartClick,
  filledIndices,
  ariaLabel,
}: FractionCircleProps) {
  const safeDenominator = Math.max(1, Math.floor(denominator));
  const safeNumerator = Math.max(0, Math.min(numerator, safeDenominator));
  const labelHeight = showLabel ? 28 : 0;
  const padding = 4;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - padding;

  const filled = useMemo(() => {
    if (filledIndices) return new Set(filledIndices);
    const s = new Set<number>();
    for (let i = 0; i < safeNumerator; i++) s.add(i);
    return s;
  }, [filledIndices, safeNumerator]);

  const label = `${numerator}/${denominator}`;
  const ariaText = ariaLabel ?? `เศษส่วน ${numerator} ส่วน ${denominator}`;

  return (
    <svg
      width={size}
      height={size + labelHeight}
      viewBox={`0 0 ${size} ${size + labelHeight}`}
      role="img"
      aria-label={ariaText}
      className="select-none"
    >
      {safeDenominator === 1 ? (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={safeNumerator === 1 ? filledColor : emptyColor}
          stroke={borderColor}
          strokeWidth={2}
        />
      ) : (
        Array.from({ length: safeDenominator }, (_, i) => {
          const startAngle = (360 / safeDenominator) * i;
          const endAngle = (360 / safeDenominator) * (i + 1);
          const isFilled = filled.has(i);
          const handleClick = () => {
            if (interactive && onPartClick) onPartClick(i);
          };
          return (
            <path
              key={i}
              d={wedgePath(cx, cy, r, startAngle, endAngle)}
              fill={isFilled ? filledColor : emptyColor}
              stroke={borderColor}
              strokeWidth={2}
              onClick={handleClick}
              style={{
                cursor: interactive ? 'pointer' : 'default',
                transition: 'fill 180ms ease-out',
              }}
            />
          );
        })
      )}
      {showLabel && (
        <text
          x={size / 2}
          y={size + labelHeight / 2 + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={18}
          fontWeight={600}
          fill="#F5F5F5"
          style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}
