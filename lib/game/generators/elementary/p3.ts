// lib/game/generators/elementary/p3.ts

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

export class P3Generator extends BaseGenerator {
  constructor() {
    super('P3');
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
      case QuestionType.DIVISION:
        return this.generateDivision(level, config);
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
      () => this.generateMultiStepProblem(level, config),
      () => this.generateMultiplicationProblem(level, config),
      () => this.generateDivisionProblem(level, config),
      () => this.generateMoneyProblem(level, config),
      () => this.generateMeasurementProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 20) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION]; // บวกลบ 3 หลัก
    } else if (level <= 40) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION]; // สูตรคูณแม่ 2-5
    } else if (level <= 60) {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION, QuestionType.MIXED]; // แม่ 6-9
    } else if (level <= 80) {
      return [QuestionType.MULTIPLICATION, QuestionType.DIVISION, QuestionType.MIXED]; // หารเบื้องต้น
    } else {
      return [QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION, QuestionType.DIVISION, QuestionType.WORD_PROBLEM]; // โจทย์ปัญหา
    }
  }

  private generateAddition(level: number, config: LevelConfig): Question {
    const a = random(50, 300);
    const b = random(40, 250);
    const answer = a + b;
    
    return this.createQuestion(
      `${a} + ${b} = ?`,
      answer,
      QuestionType.ADDITION,
      level,
      generateChoices(answer, 4, 50)
    );
  }

  private generateSubtraction(level: number, config: LevelConfig): Question {
    const a = random(100, 400);
    const b = random(30, a - 20);
    const answer = a - b;
    
    return this.createQuestion(
      `${a} - ${b} = ?`,
      answer,
      QuestionType.SUBTRACTION,
      level,
      generateChoices(answer, 4, 40)
    );
  }

  private generateMultiplication(level: number, config: LevelConfig): Question {
    if (level <= 40) {
      // Level 21-40: สูตรคูณแม่ 2-5
      const tables = [2, 3, 4, 5];
      const multiplicand = randomChoice(tables);
      const multiplier = random(1, 12);
      const answer = multiplicand * multiplier;
      
      return this.createQuestion(
        `${multiplicand} × ${multiplier} = ?`,
        answer,
        QuestionType.MULTIPLICATION,
        level,
        generateChoices(answer, 4, Math.max(5, Math.floor(answer * 0.3)))
      );
    } else {
      // Level 41-60: สูตรคูณแม่ 6-9
      const tables = [6, 7, 8, 9];
      const multiplicand = randomChoice(tables);
      const multiplier = random(1, 12);
      const answer = multiplicand * multiplier;
      
      return this.createQuestion(
        `${multiplicand} × ${multiplier} = ?`,
        answer,
        QuestionType.MULTIPLICATION,
        level,
        generateChoices(answer, 4, Math.max(8, Math.floor(answer * 0.2)))
      );
    }
  }

  private generateDivision(level: number, config: LevelConfig): Question {
    const divisors = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const divisor = randomChoice(divisors);
    const quotient = random(2, 12);
    const dividend = divisor * quotient;
    
    return this.createQuestion(
      `${dividend} ÷ ${divisor} = ?`,
      quotient,
      QuestionType.DIVISION,
      level,
      generateChoices(quotient, 4, 4)
    );
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 40) {
      const types = [
        () => this.generateAddition(level, config),
        () => this.generateSubtraction(level, config),
        () => this.generateMultiplication(level, config)
      ];
      return randomChoice(types)();
    } else if (level <= 60) {
      const types = [
        () => this.generateMultiplication(level, config),
        () => this.generateDivision(level, config),
        () => this.generateTwoStepCalculation(level, config)
      ];
      return randomChoice(types)();
    } else {
      const types = [
        () => this.generateMultiplication(level, config),
        () => this.generateDivision(level, config),
        () => this.generateTwoStepCalculation(level, config),
        () => this.generateFractionBasic(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateTwoStepCalculation(level: number, config: LevelConfig): Question {
    const operations = [
      {
        generate: () => {
          const a = random(3, 8);
          const b = random(2, 6);
          const c = random(5, 15);
          return {
            question: `${a} × ${b} + ${c} = ?`,
            answer: (a * b) + c
          };
        }
      },
      {
        generate: () => {
          const a = random(4, 9);
          const b = random(3, 7);
          const c = random(3, 10);
          return {
            question: `${a} × ${b} - ${c} = ?`,
            answer: (a * b) - c
          };
        }
      },
      {
        generate: () => {
          const a = random(20, 50);
          const b = random(2, 5);
          const c = random(3, 8);
          return {
            question: `${a} ÷ ${b} + ${c} = ?`,
            answer: Math.floor(a / b) + c
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
      generateChoices(op.answer, 4, 8)
    );
  }

  private generateFractionBasic(level: number, config: LevelConfig): Question {
    // เศษส่วนพื้นฐาน 1/2, 1/4, 3/4
    const fractions = [
      { num: 1, den: 2, decimal: 0.5 },
      { num: 1, den: 4, decimal: 0.25 },
      { num: 3, den: 4, decimal: 0.75 },
      { num: 1, den: 3, decimal: 0.33 }
    ];
    
    const fraction = randomChoice(fractions);
    const total = random(4, 20);
    const answer = Math.round(total * fraction.decimal);
    
    return this.createQuestion(
      `${fraction.num}/${fraction.den} ของ ${total} = ?`,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, 3)
    );
  }

  private generateMultiStepProblem(level: number, config: LevelConfig): Question {
    const boxes = random(3, 8);
    const itemsPerBox = random(6, 15);
    const sold = random(10, boxes * itemsPerBox - 10);
    const remaining = (boxes * itemsPerBox) - sold;
    const item = getRandomToy();
    
    return this.createQuestion(
      `ร้านมี${item}อยู่ ${boxes} กล่อง กล่องละ ${itemsPerBox} ชิ้น ขายไป ${sold} ชิ้น เหลือกี่ชิ้น?`,
      remaining,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(remaining, 4, 15)
    );
  }

  private generateMultiplicationProblem(level: number, config: LevelConfig): Question {
    const rows = random(4, 9);
    const columns = random(5, 12);
    const total = rows * columns;
    const item = getRandomFruit();
    
    const scenarios = [
      `สวนปลูก${item}เป็นแถว ${rows} แถว แถวละ ${columns} ต้น รวมกันกี่ต้น?`,
      `จัด${item}ใส่กล่อง ${rows} กล่อง กล่องละ ${columns} ลูก รวมกี่ลูก?`,
      `ห้องเรียนมีโต๊ะ ${rows} แถว แถวละ ${columns} ตัว รวมกี่ตัว?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      total,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(total, 4, Math.max(8, Math.floor(total * 0.2)))
    );
  }

  private generateDivisionProblem(level: number, config: LevelConfig): Question {
    const groups = random(4, 12);
    const totalItems = generateDivisibleNumbers(groups, 20, 100);
    const itemsPerGroup = totalItems / groups;
    const item = getRandomAnimal();
    
    const scenarios = [
      `มี${item} ${totalItems} ตัว จะแบ่งเป็น ${groups} กลุ่ม กลุ่มละกี่ตัว?`,
      `แบ่ง${item} ${totalItems} ตัว ให้เด็ก ${groups} คน คนละกี่ตัว?`,
      `${item} ${totalItems} ตัว จะใส่กรง ${groups} กรง กรงละกี่ตัว?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      itemsPerGroup,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(itemsPerGroup, 4, 5)
    );
  }

  private generateMoneyProblem(level: number, config: LevelConfig): Question {
    const itemPrice = random(15, 45);
    const quantity = random(3, 8);
    const totalCost = itemPrice * quantity;
    const paid = totalCost + random(10, 50);
    const change = paid - totalCost;
    const item = getRandomToy();
    
    const scenarios = [
      `ซื้อ${item} ${quantity} ชิ้น ชิ้นละ ${itemPrice} บาท จ่าย ${paid} บาท เงินทอนกี่บาท?`,
      `${item}ราคา ${itemPrice} บาท ซื้อ ${quantity} ชิ้น จ่ายเงิน ${paid} บาท ได้เงินทอนเท่าไร?`
    ];
    
    return this.createQuestion(
      randomChoice(scenarios),
      change,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(change, 4, 15)
    );
  }

  private generateMeasurementProblem(level: number, config: LevelConfig): Question {
    const measurements = [
      {
        unit: 'เมตร',
        generate: () => {
          const length = random(15, 50);
          const width = random(8, 30);
          const perimeter = (length + width) * 2;
          return {
            question: `สนามเป็นสี่เหลี่ยมผืนผ้า ยาว ${length} เมตร กว้าง ${width} เมตร เส้นรอบรูปกี่เมตร?`,
            answer: perimeter
          };
        }
      },
      {
        unit: 'กิโลกรัม',
        generate: () => {
          const bags = random(4, 8);
          const weightPerBag = random(5, 15);
          const totalWeight = bags * weightPerBag;
          return {
            question: `มีถุงข้าว ${bags} ถุง ถุงละ ${weightPerBag} กิโลกรัม รวมกี่กิโลกรัม?`,
            answer: totalWeight
          };
        }
      },
      {
        unit: 'ลิตร',
        generate: () => {
          const bottles = random(6, 12);
          const volumePerBottle = random(2, 8);
          const totalVolume = bottles * volumePerBottle;
          return {
            question: `มีขวดน้ำ ${bottles} ขวด ขวดละ ${volumePerBottle} ลิตร รวมกี่ลิตร?`,
            answer: totalVolume
          };
        }
      }
    ];
    
    const measurement = randomChoice(measurements).generate();
    
    return this.createQuestion(
      measurement.question,
      measurement.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(measurement.answer, 4, Math.max(5, Math.floor(measurement.answer * 0.3)))
    );
  }
}