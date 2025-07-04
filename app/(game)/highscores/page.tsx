// app/(game)/highscores/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User, LevelScore } from '@/types';
import { ArrowLeft, Trophy, Star, TrendingUp, Calendar, Target, Zap, Pi } from 'lucide-react';
import { getQuestionCount, getLevelConfig } from '@/lib/game/config';

interface ScoreWithDescription extends LevelScore {
  description: string;
}

export default function HighScoresPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<ScoreWithDescription[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser();
      if (!userData) {
        router.push('/login');
        return;
      }
      
      setUser(userData);
      
      // Process scores for current grade only
      if (userData.levelScores) {
        processScores(userData.levelScores, userData.grade);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const processScores = (levelScores: Record<string, LevelScore>, currentGrade: string) => {
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

  if (loading) {
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

  if (!user) return null;

  const questionsPerLevel = getQuestionCount(user.grade);

  return (
    <div className="min-h-screen bg-metaverse-black py-8">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => router.push('/play')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            กลับ
          </button>
          
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            คะแนนสูงสุดของฉัน
          </h1>
          
          <div className="w-20" />
        </motion.div>

        {/* Current Grade & Level Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-dark rounded-2xl p-6 mb-8 border-2 border-metaverse-purple bg-gradient-to-br from-metaverse-purple/10 to-metaverse-pink/10"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-metaverse-purple to-metaverse-pink rounded-xl">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  ระดับชั้นปัจจุบัน: <span className="text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">{getGradeDisplayName(user.grade)}</span>
                </h2>
                <p className="text-lg text-white/80">
                  กำลังเล่น <span className="font-bold text-metaverse-purple">Level {user.level}</span>
                  {user.levelScores && user.levelScores[user.level.toString()] && (
                    <span className="text-white/60">
                      {' '}• คะแนนสูงสุด: {user.levelScores[user.level.toString()].highScore}/{questionsPerLevel}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {user.levelScores && user.levelScores[user.level.toString()] && (
              <div className="text-right">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                  {Math.round((user.levelScores[user.level.toString()].highScore / questionsPerLevel) * 100)}%
                </p>
                <p className="text-sm text-white/60">ความสำเร็จ</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-dark rounded-xl p-4 border border-metaverse-purple/30 text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {scores.length}
            </p>
            <p className="text-sm text-white/60">Level ที่เล่นแล้ว</p>
          </div>
          
          <div className="glass-dark rounded-xl p-4 border border-metaverse-purple/30 text-center">
            <Trophy className="w-8 h-8 text-metaverse-purple mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {calculateTotalHighScore()}
            </p>
            <p className="text-sm text-white/60">คะแนนรวมทั้งหมด</p>
          </div>
          
          <div className="glass-dark rounded-xl p-4 border border-metaverse-purple/30 text-center">
            <Target className="w-8 h-8 text-metaverse-pink mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {calculateAveragePercentage()}
            </p>
            <p className="text-sm text-white/60">เปอร์เซ็นต์เฉลี่ย</p>
          </div>
          
          <div className="glass-dark rounded-xl p-4 border border-metaverse-purple/30 text-center">
            <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              Level {user.level}
            </p>
            <p className="text-sm text-white/60">ระดับปัจจุบัน</p>
          </div>
        </motion.div>

        {/* Scores List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            {getGradeDisplayName(user.grade)} - Level ที่เล่นแล้ว
          </h3>
          
          {scores.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-xl text-white/60">ยังไม่มีประวัติการเล่น</p>
              <p className="text-sm text-white/40 mt-2">เริ่มเล่นเกมเพื่อบันทึกคะแนนสูงสุดของคุณ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((score, index) => {
                const percentage = Math.round((score.highScore / questionsPerLevel) * 100);
                const isCurrentLevel = user.level === score.level;
                
                return (
                  <motion.div
                    key={score.level}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      isCurrentLevel
                        ? 'glass bg-gradient-to-r from-metaverse-purple/10 to-metaverse-pink/10 border-metaverse-purple'
                        : 'glass-dark border-metaverse-purple/20 hover:border-metaverse-purple/40'
                    }`}
                  >
                    {/* Level Number */}
                    <div className={`text-center min-w-[60px] ${isCurrentLevel ? 'text-metaverse-purple' : 'text-white/60'}`}>
                      <p className="text-2xl font-bold">
                        {score.level}
                      </p>
                      <p className="text-xs">Level</p>
                    </div>
                    
                    {/* Divider */}
                    <div className={`w-px h-12 ${isCurrentLevel ? 'bg-metaverse-purple/50' : 'bg-white/20'}`} />
                    
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white">
                          {score.description}
                        </p>
                        {isCurrentLevel && (
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-metaverse-purple to-metaverse-pink text-white rounded-full">
                            กำลังเล่น
                          </span>
                        )}
                        {percentage === 100 && (
                          <Star className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(score.lastPlayed).toLocaleDateString('th-TH')}
                        </span>
                        <span>เล่นไป {score.playCount} ครั้ง</span>
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {score.highScore}/{questionsPerLevel}
                      </p>
                      <p className={`text-sm font-medium ${
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

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass-dark p-4 rounded-xl text-sm border border-metaverse-purple/20"
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