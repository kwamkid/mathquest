// lib/game/generators/elementary/p3.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices,
  randomChoice
} from '../utils';

export class P3Generator extends BaseGenerator {
  constructor() {
    super('P3');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // P3 ใช้แค่ MIXED (ตัวเลขล้วน) ไม่มีโจทย์ปัญหา
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // P3 ไม่มีโจทย์ปัญหา ให้ส่ง MIXED แทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    // P3 มีแค่ MIXED (ตัวเลขล้วน)
    return [QuestionType.MIXED];
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 10) {
      // Level 1-10: บวกลบ หลักพัน หลักหมื่น
      return this.generateAddSubtractThousands(level, config);
    } else if (level <= 20) {
      // Level 11-20: บวกลบ หลักแสน
      return this.generateAddSubtractHundredThousands(level, config);
    } else if (level <= 30) {
      // Level 21-30: คูณ 1 หลัก x 2-3 หลัก
      return this.generateMultiplyBasic(level, config);
    } else if (level <= 40) {
      // Level 31-40: คูณ 2 หลัก x 2 หลัก
      return this.generateMultiplyTwoDigits(level, config);
    } else if (level <= 50) {
      // Level 41-50: สูตรคูณแม่ 6-9
      return this.generateMultiplicationTables(level, config);
    } else if (level <= 60) {
      // Level 51-60: สูตรคูณแม่ 10-12
      return this.generateAdvancedMultiplicationTables(level, config);
    } else if (level <= 70) {
      // Level 61-70: หารไม่เหลือเศษ
      return this.generateDivisionNoRemainder(level, config);
    } else if (level <= 80) {
      // Level 71-80: หารเหลือเศษ
      return this.generateDivisionWithRemainder(level, config);
    } else if (level <= 85) {
      // Level 81-85: เศษส่วนอย่างง่าย
      return this.generateSimpleFractions(level, config);
    } else if (level <= 90) {
      // Level 86-90: การเปรียบเทียบเศษส่วน
      return this.generateFractionComparison(level, config);
    } else if (level <= 95) {
      // Level 91-95: หน่วยการวัด (เมตร, กิโลกรัม, ลิตร)
      return this.generateMeasurementUnits(level, config);
    } else {
      // Level 96-100: โจทย์ผสม
      return this.generateMixedProblems(level, config);
    }
  }

  // Level 1-10: บวกลบ หลักพัน หลักหมื่น
  private generateAddSubtractThousands(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        const a = random(1000, 9999);
        const b = random(100, 2000);
        const answer = a + b;
        return { question: `${a} + ${b} = ?`, answer };
      },
      () => {
        const a = random(5000, 9999);
        const b = random(1000, 4000);
        const answer = a - b;
        return { question: `${a} - ${b} = ?`, answer };
      },
      () => {
        const a = random(10000, 50000);
        const b = random(1000, 9999);
        const answer = a + b;
        return { question: `${a} + ${b} = ?`, answer };
      },
      () => {
        const a = random(20000, 80000);
        const b = random(5000, 15000);
        const answer = a - b;
        return { question: `${a} - ${b} = ?`, answer };
      }
    ];
    
    const op = randomChoice(operations)();
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 1000)
    );
  }

  // Level 11-20: บวกลบ หลักแสน
  private generateAddSubtractHundredThousands(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        const a = random(100000, 500000);
        const b = random(10000, 99999);
        const answer = a + b;
        return { question: `${a} + ${b} = ?`, answer };
      },
      () => {
        const a = random(200000, 900000);
        const b = random(50000, 150000);
        const answer = a - b;
        return { question: `${a} - ${b} = ?`, answer };
      },
      () => {
        const a = random(300000, 700000);
        const b = random(100000, 200000);
        const answer = a + b;
        return { question: `${a} + ${b} = ?`, answer };
      }
    ];
    
    const op = randomChoice(operations)();
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 10000)
    );
  }

  // Level 21-30: คูณ 1 หลัก x 2-3 หลัก
  private generateMultiplyBasic(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        const a = random(2, 9);
        const b = random(10, 99);
        const answer = a * b;
        return { question: `${a} × ${b} = ?`, answer };
      },
      () => {
        const a = random(3, 9);
        const b = random(100, 500);
        const answer = a * b;
        return { question: `${a} × ${b} = ?`, answer };
      },
      () => {
        const a = random(2, 8);
        const b = random(100, 999);
        const answer = a * b;
        return { question: `${a} × ${b} = ?`, answer };
      }
    ];
    
    const op = randomChoice(operations)();
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, Math.floor(op.answer * 0.2))
    );
  }

  // Level 31-40: คูณ 2 หลัก x 2 หลัก
  private generateMultiplyTwoDigits(level: number, config: LevelConfig): Question {
    const a = random(10, 50);
    const b = random(10, 50);
    const answer = a * b;
    
    return this.createQuestion(
      `${a} × ${b} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, Math.floor(answer * 0.1))
    );
  }

  // Level 41-50: สูตรคูณแม่ 6-9
  private generateMultiplicationTables(level: number, config: LevelConfig): Question {
    const table = randomChoice([6, 7, 8, 9]);
    const multiplier = random(1, 12);
    const answer = table * multiplier;
    
    return this.createQuestion(
      `${table} × ${multiplier} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 10)
    );
  }

  // Level 51-60: สูตรคูณแม่ 10-12
  private generateAdvancedMultiplicationTables(level: number, config: LevelConfig): Question {
    const table = randomChoice([10, 11, 12]);
    const multiplier = random(1, 12);
    const answer = table * multiplier;
    
    return this.createQuestion(
      `${table} × ${multiplier} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 10)
    );
  }

  // Level 61-70: หารไม่เหลือเศษ
  private generateDivisionNoRemainder(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        const divisor = random(2, 9);
        const quotient = random(10, 50);
        const dividend = divisor * quotient;
        return { question: `${dividend} ÷ ${divisor} = ?`, answer: quotient };
      },
      () => {
        const divisor = random(10, 20);
        const quotient = random(5, 30);
        const dividend = divisor * quotient;
        return { question: `${dividend} ÷ ${divisor} = ?`, answer: quotient };
      }
    ];
    
    const op = randomChoice(operations)();
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, Math.max(5, Math.floor(op.answer * 0.2)))
    );
  }

  // Level 71-80: หารเหลือเศษ
  private generateDivisionWithRemainder(level: number, config: LevelConfig): Question {
    const divisor = random(3, 9);
    const quotient = random(5, 20);
    const remainder = random(1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    
    return this.createQuestion(
      `${dividend} ÷ ${divisor} = ${quotient} เศษ ?`,
      remainder,
      QuestionType.MIXED,
      level,
      generateChoices(remainder, 4, Math.max(2, divisor - 1))
    );
  }

  // Level 81-85: เศษส่วนอย่างง่าย
  private generateSimpleFractions(level: number, config: LevelConfig): Question {
    const fractions = [
      { num: 1, den: 2, dec: 5 },  // 1/2 = 0.5 => ตอบ 5
      { num: 1, den: 4, dec: 25 }, // 1/4 = 0.25 => ตอบ 25
      { num: 3, den: 4, dec: 75 }, // 3/4 = 0.75 => ตอบ 75
      { num: 1, den: 5, dec: 2 },  // 1/5 = 0.2 => ตอบ 2
      { num: 2, den: 5, dec: 4 }   // 2/5 = 0.4 => ตอบ 4
    ];
    
    const frac = randomChoice(fractions);
    return this.createQuestion(
      `${frac.num}/${frac.den} = 0.? (ตอบเฉพาะตัวเลขหลังจุด)`,
      frac.dec,
      QuestionType.MIXED,
      level,
      generateChoices(frac.dec, 4, 20)
    );
  }

  // Level 86-90: การเปรียบเทียบเศษส่วน
  private generateFractionComparison(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // เปรียบเทียบเศษส่วนตัวส่วนเท่ากัน
        const den = randomChoice([3, 4, 5, 6, 8]);
        const num1 = random(1, den - 1);
        const num2 = random(1, den - 1);
        const answer = num1 > num2 ? 1 : (num1 < num2 ? 2 : 3);
        return {
          question: `${num1}/${den} ? ${num2}/${den} (ตอบ 1=>, 2=<, 3==)`,
          answer
        };
      },
      () => {
        // เปรียบเทียบเศษส่วนกับ 1/2
        const fractions = [
          { num: 1, den: 3, less: true },
          { num: 2, den: 3, less: false },
          { num: 1, den: 4, less: true },
          { num: 3, den: 4, less: false },
          { num: 2, den: 5, less: true },
          { num: 3, den: 5, less: false }
        ];
        const frac = randomChoice(fractions);
        const answer = frac.less ? 2 : 1;
        return {
          question: `${frac.num}/${frac.den} ? 1/2 (ตอบ 1=>, 2=<, 3==)`,
          answer
        };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      [1, 2, 3]
    );
  }

  // Level 91-95: หน่วยการวัด
  private generateMeasurementUnits(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const m = random(2, 20);
        const cm = m * 100;
        return { question: `${m} เมตร = ? เซนติเมตร`, answer: cm };
      },
      () => {
        const kg = random(2, 10);
        const g = kg * 1000;
        return { question: `${kg} กิโลกรัม = ? กรัม`, answer: g };
      },
      () => {
        const l = random(2, 15);
        const ml = l * 1000;
        return { question: `${l} ลิตร = ? มิลลิลิตร`, answer: ml };
      },
      () => {
        const cm = randomChoice([100, 200, 300, 500]);
        const m = cm / 100;
        return { question: `${cm} เซนติเมตร = ? เมตร`, answer: m };
      },
      () => {
        const g = randomChoice([1000, 2000, 3000, 5000]);
        const kg = g / 1000;
        return { question: `${g} กรัม = ? กิโลกรัม`, answer: kg };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(10, Math.floor(type.answer * 0.2)))
    );
  }

  // Level 96-100: โจทย์ผสม
  private generateMixedProblems(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // บวก คูณ ผสม
        const a = random(10, 50);
        const b = random(2, 9);
        const c = random(100, 500);
        const answer = a * b + c;
        return { question: `${a} × ${b} + ${c} = ?`, answer };
      },
      () => {
        // ลบ หาร ผสม
        const divisor = random(5, 10);
        const quotient = random(20, 50);
        const dividend = divisor * quotient;
        const subtract = random(10, 100);
        const answer = quotient - subtract;
        return { question: `${dividend} ÷ ${divisor} - ${subtract} = ?`, answer };
      },
      () => {
        // วงเล็บ
        const a = random(5, 15);
        const b = random(10, 30);
        const c = random(2, 8);
        const answer = (a + b) * c;
        return { question: `(${a} + ${b}) × ${c} = ?`, answer };
      },
      () => {
        // คูณ 10, 100, 1000
        const base = random(12, 99);
        const multiplier = randomChoice([10, 100, 1000]);
        const answer = base * multiplier;
        return { question: `${base} × ${multiplier} = ?`, answer };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(100, Math.floor(type.answer * 0.1)))
    );
  }
}