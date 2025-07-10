// lib/game/generators/elementary/p1.ts

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
  randomChoice
} from '../utils';

export class P1Generator extends BaseGenerator {
  constructor() {
    super('P1');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    const questionType = randomChoice(this.getAvailableQuestionTypes(level));
    
    switch (questionType) {
      case QuestionType.ADDITION:
        return this.generateAddition(level, config);
      case QuestionType.SUBTRACTION:
        return this.generateSubtraction(level, config);
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
      () => this.generateCountingProblem(level, config),
      () => this.generateShoppingProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.ADDITION]; // บวกเลขหลักเดียว
    } else if (level <= 50) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION]; // เพิ่มลบ
    } else if (level <= 75) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED]; // บวก 2 หลัก + 1 หลัก
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED, QuestionType.WORD_PROBLEM];
    }
  }

  private generateAddition(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: บวกเลขหลักเดียว (1-9)
      const a = random(1, 9);
      const b = random(1, Math.min(9, 18 - a)); // ผลบวกไม่เกิน 18
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, 4)
      );
    } else if (level <= 50) {
      // ยังคงบวกหลักเดียวแต่เลขใหญ่ขึ้น
      const a = random(3, 9);
      const b = random(3, Math.min(9, 18 - a));
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, 4)
      );
    } else {
      // Level 51+: บวกเลข 2 หลักกับ 1 หลัก (ไม่ทด)
      const tens = random(10, 20);
      const ones = random(1, Math.min(9, 20 - (tens % 10))); // ไม่ให้ทด
      const answer = tens + ones;
      
      return this.createQuestion(
        `${tens} + ${ones} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, 5)
      );
    }
  }

  private generateSubtraction(level: number, config: LevelConfig): Question {
    if (level <= 50) {
      // Level 26-50: ลบเลขหลักเดียว
      const a = random(2, 10);
      const b = random(1, a - 1); // ไม่ให้ติดลบ
      const answer = a - b;
      
      return this.createQuestion(
        `${a} - ${b} = ?`,
        answer,
        QuestionType.SUBTRACTION,
        level,
        generateChoices(answer, 4, 3)
      );
    } else {
      // Level 51+: ลบเลข 2 หลัก (ไม่ยืม)
      const tens = random(11, 20);
      const ones = random(1, tens % 10); // ไม่ให้ยืม
      const answer = tens - ones;
      
      return this.createQuestion(
        `${tens} - ${ones} = ?`,
        answer,
        QuestionType.SUBTRACTION,
        level,
        generateChoices(answer, 4, 4)
      );
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 75) {
      // บวกลบผสม
      if (random(0, 1) === 0) {
        return this.generateAddition(level, config);
      } else {
        return this.generateSubtraction(level, config);
      }
    } else {
      // Level 76+: บวกลบผสมขั้นสูง
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSubtraction(level, config),
        () => this.generateComparison(level, config),
        () => this.generateNumberLine(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateComparison(level: number, config: LevelConfig): Question {
    const a = random(5, 20);
    const b = random(5, 20);
    
    let question: string;
    let answer: number;
    
    if (a > b) {
      question = `${a} กับ ${b} อันไหนมากกว่า? (ตอบตัวเลขที่มากกว่า)`;
      answer = a;
    } else if (a < b) {
      question = `${a} กับ ${b} อันไหนน้อยกว่า? (ตอบตัวเลขที่น้อยกว่า)`;
      answer = a;
    } else {
      // เท่ากัน สร้างใหม่
      return this.generateAddition(level, config);
    }
    
    return this.createQuestion(
      question,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 5)
    );
  }

  private generateNumberLine(level: number, config: LevelConfig): Question {
    // เส้นจำนวน เช่น 5 + ? = 8
    const result = random(8, 20);
    const first = random(2, result - 2);
    const missing = result - first;
    
    return this.createQuestion(
      `${first} + ? = ${result}`,
      missing,
      QuestionType.MIXED,
      level,
      generateChoices(missing, 4, 3)
    );
  }

  private generateAdditionProblem(level: number, config: LevelConfig): Question {
    const a = random(2, 8);
    const b = random(2, 8);
    const fruit = getRandomFruit();
    const name = getRandomName();
    
    const scenarios = [
      `${name}มี${fruit} ${a} ลูก แม่ซื้อมาให้อีก ${b} ลูก รวมกันมีกี่ลูก?`,
      `ในตะกร้ามี${fruit} ${a} ลูก ใส่เพิ่มอีก ${b} ลูก รวมกันมีกี่ลูก?`,
      `${name}เก็บ${fruit} ${a} ลูก น้องเก็บได้อีก ${b} ลูก รวมกันเก็บได้กี่ลูก?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      a + b,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(a + b, 4, 4)
    );
  }

  private generateSubtractionProblem(level: number, config: LevelConfig): Question {
    const total = random(5, 15);
    const taken = random(1, total - 1);
    const remaining = total - taken;
    const toy = getRandomToy();
    const name = getRandomName();
    
    const scenarios = [
      `${name}มี${toy} ${total} ชิ้น เอาไปให้เพื่อน ${taken} ชิ้น เหลือกี่ชิ้น?`,
      `ในกล่องมี${toy} ${total} ชิ้น เล่นหายไป ${taken} ชิ้น เหลือกี่ชิ้น?`,
      `${name}ซื้อ${toy} ${total} ชิ้น แจกให้น้อง ${taken} ชิ้น เหลือกี่ชิ้น?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      remaining,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(remaining, 4, 4)
    );
  }

  private generateCountingProblem(level: number, config: LevelConfig): Question {
    const groups = random(2, 4);
    const itemsPerGroup = random(2, 5);
    const total = groups * itemsPerGroup;
    const animal = getRandomAnimal();
    const color = getRandomColor();
    
    return this.createQuestion(
      `ในสวนมี${animal}สี${color} ${groups} กลุ่ม กลุ่มละ ${itemsPerGroup} ตัว รวมกันมีกี่ตัว?`,
      total,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(total, 4, 5)
    );
  }

  private generateShoppingProblem(level: number, config: LevelConfig): Question {
    const price = random(2, 10);
    const quantity = random(2, 5);
    const total = price * quantity;
    const item = getRandomToy();
    
    const scenarios = [
      `${item}ราคาชิ้นละ ${price} บาท ซื้อ ${quantity} ชิ้น ต้องจ่ายเงินกี่บาท?`,
      `ซื้อ${item} ${quantity} ชิ้น ๆ ละ ${price} บาท รวมเท่าไร?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      total,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(total, 4, 5)
    );
  }
}