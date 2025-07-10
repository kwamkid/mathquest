// lib/game/generators/kindergarten/k2.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice
} from '../utils';

export class K2Generator extends BaseGenerator {
  constructor() {
    super('K2');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // K2 จะเน้นแค่โจทย์ตัวเลขง่ายๆ ไม่มีคำถามยาวๆ
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.ADDITION]; // บวกเลข 1-5
    } else if (level <= 50) {
      return [QuestionType.ADDITION]; // บวกเลข 1-10
    } else if (level <= 75) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION]; // เพิ่มลบ
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED];
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: บวกเลข 1-5
      return this.generateSimpleAddition(level, config);
    } else if (level <= 50) {
      // Level 26-50: บวกเลข 1-10
      return this.generateAddition(level, config);
    } else if (level <= 75) {
      // Level 51-75: ลบเลขง่ายๆ
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSubtraction(level, config)
      ];
      return randomChoice(types)();
    } else {
      // Level 76-100: บวกลบผสม
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSubtraction(level, config),
        () => this.generatePattern(level, config),
        () => this.generateComparison(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateSimpleAddition(level: number, config: LevelConfig): Question {
    // Level 1-25: เริ่มจากง่ายมาก
    const maxSum = Math.min(5, 2 + Math.floor(level / 5));
    const a = random(1, Math.floor(maxSum / 2));
    const b = random(1, maxSum - a);
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 2)
    );
  }

  private generateAddition(level: number, config: LevelConfig): Question {
    // Level 26-50: บวกเลขไม่เกิน 10
    const maxNum = Math.min(10, 5 + Math.floor((level - 25) / 5));
    const a = random(1, Math.floor(maxNum * 0.7));
    const b = random(1, Math.floor(maxNum * 0.7));
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  private generateSubtraction(level: number, config: LevelConfig): Question {
    // ลบเลขง่ายๆ ผลลัพธ์ไม่ติดลบ
    const maxNum = level <= 75 ? 10 : 15;
    const a = random(3, maxNum);
    const b = random(1, Math.min(a - 1, Math.floor(a / 2)));
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  private generatePattern(level: number, config: LevelConfig): Question {
    // ลำดับเลขง่ายๆ
    const patterns = [
      // เพิ่มทีละ 1
      () => {
        const start = random(1, 5);
        const missing = start + 2;
        return {
          question: `${start}, ${start + 1}, ?, ${start + 3}`,
          answer: missing
        };
      },
      // เพิ่มทีละ 2
      () => {
        const start = random(1, 4);
        const missing = start + 2;
        return {
          question: `${start}, ?, ${start + 4}`,
          answer: missing
        };
      },
      // นับถอยหลัง
      () => {
        const start = random(5, 10);
        const missing = start - 1;
        return {
          question: `${start}, ?, ${start - 2}`,
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

  private generateComparison(level: number, config: LevelConfig): Question {
    const a = random(1, 10);
    const b = random(1, 10);
    
    if (a === b) {
      // ถ้าเท่ากัน ให้ตอบตัวใดตัวหนึ่ง
      return this.createQuestion(
        `${a} = ${b} = ?`,
        a,
        QuestionType.MIXED,
        level,
        generateChoices(a, 4, 3)
      );
    }
    
    // ตอบตัวที่มากกว่า
    const answer = Math.max(a, b);
    
    return this.createQuestion(
      `${a}, ${b} → ?`, // ลูกศรชี้ไปที่ตัวที่มากกว่า
      answer,
      QuestionType.MIXED,
      level,
      [a, b]
    );
  }
}