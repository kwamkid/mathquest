// lib/game/generators/kindergarten/k3.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice
} from '../utils';

export class K3Generator extends BaseGenerator {
  constructor() {
    super('K3');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // K3 จะเน้นแค่โจทย์ตัวเลขง่ายๆ ไม่มีคำถามยาวๆ
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.ADDITION];
    } else if (level <= 50) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION];
    } else if (level <= 75) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED];
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION, QuestionType.MIXED];
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: บวกเลข 1-10
      return this.generateAddition(level, config);
    } else if (level <= 50) {
      // Level 26-50: ลบเลข (ไม่เกิน 10)
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSubtraction(level, config)
      ];
      return randomChoice(types)();
    } else if (level <= 75) {
      // Level 51-75: บวกเลขได้ผลลัพธ์เกิน 10
      const types = [
        () => this.generateLargerAddition(level, config),
        () => this.generateSubtraction(level, config),
        () => this.generateNumberBonds(level, config)
      ];
      return randomChoice(types)();
    } else {
      // Level 76-100: บวกลบผสม และคูณง่ายๆ
      const types = [
        () => this.generateLargerAddition(level, config),
        () => this.generateSubtraction(level, config),
        () => this.generateSimpleMultiplication(level, config),
        () => this.generateComparison(level, config),
        () => this.generatePattern(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateAddition(level: number, config: LevelConfig): Question {
    // Level 1-25: บวกเลข 1-10
    const max = Math.min(10, 5 + Math.floor(level / 5));
    const a = random(1, Math.floor(max * 0.7));
    const b = random(1, Math.floor(max * 0.7));
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  private generateLargerAddition(level: number, config: LevelConfig): Question {
    // Level 51+: บวกเลขให้ได้ผลลัพธ์ 10-20
    const targetMin = 10;
    const targetMax = Math.min(20, 10 + Math.floor((level - 50) / 10));
    const target = random(targetMin, targetMax);
    const a = random(Math.floor(target * 0.3), Math.floor(target * 0.7));
    const b = target - a;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      target,
      QuestionType.ADDITION,
      level,
      generateChoices(target, 4, 4)
    );
  }

  private generateSubtraction(level: number, config: LevelConfig): Question {
    const maxNum = level <= 50 ? 10 : 20;
    const a = random(5, maxNum);
    const b = random(1, Math.min(a - 1, Math.floor(a * 0.6)));
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  private generateSimpleMultiplication(level: number, config: LevelConfig): Question {
    // คูณง่ายๆ แม่ 2, 5, 10
    const multipliers = [2, 5, 10];
    const a = randomChoice(multipliers);
    const b = random(1, 5);
    const answer = a * b;
    
    return this.createQuestion(
      `${a} × ${b} = ?`,
      answer,
      QuestionType.MULTIPLICATION,
      level,
      generateChoices(answer, 4, 5)
    );
  }

  private generateNumberBonds(level: number, config: LevelConfig): Question {
    // a + ? = c (หาตัวที่หาย)
    const c = random(8, 15);
    const a = random(2, c - 2);
    const answer = c - a;
    
    return this.createQuestion(
      `${a} + ? = ${c}`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  private generateComparison(level: number, config: LevelConfig): Question {
    const a = random(5, 20);
    const b = random(5, 20);
    
    if (a === b) {
      // ถ้าเท่ากัน ถามว่าเท่ากันใช่ไหม (1 = ใช่, 0 = ไม่ใช่)
      return this.createQuestion(
        `${a} = ${b} ?`,
        1,
        QuestionType.MIXED,
        level,
        [0, 1]
      );
    }
    
    // ถามว่าอันไหนมากกว่า
    const answer = Math.max(a, b);
    
    return this.createQuestion(
      `${a} ? ${b}`, // เครื่องหมาย ? คือถามว่าอันไหนมากกว่า
      answer,
      QuestionType.MIXED,
      level,
      [a, b]
    );
  }

  private generatePattern(level: number, config: LevelConfig): Question {
    const patterns = [
      // เพิ่มทีละ 2
      () => {
        const start = random(2, 8);
        const missing = start + 4;
        return {
          question: `${start}, ${start + 2}, ?, ${start + 6}`,
          answer: missing
        };
      },
      // เพิ่มทีละ 5
      () => {
        const start = random(0, 5);
        const missing = start + 10;
        return {
          question: `${start}, ${start + 5}, ?, ${start + 15}`,
          answer: missing
        };
      },
      // ลดทีละ 2
      () => {
        const start = random(10, 20);
        const missing = start - 4;
        return {
          question: `${start}, ${start - 2}, ?, ${start - 6}`,
          answer: missing
        };
      },
      // เลขคู่
      () => {
        const start = random(1, 4) * 2;
        const missing = start + 4;
        return {
          question: `${start}, ${start + 2}, ?, ${start + 6}`,
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
      generateChoices(pattern.answer, 4, 3)
    );
  }
}