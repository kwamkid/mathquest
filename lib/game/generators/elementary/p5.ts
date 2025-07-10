// lib/game/generators/elementary/p5.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice,
  generateDivisibleNumbers,
  simplifyFraction
} from '../utils';

export class P5Generator extends BaseGenerator {
  constructor() {
    super('P5');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // P5 จะเน้นแค่โจทย์ตัวเลขล้วนๆ ไม่มีคำถามยาวๆ
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
      return [QuestionType.DIVISION];
    } else if (level <= 75) {
      return [QuestionType.MIXED]; // เศษส่วน
    } else {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION, QuestionType.MIXED];
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: คูณ 3 หลัก
      return this.generateThreeDigitMultiplication(level, config);
    } else if (level <= 50) {
      // Level 26-50: หารยาว
      return this.generateLongDivision(level, config);
    } else if (level <= 75) {
      // Level 51-75: เศษส่วนเบื้องต้น
      const types = [
        () => this.generateFractionAddition(level, config),
        () => this.generateFractionSubtraction(level, config),
        () => this.generateFractionMultiplication(level, config),
        () => this.generateFractionToDecimal(level, config)
      ];
      return randomChoice(types)();
    } else {
      // Level 76-100: โจทย์ผสม
      const types = [
        () => this.generateThreeDigitMultiplication(level, config),
        () => this.generateLongDivision(level, config),
        () => this.generateAdvancedCalculation(level, config),
        () => this.generatePercentageBasic(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateThreeDigitMultiplication(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: คูณ 3 หลัก กับ 1 หลัก
      const a = random(100, 300);
      const b = random(2, 12);
      const answer = a * b;
      
      return this.createQuestion(
        `${a} × ${b} = ?`,
        answer,
        QuestionType.MULTIPLICATION,
        level,
        generateChoices(answer, 4, Math.max(50, Math.floor(answer * 0.1)))
      );
    } else {
      // Level 26+: คูณเลขใหญ่ขึ้น
      const a = random(150, 500);
      const b = random(3, 15);
      const answer = a * b;
      
      return this.createQuestion(
        `${a} × ${b} = ?`,
        answer,
        QuestionType.MULTIPLICATION,
        level,
        generateChoices(answer, 4, Math.max(100, Math.floor(answer * 0.1)))
      );
    }
  }

  private generateLongDivision(level: number, config: LevelConfig): Question {
    if (level <= 50) {
      // Level 26-50: หารยาว
      const divisor = random(10, 50);
      const quotient = random(8, 40);
      const dividend = divisor * quotient;
      
      return this.createQuestion(
        `${dividend} ÷ ${divisor} = ?`,
        quotient,
        QuestionType.DIVISION,
        level,
        generateChoices(quotient, 4, Math.max(5, Math.floor(quotient * 0.3)))
      );
    } else {
      // Level 51+: หารยาวซับซ้อน
      const divisor = random(15, 80);
      const quotient = random(12, 60);
      const dividend = divisor * quotient;
      
      return this.createQuestion(
        `${dividend} ÷ ${divisor} = ?`,
        quotient,
        QuestionType.DIVISION,
        level,
        generateChoices(quotient, 4, Math.max(8, Math.floor(quotient * 0.2)))
      );
    }
  }

  private generateFractionAddition(level: number, config: LevelConfig): Question {
    // บวกเศษส่วนตัวส่วนเดียวกัน
    const denominator = randomChoice([2, 3, 4, 5, 6, 8]);
    const num1 = random(1, denominator - 1);
    const num2 = random(1, denominator - num1);
    const answerNum = num1 + num2;
    
    // ลดรูป
    const [simplifiedNum, simplifiedDen] = simplifyFraction(answerNum, denominator);
    
    if (simplifiedDen === 1) {
      // ผลลัพธ์เป็นจำนวนเต็ม
      return this.createQuestion(
        `${num1}/${denominator} + ${num2}/${denominator} = ?`,
        simplifiedNum,
        QuestionType.MIXED,
        level,
        generateChoices(simplifiedNum, 4, 2)
      );
    } else {
      // ถามเฉพาะตัวเศษ (ระบุตัวส่วน)
      return this.createQuestion(
        `${num1}/${denominator} + ${num2}/${denominator} = ?/${simplifiedDen}`,
        simplifiedNum,
        QuestionType.MIXED,
        level,
        generateChoices(simplifiedNum, 4, 3)
      );
    }
  }

  private generateFractionSubtraction(level: number, config: LevelConfig): Question {
    const denominator = randomChoice([3, 4, 5, 6, 8]);
    const num1 = random(2, denominator);
    const num2 = random(1, num1 - 1);
    const answerNum = num1 - num2;
    
    const [simplifiedNum, simplifiedDen] = simplifyFraction(answerNum, denominator);
    
    if (simplifiedDen === 1) {
      return this.createQuestion(
        `${num1}/${denominator} - ${num2}/${denominator} = ?`,
        simplifiedNum,
        QuestionType.MIXED,
        level,
        generateChoices(simplifiedNum, 4, 2)
      );
    } else {
      return this.createQuestion(
        `${num1}/${denominator} - ${num2}/${denominator} = ?/${simplifiedDen}`,
        simplifiedNum,
        QuestionType.MIXED,
        level,
        generateChoices(simplifiedNum, 4, 3)
      );
    }
  }

  private generateFractionMultiplication(level: number, config: LevelConfig): Question {
    // เศษส่วน × จำนวนเต็ม
    const fractions = [
      { num: 1, den: 2 },
      { num: 1, den: 3 },
      { num: 1, den: 4 },
      { num: 2, den: 3 },
      { num: 3, den: 4 }
    ];
    
    const fraction = randomChoice(fractions);
    const whole = generateDivisibleNumbers(fraction.den, 12, 60);
    const answer = (whole * fraction.num) / fraction.den;
    
    return this.createQuestion(
      `${fraction.num}/${fraction.den} × ${whole} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, Math.max(3, Math.floor(answer * 0.3)))
    );
  }

  private generateFractionToDecimal(level: number, config: LevelConfig): Question {
    const fractions = [
      { num: 1, den: 2, decimal: 50 },  // 0.5 → 50
      { num: 1, den: 4, decimal: 25 },  // 0.25 → 25
      { num: 3, den: 4, decimal: 75 },  // 0.75 → 75
      { num: 1, den: 5, decimal: 20 },  // 0.2 → 20
      { num: 2, den: 5, decimal: 40 },  // 0.4 → 40
    ];
    
    const fraction = randomChoice(fractions);
    
    return this.createQuestion(
      `${fraction.num}/${fraction.den} = 0.??`,
      fraction.decimal,
      QuestionType.MIXED,
      level,
      generateChoices(fraction.decimal, 4, 15)
    );
  }

  private generateAdvancedCalculation(level: number, config: LevelConfig): Question {
    const operations = [
      // (a + b) ÷ c
      () => {
        const c = random(10, 50);
        const quotient = random(4, 20);
        const sum = c * quotient;
        const a = random(Math.floor(sum * 0.3), Math.floor(sum * 0.7));
        const b = sum - a;
        return {
          question: `(${a} + ${b}) ÷ ${c} = ?`,
          answer: quotient
        };
      },
      // a × b + c × d
      () => {
        const a = random(5, 15);
        const b = random(4, 12);
        const c = random(3, 10);
        const d = random(5, 15);
        return {
          question: `${a} × ${b} + ${c} × ${d} = ?`,
          answer: (a * b) + (c * d)
        };
      },
      // a × b - c × d
      () => {
        const a = random(10, 20);
        const b = random(5, 15);
        const c = random(3, 8);
        const d = random(4, 10);
        const product1 = a * b;
        const product2 = c * d;
        if (product1 > product2) {
          return {
            question: `${a} × ${b} - ${c} × ${d} = ?`,
            answer: product1 - product2
          };
        } else {
          return {
            question: `${c} × ${d} - ${a} × ${b} = ?`,
            answer: product2 - product1
          };
        }
      }
    ];
    
    const op = randomChoice(operations)();
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, Math.max(20, Math.floor(op.answer * 0.1)))
    );
  }

  private generatePercentageBasic(level: number, config: LevelConfig): Question {
    const percentages = [10, 20, 25, 50, 75];
    const percentage = randomChoice(percentages);
    const total = generateDivisibleNumbers(percentage === 25 ? 4 : percentage === 75 ? 4 : percentage / 10, 20, 200);
    const answer = (total * percentage) / 100;
    
    return this.createQuestion(
      `${percentage}% × ${total} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, Math.max(5, Math.floor(answer * 0.3)))
    );
  }
}