// components/visuals/FractionBar.tsx
//
// SVG fraction bar — divides a bar into `denominator` equal parts and fills `numerator` of them.
// Used by ConceptBlock { kind: 'fractionBar' } and by the click-fraction interactive question.

'use client';

import { useMemo } from 'react';

export interface FractionBarProps {
  numerator: number;
  denominator: number;
  width?: number;
  height?: number;
  filledColor?: string;
  emptyColor?: string;
  borderColor?: string;
  showLabel?: boolean;       // shows "n/d" caption below the bar
  showFraction?: boolean;    // shows "n/d" centered on the bar
  interactive?: boolean;
  onPartClick?: (partIndex: number) => void;
  filledIndices?: number[];  // override which parts are filled (default: first n)
  ariaLabel?: string;
}

export default function FractionBar({
  numerator,
  denominator,
  width = 320,
  height = 64,
  filledColor = '#EC4899',
  emptyColor = 'rgba(255,255,255,0.10)',
  borderColor = 'rgba(255,255,255,0.45)',
  showLabel = false,
  showFraction = false,
  interactive = false,
  onPartClick,
  filledIndices,
  ariaLabel,
}: FractionBarProps) {
  const safeDenominator = Math.max(1, Math.floor(denominator));
  const safeNumerator = Math.max(0, Math.min(numerator, safeDenominator));
  // Round partWidth so SSR/CSR emit identical SVG strings (avoid hydration mismatch).
  const partWidth = Math.round((width / safeDenominator) * 1000) / 1000;
  const labelHeight = showLabel ? 28 : 0;

  const filled = useMemo(() => {
    if (filledIndices) {
      return new Set(filledIndices);
    }
    const s = new Set<number>();
    for (let i = 0; i < safeNumerator; i++) s.add(i);
    return s;
  }, [filledIndices, safeNumerator]);

  const label = `${numerator}/${denominator}`;
  const ariaText =
    ariaLabel ?? `เศษส่วน ${numerator} ส่วน ${denominator}`;

  return (
    <svg
      width={width}
      height={height + labelHeight}
      viewBox={`0 0 ${width} ${height + labelHeight}`}
      role="img"
      aria-label={ariaText}
      className="select-none"
    >
      {Array.from({ length: safeDenominator }, (_, i) => {
        const isFilled = filled.has(i);
        const x = i * partWidth;
        const handleClick = () => {
          if (interactive && onPartClick) onPartClick(i);
        };
        return (
          <rect
            key={i}
            x={x}
            y={0}
            width={partWidth}
            height={height}
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
      })}
      {showFraction && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.min(28, height * 0.5)}
          fontWeight={700}
          fill="#FFFFFF"
          pointerEvents="none"
          style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
        >
          {label}
        </text>
      )}
      {showLabel && (
        <text
          x={width / 2}
          y={height + labelHeight / 2 + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={18}
          fontWeight={600}
          fill={borderColor}
          style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}
