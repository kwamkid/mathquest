'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';

interface GameProgressProps {
  current: number;
  total: number;
  score: number;
}

export default function GameProgress({ current, total, score }: GameProgressProps) {
  const progress = (current / total) * 100;

  return (
    <div className="glass-dark rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-metaverse-purple/30">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-lg md:text-2xl font-bold text-white">
            ข้อที่ {current}/{total}
          </span>
          <div className="flex items-center gap-1 md:gap-2 glass px-2 md:px-3 py-1 rounded-full">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
            <span className="text-base md:text-xl text-green-400 font-medium">
              {score}
            </span>
          </div>
        </div>
        
        <motion.div
          className="flex items-center gap-1 md:gap-2 text-metaverse-pink"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Zap className="w-5 h-5 md:w-6 md:h-6" />
          <span className="font-bold text-sm md:text-base">LIVE</span>
        </motion.div>
      </div>

      {/* Progress Bar - ปรับให้บางลงสำหรับ mobile */}
      <div className="relative h-4 md:h-6 bg-white/10 rounded-full overflow-hidden backdrop-blur">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        </div>
        
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-metaverse-purple to-metaverse-red shadow-lg"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
        
        {/* Progress circles - แสดงน้อยลงบน mobile */}
        <div className="absolute inset-0 flex items-center justify-between px-1 md:px-2">
          {[...Array(Math.min(5, total))].map((_, i) => {
            const position = ((i + 1) / Math.min(5, total)) * 100;
            const isPassed = progress >= position;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: isPassed ? 1 : 0.8 }}
                transition={{ delay: i * 0.05 }}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
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
          <span className="text-xs md:text-sm font-bold text-white drop-shadow-lg">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Motivational Text - ซ่อนบน mobile เพื่อประหยัดพื้นที่ */}
      <motion.p
        key={current}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-white/60 text-xs md:text-sm mt-1 md:mt-2 hidden md:block"
      >
        {progress < 30 && "เริ่มต้นได้ดี! 💪"}
        {progress >= 30 && progress < 60 && "ทำได้ดีมาก! 🌟"}
        {progress >= 60 && progress < 90 && "ใกล้สำเร็จแล้ว! 🚀"}
        {progress >= 90 && "อีกนิดเดียว! 🏆"}
      </motion.p>
    </div>
  );
}