'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';
import { memo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface GameProgressProps {
  current: number;
  total: number;
  score: number;
}

// Local bilingual UI strings for this component
const STR = {
  th: {
    questionOf: (current: number, total: number) => `ข้อที่ ${current}/${total}`,
    correctCount: (score: number) => `${score} ข้อ`,
    cheer1: 'เริ่มต้นได้ดี! 💪',
    cheer2: 'ทำได้ดีมาก! 🌟',
    cheer3: 'ใกล้สำเร็จแล้ว! 🚀',
    cheer4: 'อีกนิดเดียว! 🏆',
  },
  en: {
    questionOf: (current: number, total: number) => `Question ${current}/${total}`,
    correctCount: (score: number) => `${score} correct`,
    cheer1: 'Great start! 💪',
    cheer2: 'Doing great! 🌟',
    cheer3: 'Almost there! 🚀',
    cheer4: 'Just a little more! 🏆',
  },
} as const;

function GameProgress({ current, total, score }: GameProgressProps) {
  const progress = (current / total) * 100;
  const { lang } = useLanguage();
  const L = STR[lang];

  return (
    <div className="glass-dark rounded-2xl shadow-lg p-6 mb-6 border border-metaverse-purple/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-white">
            {L.questionOf(current, total)}
          </span>
          <div className="flex items-center gap-2 glass px-3 py-1 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-xl text-green-400 font-medium">
              {L.correctCount(score)}
            </span>
          </div>
        </div>
        
        {/* ✅ ลด animation complexity */}
        <div className="flex items-center gap-2 text-metaverse-pink">
          <Zap className="w-6 h-6" />
          <span className="font-bold">LIVE</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-6 bg-white/10 rounded-full overflow-hidden backdrop-blur">
        {/* ✅ เอา background pattern ออก - ประหยัด CPU */}
        
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-metaverse-purple to-metaverse-red shadow-lg"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* ✅ ลด shimmer effect - ใช้ CSS แทน */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        </motion.div>
        
        {/* ✅ ลด circles จาก 10 → 5 ตัว */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          {[...Array(Math.min(5, total))].map((_, i) => {
            const position = ((i + 1) / Math.min(5, total)) * 100;
            const isPassed = progress >= position;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: isPassed ? 1 : 0.8 }}
                transition={{ delay: i * 0.05 }}
                className={`w-4 h-4 rounded-full ${
                  isPassed 
                    ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                    : 'bg-white/20'
                }`}
              />
            );
          })}
        </div>
        
        {/* Progress Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow-lg">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Motivational Text - ✅ ไม่มี animation */}
      <p className="text-center text-white/60 text-sm mt-2">
        {progress < 30 && L.cheer1}
        {progress >= 30 && progress < 60 && L.cheer2}
        {progress >= 60 && progress < 90 && L.cheer3}
        {progress >= 90 && L.cheer4}
      </p>
    </div>
  );
}

// ✅ เพิ่ม React.memo เพื่อป้องกัน re-render
export default memo(GameProgress);