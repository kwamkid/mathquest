// lib/game/generators/kindergarten/k2.ts

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

export class K2Generator extends BaseGenerator {
  constructor() {
    super('K2');
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
      () => this.generateSubtractionProblem(level, config),
      () => this.generateGroupingProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.MIXED]; // นับเลข 1-10
    } else if (level <= 50) {
      return [QuestionType.ADDITION, QuestionType.MIXED]; 
    } else if (level <= 75) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED];
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED, QuestionType.WORD_PROBLEM];
    }
  }

  private generateCounting(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 10); // K2 นับไม่เกิน 10
    const count = random(1, max);
    
    const items = [getRandomFruit(), getRandomAnimal(), getRandomToy()];
    const item = randomChoice(items);
    const color = getRandomColor();
    
    return this.createQuestion(
      `มี${item}สี${color} ${count} ตัว นับดูว่ามีกี่ตัว?`,
      count,
      QuestionType.MIXED,
      level,
      generateChoices(count, 4, 3)
    );
  }

  private generateAddition(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 10);
    
    if (level <= 40) {
      // ผลบวกไม่เกิน 5
      const a = random(1, 3);
      const b = random(1, Math.min(5 - a, 3));
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, 2)
      );
    } else {
      // ผลบวกไม่เกิน 10
      const a = random(1, 6);
      const b = random(1, Math.min(10 - a, 5));
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, 3)
      );
    }
  }

  private generateSubtraction(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 10);
    
    if (level <= 40) {
      const a = random(2, 5);
      const b = random(1, a - 1);
      const answer = a - b;
      
      return this.createQuestion(
        `${a} - ${b} = ?`,
        answer,
        QuestionType.SUBTRACTION,
        level,
        generateChoices(answer, 4, 2)
      );
    } else {
      const a = random(3, max);
      const b = random(1, a - 1);
      const answer = a - b;
      
      return this.createQuestion(
        `${a} - ${b} = ?`,
        answer,
        QuestionType.SUBTRACTION,
        level,
        generateChoices(answer, 4, 3)
      );
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
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
        () => this.generatePattern(level, config),
        () => this.generateShapeCount(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateComparison(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 10);
    const a = random(1, max);
    const b = random(1, max);
    
    const comparisons = [
      {
        condition: a > b,
        question: `${a} และ ${b} ตัวไหนมากกว่า?`,
        answer: a
      },
      {
        condition: a < b,
        question: `${a} และ ${b} ตัวไหนน้อยกว่า?`,
        answer: a
      }
    ];
    
    const validComparisons = comparisons.filter(c => c.condition);
    if (validComparisons.length === 0) {
      return this.generateAddition(level, config); // fallback
    }
    
    const comparison = randomChoice(validComparisons);
    
    return this.createQuestion(
      comparison.question,
      comparison.answer,
      QuestionType.MIXED,
      level,
      generateChoices(comparison.answer, 4, 3)
    );
  }

  private generatePattern(level: number, config: LevelConfig): Question {
    const patterns = [
      // เพิ่มทีละ 1
      () => {
        const start = random(1, 5);
        const missing = start + 2;
        return {
          question: `${start}, ${start + 1}, ?, ${start + 3} ตัวเลขที่หายไปคือ?`,
          answer: missing
        };
      },
      // เพิ่มทีละ 2
      () => {
        const start = random(1, 3);
        const missing = start + 4;
        return {
          question: `${start}, ${start + 2}, ?, ${start + 6} ตัวเลขที่หายไปคือ?`,
          answer: missing
        };
      }
    ];
    
    const pattern = randomChoice(patterns)();
    
    return this.createQuestion(
      pattern.question,
      pattern.answer,
      QuestionType.MIXED,
      level,
      generateChoices(pattern.answer, 4, 2)
    );
  }

  private generateShapeCount(level: number, config: LevelConfig): Question {
    const shapes = ['วงกลม', 'สี่เหลี่ยม', 'สามเหลี่ยม', 'ดาว'];
    const shape = randomChoice(shapes);
    const count = random(3, 8);
    
    return this.createQuestion(
      `ในรูปมี${shape} ${count} อัน นับดูว่ามีกี่อัน?`,
      count,
      QuestionType.MIXED,
      level,
      generateChoices(count, 4, 2)
    );
  }

  private generateCountingProblem(level: number, config: LevelConfig): Question {
    const groups = random(2, 4);
    const itemsPerGroup = random(2, 3);
    const total = groups * itemsPerGroup;
    const item = getRandomToy();
    
    return this.createQuestion(
      `มี${item}วางเป็น ${groups} กอง กองละ ${itemsPerGroup} ชิ้น รวมทั้งหมดกี่ชิ้น?`,
      total,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(total, 4, 3)
    );
  }

  private generateAdditionProblem(level: number, config: LevelConfig): Question {
    const a = random(2, 5);
    const b = random(2, 5);
    const fruit = getRandomFruit();
    const name = getRandomName();
    
    return this.createQuestion(
      `${name}มี${fruit} ${a} ลูก แล้วไปซื้อมาอีก ${b} ลูก รวมกันมีกี่ลูก?`,
      a + b,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(a + b, 4, 3)
    );
  }

  private generateSubtractionProblem(level: number, config: LevelConfig): Question {
    const total = random(5, 10);
    const taken = random(2, total - 2);
    const remaining = total - taken;
    const toy = getRandomToy();
    const name = getRandomName();
    
    return this.createQuestion(
      `${name}มี${toy} ${total} ชิ้น เอาไปแจก ${taken} ชิ้น เหลือกี่ชิ้น?`,
      remaining,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(remaining, 4, 3)
    );
  }

  private generateGroupingProblem(level: number, config: LevelConfig): Question {
    const total = random(6, 12);
    const groupSize = random(2, 4);
    const groups = Math.floor(total / groupSize);
    const actualTotal = groups * groupSize; // ปรับให้หารลงตัว
    const animal = getRandomAnimal();
    
    return this.createQuestion(
      `มี${animal} ${actualTotal} ตัว จะแบ่งให้คนละ ${groupSize} ตัว แบ่งได้กี่คน?`,
      groups,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(groups, 4, 2)
    );
  }
}