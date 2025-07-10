// lib/game/generators/elementary/p5.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  getRandomColor, 
  getRandomFruit, 
  getRandomAnimal,
  getRandomToy,
  getRandomName,
  randomChoice,
  generateDivisibleNumbers,
  fractionToDecimal,
  simplifyFraction,
  generateFractionChoices
} from '../utils';

export class P5Generator extends BaseGenerator {
  constructor() {
    super('P5');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    const questionType = randomChoice(this.getAvailableQuestionTypes(level));
    
    switch (questionType) {
      case QuestionType.MULTIPLICATION:
        return this.generateMultiplication(level, config);
      case QuestionType.DIVISION:
        return this.generateDivision(level, config);
      case QuestionType.MIXED:
        return this.generateMixed(level, config);
      case QuestionType.WORD_PROBLEM:
        return this.generateWordProblem(level, config);
      default:
        return this.generateMultiplication(level, config);
    }
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    const problemTypes = [
      () => this.generateVolumeAreaProblem(level, config),
      () => this.generateBusinessProblem(level, config),
      () => this.generatePercentageProblem(level, config),
      () => this.generateFractionWordProblem(level, config),
      () => this.generateMultiStepProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.MULTIPLICATION]; // คูณ 3 หลัก
    } else if (level <= 50) {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION]; // หารยาว
    } else if (level <= 75) {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION, QuestionType.MIXED]; // เศษส่วนเบื้องต้น
    } else {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION, QuestionType.MIXED, QuestionType.WORD_PROBLEM]; // โจทย์ปัญหาซับซ้อน
    }
  }

  private generateMultiplication(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: คูณเลข 3 หลัก
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

  private generateDivision(level: number, config: LevelConfig): Question {
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

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 75) {
      // Level 51-75: เศษส่วนเบื้องต้น
      const fractionTypes = [
        () => this.generateFractionAddition(level, config),
        () => this.generateFractionSubtraction(level, config),
        () => this.generateFractionComparison(level, config),
        () => this.generateFractionToDecimal(level, config)
      ];
      return randomChoice(fractionTypes)();
    } else {
      // Level 76+: โจทย์ซับซ้อน
      const types = [
        () => this.generateFractionAddition(level, config),
        () => this.generateAdvancedCalculation(level, config),
        () => this.generatePercentageBasic(level, config)
      ];
      return randomChoice(types)();
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
      // ผลลัพธ์เป็นเศษส่วน - ให้ตอบเป็นทศนิยม
      const decimal = Math.round(fractionToDecimal(simplifiedNum, simplifiedDen) * 100) / 100;
      
      return this.createQuestion(
        `${num1}/${denominator} + ${num2}/${denominator} = ? (ตอบเป็นทศนิยม)`,
        Math.round(decimal * 100), // คูณ 100 เพื่อให้ตอบเป็นจำนวนเต็ม
        QuestionType.MIXED,
        level,
        generateChoices(Math.round(decimal * 100), 4, 10)
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
      const decimal = Math.round(fractionToDecimal(simplifiedNum, simplifiedDen) * 100) / 100;
      
      return this.createQuestion(
        `${num1}/${denominator} - ${num2}/${denominator} = ? (ตอบเป็นทศนิยม คูณ 100)`,
        Math.round(decimal * 100),
        QuestionType.MIXED,
        level,
        generateChoices(Math.round(decimal * 100), 4, 8)
      );
    }
  }

  private generateFractionComparison(level: number, config: LevelConfig): Question {
    const fractions = [
      { num: 1, den: 2, decimal: 0.5 },
      { num: 1, den: 3, decimal: 0.33 },
      { num: 1, den: 4, decimal: 0.25 },
      { num: 2, den: 3, decimal: 0.67 },
      { num: 3, den: 4, decimal: 0.75 }
    ];
    
    const frac1 = randomChoice(fractions);
    const frac2 = randomChoice(fractions.filter(f => f.decimal !== frac1.decimal));
    
    let question: string;
    let answer: number;
    
    if (frac1.decimal > frac2.decimal) {
      question = `${frac1.num}/${frac1.den} กับ ${frac2.num}/${frac2.den} อันไหนมากกว่า? (ตอบ 1=ตัวแรก, 2=ตัวที่สอง)`;
      answer = 1;
    } else {
      question = `${frac1.num}/${frac1.den} กับ ${frac2.num}/${frac2.den} อันไหนน้อยกว่า? (ตอบ 1=ตัวแรก, 2=ตัวที่สอง)`;
      answer = 1;
    }
    
    return this.createQuestion(
      question,
      answer,
      QuestionType.MIXED,
      level,
      [1, 2]
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
      `${fraction.num}/${fraction.den} = กี่เปอร์เซ็นต์?`,
      fraction.decimal,
      QuestionType.MIXED,
      level,
      generateChoices(fraction.decimal, 4, 15)
    );
  }

  private generateAdvancedCalculation(level: number, config: LevelConfig): Question {
    const operations = [
      {
        generate: () => {
          const a = random(200, 800);
          const b = random(150, 600);
          const c = random(10, 50);
          return {
            question: `(${a} + ${b}) ÷ ${c} = ?`,
            answer: Math.floor((a + b) / c)
          };
        }
      },
      {
        generate: () => {
          const a = random(15, 40);
          const b = random(20, 60);
          const c = random(100, 300);
          return {
            question: `${a} × ${b} + ${c} = ?`,
            answer: (a * b) + c
          };
        }
      }
    ];
    
    const op = randomChoice(operations).generate();
    
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
      `${percentage}% ของ ${total} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, Math.max(5, Math.floor(answer * 0.3)))
    );
  }

  private generateVolumeAreaProblem(level: number, config: LevelConfig): Question {
    const problemTypes = [
      {
        generate: () => {
          const length = random(15, 40);
          const width = random(12, 30);
          const height = random(8, 25);
          const volume = length * width * height;
          return {
            question: `กล่องยาว ${length} ซม. กว้าง ${width} ซม. สูง ${height} ซม. ปริมาตรกี่ลูกบาศก์เซนติเมตร?`,
            answer: volume
          };
        }
      },
      {
        generate: () => {
          const radius = random(5, 15);
          const area = Math.round(3.14 * radius * radius);
          return {
            question: `วงกลมรัศมี ${radius} ซม. พื้นที่ประมาณกี่ตารางเซนติเมตร? (ใช้ π = 3.14)`,
            answer: area
          };
        }
      }
    ];
    
    const problem = randomChoice(problemTypes).generate();
    
    return this.createQuestion(
      problem.question,
      problem.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(problem.answer, 4, Math.max(50, Math.floor(problem.answer * 0.15)))
    );
  }

  private generateBusinessProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const cost = random(800, 2000);
          const profitPercent = randomChoice([10, 15, 20, 25]);
          const sellingPrice = cost + Math.floor(cost * profitPercent / 100);
          return {
            question: `สินค้าต้นทุน ${cost} บาท ขายได้กำไร ${profitPercent}% ขายในราคาเท่าไร?`,
            answer: sellingPrice
          };
        }
      },
      {
        generate: () => {
          const originalPrice = random(500, 1500);
          const discountPercent = randomChoice([10, 15, 20, 25]);
          const discountAmount = Math.floor(originalPrice * discountPercent / 100);
          const finalPrice = originalPrice - discountAmount;
          return {
            question: `สินค้าราคา ${originalPrice} บาท ลดราคา ${discountPercent}% ราคาขายจริงเท่าไร?`,
            answer: finalPrice
          };
        }
      }
    ];
    
    const problem = randomChoice(scenarios).generate();
    
    return this.createQuestion(
      problem.question,
      problem.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(problem.answer, 4, Math.max(50, Math.floor(problem.answer * 0.1)))
    );
  }

  private generatePercentageProblem(level: number, config: LevelConfig): Question {
    const students = generateDivisibleNumbers(4, 40, 120);
    const percentage = randomChoice([25, 50, 75]);
    const count = (students * percentage) / 100;
    const activity = randomChoice(['เล่นกีฬา', 'อ่านหนังสือ', 'วาดรูป', 'เรียนคอมพิวเตอร์', 'เล่นดนตรี']);
    
    return this.createQuestion(
      `นักเรียนทั้งหมด ${students} คน ${percentage}% ของนักเรียน${activity} มีนักเรียนกี่คน${activity}?`,
      count,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(count, 4, Math.max(8, Math.floor(count * 0.3)))
    );
  }

  private generateFractionWordProblem(level: number, config: LevelConfig): Question {
    const totalAmount = generateDivisibleNumbers(4, 80, 400);
    const fractions = [
      { num: 1, den: 4, name: 'หนึ่งในสี่' },
      { num: 1, den: 3, name: 'หนึ่งในสาม' },
      { num: 2, den: 3, name: 'สองในสาม' },
      { num: 3, den: 4, name: 'สามในสี่' }
    ];
    
    const fraction = randomChoice(fractions);
    const result = (totalAmount * fraction.num) / fraction.den;
    const item = getRandomFruit();
    
    return this.createQuestion(
      `สวนมี${item}ทั้งหมด ${totalAmount} ลูก เก็บไป${fraction.name}ของทั้งหมด เก็บไปกี่ลูก?`,
      result,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(result, 4, Math.max(10, Math.floor(result * 0.2)))
    );
  }

  private generateMultiStepProblem(level: number, config: LevelConfig): Question {
    const workers = random(8, 20);
    const daysWorked = random(5, 15);
    const wagePerDay = random(200, 500);
    const totalWage = workers * daysWorked * wagePerDay;
    const tax = Math.floor(totalWage * 0.05); // ภาษี 5%
    const netWage = totalWage - tax;
    
    return this.createQuestion(
      `คนงาน ${workers} คน ทำงาน ${daysWorked} วัน วันละ ${wagePerDay} บาท หักภาษี 5% ได้เงินสุทธิเท่าไร?`,
      netWage,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(netWage, 4, Math.max(1000, Math.floor(netWage * 0.1)))
    );
  }
}