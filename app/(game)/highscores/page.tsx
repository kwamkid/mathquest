// app/(game)/highscores/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LevelScore } from '@/types';
import { ArrowLeft, Trophy, Star, TrendingUp, Calendar, Target, Zap, ChevronRight } from 'lucide-react';
import { getQuestionCount, getLevelConfig, GRADE_CONFIGS } from '@/lib/game/config';

interface ScoreWithDescription extends LevelScore {
  description: string;
}

interface GroupedScores {
  [key: string]: {
    description: string;
    minLevel: number;
    maxLevel: number;
    scores: ScoreWithDescription[];
  };
}

export default function HighScoresPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [groupedScores, setGroupedScores] = useState<GroupedScores>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      processScores(user.levelScores, user.grade, user.level);
    }
  }, [user]);

  const processScores = (levelScores: Record<string, LevelScore> | undefined, currentGrade: string, currentLevel: number) => {
    if (!levelScores) {
      setGroupedScores({});
      return;
    }

    // Get grade configs for grouping
    const gradeConfigs = GRADE_CONFIGS[currentGrade];
    if (!gradeConfigs) {
      setGroupedScores({});
      return;
    }

    // Group scores by level ranges
    const grouped: GroupedScores = {};
    const newExpandedGroups = new Set<string>();

    gradeConfigs.forEach((config) => {
      const groupKey = `${config.minLevel}-${config.maxLevel}`;
      const scoresInRange: ScoreWithDescription[] = [];

      // Find scores in this range
      Object.entries(levelScores).forEach(([levelKey, score]) => {
        const level = parseInt(levelKey);
        if (level >= config.minLevel && level <= config.maxLevel) {
          scoresInRange.push({
            ...score,
            level,
            description: config.description
          });
        }
      });

      // Only add group if it has scores
      if (scoresInRange.length > 0) {
        grouped[groupKey] = {
          description: config.description,
          minLevel: config.minLevel,
          maxLevel: config.maxLevel,
          scores: scoresInRange.sort((a, b) => b.level - a.level) // เรียงจากมากไปน้อย
        };

        // Auto-expand group if current level is in this range
        if (currentLevel >= config.minLevel && currentLevel <= config.maxLevel) {
          newExpandedGroups.add(groupKey);
        }
      }
    });

    setGroupedScores(grouped);
    setExpandedGroups(newExpandedGroups);
  };

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
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
    return Object.values(groupedScores).reduce((sum, group) => 
      sum + group.scores.reduce((groupSum, score) => groupSum + score.highScore, 0), 0
    );
  };

  const calculateTotalLevelsPlayed = (): number => {
    return Object.values(groupedScores).reduce((sum, group) => sum + group.scores.length, 0);
  };

  const calculateAveragePercentage = (): string => {
    const totalLevels = calculateTotalLevelsPlayed();
    if (totalLevels === 0) return '0%';
    const totalScore = calculateTotalHighScore();
    const totalPossible = totalLevels * getQuestionCount(user?.grade || 'P1');
    return Math.round((totalScore / totalPossible) * 100) + '%';
  };

  if (!user) return null;

  const questionsPerLevel = getQuestionCount(user.grade);

  return (
    <div className="min-h-screen bg-metaverse-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 p-4 max-w-6xl mx-auto w-full">
        {/* Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
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
              {calculateTotalLevelsPlayed()}
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

        {/* Scores List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-dark rounded-2xl p-4 border border-metaverse-purple/30 mb-4"
        >
          <h3 className="text-lg md:text-xl font-bold text-white mb-4">
            {getGradeDisplayName(user.grade)} - Level ที่เล่นแล้ว
          </h3>
          
          {Object.keys(groupedScores).length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 md:w-20 md:h-20 text-white/30 mx-auto mb-4" />
              <p className="text-lg md:text-xl text-white/60 mb-2">ยังไม่มีประวัติการเล่น</p>
              <p className="text-sm md:text-base text-white/40">เริ่มเล่นเกมเพื่อบันทึกคะแนนสูงสุดของคุณ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedScores).map(([groupKey, group], groupIndex) => {
                const isExpanded = expandedGroups.has(groupKey);
                const hasCurrentLevel = user.level >= group.minLevel && user.level <= group.maxLevel;
                const groupTotalScore = group.scores.reduce((sum, score) => sum + score.highScore, 0);
                const groupTotalPossible = group.scores.length * questionsPerLevel;
                const groupPercentage = Math.round((groupTotalScore / groupTotalPossible) * 100);
                
                return (
                  <motion.div
                    key={groupKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + groupIndex * 0.1 }}
                    className={`border rounded-xl overflow-hidden ${
                      hasCurrentLevel
                        ? 'border-metaverse-purple bg-gradient-to-r from-metaverse-purple/5 to-metaverse-pink/5'
                        : 'border-metaverse-purple/30'
                    }`}
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleGroup(groupKey)}
                      className={`w-full p-4 flex items-center justify-between transition-all ${
                        hasCurrentLevel 
                          ? 'glass bg-gradient-to-r from-metaverse-purple/10 to-metaverse-pink/10 hover:from-metaverse-purple/15 hover:to-metaverse-pink/15'
                          : 'glass-dark hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                          <ChevronRight className="w-5 h-5 text-white/60" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-white flex items-center gap-2">
                            Level {group.minLevel}-{group.maxLevel}
                            {hasCurrentLevel && (
                              <span className="text-xs px-2 py-1 bg-gradient-to-r from-metaverse-purple to-metaverse-pink text-white rounded-full">
                                กำลังเล่น
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-white/70">{group.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          {group.scores.length} Level
                        </p>
                        <p className={`text-sm font-medium ${
                          groupPercentage >= 85 ? 'text-green-400' :
                          groupPercentage >= 50 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {groupPercentage}% เฉลี่ย
                        </p>
                      </div>
                    </button>
                    
                    {/* Accordion Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-2">
                            {group.scores.map((score, scoreIndex) => {
                              const percentage = Math.round((score.highScore / questionsPerLevel) * 100);
                              const isCurrentLevel = user.level === score.level;
                              
                              return (
                                <motion.div
                                  key={score.level}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: scoreIndex * 0.05 }}
                                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                    isCurrentLevel
                                      ? 'bg-gradient-to-r from-metaverse-purple/20 to-metaverse-pink/20 border-metaverse-purple/50'
                                      : 'glass-dark border-metaverse-purple/20 hover:border-metaverse-purple/40'
                                  }`}
                                >
                                  {/* Level Number */}
                                  <div className={`text-center min-w-[50px] ${isCurrentLevel ? 'text-metaverse-purple' : 'text-white/60'}`}>
                                    <p className="text-lg font-bold">
                                      {score.level}
                                    </p>
                                    <p className="text-xs">Level</p>
                                  </div>
                                  
                                  {/* Divider */}
                                  <div className={`w-px h-10 ${isCurrentLevel ? 'bg-metaverse-purple/50' : 'bg-white/20'}`} />
                                  
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      {isCurrentLevel && (
                                        <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-metaverse-purple to-metaverse-pink text-white rounded-full whitespace-nowrap">
                                          กำลังเล่น
                                        </span>
                                      )}
                                      {percentage === 100 && (
                                        <Star className="w-4 h-4 text-yellow-400" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs md:text-sm text-white/60">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="hidden sm:inline">{new Date(score.lastPlayed).toLocaleDateString('th-TH')}</span>
                                        <span className="sm:hidden">{new Date(score.lastPlayed).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                                      </span>
                                      <span>เล่น {score.playCount} ครั้ง</span>
                                    </div>
                                  </div>
                                  
                                  {/* Score */}
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-white">
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
                        </motion.div>
                      )}
                    </AnimatePresence>
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
          className="glass-dark p-4 rounded-xl text-sm border border-metaverse-purple/20 mb-8"
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