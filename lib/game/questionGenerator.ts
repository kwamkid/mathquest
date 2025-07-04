// lib/game/questionGenerator.ts
import { Question, QuestionType } from '@/types';
import { getLevelConfig, LevelConfig } from './config';

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

// Main question generator using config
export const generateQuestion = (grade: string, level: number): Question => {
  const config = getLevelConfig(grade, level);
  
  if (!config) {
    // Fallback if no config found
    return generateFallbackQuestion(grade, level);
  }
  
  // Select random question type from available types
  const questionType = config.questionTypes[random(0, config.questionTypes.length - 1)];
  
  // Generate question based on type and config
  switch (questionType) {
    case QuestionType.ADDITION:
      return generateAdditionQuestion(config, level);
    case QuestionType.SUBTRACTION:
      return generateSubtractionQuestion(config, level);
    case QuestionType.MULTIPLICATION:
      return generateMultiplicationQuestion(config, level);
    case QuestionType.DIVISION:
      return generateDivisionQuestion(config, level);
    case QuestionType.WORD_PROBLEM:
      return generateWordProblem(config, level, grade);
    case QuestionType.MIXED:
      return generateMixedQuestion(config, level, grade);
    default:
      return generateFallbackQuestion(grade, level);
  }
};

// Addition questions
const generateAdditionQuestion = (config: LevelConfig, level: number): Question => {
  const { min, max } = config.numberRange;
  
  let a = random(min, max);
  let b = random(min, max);
  
  // Special handling for features
  if (config.features?.includes('noCarrying')) {
    // Ensure no carrying (for 2-digit addition)
    const aOnes = a % 10;
    const bOnes = b % 10;
    if (aOnes + bOnes >= 10) {
      b = b - (aOnes + bOnes - 9);
    }
  }
  
  const answer = a + b;
  const question = `${a} + ${b} = ?`;
  
  return {
    id: generateId(),
    question,
    answer,
    choices: config.features?.includes('visualAids') ? undefined : generateChoices(answer),
    type: QuestionType.ADDITION,
    difficulty: level
  };
};

// Subtraction questions
const generateSubtractionQuestion = (config: LevelConfig, level: number): Question => {
  const { min, max } = config.numberRange;
  
  let a = random(Math.max(min, 5), max);
  let b = random(min, Math.min(a, max));
  
  // Ensure non-negative result
  if (b > a) {
    [a, b] = [b, a];
  }
  
  const answer = a - b;
  const question = `${a} - ${b} = ?`;
  
  return {
    id: generateId(),
    question,
    answer,
    choices: generateChoices(answer),
    type: QuestionType.SUBTRACTION,
    difficulty: level
  };
};

// Multiplication questions
const generateMultiplicationQuestion = (config: LevelConfig, level: number): Question => {
  let a: number, b: number;
  
  if (config.features?.includes('multiplicationTables')) {
    // Specific multiplication tables
    if (config.features.includes('tables_2_5_10')) {
      const tables = [2, 5, 10];
      a = tables[random(0, tables.length - 1)];
      b = random(config.numberRange.min, config.numberRange.max);
    } else if (config.features.includes('tables_3_4')) {
      const tables = [3, 4];
      a = tables[random(0, tables.length - 1)];
      b = random(config.numberRange.min, config.numberRange.max);
    } else if (config.features.includes('tables_2_to_5')) {
      a = random(2, 5);
      b = random(config.numberRange.min, config.numberRange.max);
    } else if (config.features.includes('tables_6_to_9')) {
      a = random(6, 9);
      b = random(config.numberRange.min, config.numberRange.max);
    } else {
      a = random(2, 12);
      b = random(config.numberRange.min, config.numberRange.max);
    }
  } else {
    // General multiplication
    const { min, max } = config.numberRange;
    a = random(min, max);
    b = random(2, 12);
  }
  
  const answer = a * b;
  const question = `${a} × ${b} = ?`;
  
  return {
    id: generateId(),
    question,
    answer,
    choices: level <= 60 ? generateChoices(answer) : undefined,
    type: QuestionType.MULTIPLICATION,
    difficulty: level
  };
};

// Division questions
const generateDivisionQuestion = (config: LevelConfig, level: number): Question => {
  const { min, max } = config.numberRange;
  
  const divisor = random(min, max);
  const quotient = random(2, 12);
  const dividend = divisor * quotient;
  
  const answer = quotient;
  const question = `${dividend} ÷ ${divisor} = ?`;
  
  return {
    id: generateId(),
    question,
    answer,
    choices: config.features?.includes('basicDivision') ? generateChoices(answer) : undefined,
    type: QuestionType.DIVISION,
    difficulty: level
  };
};

// Word problems
const generateWordProblem = (config: LevelConfig, level: number, grade: string): Question => {
  const { min, max } = config.numberRange;
  
  // Simple word problems for lower grades
  if (grade.startsWith('P') && parseInt(grade.substring(1)) <= 3) {
    const problems = [
      {
        generate: () => {
          const a = random(min, max);
          const b = random(min, Math.min(max, 30));
          return {
            question: `แม่มีเงิน ${a} บาท ซื้อของไป ${b} บาท เหลือเงินกี่บาท?`,
            answer: a - b
          };
        }
      },
      {
        generate: () => {
          const a = random(min, max);
          const b = random(min, max);
          return {
            question: `มีแอปเปิ้ล ${a} ผล และส้ม ${b} ผล รวมมีผลไม้กี่ผล?`,
            answer: a + b
          };
        }
      },
      {
        generate: () => {
          const boxes = random(2, 5);
          const perBox = random(min, max);
          return {
            question: `มีกล่องทั้งหมด ${boxes} กล่อง แต่ละกล่องมีลูกบอล ${perBox} ลูก รวมมีลูกบอลกี่ลูก?`,
            answer: boxes * perBox
          };
        }
      }
    ];
    
    const problem = problems[random(0, problems.length - 1)].generate();
    return {
      id: generateId(),
      question: problem.question,
      answer: problem.answer,
      choices: undefined,
      type: QuestionType.WORD_PROBLEM,
      difficulty: level
    };
  }
  
  // Complex word problems for higher grades
  if (config.features?.includes('multiStepProblems')) {
    const problems = [
      {
        generate: () => {
          const students = random(20, 40);
          const busCapacity = random(10, 15);
          const buses = Math.ceil(students / busCapacity);
          return {
            question: `โรงเรียนมีนักเรียน ${students} คน รถบัสคันหนึ่งนั่งได้ ${busCapacity} คน ต้องใช้รถบัสอย่างน้อยกี่คัน?`,
            answer: buses
          };
        }
      },
      {
        generate: () => {
          const total = random(500, 1000);
          const spent1 = random(100, 300);
          const spent2 = random(50, 200);
          return {
            question: `พ่อมีเงิน ${total} บาท ซื้อของใช้ ${spent1} บาท และซื้ออาหาร ${spent2} บาท เหลือเงินกี่บาท?`,
            answer: total - spent1 - spent2
          };
        }
      }
    ];
    
    const problem = problems[random(0, problems.length - 1)].generate();
    return {
      id: generateId(),
      question: problem.question,
      answer: problem.answer,
      choices: undefined,
      type: QuestionType.WORD_PROBLEM,
      difficulty: level
    };
  }
  
  // Default word problem
  const a = random(min, max);
  const b = random(min, Math.min(max, a));
  return {
    id: generateId(),
    question: `มีของทั้งหมด ${a} ชิ้น ให้เพื่อนไป ${b} ชิ้น เหลือกี่ชิ้น?`,
    answer: a - b,
    choices: undefined,
    type: QuestionType.WORD_PROBLEM,
    difficulty: level
  };
};

// Mixed questions (parentheses, fractions, etc.)
const generateMixedQuestion = (config: LevelConfig, level: number, grade: string): Question => {
  const { min, max } = config.numberRange;
  
  // Questions with parentheses
  if (config.features?.includes('parentheses')) {
    const a = random(min, max);
    const b = random(min, Math.min(max, 20));
    const c = random(2, 10);
    
    const operation = random(0, 3);
    let question: string;
    let answer: number;
    
    switch (operation) {
      case 0:
        answer = (a + b) * c;
        question = `(${a} + ${b}) × ${c} = ?`;
        break;
      case 1:
        answer = a + (b * c);
        question = `${a} + (${b} × ${c}) = ?`;
        break;
      case 2:
        answer = (a - b) * c;
        question = `(${a} - ${b}) × ${c} = ?`;
        break;
      default:
        answer = a - (b * c);
        question = `${a} - (${b} × ${c}) = ?`;
    }
    
    return {
      id: generateId(),
      question,
      answer,
      choices: undefined,
      type: QuestionType.MIXED,
      difficulty: level
    };
  }
  
  // Fractions
  if (config.features?.includes('fractions')) {
    const a = random(1, 9);
    const b = random(2, 10);
    const c = random(1, 9);
    const d = b; // Same denominator for simplicity
    
    const answer = a + c;
    const question = `${a}/${b} + ${c}/${d} = ?/${b}`;
    
    return {
      id: generateId(),
      question,
      answer,
      choices: undefined,
      type: QuestionType.MIXED,
      difficulty: level
    };
  }
  
  // Decimals
  if (config.features?.includes('decimals')) {
    const a = random(1, 99) / 10;
    const b = random(1, 99) / 10;
    const answer = Math.round((a + b) * 10) / 10;
    
    return {
      id: generateId(),
      question: `${a} + ${b} = ?`,
      answer,
      choices: undefined,
      type: QuestionType.MIXED,
      difficulty: level
    };
  }
  
  // Integers (positive and negative)
  if (config.features?.includes('integers')) {
    const a = random(min, max);
    const b = random(min, max);
    const operation = random(0, 1);
    
    let answer: number;
    let question: string;
    
    if (operation === 0) {
      answer = a + b;
      question = `${a} + (${b}) = ?`;
    } else {
      answer = a - b;
      question = `${a} - (${b}) = ?`;
    }
    
    return {
      id: generateId(),
      question,
      answer,
      choices: undefined,
      type: QuestionType.MIXED,
      difficulty: level
    };
  }
  
  // Algebra
  if (config.features?.includes('algebra') || config.features?.includes('linearEquations')) {
    const a = random(2, 10);
    const b = random(5, 20);
    const answer = b - a;
    
    return {
      id: generateId(),
      question: `x + ${a} = ${b}, x = ?`,
      answer,
      choices: undefined,
      type: QuestionType.MIXED,
      difficulty: level
    };
  }
  
  // Default mixed question
  const a = random(min, max);
  const b = random(min, max);
  const answer = a + b;
  
  return {
    id: generateId(),
    question: `${a} + ${b} = ?`,
    answer,
    choices: generateChoices(answer),
    type: QuestionType.MIXED,
    difficulty: level
  };
};

// Fallback question generator (when no config available)
const generateFallbackQuestion = (grade: string, level: number): Question => {
  const a = random(1, 50);
  const b = random(1, 50);
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