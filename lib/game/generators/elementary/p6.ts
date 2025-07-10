// lib/game/generators/elementary/p6.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice,
  generateDivisibleNumbers,
  simplifyFraction,
  randomFloat
} from '../utils';

export class P6Generator extends BaseGenerator {
  constructor() {
    super('P6');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // P6 จะเน้นแค่โจทย์ตัวเลขล้วนๆ ไม่มีคำถามยาวๆ
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    return [QuestionType.MIXED]; // ทุก level ใช้ MIXED
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: การคำนวณเศษส่วน
      const types = [
        () => this.generateFractionOperations(level, config),
        () => this.generateMixedNumberConversion(level, config),
        () => this.generateFractionMultiplication(level, config)
      ];
      return randomChoice(types)();
    } else if (level <= 50) {
      // Level 26-50: ทศนิยมเบื้องต้น
      const types = [
        () => this.generateDecimalOperations(level, config),
        () => this.generateDecimalConversion(level, config),
        () => this.generateDecimalMultiplication(level, config)
      ];
      return randomChoice(types)();
    } else if (level <= 75) {
      // Level 51-75: ร้อยละเบื้องต้น
      const types = [
        () => this.generatePercentageCalculation(level, config),
        () => this.generatePercentageConversion(level, config),
        () => this.generateDiscountCalculation(level, config)
      ];
      return randomChoice(types)();
    } else {
      // Level 76-100: โจทย์ประยุกต์
      const types = [
        () => this.generateAdvancedPercentage(level, config),
        () => this.generateRatioProblems(level, config),
        () => this.generateInterestCalculation(level, config),
        () => this.generateAreaVolume(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateFractionOperations(level: number, config: LevelConfig): Question {
    const operations = [
      // บวกเศษส่วนต่างตัวส่วน
      () => {
        const den1 = randomChoice([2, 3, 4, 6]);
        const den2 = randomChoice([2, 3, 4, 6]);
        const num1 = random(1, den1 - 1);
        const num2 = random(1, den2 - 1);
        
        // หา LCM
        const lcm = den1 * den2 / this.gcd(den1, den2);
        const newNum1 = num1 * (lcm / den1);
        const newNum2 = num2 * (lcm / den2);
        const resultNum = newNum1 + newNum2;
        
        const [simplified, simplifiedDen] = simplifyFraction(resultNum, lcm);
        
        return {
          question: `${num1}/${den1} + ${num2}/${den2} = ?/${simplifiedDen}`,
          answer: simplified
        };
      },
      // คูณเศษส่วน
      () => {
        const num1 = random(1, 4);
        const den1 = random(num1 + 1, 8);
        const num2 = random(1, 5);
        const den2 = random(num2 + 1, 6);
        
        const resultNum = num1 * num2;
        const resultDen = den1 * den2;
        const [simplified, simplifiedDen] = simplifyFraction(resultNum, resultDen);
        
        return {
          question: `${num1}/${den1} × ${num2}/${den2} = ?/${simplifiedDen}`,
          answer: simplified
        };
      }
    ];
    
    const op = randomChoice(operations)();
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 3)
    );
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private generateMixedNumberConversion(level: number, config: LevelConfig): Question {
    const whole = random(1, 5);
    const num = random(1, 4);
    const den = random(num + 1, 8);
    const improperNum = whole * den + num;
    
    return this.createQuestion(
      `${whole} ${num}/${den} = ?/${den}`,
      improperNum,
      QuestionType.MIXED,
      level,
      generateChoices(improperNum, 4, 5)
    );
  }

  private generateFractionMultiplication(level: number, config: LevelConfig): Question {
    // เศษส่วน × จำนวนเต็ม
    const fraction = randomChoice([
      { num: 1, den: 2 },
      { num: 1, den: 3 },
      { num: 2, den: 3 },
      { num: 1, den: 4 },
      { num: 3, den: 4 }
    ]);
    
    const whole = generateDivisibleNumbers(fraction.den, 12, 60);
    const result = (whole * fraction.num) / fraction.den;
    
    return this.createQuestion(
      `${fraction.num}/${fraction.den} × ${whole} = ?`,
      result,
      QuestionType.MIXED,
      level,
      generateChoices(result, 4, Math.max(3, Math.floor(result * 0.3)))
    );
  }

  private generateDecimalOperations(level: number, config: LevelConfig): Question {
    const operations = [
      // บวกทศนิยม
      () => {
        const a = randomFloat(1, 20, 1);
        const b = randomFloat(1, 15, 1);
        const result = Math.round((a + b) * 10) / 10;
        return {
          question: `${a} + ${b} = ?`,
          answer: Math.round(result * 10) // คูณ 10 เพื่อให้ตอบเป็นจำนวนเต็ม
        };
      },
      // ลบทศนิยม
      () => {
        const a = randomFloat(5, 25, 1);
        const b = randomFloat(1, a - 1, 1);
        const result = Math.round((a - b) * 10) / 10;
        return {
          question: `${a} - ${b} = ?`,
          answer: Math.round(result * 10)
        };
      },
      // คูณทศนิยม
      () => {
        const a = randomFloat(1, 10, 1);
        const b = random(2, 8);
        const result = Math.round((a * b) * 10) / 10;
        return {
          question: `${a} × ${b} = ?`,
          answer: Math.round(result * 10)
        };
      }
    ];
    
    const op = randomChoice(operations)();
    
    return this.createQuestion(
      op.question + ' (× 10)',
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, Math.max(5, Math.floor(op.answer * 0.2)))
    );
  }

  private generateDecimalConversion(level: number, config: LevelConfig): Question {
    const conversions = [
      {
        fraction: { num: 1, den: 2 },
        decimal: 50,
        percent: 50
      },
      {
        fraction: { num: 1, den: 4 },
        decimal: 25,
        percent: 25
      },
      {
        fraction: { num: 3, den: 4 },
        decimal: 75,
        percent: 75
      },
      {
        fraction: { num: 1, den: 5 },
        decimal: 20,
        percent: 20
      },
      {
        fraction: { num: 2, den: 5 },
        decimal: 40,
        percent: 40
      }
    ];
    
    const conv = randomChoice(conversions);
    const conversionTypes = [
      {
        question: `${conv.fraction.num}/${conv.fraction.den} = 0.??`,
        answer: conv.decimal
      },
      {
        question: `0.${conv.decimal} = ?%`,
        answer: conv.percent
      }
    ];
    
    const convType = randomChoice(conversionTypes);
    
    return this.createQuestion(
      convType.question,
      convType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(convType.answer, 4, 15)
    );
  }

  private generateDecimalMultiplication(level: number, config: LevelConfig): Question {
    const a = randomFloat(0.1, 5, 1);
    const b = randomFloat(0.1, 5, 1);
    const result = Math.round(a * b * 100) / 100;
    
    return this.createQuestion(
      `${a} × ${b} = ? (× 100)`,
      Math.round(result * 100),
      QuestionType.MIXED,
      level,
      generateChoices(Math.round(result * 100), 4, Math.max(10, Math.floor(result * 100 * 0.2)))
    );
  }

  private generatePercentageCalculation(level: number, config: LevelConfig): Question {
    const percentages = [10, 15, 20, 25, 30, 40, 50, 60, 75];
    const percentage = randomChoice(percentages);
    const total = generateDivisibleNumbers(percentage, 20, 500);
    const result = (total * percentage) / 100;
    
    return this.createQuestion(
      `${percentage}% × ${total} = ?`,
      result,
      QuestionType.MIXED,
      level,
      generateChoices(result, 4, Math.max(10, Math.floor(result * 0.2)))
    );
  }

  private generatePercentageConversion(level: number, config: LevelConfig): Question {
    const fractions = [
      { num: 1, den: 5, percent: 20 },
      { num: 1, den: 4, percent: 25 },
      { num: 1, den: 2, percent: 50 },
      { num: 3, den: 4, percent: 75 },
      { num: 4, den: 5, percent: 80 }
    ];
    
    const frac = randomChoice(fractions);
    
    return this.createQuestion(
      `${frac.num}/${frac.den} = ?%`,
      frac.percent,
      QuestionType.MIXED,
      level,
      generateChoices(frac.percent, 4, 15)
    );
  }

  private generateDiscountCalculation(level: number, config: LevelConfig): Question {
    const originalPrice = random(200, 1000);
    const discountPercent = randomChoice([10, 15, 20, 25, 30]);
    const discountAmount = Math.floor(originalPrice * discountPercent / 100);
    const finalPrice = originalPrice - discountAmount;
    
    return this.createQuestion(
      `${originalPrice} - ${discountPercent}% = ?`,
      finalPrice,
      QuestionType.MIXED,
      level,
      generateChoices(finalPrice, 4, Math.max(50, Math.floor(finalPrice * 0.1)))
    );
  }

  private generateAdvancedPercentage(level: number, config: LevelConfig): Question {
    // การเพิ่มร้อยละ
    const original = random(100, 500);
    const increasePercent = randomChoice([10, 15, 20, 25, 30]);
    const increaseAmount = Math.floor(original * increasePercent / 100);
    const result = original + increaseAmount;
    
    return this.createQuestion(
      `${original} + ${increasePercent}% = ?`,
      result,
      QuestionType.MIXED,
      level,
      generateChoices(result, 4, Math.max(30, Math.floor(result * 0.15)))
    );
  }

  private generateRatioProblems(level: number, config: LevelConfig): Question {
    const ratio1 = random(2, 6);
    const ratio2 = random(2, 6);
    const multiplier = random(3, 8);
    const total = (ratio1 + ratio2) * multiplier;
    const part1 = ratio1 * multiplier;
    
    return this.createQuestion(
      `${ratio1}:${ratio2} = ?:${ratio2 * multiplier}`,
      part1,
      QuestionType.MIXED,
      level,
      generateChoices(part1, 4, Math.max(20, Math.floor(part1 * 0.2)))
    );
  }

  private generateInterestCalculation(level: number, config: LevelConfig): Question {
    // ดอกเบี้ยเงินฝาก
    const principal = random(1000, 5000);
    const rate = randomChoice([5, 6, 8, 10]);
    const time = random(1, 4);
    const interest = Math.floor(principal * rate * time / 100);
    
    return this.createQuestion(
      `${principal} × ${rate}% × ${time} ปี = ?`,
      interest,
      QuestionType.MIXED,
      level,
      generateChoices(interest, 4, Math.max(50, Math.floor(interest * 0.1)))
    );
  }

  private generateAreaVolume(level: number, config: LevelConfig): Question {
    const calculations = [
      // พื้นที่สี่เหลี่ยม
      () => {
        const length = random(10, 30);
        const width = random(8, 25);
        const area = length * width;
        return {
          question: `${length} × ${width} = ? (ตร.ม.)`,
          answer: area
        };
      },
      // พื้นที่วงกลม (π = 3.14)
      () => {
        const radius = random(5, 15);
        const area = Math.round(3.14 * radius * radius);
        return {
          question: `3.14 × ${radius}² = ?`,
          answer: area
        };
      }
    ];
    
    const calc = randomChoice(calculations)();
    
    return this.createQuestion(
      calc.question,
      calc.answer,
      QuestionType.MIXED,
      level,
      generateChoices(calc.answer, 4, Math.max(20, Math.floor(calc.answer * 0.15)))
    );
  }
}