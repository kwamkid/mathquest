// lib/game/generators/secondary/m1.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  getRandomName,
  randomChoice,
  generateDivisibleNumbers,
  simplifyFraction
} from '../utils';

export class M1Generator extends BaseGenerator {
  constructor() {
    super('M1');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    const questionType = randomChoice(this.getAvailableQuestionTypes(level));
    
    switch (questionType) {
      case QuestionType.MIXED:
        return this.generateMixed(level, config);
      case QuestionType.WORD_PROBLEM:
        return this.generateWordProblem(level, config);
      default:
        return this.generateMixed(level, config);
    }
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    const problemTypes = [
      () => this.generateAlgebraWordProblem(level, config),
      () => this.generateRatioWordProblem(level, config),
      () => this.generateIntegerWordProblem(level, config),
      () => this.generateLinearEquationProblem(level, config),
      () => this.generatePercentWordProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 20) {
      return [QuestionType.MIXED]; // จำนวนเต็มบวกและลบ
    } else if (level <= 40) {
      return [QuestionType.MIXED]; // เลขยกกำลัง
    } else if (level <= 60) {
      return [QuestionType.MIXED]; // สมการเชิงเส้นตัวแปรเดียว
    } else if (level <= 80) {
      return [QuestionType.MIXED]; // อัตราส่วนและสัดส่วน
    } else {
      return [QuestionType.MIXED, QuestionType.WORD_PROBLEM]; // โจทย์ปัญหาพีชคณิต
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 20) {
      // Level 1-20: จำนวนเต็มบวกและลบ
      return this.generateIntegerOperations(level, config);
    } else if (level <= 40) {
      // Level 21-40: เลขยกกำลัง
      return this.generateExponents(level, config);
    } else if (level <= 60) {
      // Level 41-60: สมการเชิงเส้นตัวแปรเดียว
      return this.generateLinearEquations(level, config);
    } else if (level <= 80) {
      // Level 61-80: อัตราส่วนและสัดส่วน
      return this.generateRatioProportions(level, config);
    } else {
      // Level 81+: โจทย์ผสม
      const types = [
        () => this.generateIntegerOperations(level, config),
        () => this.generateExponents(level, config),
        () => this.generateLinearEquations(level, config),
        () => this.generateRatioProportions(level, config),
        () => this.generateAdvancedAlgebra(level, config)
      ];
      return randomChoice(types)();
    }
  }

  private generateIntegerOperations(level: number, config: LevelConfig): Question {
    const operations = [
      {
        generate: () => {
          const a = random(-50, 50);
          const b = random(-30, 30);
          const answer = a + b;
          return {
            question: `${a} + (${b}) = ?`,
            answer
          };
        }
      },
      {
        generate: () => {
          const a = random(-40, 60);
          const b = random(-50, 40);
          const answer = a - b;
          return {
            question: `${a} - (${b}) = ?`,
            answer
          };
        }
      },
      {
        generate: () => {
          const a = random(-12, 12);
          let b = random(-8, 8);
          if (b === 0) b = random(1, 8);
          const answer = a * b;
          return {
            question: `${a} × (${b}) = ?`,
            answer
          };
        }
      },
      {
        generate: () => {
          let b = randomChoice([-5, -4, -3, -2, 2, 3, 4, 5]);
          const quotient = random(-8, 8);
          const a = b * quotient;
          return {
            question: `${a} ÷ (${b}) = ?`,
            answer: quotient
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
      generateChoices(op.answer, 4, Math.max(5, Math.abs(op.answer)))
    );
  }

  private generateExponents(level: number, config: LevelConfig): Question {
    const exponentTypes = [
      {
        generate: () => {
          const base = random(2, 8);
          const exponent = random(2, 5);
          const answer = Math.pow(base, exponent);
          return {
            question: `${base}^${exponent} = ?`,
            answer
          };
        }
      },
      {
        generate: () => {
          const base = random(2, 6);
          const answer = random(2, 4);
          const result = Math.pow(base, answer);
          return {
            question: `${base}^? = ${result}`,
            answer
          };
        }
      },
      {
        generate: () => {
          const exponent = random(2, 4);
          const answer = random(2, 8);
          const result = Math.pow(answer, exponent);
          return {
            question: `?^${exponent} = ${result}`,
            answer
          };
        }
      },
      {
        generate: () => {
          const base = random(3, 7);
          const exp1 = random(2, 4);
          const exp2 = random(1, 3);
          const answer = exp1 + exp2;
          return {
            question: `${base}^${exp1} × ${base}^${exp2} = ${base}^?`,
            answer
          };
        }
      }
    ];
    
    const expType = randomChoice(exponentTypes).generate();
    
    return this.createQuestion(
      expType.question,
      expType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(expType.answer, 4, Math.max(3, Math.floor(expType.answer * 0.5)))
    );
  }

  private generateLinearEquations(level: number, config: LevelConfig): Question {
    const equationTypes = [
      {
        generate: () => {
          const a = random(2, 10);
          const b = random(5, 30);
          const x = random(1, 15);
          const result = a * x + b;
          return {
            question: `${a}x + ${b} = ${result}, x = ?`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          const a = random(3, 12);
          const b = random(8, 40);
          const x = random(2, 12);
          const result = a * x - b;
          return {
            question: `${a}x - ${b} = ${result}, x = ?`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          const a = random(2, 8);
          const b = random(3, 15);
          const c = random(10, 50);
          const x = Math.floor((c - b) / a);
          const actualResult = a * x + b;
          return {
            question: `${a}x + ${b} = ${actualResult}, x = ?`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          const x = random(3, 15);
          const leftSide = random(2, 6) * x;
          const rightSide = random(1, 4) * x + random(5, 20);
          const constant = rightSide - leftSide;
          const coefficient = leftSide / x - rightSide / x;
          
          if (coefficient !== 0) {
            return {
              question: `${leftSide / x}x + ${constant} = ${rightSide / x}x, x = ?`,
              answer: Math.round(-constant / coefficient)
            };
          } else {
            // Fallback
            return {
              question: `2x + 6 = 16, x = ?`,
              answer: 5
            };
          }
        }
      }
    ];
    
    const eqType = randomChoice(equationTypes).generate();
    
    return this.createQuestion(
      eqType.question,
      eqType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(eqType.answer, 4, Math.max(3, Math.floor(eqType.answer * 0.4)))
    );
  }

  private generateRatioProportions(level: number, config: LevelConfig): Question {
    const ratioTypes = [
      {
        generate: () => {
          const ratio1 = random(2, 6);
          const ratio2 = random(3, 8);
          const multiplier = random(3, 10);
          const total = (ratio1 + ratio2) * multiplier;
          const part1 = ratio1 * multiplier;
          return {
            question: `แบ่ง ${total} ตามอัตราส่วน ${ratio1}:${ratio2} ส่วนแรกได้กี่หน่วย?`,
            answer: part1
          };
        }
      },
      {
        generate: () => {
          const a = random(2, 8);
          const b = random(3, 10);
          const c = random(4, 12);
          const d = Math.floor((b * c) / a);
          return {
            question: `${a}:${b} = ${c}:? `,
            answer: d
          };
        }
      },
      {
        generate: () => {
          const ratio = randomChoice([2, 3, 4, 5]);
          const smaller = random(6, 20);
          const larger = smaller * ratio;
          const total = smaller + larger;
          return {
            question: `จำนวน 2 จำนวน อัตราส่วน 1:${ratio} ผลรวม ${total} จำนวนน้อยกว่าคือ?`,
            answer: smaller
          };
        }
      }
    ];
    
    const ratioType = randomChoice(ratioTypes).generate();
    
    return this.createQuestion(
      ratioType.question,
      ratioType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(ratioType.answer, 4, Math.max(5, Math.floor(ratioType.answer * 0.3)))
    );
  }

  private generateAdvancedAlgebra(level: number, config: LevelConfig): Question {
    const advancedTypes = [
      {
        generate: () => {
          const a = random(2, 6);
          const b = random(1, 4);
          const c = random(3, 8);
          const x = random(2, 8);
          const result = a * (b * x + c);
          return {
            question: `${a}(${b}x + ${c}) = ${result}, x = ?`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          const x = random(3, 12);
          const constant = random(5, 20);
          const result = x * x + constant;
          return {
            question: `x² + ${constant} = ${result}, x = ? (ตอบค่าบวก)`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          const a = random(2, 5);
          const b = random(3, 7);
          const x = random(4, 10);
          const leftResult = a * x;
          const rightResult = b * x - (b - a) * x;
          return {
            question: `${a}x = ${b}x - ${(b - a) * x}, x = ?`,
            answer: x
          };
        }
      }
    ];
    
    const advType = randomChoice(advancedTypes).generate();
    
    return this.createQuestion(
      advType.question,
      advType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(advType.answer, 4, Math.max(3, Math.floor(advType.answer * 0.4)))
    );
  }

  private generateAlgebraWordProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const currentAge = random(8, 15);
          const yearsLater = random(5, 12);
          const futureAge = currentAge + yearsLater;
          return {
            question: `ปัจจุบัน${getRandomName()}อายุ ${currentAge} ปี อีก ${yearsLater} ปี จะอายุกี่ปี?`,
            answer: futureAge
          };
        }
      },
      {
        generate: () => {
          const totalCost = random(150, 500);
          const itemCount = random(3, 8);
          const pricePerItem = Math.floor(totalCost / itemCount);
          const actualTotal = pricePerItem * itemCount;
          return {
            question: `ซื้อของ ${itemCount} ชิ้น รวม ${actualTotal} บาท ชิ้นละกี่บาท?`,
            answer: pricePerItem
          };
        }
      },
      {
        generate: () => {
          const x = random(5, 20);
          const multiplier = random(2, 5);
          const addition = random(8, 25);
          const result = multiplier * x + addition;
          return {
            question: `จำนวนหนึ่ง คูณด้วย ${multiplier} แล้วบวก ${addition} ได้ ${result} จำนวนนั้นคือ?`,
            answer: x
          };
        }
      }
    ];
    
    const scenario = randomChoice(scenarios).generate();
    
    return this.createQuestion(
      scenario.question,
      scenario.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(scenario.answer, 4, Math.max(5, Math.floor(scenario.answer * 0.3)))
    );
  }

  private generateRatioWordProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const boys = random(15, 30);
          const girls = random(12, 25);
          const total = boys + girls;
          return {
            question: `ห้องเรียนมีเด็กชาย ${boys} คน เด็กหญิง ${girls} คน อัตราส่วนเด็กชาย:เด็กหญิง เท่าไร? (ตอบเป็นจำนวนเต็มที่ลดรูปแล้ว เช่น 2:3 → ตอบ 23)`,
            answer: this.simplifyRatioToNumber(boys, girls)
          };
        }
      },
      {
        generate: () => {
          const redMarbles = random(6, 18);
          const blueMarbles = random(4, 15);
          const total = redMarbles + blueMarbles;
          return {
            question: `กล่องมีลูกบอลแดง ${redMarbles} ลูก น้ำเงิน ${blueMarbles} ลูก รวม ${total} ลูก อัตราส่วนลูกบอลแดง:ทั้งหมด เท่าไร? (ลดรูปแล้ว ตอบรวมกัน เช่น 2:5 → ตอบ 25)`,
            answer: this.simplifyRatioToNumber(redMarbles, total)
          };
        }
      }
    ];
    
    const scenario = randomChoice(scenarios).generate();
    
    return this.createQuestion(
      scenario.question,
      scenario.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(scenario.answer, 4, Math.max(10, Math.floor(scenario.answer * 0.2)))
    );
  }

  private generateIntegerWordProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const floor = random(5, 15);
          const down = random(2, floor - 1);
          const finalFloor = floor - down;
          return {
            question: `ลิฟต์อยู่ชั้น ${floor} ลงมา ${down} ชั้น อยู่ชั้นเท่าไร?`,
            answer: finalFloor
          };
        }
      },
      {
        generate: () => {
          const temperature = random(-5, 5);
          const increase = random(8, 20);
          const finalTemp = temperature + increase;
          return {
            question: `อุณหภูมิตอนเช้า ${temperature}°C เพิ่มขึ้น ${increase}°C อุณหภูมิตอนบ่ายกี่องศา?`,
            answer: finalTemp
          };
        }
      },
      {
        generate: () => {
          const profit = random(500, 2000);
          const loss = random(200, profit - 100);
          const netProfit = profit - loss;
          return {
            question: `ร้านค้ากำไร ${profit} บาท ขาดทุน ${loss} บาท กำไรสุทธิเท่าไร?`,
            answer: netProfit
          };
        }
      }
    ];
    
    const scenario = randomChoice(scenarios).generate();
    
    return this.createQuestion(
      scenario.question,
      scenario.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(scenario.answer, 4, Math.max(8, Math.abs(scenario.answer)))
    );
  }

  private generateLinearEquationProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const length = random(20, 50);
          const width = random(10, 30);
          const perimeter = 2 * (length + width);
          return {
            question: `สี่เหลี่ยมผืนผ้า ยาว ${length} ม. กว้าง ${width} ม. เส้นรอบรูปกี่เมตร?`,
            answer: perimeter
          };
        }
      },
      {
        generate: () => {
          const x = random(8, 25);
          const coefficient = random(3, 7);
          const constant = random(10, 40);
          const total = coefficient * x + constant;
          return {
            question: `ซื้อปากกา ${coefficient} แท่ง และยางลบ ${constant} บาท รวม ${total} บาท ปากกาแท่งละกี่บาท?`,
            answer: x
          };
        }
      }
    ];
    
    const scenario = randomChoice(scenarios).generate();
    
    return this.createQuestion(
      scenario.question,
      scenario.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(scenario.answer, 4, Math.max(5, Math.floor(scenario.answer * 0.3)))
    );
  }

  private generatePercentWordProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const originalPrice = random(200, 1000);
          const discountPercent = randomChoice([10, 15, 20, 25]);
          const discountAmount = Math.floor(originalPrice * discountPercent / 100);
          const finalPrice = originalPrice - discountAmount;
          return {
            question: `เสื้อราคา ${originalPrice} บาท ลดราคา ${discountPercent}% ราคาขายเท่าไร?`,
            answer: finalPrice
          };
        }
      },
      {
        generate: () => {
          const totalStudents = generateDivisibleNumbers(4, 40, 200);
          const percentage = randomChoice([25, 40, 60, 75]);
          const count = (totalStudents * percentage) / 100;
          return {
            question: `นักเรียน ${totalStudents} คน ${percentage}% เล่นกีฬา มีกี่คนเล่นกีฬา?`,
            answer: count
          };
        }
      }
    ];
    
    const scenario = randomChoice(scenarios).generate();
    
    return this.createQuestion(
      scenario.question,
      scenario.answer,
      QuestionType.WORD_PROBLEM,
      level,
      generateChoices(scenario.answer, 4, Math.max(10, Math.floor(scenario.answer * 0.2)))
    );
  }

  private simplifyRatioToNumber(a: number, b: number): number {
    const gcd = this.gcd(a, b);
    const simplifiedA = a / gcd;
    const simplifiedB = b / gcd;
    
    // Combine into single number (e.g., 2:3 becomes 23)
    return parseInt(`${simplifiedA}${simplifiedB}`);
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}