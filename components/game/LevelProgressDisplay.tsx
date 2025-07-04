// components/game/LevelProgressDisplay.tsx
'use client';

import { motion } from 'framer-motion';
import { GRADE_CONFIGS } from '@/lib/game/config';
import { TrendingUp, Lock, CheckCircle, Star } from 'lucide-react';

interface LevelProgressDisplayProps {
  grade: string;
  currentLevel: number;
}

export default function LevelProgressDisplay({ grade, currentLevel }: LevelProgressDisplayProps) {
  const gradeConfigs = GRADE_CONFIGS[grade];
  
  if (!gradeConfigs) return null;
  
  return (
    <div className="glass-dark rounded-2xl p-6 border border-metaverse-purple/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-metaverse-purple" />
        ความก้าวหน้าของคุณ
      </h3>
      
      <div className="space-y-3">
        {gradeConfigs.map((config, index) => {
          const isCurrentRange = currentLevel >= config.minLevel && currentLevel <= config.maxLevel;
          const isCompleted = currentLevel > config.maxLevel;
          const isLocked = currentLevel < config.minLevel;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border transition-all ${
                isCurrentRange 
                  ? 'bg-gradient-to-r from-metaverse-purple/20 to-metaverse-pink/20 border-metaverse-purple' 
                  : isCompleted
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-white/30" />
                    ) : (
                      <Star className="w-5 h-5 text-metaverse-purple" />
                    )}
                    
                    <h4 className={`font-semibold ${
                      isCurrentRange ? 'text-white' : isCompleted ? 'text-green-400' : 'text-white/50'
                    }`}>
                      Level {config.minLevel}-{config.maxLevel}
                    </h4>
                  </div>
                  
                  <p className={`text-sm ${
                    isCurrentRange ? 'text-white/80' : 'text-white/50'
                  }`}>
                    {config.description}
                  </p>
                </div>
                
                {/* Progress indicator for current range */}
                {isCurrentRange && (
                  <div className="ml-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                        {currentLevel}
                      </p>
                      <p className="text-xs text-white/60">ระดับปัจจุบัน</p>
                    </div>
                  </div>
                )}
                
                {/* Completion badge */}
                {isCompleted && (
                  <div className="ml-4 text-green-400">
                    <span className="text-2xl">✓</span>
                  </div>
                )}
              </div>
              
              {/* Progress bar for current range */}
              {isCurrentRange && (
                <div className="mt-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-metaverse-purple to-metaverse-pink"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${((currentLevel - config.minLevel) / (config.maxLevel - config.minLevel + 1)) * 100}%` 
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1 text-right">
                    {Math.round(((currentLevel - config.minLevel) / (config.maxLevel - config.minLevel + 1)) * 100)}% ของช่วงนี้
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Overall progress */}
      <div className="mt-6 pt-6 border-t border-metaverse-purple/20">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">ความก้าวหน้ารวม</span>
          <span className="text-white font-semibold">{currentLevel}/100</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-metaverse-purple via-metaverse-pink to-metaverse-red"
            initial={{ width: 0 }}
            animate={{ width: `${currentLevel}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}