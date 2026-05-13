// components/lesson/LessonProgress.tsx
'use client';

interface Props {
  current: number;     // 0-indexed
  total: number;
}

export default function LessonProgress({ current, total }: Props) {
  const pct = total > 0 ? Math.min(100, ((current + 1) / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm font-medium text-white/80">
        <span>ขั้นที่ {Math.min(current + 1, total)} / {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="learn-progress-track mt-1 h-2 w-full overflow-hidden rounded-full">
        <div
          className="learn-progress-fill h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
