'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Question } from '@/types';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  onAnswer: (answer: number) => void;
}

export default function QuestionDisplay({ question, questionNumber, onAnswer }: QuestionDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleAnswerClick = (answer: number) => {
    if (showResult) return;
    
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
      <div className="grid grid-cols-2 gap-4 mt-8">
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
              className={`p-6 text-2xl font-bold rounded-2xl transition-all ${
                showCorrect
                  ? 'bg-green-500 text-white'
                  : showWrong
                  ? 'bg-red-500 text-white'
                  : isSelected
                  ? 'bg-orange-200'
                  : 'bg-white hover:bg-gray-100 shadow-md hover:shadow-lg'
              }`}
              whileHover={!showResult ? { scale: 1.05 } : {}}
              whileTap={!showResult ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {choice}
            </motion.button>
          );
        })}
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
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={showResult}
            className={`text-4xl font-bold text-center w-48 p-4 rounded-2xl border-4 ${
              showResult
                ? selectedAnswer === question.answer
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-300 focus:border-red-500'
            } focus:outline-none transition-all`}
            placeholder="?"
            autoFocus
          />
          
          {!showResult && (
            <motion.button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-xl rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ตอบ
            </motion.button>
          )}
          
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-2xl font-bold"
            >
              {selectedAnswer === question.answer ? (
                <span className="text-green-600">✓ ถูกต้อง!</span>
              ) : (
                <span className="text-red-600">✗ ตอบ: {question.answer}</span>
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
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      {/* Question */}
      <div className="text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-8"
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