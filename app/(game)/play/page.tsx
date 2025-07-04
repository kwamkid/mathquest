'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/auth';
import { updateUserGameData, calculateScoreDifference } from '@/lib/firebase/game';
import { User, Question, LevelScore } from '@/types';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import GameHeader from '@/components/game/GameHeader';
import GameProgress from '@/components/game/GameProgress';
import { generateQuestion } from '@/lib/game/questionGenerator';
import { getQuestionCount, calculateLevelChange, LEVEL_PROGRESSION, getLevelConfig } from '@/lib/game/config';
import { useSound } from '@/lib/game/soundManager';
import { Sparkles, Rocket, Trophy, TrendingDown, TrendingUp, X, AlertTriangle } from 'lucide-react';

export default function PlayPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result'>('ready');
  const [showExitModal, setShowExitModal] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  
  // Game session state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [score, setScore] = useState(0);
  const [tempTotalScore, setTempTotalScore] = useState(0); // คะแนนรวมชั่วคราว
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
      // ใช้ getQuestionCount จาก config
      setTotalQuestions(getQuestionCount(userData.grade));
      // Set คะแนนรวมเริ่มต้น
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

  // Get grade display name
  const getGradeDisplayName = (grade: string): string => {
    const gradeMap: Record<string, string> = {
      K1: 'อนุบาล 1',
      K2: 'อนุบาล 2',
      K3: 'อนุบาล 3',
      P1: 'ประถม 1',
      P2: 'ประถม 2',
      P3: 'ประถม 3',
      P4: 'ประถม 4',
      P5: 'ประถม 5',
      P6: 'ประถม 6',
      M1: 'มัธยม 1',
      M2: 'มัธยม 2',
      M3: 'มัธยม 3',
      M4: 'มัธยม 4',
      M5: 'มัธยม 5',
      M6: 'มัธยม 6',
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
    setGameStartTime(Date.now()); // บันทึกเวลาเริ่มเกม
    generateNewQuestion();
  };

  // Generate new question
  const generateNewQuestion = () => {
    if (!user) return;
    
    const question = generateQuestion(user.grade, user.level);
    setCurrentQuestion(question);
    setStartTime(Date.now());
  };

  // Handle answer submission
  const handleAnswer = (userAnswer: number) => {
    if (!currentQuestion) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = userAnswer === currentQuestion.answer;
    
    // Play sound effect
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    // Save answer
    setAnswers([...answers, {
      question: currentQuestion,
      userAnswer,
      isCorrect,
      timeSpent
    }]);
    
    // Update score
    if (isCorrect) {
      setScore(score + 1);
      // ไม่อัปเดตคะแนนรวมชั่วคราวทันที รอคำนวณตอนจบเกม
    }
    
    // Check if game finished
    if (questionNumber >= totalQuestions) {
      // Wait a bit before ending to ensure last answer is processed
      setTimeout(() => {
        endGame();
      }, 100);
    } else {
      // Next question
      setQuestionNumber(questionNumber + 1);
      generateNewQuestion();
    }
  };

  // End game
  const endGame = async () => {
    // ใช้ score ล่าสุดที่อัปเดตแล้ว
    const finalScore = answers.filter(a => a.isCorrect).length + (currentQuestion && answers[answers.length - 1]?.isCorrect ? 0 : 0);
    const percentage = Math.round((finalScore / totalQuestions) * 100);
    const levelChange = calculateLevelChange(percentage);
    
    // Play appropriate sound
    if (levelChange === 'increase') {
      playSound('levelUp');
    } else if (levelChange === 'decrease') {
      playSound('levelDown');
    } else {
      playSound('gameEnd');
    }
    
    // Save game session to Firebase
    if (user) {
      try {
        // คำนวณความแตกต่างของคะแนน (ระบบ high score)
        const { scoreDiff, isNewHighScore, oldHighScore } = await calculateScoreDifference(
          user.id,
          user.level,
          finalScore
        );
        
        // เก็บข้อมูล high score
        setHighScoreInfo({
          isNew: isNewHighScore,
          oldScore: oldHighScore,
          scoreDiff: scoreDiff
        });
        
        // คำนวณ level ใหม่
        let newLevel = user.level;
        if (levelChange === 'increase' && user.level < 100) {
          newLevel = user.level + 1;
        } else if (levelChange === 'decrease' && user.level > 1) {
          newLevel = user.level - 1;
        }
        
        // คำนวณ EXP (ตอบถูก 1 ข้อ = 10 EXP + bonus)
        const baseExp = finalScore * 10;
        const bonusExp = percentage >= 85 ? 50 : percentage >= 70 ? 30 : 0;
        const highScoreBonus = isNewHighScore ? 100 : 0; // โบนัสพิเศษถ้าทำ high score ใหม่
        const totalExp = baseExp + bonusExp + highScoreBonus;
        
        // คำนวณคะแนนรวมที่ถูกต้อง (เพิ่มเฉพาะส่วนต่าง)
        const newTotalScore = user.totalScore + scoreDiff;
        
        // อัปเดต level scores
        const levelScores = user.levelScores || {};
        const levelKey = user.level.toString();
        levelScores[levelKey] = {
          level: user.level,
          highScore: Math.max(finalScore, oldHighScore),
          lastPlayed: new Date().toISOString(),
          playCount: (levelScores[levelKey]?.playCount || 0) + 1
        };
        
        // อัปเดต user data
        await updateUserGameData(user.id, {
          level: newLevel,
          totalScore: newTotalScore,
          experience: user.experience + totalExp,
          lastPlayedAt: new Date().toISOString(),
          levelScores: levelScores
        });
        
        // อัปเดต local state
        setUser({
          ...user,
          level: newLevel,
          totalScore: newTotalScore,
          experience: user.experience + totalExp,
          levelScores: levelScores
        });
        
        // อัปเดต temp score ให้ตรงกับที่บันทึก
        setTempTotalScore(newTotalScore);
        
        // คำนวณเวลาที่ใช้
        const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
        
        // Redirect ไปหน้า summary พร้อมข้อมูล
        const params = new URLSearchParams({
          score: finalScore.toString(),
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

  // Calculate score percentage
  const getScorePercentage = () => {
    return Math.round((score / totalQuestions) * 100);
  };

  // Get level change message using config
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

  if (loading) {
    return (
      <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-30"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl relative z-10"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metaverse-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      {user && <GameHeader user={{ ...user, totalScore: tempTotalScore }} />}
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {/* Ready State */}
          {gameState === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="glass-dark rounded-3xl shadow-2xl p-12 border border-metaverse-purple/30">
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
                  className="inline-block mb-6"
                >
                  <Sparkles className="w-20 h-20 text-metaverse-purple filter drop-shadow-[0_0_30px_rgba(147,51,234,0.5)]" />
                </motion.div>
                
                <h1 className="text-4xl font-bold text-white mb-4">
                  พร้อมเริ่มการผจญภัยหรือยัง?
                </h1>
                
                <div className="mb-8 space-y-2">
                  <p className="text-xl text-white/80">
                    <span className="font-medium">ระดับชั้น:</span>{' '}
                    <span className="text-metaverse-pink">{getGradeDisplayName(user?.grade || '')}</span>
                  </p>
                  <p className="text-xl text-white/80">
                    <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                      Level {user?.level}
                    </span>{' '}
                    <span className="text-white/60">
                      {user && getLevelDescription(user.grade, user.level)}
                    </span>
                  </p>
                  <p className="text-xl text-white/80">
                    <span className="font-medium">จำนวน:</span>{' '}
                    <span className="text-metaverse-glow">{totalQuestions} ข้อ</span>
                  </p>
                </div>
                <motion.button
                  onClick={startGame}
                  onMouseDown={() => playSound('click')}
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
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === 'playing' && currentQuestion && (
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
              
              <QuestionDisplay
                question={currentQuestion}
                questionNumber={questionNumber}
                onAnswer={handleAnswer}
              />
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
            {/* Warning Icon */}
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
                className="flex-1 py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl hover:bg-white/10 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                เล่นต่อ
              </motion.button>
              
              <motion.button
                onClick={() => {
                  playSound('click');
                  // รีเซ็ตคะแนนรวมชั่วคราว
                  setTempTotalScore(user?.totalScore || 0);
                  // กลับหน้าหลัก
                  router.push('/play');
                  // รีเซ็ต state
                  setGameState('ready');
                  setScore(0);
                  setQuestionNumber(0);
                  setAnswers([]);
                  setShowExitModal(false);
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