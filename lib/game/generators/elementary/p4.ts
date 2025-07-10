// lib/game/generators/elementary/p4.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice,
  generateDivisibleNumbers
} from '../utils';

export class P4Generator extends BaseGenerator {
  constructor() {
    super('P4');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // P4 จะเน้นแค่โจทย์ตัวเลขล้วนๆ ไม่มีคำถามยาวๆ
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.MULTIPLICATION];
    } else if (level <= 50) {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION];
    } else if (level <= 75) {
      return [QuestionType.MIXED];
    } else {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION, QuestionType.MIXED];
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: คูณ 2 หลัก
      return this.generateTwoDigitMultiplication(level, config);
    } else if (level <= 50) {
      // Level 26-50: หารพื้นฐาน
      const types = [
        () => this.generateTwoDigitMultiplication(level, config),
        () => this.generateBasicDivision(level, config)
      ];
      return randomChoice(types)();
    } else if (level <= 75) {
      // Level 51-75: โจทย์ผสมมีวงเล็บ
      return this.generateParenthesesProblem(level, config);
    } else {
      // Level 76-100: โจทย์ผสม
      const types = [
        () => this.generateTwoDigitMultiplication(level, config),
        () => this.generateLongDivision(level, config),
        () => this.generateParenthesesProblem(level, config),
        () => this.generateFractionBasic(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateTwoDigitMultiplication(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: คูณเลข 2 หลัก กับ 1 หลัก
      const a = random(10, 25);
      const b = random(2, 12);
      const answer = a * b;
      
      return this.createQuestion(
        `${a} × ${b} = ?`,
        answer,
        QuestionType.MULTIPLICATION,
        level,
        generateChoices(answer, 4, Math.max(15, Math.floor(answer * 0.2)))
      );
    } else {
      // Level 26+: คูณเลขใหญ่ขึ้น
      const a = random(15, 50);
      const b = random(3, 15);
      const answer = a * b;
      
      return this.createQuestion(
        `${a} × ${b} = ?`,
        answer,
        QuestionType.MULTIPLICATION,
        level,
        generateChoices(answer, 4, Math.max(20, Math.floor(answer * 0.15)))
      );
    }
  }

  private generateBasicDivision(level: number, config: LevelConfig): Question {
    const divisors = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
    const divisor = randomChoice(divisors);
    const quotient = random(4, 15);
    const dividend = divisor * quotient;
    
    return this.createQuestion(
      `${dividend} ÷ ${divisor} = ?`,
      quotient,
      QuestionType.DIVISION,
      level,
      generateChoices(quotient, 4, 5)
    );
  }

  private generateLongDivision(level: number, config: LevelConfig): Question {
    // หารยาวเบื้องต้น
    const divisor = random(11, 25);
    const quotient = random(5, 20);
    const dividend = divisor * quotient;
    
    return this.createQuestion(
      `${dividend} ÷ ${divisor} = ?`,
      quotient,
      QuestionType.DIVISION,
      level,
      generateChoices(quotient, 4, 6)
    );
  }

  private generateParenthesesProblem(level: number, config: LevelConfig): Question {
    const operations = [
      // (a + b) × c
      () => {
        const a = random(5, 15);
        const b = random(3, 10);
        const c = random(2, 8);
        return {
          question: `(${a} + ${b}) × ${c} = ?`,
          answer: (a + b) * c
        };
      },
      // a × (b + c)
      () => {
        const a = random(3, 12);
        const b = random(4, 10);
        const c = random(2, 8);
        return {
          question: `${a} × (${b} + ${c}) = ?`,
          answer: a * (b + c)
        };
      },
      // (a - b) × c
      () => {
        const a = random(20, 40);
        const b = random(5, 15);
        const c = random(2, 6);
        return {
          question: `(${a} - ${b}) × ${c} = ?`,
          answer: (a - b) * c
        };
      },
      // (a × b) + c
      () => {
        const a = random(4, 12);
        const b = random(3, 8);
        const c = random(10, 30);
        return {
          question: `(${a} × ${b}) + ${c} = ?`,
          answer: (a * b) + c
        };
      },
      // (a × b) - c
      () => {
        const a = random(5, 15);
        const b = random(4, 10);
        const product = a * b;
        const c = random(5, Math.min(30, product - 10));
        return {
          question: `(${a} × ${b}) - ${c} = ?`,
          answer: product - c
        };
      },
      // (a + b) ÷ c
      () => {
        const c = random(2, 6);
        const quotient = random(5, 15);
        const sum = c * quotient;
        const a = random(Math.floor(sum * 0.3), Math.floor(sum * 0.7));
        const b = sum - a;
        return {
          question: `(${a} + ${b}) ÷ ${c} = ?`,
          answer: quotient
        };
      }
    ];
    
    const op = randomChoice(operations)();
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, Math.max(8, Math.floor(op.answer * 0.2)))
    );
  }

  private generateFractionBasic(level: number, config: LevelConfig): Question {
    // เศษส่วนของจำนวน
    const fractions = [
      { num: 1, den: 2 },
      { num: 1, den: 3 },
      { num: 1, den: 4 },
      { num: 2, den: 3 },
      { num: 3, den: 4 }
    ];
    
    const fraction = randomChoice(fractions);
    const total = generateDivisibleNumbers(fraction.den, 12, 60);
    const answer = (total * fraction.num) / fraction.den;
    
    return this.createQuestion(
      `${fraction.num}/${fraction.den} × ${total} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, Math.max(3, Math.floor(answer * 0.4)))
    );
  }
}