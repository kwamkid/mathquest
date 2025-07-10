// lib/game/generators/elementary/p1.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice
} from '../utils';

export class P1Generator extends BaseGenerator {
  constructor() {
    super('P1');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // P1 จะเน้นแค่โจทย์ตัวเลขล้วนๆ ไม่มีคำถามยาวๆ
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.ADDITION];
    } else if (level <= 50) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION];
    } else if (level <= 75) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED];
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED];
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: บวกเลขหลักเดียว
      return this.generateSingleDigitAddition(level, config);
    } else if (level <= 50) {
      // Level 26-50: ลบเลขหลักเดียว
      const types = [
        () => this.generateSingleDigitAddition(level, config),
        () => this.generateSingleDigitSubtraction(level, config)
      ];
      return randomChoice(types)();
    } else if (level <= 75) {
      // Level 51-75: บวกเลข 2 หลักกับ 1 หลัก
      const types = [
        () => this.generateTwoDigitPlusOne(level, config),
        () => this.generateSingleDigitSubtraction(level, config),
        () => this.generateMissingNumber(level, config)
      ];
      return randomChoice(types)();
    } else {
      // Level 76-100: บวกลบผสม (ไม่เกิน 20)
      const types = [
        () => this.generateMixedUnder20(level, config),
        () => this.generateComparison(level, config),
        () => this.generateNumberLine(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateSingleDigitAddition(level: number, config: LevelConfig): Question {
    const max = level <= 15 ? 9 : 18;
    const a = random(1, 9);
    const b = random(1, Math.min(9, max - a));
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 4)
    );
  }

  private generateSingleDigitSubtraction(level: number, config: LevelConfig): Question {
    const a = random(2, 10);
    const b = random(1, a - 1);
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  private generateTwoDigitPlusOne(level: number, config: LevelConfig): Question {
    // บวกเลข 2 หลักกับ 1 หลัก (ไม่ทด)
    const tens = random(10, 20);
    const ones = random(1, Math.min(9, 20 - (tens % 10)));
    const answer = tens + ones;
    
    return this.createQuestion(
      `${tens} + ${ones} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 5)
    );
  }

  private generateMixedUnder20(level: number, config: LevelConfig): Question {
    const operations = [
      // บวก
      () => {
        const a = random(5, 15);
        const b = random(1, Math.min(5, 20 - a));
        return {
          question: `${a} + ${b} = ?`,
          answer: a + b
        };
      },
      // ลบ
      () => {
        const a = random(10, 20);
        const b = random(1, Math.min(10, a - 5));
        return {
          question: `${a} - ${b} = ?`,
          answer: a - b
        };
      }
    ];
    
    const op = randomChoice(operations)();
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 4)
    );
  }

  private generateComparison(level: number, config: LevelConfig): Question {
    const a = random(5, 20);
    const b = random(5, 20);
    
    if (a === b) {
      return this.createQuestion(
        `${a} = ${b} = ?`,
        a,
        QuestionType.MIXED,
        level,
        generateChoices(a, 4, 5)
      );
    }
    
    // ตอบตัวที่มากกว่า
    const answer = Math.max(a, b);
    
    return this.createQuestion(
      `${a}, ${b} → ?`,
      answer,
      QuestionType.MIXED,
      level,
      [a, b]
    );
  }

  private generateNumberLine(level: number, config: LevelConfig): Question {
    // a + ? = b
    const result = random(8, 20);
    const first = random(2, result - 2);
    const missing = result - first;
    
    return this.createQuestion(
      `${first} + ? = ${result}`,
      missing,
      QuestionType.MIXED,
      level,
      generateChoices(missing, 4, 3)
    );
  }

  private generateMissingNumber(level: number, config: LevelConfig): Question {
    // เลขหายในลำดับ
    const start = random(1, 10);
    const patterns = [
      // หายตัวกลาง
      () => ({
        question: `${start}, ?, ${start + 2}`,
        answer: start + 1
      }),
      // หายตัวท้าย
      () => ({
        question: `${start}, ${start + 1}, ?`,
        answer: start + 2
      }),
      // เพิ่มทีละ 2
      () => ({
        question: `${start}, ${start + 2}, ?`,
        answer: start + 4
      })
    ];
    
    const pattern = randomChoice(patterns)();
    
    return this.createQuestion(
      pattern.question,
      pattern.answer,
      QuestionType.MIXED,
      level,
      generateChoices(pattern.answer, 4, 2)
    );
  }
}