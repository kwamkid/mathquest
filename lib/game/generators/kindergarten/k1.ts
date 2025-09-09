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
      const types = [
        () => this.generateSimpleCounting(level, config),
        () => this.generateObjectCounting(level, config)
      ];
      return randomChoice(types)();
    } else if (level <= 60) {
      // Level 31-60: บวกเลข 1-5
      return this.generateSimpleAddition(level, config);
    } else {
      // Level 61-100: บวกเลข 1-10
      const types = [
        () => this.generateSimpleAddition(level, config),
        () => this.generateNumberSequence(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateSimpleCounting(level: number, config: LevelConfig): Question {
    // นับเลขธรรมดา
    let maxNum: number;
    if (level <= 10) {
      maxNum = 3;
    } else if (level <= 20) {
      maxNum = 4;
    } else {
      maxNum = 5;
    }
    
    const num = random(1, maxNum);
    
    return this.createQuestion(
      `${num} = ?`,
      num,
      QuestionType.MIXED,
      level,
      generateChoices(num, 4, Math.max(3, maxNum))
    );
  }

  private generateObjectCounting(level: number, config: LevelConfig): Question {
    // นับจำนวนรูปภาพ
    const objects = ['●', '■', '▲', '★', '♦', '♥'];
    const obj = randomChoice(objects);
    
    let maxCount: number;
    if (level <= 10) {
      maxCount = 3;
    } else if (level <= 20) {
      maxCount = 4;
    } else {
      maxCount = 5;
    }
    
    const count = random(1, maxCount);
    const display = Array(count).fill(obj).join(' ');
    
    // ใช้คำว่า "มี" ที่เป็นธรรมชาติ
    const questions = [
      `มี ${display} กี่อัน`,
      `มี ${display} กี่อัน = ?`,
      `${display} มีกี่อัน`
    ];
    
    return this.createQuestion(
      randomChoice(questions),
      count,
      QuestionType.MIXED,
      level,
      generateChoices(count, 4, Math.max(3, maxCount))
    );
  }

  private generateSimpleAddition(level: number, config: LevelConfig): Question {
    if (level <= 60) {
      // Level 31-60: บวกเลข 1-5 (ผลบวกไม่เกิน 5)
      const maxSum = 5;
      const a = random(1, 3);
      const b = random(1, Math.min(2, maxSum - a));
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, Math.max(3, maxSum))
      );
    } else {
      // Level 61-100: บวกเลข 1-10 (ผลบวกไม่เกิน 10)
      const progress = (level - 60) / 40; // 0 to 1
      const maxSum = Math.floor(5 + progress * 5); // 5 to 10
      
      const a = random(1, Math.min(5, maxSum - 1));
      const b = random(1, Math.min(5, maxSum - a));
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, Math.max(4, Math.floor(answer * 1.2)))
      );
    }
  }

  private generateNumberSequence(level: number, config: LevelConfig): Question {
    // นับเลขต่อ - แบบง่ายที่สุด
    const start = random(1, 6);
    const next = start + 1;
    
    return this.createQuestion(
      `${start}, ${next}, ?`,
      next + 1,
      QuestionType.MIXED,
      level,
      generateChoices(next + 1, 4, 3)
    );
  }
}