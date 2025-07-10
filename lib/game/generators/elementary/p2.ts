// lib/game/generators/elementary/p2.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice
} from '../utils';

export class P2Generator extends BaseGenerator {
  constructor() {
    super('P2');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // P2 จะเน้นแค่โจทย์ตัวเลขล้วนๆ ไม่มีคำถามยาวๆ
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 20) {
      return [QuestionType.ADDITION];
    } else if (level <= 40) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION];
    } else if (level <= 60) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION];
    } else if (level <= 80) {
      return [QuestionType.MULTIPLICATION, QuestionType.MIXED];
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION, QuestionType.MIXED];
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 20) {
      // Level 1-20: บวก 2 หลัก (ไม่ทด)
      return this.generateTwoDigitAdditionNoCarry(level, config);
    } else if (level <= 40) {
      // Level 21-40: ลบ 2 หลัก
      const types = [
        () => this.generateTwoDigitAdditionNoCarry(level, config),
        () => this.generateTwoDigitSubtraction(level, config)
      ];
      return randomChoice(types)();
    } else if (level <= 60) {
      // Level 41-60: สูตรคูณแม่ 2, 5, 10
      return this.generateEasyMultiplication(level, config);
    } else if (level <= 80) {
      // Level 61-80: สูตรคูณแม่ 3, 4
      return this.generateMultiplication34(level, config);
    } else {
      // Level 81-100: บวกลบ 2 หลัก (มีการทด)
      const types = [
        () => this.generateTwoDigitAdditionWithCarry(level, config),
        () => this.generateTwoDigitSubtractionWithBorrow(level, config),
        () => this.generateMixedOperations(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateTwoDigitAdditionNoCarry(level: number, config: LevelConfig): Question {
    // บวกไม่มีการทด
    const tens1 = random(1, 3) * 10;
    const ones1 = random(0, 5);
    const tens2 = random(1, 2) * 10;
    const ones2 = random(0, Math.min(9 - ones1, 5));
    
    const a = tens1 + ones1;
    const b = tens2 + ones2;
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 8)
    );
  }

  private generateTwoDigitSubtraction(level: number, config: LevelConfig): Question {
    // ลบ 2 หลัก (ไม่ยืม)
    const tens = random(2, 5) * 10;
    const ones = random(3, 9);
    const a = tens + ones;
    const subtractOnes = random(1, ones);
    const subtractTens = random(0, 2) * 10;
    const b = subtractTens + subtractOnes;
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 8)
    );
  }

  private generateEasyMultiplication(level: number, config: LevelConfig): Question {
    // สูตรคูณแม่ 2, 5, 10
    const tables = [2, 5, 10];
    const multiplicand = randomChoice(tables);
    const multiplier = random(1, 10);
    const answer = multiplicand * multiplier;
    
    return this.createQuestion(
      `${multiplicand} × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, Math.max(5, Math.floor(answer * 0.3)))
    );
  }

  private generateMultiplication34(level: number, config: LevelConfig): Question {
    // สูตรคูณแม่ 3, 4
    const tables = [3, 4];
    const multiplicand = randomChoice(tables);
    const multiplier = random(1, 10);
    const answer = multiplicand * multiplier;
    
    return this.createQuestion(
      `${multiplicand} × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, Math.max(3, Math.floor(answer * 0.2)))
    );
  }

  private generateTwoDigitAdditionWithCarry(level: number, config: LevelConfig): Question {
    // บวกมีการทด
    const tens1 = random(1, 4) * 10;
    const ones1 = random(5, 9);
    const tens2 = random(1, 3) * 10;
    const ones2 = random(5, 9);
    
    const a = tens1 + ones1;
    const b = tens2 + ones2;
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 12)
    );
  }

  private generateTwoDigitSubtractionWithBorrow(level: number, config: LevelConfig): Question {
    // ลบมีการยืม
    const a = random(25, 70);
    const b = random(8, Math.min(a - 5, 30));
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 10)
    );
  }

  private generateMixedOperations(level: number, config: LevelConfig): Question {
    const operations = [
      // a × b + c
      () => {
        const a = random(2, 5);
        const b = random(2, 6);
        const c = random(3, 10);
        return {
          question: `${a} × ${b} + ${c} = ?`,
          answer: (a * b) + c
        };
      },
      // a + b - c
      () => {
        const a = random(20, 40);
        const b = random(10, 30);
        const sum = a + b;
        const c = random(5, Math.min(20, sum - 10));
        return {
          question: `${a} + ${b} - ${c} = ?`,
          answer: sum - c
        };
      },
      // หาร (ลงตัว)
      () => {
        const divisors = [2, 3, 4, 5];
        const divisor = randomChoice(divisors);
        const quotient = random(2, 8);
        const dividend = divisor * quotient;
        return {
          question: `${dividend} ÷ ${divisor} = ?`,
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
      generateChoices(op.answer, 4, 5)
    );
  }
}