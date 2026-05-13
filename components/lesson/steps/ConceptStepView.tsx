// components/lesson/steps/ConceptStepView.tsx
'use client';

import type { ConceptStep } from '@/types/curriculum';
import ConceptBlockRenderer from '@/components/visuals/ConceptBlockRenderer';

interface Props {
  step: ConceptStep;
}

export default function ConceptStepView({ step }: Props) {
  return (
    <article className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{step.title}</h2>
      <div className="space-y-5">
        {step.blocks.map((block, i) => (
          <ConceptBlockRenderer key={i} block={block} />
        ))}
      </div>
    </article>
  );
}
