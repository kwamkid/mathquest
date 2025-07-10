// lib/game/generators/elementary/p6.ts

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
  randomFloat
} from '../utils';

export class P6Generator extends BaseGenerator {
  constructor() {
    super('P6');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    const questionType = randomChoice(this.getAvailableQuestionTypes(level));
    
    switch (questionType) {
      case QuestionType.MIXED:
        return this.generateMixed(level, config);
      case QuestionType.WORD_PROBLEM:
        return this.generateWordProblem(level, config);
      default:
        return this.generateMixed(level, config);
    }
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    const problemTypes = [
      () => this.generateFinanceProblem(level, config),
      () => this.generateStatisticsProblem(level, config),
      () => this.generateGeometryProblem(level, config),
      () => this.generateRealWorldProblem(level, config),
      () => this.generateBusinessApplicationProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.MIXED]; // การคำนวณเศษส่วน
    } else if (level <= 50) {
      return [QuestionType.MIXED]; // ทศนิยมเบื้องต้น
    } else if (level <= 75) {
      return [QuestionType.MIXED]; // ร้อยละเบื้องต้น
    } else {
      return [QuestionType.MIXED, QuestionType.WORD_PROBLEM]; // โจทย์ปัญหาประยุกต์
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: การคำนวณเศษส่วน
      const fractionTypes = [
        () => this.generateFractionOperations(level, config),
        () => this.generateMixedNumberConversion(level, config),
        () => this.generateFractionMultiplication(level, config)
      ];
      return randomChoice(fractionTypes)();
    } else if (level <= 50) {
      // Level 26-50: ทศนิยมเบื้องต้น
      const decimalTypes = [
        () => this.generateDecimalOperations(level, config),
        () => this.generateDecimalConversion(level, config),
        () => this.generateDecimalComparison(level, config)
      ];
      return randomChoice(decimalTypes)();
    } else if (level <= 75) {
      // Level 51-75: ร้อยละเบื้องต้น
      const percentageTypes = [
        () => this.generatePercentageCalculation(level, config),
        () => this.generatePercentageConversion(level, config),
        () => this.generateDiscountProfit(level, config)
      ];
      return randomChoice(percentageTypes)();
    } else {
      // Level 76+: โจทย์ประยุกต์
      const advancedTypes = [
        () => this.generateAdvancedPercentage(level, config),
        () => this.generateRatioProblems(level, config),
        () => this.generateInterestCalculation(level, config)
      ];
      return randomChoice(advancedTypes)();
    }
  }

  private generateFractionOperations(level: number, config: LevelConfig): Question {
    const operations = [
      {
        generate: () => {
          // บวกเศษส่วนต่างตัวส่วน
          const den1 = randomChoice([2, 3, 4, 6]);
          const den2 = randomChoice([2, 3, 4, 6]);
          const num1 = random(1, den1 - 1);
          const num2 = random(1, den2 - 1);
          
          // หา LCM ง่าย ๆ
          const lcm = den1 * den2 / this.gcd(den1, den2);
          const newNum1 = num1 * (lcm / den1);
          const newNum2 = num2 * (lcm / den2);
          const resultNum = newNum1 + newNum2;
          
          const [simplified, simplifiedDen] = simplifyFraction(resultNum, lcm);
          
          return {
            question: `${num1}/${den1} + ${num2}/${den2} = ?/${simplifiedDen}`,
            answer: simplified
          };
        }
      },
      {
        generate: () => {
          // คูณเศษส่วน
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
      }
    ];
    
    const op = randomChoice(operations).generate();
    
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
      `${whole} ${num}/${den} = ?/${den} (จำนวนคละเป็นเศษส่วนแท้)`,
      improperNum,
      QuestionType.MIXED,
      level,
      generateChoices(improperNum, 4, 5)
    );
  }

  private generateFractionMultiplication(level: number, config: LevelConfig): Question {
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
      {
        generate: () => {
          const a = randomFloat(1, 20, 1);
          const b = randomFloat(1, 15, 1);
          const result = Math.round((a + b) * 10) / 10;
          return {
            question: `${a} + ${b} = ?`,
            answer: Math.round(result * 10) // คูณ 10 เพื่อให้ตอบเป็นจำนวนเต็ม
          };
        }
      },
      {
        generate: () => {
          const a = randomFloat(5, 25, 1);
          const b = randomFloat(1, a - 1, 1);
          const result = Math.round((a - b) * 10) / 10;
          return {
            question: `${a} - ${b} = ?`,
            answer: Math.round(result * 10)
          };
        }
      },
      {
        generate: () => {
          const a = randomFloat(1, 10, 1);
          const b = random(2, 8);
          const result = Math.round((a * b) * 10) / 10;
          return {
            question: `${a} × ${b} = ?`,
            answer: Math.round(result * 10)
          };
        }
      }
    ];
    
    const op = randomChoice(operations).generate();
    
    return this.createQuestion(
      op.question + ' (ตอบเป็นจำนวนเต็ม คูณด้วย 10)',
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
        question: `${conv.fraction.num}/${conv.fraction.den} = 0.? (ตอบเป็นจำนวนเต็ม เช่น 0.25 → ตอบ 25)`,
        answer: conv.decimal
      },
      {
        question: `0.${conv.decimal} = ?% `,
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

  private generateDecimalComparison(level: number, config: LevelConfig): Question {
    const decimals = [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8];
    const dec1 = randomChoice(decimals);
    const dec2 = randomChoice(decimals.filter(d => d !== dec1));
    
    let question: string;
    let answer: number;
    
    if (dec1 > dec2) {
      question = `${dec1} กับ ${dec2} อันไหนมากกว่า? (ตอบ 1=ตัวแรก, 2=ตัวที่สอง)`;
      answer = 1;
    } else {
      question = `${dec1} กับ ${dec2} อันไหนน้อยกว่า? (ตอบ 1=ตัวแรก, 2=ตัวที่สอง)`;
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

  private generatePercentageCalculation(level: number, config: LevelConfig): Question {
    const percentages = [10, 15, 20, 25, 30, 40, 50, 60, 75];
    const percentage = randomChoice(percentages);
    const total = generateDivisibleNumbers(percentage, 20, 500);
    const result = (total * percentage) / 100;
    
    return this.createQuestion(
      `${percentage}% ของ ${total} = ?`,
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

  private generateDiscountProfit(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const originalPrice = random(200, 1000);
          const discountPercent = randomChoice([10, 15, 20, 25, 30]);
          const discountAmount = Math.floor(originalPrice * discountPercent / 100);
          const finalPrice = originalPrice - discountAmount;
          return {
            question: `สินค้าราคา ${originalPrice} บาท ลดราคา ${discountPercent}% ต้องจ่ายเงินเท่าไร?`,
            answer: finalPrice
          };
        }
      },
      {
        generate: () => {
          const cost = random(100, 800);
          const profitPercent = randomChoice([15, 20, 25, 30]);
          const profit = Math.floor(cost * profitPercent / 100);
          const sellingPrice = cost + profit;
          return {
            question: `สินค้าต้นทุน ${cost} บาท ขายได้กำไร ${profitPercent}% ขายในราคาเท่าไร?`,
            answer: sellingPrice
          };
        }
      }
    ];
    
    const scenario = randomChoice(scenarios).generate();
    
    return this.createQuestion(
      scenario.question,
      scenario.answer,
      QuestionType.MIXED,
      level,
      generateChoices(scenario.answer, 4, Math.max(50, Math.floor(scenario.answer * 0.1)))
    );
  }

  private generateAdvancedPercentage(level: number, config: LevelConfig): Question {
    const total = random(200, 1000);
    const percent1 = randomChoice([20, 25, 30]);
    const percent2 = randomChoice([10, 15, 20]);
    const amount1 = Math.floor(total * percent1 / 100);
    const remaining = total - amount1;
    const amount2 = Math.floor(remaining * percent2 / 100);
    const final = remaining - amount2;
    
    return this.createQuestion(
      `เงิน ${total} บาท ใช้ไป ${percent1}% แล้วใช้อีก ${percent2}% ของที่เหลือ เหลือเงินกี่บาท?`,
      final,
      QuestionType.MIXED,
      level,
      generateChoices(final, 4, Math.max(30, Math.floor(final * 0.15)))
    );
  }

  private generateRatioProblems(level: number, config: LevelConfig): Question {
    const ratio1 = random(2, 6);
    const ratio2 = random(2, 6);
    const multiplier = random(3, 8);
    const total = (ratio1 + ratio2) * multiplier;
    const part1 = ratio1 * multiplier;
    
    return this.createQuestion(
      `แบ่งเงิน ${total} บาท ตามอัตราส่วน ${ratio1}:${ratio2} ส่วนแรกได้กี่บาท?`,
      part1,
      QuestionType.MIXED,
      level,
      generateChoices(part1, 4, Math.max(20, Math.floor(part1 * 0.2)))
    );
  }

  private generateInterestCalculation(level: number, config: LevelConfig): Question {
    const principal = random(1000, 5000);
    const rate = randomChoice([5, 6, 8, 10]);
    const time = random(1, 4);
    const interest = Math.floor(principal * rate * time / 100);
    const total = principal + interest;
    
    return this.createQuestion(
      `เงินต้น ${principal} บาท อัตราดอกเบี้ย ${rate}% ต่อปี เป็นเวลา ${time} ปี ได้เงินรวมเท่าไร?`,
      total,
      QuestionType.MIXED,
      level,
      generateChoices(total, 4, Math.max(100, Math.floor(total * 0.1)))
    );
  }

  private generateFinanceProblem(level: number, config: LevelConfig): Question {
    const salary = random(15000, 30000);
    const savingPercent = randomChoice([10, 15, 20]);
    const expensePercent = randomChoice([60, 65, 70]);
    const saving = Math.floor(salary * savingPercent / 100);
    const expense = Math.floor(salary * expensePercent / 100);
    const remaining = salary - saving - expense;
    
    return this.createQuestion(
      `เงินเดือน ${salary} บาท เก็บออม ${savingPercent}% ค่าใช้จ่าย ${expensePercent}% เหลือเงินกี่บาท?`,
      remaining,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(remaining, 4, Math.max(500, Math.floor(remaining * 0.15)))
    );
  }

  private generateStatisticsProblem(level: number, config: LevelConfig): Question {
    const scores = [];
    for (let i = 0; i < 5; i++) {
      scores.push(random(60, 100));
    }
    const sum = scores.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / scores.length);
    
    return this.createQuestion(
      `คะแนนสอบ: ${scores.join(', ')} คะแนนเฉลี่ยเท่าไร?`,
      average,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(average, 4, 8)
    );
  }

  private generateGeometryProblem(level: number, config: LevelConfig): Question {
    const geometryTypes = [
      {
        generate: () => {
          const radius = random(7, 20);
          const circumference = Math.round(2 * 3.14 * radius);
          return {
            question: `วงกลมรัศมี ${radius} ซม. เส้นรอบวงยาวกี่เซนติเมตร? (ใช้ π = 3.14)`,
            answer: circumference
          };
        }
      },
      {
        generate: () => {
          const base = random(10, 25);
          const height = random(8, 20);
          const area = Math.floor(base * height / 2);
          return {
            question: `สามเหลี่ยมฐาน ${base} ซม. สูง ${height} ซม. พื้นที่กี่ตารางเซนติเมตร?`,
            answer: area
          };
        }
      }
    ];
    
    const problem = randomChoice(geometryTypes).generate();
    
    return this.createQuestion(
      problem.question,
      problem.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(problem.answer, 4, Math.max(15, Math.floor(problem.answer * 0.2)))
    );
  }

  private generateRealWorldProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const speed = random(60, 100);
          const time = randomFloat(1.5, 4, 1);
          const distance = Math.round(speed * time);
          return {
            question: `รถวิ่งด้วยความเร็ว ${speed} กม./ชม. เป็นเวลา ${time} ชั่วโมง วิ่งได้กี่กิโลเมตร?`,
            answer: distance
          };
        }
      },
      {
        generate: () => {
          const people = random(120, 300);
          const busCapacity = random(40, 60);
          const buses = Math.ceil(people / busCapacity);
          return {
            question: `คน ${people} คน รถบัสคันละ ${busCapacity} คน ต้องใช้รถบัสอย่างน้อยกี่คัน?`,
            answer: buses
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
      generateChoices(problem.answer, 4, Math.max(5, Math.floor(problem.answer * 0.3)))
    );
  }

  private generateBusinessApplicationProblem(level: number, config: LevelConfig): Question {
    const investment = random(10000, 50000);
    const monthlyReturn = random(500, 2000);
    const months = random(6, 24);
    const totalReturn = monthlyReturn * months;
    const netProfit = totalReturn - investment;
    
    return this.createQuestion(
      `ลงทุน ${investment} บาท ได้ผลตอบแทนเดือนละ ${monthlyReturn} บาท เป็นเวลา ${months} เดือน กำไรสุทธิเท่าไร?`,
      netProfit,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(netProfit, 4, Math.max(1000, Math.floor(Math.abs(netProfit) * 0.1)))
    );
  }
}