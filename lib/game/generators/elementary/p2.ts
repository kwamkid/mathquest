// lib/game/generators/elementary/p2.ts

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
  generateDivisibleNumbers
} from '../utils';

export class P2Generator extends BaseGenerator {
  constructor() {
    super('P2');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    const questionType = randomChoice(this.getAvailableQuestionTypes(level));
    
    switch (questionType) {
      case QuestionType.ADDITION:
        return this.generateAddition(level, config);
      case QuestionType.SUBTRACTION:
        return this.generateSubtraction(level, config);
      case QuestionType.MULTIPLICATION:
        return this.generateMultiplication(level, config);
      case QuestionType.MIXED:
        return this.generateMixed(level, config);
      case QuestionType.WORD_PROBLEM:
        return this.generateWordProblem(level, config);
      default:
        return this.generateAddition(level, config);
    }
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    const problemTypes = [
      () => this.generateAdditionProblem(level, config),
      () => this.generateSubtractionProblem(level, config),
      () => this.generateMultiplicationProblem(level, config),
      () => this.generateMoneyProblem(level, config),
      () => this.generateTimeProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 20) {
      return [QuestionType.ADDITION]; // บวก 2 หลัก (ไม่ทด)
    } else if (level <= 40) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION]; // เพิ่มลบ 2 หลัก
    } else if (level <= 60) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION]; // สูตรคูณแม่ 2,5,10
    } else if (level <= 80) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION, QuestionType.MIXED]; // แม่ 3,4
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION, QuestionType.MIXED, QuestionType.WORD_PROBLEM]; // มีการทด
    }
  }

  private generateAddition(level: number, config: LevelConfig): Question {
    if (level <= 20) {
      // Level 1-20: บวก 2 หลัก (ไม่ทด)
      const tens1 = random(1, 3) * 10;
      const ones1 = random(0, 5);
      const tens2 = random(1, 2) * 10;
      const ones2 = random(0, Math.min(9 - ones1, 5)); // ไม่ให้ทด
      
      const a = tens1 + ones1;
      const b = tens2 + ones2;
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, 8)
      );
    } else if (level <= 80) {
      // Level 21-80: บวก 2 หลัก (อาจมีทด)
      const a = random(15, 45);
      const b = random(10, 35);
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, 10)
      );
    } else {
      // Level 81+: บวก 2 หลัก (มีการทด)
      const tens1 = random(1, 4) * 10;
      const ones1 = random(5, 9);
      const tens2 = random(1, 3) * 10;
      const ones2 = random(5, 9);
      
      const a = tens1 + ones1;
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
  }

  private generateSubtraction(level: number, config: LevelConfig): Question {
    if (level <= 40) {
      // Level 21-40: ลบ 2 หลัก (ไม่ยืม)
      const tens = random(2, 5) * 10;
      const ones = random(3, 9);
      const a = tens + ones;
      const subtractOnes = random(1, ones);
      const subtractTens = random(0, 2) * 10;
      const b = subtractTens + subtractOnes;
      const answer = a - b;
      
      return this.createQuestion(
        `${a} - ${b} = ?`,
        answer,
        QuestionType.SUBTRACTION,
        level,
        generateChoices(answer, 4, 8)
      );
    } else {
      // Level 41+: ลบ 2 หลัก (อาจมีการยืม)
      const a = random(25, 70);
      const b = random(8, a - 5);
      const answer = a - b;
      
      return this.createQuestion(
        `${a} - ${b} = ?`,
        answer,
        QuestionType.SUBTRACTION,
        level,
        generateChoices(answer, 4, 10)
      );
    }
  }

  private generateMultiplication(level: number, config: LevelConfig): Question {
    if (level <= 60) {
      // Level 41-60: สูตรคูณแม่ 2, 5, 10
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
    } else {
      // Level 61-80: สูตรคูณแม่ 3, 4
      const tables = [3, 4];
      const multiplicand = randomChoice(tables);
      const multiplier = random(1, 10);
      const answer = multiplicand * multiplier;
      
      return this.createQuestion(
        `${multiplicand} × ${multiplier} = ?`,
        answer,
        QuestionType.MULTIPLICATION,
        level,
        generateChoices(answer, 4, Math.max(3, Math.floor(answer * 0.2)))
      );
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 60) {
      // บวกลบและคูณแม่ 2,5,10
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSubtraction(level, config),
        () => this.generateMultiplication(level, config)
      ];
      return randomChoice(types)();
    } else if (level <= 80) {
      // เพิ่มแม่ 3,4
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSubtraction(level, config),
        () => this.generateMultiplication(level, config),
        () => this.generateSimpleDivision(level, config)
      ];
      return randomChoice(types)();
    } else {
      // มีการทดและยืม
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSubtraction(level, config),
        () => this.generateMultiplication(level, config),
        () => this.generateMixedOperations(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateSimpleDivision(level: number, config: LevelConfig): Question {
    const divisors = [2, 3, 4, 5];
    const divisor = randomChoice(divisors);
    const quotient = random(2, 8);
    const dividend = divisor * quotient;
    
    return this.createQuestion(
      `${dividend} ÷ ${divisor} = ?`,
      quotient,
      QuestionType.MIXED,
      level,
      generateChoices(quotient, 4, 3)
    );
  }

  private generateMixedOperations(level: number, config: LevelConfig): Question {
    // เช่น 5 × 3 + 2 = ?
    const a = random(2, 5);
    const b = random(2, 6);
    const c = random(3, 10);
    
    const operations = [
      {
        question: `${a} × ${b} + ${c} = ?`,
        answer: (a * b) + c
      },
      {
        question: `${a + c} - ${b} = ?`,
        answer: (a + c) - b
      }
    ];
    
    const op = randomChoice(operations);
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, 5)
    );
  }

  private generateAdditionProblem(level: number, config: LevelConfig): Question {
    const a = random(12, 35);
    const b = random(15, 28);
    const item = getRandomToy();
    const name1 = getRandomName();
    const name2 = getRandomName();
    
    const scenarios = [
      `${name1}มี${item} ${a} ชิ้น ${name2}มี ${b} ชิ้น รวมกันมีกี่ชิ้น?`,
      `ร้านขาย${item}ไปวันแรก ${a} ชิ้น วันที่สอง ${b} ชิ้น รวมขายไปกี่ชิ้น?`,
      `ในกล่องแรกมี${item} ${a} ชิ้น กล่องที่สองมี ${b} ชิ้น รวมกันมีกี่ชิ้น?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      a + b,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(a + b, 4, 10)
    );
  }

  private generateSubtractionProblem(level: number, config: LevelConfig): Question {
    const total = random(40, 80);
    const taken = random(15, total - 10);
    const remaining = total - taken;
    const fruit = getRandomFruit();
    const name = getRandomName();
    
    const scenarios = [
      `สวนมี${fruit}ทั้งหมด ${total} ลูก เก็บไปขายแล้ว ${taken} ลูก เหลือกี่ลูก?`,
      `${name}มี${fruit} ${total} ลูก แจกให้เพื่อน ${taken} ลูก เหลือกี่ลูก?`,
      `ตะกร้ามี${fruit} ${total} ลูก กินไป ${taken} ลูก เหลือกี่ลูก?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      remaining,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(remaining, 4, 12)
    );
  }

  private generateMultiplicationProblem(level: number, config: LevelConfig): Question {
    const multiplicand = randomChoice([2, 3, 4, 5, 10]);
    const multiplier = random(3, 8);
    const total = multiplicand * multiplier;
    const animal = getRandomAnimal();
    
    const scenarios = [
      `มี${animal} ${multiplier} ตัว แต่ละตัวมี ${multiplicand} ขา รวมกันมีกี่ขา?`,
      `ในกล่อง ${multiplier} กล่อง กล่องละ ${multiplicand} ลูกบอล รวมกันมีกี่ลูกบอล?`,
      `${multiplicand} คน แต่ละคนมี ${multiplier} บาท รวมกันมีเงินกี่บาท?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      total,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(total, 4, Math.max(5, Math.floor(total * 0.2)))
    );
  }

  private generateMoneyProblem(level: number, config: LevelConfig): Question {
    const price = random(5, 25);
    const quantity = random(2, 6);
    const paid = (price * quantity) + random(5, 20);
    const change = paid - (price * quantity);
    const item = getRandomToy();
    
    const scenarios = [
      `ซื้อ${item} ${quantity} ชิ้น ๆ ละ ${price} บาท จ่ายเงิน ${paid} บาท ได้เงินทอนกี่บาท?`,
      `${item}ราคา ${price} บาท ซื้อ ${quantity} ชิ้น จ่าย ${paid} บาท เงินทอนเท่าไร?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      change,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(change, 4, 8)
    );
  }

  private generateTimeProblem(level: number, config: LevelConfig): Question {
    const startHour = random(8, 15);
    const duration = random(2, 5);
    const endHour = startHour + duration;
    
    const scenarios = [
      `เริ่มเรียนเวลา ${startHour}.00 น. เรียน ${duration} ชั่วโมง เลิกเวลากี่โมง?`,
      `ออกจากบ้านเวลา ${startHour}.00 น. เดินทาง ${duration} ชั่วโมง ถึงที่หมายเวลากี่โมง?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      endHour,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(endHour, 4, 3)
    );
  }
}