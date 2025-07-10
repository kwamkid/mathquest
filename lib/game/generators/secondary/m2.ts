// lib/game/generators/secondary/m2.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  getRandomName,
  randomChoice,
  generateDivisibleNumbers,
  randomFloat
} from '../utils';

export class M2Generator extends BaseGenerator {
  constructor() {
    super('M2');
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
      () => this.generateLinearSystemProblem(level, config),
      () => this.generateFunctionProblem(level, config),
      () => this.generateProbabilityProblem(level, config),
      () => this.generateStatisticsProblem(level, config),
      () => this.generateRealWorldMathProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.MIXED]; // สมการเชิงเส้น 2 ตัวแปร
    } else if (level <= 50) {
      return [QuestionType.MIXED]; // ฟังก์ชันเชิงเส้น
    } else if (level <= 75) {
      return [QuestionType.MIXED]; // ความน่าจะเป็นเบื้องต้น
    } else {
      return [QuestionType.MIXED, QuestionType.WORD_PROBLEM]; // สถิติเบื้องต้น
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: สมการเชิงเส้น 2 ตัวแปร
      return this.generateLinearSystemEquations(level, config);
    } else if (level <= 50) {
      // Level 26-50: ฟังก์ชันเชิงเส้น
      return this.generateLinearFunctions(level, config);
    } else if (level <= 75) {
      // Level 51-75: ความน่าจะเป็นเบื้องต้น
      return this.generateProbability(level, config);
    } else {
      // Level 76+: สถิติเบื้องต้น
      return this.generateStatistics(level, config);
    }
  }

  private generateLinearSystemEquations(level: number, config: LevelConfig): Question {
    const systemTypes = [
      {
        generate: () => {
          // Simple substitution: x + y = sum, x - y = diff
          const x = random(3, 15);
          const y = random(2, 12);
          const sum = x + y;
          const diff = x - y;
          return {
            question: `x + y = ${sum}, x - y = ${diff}, x = ?`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          // 2x + y = result1, x + y = result2
          const x = random(2, 10);
          const y = random(1, 8);
          const result1 = 2 * x + y;
          const result2 = x + y;
          return {
            question: `2x + y = ${result1}, x + y = ${result2}, y = ?`,
            answer: y
          };
        }
      },
      {
        generate: () => {
          // ax + by = c, find one variable
          const x = random(2, 8);
          const y = random(1, 6);
          const a = random(2, 5);
          const b = random(1, 4);
          const c = a * x + b * y;
          return {
            question: `${a}x + ${b}y = ${c}, ถ้า y = ${y} แล้ว x = ?`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          // Elimination method simple case
          const x = random(1, 8);
          const y = random(2, 10);
          const eq1 = 2 * x + 3 * y;
          const eq2 = x + 2 * y;
          return {
            question: `2x + 3y = ${eq1}, x + 2y = ${eq2}, x = ?`,
            answer: x
          };
        }
      }
    ];
    
    const systemType = randomChoice(systemTypes).generate();
    
    return this.createQuestion(
      systemType.question,
      systemType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(systemType.answer, 4, Math.max(3, Math.floor(systemType.answer * 0.5)))
    );
  }

  private generateLinearFunctions(level: number, config: LevelConfig): Question {
    const functionTypes = [
      {
        generate: () => {
          const m = random(2, 8); // slope
          const b = random(-10, 15); // y-intercept
          const x = random(-5, 10);
          const y = m * x + b;
          return {
            question: `ฟังก์ชัน f(x) = ${m}x + ${b}, f(${x}) = ?`,
            answer: y
          };
        }
      },
      {
        generate: () => {
          const m = random(1, 6);
          const b = random(-8, 12);
          const y = random(5, 30);
          const x = Math.floor((y - b) / m);
          const actualY = m * x + b;
          return {
            question: `ฟังก์ชัน y = ${m}x + ${b}, ถ้า y = ${actualY} แล้ว x = ?`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          const x1 = random(1, 5);
          const y1 = random(3, 15);
          const x2 = random(6, 10);
          const y2 = random(16, 30);
          const slope = Math.floor((y2 - y1) / (x2 - x1));
          return {
            question: `เส้นตรงผ่านจุด (${x1}, ${y1}) และ (${x2}, ${y2}) ความชันเท่าไร?`,
            answer: slope
          };
        }
      },
      {
        generate: () => {
          const m = random(2, 6);
          const point_x = random(1, 8);
          const point_y = random(5, 20);
          const b = point_y - m * point_x;
          return {
            question: `เส้นตรงความชัน ${m} ผ่านจุด (${point_x}, ${point_y}) จุดตัด y เท่าไร?`,
            answer: b
          };
        }
      }
    ];
    
    const functionType = randomChoice(functionTypes).generate();
    
    return this.createQuestion(
      functionType.question,
      functionType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(functionType.answer, 4, Math.max(5, Math.abs(functionType.answer)))
    );
  }

  private generateProbability(level: number, config: LevelConfig): Question {
    const probabilityTypes = [
      {
        generate: () => {
          const total = random(20, 50);
          const favorable = random(5, total - 5);
          const percentage = Math.round((favorable / total) * 100);
          return {
            question: `ถุงใส่ลูกบอล ${total} ลูก สีแดง ${favorable} ลูก สุ่มหยิบ 1 ลูก ความน่าจะเป็นได้สีแดงกี่เปอร์เซ็นต์?`,
            answer: percentage
          };
        }
      },
      {
        generate: () => {
          const sides = 6; // dice
          const favorableOutcomes = random(1, 3); // 1, 2, or 3 outcomes
          const probability = Math.round((favorableOutcomes / sides) * 100);
          return {
            question: `ทอยลูกเต๋า 1 ครั้ง ความน่าจะเป็นได้หน้า ${favorableOutcomes <= 1 ? '1' : '1 หรือ 2' + (favorableOutcomes === 3 ? ' หรือ 3' : '')} กี่เปอร์เซ็นต์?`,
            answer: probability
          };
        }
      },
      {
        generate: () => {
          const redCards = random(5, 15);
          const blackCards = random(5, 15);
          const total = redCards + blackCards;
          const probability = Math.round((redCards / total) * 100);
          return {
            question: `ไพ่ ${total} ใบ แดง ${redCards} ใบ ดำ ${blackCards} ใบ จั่วไพ่ 1 ใบ ความน่าจะเป็นได้ไพ่แดงกี่%?`,
            answer: probability
          };
        }
      },
      {
        generate: () => {
          // Complementary probability
          const total = random(25, 60);
          const unfavorable = random(8, total - 8);
          const favorable = total - unfavorable;
          const probability = Math.round((favorable / total) * 100);
          return {
            question: `กล่อง ${total} ลูกบอล เสีย ${unfavorable} ลูก สุ่มหยิบ 1 ลูก ความน่าจะเป็นได้ลูกดีกี่%?`,
            answer: probability
          };
        }
      }
    ];
    
    const probType = randomChoice(probabilityTypes).generate();
    
    return this.createQuestion(
      probType.question,
      probType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(probType.answer, 4, 15)
    );
  }

  private generateStatistics(level: number, config: LevelConfig): Question {
    const statisticsTypes = [
      {
        generate: () => {
          const scores = [];
          for (let i = 0; i < 5; i++) {
            scores.push(random(60, 95));
          }
          const mean = Math.round(scores.reduce((a, b) => a + b) / scores.length);
          return {
            question: `คะแนนสอบ: ${scores.join(', ')} คะแนนเฉลี่ยเท่าไร?`,
            answer: mean
          };
        }
      },
      {
        generate: () => {
          const data = [];
          for (let i = 0; i < 7; i++) {
            data.push(random(10, 40));
          }
          data.sort((a, b) => a - b);
          const median = data[3]; // middle value (index 3 for 7 items)
          return {
            question: `ข้อมูล: ${data.join(', ')} ค่ามัธยฐาน (Median) เท่าไร?`,
            answer: median
          };
        }
      },
      {
        generate: () => {
          const values = [random(15, 25), random(15, 25), random(30, 40)];
          const frequencies = [random(3, 8), random(2, 6), random(4, 10)];
          const totalFreq = frequencies.reduce((a, b) => a + b);
          const weightedSum = values.reduce((sum, val, i) => sum + val * frequencies[i], 0);
          const weightedMean = Math.round(weightedSum / totalFreq);
          return {
            question: `ค่า ${values[0]} ปรากฏ ${frequencies[0]} ครั้ง, ${values[1]} ปรากฏ ${frequencies[1]} ครั้ง, ${values[2]} ปรากฏ ${frequencies[2]} ครั้ง ค่าเฉลี่ยถ่วงน้ำหนักเท่าไร?`,
            answer: weightedMean
          };
        }
      },
      {
        generate: () => {
          // Range calculation
          const data = [];
          for (let i = 0; i < 6; i++) {
            data.push(random(20, 80));
          }
          const max = Math.max(...data);
          const min = Math.min(...data);
          const range = max - min;
          return {
            question: `ข้อมูล: ${data.join(', ')} พิสัย (Range) เท่าไร?`,
            answer: range
          };
        }
      }
    ];
    
    const statType = randomChoice(statisticsTypes).generate();
    
    return this.createQuestion(
      statType.question,
      statType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(statType.answer, 4, Math.max(5, Math.floor(statType.answer * 0.3)))
    );
  }

  private generateLinearSystemProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const apples = random(3, 12);
          const oranges = random(2, 10);
          const totalFruits = apples + oranges;
          const totalCost = apples * random(8, 15) + oranges * random(5, 12);
          return {
            question: `ซื้อแอปเปิ้ล ${apples} ลูก ส้ม ${oranges} ลูก รวม ${totalFruits} ลูก จ่าย ${totalCost} บาท แอปเปิ้ลกี่ลูก?`,
            answer: apples
          };
        }
      },
      {
        generate: () => {
          const x = random(15, 35);
          const y = random(10, 25);
          const total = x + y;
          const diff = x - y;
          return {
            question: `จำนวน 2 จำนวน ผลรวม ${total} ผลต่าง ${diff} จำนวนมากกว่าคือ?`,
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

  private generateFunctionProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const fixedCost = random(50, 200);
          const variableCost = random(5, 20);
          const units = random(10, 30);
          const totalCost = fixedCost + variableCost * units;
          return {
            question: `ค่าคงที่ ${fixedCost} บาท ค่าแปรผัน ${variableCost} บาท/หน่วย ผลิต ${units} หน่วย ต้นทุนรวม?`,
            answer: totalCost
          };
        }
      },
      {
        generate: () => {
          const initialValue = random(1000, 5000);
          const rate = random(50, 200);
          const time = random(3, 12);
          const finalValue = initialValue + rate * time;
          return {
            question: `เงินฝากเริ่มต้น ${initialValue} บาท เพิ่มขึ้นเดือนละ ${rate} บาท หลัง ${time} เดือนมีเงินเท่าไร?`,
            answer: finalValue
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
      generateChoices(scenario.answer, 4, Math.max(100, Math.floor(scenario.answer * 0.1)))
    );
  }

  private generateProbabilityProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const totalStudents = random(30, 60);
          const passedStudents = random(Math.floor(totalStudents * 0.6), Math.floor(totalStudents * 0.9));
          const probability = Math.round((passedStudents / totalStudents) * 100);
          return {
            question: `นักเรียน ${totalStudents} คน สอบผ่าน ${passedStudents} คน สุ่มเลือก 1 คน ความน่าจะเป็นสอบผ่านกี่%?`,
            answer: probability
          };
        }
      },
      {
        generate: () => {
          const defectiveItems = random(2, 8);
          const goodItems = random(15, 40);
          const total = defectiveItems + goodItems;
          const probability = Math.round((goodItems / total) * 100);
          return {
            question: `โรงงานผลิตของ ${total} ชิ้น เสีย ${defectiveItems} ชิ้น สุ่มเลือก 1 ชิ้น ความน่าจะเป็นได้ของดีกี่%?`,
            answer: probability
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
      generateChoices(scenario.answer, 4, 15)
    );
  }

  private generateStatisticsProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const monthlyData = [];
          for (let i = 0; i < 6; i++) {
            monthlyData.push(random(80, 150));
          }
          const average = Math.round(monthlyData.reduce((a, b) => a + b) / monthlyData.length);
          return {
            question: `ยอดขาย 6 เดือน (หน่วย: พัน): ${monthlyData.join(', ')} ยอดขายเฉลี่ยต่อเดือนกี่พันบาท?`,
            answer: average
          };
        }
      },
      {
        generate: () => {
          const testScores = [];
          for (let i = 0; i < 8; i++) {
            testScores.push(random(65, 95));
          }
          testScores.sort((a, b) => a - b);
          const q1Index = Math.floor(testScores.length / 4);
          const q3Index = Math.floor(3 * testScores.length / 4);
          const iqr = testScores[q3Index] - testScores[q1Index];
          return {
            question: `คะแนนสอบ: ${testScores.join(', ')} พิสัยควอร์ไทล์ (IQR) เท่าไร?`,
            answer: iqr
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
      generateChoices(scenario.answer, 4, Math.max(8, Math.floor(scenario.answer * 0.3)))
    );
  }

  private generateRealWorldMathProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const speed1 = random(60, 90);
          const speed2 = random(40, 70);
          const time = random(2, 5);
          const distance1 = speed1 * time;
          const distance2 = speed2 * time;
          const totalDistance = distance1 + distance2;
          return {
            question: `รถ 2 คัน วิ่งจากจุดเดียวกัน ทิศตรงข้าม ความเร็ว ${speed1} และ ${speed2} กม./ชม. หลัง ${time} ชม. ห่างกันกี่กม.?`,
            answer: totalDistance
          };
        }
      },
      {
        generate: () => {
          const principal = random(10000, 50000);
          const rate = random(3, 8);
          const time = random(2, 5);
          const interest = Math.floor(principal * rate * time / 100);
          return {
            question: `เงินต้น ${principal} บาท ดอกเบี้ย ${rate}% ต่อปี ${time} ปี ได้ดอกเบี้ยเท่าไร?`,
            answer: interest
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
      generateChoices(scenario.answer, 4, Math.max(500, Math.floor(scenario.answer * 0.15)))
    );
  }
}