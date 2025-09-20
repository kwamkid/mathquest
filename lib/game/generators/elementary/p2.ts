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
    // ปรับ type ตาม level
    if (level <= 10) {
      return [QuestionType.ADDITION];
    } else if (level <= 12 || level === 21 || level === 22 || level === 31 || level === 32 || 
               level === 41 || level === 42 || level === 51 || level === 52 || level === 61 || level === 62 ||
               level === 71 || level === 72 || level === 79 || level === 80 || level === 86 || level === 87 ||
               level === 91 || level === 92) {
      return [QuestionType.MULTIPLICATION];
    } else if ((level >= 13 && level <= 15) || (level >= 23 && level <= 25) || (level >= 33 && level <= 35) ||
               (level >= 53 && level <= 55) || (level >= 63 && level <= 65) || (level >= 84 && level <= 85)) {
      return [QuestionType.MIXED]; // สำหรับการเปรียบเทียบ
    } else if (level >= 96) {
      return [QuestionType.DIVISION];
    } else if ((level >= 36 && level <= 40) || (level >= 43 && level <= 45) || (level >= 66 && level <= 70) ||
               (level >= 73 && level <= 78) || (level >= 81 && level <= 83) || (level >= 88 && level <= 90)) {
      return [QuestionType.SUBTRACTION];
    } else {
      return [QuestionType.ADDITION];
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 5) {
      // Level 1-5: บวกเลขหลักเดียว x + x
      return this.generateSingleDigitAddition(level, config);
    } else if (level <= 10) {
      // Level 6-10: บวก xx + x (ไม่ทด)
      return this.generateTwoDigitPlusOne(level, config);
    } else if (level <= 12) {
      // Level 11-12: สูตรคูณแม่ 2
      return this.generateMultiplicationTable2(level, config);
    } else if (level <= 15) {
      // Level 13-15: เปรียบเทียบ xx กับ xx
      return this.generateComparisonTwoDigit(level, config);
    } else if (level <= 20) {
      // Level 16-20: บวก xx + xx (ไม่ทด)
      return this.generateTwoDigitAdditionNoCarry(level, config);
    } else if (level <= 22) {
      // Level 21-22: สูตรคูณแม่ 2, 5
      return this.generateMultiplicationTable25(level, config);
    } else if (level <= 25) {
      // Level 23-25: เปรียบเทียบ xxx กับ xxx
      return this.generateComparisonThreeDigit(level, config);
    } else if (level <= 30) {
      // Level 26-30: บวก xx + xx (มีการทด)
      return this.generateTwoDigitAdditionWithCarry(level, config);
    } else if (level <= 32) {
      // Level 31-32: สูตรคูณแม่ 2, 5, 10
      return this.generateMultiplicationTable2510(level, config);
    } else if (level <= 35) {
      // Level 33-35: เปรียบเทียบผลบวก
      return this.generateComparisonAddition(level, config);
    } else if (level <= 40) {
      // Level 36-40: ลบ xx - xx (ไม่ยืม)
      return this.generateTwoDigitSubtractionNoBorrow(level, config);
    } else if (level <= 42) {
      // Level 41-42: สูตรคูณแม่ 2, 5, 10 (ทบทวน)
      return this.generateMultiplicationTable2510Review(level, config);
    } else if (level <= 45) {
      // Level 43-45: ลบ xx - x
      return this.generateTwoDigitMinusOne(level, config);
    } else if (level <= 50) {
      // Level 46-50: บวก xxx + xx
      return this.generateThreeDigitPlusTwoDigit(level, config);
    } else if (level <= 52) {
      // Level 51-52: สูตรคูณแม่ 2, 5, 10, 3
      return this.generateMultiplicationTable25103(level, config);
    } else if (level <= 55) {
      // Level 53-55: เปรียบเทียบ xxx กับ xx
      return this.generateComparisonMixed(level, config);
    } else if (level <= 60) {
      // Level 56-60: บวก xxx + xxx
      return this.generateThreeDigitAddition(level, config);
    } else if (level <= 62) {
      // Level 61-62: สูตรคูณแม่ 2, 3, 4, 5
      return this.generateMultiplicationTable2345(level, config);
    } else if (level <= 65) {
      // Level 63-65: เปรียบเทียบผลคูณ
      return this.generateComparisonMultiplication(level, config);
    } else if (level <= 70) {
      // Level 66-70: ลบ xxx - xx (ไม่ยืม)
      return this.generateThreeDigitMinusTwoDigit(level, config);
    } else if (level <= 72) {
      // Level 71-72: สูตรคูณแม่ 2-5, 10 (ทบทวน)
      return this.generateMultiplicationTableReview(level, config);
    } else if (level <= 75) {
      // Level 73-75: ลบ xxx - x
      return this.generateThreeDigitMinusOne(level, config);
    } else if (level <= 78) {
      // Level 76-78: ลบ xxx - xxx (ไม่ยืม)
      return this.generateThreeDigitSubtractionNoBorrow(level, config);
    } else if (level <= 80) {
      // Level 79-80: สูตรคูณแม่ 6, 7
      return this.generateMultiplicationTable67(level, config);
    } else if (level <= 83) {
      // Level 81-83: ลบ xx - xx (มีการยืม)
      return this.generateTwoDigitSubtractionWithBorrow(level, config);
    } else if (level <= 85) {
      // Level 84-85: เปรียบเทียบผสม
      return this.generateComparisonMixedOperations(level, config);
    } else if (level <= 87) {
      // Level 86-87: สูตรคูณแม่ 8, 9
      return this.generateMultiplicationTable89(level, config);
    } else if (level <= 90) {
      // Level 88-90: ลบ xxx - xx (มีการยืมบางข้อ)
      return this.generateThreeDigitMinusTwoDigitWithBorrow(level, config);
    } else if (level <= 92) {
      // Level 91-92: สูตรคูณแม่ 2-10 (ทบทวนทั้งหมด)
      return this.generateMultiplicationTableAll(level, config);
    } else if (level <= 95) {
      // Level 93-95: หาเลขที่หาย
      return this.generateMissingNumber(level, config);
    } else {
      // Level 96-100: การหารพื้นฐาน
      return this.generateBasicDivision(level, config);
    }
  }

  // Level 1-5: บวกเลขหลักเดียว
  private generateSingleDigitAddition(level: number, config: LevelConfig): Question {
    const a = random(1, 9);
    const b = random(1, 9);
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 5)
    );
  }

  // Level 6-10: บวก xx + x (ไม่ทด)
  private generateTwoDigitPlusOne(level: number, config: LevelConfig): Question {
    const tens = random(1, 5) * 10;
    const ones = random(0, 5);
    const a = tens + ones;
    const b = random(1, Math.min(4, 9 - ones)); // ไม่ให้ทด
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 5)
    );
  }

  // Level 11-12: สูตรคูณแม่ 2
  private generateMultiplicationTable2(level: number, config: LevelConfig): Question {
    const multiplier = random(1, 5);
    const answer = 2 * multiplier;
    
    return this.createQuestion(
      `2 × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  // Level 13-15: เปรียบเทียบ xx กับ xx
  private generateComparisonTwoDigit(level: number, config: LevelConfig): Question {
    const a = random(10, 99);
    const b = random(10, 99);
    
    const types = [
      () => ({
        question: `${a} ? ${b}`,
        answer: a > b ? 1 : (a < b ? 2 : 3), // 1 = >, 2 = <, 3 = =
        choices: [1, 2, 3] // แทนด้วย >, <, =
      }),
      () => {
        const smaller = Math.min(a, b);
        return {
          question: `${Math.max(a, b)} > ?`,
          answer: smaller,
          choices: generateChoices(smaller, 4, 10)
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      type.choices
    );
  }

  // Level 16-20: บวก xx + xx (ไม่ทด)
  private generateTwoDigitAdditionNoCarry(level: number, config: LevelConfig): Question {
    const tens1 = random(1, 3) * 10;
    const ones1 = random(0, 4);
    const a = tens1 + ones1;
    
    const tens2 = random(1, 3) * 10;
    const ones2 = random(0, Math.min(5, 9 - ones1));
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

  // Level 21-22: สูตรคูณแม่ 2, 5
  private generateMultiplicationTable25(level: number, config: LevelConfig): Question {
    const tables = [2, 5];
    const multiplicand = randomChoice(tables);
    const multiplier = random(1, 6);
    const answer = multiplicand * multiplier;
    
    return this.createQuestion(
      `${multiplicand} × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, 5)
    );
  }

  // Level 23-25: เปรียบเทียบ xxx กับ xxx
  private generateComparisonThreeDigit(level: number, config: LevelConfig): Question {
    const a = random(100, 999);
    const b = random(100, 999);
    
    const answer = a > b ? 1 : (a < b ? 2 : 3);
    
    return this.createQuestion(
      `${a} ? ${b}`,
      answer,
      QuestionType.MIXED,
      level,
      [1, 2, 3]
    );
  }

  // Level 26-30: บวก xx + xx (มีการทด)
  private generateTwoDigitAdditionWithCarry(level: number, config: LevelConfig): Question {
    const tens1 = random(1, 4) * 10;
    const ones1 = random(5, 9);
    const a = tens1 + ones1;
    
    const tens2 = random(1, 3) * 10;
    const ones2 = random(5, 9);
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

  // Level 31-32: สูตรคูณแม่ 2, 5, 10
  private generateMultiplicationTable2510(level: number, config: LevelConfig): Question {
    const tables = [2, 5, 10];
    const multiplicand = randomChoice(tables);
    const multiplier = random(1, 7);
    const answer = multiplicand * multiplier;
    
    return this.createQuestion(
      `${multiplicand} × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, Math.max(5, Math.floor(answer * 0.3)))
    );
  }

  // Level 33-35: เปรียบเทียบผลบวก
  private generateComparisonAddition(level: number, config: LevelConfig): Question {
    const a = random(10, 40);
    const b = random(10, 30);
    const sum = a + b;
    const compareValue = random(sum - 5, sum + 5);
    
    const answer = sum > compareValue ? 1 : (sum < compareValue ? 2 : 3);
    
    return this.createQuestion(
      `${a} + ${b} ? ${compareValue}`,
      answer,
      QuestionType.MIXED,
      level,
      [1, 2, 3]
    );
  }

  // Level 36-40: ลบ xx - xx (ไม่ยืม)
  private generateTwoDigitSubtractionNoBorrow(level: number, config: LevelConfig): Question {
    const tens1 = random(3, 6) * 10;
    const ones1 = random(5, 9);
    const a = tens1 + ones1;
    
    const tens2 = random(1, 2) * 10;
    const ones2 = random(0, ones1);
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

  // Level 41-42: สูตรคูณแม่ 2, 5, 10 (ทบทวน)
  private generateMultiplicationTable2510Review(level: number, config: LevelConfig): Question {
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

  // Level 43-45: ลบ xx - x
  private generateTwoDigitMinusOne(level: number, config: LevelConfig): Question {
    const a = random(20, 99);
    const b = random(1, 9);
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 5)
    );
  }

  // Level 46-50: บวก xxx + xx
  private generateThreeDigitPlusTwoDigit(level: number, config: LevelConfig): Question {
    const a = random(100, 500);
    const b = random(10, 50);
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 20)
    );
  }

  // Level 51-52: สูตรคูณแม่ 2, 5, 10, 3
  private generateMultiplicationTable25103(level: number, config: LevelConfig): Question {
    const tables = [2, 3, 5, 10];
    const multiplicand = randomChoice(tables);
    const multiplier = random(1, 8);
    const answer = multiplicand * multiplier;
    
    return this.createQuestion(
      `${multiplicand} × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, Math.max(5, Math.floor(answer * 0.3)))
    );
  }

  // Level 53-55: เปรียบเทียบ xxx กับ xx
  private generateComparisonMixed(level: number, config: LevelConfig): Question {
    const a = random(100, 999);
    const b = random(10, 99);
    
    const answer = 1; // xxx จะมากกว่า xx เสมอ
    
    return this.createQuestion(
      `${a} ? ${b}`,
      answer,
      QuestionType.MIXED,
      level,
      [1, 2, 3]
    );
  }

  // Level 56-60: บวก xxx + xxx
  private generateThreeDigitAddition(level: number, config: LevelConfig): Question {
    const a = random(100, 400);
    const b = random(100, 400);
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 50)
    );
  }

  // Level 61-62: สูตรคูณแม่ 2, 3, 4, 5
  private generateMultiplicationTable2345(level: number, config: LevelConfig): Question {
    const tables = [2, 3, 4, 5];
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

  // Level 63-65: เปรียบเทียบผลคูณ
  private generateComparisonMultiplication(level: number, config: LevelConfig): Question {
    const a = random(2, 5);
    const b = random(3, 8);
    const product = a * b;
    const compareValue = random(product - 3, product + 3);
    
    const answer = product > compareValue ? 1 : (product < compareValue ? 2 : 3);
    
    return this.createQuestion(
      `${a} × ${b} ? ${compareValue}`,
      answer,
      QuestionType.MIXED,
      level,
      [1, 2, 3]
    );
  }

  // Level 66-70: ลบ xxx - xx (ไม่ยืม)
  private generateThreeDigitMinusTwoDigit(level: number, config: LevelConfig): Question {
    const hundreds = random(2, 6) * 100;
    const tens = random(5, 9) * 10;
    const ones = random(5, 9);
    const a = hundreds + tens + ones;
    
    const b_tens = random(1, 3) * 10;
    const b_ones = random(0, ones);
    const b = b_tens + b_ones;
    
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 20)
    );
  }

  // Level 71-72: สูตรคูณแม่ 2-5, 10 (ทบทวน)
  private generateMultiplicationTableReview(level: number, config: LevelConfig): Question {
    const tables = [2, 3, 4, 5, 10];
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

  // Level 73-75: ลบ xxx - x
  private generateThreeDigitMinusOne(level: number, config: LevelConfig): Question {
    const a = random(100, 999);
    const b = random(1, 9);
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 10)
    );
  }

  // Level 76-78: ลบ xxx - xxx (ไม่ยืม)
  private generateThreeDigitSubtractionNoBorrow(level: number, config: LevelConfig): Question {
    const hundreds1 = random(5, 9) * 100;
    const tens1 = random(5, 9) * 10;
    const ones1 = random(5, 9);
    const a = hundreds1 + tens1 + ones1;
    
    const hundreds2 = random(1, 4) * 100;
    const tens2 = random(0, tens1 / 10 - 1) * 10;
    const ones2 = random(0, ones1);
    const b = hundreds2 + tens2 + ones2;
    
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 50)
    );
  }

  // Level 79-80: สูตรคูณแม่ 6, 7
  private generateMultiplicationTable67(level: number, config: LevelConfig): Question {
    const tables = [6, 7];
    const multiplicand = randomChoice(tables);
    const multiplier = random(1, 10);
    const answer = multiplicand * multiplier;
    
    return this.createQuestion(
      `${multiplicand} × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, Math.max(8, Math.floor(answer * 0.2)))
    );
  }

  // Level 81-83: ลบ xx - xx (มีการยืม)
  private generateTwoDigitSubtractionWithBorrow(level: number, config: LevelConfig): Question {
    const tens1 = random(3, 7) * 10;
    const ones1 = random(0, 4);
    const a = tens1 + ones1;
    
    const tens2 = random(1, 3) * 10;
    const ones2 = random(ones1 + 1, 9);
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

  // Level 84-85: เปรียบเทียบผสม
  private generateComparisonMixedOperations(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const a = random(20, 50);
        const b = random(20, 40);
        const sum = a + b;
        const compareValue = random(60, 100);
        return {
          question: `${a} + ${b} ? ${compareValue}`,
          answer: sum > compareValue ? 1 : (sum < compareValue ? 2 : 3)
        };
      },
      () => {
        const a = random(5, 8);
        const b = random(4, 7);
        const product = a * b;
        return {
          question: `${a} × ${b} ? ${product}`,
          answer: 3 // Always equal
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

  // Level 86-87: สูตรคูณแม่ 8, 9
  private generateMultiplicationTable89(level: number, config: LevelConfig): Question {
    const tables = [8, 9];
    const multiplicand = randomChoice(tables);
    const multiplier = random(1, 10);
    const answer = multiplicand * multiplier;
    
    return this.createQuestion(
      `${multiplicand} × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, Math.max(10, Math.floor(answer * 0.2)))
    );
  }

  // Level 88-90: ลบ xxx - xx (มีการยืมบางข้อ)
  private generateThreeDigitMinusTwoDigitWithBorrow(level: number, config: LevelConfig): Question {
    const a = random(200, 800);
    const b = random(25, 99);
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 30)
    );
  }

  // Level 91-92: สูตรคูณแม่ 2-10 (ทบทวนทั้งหมด)
  private generateMultiplicationTableAll(level: number, config: LevelConfig): Question {
    const multiplicand = random(2, 10);
    const multiplier = random(1, 10);
    const answer = multiplicand * multiplier;
    
    return this.createQuestion(
      `${multiplicand} × ${multiplier} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, Math.max(10, Math.floor(answer * 0.2)))
    );
  }

  // Level 93-95: หาเลขที่หาย
  private generateMissingNumber(level: number, config: LevelConfig): Question {
    const types = [
      // ? + a = b
      () => {
        const answer = random(5, 20);
        const known = random(5, 15);
        const result = answer + known;
        return {
          question: `? + ${known} = ${result}`,
          answer: answer
        };
      },
      // a - ? = b
      () => {
        const start = random(20, 50);
        const result = random(10, 30);
        const answer = start - result;
        return {
          question: `${start} - ? = ${result}`,
          answer: answer
        };
      },
      // a × ? = b
      () => {
        const multiplicand = random(2, 5);
        const answer = random(2, 10);
        const result = multiplicand * answer;
        return {
          question: `${multiplicand} × ? = ${result}`,
          answer: answer
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

  // Level 96-100: การหารพื้นฐาน
  private generateBasicDivision(level: number, config: LevelConfig): Question {
    const divisors = [2, 3, 4, 5, 6];
    const divisor = randomChoice(divisors);
    const quotient = random(2, 10);
    const dividend = divisor * quotient;
    
    return this.createQuestion(
      `${dividend} ÷ ${divisor} = ?`,
      quotient,
      QuestionType.DIVISION,
      level,
      generateChoices(quotient, 4, 3)
    );
  }
}