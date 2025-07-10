// lib/game/generators/kindergarten/k1.ts

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
  numberToThai,
  randomChoice
} from '../utils';

export class K1Generator extends BaseGenerator {
  constructor() {
    super('K1');
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
        return this.generateCounting(level, config);
    }
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    const problemTypes = [
      () => this.generateCountingProblem(level, config),
      () => this.generateAdditionProblem(level, config),
      () => this.generateSubtractionProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 20) {
      return [QuestionType.MIXED]; // นับเลข 1-5
    } else if (level <= 40) {
      return [QuestionType.ADDITION, QuestionType.MIXED]; // บวกเลขง่าย ๆ
    } else if (level <= 70) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED];
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED, QuestionType.WORD_PROBLEM];
    }
  }

  private generateCounting(level: number, config: LevelConfig): Question {
    const { min, max } = config.numberRange;
    const count = random(min, Math.min(max, 5)); // K1 นับไม่เกิน 5
    
    const items = [getRandomFruit(), getRandomAnimal(), getRandomToy()];
    const item = randomChoice(items);
    
    return this.createQuestion(
      `มี${item} ${count} ตัว นับดูว่ามีกี่ตัว?`,
      count,
      QuestionType.MIXED,
      level,
      generateChoices(count, 4, 2)
    );
  }

  private generateAddition(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 5);
    const a = random(1, max);
    const b = random(1, Math.min(max - a, 3)); // ผลบวกไม่เกิน 5
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 2)
    );
  }

  private generateSubtraction(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 5);
    const a = random(2, max);
    const b = random(1, a - 1); // ผลลบไม่ติดลบ
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 2)
    );
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 20) {
      return this.generateCounting(level, config);
    } else if (level <= 60) {
      return random(0, 1) === 0 
        ? this.generateAddition(level, config)
        : this.generateSubtraction(level, config);
    } else {
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSubtraction(level, config),
        () => this.generateComparison(level, config),
        () => this.generatePattern(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateComparison(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 5);
    const a = random(1, max);
    const b = random(1, max);
    
    let question: string;
    let answer: number;
    
    if (a > b) {
      question = `${a} และ ${b} อันไหนมากกว่า?`;
      answer = a;
    } else if (a < b) {
      question = `${a} และ ${b} อันไหนน้อยกว่า?`;
      answer = a;
    } else {
      // เท่ากัน ถามอีกแบบ
      const c = random(1, max);
      if (c !== a) {
        question = `${a} และ ${c} อันไหนเท่ากับ ${a}?`;
        answer = a;
      } else {
        return this.generateAddition(level, config); // fallback
      }
    }
    
    return this.createQuestion(
      question,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 2)
    );
  }

  private generatePattern(level: number, config: LevelConfig): Question {
    // ลำดับง่าย ๆ เช่น 1, 2, ?, 4
    const start = random(1, 3);
    const missing = start + 2; // ช่องที่ 3
    
    return this.createQuestion(
      `${start}, ${start + 1}, ?, ${start + 3} ตัวเลขที่หายไปคือ?`,
      missing,
      QuestionType.MIXED,
      level,
      generateChoices(missing, 4, 1)
    );
  }

  private generateCountingProblem(level: number, config: LevelConfig): Question {
    const count = random(1, 5);
    const animal = getRandomAnimal();
    
    return this.createQuestion(
      `ในสวนมี${animal} ${count} ตัว แต่ละตัวมี 4 ขา รวมกันมีกี่ขา?`,
      count * 4,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(count * 4, 4, 3)
    );
  }

  private generateAdditionProblem(level: number, config: LevelConfig): Question {
    const a = random(1, 3);
    const b = random(1, 3);
    const fruit = getRandomFruit();
    
    return this.createQuestion(
      `น้องมี${fruit} ${a} ลูก แม่ให้อีก ${b} ลูก รวมกันมีกี่ลูก?`,
      a + b,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(a + b, 4, 2)
    );
  }

  private generateSubtractionProblem(level: number, config: LevelConfig): Question {
    const total = random(3, 5);
    const taken = random(1, total - 1);
    const toy = getRandomToy();
    
    return this.createQuestion(
      `น้องมี${toy} ${total} ชิ้น เอาไปให้เพื่อน ${taken} ชิ้น เหลือกี่ชิ้น?`,
      total - taken,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(total - taken, 4, 2)
    );
  }
}