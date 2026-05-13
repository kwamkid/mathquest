// components/lesson/LessonComplete.tsx
'use client';

import { motion } from 'framer-motion';
import { Star, Trophy } from 'lucide-react';

interface Props {
  lessonTitle: string;
  starsAwarded: number;
  badge?: string;
  onBackToDay: () => void;
}

export default function LessonComplete({
  lessonTitle,
  starsAwarded,
  badge,
  onBackToDay,
}: Props) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
      >
        <Trophy
          className="h-24 w-24 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]"
          strokeWidth={1.5}
        />
      </motion.div>
      <h2 className="mt-4 text-3xl font-bold text-white">ยอดเยี่ยม!</h2>
      <p className="mt-1 text-base text-white/70">{lessonTitle}</p>

      {starsAwarded > 0 && (
        <div className="mt-6 flex items-center gap-1">
          {Array.from({ length: starsAwarded }, (_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, type: 'spring' }}
            >
              <Star className="h-8 w-8 fill-amber-300 text-amber-300" />
            </motion.span>
          ))}
        </div>
      )}

      {badge && (
        <p className="mt-3 text-base font-semibold text-amber-300">🏅 ได้ตรา “{badge}”</p>
      )}

      <button onClick={onBackToDay} className="learn-btn-primary mt-8 w-auto px-8">
        กลับไปเรียนบทถัดไป
      </button>
    </div>
  );
}
