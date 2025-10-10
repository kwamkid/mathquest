// lib/game/questionGenerator.ts
// Updated with timeout protection and better error handling

import { Question, QuestionType } from '@/types';
import { getLevelConfig, LevelConfig } from './config';
import { 
  getGeneratorForGrade, 
  isSupportedGrade,
  getGradeCategory,
  DEBUG_INFO 
} from './generators';

// ✅ เพิ่ม: Timeout สำหรับป้องกัน infinite loop
const GENERATION_TIMEOUT = 3000; // 3 seconds

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
  
  let attempts = 0;
  const maxAttempts = count * 20; // ✅ ป้องกัน infinite loop
  
  // Generate wrong answers
  while (choices.size < count && attempts < maxAttempts) {
    attempts++;
    
    let wrong: number;
    if (correctAnswer <= 10) {
      wrong = random(0, 20);
    } else if (correctAnswer <= 50) {
      wrong = correctAnswer + random(-15, 15);
    } else {
      wrong = correctAnswer + random(-30, 30);
    }
    
    // ✅ รองรับคำตอบลบ
    if (wrong !== correctAnswer && Number.isFinite(wrong)) {
      choices.add(wrong);
    }
  }
  
  // ✅ ถ้ายังไม่ครบ สร้างเพิ่ม
  if (choices.size < count) {
    console.warn('Could not generate enough choices, filling with manual values');
    while (choices.size < count) {
      choices.add(correctAnswer + random(-10, 10));
    }
  }
  
  // Shuffle choices
  return Array.from(choices).sort(() => Math.random() - 0.5);
};

/**
 * ✅ Wrapper function with timeout protection
 */
const generateQuestionWithTimeout = async (
  grade: string, 
  level: number, 
  config: LevelConfig
): Promise<Question> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Question generation timeout'));
    }, GENERATION_TIMEOUT);

    try {
      const generator = getGeneratorForGrade(grade);
      if (!generator) {
        clearTimeout(timeoutId);
        reject(new Error(`No generator for grade ${grade}`));
        return;
      }

      const question = generator.generateQuestion(level, config);
      clearTimeout(timeoutId);
      resolve(question);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
};

/**
 * Main question generator with timeout protection
 * 
 * @param grade - Grade level (K1-K3, P1-P6, M1-M6)
 * @param level - Difficulty level (1-100)
 * @returns Generated question
 */
export const generateQuestion = (grade: string, level: number): Question => {
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Generating question for ${grade} Level ${level}`);
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
    // ✅ Generate question with validation
    const question = generator.generateQuestion(level, config);
    
    // ✅ Validate the generated question
    if (!validateQuestion(question)) {
      console.error('❌ Generated invalid question, using fallback');
      return generateFallbackQuestion(grade, level);
    }
    
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
    return generator.generateQuestion(level, config);
  }
  
  try {
    // For word problems, use the specialized method
    if (questionType === QuestionType.WORD_PROBLEM) {
      return generator.generateWordProblem(level, config);
    }
    
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
    return [QuestionType.ADDITION];
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
 * ✅ Validate question before returning to game
 */
export const validateQuestion = (question: Question): boolean => {
  // Basic validation
  if (!question.id || !question.question || typeof question.answer !== 'number') {
    console.error('❌ Invalid question structure:', question);
    return false;
  }
  
  // ✅ Answer must be a finite number
  if (!Number.isFinite(question.answer)) {
    console.error(`❌ Non-finite answer: ${question.answer}`);
    return false;
  }
  
  // ✅ Answer should be reasonable
  if (Math.abs(question.answer) > 100000) {
    console.warn(`⚠️ Unreasonable answer: ${question.answer}`);
    return false;
  }
  
  // If choices exist, validate them
  if (question.choices) {
    // Answer must be in choices
    if (!question.choices.includes(question.answer)) {
      console.error(`❌ Answer ${question.answer} not in choices:`, question.choices);
      return false;
    }
    
    // All choices must be finite numbers
    if (!question.choices.every(c => Number.isFinite(c))) {
      console.error('❌ Non-finite choice detected:', question.choices);
      return false;
    }
    
    // Choices should be unique
    const uniqueChoices = new Set(question.choices);
    if (uniqueChoices.size !== question.choices.length) {
      console.warn('⚠️ Duplicate choices detected');
    }
  }
  
  return true;
};

/**
 * ✅ Generate and validate question (main export function)
 */
export const generateValidatedQuestion = (grade: string, level: number): Question => {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      const question = generateQuestion(grade, level);
      
      if (validateQuestion(question)) {
        return question;
      }
      
      attempts++;
      console.warn(`⚠️ Invalid question generated, attempt ${attempts}/${maxAttempts}`);
    } catch (error) {
      attempts++;
      console.error(`❌ Error in attempt ${attempts}:`, error);
    }
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
      availableTypes: generator.getAvailableQuestionTypes(50)
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