// lib/game/generators/kindergarten/k3.ts

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

export class K3Generator extends BaseGenerator {
  constructor() {
    super('K3');
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
        return this.generateCounting(level, config);
    }
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    const problemTypes = [
      () => this.generateAdditionProblem(level, config),
      () => this.generateSubtractionProblem(level, config),
      () => this.generateMultiplicationProblem(level, config),
      () => this.generateSharingProblem(level, config),
      () => this.generateTimeProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 30) {
      return [QuestionType.ADDITION, QuestionType.MIXED];
    } else if (level <= 60) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MIXED];
    } else if (level <= 85) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION, QuestionType.MIXED];
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION, QuestionType.MIXED, QuestionType.WORD_PROBLEM];
    }
  }

  private generateCounting(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 20); // K3 นับไม่เกิน 20
    const count = random(10, max);
    
    const items = [getRandomFruit(), getRandomAnimal(), getRandomToy()];
    const item = randomChoice(items);
    const color = getRandomColor();
    
    return this.createQuestion(
      `นับ${item}สี${color}ที่อยู่ในรูป มีทั้งหมด ${count} ตัว ถูกหรือผิด? (ตอบ 1=ถูก, 0=ผิด)`,
      1, // สมมติว่าถูก
      QuestionType.MIXED,
      level,
      [0, 1]
    );
  }

  private generateAddition(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 20);
    
    if (level <= 40) {
      // ผลบวกไม่เกิน 10
      const a = random(1, 6);
      const b = random(1, Math.min(10 - a, 6));
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, 3)
      );
    } else {
      // ผลบวกไม่เกิน 20
      const a = random(3, 12);
      const b = random(2, Math.min(20 - a, 10));
      const answer = a + b;
      
      return this.createQuestion(
        `${a} + ${b} = ?`,
        answer,
        QuestionType.ADDITION,
        level,
        generateChoices(answer, 4, 4)
      );
    }
  }

  private generateSubtraction(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 20);
    
    if (level <= 40) {
      const a = random(3, 10);
      const b = random(1, a - 1);
      const answer = a - b;
      
      return this.createQuestion(
        `${a} - ${b} = ?`,
        answer,
        QuestionType.SUBTRACTION,
        level,
        generateChoices(answer, 4, 3)
      );
    } else {
      const a = random(5, max);
      const b = random(1, a - 1);
      const answer = a - b;
      
      return this.createQuestion(
        `${a} - ${b} = ?`,
        answer,
        QuestionType.SUBTRACTION,
        level,
        generateChoices(answer, 4, 4)
      );
    }
  }

  private generateMultiplication(level: number, config: LevelConfig): Question {
    // เริ่มด้วยสูตรคูณง่าย ๆ
    const multiplicands = [2, 3, 4, 5];
    const a = randomChoice(multiplicands);
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

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 30) {
      return this.generateAddition(level, config);
    } else if (level <= 60) {
      return random(0, 1) === 0 
        ? this.generateAddition(level, config)
        : this.generateSubtraction(level, config);
    } else {
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSubtraction(level, config),
        () => this.generateMultiplication(level, config),
        () => this.generateComparison(level, config),
        () => this.generatePattern(level, config),
        () => this.generateNumberBonds(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateComparison(level: number, config: LevelConfig): Question {
    const max = Math.min(config.numberRange.max, 20);
    const a = random(5, max);
    const b = random(5, max);
    
    const symbols = ['>', '<', '='];
    let correctSymbol: string;
    
    if (a > b) correctSymbol = '>';
    else if (a < b) correctSymbol = '<';
    else correctSymbol = '=';
    
    const answer = symbols.indexOf(correctSymbol);
    
    return this.createQuestion(
      `${a} __ ${b} ใส่เครื่องหมายที่ถูกต้อง (0=>, 1=<, 2==)`,
      answer,
      QuestionType.MIXED,
      level,
      [0, 1, 2]
    );
  }

  private generatePattern(level: number, config: LevelConfig): Question {
    const patterns = [
      // เพิ่มทีละ 2
      () => {
        const start = random(2, 8);
        const missing = start + 4;
        return {
          question: `${start}, ${start + 2}, ?, ${start + 6} ตัวเลขที่หายไปคือ?`,
          answer: missing
        };
      },
      // เพิ่มทีละ 5
      () => {
        const start = random(1, 5);
        const missing = start + 10;
        return {
          question: `${start}, ${start + 5}, ?, ${start + 15} ตัวเลขที่หายไปคือ?`,
          answer: missing
        };
      },
      // ลดทีละ 1
      () => {
        const start = random(10, 15);
        const missing = start - 2;
        return {
          question: `${start}, ${start - 1}, ?, ${start - 3} ตัวเลขที่หายไปคือ?`,
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

  private generateNumberBonds(level: number, config: LevelConfig): Question {
    // Number bonds เช่น 5 = 2 + ?
    const total = random(5, 15);
    const part1 = random(1, total - 1);
    const part2 = total - part1;
    
    return this.createQuestion(
      `${total} = ${part1} + ?`,
      part2,
      QuestionType.MIXED,
      level,
      generateChoices(part2, 4, 3)
    );
  }

  private generateAdditionProblem(level: number, config: LevelConfig): Question {
    const a = random(3, 8);
    const b = random(3, 8);
    const fruit = getRandomFruit();
    const name1 = getRandomName();
    const name2 = getRandomName();
    
    return this.createQuestion(
      `${name1}มี${fruit} ${a} ลูก ${name2}มี ${b} ลูก รวมกันมีกี่ลูก?`,
      a + b,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(a + b, 4, 4)
    );
  }

  private generateSubtractionProblem(level: number, config: LevelConfig): Question {
    const total = random(10, 20);
    const taken = random(3, total - 2);
    const remaining = total - taken;
    const toy = getRandomToy();
    const name = getRandomName();
    
    return this.createQuestion(
      `${name}มี${toy} ${total} ชิ้น เล่นหายไป ${taken} ชิ้น เหลือกี่ชิ้น?`,
      remaining,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(remaining, 4, 4)
    );
  }

  private generateMultiplicationProblem(level: number, config: LevelConfig): Question {
    const groups = random(2, 5);
    const itemsPerGroup = random(2, 4);
    const total = groups * itemsPerGroup;
    const animal = getRandomAnimal();
    
    return this.createQuestion(
      `มี${animal} ${groups} กลุ่ม กลุ่มละ ${itemsPerGroup} ตัว รวมกันมีกี่ตัว?`,
      total,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(total, 4, 5)
    );
  }

  private generateSharingProblem(level: number, config: LevelConfig): Question {
    const people = random(2, 5);
    const totalItems = generateDivisibleNumbers(people, 6, 20);
    const itemsPerPerson = totalItems / people;
    const item = getRandomFruit();
    
    return this.createQuestion(
      `มี${item} ${totalItems} ลูก จะแบ่งให้ ${people} คน คนละเท่า ๆ กัน คนละกี่ลูก?`,
      itemsPerPerson,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(itemsPerPerson, 4, 3)
    );
  }

  private generateTimeProblem(level: number, config: LevelConfig): Question {
    const hour = random(1, 12);
    const nextHour = hour === 12 ? 1 : hour + 1;
    
    const timeProblems = [
      {
        question: `ตอนนี้เวลา ${hour} โมง อีก 1 ชั่วโมงจะเป็นเวลากี่โมง?`,
        answer: nextHour
      },
      {
        question: `ถ้าเข้านอนเวลา ${hour} โมง ตื่นเวลา ${nextHour} โมง นอนกี่ชั่วโมง?`,
        answer: 1
      }
    ];
    
    const problem = randomChoice(timeProblems);
    
    return this.createQuestion(
      problem.question,
      problem.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(problem.answer, 4, 2)
    );
  }
}