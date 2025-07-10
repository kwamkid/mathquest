// lib/game/generators/kindergarten/k1.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice
} from '../utils';

export class K1Generator extends BaseGenerator {
  constructor() {
    super('K1');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // K1 จะเน้นแค่โจทย์ตัวเลขง่ายๆ ไม่มีคำถามยาวๆ
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 30) {
      return [QuestionType.MIXED]; // นับเลข 1-5
    } else if (level <= 60) {
      return [QuestionType.ADDITION]; // บวกเลข 1-5
    } else {
      return [QuestionType.ADDITION, QuestionType.MIXED]; // บวกเลข 1-10
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 30) {
      // Level 1-30: นับเลข 1-5
      return this.generateCounting(level, config);
    } else if (level <= 60) {
      // Level 31-60: บวกเลข 1-5
      return this.generateAddition(level, config);
    } else {
      // Level 61-100: บวกเลข 1-10
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSimpleComparison(level, config),
        () => this.generateMissingNumber(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateCounting(level: number, config: LevelConfig): Question {
    const max = Math.min(5, Math.floor(level / 6) + 1); // ค่อยๆ เพิ่มจาก 1 ถึง 5
    const num = random(1, max);
    
    return this.createQuestion(
      `${num} = ?`,
      num,
      QuestionType.MIXED,
      level,
      generateChoices(num, 4, 2)
    );
  }

  private generateAddition(level: number, config: LevelConfig): Question {
    if (level <= 60) {
      // Level 31-60: บวกเลข 1-5 (ผลบวกไม่เกิน 5)
      const a = random(1, 3);
      const b = random(1, Math.min(2, 5 - a));
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, 2)
      );
    } else {
      // Level 61-100: บวกเลข 1-10
      const maxNum = Math.min(10, 5 + Math.floor((level - 60) / 10));
      const a = random(1, Math.floor(maxNum / 2));
      const b = random(1, Math.floor(maxNum / 2));
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

  private generateSimpleComparison(level: number, config: LevelConfig): Question {
    const a = random(1, 8);
    const b = random(1, 8);
    
    if (a === b) {
      // ถ้าเท่ากัน สร้างใหม่
      return this.generateAddition(level, config);
    }
    
    const answer = Math.max(a, b);
    
    return this.createQuestion(
      `${a}, ${b} = ?`,  // ตอบตัวที่มากกว่า
      answer,
      QuestionType.MIXED,
      level,
      [a, b]
    );
  }

  private generateMissingNumber(level: number, config: LevelConfig): Question {
    // เลขหายในลำดับง่ายๆ
    const start = random(1, 5);
    const missing = start + 1; // ตัวที่ 2 หาย
    
    return this.createQuestion(
      `${start}, ?, ${start + 2}`,
      missing,
      QuestionType.MIXED,
      level,
      generateChoices(missing, 4, 1)
    );
  }
}