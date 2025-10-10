// lib/game/generators/elementary/p5.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices,
  randomChoice
} from '../utils';

export class P5Generator extends BaseGenerator {
  constructor() {
    super('P5');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    return [QuestionType.MIXED];
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 10) {
      return this.generateLargeNumbers(level, config);
    } else if (level <= 20) {
      return this.generateFactors(level, config);
    } else if (level <= 30) {
      return this.generatePrimeNumbers(level, config);
    } else if (level <= 40) {
      return this.generateMixedNumbers(level, config);
    } else if (level <= 50) {
      return this.generateFractionOperations(level, config);
    } else if (level <= 60) {
      return this.generateDecimals3Places(level, config);
    } else if (level <= 70) {
      return this.generateDecimalMultiplyDivide(level, config);
    } else if (level <= 80) {
      return this.generatePercentage(level, config);
    } else if (level <= 85) {
      return this.generateQuadrilateralArea(level, config);
    } else if (level <= 90) {
      return this.generateTriangleArea(level, config);
    } else if (level <= 95) {
      return this.generateVolume(level, config);
    } else {
      return this.generateMixedProblems(level, config);
    }
  }

  // Level 1-10: จำนวนนับมากกว่า 1,000,000
  private generateLargeNumbers(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        const a = random(1000000, 9999999);
        const b = random(100000, 999999);
        const answer = a + b;
        return { question: `${a} + ${b} = ?`, answer };
      },
      () => {
        const a = random(5000000, 9999999);
        const b = random(1000000, 4000000);
        const answer = a - b;
        return { question: `${a} - ${b} = ?`, answer };
      },
      () => {
        const a = random(10000, 99999);
        const b = random(100, 999);
        const answer = a * b;
        return { question: `${a} × ${b} = ?`, answer };
      },
      () => {
        const a = random(1000000, 9999999);
        const b = random(1000000, 9999999);
        const answer = a > b ? 1 : (a < b ? 2 : 3);
        return { question: `${a} ? ${b} (1=>, 2=<, 3==)`, answer };
      }
    ];
    
    const op = randomChoice(operations)();
    
    // ✅ Validate
    if (!Number.isFinite(op.answer)) {
      console.error('P5: Invalid answer in generateLargeNumbers:', op.answer);
      return this.createQuestion('1000000 + 500000 = ?', 1500000, QuestionType.MIXED, level, [1400000, 1500000, 1600000, 1700000]);
    }
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      op.question.includes('(1=') ? [1, 2, 3] : generateChoices(op.answer, 4, Math.max(100000, Math.floor(op.answer * 0.05)))
    );
  }

  // Level 11-20: ตัวประกอบ
  private generateFactors(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const numbers: Record<number, number> = {
          12: 6, 18: 6, 20: 6, 24: 8, 30: 8, 36: 9
        };
        const num = randomChoice(Object.keys(numbers).map(Number));
        return { question: `${num} มีตัวประกอบกี่ตัว?`, answer: numbers[num] };
      },
      () => {
        const num = randomChoice([12, 15, 18, 20, 24, 30]);
        const answer = num / this.smallestPrimeFactor(num);
        return { question: `ตัวประกอบใหญ่สุดของ ${num} (ไม่รวม ${num}) = ?`, answer };
      },
      () => {
        const num = random(10, 50) * 2;
        return { question: `${num} เป็นจำนวน? (1=คู่, 2=คี่)`, answer: 1 };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generateFactors:', type.answer);
      return this.createQuestion('12 มีตัวประกอบกี่ตัว?', 6, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      type.question.includes('(1=') ? [1, 2] : generateChoices(type.answer, 4, 3)
    );
  }

  // Level 21-30: จำนวนเฉพาะ
  private generatePrimeNumbers(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        const nonPrimes = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25];
        const num = randomChoice([...primes, ...nonPrimes]);
        const answer = primes.includes(num) ? 1 : 2;
        return { question: `${num} เป็นจำนวน? (1=เฉพาะ, 2=ไม่เฉพาะ)`, answer };
      },
      () => {
        const pairs = [
          { from: 2, next: 3 }, { from: 3, next: 5 }, { from: 5, next: 7 },
          { from: 7, next: 11 }, { from: 11, next: 13 }, { from: 13, next: 17 },
          { from: 17, next: 19 }, { from: 19, next: 23 }
        ];
        const pair = randomChoice(pairs);
        return { question: `จำนวนเฉพาะถัดจาก ${pair.from} = ?`, answer: pair.next };
      },
      () => {
        const ranges = [
          { from: 10, to: 20, count: 4 },
          { from: 20, to: 30, count: 2 },
          { from: 30, to: 40, count: 2 },
          { from: 1, to: 10, count: 4 }
        ];
        const range = randomChoice(ranges);
        return { question: `จำนวนเฉพาะระหว่าง ${range.from}-${range.to} มีกี่จำนวน?`, answer: range.count };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generatePrimeNumbers:', type.answer);
      return this.createQuestion('2 เป็นจำนวน? (1=เฉพาะ, 2=ไม่เฉพาะ)', 1, QuestionType.MIXED, level, [1, 2]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      type.question.includes('(1=') ? [1, 2] : generateChoices(type.answer, 4, 3)
    );
  }

  // Level 31-40: เศษส่วนและจำนวนคละ
  private generateMixedNumbers(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const whole = random(2, 5);
        const num = random(1, 4);
        const den = random(3, 6);
        const answer = whole * den + num;
        return { question: `${whole} ${num}/${den} = ?/${den}`, answer };
      },
      () => {
        const den = random(3, 7);
        const whole = random(2, 5);
        const remainder = random(1, den - 1);
        const num = whole * den + remainder;
        return { question: `${num}/${den} = ${whole} ?/${den}`, answer: remainder };
      },
      () => {
        const whole1 = random(1, 3);
        const whole2 = random(1, 3);
        const den = randomChoice([4, 5, 6]);
        const num1 = random(1, den - 1);
        const num2 = random(1, den - 1);
        const totalNum = num1 + num2;
        const extraWhole = Math.floor(totalNum / den);
        const finalWhole = whole1 + whole2 + extraWhole;
        return { question: `${whole1} ${num1}/${den} + ${whole2} ${num2}/${den} = ? (ตอบจำนวนเต็ม)`, answer: finalWhole };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generateMixedNumbers:', type.answer);
      return this.createQuestion('2 1/4 = ?/4', 9, QuestionType.MIXED, level, [7, 8, 9, 10]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, Math.floor(type.answer * 0.3)))
    );
  }

  // Level 41-50: การบวกลบเศษส่วน
  private generateFractionOperations(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const den1 = randomChoice([2, 3, 4]);
        const den2 = randomChoice([3, 4, 6]);
        const lcm = this.lcm(den1, den2);
        
        // ✅ Validate LCM
        if (!Number.isFinite(lcm) || lcm === 0) {
          return { question: '1/2 + 1/3 = ?/6', answer: 5 };
        }
        
        const num1 = random(1, den1 - 1);
        const num2 = random(1, den2 - 1);
        const answer = (num1 * lcm / den1) + (num2 * lcm / den2);
        return { question: `${num1}/${den1} + ${num2}/${den2} = ?/${lcm}`, answer };
      },
      () => {
        const den1 = randomChoice([3, 4, 5]);
        const den2 = randomChoice([2, 3, 6]);
        const lcm = this.lcm(den1, den2);
        
        // ✅ Validate LCM
        if (!Number.isFinite(lcm) || lcm === 0) {
          return { question: '2/3 - 1/6 = ?/6', answer: 3 };
        }
        
        const num1 = random(Math.ceil(den1/2), den1 - 1);
        const num2 = random(1, Math.floor(den2/2));
        const answer = (num1 * lcm / den1) - (num2 * lcm / den2);
        return { question: `${num1}/${den1} - ${num2}/${den2} = ?/${lcm}`, answer };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generateFractionOperations:', type.answer);
      return this.createQuestion('1/2 + 1/3 = ?/6', 5, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, Math.floor(type.answer * 0.5)))
    );
  }

  // Level 51-60: ทศนิยม 3 ตำแหน่ง
  private generateDecimals3Places(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const num = random(100, 999);
        const divisor = randomChoice([10, 100, 1000]);
        const answer = num;
        return { question: `${num / divisor} × ${divisor} = ?`, answer };
      },
      () => {
        const a = random(100, 999);
        const b = random(100, 999);
        const answer = a > b ? 1 : (a < b ? 2 : 3);
        return { question: `0.${a} ? 0.${b} (1=>, 2=<, 3==)`, answer };
      },
      () => {
        const nums = [
          random(100, 300),
          random(301, 600),
          random(601, 999)
        ];
        const smallest = Math.min(...nums);
        return { question: `ค่าน้อยสุดคือ 0.${nums[0]}, 0.${nums[1]}, 0.${nums[2]} = 0.?`, answer: smallest };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generateDecimals3Places:', type.answer);
      return this.createQuestion('0.5 × 10 = ?', 5, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      type.question.includes('(1=') ? [1, 2, 3] : generateChoices(type.answer, 4, 50)
    );
  }

  // Level 61-70: ทศนิยม (คูณ หาร)
  private generateDecimalMultiplyDivide(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const decimal = random(10, 99) / 10;
        const multiplier = random(2, 9);
        const answer = Math.round(decimal * multiplier * 10);
        return { question: `${decimal.toFixed(1)} × ${multiplier} = ? (ตอบ × 10)`, answer };
      },
      () => {
        const dividend = random(20, 99) / 10;
        const divisor = randomChoice([2, 4, 5]);
        
        // ✅ Division by zero protection
        if (divisor === 0) {
          return { question: '5.0 ÷ 2 = ? (ตอบ × 10)', answer: 25 };
        }
        
        const answer = Math.round(dividend / divisor * 10);
        return { question: `${dividend.toFixed(1)} ÷ ${divisor} = ? (ตอบ × 10)`, answer };
      },
      () => {
        const a = random(10, 50) / 10;
        const b = random(10, 30) / 10;
        const answer = Math.round(a * b * 10);
        return { question: `${a.toFixed(1)} × ${b.toFixed(1)} = ? (ตอบ × 10)`, answer };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generateDecimalMultiplyDivide:', type.answer);
      return this.createQuestion('2.5 × 2 = ? (ตอบ × 10)', 50, QuestionType.MIXED, level, [40, 50, 60, 70]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, 10)
    );
  }

  // Level 71-80: ร้อยละ
  private generatePercentage(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const base = randomChoice([50, 100, 200, 400, 500]);
        const percent = randomChoice([10, 20, 25, 50, 75]);
        const answer = (base * percent) / 100;
        return { question: `${base} × ${percent}% = ?`, answer };
      },
      () => {
        const percent = randomChoice([20, 25, 50]);
        const value = random(10, 50);
        
        // ✅ Division by zero protection
        if (percent === 0) {
          return { question: '100 × 50% = ?', answer: 50 };
        }
        
        const base = (value * 100) / percent;
        return { question: `? × ${percent}% = ${value}`, answer: base };
      },
      () => {
        const part = random(10, 40);
        const whole = randomChoice([50, 100, 200]);
        
        // ✅ Division by zero protection
        if (whole === 0) {
          return { question: '50 จาก 100 = ?%', answer: 50 };
        }
        
        const answer = (part * 100) / whole;
        return { question: `${part} จาก ${whole} = ?%`, answer };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generatePercentage:', type.answer);
      return this.createQuestion('100 × 50% = ?', 50, QuestionType.MIXED, level, [40, 50, 60, 70]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(10, Math.floor(type.answer * 0.2)))
    );
  }

  // Level 81-85: พื้นที่รูปสี่เหลี่ยม
  private generateQuadrilateralArea(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const length = random(10, 30);
        const width = random(5, 20);
        const area = length * width;
        return { question: `สี่เหลี่ยมผืนผ้า ${length} × ${width} พื้นที่ = ?`, answer: area };
      },
      () => {
        const side = random(8, 25);
        const area = side * side;
        return { question: `สี่เหลี่ยมจัตุรัส ด้าน ${side} พื้นที่ = ?`, answer: area };
      },
      () => {
        const base = random(10, 25);
        const height = random(5, 15);
        const area = base * height;
        return { question: `สี่เหลี่ยมด้านขนาน ฐาน ${base} สูง ${height} พื้นที่ = ?`, answer: area };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generateQuadrilateralArea:', type.answer);
      return this.createQuestion('สี่เหลี่ยมจัตุรัส ด้าน 10 พื้นที่ = ?', 100, QuestionType.MIXED, level, [90, 100, 110, 120]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(20, Math.floor(type.answer * 0.15)))
    );
  }

  // Level 86-90: พื้นที่รูปสามเหลี่ยม
  private generateTriangleArea(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const base = random(8, 24);
        const height = random(6, 20);
        const area = (base * height) / 2;
        return { question: `สามเหลี่ยม ฐาน ${base} สูง ${height} พื้นที่ = ?`, answer: area };
      },
      () => {
        const area = random(20, 100);
        const base = randomChoice([4, 5, 8, 10]);
        
        // ✅ Division by zero protection
        if (base === 0) {
          return { question: 'สามเหลี่ยม พื้นที่ 40 ฐาน 8 สูง = ?', answer: 10 };
        }
        
        const height = (2 * area) / base;
        return { question: `สามเหลี่ยม พื้นที่ ${area} ฐาน ${base} สูง = ?`, answer: height };
      },
      () => {
        const area = random(30, 120);
        const height = randomChoice([6, 8, 10, 12]);
        
        // ✅ Division by zero protection
        if (height === 0) {
          return { question: 'สามเหลี่ยม พื้นที่ 48 สูง 8 ฐาน = ?', answer: 12 };
        }
        
        const base = (2 * area) / height;
        return { question: `สามเหลี่ยม พื้นที่ ${area} สูง ${height} ฐาน = ?`, answer: base };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generateTriangleArea:', type.answer);
      return this.createQuestion('สามเหลี่ยม ฐาน 10 สูง 8 พื้นที่ = ?', 40, QuestionType.MIXED, level, [35, 40, 45, 50]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(5, Math.floor(type.answer * 0.2)))
    );
  }

  // Level 91-95: ปริมาตร
  private generateVolume(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const length = random(5, 15);
        const width = random(4, 12);
        const height = random(3, 10);
        const volume = length * width * height;
        return { question: `กล่อง ${length}×${width}×${height} ปริมาตร = ?`, answer: volume };
      },
      () => {
        const side = random(4, 12);
        const volume = side * side * side;
        return { question: `ลูกบาศก์ ขอบ ${side} ปริมาตร = ?`, answer: volume };
      },
      () => {
        const side = randomChoice([3, 4, 5, 6]);
        const volume = side * side * side;
        return { question: `ลูกบาศก์ ปริมาตร ${volume} ขอบ = ?`, answer: side };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generateVolume:', type.answer);
      return this.createQuestion('ลูกบาศก์ ขอบ 5 ปริมาตร = ?', 125, QuestionType.MIXED, level, [100, 125, 150, 175]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(10, Math.floor(type.answer * 0.1)))
    );
  }

  // Level 96-100: โจทย์ผสม
  private generateMixedProblems(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const pairs = [
          { a: 12, b: 18, gcf: 6 },
          { a: 15, b: 20, gcf: 5 },
          { a: 24, b: 36, gcf: 12 },
          { a: 16, b: 24, gcf: 8 }
        ];
        const pair = randomChoice(pairs);
        return { question: `ห.ร.ม. ของ ${pair.a} และ ${pair.b} = ?`, answer: pair.gcf };
      },
      () => {
        const num = random(50, 200);
        const percent = randomChoice([20, 25, 50]);
        const answer = (num * percent) / 100;
        return { question: `${num} × ${percent}% = ?`, answer };
      },
      () => {
        const whole = random(2, 5);
        const num = random(1, 3);
        const den = randomChoice([4, 5, 6]);
        const totalNum = whole * den + num;
        return { question: `${whole} ${num}/${den} = ?/${den}`, answer: totalNum };
      },
      () => {
        const side = random(5, 10);
        const area = side * side;
        const volume = side * side * side;
        const answer = area + volume;
        return { question: `ลูกบาศก์ขอบ ${side} พื้นที่ 1 หน้า + ปริมาตร = ?`, answer };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P5: Invalid answer in generateMixedProblems:', type.answer);
      return this.createQuestion('ห.ร.ม. ของ 12 และ 18 = ?', 6, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(10, Math.floor(type.answer * 0.15)))
    );
  }

  private gcd(a: number, b: number): number {
    // ✅ Validate inputs
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return 1;
    }
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private lcm(a: number, b: number): number {
    // ✅ Validate inputs and prevent division by zero
    if (!Number.isFinite(a) || !Number.isFinite(b) || this.gcd(a, b) === 0) {
      return 1;
    }
    return (a * b) / this.gcd(a, b);
  }

  private smallestPrimeFactor(n: number): number {
    // ✅ Validate input
    if (!Number.isFinite(n) || n < 2) {
      return 2;
    }
    if (n % 2 === 0) return 2;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return i;
    }
    return n;
  }
}