// app/(game)/summary/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User } from '@/types';
import { LEVEL_PROGRESSION } from '@/lib/game/config';
import { 
  Trophy, TrendingUp, TrendingDown, Star, Target, Clock, 
  Zap, Award, ChevronRight, RotateCcw, Home, Rocket, Pi
} from 'lucide-react';

interface GameSummaryData {
  score: number;
  totalQuestions: number;
  percentage: number;
  levelChange: 'increase' | 'decrease' | 'maintain';
  newLevel: number;
  oldLevel: number;
  expGained: number;
  isNewHighScore: boolean;
  oldHighScore: number;
  scoreDiff: number;
  timeSpent: number;
}

// Loading component
function SummaryLoading() {
  return (
    <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
      <div className="absolute inset-0 bg-metaverse-gradient opacity-30"></div>
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, -10, 0],
          scale: [1, 1.1, 0.9, 1.1, 1],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10"
      >
        <Pi className="w-24 h-24 text-metaverse-purple filter drop-shadow-[0_0_50px_rgba(147,51,234,0.7)]" />
      </motion.div>
    </div>
  );
}

// Main component wrapped with search params
function GameSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [summaryData, setSummaryData] = useState<GameSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      // Get user data
      const userData = await getCurrentUser();
      if (!userData) {
        router.push('/login');
        return;
      }
      setUser(userData);

      // Parse summary data from URL params
      const data: GameSummaryData = {
        score: parseInt(searchParams.get('score') || '0'),
        totalQuestions: parseInt(searchParams.get('total') || '0'),
        percentage: parseInt(searchParams.get('percentage') || '0'),
        levelChange: searchParams.get('levelChange') as 'increase' | 'decrease' | 'maintain' || 'maintain',
        newLevel: parseInt(searchParams.get('newLevel') || '0'),
        oldLevel: parseInt(searchParams.get('oldLevel') || '0'),
        expGained: parseInt(searchParams.get('exp') || '0'),
        isNewHighScore: searchParams.get('highScore') === 'true',
        oldHighScore: parseInt(searchParams.get('oldHighScore') || '0'),
        scoreDiff: parseInt(searchParams.get('scoreDiff') || '0'),
        timeSpent: parseInt(searchParams.get('time') || '0'),
      };

      setSummaryData(data);
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/play');
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับกลับไปเล่น level เดิม
  const playOldLevel = () => {
    if (!user || !summaryData) return;
    
    // เซ็ต localStorage เพื่อบอกให้หน้า play รู้ว่าต้องเล่น level เดิม
    localStorage.setItem('forceLevel', summaryData.oldLevel.toString());
    router.push('/play');
  };

  if (loading || !summaryData || !user) {
    return (
      <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-30"></div>
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 0.9, 1.1, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <Pi className="w-24 h-24 text-metaverse-purple filter drop-shadow-[0_0_50px_rgba(147,51,234,0.7)]" />
        </motion.div>
      </div>
    );
  }

  const getLevelChangeInfo = () => {
    switch (summaryData.levelChange) {
      case 'increase':
        return {
          icon: <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />,
          text: 'Level Up!',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50',
        };
      case 'decrease':
        return {
          icon: <TrendingDown className="w-6 h-6 md:w-8 md:h-8" />,
          text: 'Level Down',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50',
        };
      default:
        return {
          icon: <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />,
          text: 'Level คงเดิม',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/50',
        };
    }
  };

  const levelChangeInfo = getLevelChangeInfo();
  const minutes = Math.floor(summaryData.timeSpent / 60);
  const seconds = summaryData.timeSpent % 60;

  return (
    <div className="min-h-screen bg-metaverse-black py-4 md:py-8">
      <div className="absolute inset-0 bg-metaverse-gradient opacity-20 fixed"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 fixed"></div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 md:mb-8"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">สรุปผลการเล่น</h1>
          <p className="text-sm md:text-base text-white/60">Level {summaryData.oldLevel}</p>
        </motion.div>

        {/* Main Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-dark rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 mb-4 md:mb-6 border border-metaverse-purple/30"
        >
          {/* Score Display */}
          <div className="text-center mb-4 md:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="inline-block"
            >
              <div className="text-5xl md:text-8xl mb-2 md:mb-4 filter drop-shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                {summaryData.percentage >= 85 ? '🏆' : 
                 summaryData.percentage >= 50 ? '😊' : '😢'}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-red mb-1 md:mb-2">
                {summaryData.score}/{summaryData.totalQuestions}
              </div>
              <div className="text-2xl md:text-3xl text-white/80">
                {summaryData.percentage}%
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-metaverse-purple/20"
            >
              <Target className="w-4 h-4 md:w-6 md:h-6 text-metaverse-purple mx-auto mb-1 md:mb-2" />
              <p className="text-xl md:text-2xl font-bold text-white">{summaryData.score}</p>
              <p className="text-xs md:text-sm text-white/60">ตอบถูก</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-metaverse-purple/20"
            >
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-metaverse-pink mx-auto mb-1 md:mb-2" />
              <p className="text-xl md:text-2xl font-bold text-white">
                {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`}
              </p>
              <p className="text-xs md:text-sm text-white/60">เวลา</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-metaverse-purple/20"
            >
              <Zap className="w-4 h-4 md:w-6 md:h-6 text-yellow-400 mx-auto mb-1 md:mb-2" />
              <p className="text-xl md:text-2xl font-bold text-white">+{summaryData.expGained}</p>
              <p className="text-xs md:text-sm text-white/60">EXP</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-metaverse-purple/20"
            >
              <Star className="w-4 h-4 md:w-6 md:h-6 text-orange-400 mx-auto mb-1 md:mb-2" />
              <p className="text-xl md:text-2xl font-bold text-white">
                {summaryData.scoreDiff > 0 ? `+${summaryData.scoreDiff}` : '0'}
              </p>
              <p className="text-xs md:text-sm text-white/60">คะแนนรวม</p>
            </motion.div>
          </div>

          {/* High Score Info */}
          {summaryData.isNewHighScore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="glass bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 md:mb-6"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-base md:text-lg font-bold text-yellow-400">New High Score!</p>
                  <p className="text-xs md:text-sm text-white/70">
                    คะแนนเดิม: {summaryData.oldHighScore} → คะแนนใหม่: {summaryData.score}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Level Change */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className={`glass ${levelChangeInfo.bgColor} border ${levelChangeInfo.borderColor} rounded-lg md:rounded-xl p-3 md:p-4`}
          >
            <div className="flex items-center justify-between flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className={levelChangeInfo.color}>
                  {levelChangeInfo.icon}
                </div>
                <div>
                  <p className={`text-base md:text-lg font-bold ${levelChangeInfo.color}`}>
                    {levelChangeInfo.text}
                  </p>
                  <p className="text-xs md:text-sm text-white/70">
                    Level {summaryData.oldLevel} → Level {summaryData.newLevel}
                  </p>
                </div>
              </div>
              <div className="text-xs md:text-sm text-white/50 text-center sm:text-right">
                <p>เกณฑ์: &gt;{LEVEL_PROGRESSION.INCREASE_THRESHOLD}% เพิ่มระดับ</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="space-y-4 md:space-y-6"
        >
          {/* Primary Button - Play Next/Again */}
          <div className="flex justify-center">
            {summaryData.levelChange === 'increase' && summaryData.newLevel <= 100 ? (
              <motion.button
                onClick={() => router.push('/play')}
                className="px-8 py-3 md:px-12 md:py-5 metaverse-button text-white font-bold text-base md:text-xl rounded-full shadow-lg hover:shadow-xl flex items-center gap-2 md:gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="w-5 h-5 md:w-6 md:h-6" />
                <span>เล่น Level {summaryData.newLevel}</span>
              </motion.button>
            ) : (
              <motion.button
                onClick={() => router.push('/play')}
                className="px-8 py-3 md:px-12 md:py-5 metaverse-button text-white font-bold text-base md:text-xl rounded-full shadow-lg hover:shadow-xl flex items-center gap-2 md:gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
                <span>เล่นอีกครั้ง</span>
              </motion.button>
            )}
          </div>

          {/* Add extra spacing */}
          <div className="h-2 md:h-4"></div>

          {/* Secondary Buttons */}
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {/* Play Again Button (only show if level increased) */}
            {summaryData.levelChange === 'increase' && summaryData.newLevel <= 100 && (
              <motion.button
                onClick={playOldLevel}
                className="px-4 py-2 md:px-6 md:py-3 glass border border-metaverse-purple/50 text-white/80 font-medium text-sm md:text-lg rounded-full shadow-md hover:bg-white/10 flex items-center gap-1 md:gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                เล่น Level เดิม
              </motion.button>
            )}

            {/* View Ranking Button */}
            <motion.button
              onClick={() => router.push('/ranking')}
              className="px-4 py-2 md:px-6 md:py-3 glass border border-metaverse-purple/50 text-white/80 font-medium text-sm md:text-lg rounded-full shadow-md hover:bg-white/10 flex items-center gap-1 md:gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Trophy className="w-4 h-4 md:w-5 md:h-5" />
              ดูอันดับ
            </motion.button>

            {/* Home Button */}
            <motion.button
              onClick={() => router.push('/play')}
              className="px-4 py-2 md:px-6 md:py-3 glass border border-metaverse-purple/50 text-white/80 font-medium text-sm md:text-lg rounded-full shadow-md hover:bg-white/10 flex items-center gap-1 md:gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Home className="w-4 h-4 md:w-5 md:h-5" />
              หน้าหลัก
            </motion.button>
          </div>
        </motion.div>

        {/* Achievements (Optional) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-6 md:mt-8 text-center"
        >
          {summaryData.percentage === 100 && (
            <div className="inline-flex items-center gap-2 glass px-4 py-2 md:px-6 md:py-3 rounded-full border border-yellow-500/50">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm md:text-base">Perfect Score! 💯</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Main component with Suspense
export default function GameSummaryPage() {
  return (
    <Suspense fallback={<SummaryLoading />}>
      <GameSummaryContent />
    </Suspense>
  );
}