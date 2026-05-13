// components/lesson/LessonPlayer.tsx
//
// Top-level controller: walks the learner through Lesson.steps[],
// tracks stars/mistakes, and reports a final result to the parent route.
// Step-specific behavior (hints, reveal, scoring) lives inside each StepView.

'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Lesson, LessonStep, Question } from '@/types/curriculum';
import { useSound } from '@/lib/game/soundManager';
import LessonHeader from './LessonHeader';
import LessonFooter from './LessonFooter';
import LessonComplete from './LessonComplete';
import ConceptStepView from './steps/ConceptStepView';
import WorkedExampleStepView from './steps/WorkedExampleStepView';
import GuidedPracticeStepView from './steps/GuidedPracticeStepView';
import IndependentPracticeStepView from './steps/IndependentPracticeStepView';
import MiniQuizStepView from './steps/MiniQuizStepView';
import ReflectionStepView from './steps/ReflectionStepView';
import type { MiniQuizResult } from './steps/MiniQuizStepView';

export interface LessonRunMistake {
  questionId: string;
  topic: string;        // resolved by parent (passed via prop)
  userAnswer: string;
  correctAnswer: string;
}

export interface LessonRunResult {
  lessonId: string;
  starsAwarded: number;
  badge?: string;
  durationSeconds: number;
  passed: boolean;
  mistakes: LessonRunMistake[];
}

interface Props {
  lesson: Lesson;
  topic: string;                          // lesson topic tag (for mistake patterns)
  onClose: () => void;
  onLessonComplete: (result: LessonRunResult) => void;
  // Resume mid-lesson: parent passes the saved step index. Clamped to valid range.
  startStepIndex?: number;
  // Fired every time the learner moves to a new step (used to persist position).
  onStepChange?: (stepIndex: number) => void;
}

// Extracts the canonical "correct" answer for a question (for mistake records).
const stringifyCorrectAnswer = (q: Question): string => {
  if (q.format === 'text-input') return String(q.expectedAnswer);
  if (q.format === 'mcq-text') return q.correctChoiceId;
  if (q.format === 'mcq-visual') return q.correctChoiceId;
  if (q.format === 'interactive' && q.variant === 'click-fraction') {
    return `${q.expectedFilled}/${q.totalParts}`;
  }
  return '';
};

export default function LessonPlayer({
  lesson,
  topic,
  onClose,
  onLessonComplete,
  startStepIndex,
  onStepChange,
}: Props) {
  const { playSound } = useSound();
  // Start at the saved position, clamped within the lesson. The last step
  // of a lesson is often the reward / reflection — if the learner had already
  // reached the very end on a previous run, resume one step before so they
  // can still complete the lesson normally.
  const initialStep = (() => {
    if (typeof startStepIndex !== 'number') return 0;
    const max = Math.max(0, lesson.steps.length - 1);
    return Math.max(0, Math.min(startStepIndex, max));
  })();
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [canAdvance, setCanAdvance] = useState(true);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState<string | undefined>();
  const [mistakes, setMistakes] = useState<LessonRunMistake[]>([]);
  const [finished, setFinished] = useState(false);
  const [allCorrectIndependent, setAllCorrectIndependent] = useState(true);
  // For worked-example: how many sub-steps are currently revealed.
  const [revealed, setRevealed] = useState(0);
  const startedAt = useMemo(() => Date.now(), [lesson.id]);

  const totalSteps = lesson.steps.length;
  const step: LessonStep | undefined = lesson.steps[stepIndex];

  // Some steps require interaction before "Next" enables.
  // Reset gating when the step changes.
  const onEnterStep = useCallback((s: LessonStep | undefined) => {
    if (!s) return;
    setRevealed(0);
    switch (s.type) {
      case 'concept':
      case 'reflection':
        setCanAdvance(true);
        break;
      case 'worked-example':
        setCanAdvance(true); // Next reveals first sub-step, then advances on last
        break;
      case 'guided-practice':
        setCanAdvance(false); // unlocks on correct
        break;
      case 'independent-practice':
      case 'mini-quiz':
        setCanAdvance(false); // unlocks on completion
        break;
    }
  }, []);

  // initialise gating once per step
  useMemo(() => onEnterStep(step), [step?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const recordMistake = useCallback(
    (q: Question, userAnswer: string) => {
      setMistakes((prev) => [
        ...prev,
        {
          questionId: q.id,
          topic,
          userAnswer,
          correctAnswer: stringifyCorrectAnswer(q),
        },
      ]);
    },
    [topic],
  );

  const goNext = () => {
    // For worked-example: reveal next sub-step before advancing the lesson step.
    if (step?.type === 'worked-example' && revealed < step.steps.length) {
      setRevealed((r) => r + 1);
      return;
    }
    if (stepIndex < totalSteps - 1) {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      onStepChange?.(nextIndex);
    } else {
      // Final step — wrap up
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
      // baseline stars: 3 if no mini-quiz fired its own award, else use existing
      const finalStars = stars > 0 ? stars : allCorrectIndependent && mistakes.length === 0 ? 3 : 1;
      setStars(finalStars);
      setFinished(true);
      playSound('levelUp');
      onLessonComplete({
        lessonId: lesson.id,
        starsAwarded: finalStars,
        badge,
        durationSeconds,
        passed: true,
        mistakes,
      });
    }
  };

  const goPrev = () => {
    if (stepIndex > 0) {
      const prevIndex = stepIndex - 1;
      setStepIndex(prevIndex);
      onStepChange?.(prevIndex);
    }
  };

  if (finished) {
    return (
      <LessonComplete
        lessonTitle={lesson.title}
        starsAwarded={stars}
        badge={badge}
        onBackToDay={onClose}
      />
    );
  }

  if (!step) return null;

  let stepView: React.ReactNode = null;
  switch (step.type) {
    case 'concept':
      stepView = <ConceptStepView step={step} />;
      break;
    case 'worked-example':
      stepView = <WorkedExampleStepView step={step} revealed={revealed} />;
      break;
    case 'guided-practice':
      stepView = (
        <GuidedPracticeStepView
          step={step}
          onCorrect={() => setCanAdvance(true)}
        />
      );
      break;
    case 'independent-practice':
      stepView = (
        <IndependentPracticeStepView
          step={step}
          onComplete={(r) => {
            setCanAdvance(true);
            if (r.correct < r.total) setAllCorrectIndependent(false);
          }}
          onMistake={recordMistake}
        />
      );
      break;
    case 'mini-quiz':
      stepView = (
        <MiniQuizStepView
          step={step}
          onComplete={(r: MiniQuizResult) => {
            setCanAdvance(true);
            setStars((s) => Math.max(s, r.stars));
            if (r.badge) setBadge(r.badge);
            if (r.correct < r.total) setAllCorrectIndependent(false);
          }}
          onMistake={recordMistake}
        />
      );
      break;
    case 'reflection':
      stepView = <ReflectionStepView step={step} />;
      break;
  }

  const isLast = stepIndex === totalSteps - 1;
  // Worked-example Next label cycles through sub-steps before advancing.
  const isWorkedExampleRevealing =
    step?.type === 'worked-example' && revealed < step.steps.length;
  const nextLabel = isWorkedExampleRevealing
    ? `ดูขั้นที่ ${revealed + 1}`
    : isLast
      ? 'จบบทเรียน'
      : 'ถัดไป';

  return (
    <div className="learn-bg flex min-h-screen flex-col">
      <LessonHeader
        lessonTitle={lesson.title}
        stepTitle={step.title}
        currentStep={stepIndex}
        totalSteps={totalSteps}
        onClose={onClose}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {stepView}
          </motion.div>
        </AnimatePresence>
      </main>
      <LessonFooter
        onPrev={goPrev}
        onNext={goNext}
        prevDisabled={stepIndex === 0}
        nextDisabled={!canAdvance}
        nextLabel={nextLabel}
      />
    </div>
  );
}
