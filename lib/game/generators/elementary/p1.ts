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
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 10) {
      return [QuestionType.MIXED]; // นับเลข
    } else if (level <= 30) {
      return [QuestionType.ADDITION];
    } else if (level <= 40) {
      return [QuestionType.SUBTRACTION];
    } else if (level <= 70) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION];
    } else {
      return [QuestionType.MIXED];
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 10) {
      // Level 1-10: นับเลข 1-10
      return this.generateCounting(level, config);
    } else if (level <= 20) {
      // Level 11-20: บวกเลข 1-5
      return this.generateAddition1to5(level, config);
    } else if (level <= 30) {
      // Level 21-30: บวกเลข 1-10
      return this.generateAddition1to10(level, config);
    } else if (level <= 40) {
      // Level 31-40: ลบเลข 1-10
      return this.generateSubtraction1to10(level, config);
    } else if (level <= 50) {
      // Level 41-50: บวกลบผสม (ไม่เกิน 10)
      return this.generateMixedUnder10(level, config);
    } else if (level <= 60) {
      // Level 51-60: เลข 11-20 และการบวกง่ายๆ
      return this.generateAddition11to20(level, config);
    } else if (level <= 70) {
      // Level 61-70: ลบเลขจาก 11-20
      return this.generateSubtraction11to20(level, config);
    } else if (level <= 80) {
      // Level 71-80: บวกลบ 2 หลัก กับ 1 หลัก (ไม่ทด/ไม่ยืม)
      return this.generateTwoDigitOperations(level, config);
    } else if (level <= 90) {
      // Level 81-90: นับเลข 20-50 และบวกลบง่ายๆ
      return this.generateCounting20to50(level, config);
    } else {
      // Level 91-100: หาเลขที่หาย และเติมเลข
      return this.generateMissingNumbers(level, config);
    }
  }

  // Level 1-10: นับเลข 1-10
  private generateCounting(level: number, config: LevelConfig): Question {
    const types = [
      // แสดงเลขให้เลือก
      () => {
        const num = random(1, 10);
        return {
          question: `${num} = ?`,
          answer: num
        };
      },
      // นับจุด
      () => {
        const count = random(1, Math.min(level, 10));
        const dots = '●'.repeat(count);
        const spacedDots = dots.split('').join(' ');
        return {
          question: `${spacedDots} = ?`,
          answer: count
        };
      },
      // เติมเลขที่หาย (ลำดับ)
      () => {
        const start = random(1, 7);
        const missing = start + 1;
        const next = start + 2;
        return {
          question: `${start}, ?, ${next}`,
          answer: missing
        };
      },
      // เลขตรงกลาง
      () => {
        const first = random(1, 8);
        const middle = first + 1;
        const last = first + 2;
        return {
          question: `${first} ? ${last}`,
          answer: middle
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, 2)
    );
  }

  // Level 11-20: บวกเลข 1-5
  private generateAddition1to5(level: number, config: LevelConfig): Question {
    const maxSum = 5;
    const a = random(1, 3);
    const b = random(1, Math.min(2, maxSum - a));
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 2)
    );
  }

  // Level 21-30: บวกเลข 1-10
  private generateAddition1to10(level: number, config: LevelConfig): Question {
    const maxSum = 10;
    const a = random(1, 6);
    const b = random(1, Math.min(6, maxSum - a));
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  // Level 31-40: ลบเลข 1-10
  private generateSubtraction1to10(level: number, config: LevelConfig): Question {
    const a = random(3, 10);
    const b = random(1, Math.min(a - 1, 5));
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  // Level 41-50: บวกลบผสม (ไม่เกิน 10)
  private generateMixedUnder10(level: number, config: LevelConfig): Question {
    const operations = [
      // บวก
      () => {
        const a = random(2, 7);
        const b = random(1, Math.min(5, 10 - a));
        return {
          question: `${a} + ${b} = ?`,
          answer: a + b,
          type: QuestionType.ADDITION
        };
      },
      // ลบ
      () => {
        const a = random(5, 10);
        const b = random(1, Math.min(a - 2, 6));
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

  // Level 51-60: เลข 11-20 และการบวกง่ายๆ
  private generateAddition11to20(level: number, config: LevelConfig): Question {
    const types = [
      // 10 + เลขหลักเดียว
      () => {
        const b = random(1, 9);
        return {
          question: `10 + ${b} = ?`,
          answer: 10 + b
        };
      },
      // เลข 11-18 + เลขน้อยๆ (ไม่เกิน 20)
      () => {
        const a = random(11, 17);
        const b = random(1, Math.min(3, 20 - a));
        return {
          question: `${a} + ${b} = ?`,
          answer: a + b
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.ADDITION,
      level,
      generateChoices(type.answer, 4, 3)
    );
  }

  // Level 61-70: ลบเลขจาก 11-20
  private generateSubtraction11to20(level: number, config: LevelConfig): Question {
    const types = [
      // ลบจาก 11-20 ลงมา
      () => {
        const a = random(11, 20);
        const b = random(1, Math.min(8, a - 5));
        return {
          question: `${a} - ${b} = ?`,
          answer: a - b
        };
      },
      // 20 - 10, 15 - 5 (ลบพอดี)
      () => {
        const pairs = [
          { a: 20, b: 10 },
          { a: 15, b: 5 },
          { a: 18, b: 8 },
          { a: 16, b: 6 },
          { a: 14, b: 4 }
        ];
        const pair = randomChoice(pairs);
        return {
          question: `${pair.a} - ${pair.b} = ?`,
          answer: pair.a - pair.b
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(type.answer, 4, 3)
    );
  }

  // Level 71-80: บวกลบ 2 หลัก กับ 1 หลัก (ไม่ทด/ไม่ยืม)
  private generateTwoDigitOperations(level: number, config: LevelConfig): Question {
    const operations = [
      // บวก 2 หลัก + 1 หลัก (ไม่ทด)
      () => {
        const tens = random(2, 4) * 10;
        const ones = random(0, 5);
        const a = tens + ones;
        const b = random(1, Math.min(4, 9 - ones));
        return {
          question: `${a} + ${b} = ?`,
          answer: a + b,
          type: QuestionType.ADDITION
        };
      },
      // ลบ 2 หลัก - 1 หลัก (ไม่ยืม)
      () => {
        const tens = random(2, 4) * 10;
        const ones = random(4, 9);
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

  // Level 81-90: นับเลข 20-50 และบวกลบง่ายๆ
  private generateCounting20to50(level: number, config: LevelConfig): Question {
    const types = [
      // บวกทีละ 10
      () => {
        const start = random(2, 4) * 10;
        return {
          question: `${start} + 10 = ?`,
          answer: start + 10
        };
      },
      // ลบทีละ 10
      () => {
        const start = random(3, 5) * 10;
        return {
          question: `${start} - 10 = ?`,
          answer: start - 10
        };
      },
      // บวกจากเลขกลมๆ
      () => {
        const start = random(20, 40);
        const add = randomChoice([5, 10]);
        return {
          question: `${start} + ${add} = ?`,
          answer: start + add
        };
      },
      // ลบจากเลขกลมๆ
      () => {
        const start = random(25, 50);
        const sub = randomChoice([5, 10]);
        return {
          question: `${start} - ${sub} = ?`,
          answer: start - sub
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, 5)
    );
  }

  // Level 91-100: หาเลขที่หาย และเติมเลข
  private generateMissingNumbers(level: number, config: LevelConfig): Question {
    const types = [
      // ? + a = b (หาตัวบวก)
      () => {
        const answer = random(3, 12);
        const known = random(2, 8);
        const result = answer + known;
        return {
          question: `? + ${known} = ${result}`,
          answer: answer
        };
      },
      // a - ? = b (หาตัวลบ)
      () => {
        const start = random(10, 20);
        const result = random(5, 12);
        const answer = start - result;
        return {
          question: `${start} - ? = ${result}`,
          answer: answer
        };
      },
      // a + ? = b (เติมให้ครบ)
      () => {
        const start = random(5, 15);
        const target = random(start + 2, 20);
        const answer = target - start;
        return {
          question: `${start} + ? = ${target}`,
          answer: answer
        };
      },
      // นับเพิ่มทีละ 5
      () => {
        const start = randomChoice([5, 10, 15]);
        const missing = start + 5;
        const next = start + 10;
        return {
          question: `${start}, ?, ${next}`,
          answer: missing
        };
      },
      // นับเพิ่มทีละ 10
      () => {
        const start = randomChoice([10, 20, 30]);
        const missing = start + 10;
        const next = start + 20;
        return {
          question: `${start}, ?, ${next}`,
          answer: missing
        };
      },
      // นับเพิ่มทีละ 2
      () => {
        const start = random(2, 16);
        const missing = start + 2;
        const next = start + 4;
        return {
          question: `${start}, ?, ${next}`,
          answer: missing
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, Math.floor(type.answer * 0.3)))
    );
  }
}