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
    // Level 1-30: นับเลขและบวกง่ายๆ (1-5)
    a = random(1, 3);
    b = random(1, 2);
    answer = a + b;
    question = `${a} + ${b} = ?`;
    type = QuestionType.ADDITION;
  } else if (level <= 60) {
    // Level 31-60: บวกเลข (1-10)
    a = random(1, 5);
    b = random(1, 5);
    answer = a + b;
    question = `${a} + ${b} = ?`;
    type = QuestionType.ADDITION;
  } else {
    // Level 61-100: บวกลบเบื้องต้น (ผลลัพธ์ไม่เกิน 10)
    a = random(5, 10);
    b = random(1, Math.min(5, a));
    
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
  
  if (grade === 'P1') {
    // ประถม 1
    if (level <= 25) {
      // Level 1-25: บวกเลขหลักเดียว
      a = random(1, 9);
      b = random(1, 9);
      answer = a + b;
      question = `${a} + ${b} = ?`;
      type = QuestionType.ADDITION;
    } else if (level <= 50) {
      // Level 26-50: ลบเลขหลักเดียว (ไม่ติดลบ)
      a = random(5, 10);
      b = random(1, a);
      answer = a - b;
      question = `${a} - ${b} = ?`;
      type = QuestionType.SUBTRACTION;
    } else if (level <= 75) {
      // Level 51-75: บวกเลข 2 หลักกับ 1 หลัก
      a = random(10, 20);
      b = random(1, 9);
      answer = a + b;
      question = `${a} + ${b} = ?`;
      type = QuestionType.ADDITION;
    } else {
      // Level 76-100: บวกลบผสม (ไม่เกิน 20)
      a = random(10, 20);
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
  } else if (grade === 'P2') {
    // ประถม 2
    if (level <= 20) {
      // Level 1-20: บวกเลข 2 หลัก (ไม่ทด)
      a = random(10, 40);
      b = random(10, 40);
      answer = a + b;
      question = `${a} + ${b} = ?`;
      type = QuestionType.ADDITION;
    } else if (level <= 40) {
      // Level 21-40: ลบเลข 2 หลัก (ไม่ติดลบ)
      a = random(20, 50);
      b = random(10, Math.min(30, a));
      answer = a - b;
      question = `${a} - ${b} = ?`;
      type = QuestionType.SUBTRACTION;
    } else if (level <= 60) {
      // Level 41-60: สูตรคูณแม่ 2, 5, 10
      const tables = [2, 5, 10];
      a = tables[random(0, tables.length - 1)];
      b = random(1, 10);
      answer = a * b;
      question = `${a} × ${b} = ?`;
      type = QuestionType.MULTIPLICATION;
    } else if (level <= 80) {
      // Level 61-80: สูตรคูณแม่ 3, 4
      const tables = [3, 4];
      a = tables[random(0, tables.length - 1)];
      b = random(1, 10);
      answer = a * b;
      question = `${a} × ${b} = ?`;
      type = QuestionType.MULTIPLICATION;
      useChoices = false;
    } else {
      // Level 81-100: บวกลบเลข 2 หลัก (มีการทด)
      a = random(25, 70);
      b = random(15, 50);
      
      if (random(0, 1) === 0) {
        answer = a + b;
        question = `${a} + ${b} = ?`;
        type = QuestionType.ADDITION;
      } else {
        // ทำให้แน่ใจว่าไม่ติดลบ
        if (b > a) {
          [a, b] = [b, a];
        }
        answer = a - b;
        question = `${a} - ${b} = ?`;
        type = QuestionType.SUBTRACTION;
      }
      useChoices = false;
    }
  } else {
    // ประถม 3
    if (level <= 20) {
      // Level 1-20: บวกลบเลข 3 หลัก
      a = random(100, 300);
      b = random(50, 200);
      
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
      // Level 21-40: สูตรคูณแม่ 2-5
      a = random(2, 5);
      b = random(1, 12);
      answer = a * b;
      question = `${a} × ${b} = ?`;
      type = QuestionType.MULTIPLICATION;
    } else if (level <= 60) {
      // Level 41-60: สูตรคูณแม่ 6-9
      a = random(6, 9);
      b = random(1, 12);
      answer = a * b;
      question = `${a} × ${b} = ?`;
      type = QuestionType.MULTIPLICATION;
      useChoices = false;
    } else if (level <= 80) {
      // Level 61-80: หารเบื้องต้น
      b = random(2, 5);
      answer = random(2, 10);
      a = b * answer;
      question = `${a} ÷ ${b} = ?`;
      type = QuestionType.DIVISION;
      useChoices = false;
    } else {
      // Level 81-100: โจทย์ปัญหาง่ายๆ
      const problems = [
        {
          generate: () => {
            const a = random(20, 50);
            const b = random(10, 30);
            return {
              question: `แม่มีเงิน ${a} บาท ซื้อของไป ${b} บาท เหลือเงินกี่บาท?`,
              answer: a - b
            };
          }
        },
        {
          generate: () => {
            const a = random(5, 15);
            const b = random(5, 15);
            return {
              question: `มีแอปเปิ้ล ${a} ผล และส้ม ${b} ผล รวมมีผลไม้กี่ผล?`,
              answer: a + b
            };
          }
        }
      ];
      
      const problem = problems[random(0, problems.length - 1)].generate();
      question = problem.question;
      answer = problem.answer;
      type = QuestionType.WORD_PROBLEM;
      useChoices = false;
    }
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
    // Level 1-25: คูณเลข 2 หลัก
    a = random(10, 25);
    b = random(2, 12);
    answer = a * b;
    question = `${a} × ${b} = ?`;
    type = QuestionType.MULTIPLICATION;
  } else if (level <= 50) {
    // Level 26-50: หาร
    b = random(2, 12);
    answer = random(5, 25);
    a = b * answer;
    question = `${a} ÷ ${b} = ?`;
    type = QuestionType.DIVISION;
  } else if (level <= 75) {
    // Level 51-75: โจทย์ผสมมีวงเล็บ
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
    // Level 76-100: โจทย์ปัญหา
    const problems = [
      {
        generate: () => {
          const a = random(200, 500);
          const b = random(50, 150);
          return {
            question: `ร้านค้ามีสินค้า ${a} ชิ้น ขายไป ${b} ชิ้น เหลือกี่ชิ้น?`,
            answer: a - b
          };
        }
      },
      {
        generate: () => {
          const b = random(4, 8);
          const perGroup = random(5, 15);
          const a = b * perGroup;
          return {
            question: `นักเรียน ${a} คน แบ่งเป็น ${b} กลุ่มเท่าๆ กัน กลุ่มละกี่คน?`,
            answer: perGroup
          };
        }
      },
      {
        generate: () => {
          const price = random(15, 50);
          const quantity = random(3, 8);
          return {
            question: `ดินสอแท่งละ ${price} บาท ซื้อ ${quantity} แท่ง ต้องจ่ายเงินกี่บาท?`,
            answer: price * quantity
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
    choices: undefined,
    type,
    difficulty: level
  };
};

// Secondary questions (มัธยม)
const generateSecondaryQuestion = (grade: string, level: number): Question => {
  let a: number, b: number, c: number, answer: number, question: string;
  let type: QuestionType = QuestionType.MIXED;
  
  if (level <= 20) {
    // Level 1-20: การคำนวณพื้นฐาน
    a = random(100, 999);
    b = random(100, 999);
    
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
    // Level 21-40: คูณเลขหลายหลัก
    a = random(20, 99);
    b = random(10, 50);
    answer = a * b;
    question = `${a} × ${b} = ?`;
    type = QuestionType.MULTIPLICATION;
  } else if (level <= 60) {
    // Level 41-60: เศษส่วนเบื้องต้น
    a = random(1, 9);
    b = random(2, 10);
    c = random(1, 9);
    const d = b; // ตัวส่วนเดียวกัน
    answer = a + c;
    question = `${a}/${b} + ${c}/${d} = ${answer}/${b}`;
    type = QuestionType.MIXED;
  } else if (level <= 80) {
    // Level 61-80: ทศนิยมเบื้องต้น
    const a1 = random(1, 99) / 10;
    const b1 = random(1, 99) / 10;
    answer = Math.round((a1 + b1) * 10) / 10;
    question = `${a1} + ${b1} = ?`;
    type = QuestionType.MIXED;
  } else {
    // Level 81-100: พีชคณิตเบื้องต้น
    a = random(2, 10);
    b = random(5, 20);
    answer = b - a;
    question = `x + ${a} = ${b}, x = ?`;
    type = QuestionType.MIXED;
  }
  
  return {
    id: generateId(),
    question,
    answer,
    choices: undefined,
    type,
    difficulty: level
  };
};