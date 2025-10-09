// components/game/QuestionDisplay.tsx
'use client';

import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/types';
import { useSound } from '@/lib/game/soundManager';
import { Check, X, Send } from 'lucide-react';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  onAnswer: (answer: number) => void;
}

function QuestionDisplay({ question, questionNumber, onAnswer }: QuestionDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { playSound } = useSound();

  // ✅ Handle answer click with faster transition
  const handleAnswerClick = useCallback((answer: number) => {
    if (showResult) return;
    
    playSound('click');
    setSelectedAnswer(answer);
    setShowResult(true);
    
    // ✅ แก้ไข: ลด delay เป็น 600ms
    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setShowResult(false);
      setInputValue('');
    }, 600);
  }, [showResult, playSound, onAnswer]);

  // For multiple choice questions
  const renderMultipleChoice = () => {
    if (!question.choices) return null;

    return (
      <div className="grid grid-cols-2 gap-4 mt-8">
        <AnimatePresence>
          {question.choices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;
            const isCorrect = choice === question.answer;
            const showCorrect = showResult && isCorrect;
            const showWrong = showResult && isSelected && !isCorrect;

            return (
              <motion.button
                key={index}
                onClick={() => handleAnswerClick(choice)}
                disabled={showResult}
                className={`relative p-6 text-2xl font-bold rounded-2xl transition-all overflow-hidden ${
                  showCorrect
                    ? 'bg-green-500/20 border-2 border-green-400 text-green-400'
                    : showWrong
                    ? 'bg-red-500/20 border-2 border-red-400 text-red-400'
                    : isSelected
                    ? 'bg-metaverse-purple/30 border-2 border-metaverse-purple text-white'
                    : 'glass-dark border border-metaverse-purple/30 text-white hover:border-metaverse-purple/60 hover:bg-white/5'
                }`}
                whileHover={!showResult ? { scale: 1.05 } : {}}
                whileTap={!showResult ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="relative z-10">{choice}</span>
                
                {showCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <Check className="w-6 h-6 text-green-400" />
                  </motion.div>
                )}
                
                {showWrong && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-6 h-6 text-red-400" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  // For fill-in questions
  const renderFillIn = () => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const answer = parseInt(inputValue);
      if (!isNaN(answer)) {
        handleAnswerClick(answer);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={showResult}
              className={`text-4xl font-bold text-center w-48 p-4 rounded-2xl bg-white/10 backdrop-blur-md border-2 ${
                showResult
                  ? selectedAnswer === question.answer
                    ? 'border-green-400 text-green-400'
                    : 'border-red-400 text-red-400'
                  : 'border-metaverse-purple/50 focus:border-metaverse-pink text-white'
              } focus:outline-none transition-all`}
              placeholder="?"
              autoFocus
            />
            
            {/* ✅ ลด glow effect */}
            {!showResult && (
              <div className="absolute inset-0 rounded-2xl bg-metaverse-purple/10 blur-xl -z-10" />
            )}
          </div>
          
          {!showResult && (
            <motion.button
              type="submit"
              onMouseDown={() => playSound('click')}
              className="px-8 py-4 metaverse-button text-white font-bold text-xl rounded-full shadow-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
              ตอบ
            </motion.button>
          )}
          
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-2xl font-bold flex items-center gap-2"
            >
              {selectedAnswer === question.answer ? (
                <>
                  <Check className="w-8 h-8 text-green-400" />
                  <span className="text-green-400">ถูกต้อง!</span>
                </>
              ) : (
                <>
                  <X className="w-8 h-8 text-red-400" />
                  <span className="text-red-400">ตอบ: {question.answer}</span>
                </>
              )}
            </motion.div>
          )}
        </div>
      </form>
    );
  };

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="glass-dark rounded-3xl shadow-xl p-8 border border-metaverse-purple/30"
    >
      {/* Question Number Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-metaverse-purple to-metaverse-red rounded-full flex items-center justify-center text-white font-bold shadow-lg"
      >
        {questionNumber}
      </motion.div>

      {/* Question */}
      <div className="text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {question.question}
        </motion.h2>
      </div>

      {/* Answer Options */}
      {question.choices ? renderMultipleChoice() : renderFillIn()}
    </motion.div>
  );
}

// ✅ เพิ่ม React.memo
export default memo(QuestionDisplay);