// app/(game)/highscores/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LevelScore } from '@/types';
import { ArrowLeft, Trophy, Star, TrendingUp, Calendar, Target, Zap } from 'lucide-react';
import { getQuestionCount, getLevelConfig } from '@/lib/game/config';

interface ScoreWithDescription extends LevelScore {
  description: string;
}

export default function HighScoresPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [scores, setScores] = useState<ScoreWithDescription[]>([]);

  useEffect(() => {
    if (user) {
      processScores(user.levelScores, user.grade);
    }
  }, [user]);

  const processScores = (levelScores: Record<string, LevelScore> | undefined, currentGrade: string) => {
    if (!levelScores) {
      setScores([]);
      return;
    }

    // Get scores and add descriptions
    const processedScores: ScoreWithDescription[] = Object.entries(levelScores)
      .map(([levelKey, score]) => {
        const level = parseInt(levelKey);
        // Get the correct description for this level and grade
        const config = getLevelConfig(currentGrade, level);
        
        return {
          ...score,
          level,
          description: config?.description || `Level ${level}`
        };
      })
      .sort((a, b) => b.level - a.level); // เรียงจากมากไปน้อย (ล่าสุดขึ้นก่อน)
    
    setScores(processedScores);
  };

  const getGradeDisplayName = (grade: string): string => {
    const gradeMap: Record<string, string> = {
      K1: 'อนุบาล 1', K2: 'อนุบาล 2', K3: 'อนุบาล 3',
      P1: 'ประถม 1', P2: 'ประถม 2', P3: 'ประถม 3',
      P4: 'ประถม 4', P5: 'ประถม 5', P6: 'ประถม 6',
      M1: 'มัธยม 1', M2: 'มัธยม 2', M3: 'มัธยม 3',
      M4: 'มัธยม 4', M5: 'มัธยม 5', M6: 'มัธยม 6',
    };
    return gradeMap[grade] || grade;
  };

  const calculateTotalHighScore = (): number => {
    return scores.reduce((sum, score) => sum + score.highScore, 0);
  };

  const calculateAveragePercentage = (): string => {
    if (scores.length === 0) return '0%';
    const totalScore = calculateTotalHighScore();
    const totalPossible = scores.length * getQuestionCount(user?.grade || 'P1');
    return Math.round((totalScore / totalPossible) * 100) + '%';
  };

  if (!user) return null;

  const questionsPerLevel = getQuestionCount(user.grade);

  return (
    <div className="min-h-screen max-h-screen bg-metaverse-black flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-4 max-w-6xl mx-auto w-full">
        {/* Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-3"
        >
          <button
            onClick={() => router.push('/play')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">กลับ</span>
          </button>
          
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
            คะแนนสูงสุดของฉัน
          </h1>
          
          <div className="w-12 sm:w-20" />
        </motion.div>

        {/* Current Grade & Level Highlight - Compact */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-dark rounded-2xl p-4 mb-4 border-2 border-metaverse-purple bg-gradient-to-br from-metaverse-purple/10 to-metaverse-pink/10"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-metaverse-purple to-metaverse-pink rounded-xl">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white mb-0.5">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                    {getGradeDisplayName(user.grade)}
                  </span>
                </h2>
                <p className="text-sm md:text-base text-white/80">
                  กำลังเล่น <span className="font-bold text-metaverse-purple">Level {user.level}</span>
                  {user.levelScores && user.levelScores[user.level.toString()] && (
                    <span className="text-white/60 hidden sm:inline">
                      {' '}• คะแนนสูงสุด: {user.levelScores[user.level.toString()].highScore}/{questionsPerLevel}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {user.levelScores && user.levelScores[user.level.toString()] && (
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                  {Math.round((user.levelScores[user.level.toString()].highScore / questionsPerLevel) * 100)}%
                </p>
                <p className="text-xs text-white/60">ความสำเร็จ</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Stats - Compact Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4"
        >
          <div className="glass-dark rounded-lg p-3 border border-metaverse-purple/30 text-center">
            <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg md:text-2xl font-bold text-white">
              {scores.length}
            </p>
            <p className="text-xs text-white/60">Level ที่เล่น</p>
          </div>
          
          <div className="glass-dark rounded-lg p-3 border border-metaverse-purple/30 text-center">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-metaverse-purple mx-auto mb-1" />
            <p className="text-lg md:text-2xl font-bold text-white">
              {calculateTotalHighScore()}
            </p>
            <p className="text-xs text-white/60">คะแนนรวม</p>
          </div>
          
          <div className="glass-dark rounded-lg p-3 border border-metaverse-purple/30 text-center">
            <Target className="w-6 h-6 md:w-8 md:h-8 text-metaverse-pink mx-auto mb-1" />
            <p className="text-lg md:text-2xl font-bold text-white">
              {calculateAveragePercentage()}
            </p>
            <p className="text-xs text-white/60">เฉลี่ย</p>
          </div>
          
          <div className="glass-dark rounded-lg p-3 border border-metaverse-purple/30 text-center">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-orange-400 mx-auto mb-1" />
            <p className="text-lg md:text-2xl font-bold text-white">
              Level {user.level}
            </p>
            <p className="text-xs text-white/60">ปัจจุบัน</p>
          </div>
        </motion.div>

        {/* Scores List - Scrollable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 glass-dark rounded-2xl p-4 border border-metaverse-purple/30 overflow-hidden flex flex-col"
        >
          <h3 className="text-lg md:text-xl font-bold text-white mb-3">
            {getGradeDisplayName(user.grade)} - Level ที่เล่นแล้ว
          </h3>
          
          {scores.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 md:w-16 md:h-16 text-white/30 mx-auto mb-3" />
                <p className="text-lg md:text-xl text-white/60">ยังไม่มีประวัติการเล่น</p>
                <p className="text-xs md:text-sm text-white/40 mt-2">เริ่มเล่นเกมเพื่อบันทึกคะแนนสูงสุดของคุณ</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {scores.map((score, index) => {
                const percentage = Math.round((score.highScore / questionsPerLevel) * 100);
                const isCurrentLevel = user.level === score.level;
                
                return (
                  <motion.div
                    key={score.level}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isCurrentLevel
                        ? 'glass bg-gradient-to-r from-metaverse-purple/10 to-metaverse-pink/10 border-metaverse-purple'
                        : 'glass-dark border-metaverse-purple/20 hover:border-metaverse-purple/40'
                    }`}
                  >
                    {/* Level Number */}
                    <div className={`text-center min-w-[40px] ${isCurrentLevel ? 'text-metaverse-purple' : 'text-white/60'}`}>
                      <p className="text-lg md:text-xl font-bold">
                        {score.level}
                      </p>
                      <p className="text-xs">Level</p>
                    </div>
                    
                    {/* Divider */}
                    <div className={`w-px h-10 ${isCurrentLevel ? 'bg-metaverse-purple/50' : 'bg-white/20'}`} />
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-white text-sm md:text-base truncate">
                          {score.description}
                        </p>
                        {isCurrentLevel && (
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-metaverse-purple to-metaverse-pink text-white rounded-full whitespace-nowrap">
                            กำลังเล่น
                          </span>
                        )}
                        {percentage === 100 && (
                          <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="hidden sm:inline">{new Date(score.lastPlayed).toLocaleDateString('th-TH')}</span>
                          <span className="sm:hidden">{new Date(score.lastPlayed).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                        </span>
                        <span>เล่น {score.playCount} ครั้ง</span>
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-right">
                      <p className="text-lg md:text-xl font-bold text-white">
                        {score.highScore}/{questionsPerLevel}
                      </p>
                      <p className={`text-xs font-medium ${
                        percentage >= 85 ? 'text-green-400' :
                        percentage >= 50 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {percentage}%
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Tips - Only on desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="hidden md:block mt-3 glass-dark p-3 rounded-xl text-xs border border-metaverse-purple/20"
        >
          <p className="text-white/60">
            <span className="font-semibold text-metaverse-purple">💡 เคล็ดลับ:</span> กลับมาเล่น level เดิมเพื่อทำคะแนนให้ดีขึ้น 
            คะแนนสูงสุดจะถูกบันทึกไว้และนับรวมในคะแนนรวมของคุณ
          </p>
        </motion.div>
      </div>
    </div>
  );
}