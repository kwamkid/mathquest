// lib/game/generators/elementary/p3.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice,
  generateDivisibleNumbers
} from '../utils';

export class P3Generator extends BaseGenerator {
  constructor() {
    super('P3');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // P3 จะเน้นแค่โจทย์ตัวเลขล้วนๆ ไม่มีคำถามยาวๆ
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 20) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION];
    } else if (level <= 40) {
      return [QuestionType.MULTIPLICATION];
    } else if (level <= 60) {
      return [QuestionType.MULTIPLICATION];
    } else if (level <= 80) {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION];
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION, QuestionType.DIVISION, QuestionType.MIXED];
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 20) {
      // Level 1-20: บวกลบ 3 หลัก
      const types = [
        () => this.generateThreeDigitAddition(level, config),
        () => this.generateThreeDigitSubtraction(level, config)
      ];
      return randomChoice(types)();
    } else if (level <= 40) {
      // Level 21-40: สูตรคูณแม่ 2-5
      return this.generateMultiplication25(level, config);
    } else if (level <= 60) {
      // Level 41-60: สูตรคูณแม่ 6-9
      return this.generateMultiplication69(level, config);
    } else if (level <= 80) {
      // Level 61-80: หารเบื้องต้น
      const types = [
        () => this.generateMultiplication69(level, config),
        () => this.generateBasicDivision(level, config)
      ];
      return randomChoice(types)();
    } else {
      // Level 81-100: โจทย์ผสม
      const types = [
        () => this.generateThreeDigitAddition(level, config),
        () => this.generateThreeDigitSubtraction(level, config),
        () => this.generateMultiplication25(level, config),
        () => this.generateMultiplication69(level, config),
        () => this.generateBasicDivision(level, config),
        () => this.generateTwoStepCalculation(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateThreeDigitAddition(level: number, config: LevelConfig): Question {
    const a = random(50, 300);
    const b = random(40, 250);
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 50)
    );
  }

  private generateThreeDigitSubtraction(level: number, config: LevelConfig): Question {
    const a = random(100, 400);
    const b = random(30, Math.min(a - 20, 200));
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 40)
    );
  }

  private generateMultiplication25(level: number, config: LevelConfig): Question {
    // สูตรคูณแม่ 2-5
    const tables = [2, 3, 4, 5];
    const multiplicand = randomChoice(tables);
    const multiplier = random(1, 12);
    const answer = multiplicand * multiplier;
    
    return this.createQuestion(
      `${multiplicand} × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, Math.max(5, Math.floor(answer * 0.3)))
    );
  }

  private generateMultiplication69(level: number, config: LevelConfig): Question {
    // สูตรคูณแม่ 6-9
    const tables = [6, 7, 8, 9];
    const multiplicand = randomChoice(tables);
    const multiplier = random(1, 12);
    const answer = multiplicand * multiplier;
    
    return this.createQuestion(
      `${multiplicand} × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, Math.max(8, Math.floor(answer * 0.2)))
    );
  }

  private generateBasicDivision(level: number, config: LevelConfig): Question {
    const divisors = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const divisor = randomChoice(divisors);
    const quotient = random(2, 12);
    const dividend = divisor * quotient;
    
    return this.createQuestion(
      `${dividend} ÷ ${divisor} = ?`,
      quotient,
      QuestionType.DIVISION,
      level,
      generateChoices(quotient, 4, 4)
    );
  }

  private generateTwoStepCalculation(level: number, config: LevelConfig): Question {
    const operations = [
      // a × b + c
      () => {
        const a = random(3, 8);
        const b = random(2, 6);
        const c = random(5, 15);
        return {
          question: `${a} × ${b} + ${c} = ?`,
          answer: (a * b) + c
        };
      },
      // a × b - c
      () => {
        const a = random(4, 9);
        const b = random(3, 7);
        const product = a * b;
        const c = random(3, Math.min(10, product - 5));
        return {
          question: `${a} × ${b} - ${c} = ?`,
          answer: product - c
        };
      },
      // (a + b) × c
      () => {
        const a = random(2, 8);
        const b = random(3, 7);
        const c = random(2, 5);
        return {
          question: `(${a} + ${b}) × ${c} = ?`,
          answer: (a + b) * c
        };
      },
      // a ÷ b + c
      () => {
        const b = random(2, 5);
        const quotient = random(3, 8);
        const a = b * quotient;
        const c = random(3, 10);
        return {
          question: `${a} ÷ ${b} + ${c} = ?`,
          answer: quotient + c
        };
      }
    ];
    
    const op = randomChoice(operations)();
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 8)
    );
  }
}