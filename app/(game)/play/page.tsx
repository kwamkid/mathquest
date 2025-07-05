'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/auth';
import { updateUserGameData, calculateScoreDifference } from '@/lib/firebase/game';
import { User, Question } from '@/types';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import GameHeader from '@/components/game/GameHeader';
import GameProgress from '@/components/game/GameProgress';
import { generateQuestion } from '@/lib/game/questionGenerator';
import { getQuestionCount, calculateLevelChange, getLevelConfig } from '@/lib/game/config';
import { useSound } from '@/lib/game/soundManager';
import { Sparkles, Rocket, Trophy, TrendingDown, TrendingUp, X, AlertTriangle, Star, Settings, ChevronRight, Pi } from 'lucide-react';

export default function PlayPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result' | 'processing'>('ready');
  const [showExitModal, setShowExitModal] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  
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
  
  // Sound hook
  const { playSound } = useSound();

  // Check authentication
  const checkAuth = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      if (!userData) {
        router.push('/login');
        return;
      }
      setUser(userData);
      setTotalQuestions(getQuestionCount(userData.grade));
      setTempTotalScore(userData.totalScore);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Check if we need to play specific level
  useEffect(() => {
    if (user) {
      const forceLevel = localStorage.getItem('forceLevel');
      if (forceLevel) {
        const level = parseInt(forceLevel);
        if (!isNaN(level) && level >= 1 && level <= 100) {
          setUser({ ...user, level });
          localStorage.removeItem('forceLevel');
        }
      }
    }
  }, [user]);

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
    playSound('gameStart');
    setGameState('playing');
    setQuestionNumber(1);
    setScore(0);
    setAnswers([]);
    setGameStartTime(Date.now());
    generateNewQuestion();
  };

  // Generate new question
  const generateNewQuestion = () => {
    if (!user) return;
    const forceLevel = localStorage.getItem('forceLevel');
    const levelToPlay = forceLevel ? parseInt(forceLevel) : user.level;
    const question = generateQuestion(user.grade, levelToPlay);
    setCurrentQuestion(question);
    setStartTime(Date.now());
  };

  // Handle answer submission
  const handleAnswer = (userAnswer: number) => {
    if (!currentQuestion) return;
    
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
      }, 2000);
    } else {
      setQuestionNumber(questionNumber + 1);
      generateNewQuestion();
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
        const { scoreDiff, isNewHighScore, oldHighScore } = await calculateScoreDifference(
          user.id,
          user.level,
          actualScore
        );
        
        setHighScoreInfo({
          isNew: isNewHighScore,
          oldScore: oldHighScore,
          scoreDiff: scoreDiff
        });
        
        let newLevel = user.level;
        if (levelChange === 'increase' && user.level < 100) {
          newLevel = user.level + 1;
        } else if (levelChange === 'decrease' && user.level > 1) {
          newLevel = user.level - 1;
        }
        
        const baseExp = actualScore * 10;
        const bonusExp = percentage >= 85 ? 50 : percentage >= 70 ? 30 : 0;
        const highScoreBonus = isNewHighScore ? 100 : 0;
        const totalExp = baseExp + bonusExp + highScoreBonus;
        
        const newTotalScore = user.totalScore + scoreDiff;
        
        const levelScores = user.levelScores || {};
        const levelKey = user.level.toString();
        levelScores[levelKey] = {
          level: user.level,
          highScore: Math.max(actualScore, oldHighScore),
          lastPlayed: new Date().toISOString(),
          playCount: (levelScores[levelKey]?.playCount || 0) + 1
        };
        
        await updateUserGameData(user.id, {
          level: newLevel,
          totalScore: newTotalScore,
          experience: user.experience + totalExp,
          lastPlayedAt: new Date().toISOString(),
          levelScores: levelScores
        });
        
        setUser({
          ...user,
          level: newLevel,
          totalScore: newTotalScore,
          experience: user.experience + totalExp,
          levelScores: levelScores
        });
        
        setTempTotalScore(newTotalScore);
        
        const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
        
        const params = new URLSearchParams({
          score: actualScore.toString(),
          total: totalQuestions.toString(),
          percentage: percentage.toString(),
          levelChange: levelChange,
          newLevel: newLevel.toString(),
          oldLevel: user.level.toString(),
          exp: totalExp.toString(),
          highScore: isNewHighScore.toString(),
          oldHighScore: oldHighScore.toString(),
          scoreDiff: scoreDiff.toString(),
          time: timeSpent.toString(),
        });
        
        router.push(`/summary?${params.toString()}`);
        
      } catch (error) {
        console.error('Error saving game data:', error);
      }
    }
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

  return (
    <div className="h-screen bg-metaverse-black flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Floating particles - แสดงเฉพาะบน desktop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        {[...Array(20)].map((_, i) => (
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

      {/* Header */}
      {user && <GameHeader user={{ ...user, totalScore: tempTotalScore }} />}
      
      {/* Main Content - ปรับให้เต็มพื้นที่ที่เหลือ */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-2 md:py-4">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            {/* Ready State - ปรับขนาดสำหรับ mobile */}
            {gameState === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center"
              >
                {/* Main Game Card - ปรับ padding และขนาด */}
                <div className="glass-dark rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-metaverse-purple/30 mb-4 md:mb-6 w-full">
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="inline-block mb-3 md:mb-6"
                  >
                    <Sparkles className="w-12 h-12 md:w-20 md:h-20 text-metaverse-purple filter drop-shadow-[0_0_30px_rgba(147,51,234,0.5)]" />
                  </motion.div>
                  
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 text-center">
                    พร้อมเริ่มการผจญภัยหรือยัง?
                  </h1>
                  
                  <div className="mb-4 md:mb-6 space-y-1 text-center">
                    <p className="text-base md:text-xl text-white/80">
                      <span className="font-medium">ระดับชั้น:</span>{' '}
                      <span className="text-metaverse-pink">{getGradeDisplayName(user?.grade || '')}</span>
                    </p>
                    <p className="text-base md:text-xl text-white/80">
                      <span className="font-bold text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                        Level {user?.level}
                      </span>{' '}
                      <span className="text-sm md:text-base text-white/60 block md:inline">
                        {user && getLevelDescription(user.grade, user.level)}
                      </span>
                    </p>
                    <p className="text-base md:text-xl text-white/80">
                      <span className="font-medium">จำนวน:</span>{' '}
                      <span className="text-metaverse-glow">{totalQuestions} ข้อ</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <motion.button
                      onClick={startGame}
                      onMouseDown={() => playSound('click')}
                      className="px-8 md:px-12 py-4 md:py-6 metaverse-button text-white font-bold text-lg md:text-2xl rounded-full shadow-lg hover:shadow-xl relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10 flex items-center gap-2 md:gap-3">
                        <Rocket className="w-5 h-5 md:w-7 md:h-7" />
                        เริ่มเลย!
                      </span>
                    </motion.button>
                  </div>
                </div>

                {/* Quick Menu Grid - แสดงแบบ compact บน mobile */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 w-full">
                  {/* Ranking Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => router.push('/ranking')}
                    className="glass-dark rounded-xl p-3 md:p-4 border border-metaverse-purple/30 hover:border-metaverse-purple/60 cursor-pointer transition-all hover:shadow-lg group text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-lg group-hover:scale-110 transition w-fit mx-auto mb-2">
                      <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xs md:text-sm font-bold text-white">อันดับ</h3>
                  </motion.div>

                  {/* High Score Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => router.push('/highscores')}
                    className="glass-dark rounded-xl p-3 md:p-4 border border-metaverse-purple/30 hover:border-metaverse-purple/60 cursor-pointer transition-all hover:shadow-lg group text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-2 bg-gradient-to-br from-metaverse-purple/20 to-metaverse-pink/20 rounded-lg group-hover:scale-110 transition w-fit mx-auto mb-2">
                      <Star className="w-6 h-6 md:w-8 md:h-8 text-metaverse-purple" />
                    </div>
                    <h3 className="text-xs md:text-sm font-bold text-white">คะแนนสูงสุด</h3>
                  </motion.div>

                  {/* Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => router.push('/profile')}
                    className="glass-dark rounded-xl p-3 md:p-4 border border-metaverse-purple/30 hover:border-metaverse-purple/60 cursor-pointer transition-all hover:shadow-lg group text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-2 bg-gradient-to-br from-metaverse-red/20 to-metaverse-darkRed/20 rounded-lg group-hover:scale-110 transition w-fit mx-auto mb-2">
                      <Settings className="w-6 h-6 md:w-8 md:h-8 text-metaverse-red" />
                    </div>
                    <h3 className="text-xs md:text-sm font-bold text-white">โปรไฟล์</h3>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Playing State - ปรับขนาดสำหรับ mobile */}
            {gameState === 'playing' && currentQuestion && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="h-full flex flex-col"
              >
                {/* Exit Button */}
                <div className="flex justify-end mb-2">
                  <motion.button
                    onClick={() => setShowExitModal(true)}
                    className="p-1.5 md:p-2 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="ออกจากเกม"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </motion.button>
                </div>
                
                {/* ปรับ GameProgress ให้เล็กลง */}
                <div className="mb-2 md:mb-4">
                  <GameProgress 
                    current={questionNumber} 
                    total={totalQuestions}
                    score={score}
                  />
                </div>
                
                {/* Question Display จะต้องปรับใน component นั้นด้วย */}
                <div className="flex-1 flex items-center">
                  <QuestionDisplay
                    question={currentQuestion}
                    questionNumber={questionNumber}
                    onAnswer={handleAnswer}
                  />
                </div>
              </motion.div>
            )}

            {/* Processing State */}
            {gameState === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center"
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
                  className="mb-6 md:mb-8"
                >
                  <Pi className="w-20 h-20 md:w-32 md:h-32 text-metaverse-purple filter drop-shadow-[0_0_50px_rgba(147,51,234,0.7)]" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
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
      </div>

      {/* Exit Confirmation Modal - ปรับขนาดสำหรับ mobile */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full border border-metaverse-purple/30"
          >
            {/* Warning Icon */}
            <motion.div
              className="text-center mb-3 md:mb-4"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{ 
                duration: 0.5,
              }}
            >
              <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 text-orange-400 mx-auto filter drop-shadow-[0_0_20px_rgba(251,146,60,0.5)]" />
            </motion.div>
            
            <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-3 md:mb-4">
              ต้องการออกจากเกมจริงหรือไม่?
            </h3>
            
            <div className="glass bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
              <p className="text-orange-400 text-center text-sm md:text-base">
                ⚠️ คำเตือน: คะแนนที่ทำมาในเกมนี้จะถูกยกเลิกทั้งหมด
              </p>
              <p className="text-white/60 text-xs md:text-sm text-center mt-2">
                คุณตอบถูกแล้ว {score} ข้อ จากทั้งหมด {questionNumber} ข้อที่ทำ
              </p>
            </div>
            
            <div className="flex gap-3 md:gap-4">
              <motion.button
                onClick={() => {
                  setShowExitModal(false);
                  playSound('click');
                }}
                className="flex-1 py-2.5 md:py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl hover:bg-white/10 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                เล่นต่อ
              </motion.button>
              
              <motion.button
                onClick={() => {
                  playSound('click');
                  setTempTotalScore(user?.totalScore || 0);
                  localStorage.removeItem('forceLevel');
                  router.push('/play');
                  setGameState('ready');
                  setScore(0);
                  setQuestionNumber(0);
                  setAnswers([]);
                  setShowExitModal(false);
                }}
                className="flex-1 py-2.5 md:py-3 bg-red-500/20 border border-red-500/50 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition"
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