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
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0a0a]/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-3xl items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-white sm:text-lg">
            {lessonTitle}
          </h1>
          {stepTitle && (
            <p className="truncate text-sm text-white/60">{stepTitle}</p>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="ออกจากบทเรียน"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="mx-auto mt-2 max-w-3xl">
        <LessonProgress current={currentStep} total={totalSteps} />
      </div>
    </header>
  );
}
