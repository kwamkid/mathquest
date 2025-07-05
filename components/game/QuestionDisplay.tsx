// components/game/QuestionDisplay.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/types';
import { useSound } from '@/lib/game/soundManager';
import { Check, X, Send } from 'lucide-react';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  onAnswer: (answer: number) => void;
}

export default function QuestionDisplay({ question, questionNumber, onAnswer }: QuestionDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { playSound } = useSound();

  const handleAnswerClick = (answer: number) => {
    if (showResult) return;
    
    playSound('click');
    setSelectedAnswer(answer);
    setShowResult(true);
    
    // Wait before moving to next question
    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setShowResult(false);
      setInputValue(''); // Reset input
    }, 1500);
  };

  // For multiple choice questions
  const renderMultipleChoice = () => {
    if (!question.choices) return null;

    return (
      <div className="grid grid-cols-2 gap-2 md:gap-4 mt-4 md:mt-8">
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
                className={`relative p-4 md:p-6 text-lg md:text-2xl font-bold rounded-xl md:rounded-2xl transition-all overflow-hidden ${
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
                {/* Background animation */}
                {(showCorrect || showWrong) && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                
                <span className="relative z-10">{choice}</span>
                
                {showCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 md:top-2 md:right-2"
                  >
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                  </motion.div>
                )}
                
                {showWrong && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 md:top-2 md:right-2"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
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
      <form onSubmit={handleSubmit} className="mt-4 md:mt-8">
        <div className="flex flex-col items-center gap-3 md:gap-4">
          <div className="relative w-full max-w-[200px]">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={showResult}
              className={`text-3xl md:text-4xl font-bold text-center w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md border-2 ${
                showResult
                  ? selectedAnswer === question.answer
                    ? 'border-green-400 text-green-400'
                    : 'border-red-400 text-red-400'
                  : 'border-metaverse-purple/50 focus:border-metaverse-pink text-white'
              } focus:outline-none transition-all`}
              placeholder="?"
              autoFocus
            />
            
            {/* Glow effect */}
            {!showResult && (
              <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-metaverse-purple/20 blur-xl -z-10" />
            )}
          </div>
          
          {!showResult && (
            <motion.button
              type="submit"
              onMouseDown={() => playSound('click')}
              className="px-6 md:px-8 py-3 md:py-4 metaverse-button text-white font-bold text-lg md:text-xl rounded-full shadow-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
              ตอบ
            </motion.button>
          )}
          
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xl md:text-2xl font-bold flex items-center gap-2"
            >
              {selectedAnswer === question.answer ? (
                <>
                  <Check className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
                  <span className="text-green-400">ถูกต้อง!</span>
                </>
              ) : (
                <>
                  <X className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
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
      className="glass-dark rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 border border-metaverse-purple/30 w-full"
    >
      {/* Question Number Badge - ปรับขนาดสำหรับ mobile */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-metaverse-purple to-metaverse-red rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg"
      >
        {questionNumber}
      </motion.div>

      {/* Question */}
      <div className="text-center">
        <motion.h2
          className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {question.question}
        </motion.h2>
        
        {/* Math symbols decoration - ซ่อนบน mobile */}
        <div className="hidden md:flex justify-center gap-4 mb-4">
          {['∞', 'π', '∑'].map((symbol, i) => (
            <motion.span
              key={i}
              className="text-metaverse-purple/20 text-2xl"
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              {symbol}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Answer Options */}
      {question.choices ? renderMultipleChoice() : renderFillIn()}
    </motion.div>
  );
}