'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User, Question } from '@/types';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import GameHeader from '@/components/game/GameHeader';
import GameProgress from '@/components/game/GameProgress';
import { generateQuestion } from '@/lib/game/questionGenerator';

export default function PlayPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result'>('ready');
  
  // Game session state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    question: Question;
    userAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>>([]);
  const [startTime, setStartTime] = useState<number>(0);

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

  // Get question count based on grade
  const getQuestionCount = (grade: string): number => {
    if (grade.startsWith('K')) return 10; // อนุบาล
    if (['P1', 'P2', 'P3'].includes(grade)) return 30; // ประถม 1-3
    if (['P4', 'P5', 'P6'].includes(grade)) return 40; // ประถม 4-6
    return 50; // มัธยม
  };

  // Start game
  const startGame = () => {
    setGameState('playing');
    setQuestionNumber(1);
    setScore(0);
    setAnswers([]);
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
    }
    
    // Check if game finished
    if (questionNumber >= totalQuestions) {
      endGame();
    } else {
      // Next question
      setQuestionNumber(questionNumber + 1);
      generateNewQuestion();
    }
  };

  // End game
  const endGame = () => {
    setGameState('result');
    // TODO: Save game session to Firebase
  };

  // Calculate score percentage
  const getScorePercentage = () => {
    return Math.round((score / totalQuestions) * 100);
  };

  // Get level change message
  const getLevelChangeMessage = () => {
    const percentage = getScorePercentage();
    if (percentage < 50) return { type: 'down', message: 'ระดับลดลง ⬇️' };
    if (percentage > 85) return { type: 'up', message: 'ระดับเพิ่มขึ้น ⬆️' };
    return { type: 'same', message: 'คงระดับเดิม ➡️' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {user && <GameHeader user={user} />}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              <div className="bg-white rounded-3xl shadow-xl p-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  พร้อมเริ่มการผจญภัยหรือยัง?
                </h1>
                <div className="mb-8 space-y-2">
                  <p className="text-xl text-gray-600">
                    <span className="font-medium">ระดับชั้น:</span> {getGradeDisplayName(user?.grade || '')}
                  </p>
                  <p className="text-xl text-gray-600">
                    <span className="font-medium">ระดับ:</span> {user?.level}
                  </p>
                  <p className="text-xl text-gray-600">
                    <span className="font-medium">จำนวนข้อ:</span> {totalQuestions} ข้อ
                  </p>
                </div>
                <motion.button
                  onClick={startGame}
                  className="px-12 py-6 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-2xl rounded-full shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  เริ่มเลย! 🚀
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

          {/* Result State */}
          {gameState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-white rounded-3xl shadow-xl p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-8xl mb-6"
                >
                  {getScorePercentage() >= 85 ? '🏆' : 
                   getScorePercentage() >= 50 ? '😊' : '😢'}
                </motion.div>

                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  เกมจบแล้ว!
                </h2>

                <div className="text-6xl font-bold text-red-600 mb-2">
                  {score}/{totalQuestions}
                </div>

                <div className="text-2xl text-gray-600 mb-6">
                  คะแนน {getScorePercentage()}%
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`text-xl font-bold mb-8 ${
                    getLevelChangeMessage().type === 'up' ? 'text-green-600' :
                    getLevelChangeMessage().type === 'down' ? 'text-red-600' :
                    'text-orange-600'
                  }`}
                >
                  {getLevelChangeMessage().message}
                </motion.div>

                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={startGame}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-xl rounded-full shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    เล่นอีกครั้ง
                  </motion.button>
                  
                  <motion.button
                    onClick={() => router.push('/ranking')}
                    className="px-8 py-4 bg-white border-2 border-red-500 text-red-500 font-bold text-xl rounded-full shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ดูอันดับ
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}