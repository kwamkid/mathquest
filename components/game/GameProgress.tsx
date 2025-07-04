'use client';

import { motion } from 'framer-motion';

interface GameProgressProps {
  current: number;
  total: number;
  score: number;
}

export default function GameProgress({ current, total, score }: GameProgressProps) {
  const progress = (current / total) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-gray-800">
            ข้อที่ {current}/{total}
          </span>
          <span className="text-xl text-green-600 font-medium">
            ✓ {score} ข้อ
          </span>
        </div>
        
        <motion.div
          className="text-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          ⏱️
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        {/* Progress Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}