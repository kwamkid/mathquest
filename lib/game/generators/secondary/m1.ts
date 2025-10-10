// lib/game/generators/secondary/m1.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices,
  randomChoice
} from '../utils';

export class M1Generator extends BaseGenerator {
  constructor() {
    super('M1');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // M1 ใช้แค่ MIXED (ตัวเลขล้วน) ไม่มีโจทย์ปัญหา
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // M1 ไม่มีโจทย์ปัญหา ให้ส่ง MIXED แทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    // M1 มีแค่ MIXED (ตัวเลขล้วน)
    return [QuestionType.MIXED];
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 10) {
      return this.generateIntegerAddSubtract(level, config);
    } else if (level <= 15) {
      return this.generateIntegerComparison(level, config);
    } else if (level <= 20) {
      return this.generateIntegerMultiply(level, config);
    } else if (level <= 25) {
      return this.generateIntegerDivide(level, config);
    } else if (level <= 30) {
      return this.generateBasicExponents(level, config);
    } else if (level <= 35) {
      return this.generateNegativeExponents(level, config);
    } else if (level <= 40) {
      return this.generateExponentMultiply(level, config);
    } else if (level <= 45) {
      return this.generateExponentDivide(level, config);
    } else if (level <= 50) {
      return this.generateExponentPower(level, config);
    } else if (level <= 60) {
      return this.generateSimpleEquations(level, config);
    } else if (level <= 70) {
      return this.generateAdvancedEquations(level, config);
    } else if (level <= 75) {
      return this.generateBracketEquations(level, config);
    } else if (level <= 80) {
      return this.generateFractionEquations(level, config);
    } else if (level <= 85) {
      return this.generateRatios(level, config);
    } else if (level <= 90) {
      return this.generatePercentages(level, config);
    } else if (level <= 95) {
      return this.generateFractionToDecimal(level, config);
    } else {
      return this.generateMixedProblems(level, config);
    }
  }

  // Level 1-10: จำนวนเต็มบวก/ลบ
  private generateIntegerAddSubtract(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        const a = random(-20, 20);
        const b = random(-15, 15);
        const answer = a + b;
        const question = b >= 0 ? `${a} + ${b} = ?` : `${a} + (${b}) = ?`;
        return { question, answer };
      },
      () => {
        const a = random(-15, 25);
        const b = random(-20, 20);
        const answer = a - b;
        const question = b >= 0 ? `${a} - ${b} = ?` : `${a} - (${b}) = ?`;
        return { question, answer };
      },
      () => {
        const a = random(-10, 10);
        const b = random(-10, 10);
        const answer = a + b;
        return { question: `(${a}) + (${b}) = ?`, answer };
      }
    ];
    
    const op = randomChoice(operations)();
    
    // ✅ ตรวจสอบว่าคำตอบเป็นตัวเลขที่ถูกต้อง
    if (!Number.isFinite(op.answer)) {
      console.error('Invalid answer in generateIntegerAddSubtract:', op.answer);
      return this.createQuestion('1 + 1 = ?', 2, QuestionType.MIXED, level, [1, 2, 3, 4]);
    }
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 10)
    );
  }

  // Level 11-15: เปรียบเทียบจำนวนเต็ม
  private generateIntegerComparison(level: number, config: LevelConfig): Question {
    const a = random(-20, 20);
    const b = random(-20, 20);
    let answer: number;
    let question: string;
    
    if (a < b) {
      answer = 1;
      question = `${a} ? ${b} (ตอบ 1=น้อยกว่า, 2=มากกว่า, 3=เท่ากับ)`;
    } else if (a > b) {
      answer = 2;
      question = `${a} ? ${b} (ตอบ 1=น้อยกว่า, 2=มากกว่า, 3=เท่ากับ)`;
    } else {
      answer = 3;
      question = `${a} ? ${b} (ตอบ 1=น้อยกว่า, 2=มากกว่า, 3=เท่ากับ)`;
    }
    
    return this.createQuestion(
      question,
      answer,
      QuestionType.MIXED,
      level,
      [1, 2, 3]
    );
  }

  // Level 16-20: คูณจำนวนเต็ม
  private generateIntegerMultiply(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        const a = random(-10, 10);
        const b = random(-8, 8);
        const answer = a * b;
        const question = `(${a}) × (${b}) = ?`;
        return { question, answer };
      },
      () => {
        const a = random(2, 12);
        const b = random(-9, -1);
        const answer = a * b;
        return { question: `${a} × (${b}) = ?`, answer };
      },
      () => {
        const a = random(-2, -1);
        const b = random(-2, -1);
        const c = random(-3, -1);
        const answer = a * b * c;
        return { question: `(${a}) × (${b}) × (${c}) = ?`, answer };
      }
    ];
    
    const op = randomChoice(operations)();
    
    if (!Number.isFinite(op.answer)) {
      console.error('Invalid answer in generateIntegerMultiply:', op.answer);
      return this.createQuestion('2 × 3 = ?', 6, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 20)
    );
  }

  // Level 21-25: หารจำนวนเต็ม
  private generateIntegerDivide(level: number, config: LevelConfig): Question {
    const operations = [
      () => {
        // ✅ ป้องกัน division by zero
        const divisors = [-6, -4, -3, -2, 2, 3, 4, 6];
        const b = randomChoice(divisors);
        const quotient = random(-8, 8);
        const a = b * quotient;
        return { question: `${a} ÷ (${b}) = ?`, answer: quotient };
      },
      () => {
        const b = random(2, 10);
        const quotient = random(-10, -1);
        const a = b * quotient;
        return { question: `(${a}) ÷ ${b} = ?`, answer: quotient };
      },
      () => {
        const divisor = random(-10, -2);
        return { question: `0 ÷ (${divisor}) = ?`, answer: 0 };
      }
    ];
    
    const op = randomChoice(operations)();
    
    if (!Number.isFinite(op.answer)) {
      console.error('Invalid answer in generateIntegerDivide:', op.answer);
      return this.createQuestion('6 ÷ 2 = ?', 3, QuestionType.MIXED, level, [2, 3, 4, 5]);
    }
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 8)
    );
  }

  // Level 26-30: เลขยกกำลังพื้นฐาน
  private generateBasicExponents(level: number, config: LevelConfig): Question {
    const bases = [2, 3, 4, 5, 10];
    const base = randomChoice(bases);
    const exponent = random(2, 4);
    const answer = Math.pow(base, exponent);
    
    if (!Number.isFinite(answer) || answer > 10000) {
      return this.createQuestion('2^3 = ?', 8, QuestionType.MIXED, level, [6, 7, 8, 9]);
    }
    
    return this.createQuestion(
      `${base}^${exponent} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 50)
    );
  }

  // Level 31-35: เลขยกกำลังของจำนวนลบ
  private generateNegativeExponents(level: number, config: LevelConfig): Question {
    const bases = [-1, -2, -3, -4];
    const base = randomChoice(bases);
    const exponent = random(2, 4);
    const answer = Math.pow(base, exponent);
    
    if (!Number.isFinite(answer)) {
      return this.createQuestion('(-2)^2 = ?', 4, QuestionType.MIXED, level, [2, 3, 4, 5]);
    }
    
    return this.createQuestion(
      `(${base})^${exponent} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 20)
    );
  }

  // Level 36-40: กฎเลขยกกำลัง (คูณ)
  private generateExponentMultiply(level: number, config: LevelConfig): Question {
    const base = randomChoice([2, 3, 5, 10]);
    const exp1 = random(1, 4);
    const exp2 = random(1, 3);
    const answer = exp1 + exp2;
    
    return this.createQuestion(
      `${base}^${exp1} × ${base}^${exp2} = ${base}^?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  // Level 41-45: กฎเลขยกกำลัง (หาร)
  private generateExponentDivide(level: number, config: LevelConfig): Question {
    const base = randomChoice([2, 3, 4, 10]);
    const exp1 = random(4, 8);
    const exp2 = random(1, exp1 - 1);
    const answer = exp1 - exp2;
    
    return this.createQuestion(
      `${base}^${exp1} ÷ ${base}^${exp2} = ${base}^?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  // Level 46-50: กฎเลขยกกำลัง (ยกกำลัง)
  private generateExponentPower(level: number, config: LevelConfig): Question {
    const base = randomChoice([2, 3, 5, 10]);
    const exp1 = random(2, 3);
    const exp2 = random(2, 3);
    const answer = exp1 * exp2;
    
    return this.createQuestion(
      `(${base}^${exp1})^${exp2} = ${base}^?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 4)
    );
  }

  // Level 51-60: สมการเชิงเส้นง่าย
  private generateSimpleEquations(level: number, config: LevelConfig): Question {
    const equations = [
      () => {
        const x = random(1, 15);
        const b = random(3, 20);
        const result = x + b;
        return { question: `x + ${b} = ${result}, x = ?`, answer: x };
      },
      () => {
        const x = random(5, 25);
        const b = random(1, 10);
        const result = x - b;
        return { question: `x - ${b} = ${result}, x = ?`, answer: x };
      },
      () => {
        const x = random(2, 12);
        const a = randomChoice([2, 3, 4, 5]);
        const result = a * x;
        return { question: `${a}x = ${result}, x = ?`, answer: x };
      },
      () => {
        const divisor = randomChoice([2, 3, 4, 5]);
        const x = random(2, 10) * divisor;
        const result = x / divisor;
        return { question: `x/${divisor} = ${result}, x = ?`, answer: x };
      }
    ];
    
    const eq = randomChoice(equations)();
    
    if (!Number.isFinite(eq.answer)) {
      return this.createQuestion('x + 5 = 10, x = ?', 5, QuestionType.MIXED, level, [3, 4, 5, 6]);
    }
    
    return this.createQuestion(
      eq.question,
      eq.answer,
      QuestionType.MIXED,
      level,
      generateChoices(eq.answer, 4, 5)
    );
  }

  // Level 61-70: สมการเชิงเส้น (ขั้นสูง)
  private generateAdvancedEquations(level: number, config: LevelConfig): Question {
    const equations = [
      () => {
        const x = random(1, 8);
        const a = randomChoice([2, 3, 4, 5]);
        const b = random(2, 15);
        const result = a * x + b;
        return { question: `${a}x + ${b} = ${result}, x = ?`, answer: x };
      },
      () => {
        const x = random(2, 10);
        const a = randomChoice([2, 3, 4, 6]);
        const b = random(1, 10);
        const result = a * x - b;
        return { question: `${a}x - ${b} = ${result}, x = ?`, answer: x };
      },
      () => {
        const x = random(3, 12);
        const a = randomChoice([2, 3, 5]);
        const b = random(5, 20);
        const result = b - a * x;
        return { question: `${b} - ${a}x = ${result}, x = ?`, answer: x };
      }
    ];
    
    const eq = randomChoice(equations)();
    
    if (!Number.isFinite(eq.answer)) {
      return this.createQuestion('2x + 4 = 10, x = ?', 3, QuestionType.MIXED, level, [2, 3, 4, 5]);
    }
    
    return this.createQuestion(
      eq.question,
      eq.answer,
      QuestionType.MIXED,
      level,
      generateChoices(eq.answer, 4, 5)
    );
  }

  // Level 71-75: สมการมีวงเล็บ
  private generateBracketEquations(level: number, config: LevelConfig): Question {
    const equations = [
      () => {
        const x = random(1, 8);
        const a = randomChoice([2, 3, 4, 5]);
        const b = random(1, 5);
        const result = a * (x + b);
        return { question: `${a}(x + ${b}) = ${result}, x = ?`, answer: x };
      },
      () => {
        const x = random(3, 12);
        const a = randomChoice([2, 3, 4]);
        const b = random(1, 4);
        const result = a * (x - b);
        return { question: `${a}(x - ${b}) = ${result}, x = ?`, answer: x };
      },
      () => {
        const x = random(2, 10);
        const a = randomChoice([2, 3]);
        const b = random(1, 6);
        const c = random(2, 8);
        const result = a * (x + b) + c;
        return { question: `${a}(x + ${b}) + ${c} = ${result}, x = ?`, answer: x };
      }
    ];
    
    const eq = randomChoice(equations)();
    
    if (!Number.isFinite(eq.answer)) {
      return this.createQuestion('2(x + 3) = 10, x = ?', 2, QuestionType.MIXED, level, [1, 2, 3, 4]);
    }
    
    return this.createQuestion(
      eq.question,
      eq.answer,
      QuestionType.MIXED,
      level,
      generateChoices(eq.answer, 4, 5)
    );
  }

  // Level 76-80: สมการเศษส่วน
  private generateFractionEquations(level: number, config: LevelConfig): Question {
    const equations = [
      () => {
        const divisor = randomChoice([2, 3, 4, 5]);
        const x = random(2, 8) * divisor;
        const b = random(1, 10);
        const result = (x / divisor) + b;
        return { question: `x/${divisor} + ${b} = ${result}, x = ?`, answer: x };
      },
      () => {
        const divisor = randomChoice([2, 3, 4]);
        const x = random(3, 10) * divisor;
        const b = random(1, 5);
        const result = (x / divisor) - b;
        return { question: `x/${divisor} - ${b} = ${result}, x = ?`, answer: x };
      },
      () => {
        const b = randomChoice([2, 3, 4, 5]);
        const a = random(1, 10);
        const result = random(2, 8);
        const x = result * b - a;
        return { question: `(x + ${a})/${b} = ${result}, x = ?`, answer: x };
      }
    ];
    
    const eq = randomChoice(equations)();
    
    if (!Number.isFinite(eq.answer)) {
      return this.createQuestion('x/2 + 3 = 8, x = ?', 10, QuestionType.MIXED, level, [8, 9, 10, 11]);
    }
    
    return this.createQuestion(
      eq.question,
      eq.answer,
      QuestionType.MIXED,
      level,
      generateChoices(eq.answer, 4, 5)
    );
  }

  // Helper GCD
  private gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a || 1;
  }

  // Level 81-85: อัตราส่วน
  private generateRatios(level: number, config: LevelConfig): Question {
    const ratios = [
      () => {
        const a = random(2, 6);
        const b = random(3, 8);
        const gcd = this.gcd(a, b);
        const scale = random(2, 5);
        const c = (a / gcd) * scale;
        const d = (b / gcd) * scale;
        return { question: `${a}:${b} = ${c}:?`, answer: d };
      },
      () => {
        const a = random(3, 8);
        const b = random(4, 12);
        const gcd = this.gcd(a, b);
        const scale = random(2, 4);
        const c = (a / gcd) * scale;
        const d = (b / gcd) * scale;
        return { question: `${a}:${b} = ?:${d}`, answer: c };
      }
    ];
    
    const ratio = randomChoice(ratios)();
    
    if (!Number.isFinite(ratio.answer) || ratio.answer <= 0) {
      return this.createQuestion('2:3 = 4:?', 6, QuestionType.MIXED, level, [5, 6, 7, 8]);
    }
    
    return this.createQuestion(
      ratio.question,
      Math.round(ratio.answer),
      QuestionType.MIXED,
      level,
      generateChoices(Math.round(ratio.answer), 4, 5)
    );
  }

  // Level 86-90: ร้อยละพื้นฐาน
  private generatePercentages(level: number, config: LevelConfig): Question {
    const percents = [10, 20, 25, 50, 75];
    const percent = randomChoice(percents);
    const base = random(4, 20) * 10;
    const answer = (percent * base) / 100;
    
    if (!Number.isFinite(answer)) {
      return this.createQuestion('100 × 50% = ?', 50, QuestionType.MIXED, level, [40, 45, 50, 55]);
    }
    
    return this.createQuestion(
      `${base} × ${percent}% = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 20)
    );
  }

  // Level 91-95: เปลี่ยนเศษส่วนเป็นทศนิยม
  private generateFractionToDecimal(level: number, config: LevelConfig): Question {
    const fractions = [
      { num: 1, den: 2, dec: 5 },
      { num: 1, den: 4, dec: 25 },
      { num: 3, den: 4, dec: 75 },
      { num: 1, den: 5, dec: 2 },
      { num: 2, den: 5, dec: 4 },
      { num: 3, den: 5, dec: 6 },
      { num: 4, den: 5, dec: 8 },
      { num: 1, den: 10, dec: 1 },
      { num: 3, den: 10, dec: 3 },
      { num: 7, den: 10, dec: 7 }
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

  // Level 96-100: โจทย์ผสม
  private generateMixedProblems(level: number, config: LevelConfig): Question {
    const problems = [
      () => {
        const base1 = randomChoice([2, 3]);
        const exp1 = random(2, 4);
        const base2 = randomChoice([2, 3]);
        const exp2 = random(2, 3);
        const answer = Math.pow(base1, exp1) + Math.pow(base2, exp2);
        return { question: `${base1}^${exp1} + ${base2}^${exp2} = ?`, answer };
      },
      () => {
        const base1 = random(4, 6);
        const base2 = random(2, 4);
        const answer = Math.pow(base1, 2) - Math.pow(base2, 2);
        return { question: `${base1}^2 - ${base2}^2 = ?`, answer };
      },
      () => {
        const mult = random(2, 4);
        const base = random(2, 4);
        const add = random(3, 10);
        const answer = mult * Math.pow(base, 2) + add;
        return { question: `${mult} × ${base}^2 + ${add} = ?`, answer };
      }
    ];
    
    const problem = randomChoice(problems)();
    
    if (!Number.isFinite(problem.answer)) {
      return this.createQuestion('2^2 + 3^2 = ?', 13, QuestionType.MIXED, level, [11, 12, 13, 14]);
    }
    
    return this.createQuestion(
      problem.question,
      problem.answer,
      QuestionType.MIXED,
      level,
      generateChoices(problem.answer, 4, 15)
    );
  }
}