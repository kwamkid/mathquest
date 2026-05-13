// components/lesson/steps/WorkedExampleStepView.tsx
//
// Reveals example sub-steps one at a time as the learner presses the global
// "ถัดไป" button. When all sub-steps are visible, the parent's Next button
// advances to the next lesson step.

'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { WorkedExampleStep } from '@/types/curriculum';
import ConceptBlockRenderer from '@/components/visuals/ConceptBlockRenderer';

interface Props {
  step: WorkedExampleStep;
  // Controlled by LessonPlayer: index of the next sub-step to reveal (0..steps.length).
  // When `revealed === steps.length` all sub-steps are shown.
  revealed: number;
}

export default function WorkedExampleStepView({ step, revealed }: Props) {
  // No internal "next" button — LessonPlayer drives reveal via its footer.
  useEffect(() => {
    /* state managed by parent; nothing to do here */
  }, [step.id]);

  return (
    <article className="space-y-5">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-white">{step.title}</h2>
        <div
          className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-center text-xl font-semibold text-amber-100"
          style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
        >
          {step.problemStatement}
        </div>
        {step.problemVisual && (
          <div className="flex justify-center">
            <ConceptBlockRenderer block={step.problemVisual} />
          </div>
        )}
      </header>

      <ol className="space-y-4">
        <AnimatePresence initial={false}>
          {step.steps.slice(0, revealed).map((sub, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="learn-card rounded-2xl p-4"
            >
              <p className="text-base font-semibold text-white">
                ขั้นที่ {i + 1}: {sub.narration}
              </p>
              {sub.visual && (
                <div className="mt-3 flex justify-center">
                  <ConceptBlockRenderer block={sub.visual} />
                </div>
              )}
              {sub.formula && (
                <div className="learn-formula mt-2">
                  {sub.formula}
                </div>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </article>
  );
}
