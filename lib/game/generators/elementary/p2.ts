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
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 40) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION];
    } else if (level <= 60) {
      return [QuestionType.MULTIPLICATION];
    } else if (level <= 90) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION];
    } else {
      return [QuestionType.MIXED];
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 10) {
      // Level 1-10: บวกลบพื้นฐาน (เลขหลักเดียว)
      return this.generateSingleDigitAddSub(level, config);
    } else if (level <= 20) {
      // Level 11-20: บวกลบ 2 หลักกับ 1 หลัก (ไม่ทด/ไม่ยืม)
      return this.generateTwoDigitWithOneDigit(level, config);
    } else if (level <= 30) {
      // Level 21-30: บวก 2 หลัก กับ 2 หลัก (ไม่ทด)
      return this.generateTwoDigitAdditionNoCarry(level, config);
    } else if (level <= 40) {
      // Level 31-40: ลบ 2 หลัก (ไม่ยืม)
      return this.generateTwoDigitSubtractionNoBorrow(level, config);
    } else if (level <= 50) {
      // Level 41-50: สูตรคูณแม่ 2, 5, 10
      return this.generateMultiplicationTable2510(level, config);
    } else if (level <= 60) {
      // Level 51-60: สูตรคูณแม่ 3, 4
      return this.generateMultiplicationTable34(level, config);
    } else if (level <= 70) {
      // Level 61-70: บวกลบ 3 หลัก (ไม่ทด/ไม่ยืม)
      return this.generateThreeDigitAddSubNoCarry(level, config);
    } else if (level <= 80) {
      // Level 71-80: บวก 2 หลัก (มีการทด)
      return this.generateTwoDigitAdditionWithCarry(level, config);
    } else if (level <= 90) {
      // Level 81-90: ลบ 2 หลัก (มีการยืม)
      return this.generateTwoDigitSubtractionWithBorrow(level, config);
    } else {
      // Level 91-100: โจทย์ผสม
      return this.generateMixedProblems(level, config);
    }
  }

  // Level 1-10: บวกลบพื้นฐาน
  private generateSingleDigitAddSub(level: number, config: LevelConfig): Question {
    const operations = [
      // บวก
      () => {
        const a = random(1, 5);
        const b = random(1, Math.min(5, 10 - a));
        return {
          question: `${a} + ${b} = ?`,
          answer: a + b,
          type: QuestionType.ADDITION
        };
      },
      // ลบ
      () => {
        const a = random(3, 9);
        const b = random(1, Math.min(a - 1, 5));
        return {
          question: `${a} - ${b} = ?`,
          answer: a - b,
          type: QuestionType.SUBTRACTION
        };
      }
    ];
    
    const op = randomChoice(operations)();
    
    return this.createQuestion(
      op.question,
      op.answer,
      op.type,
      level,
      generateChoices(op.answer, 4, 3)
    );
  }

  // Level 11-20: บวกลบ 2 หลักกับ 1 หลัก (ไม่ทด/ไม่ยืม)
  private generateTwoDigitWithOneDigit(level: number, config: LevelConfig): Question {
    const operations = [
      // บวก (ไม่ทด)
      () => {
        const tens = random(1, 4) * 10;
        const ones = random(0, 5);
        const a = tens + ones;
        const b = random(1, Math.min(4, 9 - ones));
        return {
          question: `${a} + ${b} = ?`,
          answer: a + b,
          type: QuestionType.ADDITION
        };
      },
      // ลบ (ไม่ยืม)
      () => {
        const tens = random(2, 4) * 10;
        const ones = random(3, 9);
        const a = tens + ones;
        const b = random(1, ones);
        return {
          question: `${a} - ${b} = ?`,
          answer: a - b,
          type: QuestionType.SUBTRACTION
        };
      }
    ];
    
    const op = randomChoice(operations)();
    
    return this.createQuestion(
      op.question,
      op.answer,
      op.type,
      level,
      generateChoices(op.answer, 4, 5)
    );
  }

  // Level 21-30: บวก 2 หลัก กับ 2 หลัก (ไม่ทด)
  private generateTwoDigitAdditionNoCarry(level: number, config: LevelConfig): Question {
    // สร้างเลขที่บวกแล้วไม่ทด
    const tens1 = random(1, 3) * 10;
    const ones1 = random(0, 4);
    const a = tens1 + ones1;
    
    const tens2 = random(1, 3) * 10;
    const ones2 = random(0, Math.min(5, 9 - ones1)); // ไม่ให้ทด
    const b = tens2 + ones2;
    
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 10)
    );
  }

  // Level 31-40: ลบ 2 หลัก (ไม่ยืม)
  private generateTwoDigitSubtractionNoBorrow(level: number, config: LevelConfig): Question {
    // สร้างเลขที่ลบแล้วไม่ยืม
    const tens1 = random(3, 6) * 10;
    const ones1 = random(5, 9);
    const a = tens1 + ones1;
    
    const tens2 = random(1, 2) * 10;
    const ones2 = random(0, ones1); // ไม่ให้ยืม
    const b = tens2 + ones2;
    
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 10)
    );
  }

  // Level 41-50: สูตรคูณแม่ 2, 5, 10
  private generateMultiplicationTable2510(level: number, config: LevelConfig): Question {
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

  // Level 51-60: สูตรคูณแม่ 3, 4
  private generateMultiplicationTable34(level: number, config: LevelConfig): Question {
    const tables = [3, 4];
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

  // Level 61-70: บวกลบ 3 หลัก (ไม่ทด/ไม่ยืม)
  private generateThreeDigitAddSubNoCarry(level: number, config: LevelConfig): Question {
    const operations = [
      // บวก 3 หลัก กับ 2 หลัก (ไม่ทด)
      () => {
        const hundreds = random(1, 3) * 100;
        const tens = random(0, 4) * 10;
        const ones = random(0, 4);
        const a = hundreds + tens + ones;
        
        const b_tens = random(1, 3) * 10;
        const b_ones = random(0, Math.min(5, 9 - ones));
        const b = b_tens + b_ones;
        
        return {
          question: `${a} + ${b} = ?`,
          answer: a + b,
          type: QuestionType.ADDITION
        };
      },
      // ลบ 3 หลัก ลบ 2 หลัก (ไม่ยืม)
      () => {
        const hundreds = random(2, 4) * 100;
        const tens = random(3, 7) * 10;
        const ones = random(5, 9);
        const a = hundreds + tens + ones;
        
        const b_tens = random(1, 2) * 10;
        const b_ones = random(0, ones);
        const b = b_tens + b_ones;
        
        return {
          question: `${a} - ${b} = ?`,
          answer: a - b,
          type: QuestionType.SUBTRACTION
        };
      }
    ];
    
    const op = randomChoice(operations)();
    
    return this.createQuestion(
      op.question,
      op.answer,
      op.type,
      level,
      generateChoices(op.answer, 4, 15)
    );
  }

  // Level 71-80: บวก 2 หลัก (มีการทด)
  private generateTwoDigitAdditionWithCarry(level: number, config: LevelConfig): Question {
    // สร้างเลขที่บวกแล้วมีการทด
    const tens1 = random(1, 4) * 10;
    const ones1 = random(5, 9); // เลขหลักหน่วยมาก
    const a = tens1 + ones1;
    
    const tens2 = random(1, 3) * 10;
    const ones2 = random(5, 9); // เลขหลักหน่วยมาก เพื่อให้ทด
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

  // Level 81-90: ลบ 2 หลัก (มีการยืม)
  private generateTwoDigitSubtractionWithBorrow(level: number, config: LevelConfig): Question {
    // สร้างเลขที่ลบแล้วต้องยืม
    const tens1 = random(3, 7) * 10;
    const ones1 = random(0, 4); // เลขหลักหน่วยน้อย
    const a = tens1 + ones1;
    
    const tens2 = random(1, 3) * 10;
    const ones2 = random(ones1 + 1, 9); // เลขหลักหน่วยมากกว่า เพื่อให้ยืม
    const b = tens2 + ones2;
    
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 10)
    );
  }

  // Level 91-100: โจทย์ผสม
  private generateMixedProblems(level: number, config: LevelConfig): Question {
    const problemTypes = [
      // บวก/ลบ/คูณผสม
      () => {
        const a = random(3, 8);
        const b = random(2, 6);
        const c = random(5, 15);
        return {
          question: `${a} × ${b} + ${c} = ?`,
          answer: (a * b) + c
        };
      },
      // หาเลขที่หาย (บวก)
      () => {
        const result = random(15, 30);
        const known = random(5, result - 5);
        const unknown = result - known;
        return {
          question: `? + ${known} = ${result}`,
          answer: unknown
        };
      },
      // หาเลขที่หาย (ลบ)
      () => {
        const start = random(20, 40);
        const result = random(5, 15);
        const unknown = start - result;
        return {
          question: `${start} - ? = ${result}`,
          answer: unknown
        };
      },
      // หาเลขที่หาย (คูณ)
      () => {
        const multiplier = randomChoice([2, 3, 4, 5]);
        const result = multiplier * random(3, 10);
        const unknown = result / multiplier;
        return {
          question: `${multiplier} × ? = ${result}`,
          answer: unknown
        };
      },
      // ลำดับเลข
      () => {
        const start = random(10, 30);
        const step = randomChoice([2, 3, 5]);
        const missing = start + step;
        const next = start + (step * 2);
        return {
          question: `${start}, ?, ${next}`,
          answer: missing
        };
      },
      // การเปรียบเทียบ
      () => {
        const a = random(15, 35);
        const b = random(20, 40);
        const diff = Math.abs(a - b);
        return {
          question: `${a} กับ ${b} ต่างกันเท่าไร?`,
          answer: diff
        };
      }
    ];
    
    const problem = randomChoice(problemTypes)();
    
    return this.createQuestion(
      problem.question,
      problem.answer,
      QuestionType.MIXED,
      level,
      generateChoices(problem.answer, 4, Math.max(5, Math.floor(problem.answer * 0.3)))
    );
  }
}