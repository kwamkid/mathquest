// app/test/visuals/page.tsx
//
// Visual component gallery — used to verify rendering across edge cases.
// Each section grows as Phase 1 visuals are added.

'use client';

import { useState } from 'react';
import FractionBar from '@/components/visuals/FractionBar';
import FractionCircle from '@/components/visuals/FractionCircle';
import FractionAddition from '@/components/visuals/FractionAddition';
import NumberLine from '@/components/visuals/NumberLine';

export default function VisualsTestPage() {
  const [clickFilled, setClickFilled] = useState<number[]>([]);

  const togglePart = (i: number) => {
    setClickFilled((prev) =>
      prev.includes(i) ? prev.filter((p) => p !== i) : [...prev, i],
    );
  };

  // 1/2 through 11/12 — covers every fraction used in Week 24.
  const range: Array<{ n: number; d: number }> = [];
  for (let d = 2; d <= 12; d++) {
    for (let n = 1; n < d; n++) {
      range.push({ n, d });
    }
  }

  return (
    <div className="learn-bg min-h-screen p-8 text-white">
      <div className="mx-auto max-w-5xl space-y-12">
        <header>
          <h1 className="text-3xl font-bold">Visual Components Test</h1>
          <p className="mt-2 text-white/70">
            Phase 1 — verify FractionBar renders for every fraction 1/2 → 11/12.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">FractionBar — defaults</h2>
          <div className="space-y-3">
            <FractionBar numerator={2} denominator={5} showLabel />
            <FractionBar numerator={3} denominator={8} showLabel showFraction />
            <FractionBar numerator={0} denominator={4} showLabel />
            <FractionBar numerator={5} denominator={5} showLabel />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">FractionBar — interactive (click to toggle)</h2>
          <p className="text-sm text-white/70">
            Filled: {clickFilled.length}/8
          </p>
          <FractionBar
            numerator={clickFilled.length}
            denominator={8}
            filledIndices={clickFilled}
            interactive
            onPartClick={togglePart}
            showLabel
          />
          <button
            onClick={() => setClickFilled([])}
            className="rounded bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
          >
            Reset
          </button>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">FractionBar — coverage 1/2 → 11/12</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3">
            {range.map(({ n, d }) => (
              <div key={`${n}-${d}`} className="flex flex-col items-start">
                <span className="mb-1 font-mono text-sm">
                  {n}/{d}
                </span>
                <FractionBar numerator={n} denominator={d} width={200} height={40} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">FractionBar — custom colors</h2>
          <FractionBar
            numerator={4}
            denominator={6}
            filledColor="#4ECDC4"
            emptyColor="#E6FBF9"
            borderColor="#1A0033"
            showLabel
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">FractionCircle — defaults</h2>
          <div className="flex flex-wrap gap-6">
            <FractionCircle numerator={1} denominator={4} showLabel />
            <FractionCircle numerator={3} denominator={4} showLabel />
            <FractionCircle numerator={2} denominator={3} showLabel />
            <FractionCircle numerator={5} denominator={8} showLabel />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">FractionAddition — bar style</h2>
          <FractionAddition
            left={{ numerator: 1, denominator: 5 }}
            right={{ numerator: 2, denominator: 5 }}
            result={{ numerator: 3, denominator: 5 }}
          />
          <FractionAddition
            left={{ numerator: 3, denominator: 4 }}
            right={{ numerator: 2, denominator: 4 }}
            result={{ numerator: 5, denominator: 4 }}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">FractionAddition — circle style</h2>
          <FractionAddition
            left={{ numerator: 1, denominator: 4 }}
            right={{ numerator: 2, denominator: 4 }}
            result={{ numerator: 3, denominator: 4 }}
            style="circle"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">NumberLine</h2>
          <NumberLine from={0} to={10} step={1} highlight={[3, 7]} />
          <NumberLine from={0} to={1} step={0.2} highlight={[0.4, 0.8]} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">FractionCircle — coverage 1/2 → 11/12</h2>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
            {range.map(({ n, d }) => (
              <div key={`c-${n}-${d}`} className="flex flex-col items-center">
                <span className="mb-1 font-mono text-xs">
                  {n}/{d}
                </span>
                <FractionCircle numerator={n} denominator={d} size={120} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
