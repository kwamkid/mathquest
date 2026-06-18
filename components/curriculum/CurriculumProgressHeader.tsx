// components/curriculum/CurriculumProgressHeader.tsx
//
// Shared "progress + continue" header block. Shows curriculum name, overall
// percent + bar, and a compact "เรียนต่อ" CTA — laid out on a SINGLE row at
// every width (progress card | continue pill) so it reads as one tight strip,
// even on phones. When there's nothing to resume the card spans full width.
//
// Used by CurriculumTimeline (the /learn + /life-math landings). Kept separate
// so the progress strip stays consistent wherever it appears.

'use client';

import { PlayCircle } from 'lucide-react';

interface Props {
  // Curriculum name shown as the card title (e.g. "Life Math · …").
  heading: string;
  completedCount: number;
  totalLessons: number;
  // Show the continue CTA. Hidden when there's nothing to resume.
  showContinue: boolean;
  onContinue?: () => void;
}

export default function CurriculumProgressHeader({
  heading,
  completedCount,
  totalLessons,
  showContinue,
  onContinue,
}: Props) {
  const pct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const continueCta = showContinue && onContinue && (
    <button
      onClick={onContinue}
      aria-label="เรียนต่อ"
      className="learn-accent-pill flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl px-4 py-3 shadow-lg shadow-pink-500/20 transition hover:brightness-110 active:scale-[0.99]"
    >
      <PlayCircle className="h-9 w-9 shrink-0" />
      <span className="text-sm font-bold">เรียนต่อ</span>
    </button>
  );

  // Left card, simplified: title on top, then the % and bar on one tight row
  // so it reads at a glance and leaves the continue button room beside it.
  const progressCard = (
    <div className="learn-card rounded-2xl p-4">
      <h2 className="truncate text-base font-bold text-white sm:text-lg">
        {heading}
      </h2>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-metaverse-purple to-metaverse-pink"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-bold text-white">{pct}%</span>
      </div>
      <p className="mt-1 text-xs text-white/55">
        {completedCount}/{totalLessons} บทเรียน
      </p>
    </div>
  );

  // Single row at every width: wide progress card + narrow continue button.
  // When there's nothing to continue, the card spans the full width alone.
  if (!continueCta) return progressCard;

  return (
    <div className="grid grid-cols-[1fr_auto] items-stretch gap-3">
      {progressCard}
      {continueCta}
    </div>
  );
}
