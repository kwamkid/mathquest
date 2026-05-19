// components/lesson/LessonHeader.tsx
'use client';

import { X } from 'lucide-react';
import LessonProgress from './LessonProgress';

interface Props {
  lessonTitle: string;
  stepTitle?: string;
  currentStep: number;
  totalSteps: number;
  onClose: () => void;
}

export default function LessonHeader({
  lessonTitle,
  stepTitle,
  currentStep,
  totalSteps,
  onClose,
}: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0a0a]/80 px-4 pb-3 pt-5 backdrop-blur-md sm:px-6 sm:pt-7">
      {/* Close button pinned to the actual screen edge (outside the
        * centred max-w-3xl column) so it lands top-right on every screen. */}
      <button
        onClick={onClose}
        aria-label="ออกจากบทเรียน"
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white sm:right-4 sm:top-4"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="mx-auto max-w-3xl pr-12 sm:pr-14">
        <h1 className="truncate text-base font-bold text-white sm:text-lg">
          {lessonTitle}
        </h1>
        {stepTitle && (
          <p className="truncate text-sm text-white/60">{stepTitle}</p>
        )}
      </div>
      <div className="mx-auto mt-3 max-w-3xl">
        <LessonProgress current={currentStep} total={totalSteps} />
      </div>
    </header>
  );
}
