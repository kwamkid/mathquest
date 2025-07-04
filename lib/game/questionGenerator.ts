// lib/game/questionGenerator.ts
import { Question, QuestionType } from '@/types';

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

// Question generators by grade and level
export const generateQuestion = (grade: string, level: number): Question => {
  // Kindergarten (K1-K3)
  if (grade.startsWith('K')) {
    return generateKindergartenQuestion(grade, level);
  }
  
  // Primary 1-3
  if (['P1', 'P2', 'P3'].includes(grade)) {
    return generatePrimaryLowerQuestion(grade, level);
  }
  
  // Primary 4-6
  if (['P4', 'P5', 'P6'].includes(grade)) {
    return generatePrimaryUpperQuestion(grade, level);
  }
  
  // Secondary
  return generateSecondaryQuestion(grade, level);
};

// Kindergarten questions (อนุบาล)
const generateKindergartenQuestion = (grade: string, level: number): Question => {
  let a: number, b: number, answer: number, question: string;
  let type: QuestionType = QuestionType.ADDITION;
  
  if (level <= 30) {
    // Level 1-30: Count and basic addition (1-5)
    a = random(1, 5);
    b = random(1, 5);
    answer = a + b;
    question = `${a} + ${b} = ?`;
    type = QuestionType.ADDITION;
  } else if (level <= 60) {
    // Level 31-60: Addition and subtraction (1-10)
    a = random(1, 10);
    b = random(1, Math.min(a, 5));
    
    if (random(0, 1) === 0) {
      answer = a + b;
      question = `${a} + ${b} = ?`;
      type = QuestionType.ADDITION;
    } else {
      answer = a - b;
      question = `${a} - ${b} = ?`;
      type = QuestionType.SUBTRACTION;
    }
  } else {
    // Level 61-100: Larger numbers (1-20)
    a = random(5, 20);
    b = random(1, 10);
    
    if (random(0, 1) === 0) {
      answer = a + b;
      question = `${a} + ${b} = ?`;
      type = QuestionType.ADDITION;
    } else {
      answer = a - b;
      question = `${a} - ${b} = ?`;
      type = QuestionType.SUBTRACTION;
    }
  }
  
  return {
    id: generateId(),
    question,
    answer,
    choices: generateChoices(answer, 4),
    type,
    difficulty: level
  };
};

// Primary 1-3 questions (ประถม 1-3)
const generatePrimaryLowerQuestion = (grade: string, level: number): Question => {
  let a: number, b: number, answer: number, question: string;
  let type: QuestionType = QuestionType.ADDITION;
  let useChoices = true;
  
  if (level <= 20) {
    // Level 1-20: Addition/Subtraction (1-50)
    a = random(10, 50);
    b = random(5, 20);
    
    if (random(0, 1) === 0) {
      answer = a + b;
      question = `${a} + ${b} = ?`;
      type = QuestionType.ADDITION;
    } else {
      answer = a - b;
      question = `${a} - ${b} = ?`;
      type = QuestionType.SUBTRACTION;
    }
  } else if (level <= 40) {
    // Level 21-40: Addition/Subtraction (two digits)
    a = random(20, 99);
    b = random(10, 50);
    
    if (random(0, 1) === 0) {
      answer = a + b;
      question = `${a} + ${b} = ?`;
      type = QuestionType.ADDITION;
    } else {
      answer = a - b;
      question = `${a} - ${b} = ?`;
      type = QuestionType.SUBTRACTION;
    }
    useChoices = false; // Fill-in for harder questions
  } else if (level <= 60) {
    // Level 41-60: Introduction to multiplication (2, 3, 4)
    const tables = [2, 3, 4];
    a = tables[random(0, tables.length - 1)];
    b = random(1, 10);
    answer = a * b;
    question = `${a} × ${b} = ?`;
    type = QuestionType.MULTIPLICATION;
  } else if (level <= 80) {
    // Level 61-80: Multiplication tables (5-9)
    a = random(5, 9);
    b = random(1, 10);
    answer = a * b;
    question = `${a} × ${b} = ?`;
    type = QuestionType.MULTIPLICATION;
    useChoices = false;
  } else {
    // Level 81-100: Mixed operations
    const operation = random(0, 2);
    
    if (operation === 0) {
      // Addition (3 digits)
      a = random(100, 500);
      b = random(50, 200);
      answer = a + b;
      question = `${a} + ${b} = ?`;
      type = QuestionType.ADDITION;
    } else if (operation === 1) {
      // Subtraction (3 digits)
      a = random(200, 500);
      b = random(50, 150);
      answer = a - b;
      question = `${a} - ${b} = ?`;
      type = QuestionType.SUBTRACTION;
    } else {
      // Multiplication
      a = random(2, 12);
      b = random(2, 12);
      answer = a * b;
      question = `${a} × ${b} = ?`;
      type = QuestionType.MULTIPLICATION;
    }
    useChoices = false;
  }
  
  return {
    id: generateId(),
    question,
    answer,
    choices: useChoices ? generateChoices(answer, 4) : undefined,
    type,
    difficulty: level
  };
};

// Primary 4-6 questions (ประถม 4-6)
const generatePrimaryUpperQuestion = (grade: string, level: number): Question => {
  let a: number, b: number, c: number, answer: number, question: string;
  let type: QuestionType = QuestionType.MIXED;
  
  if (level <= 25) {
    // Level 1-25: Advanced multiplication
    a = random(10, 25);
    b = random(2, 12);
    answer = a * b;
    question = `${a} × ${b} = ?`;
    type = QuestionType.MULTIPLICATION;
  } else if (level <= 50) {
    // Level 26-50: Division
    b = random(2, 12);
    answer = random(2, 20);
    a = b * answer;
    question = `${a} ÷ ${b} = ?`;
    type = QuestionType.DIVISION;
  } else if (level <= 75) {
    // Level 51-75: Mixed operations with parentheses
    a = random(10, 50);
    b = random(5, 20);
    c = random(2, 10);
    
    const operation = random(0, 3);
    if (operation === 0) {
      answer = (a + b) * c;
      question = `(${a} + ${b}) × ${c} = ?`;
    } else if (operation === 1) {
      answer = a + (b * c);
      question = `${a} + (${b} × ${c}) = ?`;
    } else if (operation === 2) {
      answer = (a - b) * c;
      question = `(${a} - ${b}) × ${c} = ?`;
    } else {
      answer = a - (b * c);
      question = `${a} - (${b} × ${c}) = ?`;
    }
    type = QuestionType.MIXED;
  } else {
    // Level 76-100: Word problems
    const problems = [
      {
        template: 'ร้านค้ามีสินค้า A ชิ้น ขายไป B ชิ้น เหลือกี่ชิ้น?',
        generate: () => {
          const a = random(100, 500);
          const b = random(50, Math.floor(a * 0.8));
          return {
            question: `ร้านค้ามีสินค้า ${a} ชิ้น ขายไป ${b} ชิ้น เหลือกี่ชิ้น?`,
            answer: a - b
          };
        }
      },
      {
        template: 'นักเรียน A คน แบ่งเป็น B กลุ่มเท่าๆ กัน กลุ่มละกี่คน?',
        generate: () => {
          const b = random(3, 8);
          const perGroup = random(4, 12);
          const a = b * perGroup;
          return {
            question: `นักเรียน ${a} คน แบ่งเป็น ${b} กลุ่มเท่าๆ กัน กลุ่มละกี่คน?`,
            answer: perGroup
          };
        }
      }
    ];
    
    const problem = problems[random(0, problems.length - 1)].generate();
    question = problem.question;
    answer = problem.answer;
    type = QuestionType.WORD_PROBLEM;
  }
  
  return {
    id: generateId(),
    question,
    answer,
    choices: undefined, // No multiple choice for upper primary
    type,
    difficulty: level
  };
};

// Secondary questions (มัธยม)
const generateSecondaryQuestion = (grade: string, level: number): Question => {
  // Similar structure but with more complex problems
  // Including fractions, decimals, algebra, etc.
  
  // For now, return advanced arithmetic
  const a = random(50, 999);
  const b = random(50, 999);
  const answer = a + b;
  
  return {
    id: generateId(),
    question: `${a} + ${b} = ?`,
    answer,
    choices: undefined,
    type: QuestionType.ADDITION,
    difficulty: level
  };
};