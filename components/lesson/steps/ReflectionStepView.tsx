// components/lesson/steps/ReflectionStepView.tsx
'use client';

import type { ReflectionStep } from '@/types/curriculum';
import { Sparkles } from 'lucide-react';

interface Props {
  step: ReflectionStep;
}

export default function ReflectionStepView({ step }: Props) {
  return (
    <article className="space-y-5">
      <h2 className="text-2xl font-bold text-white">{step.title}</h2>
      <ul className="space-y-3">
        {step.keyTakeaways.map((t, i) => (
          <li key={i} className="learn-card flex gap-3 rounded-2xl p-4">
            <Sparkles className="h-5 w-5 shrink-0 text-pink-400" />
            <p className="text-base text-white">{t}</p>
          </li>
        ))}
      </ul>
      {step.nextUp && (
        <div className="learn-explanation">
          <p className="text-sm font-bold">วันต่อไป</p>
          <p className="text-base">{step.nextUp}</p>
        </div>
      )}
    </article>
  );
}
