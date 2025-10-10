// lib/game/generators/elementary/p4.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices,
  randomChoice
} from '../utils';

export class P4Generator extends BaseGenerator {
  constructor() {
    super('P4');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // P4 ใช้แค่ MIXED (ตัวเลขล้วน) ไม่มีโจทย์ปัญหา
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // P4 ไม่มีโจทย์ปัญหา ให้ส่ง MIXED แทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    // P4 มีแค่ MIXED (ตัวเลขล้วน)
    return [QuestionType.MIXED];
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 10) {
      return this.generateMillionOperations(level, config);
    } else if (level <= 20) {
      return this.generateLongDivision(level, config);
    } else if (level <= 30) {
      return this.generateFractionSameDenominator(level, config);
    } else if (level <= 40) {
      return this.generateFractionDifferentDenominator(level, config);
    } else if (level <= 50) {
      return this.generateFractionMultiply(level, config);
    } else if (level <= 60) {
      return this.generateFractionDivide(level, config);
    } else if (level <= 70) {
      return this.generateDecimals(level, config);
    } else if (level <= 80) {
      return this.generateDecimalOperations(level, config);
    } else if (level <= 85) {
      return this.generateAngles(level, config);
    } else if (level <= 90) {
      return this.generateArea(level, config);
    } else if (level <= 95) {
      return this.generatePerimeter(level, config);
    } else {
      return this.generateMixedProblems(level, config);
    }
  }

  // Level 1-10: บวกลบคูณหาร หลักล้าน
  private generateMillionOperations(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        const a = random(100000, 999999);
        const b = random(10000, 99999);
        const answer = a + b;
        return { question: `${a} + ${b} = ?`, answer };
      },
      () => {
        const a = random(500000, 999999);
        const b = random(100000, 400000);
        const answer = a - b;
        return { question: `${a} - ${b} = ?`, answer };
      },
      () => {
        const a = random(1000000, 5000000);
        const b = random(100000, 900000);
        const answer = a + b;
        return { question: `${a} + ${b} = ?`, answer };
      },
      () => {
        const a = random(1000, 9999);
        const b = random(100, 999);
        const answer = a * b;
        return { question: `${a} × ${b} = ?`, answer };
      }
    ];
    
    const op = randomChoice(operations)();
    
    // ✅ Validate answer
    if (!Number.isFinite(op.answer)) {
      console.error('P4: Invalid answer in generateMillionOperations:', op.answer);
      return this.createQuestion('100000 + 50000 = ?', 150000, QuestionType.MIXED, level, [140000, 150000, 160000, 170000]);
    }
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, Math.max(10000, Math.floor(op.answer * 0.05)))
    );
  }

  // Level 11-20: การหารยาว
  private generateLongDivision(level: number, config: LevelConfig): Question {
    const divisor = random(11, 99);
    const quotient = random(10, 99);
    const dividend = divisor * quotient;
    
    // ✅ Validate
    if (!Number.isFinite(quotient) || !Number.isFinite(dividend)) {
      console.error('P4: Invalid values in generateLongDivision');
      return this.createQuestion('144 ÷ 12 = ?', 12, QuestionType.MIXED, level, [10, 11, 12, 13]);
    }
    
    return this.createQuestion(
      `${dividend} ÷ ${divisor} = ?`,
      quotient,
      QuestionType.MIXED,
      level,
      generateChoices(quotient, 4, Math.max(5, Math.floor(quotient * 0.2)))
    );
  }

  // Level 21-30: เศษส่วน (บวก ลบ ตัวส่วนเท่ากัน)
  private generateFractionSameDenominator(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        const den = randomChoice([3, 4, 5, 6, 8]);
        const num1 = random(1, den - 1);
        const num2 = random(1, den - num1);
        const answer = num1 + num2;
        return { question: `${num1}/${den} + ${num2}/${den} = ?/${den}`, answer };
      },
      () => {
        const den = randomChoice([4, 5, 6, 8]);
        const num1 = random(Math.floor(den/2), den - 1);
        const num2 = random(1, num1 - 1);
        const answer = num1 - num2;
        return { question: `${num1}/${den} - ${num2}/${den} = ?/${den}`, answer };
      }
    ];
    
    const op = randomChoice(operations)();
    
    // ✅ Validate
    if (!Number.isFinite(op.answer)) {
      console.error('P4: Invalid answer in generateFractionSameDenominator:', op.answer);
      return this.createQuestion('2/5 + 1/5 = ?/5', 3, QuestionType.MIXED, level, [2, 3, 4, 5]);
    }
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 3)
    );
  }

  // Level 31-40: เศษส่วน (บวก ลบ ตัวส่วนต่างกัน)
  private generateFractionDifferentDenominator(level: number, config: LevelConfig): Question {
    const pairs = [
      { den1: 2, den2: 3, lcm: 6 },
      { den1: 2, den2: 4, lcm: 4 },
      { den1: 3, den2: 4, lcm: 12 },
      { den1: 2, den2: 5, lcm: 10 },
      { den1: 3, den2: 6, lcm: 6 },
      { den1: 4, den2: 6, lcm: 12 }
    ];
    
    const pair = randomChoice(pairs);
    const num1 = random(1, pair.den1 - 1);
    const num2 = random(1, pair.den2 - 1);
    
    // แปลงเป็นตัวส่วนร่วม
    const newNum1 = num1 * (pair.lcm / pair.den1);
    const newNum2 = num2 * (pair.lcm / pair.den2);
    const answer = newNum1 + newNum2;
    
    // ✅ Validate
    if (!Number.isFinite(answer)) {
      console.error('P4: Invalid answer in generateFractionDifferentDenominator:', answer);
      return this.createQuestion('1/2 + 1/3 = ?/6', 5, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      `${num1}/${pair.den1} + ${num2}/${pair.den2} = ?/${pair.lcm}`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, Math.max(3, Math.floor(pair.lcm / 2)))
    );
  }

  // Level 41-50: เศษส่วน (คูณ)
  private generateFractionMultiply(level: number, config: LevelConfig): Question {
    const num1 = random(1, 5);
    const den1 = random(2, 8);
    const num2 = random(1, 5);
    const den2 = random(2, 8);
    const answerNum = num1 * num2;
    const answerDen = den1 * den2;
    
    // ลดรูปถ้าทำได้
    const gcd = this.gcd(answerNum, answerDen);
    
    // ✅ Validate GCD
    if (!Number.isFinite(gcd) || gcd === 0) {
      console.error('P4: Invalid GCD in generateFractionMultiply');
      return this.createQuestion('1/2 × 1/3 = 1/?', 6, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    const finalNum = answerNum / gcd;
    const finalDen = answerDen / gcd;
    
    // ✅ Validate final values
    if (!Number.isFinite(finalDen)) {
      console.error('P4: Invalid finalDen in generateFractionMultiply:', finalDen);
      return this.createQuestion('1/2 × 1/3 = 1/?', 6, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      `${num1}/${den1} × ${num2}/${den2} = ${finalNum}/?`,
      finalDen,
      QuestionType.MIXED,
      level,
      generateChoices(finalDen, 4, Math.max(3, Math.floor(finalDen * 0.5)))
    );
  }

  // Level 51-60: เศษส่วน (หาร)
  private generateFractionDivide(level: number, config: LevelConfig): Question {
    const num1 = random(1, 6);
    const den1 = random(2, 8);
    const num2 = random(1, 4);
    const den2 = random(2, 6);
    
    // หาร = คูณกับส่วนกลับ
    const answerNum = num1 * den2;
    const answerDen = den1 * num2;
    
    // ลดรูปถ้าทำได้
    const gcd = this.gcd(answerNum, answerDen);
    
    // ✅ Validate GCD
    if (!Number.isFinite(gcd) || gcd === 0) {
      console.error('P4: Invalid GCD in generateFractionDivide');
      return this.createQuestion('1/2 ÷ 1/3 = 3/?', 2, QuestionType.MIXED, level, [1, 2, 3, 4]);
    }
    
    const finalNum = answerNum / gcd;
    const finalDen = answerDen / gcd;
    
    // ✅ Validate final values
    if (!Number.isFinite(finalDen)) {
      console.error('P4: Invalid finalDen in generateFractionDivide:', finalDen);
      return this.createQuestion('1/2 ÷ 1/3 = 3/?', 2, QuestionType.MIXED, level, [1, 2, 3, 4]);
    }
    
    return this.createQuestion(
      `${num1}/${den1} ÷ ${num2}/${den2} = ${finalNum}/?`,
      finalDen,
      QuestionType.MIXED,
      level,
      generateChoices(finalDen, 4, Math.max(3, Math.floor(finalDen * 0.5)))
    );
  }

  // Level 61-70: ทศนิยม 1-2 ตำแหน่ง
  private generateDecimals(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const whole = random(1, 50);
        const decimal = random(1, 9);
        const value = whole * 10 + decimal;
        return { question: `${whole}.${decimal} × 10 = ?`, answer: value };
      },
      () => {
        const whole = random(1, 20);
        const decimal = random(10, 99);
        const value = whole * 100 + decimal;
        return { question: `${whole}.${decimal} × 100 = ?`, answer: value };
      },
      () => {
        const a = random(10, 99);
        const b = random(10, 99);
        const answer = a > b ? 1 : (a < b ? 2 : 3);
        return { question: `${Math.floor(a/10)}.${a%10} ? ${Math.floor(b/10)}.${b%10} (1=>, 2=<, 3==)`, answer };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P4: Invalid answer in generateDecimals:', type.answer);
      return this.createQuestion('5.5 × 10 = ?', 55, QuestionType.MIXED, level, [50, 55, 60, 65]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      type.question.includes('?') && type.question.includes('(1') ? [1, 2, 3] : generateChoices(type.answer, 4, 10)
    );
  }

  // Level 71-80: ทศนิยม (บวก ลบ)
  private generateDecimalOperations(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        const a = random(10, 99) / 10;
        const b = random(10, 50) / 10;
        const answer = Math.round((a + b) * 10);
        return { question: `${a.toFixed(1)} + ${b.toFixed(1)} = ? (ตอบ × 10)`, answer };
      },
      () => {
        const a = random(50, 99) / 10;
        const b = random(10, 40) / 10;
        const answer = Math.round((a - b) * 10);
        return { question: `${a.toFixed(1)} - ${b.toFixed(1)} = ? (ตอบ × 10)`, answer };
      },
      () => {
        const a = random(100, 999) / 100;
        const b = random(100, 500) / 100;
        const answer = Math.round((a + b) * 100);
        return { question: `${a.toFixed(2)} + ${b.toFixed(2)} = ? (ตอบ × 100)`, answer };
      }
    ];
    
    const op = randomChoice(operations)();
    
    // ✅ Validate
    if (!Number.isFinite(op.answer)) {
      console.error('P4: Invalid answer in generateDecimalOperations:', op.answer);
      return this.createQuestion('2.5 + 3.5 = ? (ตอบ × 10)', 60, QuestionType.MIXED, level, [55, 60, 65, 70]);
    }
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 10)
    );
  }

  // Level 81-85: มุมและการวัดมุม
  private generateAngles(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        return { question: `มุมฉาก = ? องศา`, answer: 90 };
      },
      () => {
        return { question: `มุมตรง = ? องศา`, answer: 180 };
      },
      () => {
        const angle1 = random(30, 80);
        const angle2 = random(30, 80);
        const angle3 = 180 - angle1 - angle2;
        return { question: `สามเหลี่ยม มุม ${angle1}° และ ${angle2}° มุมที่ 3 = ?°`, answer: angle3 };
      },
      () => {
        return { question: `มุมรอบจุด = ? องศา`, answer: 360 };
      },
      () => {
        const angle = randomChoice([30, 45, 60, 120, 135, 150]);
        const type = angle < 90 ? 1 : 2;
        return { question: `มุม ${angle}° เป็นมุม? (1=แหลม, 2=ป้าน, 3=ฉาก)`, answer: type };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P4: Invalid answer in generateAngles:', type.answer);
      return this.createQuestion('มุมฉาก = ? องศา', 90, QuestionType.MIXED, level, [80, 90, 100, 180]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      type.question.includes('(1=') ? [1, 2, 3] : generateChoices(type.answer, 4, 20)
    );
  }

  // Level 86-90: พื้นที่สี่เหลี่ยม สามเหลี่ยม
  private generateArea(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const length = random(5, 20);
        const width = random(3, 15);
        const area = length * width;
        return { question: `สี่เหลี่ยม กว้าง ${width} ยาว ${length} พื้นที่ = ?`, answer: area };
      },
      () => {
        const side = random(4, 15);
        const area = side * side;
        return { question: `จัตุรัส ด้าน ${side} พื้นที่ = ?`, answer: area };
      },
      () => {
        const base = random(6, 20);
        const height = random(4, 16);
        const area = (base * height) / 2;
        return { question: `สามเหลี่ยม ฐาน ${base} สูง ${height} พื้นที่ = ?`, answer: area };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P4: Invalid answer in generateArea:', type.answer);
      return this.createQuestion('สี่เหลี่ยม กว้าง 5 ยาว 10 พื้นที่ = ?', 50, QuestionType.MIXED, level, [40, 50, 60, 70]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(10, Math.floor(type.answer * 0.2)))
    );
  }

  // Level 91-95: เส้นรอบรูป
  private generatePerimeter(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const length = random(5, 25);
        const width = random(3, 20);
        const perimeter = 2 * (length + width);
        return { question: `สี่เหลี่ยม กว้าง ${width} ยาว ${length} เส้นรอบรูป = ?`, answer: perimeter };
      },
      () => {
        const side = random(5, 20);
        const perimeter = 4 * side;
        return { question: `จัตุรัส ด้าน ${side} เส้นรอบรูป = ?`, answer: perimeter };
      },
      () => {
        const a = random(5, 15);
        const b = random(6, 16);
        const c = random(7, 17);
        const perimeter = a + b + c;
        return { question: `สามเหลี่ยม ด้าน ${a}, ${b}, ${c} เส้นรอบรูป = ?`, answer: perimeter };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P4: Invalid answer in generatePerimeter:', type.answer);
      return this.createQuestion('จัตุรัส ด้าน 10 เส้นรอบรูป = ?', 40, QuestionType.MIXED, level, [35, 40, 45, 50]);
    }
    
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
        const a = random(100, 999);
        const b = randomChoice([10, 100, 1000]);
        const answer = a * b;
        return { question: `${a} × ${b} = ?`, answer };
      },
      () => {
        const frac = randomChoice([
          { num: 1, den: 2, dec: 5 },
          { num: 1, den: 4, dec: 25 },
          { num: 3, den: 4, dec: 75 }
        ]);
        return { question: `${frac.num}/${frac.den} = 0.?? (ตอบตัวเลขหลังจุด)`, answer: frac.dec };
      },
      () => {
        const side = random(5, 15);
        const area = side * side;
        const perimeter = 4 * side;
        const answer = area + perimeter;
        return { question: `จัตุรัส ด้าน ${side} พื้นที่ + เส้นรอบรูป = ?`, answer };
      },
      () => {
        const m = random(3, 15);
        const cm = m * 100;
        const mm = cm * 10;
        return { question: `${m} เมตร = ? มิลลิเมตร`, answer: mm };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P4: Invalid answer in generateMixedProblems:', type.answer);
      return this.createQuestion('100 × 10 = ?', 1000, QuestionType.MIXED, level, [900, 1000, 1100, 1200]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(100, Math.floor(type.answer * 0.1)))
    );
  }

  private gcd(a: number, b: number): number {
    // ✅ Validate inputs
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
      return 1; // Return safe fallback
    }
    return b === 0 ? a : this.gcd(b, a % b);
  }
}