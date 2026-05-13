// components/lesson/LessonFooter.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  onPrev?: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  showPrev?: boolean;
}

export default function LessonFooter({
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  nextLabel = 'ถัดไป',
  showPrev = true,
}: Props) {
  return (
    <footer className="sticky bottom-0 border-t border-white/10 bg-[#0a0a0a]/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        {showPrev ? (
          <button
            onClick={onPrev}
            disabled={prevDisabled}
            className="flex h-12 items-center gap-1 rounded-2xl px-4 text-base font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
            ย้อนกลับ
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="learn-accent-pill flex h-12 items-center gap-1 rounded-2xl px-6 text-base font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {nextLabel}
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </footer>
  );
}
