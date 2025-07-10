// lib/game/generators/elementary/p4.ts

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
  generateDivisibleNumbers,
  fractionToDecimal,
  simplifyFraction
} from '../utils';

export class P4Generator extends BaseGenerator {
  constructor() {
    super('P4');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    const questionType = randomChoice(this.getAvailableQuestionTypes(level));
    
    switch (questionType) {
      case QuestionType.MULTIPLICATION:
        return this.generateMultiplication(level, config);
      case QuestionType.DIVISION:
        return this.generateDivision(level, config);
      case QuestionType.MIXED:
        return this.generateMixed(level, config);
      case QuestionType.WORD_PROBLEM:
        return this.generateWordProblem(level, config);
      default:
        return this.generateMultiplication(level, config);
    }
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    const problemTypes = [
      () => this.generateAreaProblem(level, config),
      () => this.generateMultiStepProblem(level, config),
      () => this.generateBusinessProblem(level, config),
      () => this.generateTimeDistanceProblem(level, config),
      () => this.generateFractionWordProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.MULTIPLICATION]; // คูณ 2 หลัก
    } else if (level <= 50) {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION]; // หารพื้นฐาน
    } else if (level <= 75) {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION, QuestionType.MIXED]; // โจทย์ผสมมีวงเล็บ
    } else {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION, QuestionType.MIXED, QuestionType.WORD_PROBLEM]; // โจทย์ปัญหา
    }
  }

  private generateMultiplication(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: คูณเลข 2 หลัก
      const a = random(10, 25);
      const b = random(2, 12);
      const answer = a * b;
      
      return this.createQuestion(
        `${a} × ${b} = ?`,
        answer,
        QuestionType.MULTIPLICATION,
        level,
        generateChoices(answer, 4, Math.max(15, Math.floor(answer * 0.2)))
      );
    } else {
      // Level 26+: คูณเลขใหญ่ขึ้น
      const a = random(15, 50);
      const b = random(3, 15);
      const answer = a * b;
      
      return this.createQuestion(
        `${a} × ${b} = ?`,
        answer,
        QuestionType.MULTIPLICATION,
        level,
        generateChoices(answer, 4, Math.max(20, Math.floor(answer * 0.15)))
      );
    }
  }

  private generateDivision(level: number, config: LevelConfig): Question {
    if (level <= 50) {
      // Level 26-50: หารพื้นฐาน
      const divisors = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
      const divisor = randomChoice(divisors);
      const quotient = random(4, 15);
      const dividend = divisor * quotient;
      
      return this.createQuestion(
        `${dividend} ÷ ${divisor} = ?`,
        quotient,
        QuestionType.DIVISION,
        level,
        generateChoices(quotient, 4, 5)
      );
    } else {
      // Level 51+: หารยาวเบื้องต้น
      const divisor = random(11, 25);
      const quotient = random(5, 20);
      const dividend = divisor * quotient;
      
      return this.createQuestion(
        `${dividend} ÷ ${divisor} = ?`,
        quotient,
        QuestionType.DIVISION,
        level,
        generateChoices(quotient, 4, 6)
      );
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 75) {
      // Level 51-75: โจทย์ผสมมีวงเล็บ
      const operations = [
        {
          generate: () => {
            const a = random(5, 15);
            const b = random(3, 10);
            const c = random(2, 8);
            return {
              question: `(${a} + ${b}) × ${c} = ?`,
              answer: (a + b) * c
            };
          }
        },
        {
          generate: () => {
            const a = random(20, 50);
            const b = random(5, 15);
            const c = random(2, 6);
            return {
              question: `${a} + (${b} × ${c}) = ?`,
              answer: a + (b * c)
            };
          }
        },
        {
          generate: () => {
            const a = random(30, 80);
            const b = random(8, 20);
            const c = random(3, 7);
            return {
              question: `(${a} - ${b}) ÷ ${c} = ?`,
              answer: Math.floor((a - b) / c)
            };
          }
        },
        {
          generate: () => {
            const a = random(6, 12);
            const b = random(4, 8);
            const c = random(5, 15);
            return {
              question: `${a} × ${b} - ${c} = ?`,
              answer: (a * b) - c
            };
          }
        }
      ];
      
      const op = randomChoice(operations).generate();
      
      return this.createQuestion(
        op.question,
        op.answer,
        QuestionType.MIXED,
        level,
        generateChoices(op.answer, 4, Math.max(8, Math.floor(op.answer * 0.2)))
      );
    } else {
      // Level 76+: โจทย์ซับซ้อนขึ้น
      const types = [
        () => this.generateParenthesesProblem(level, config),
        () => this.generateOrderOfOperations(level, config),
        () => this.generateFractionMixed(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateParenthesesProblem(level: number, config: LevelConfig): Question {
    const operations = [
      {
        generate: () => {
          const a = random(8, 20);
          const b = random(3, 8);
          const c = random(2, 6);
          const d = random(5, 12);
          return {
            question: `(${a} + ${b}) × (${c} + ${d}) = ?`,
            answer: (a + b) * (c + d)
          };
        }
      },
      {
        generate: () => {
          const a = random(50, 100);
          const b = random(10, 30);
          const c = random(3, 8);
          const d = random(2, 5);
          return {
            question: `(${a} - ${b}) ÷ (${c} + ${d}) = ?`,
            answer: Math.floor((a - b) / (c + d))
          };
        }
      }
    ];
    
    const op = randomChoice(operations).generate();
    
    return this.createQuestion(
      op.question,
      op.answer,
      QuestionType.MIXED,
      level,
      generateChoices(op.answer, 4, Math.max(5, Math.floor(op.answer * 0.3)))
    );
  }

  private generateOrderOfOperations(level: number, config: LevelConfig): Question {
    const a = random(3, 8);
    const b = random(4, 9);
    const c = random(6, 15);
    const d = random(2, 5);
    
    // a × b + c ÷ d
    const answer = (a * b) + Math.floor(c / d);
    
    return this.createQuestion(
      `${a} × ${b} + ${c} ÷ ${d} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 8)
    );
  }

  private generateFractionMixed(level: number, config: LevelConfig): Question {
    // เศษส่วนของจำนวน
    const fractions = [
      { num: 1, den: 2 },
      { num: 1, den: 3 },
      { num: 1, den: 4 },
      { num: 2, den: 3 },
      { num: 3, den: 4 }
    ];
    
    const fraction = randomChoice(fractions);
    const total = generateDivisibleNumbers(fraction.den, 12, 60);
    const answer = (total * fraction.num) / fraction.den;
    
    return this.createQuestion(
      `${fraction.num}/${fraction.den} ของ ${total} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, Math.max(3, Math.floor(answer * 0.4)))
    );
  }

  private generateAreaProblem(level: number, config: LevelConfig): Question {
    const length = random(12, 35);
    const width = random(8, 25);
    const area = length * width;
    
    const scenarios = [
      `สนามฟุตบอลยาว ${length} เมตร กว้าง ${width} เมตร พื้นที่กี่ตารางเมตร?`,
      `ห้องเรียนยาว ${length} เมตร กว้าง ${width} เมตร พื้นที่กี่ตารางเมตร?`,
      `สวนสี่เหลี่ยมผืนผ้า ยาว ${length} เมตร กว้าง ${width} เมตร พื้นที่เท่าไร?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      area,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(area, 4, Math.max(20, Math.floor(area * 0.15)))
    );
  }

  private generateMultiStepProblem(level: number, config: LevelConfig): Question {
    const classrooms = random(4, 8);
    const studentsPerClass = random(25, 40);
    const booksPerStudent = random(3, 6);
    const totalBooks = classrooms * studentsPerClass * booksPerStudent;
    
    return this.createQuestion(
      `โรงเรียนมี ${classrooms} ห้องเรียน ห้องละ ${studentsPerClass} คน แต่ละคนได้หนังสือ ${booksPerStudent} เล่ม รวมกี่เล่ม?`,
      totalBooks,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(totalBooks, 4, Math.max(50, Math.floor(totalBooks * 0.1)))
    );
  }

  private generateBusinessProblem(level: number, config: LevelConfig): Question {
    const itemPrice = random(25, 80);
    const itemsSold = random(15, 45);
    const revenue = itemPrice * itemsSold;
    const cost = random(Math.floor(revenue * 0.6), Math.floor(revenue * 0.8));
    const profit = revenue - cost;
    const item = getRandomToy();
    
    return this.createQuestion(
      `ร้านขาย${item}ชิ้นละ ${itemPrice} บาท ขายได้ ${itemsSold} ชิ้น ต้นทุนรวม ${cost} บาท กำไรกี่บาท?`,
      profit,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(profit, 4, Math.max(50, Math.floor(profit * 0.2)))
    );
  }

  private generateTimeDistanceProblem(level: number, config: LevelConfig): Question {
    const timeProblems = [
      {
        generate: () => {
          const speed = random(40, 80);
          const time = random(2, 6);
          const distance = speed * time;
          return {
            question: `รถวิ่งด้วยความเร็ว ${speed} กม./ชม. เป็นเวลา ${time} ชั่วโมง วิ่งได้กี่กิโลเมตร?`,
            answer: distance
          };
        }
      },
      {
        generate: () => {
          const startTime = random(8, 14);
          const endTime = random(startTime + 2, startTime + 8);
          const duration = endTime - startTime;
          return {
            question: `เดินทางออกจากบ้านเวลา ${startTime}.00 น. ถึงที่หมายเวลา ${endTime}.00 น. ใช้เวลากี่ชั่วโมง?`,
            answer: duration
          };
        }
      }
    ];
    
    const problem = randomChoice(timeProblems).generate();
    
    return this.createQuestion(
      problem.question,
      problem.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(problem.answer, 4, Math.max(5, Math.floor(problem.answer * 0.3)))
    );
  }

  private generateFractionWordProblem(level: number, config: LevelConfig): Question {
    const totalStudents = generateDivisibleNumbers(4, 20, 80);
    const fraction = random(1, 3);
    const denominator = 4;
    const studentsInActivity = (totalStudents * fraction) / denominator;
    
    const activities = ['เล่นฟุตบอล', 'เล่นบาสเกตบอล', 'อ่านหนังสือ', 'วาดรูป', 'เล่นดนตรี'];
    const activity = randomChoice(activities);
    
    return this.createQuestion(
      `นักเรียนทั้งหมด ${totalStudents} คน ${fraction}/${denominator} ของนักเรียน${activity} มีนักเรียนกี่คน${activity}?`,
      studentsInActivity,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(studentsInActivity, 4, Math.max(5, Math.floor(studentsInActivity * 0.3)))
    );
  }
}