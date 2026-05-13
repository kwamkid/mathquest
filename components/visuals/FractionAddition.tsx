// components/visuals/FractionAddition.tsx
//
// Combined visual: showsLeft + Right = Result using FractionBar or FractionCircle.
// Used in WorkedExampleStep visuals during Week 24 lessons.

'use client';

import FractionBar from './FractionBar';
import FractionCircle from './FractionCircle';

export interface FractionAdditionProps {
  left: { numerator: number; denominator: number };
  right: { numerator: number; denominator: number };
  result: { numerator: number; denominator: number };
  style?: 'bar' | 'circle';
  size?: number;             // bar width OR circle diameter
  showLabels?: boolean;
}

export default function FractionAddition({
  left,
  right,
  result,
  style = 'bar',
  size,
  showLabels = true,
}: FractionAdditionProps) {
  const Op = ({ symbol }: { symbol: '+' | '=' }) => (
    <span
      className="select-none text-3xl font-bold text-white/80"
      style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
      aria-hidden="true"
    >
      {symbol}
    </span>
  );

  if (style === 'circle') {
    const diameter = size ?? 140;
    return (
      <div
        className="flex flex-wrap items-center justify-center gap-4"
        role="group"
        aria-label={`${left.numerator}/${left.denominator} บวก ${right.numerator}/${right.denominator} เท่ากับ ${result.numerator}/${result.denominator}`}
      >
        <FractionCircle {...left} size={diameter} showLabel={showLabels} />
        <Op symbol="+" />
        <FractionCircle {...right} size={diameter} showLabel={showLabels} />
        <Op symbol="=" />
        <FractionCircle {...result} size={diameter} showLabel={showLabels} />
      </div>
    );
  }

  const barWidth = size ?? 240;
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-4"
      role="group"
      aria-label={`${left.numerator}/${left.denominator} บวก ${right.numerator}/${right.denominator} เท่ากับ ${result.numerator}/${result.denominator}`}
    >
      <FractionBar {...left} width={barWidth} height={56} showLabel={showLabels} />
      <Op symbol="+" />
      <FractionBar {...right} width={barWidth} height={56} showLabel={showLabels} />
      <Op symbol="=" />
      <FractionBar {...result} width={barWidth} height={56} showLabel={showLabels} />
    </div>
  );
}
