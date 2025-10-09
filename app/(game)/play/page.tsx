'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { updateUserGameData, calculateScoreDifference, updatePlayStreak, calculateExpGained } from '@/lib/firebase/game';
import { getActiveBoosts } from '@/lib/firebase/rewards';
import { Question } from '@/types';
import { ActiveBoost } from '@/types/avatar';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import GameHeader from '@/components/game/GameHeader';
import GameProgress from '@/components/game/GameProgress';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import { calculateGradeProgression } from '@/lib/game/gradeProgression';
import { generateQuestion } from '@/lib/game/questionGenerator';
import { getQuestionCount, calculateLevelChange, getLevelConfig } from '@/lib/game/config';
import { useSound } from '@/lib/game/soundManager';
import { useBackgroundMusic } from '@/lib/game/backgroundMusicManager';
import { 
  Sparkles, 
  Rocket, 
  Trophy, 
  TrendingDown, 
  TrendingUp, 
  X, 
  AlertTriangle, 
  Star, 
  Settings, 
  ChevronRight, 
  Pi,
  Zap,
  Clock,
  Gift,
  Edit3
} from 'lucide-react';
import Link from 'next/link';

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result' | 'processing'>('ready');
  const [showExitModal, setShowExitModal] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  
  // Force level from query parameter
  const [forceLevel, setForceLevel] = useState<number | null>(null);
  
  // Game session state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [score, setScore] = useState(0);
  const [tempTotalScore, setTempTotalScore] = useState(0);
  const [highScoreInfo, setHighScoreInfo] = useState<{ isNew: boolean; oldScore: number; scoreDiff: number } | null>(null);
  const [answers, setAnswers] = useState<Array<{
    question: Question;
    userAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>>([]);
  const [startTime, setStartTime] = useState<number>(0);
  
  // ✅ เพิ่ม: ป้องกันการกดซ้ำ
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Boost state
  const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);
  const [currentBoostMultiplier, setCurrentBoostMultiplier] = useState(1);
  
  // Sound hook
  const { playSound } = useSound();
  
  // Background music hook
  const { resumeMusic, isEnabled: musicEnabled, isPlaying, fadeIn, setGameplayVolume, restoreNormalVolume } = useBackgroundMusic();

  // Initialize game when user is loaded
  useEffect(() => {
    if (user) {
      setTotalQuestions(getQuestionCount(user.grade));
      setTempTotalScore(user.totalScore);
      
      // Check for active boosts
      getActiveBoosts(user.id).then(boosts => {
        setActiveBoosts(boosts);
        
        // Calculate boost multiplier
        if (boosts.length > 0) {
          const maxMultiplier = Math.max(...boosts.map(b => b.multiplier));
          setCurrentBoostMultiplier(maxMultiplier);
        }
      });
      
      setLoading(false);
    }
  }, [user]);

  // ✅ แก้ไข: แยก useEffect สำหรับเพลงออกมา
  useEffect(() => {
    if (!loading && musicEnabled && !isPlaying) {
      // ✅ ใช้ fadeIn เพื่อให้เพลงค่อยๆดังขึ้น
      const timer = setTimeout(() => {
        fadeIn(2000); // Fade in 2 วินาที
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, musicEnabled, isPlaying, fadeIn]);

  // ✅ เพิ่ม: Cleanup เมื่อ unmount หรือเปลี่ยน state
  useEffect(() => {
    return () => {
      if (gameState === 'playing') {
        restoreNormalVolume();
      }
    };
  }, [gameState, restoreNormalVolume]);

  // ✅ แก้ไข: Auto-start music on first interaction
  const startMusicOnInteraction = () => {
    if (musicEnabled && !isPlaying) {
      console.log('🎵 Starting music on user interaction');
      fadeIn(2000);
    }
  };

  // Check for level parameter from URL
  useEffect(() => {
    const levelParam = searchParams.get('level');
    if (levelParam) {
      const level = parseInt(levelParam);
      if (!isNaN(level) && level >= 1 && level <= 100) {
        setForceLevel(level);
        console.log('Force level set to:', level);
      }
    }
  }, [searchParams]);

  // Auto start game if coming from summary
  useEffect(() => {
    if (searchParams.get('autoStart') === 'true' && !loading && user && gameState === 'ready') {
      startGame();
      
      const url = new URL(window.location.href);
      url.searchParams.delete('autoStart');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, loading, user, gameState]);

  // Get actual level to play
  const getPlayLevel = () => {
    return forceLevel || user?.level || 1;
  };

  // Get grade display name
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

  // Get level description
  const getLevelDescription = (grade: string, level: number): string => {
    const config = getLevelConfig(grade, level);
    return config ? `(${config.description})` : '';
  };

  // Start game
  const startGame = () => {
    startMusicOnInteraction();
    playSound('gameStart');
    setGameState('playing');
    setQuestionNumber(1);
    setScore(0);
    setAnswers([]);
    setGameStartTime(Date.now());
    setIsProcessing(false); // ✅ Reset processing state
    
    setGameplayVolume();
    generateNewQuestion();
  };

  // Generate new question
  const generateNewQuestion = () => {
    if (!user) return;
    
    const levelToPlay = getPlayLevel();
    const question = generateQuestion(user.grade, levelToPlay);
    setCurrentQuestion(question);
    setStartTime(Date.now());
  };

  // Handle answer submission
  const handleAnswer = (userAnswer: number) => {
    if (!currentQuestion || isProcessing) return;
    
    setIsProcessing(true);
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = userAnswer === currentQuestion.answer;
    
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    const newAnswers = [...answers, {
      question: currentQuestion,
      userAnswer,
      isCorrect,
      timeSpent
    }];
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    if (questionNumber === totalQuestions) {
      setGameState('processing');
      
      setTimeout(() => {
        const finalScore = isCorrect ? score + 1 : score;
        endGame(finalScore);
      }, 1500);
    } else {
      // ✅ แก้ไข: เคลียร์คำถามเก่าทันที
      setCurrentQuestion(null);
      setQuestionNumber(questionNumber + 1);
      
      // ✅ โหลดข้อใหม่เร็วขึ้น
      setTimeout(() => {
        generateNewQuestion();
        setIsProcessing(false);
      }, 600); // ✅ ลดจาก 800ms → 600ms
    }
  };

  // End game
  const endGame = async (finalScore?: number) => {
    const actualScore = finalScore !== undefined ? finalScore : score;
    const percentage = Math.round((actualScore / totalQuestions) * 100);
    const levelChange = calculateLevelChange(percentage);
    
    if (levelChange === 'increase') {
      playSound('levelUp');
    } else if (levelChange === 'decrease') {
      playSound('levelDown');
    } else {
      playSound('gameEnd');
    }
    
    if (user) {
      try {
        const playLevel = getPlayLevel();
        const { playStreak, isFirstToday } = await updatePlayStreak(user.id);
        
        const { scoreDiff, isNewHighScore, oldHighScore } = await calculateScoreDifference(
          user.id,
          playLevel,
          actualScore
        );
        
        setHighScoreInfo({
          isNew: isNewHighScore,
          oldScore: oldHighScore,
          scoreDiff: scoreDiff
        });
        
        let newGrade = user.grade;
        let newLevel = user.level;
        let gradeChanged = false;
        
        if (!forceLevel || forceLevel === user.level) {
          const progression = calculateGradeProgression(
            user.grade,
            user.level,
            percentage
          );
          
          newGrade = progression.newGrade;
          newLevel = progression.newLevel;
          gradeChanged = progression.gradeChanged;
        }
        
        const playCount = (user.levelScores?.[playLevel.toString()]?.playCount || 0) + 1;
        
        const expCalc = calculateExpGained(
          actualScore,
          totalQuestions,
          percentage,
          playLevel,
          playStreak,
          isFirstToday,
          playCount
        );
        
        const boostedExp = Math.floor(expCalc.totalExp * currentBoostMultiplier);
        const newTotalScore = user.totalScore + scoreDiff;
        
        const levelScores = user.levelScores || {};
        const levelKey = playLevel.toString();
        levelScores[levelKey] = {
          level: playLevel,
          highScore: Math.max(actualScore, oldHighScore),
          lastPlayed: new Date().toISOString(),
          playCount: playCount
        };
        
        const updateData: any = {
          totalScore: newTotalScore,
          experience: user.experience + boostedExp,
          lastPlayedAt: new Date().toISOString(),
          levelScores: levelScores,
          playStreak: playStreak
        };
        
        if (!forceLevel || forceLevel === user.level) {
          updateData.level = newLevel;
          if (gradeChanged) {
            updateData.grade = newGrade;
          }
        }
        
        await updateUserGameData(user.id, updateData);
        await refreshUser();
        
        setTempTotalScore(newTotalScore);
        
        const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
        
        const params = new URLSearchParams({
          score: actualScore.toString(),
          total: totalQuestions.toString(),
          percentage: percentage.toString(),
          levelChange: levelChange,
          newLevel: newLevel.toString(),
          oldLevel: (forceLevel || user.level).toString(),
          newGrade: newGrade.toString(),
          oldGrade: user.grade.toString(),
          gradeChanged: gradeChanged.toString(),
          exp: boostedExp.toString(),
          highScore: isNewHighScore.toString(),
          oldHighScore: oldHighScore.toString(),
          scoreDiff: scoreDiff.toString(),
          time: timeSpent.toString(),
          expBreakdown: JSON.stringify(expCalc.breakdown),
          playStreak: playStreak.toString(),
          isFirstToday: isFirstToday.toString(),
          boostMultiplier: currentBoostMultiplier.toString()
        });
        
        router.push(`/summary?${params.toString()}`);
        
      } catch (error) {
        console.error('Error saving game data:', error);
        setIsProcessing(false); // ✅ Unlock ถ้าเกิด error
      }
    }
  };

  // Calculate score percentage
  const getScorePercentage = () => {
    return Math.round((score / totalQuestions) * 100);
  };

  // Get level change message
  const getLevelChangeMessage = () => {
    const percentage = getScorePercentage();
    const levelChange = calculateLevelChange(percentage);
    
    switch (levelChange) {
      case 'decrease':
        return { 
          type: 'down', 
          message: 'ระดับลดลง', 
          icon: <TrendingDown className="w-6 h-6" />,
          color: 'text-red-400'
        };
      case 'increase':
        return { 
          type: 'up', 
          message: 'ระดับเพิ่มขึ้น', 
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'text-green-400'
        };
      default:
        return { 
          type: 'same', 
          message: 'คงระดับเดิม', 
          icon: '➡️',
          color: 'text-orange-400'
        };
    }
  };

  if (loading || !user) {
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

  const displayLevel = getPlayLevel();

  return (
    <div className="min-h-screen bg-metaverse-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* ✅ แก้ไข: ลด Floating particles จาก 20 → 8 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-metaverse-purple/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {user && <GameHeader user={{ ...user, totalScore: tempTotalScore }} hideActions={gameState === 'playing'} />}
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {/* Ready State */}
          {gameState === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Active Boost Notification */}
              {activeBoosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl p-4 mb-6 border border-yellow-400/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-400/20 rounded-xl">
                        <Zap className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Boost Active!</p>
                        <p className="text-sm text-white/80">
                          EXP x{currentBoostMultiplier} สำหรับเกมนี้
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Clock className="w-4 h-4" />
                      <span>เหลือเวลา {Math.floor((new Date(activeBoosts[0].expiresAt).getTime() - Date.now()) / 60000)} นาที</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Main Game Card */}
              <div className="glass-dark rounded-3xl shadow-2xl p-12 border border-metaverse-purple/30 mb-8">
                {/* Avatar Display */}
                <div className="flex justify-center mb-6">
                  <Link href="/my-avatar" className="group relative cursor-pointer">
                    <motion.div
                      className="relative"
                      animate={{ 
                        scale: [1, 1.02, 1],
                        y: [0, -3, 0],
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="absolute -bottom-2 -right-2 bg-metaverse-purple text-white rounded-full p-2 shadow-lg z-10"
                        animate={{ 
                          scale: [0.9, 1.1, 0.9],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Edit3 className="w-5 h-5" />
                      </motion.div>
                      
                      <motion.div
                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-metaverse-purple to-metaverse-pink text-white text-sm font-bold rounded-full px-4 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        จัดการ Avatar
                      </motion.div>
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-metaverse-purple/20 to-metaverse-pink/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity scale-110" />
                      
                      <EnhancedAvatarDisplay
                        userId={user.id}
                        avatarData={user.avatarData}
                        basicAvatar={user.avatar}
                        size="xlarge"
                        showEffects={true}
                        showTitle={true}
                        titleBadge={user.currentTitleBadge}
                      />
                    </motion.div>
                  </Link>
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4 text-center">
                  พร้อมเริ่มการผจญภัยหรือยัง?
                </h1>
                
                <div className="mb-8 space-y-2 text-center">
                  <p className="text-xl text-white/80">
                    <span className="font-medium">ระดับชั้น:</span>{' '}
                    <span className="text-metaverse-pink">{getGradeDisplayName(user?.grade || '')}</span>
                  </p>
                  <div className="space-y-1">
                    <p className="text-xl text-white/80">
                      <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                        Level {displayLevel}
                      </span>{' '}
                      <span className="text-white/60">
                        {user && getLevelDescription(user.grade, displayLevel)}
                      </span>
                    </p>
                    {forceLevel && forceLevel !== user.level && (
                      <div className="glass bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2 inline-block">
                        <span className="text-yellow-400 font-medium">
                          🔁 กำลังเล่น Level {forceLevel} ซ้ำ (ปกติคุณอยู่ Level {user.level})
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xl text-white/80">
                    <span className="font-medium">จำนวน:</span>{' '}
                    <span className="text-metaverse-glow">{totalQuestions} ข้อ</span>
                  </p>
                </div>
                
                {/* Start Game Button */}
                <div className="text-center">
                  <motion.button
                    onClick={startGame}
                    onMouseDown={() => {
                      startMusicOnInteraction();
                      playSound('click');
                    }}
                    className="px-12 py-6 metaverse-button text-white font-bold text-2xl rounded-full shadow-lg hover:shadow-xl relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Rocket className="w-7 h-7" />
                      เริ่มเลย!
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Quick Menu Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Ranking Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    startMusicOnInteraction();
                    router.push('/ranking');
                  }}
                  className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30 hover:border-metaverse-purple/60 cursor-pointer transition-all hover:shadow-lg group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-xl group-hover:scale-110 transition">
                      <Trophy className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Level Ranking</h3>
                      <p className="text-white/60 text-sm mb-3">ดูอันดับคะแนนในระดับชั้นของคุณ</p>
                      <div className="flex items-center gap-2 text-metaverse-pink text-sm font-medium">
                        <span>ดูอันดับ</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* High Score Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => {
                    startMusicOnInteraction();
                    router.push('/highscores');
                  }}
                  className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30 hover:border-metaverse-purple/60 cursor-pointer transition-all hover:shadow-lg group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-metaverse-purple/20 to-metaverse-pink/20 rounded-xl group-hover:scale-110 transition">
                      <Star className="w-8 h-8 text-metaverse-purple" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Our History</h3>
                      <p className="text-white/60 text-sm mb-3">
                        {user?.levelScores && Object.keys(user.levelScores).length > 0 
                          ? `เล่นแล้ว ${Object.keys(user.levelScores).length} Level`
                          : 'ยังไม่มีประวัติ'
                        }
                      </p>
                      <div className="flex items-center gap-2 text-metaverse-pink text-sm font-medium">
                        <span>ดูทั้งหมด</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* My Avatar Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => {
                    startMusicOnInteraction();
                    router.push('/my-avatar');
                  }}
                  className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30 hover:border-metaverse-purple/60 cursor-pointer transition-all hover:shadow-lg group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-metaverse-purple/20 to-metaverse-pink/20 rounded-xl group-hover:scale-110 transition">
                      <Sparkles className="w-8 h-8 text-metaverse-purple" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">My Avatar</h3>
                      <p className="text-white/60 text-sm mb-3">จัดการตัวละครและเครื่องประดับ</p>
                      <div className="flex items-center gap-2 text-metaverse-pink text-sm font-medium">
                        <span>จัดการ</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Reward Shop Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => {
                    startMusicOnInteraction();
                    router.push('/rewards');
                  }}
                  className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30 hover:border-metaverse-purple/60 cursor-pointer transition-all hover:shadow-lg group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-xl group-hover:scale-110 transition">
                      <Gift className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Reward Shop</h3>
                      <p className="text-white/60 text-sm mb-3">
                        EXP: {user?.experience.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 text-metaverse-pink text-sm font-medium">
                        <span>แลกรางวัล</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              {/* Exit Button */}
              <div className="flex justify-end mb-4">
                <motion.button
                  onClick={() => setShowExitModal(true)}
                  className="p-2 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="ออกจากเกม"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              
              <GameProgress 
                current={questionNumber} 
                total={totalQuestions}
                score={score}
              />
              
              {/* ✅ แสดง Loading หรือ Question */}
              {currentQuestion ? (
                <QuestionDisplay
                  question={currentQuestion}
                  questionNumber={questionNumber}
                  onAnswer={handleAnswer}
                />
              ) : (
                // ✅ Loading State สำหรับข้อถัดไป
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-dark rounded-3xl shadow-xl p-12 border border-metaverse-purple/30 flex flex-col items-center justify-center min-h-[400px]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mb-4"
                  >
                    <div className="w-16 h-16 border-4 border-metaverse-purple border-t-transparent rounded-full" />
                  </motion.div>
                  <p className="text-xl text-white font-medium">กำลังโหลดคำถาม...</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Processing State */}
          {gameState === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center min-h-[400px]"
            >
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 0.9, 1.1, 1],
                  y: [0, -20, 0, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-8"
              >
                <Pi className="w-32 h-32 text-metaverse-purple filter drop-shadow-[0_0_50px_rgba(147,51,234,0.7)]" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  กำลังคำนวณผล...
                </h2>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-metaverse-purple rounded-full"
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl p-8 max-w-md w-full border border-metaverse-purple/30"
          >
            <motion.div
              className="text-6xl text-center mb-4"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{ 
                duration: 0.5,
              }}
            >
              <AlertTriangle className="w-20 h-20 text-orange-400 mx-auto filter drop-shadow-[0_0_20px_rgba(251,146,60,0.5)]" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              ต้องการออกจากเกมจริงหรือไม่?
            </h3>
            
            <div className="glass bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
              <p className="text-orange-400 text-center">
                ⚠️ คำเตือน: คะแนนที่ทำมาในเกมนี้จะถูกยกเลิกทั้งหมด
              </p>
              <p className="text-white/60 text-sm text-center mt-2">
                คุณตอบถูกแล้ว {score} ข้อ จากทั้งหมด {questionNumber} ข้อที่ทำ
              </p>
            </div>
            
            <div className="flex gap-4">
              <motion.button
                onClick={() => {
                  setShowExitModal(false);
                  playSound('click');
                }}
                className="flex-1 py-3 glass-dark rounded-xl border border-metaverse-purple/30 hover:bg-white/5 transition flex items-center justify-center gap-2 text-white font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                เล่นต่อ
              </motion.button>
              
              <motion.button
                onClick={() => {
                  playSound('click');
                  setTempTotalScore(user?.totalScore || 0);
                  setForceLevel(null);
                  const url = new URL(window.location.href);
                  url.search = '';
                  window.history.replaceState({}, '', url);
                  
                  setGameState('ready');
                  setScore(0);
                  setQuestionNumber(0);
                  setAnswers([]);
                  setShowExitModal(false);
                  setIsProcessing(false); // ✅ Reset processing state
                  
                  restoreNormalVolume();
                }}
                className="flex-1 py-3 bg-red-500/20 border border-red-500/50 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ออกจากเกม
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}