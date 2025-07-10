// lib/game/questionGenerator.ts
// Updated to use new generator system

import { Question, QuestionType } from '@/types';
import { getLevelConfig, LevelConfig } from './config';
import { 
  getGeneratorForGrade, 
  isSupportedGrade,
  getGradeCategory,
  DEBUG_INFO 
} from './generators';

// Generate unique ID for question
const generateId = () => {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Random number in range
const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate wrong choices for multiple choice
const generateChoices = (correctAnswer: number, count: number = 4): number[] => {
  const choices = new Set<number>([correctAnswer]);
  
  // Generate wrong answers
  while (choices.size < count) {
    let wrong: number;
    if (correctAnswer <= 10) {
      wrong = random(0, 20);
    } else if (correctAnswer <= 50) {
      wrong = correctAnswer + random(-15, 15);
    } else {
      wrong = correctAnswer + random(-30, 30);
    }
    
    if (wrong >= 0 && wrong !== correctAnswer) {
      choices.add(wrong);
    }
  }
  
  // Shuffle choices
  return Array.from(choices).sort(() => Math.random() - 0.5);
};

/**
 * Main question generator using new generator system
 * 
 * @param grade - Grade level (K1-K3, P1-P6, M1-M6)
 * @param level - Difficulty level (1-100)
 * @returns Generated question
 */
export const generateQuestion = (grade: string, level: number): Question => {
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Generating question for ${grade} Level ${level}`);
    console.log(`📊 Generator status:`, DEBUG_INFO);
  }
  
  // Get level configuration
  const config = getLevelConfig(grade, level);
  if (!config) {
    console.warn(`⚠️ No config found for ${grade} Level ${level}, using fallback`);
    return generateFallbackQuestion(grade, level);
  }
  
  // Check if grade is supported
  if (!isSupportedGrade(grade)) {
    console.warn(`⚠️ Grade ${grade} not supported yet, using fallback`);
    return generateFallbackQuestion(grade, level);
  }
  
  // Get generator for grade
  const generator = getGeneratorForGrade(grade);
  if (!generator) {
    console.error(`❌ No generator found for grade ${grade}`);
    return generateFallbackQuestion(grade, level);
  }
  
  // Validate level
  if (!generator.supportsLevel(level)) {
    console.warn(`⚠️ Level ${level} not supported for ${grade}, adjusting to valid range`);
    const adjustedLevel = Math.max(1, Math.min(100, level));
    return generator.generateQuestion(adjustedLevel, config);
  }
  
  try {
    // Generate question using grade-specific generator
    const question = generator.generateQuestion(level, config);
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Generated ${question.type} question:`, question.question);
      console.log(`📝 Answer:`, question.answer);
    }
    
    return question;
  } catch (error) {
    console.error(`❌ Error generating question for ${grade} Level ${level}:`, error);
    return generateFallbackQuestion(grade, level);
  }
};

/**
 * Generate specific type of question
 */
export const generateQuestionOfType = (
  grade: string, 
  level: number, 
  questionType: QuestionType
): Question => {
  const config = getLevelConfig(grade, level);
  if (!config) {
    return generateFallbackQuestion(grade, level);
  }
  
  const generator = getGeneratorForGrade(grade);
  if (!generator) {
    return generateFallbackQuestion(grade, level);
  }
  
  // Check if this question type is available for this level
  const availableTypes = generator.getAvailableQuestionTypes(level);
  if (!availableTypes.includes(questionType)) {
    console.warn(`⚠️ Question type ${questionType} not available for ${grade} Level ${level}`);
    // Return a question of an available type instead
    return generator.generateQuestion(level, config);
  }
  
  try {
    // For word problems, use the specialized method
    if (questionType === QuestionType.WORD_PROBLEM) {
      return generator.generateWordProblem(level, config);
    }
    
    // For other types, generate normally and hope we get the right type
    // (This could be improved by adding type-specific methods to the interface)
    return generator.generateQuestion(level, config);
  } catch (error) {
    console.error(`❌ Error generating ${questionType} question:`, error);
    return generateFallbackQuestion(grade, level);
  }
};

/**
 * Get available question types for grade and level
 */
export const getAvailableQuestionTypes = (grade: string, level: number): QuestionType[] => {
  const generator = getGeneratorForGrade(grade);
  if (!generator) {
    return [QuestionType.ADDITION]; // Default fallback
  }
  
  return generator.getAvailableQuestionTypes(level);
};

/**
 * Fallback question generator for unsupported grades or errors
 */
const generateFallbackQuestion = (grade: string, level: number): Question => {
  console.log(`🔄 Using fallback generator for ${grade} Level ${level}`);
  
  // Simple addition question as fallback
  const maxNumber = Math.min(level * 2, 50);
  const a = random(1, maxNumber);
  const b = random(1, maxNumber);
  const answer = a + b;
  
  return {
    id: generateId(),
    question: `${a} + ${b} = ?`,
    answer,
    choices: generateChoices(answer),
    type: QuestionType.ADDITION,
    difficulty: level
  };
};

/**
 * Validate question before returning to game
 */
export const validateQuestion = (question: Question): boolean => {
  // Basic validation
  if (!question.id || !question.question || typeof question.answer !== 'number') {
    return false;
  }
  
  // Answer should be a reasonable number
  if (question.answer < 0 || question.answer > 100000) {
    console.warn(`⚠️ Unreasonable answer: ${question.answer}`);
    return false;
  }
  
  // If choices exist, answer should be in choices
  if (question.choices && !question.choices.includes(question.answer)) {
    console.warn(`⚠️ Answer not in choices:`, question);
    return false;
  }
  
  return true;
};

/**
 * Generate and validate question (main export function)
 */
export const generateValidatedQuestion = (grade: string, level: number): Question => {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    const question = generateQuestion(grade, level);
    
    if (validateQuestion(question)) {
      return question;
    }
    
    attempts++;
    console.warn(`⚠️ Invalid question generated, attempt ${attempts}/${maxAttempts}`);
  }
  
  // If all attempts fail, return a simple fallback
  console.error(`❌ Failed to generate valid question after ${maxAttempts} attempts`);
  return generateFallbackQuestion(grade, level);
};

// Export for backward compatibility
export { generateQuestion as default };

// Export debug utilities for development
export const debugUtils = {
  getSupportedGrades: () => DEBUG_INFO.implementedGrades,
  getPendingGrades: () => DEBUG_INFO.pendingGrades,
  getGeneratorInfo: (grade: string) => {
    const generator = getGeneratorForGrade(grade);
    if (!generator) return null;
    
    return {
      grade,
      category: getGradeCategory(grade),
      supportsLevels: '1-100',
      availableTypes: generator.getAvailableQuestionTypes(50) // Sample at level 50
    };
  },
  testGeneration: (grade: string, level: number = 50) => {
    try {
      const question = generateQuestion(grade, level);
      return {
        success: true,
        question,
        isValid: validateQuestion(question)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};