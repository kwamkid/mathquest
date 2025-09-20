// lib/game/generators/secondary/m2.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices,
  randomChoice
} from '../utils';

export class M2Generator extends BaseGenerator {
  constructor() {
    super('M2');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // M2 ใช้แค่ MIXED (ตัวเลขล้วน) ไม่มีโจทย์ปัญหา
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // M2 ไม่มีโจทย์ปัญหา ให้ส่ง MIXED แทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    // M2 มีแค่ MIXED (ตัวเลขล้วน)
    return [QuestionType.MIXED];
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 15) {
      // Level 1-15: เลขยกกำลังที่มีเลขชี้กำลังเป็นจำนวนเต็ม (รวมลบ)
      return this.generateIntegerExponents(level, config);
    } else if (level <= 30) {
      // Level 16-30: พหุนาม (บวก ลบ คูณ)
      return this.generatePolynomials(level, config);
    } else if (level <= 45) {
      // Level 31-45: การแยกตัวประกอบพหุนาม
      return this.generateFactoring(level, config);
    } else if (level <= 60) {
      // Level 46-60: สมการเชิงเส้นสองตัวแปร
      return this.generateLinearTwoVariables(level, config);
    } else if (level <= 75) {
      // Level 61-75: ฟังก์ชันเชิงเส้น
      return this.generateLinearFunctions(level, config);
    } else if (level <= 85) {
      // Level 76-85: ทฤษฎีบทพีทาโกรัส
      return this.generatePythagorean(level, config);
    } else if (level <= 95) {
      // Level 86-95: ความน่าจะเป็นเบื้องต้น
      return this.generateProbability(level, config);
    } else {
      // Level 96-100: โจทย์ผสม
      return this.generateMixedProblems(level, config);
    }
  }

  // Level 1-15: เลขยกกำลังที่มีเลขชี้กำลังเป็นจำนวนเต็ม
  private generateIntegerExponents(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const base = random(2, 8);
        const exp = random(-3, -1);
        // คำตอบเป็นเศษส่วน เช่น 2^-2 = 1/4
        const denominator = Math.pow(base, -exp);
        return {
          question: `${base}^${exp} = 1/?`,
          answer: denominator
        };
      },
      () => {
        const base = random(2, 6);
        const exp1 = random(-2, 3);
        const exp2 = random(-2, 3);
        const answer = exp1 + exp2;
        return {
          question: `${base}^${exp1} × ${base}^${exp2} = ${base}^?`,
          answer: answer
        };
      },
      () => {
        const base = random(2, 5);
        const exp1 = random(2, 5);
        const exp2 = random(-3, 2);
        const answer = exp1 - exp2;
        return {
          question: `${base}^${exp1} ÷ ${base}^${exp2} = ${base}^?`,
          answer: answer
        };
      },
      () => {
        // (a^m)^n = a^(mn)
        const base = random(2, 5);
        const exp1 = random(-2, 3);
        const exp2 = random(2, 3);
        const answer = exp1 * exp2;
        return {
          question: `(${base}^${exp1})^${exp2} = ${base}^?`,
          answer: answer
        };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(5, Math.abs(type.answer)))
    );
  }

  // Level 16-30: พหุนาม
  private generatePolynomials(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // บวกพหุนาม เช่น (3x + 2) + (2x + 5) = ?x + ?
        const a1 = random(1, 5);
        const b1 = random(1, 10);
        const a2 = random(1, 5);
        const b2 = random(1, 10);
        const answerA = a1 + a2;
        const answerB = b1 + b2;
        return {
          question: `(${a1}x + ${b1}) + (${a2}x + ${b2}) = ?x + ${answerB}`,
          answer: answerA
        };
      },
      () => {
        // ลบพหุนาม
        const a1 = random(3, 8);
        const b1 = random(5, 15);
        const a2 = random(1, 4);
        const b2 = random(1, 8);
        const answerA = a1 - a2;
        const answerB = b1 - b2;
        return {
          question: `(${a1}x + ${b1}) - (${a2}x + ${b2}) = ?x + ${answerB}`,
          answer: answerA
        };
      },
      () => {
        // คูณพหุนามด้วยค่าคงที่
        const mult = random(2, 5);
        const a = random(1, 6);
        const b = random(1, 10);
        const answerA = mult * a;
        const answerB = mult * b;
        return {
          question: `${mult}(${a}x + ${b}) = ?x + ${answerB}`,
          answer: answerA
        };
      },
      () => {
        // พหุนามกำลัง 2
        const a = random(1, 4);
        const b = random(1, 4);
        const c = random(1, 8);
        const d = random(1, 8);
        const answer = a + b;
        return {
          question: `${a}x² + ${c}x + ${b}x² + ${d}x = ?x² + ${c+d}x`,
          answer: answer
        };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, Math.abs(type.answer)))
    );
  }

  // Level 31-45: การแยกตัวประกอบพหุนาม
  private generateFactoring(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // ดึงตัวประกอบร่วม
        const common = random(2, 6);
        const a = random(2, 8);
        const b = random(3, 10);
        return {
          question: `${common * a}x + ${common * b} = ?(${a}x + ${b})`,
          answer: common
        };
      },
      () => {
        // x² - a² = (x + a)(x - ?)
        const a = random(2, 10);
        return {
          question: `x² - ${a*a} = (x + ${a})(x - ?)`,
          answer: a
        };
      },
      () => {
        // แยกตัวประกอบ x² + bx + c
        const p = random(2, 8);
        const q = random(1, 7);
        const b = p + q;
        const c = p * q;
        return {
          question: `x² + ${b}x + ${c} = (x + ${p})(x + ?)`,
          answer: q
        };
      },
      () => {
        // กำลังสองสมบูรณ์
        const a = random(2, 6);
        const b = 2 * a;
        const c = a * a;
        return {
          question: `x² + ${b}x + ${c} = (x + ?)²`,
          answer: a
        };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, type.answer))
    );
  }

  // Level 46-60: สมการเชิงเส้นสองตัวแปร
  private generateLinearTwoVariables(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // แทนค่า x หา y
        const x = random(1, 10);
        const y = random(1, 10);
        const a = random(2, 5);
        const b = random(1, 4);
        const c = a * x + b * y;
        return {
          question: `${a}x + ${b}y = ${c}, ถ้า x = ${x} แล้ว y = ?`,
          answer: y
        };
      },
      () => {
        // แทนค่า y หา x
        const x = random(1, 10);
        const y = random(1, 10);
        const a = random(1, 5);
        const b = random(2, 6);
        const c = a * x + b * y;
        return {
          question: `${a}x + ${b}y = ${c}, ถ้า y = ${y} แล้ว x = ?`,
          answer: x
        };
      },
      () => {
        // ระบบสมการง่าย (บวก)
        const x = random(2, 8);
        const y = random(1, 7);
        const sum = x + y;
        const diff = x - y;
        return {
          question: `x + y = ${sum}, x - y = ${diff}, x = ?`,
          answer: x
        };
      },
      () => {
        // หาค่า x หรือ y จากระบบสมการ
        const x = random(1, 6);
        const y = random(1, 5);
        const eq1 = 2 * x + y;
        const eq2 = x + y;
        return {
          question: `2x + y = ${eq1}, x + y = ${eq2}, y = ?`,
          answer: y
        };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, type.answer))
    );
  }

  // Level 61-75: ฟังก์ชันเชิงเส้น
  private generateLinearFunctions(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // f(x) = ax + b, หา f(x)
        const a = random(2, 8);
        const b = random(-10, 15);
        const x = random(-5, 10);
        const answer = a * x + b;
        return {
          question: `f(x) = ${a}x + ${b}, f(${x}) = ?`,
          answer: answer
        };
      },
      () => {
        // หา x จาก f(x)
        const a = random(2, 6);
        const b = random(-8, 12);
        const y = random(10, 50);
        const x = Math.floor((y - b) / a);
        const actualY = a * x + b;
        return {
          question: `f(x) = ${a}x + ${b}, ถ้า f(x) = ${actualY} แล้ว x = ?`,
          answer: x
        };
      },
      () => {
        // หาความชัน
        const x1 = random(0, 5);
        const y1 = random(0, 10);
        const x2 = random(6, 10);
        const y2 = random(12, 25);
        const slope = Math.floor((y2 - y1) / (x2 - x1));
        return {
          question: `ผ่านจุด (${x1}, ${y1}) และ (${x2}, ${y2}) ความชัน = ?`,
          answer: slope
        };
      },
      () => {
        // หาจุดตัดแกน y
        const m = random(2, 6);
        const x0 = random(1, 5);
        const y0 = random(5, 20);
        const b = y0 - m * x0;
        return {
          question: `ความชัน ${m} ผ่านจุด (${x0}, ${y0}) จุดตัดแกน y = ?`,
          answer: b
        };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(5, Math.abs(type.answer)))
    );
  }

  // Level 76-85: ทฤษฎีบทพีทาโกรัส
  private generatePythagorean(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // หาด้านตรงข้ามมุมฉาก (3-4-5)
        const a = 3;
        const b = 4;
        const c = 5;
        return {
          question: `สามเหลี่ยมมุมฉาก ด้าน ${a} และ ${b} ด้านตรงข้ามมุมฉาก = ?`,
          answer: c
        };
      },
      () => {
        // หาด้านตรงข้ามมุมฉาก (5-12-13)
        const a = 5;
        const b = 12;
        const c = 13;
        return {
          question: `สามเหลี่ยมมุมฉาก ด้าน ${a} และ ${b} ด้านตรงข้ามมุมฉาก = ?`,
          answer: c
        };
      },
      () => {
        // หาด้านตรงข้ามมุมฉาก (8-15-17)
        const a = 8;
        const b = 15;
        const c = 17;
        return {
          question: `สามเหลี่ยมมุมฉาก ด้าน ${a} และ ${b} ด้านตรงข้ามมุมฉาก = ?`,
          answer: c
        };
      },
      () => {
        // หาด้านประกอบมุมฉาก
        const c = 10;
        const a = 6;
        const b = 8;
        return {
          question: `สามเหลี่ยมมุมฉาก ด้านตรงข้ามมุมฉาก ${c} ด้านหนึ่ง ${a} อีกด้าน = ?`,
          answer: b
        };
      },
      () => {
        // a² + b² = c²
        const a = random(3, 12);
        const answer = a * a;
        return {
          question: `${a}² = ?`,
          answer: answer
        };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, Math.floor(type.answer * 0.2)))
    );
  }

  // Level 86-95: ความน่าจะเป็นเบื้องต้น
  private generateProbability(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // ความน่าจะเป็นของลูกเต๋า
        const favorable = random(1, 3);
        const total = 6;
        const percentage = Math.round((favorable / total) * 100);
        const text = favorable === 1 ? 'หน้า 6' : 
                    favorable === 2 ? 'หน้าคู่' : 'หน้า 1,2,3';
        return {
          question: `ทอยลูกเต๋า ความน่าจะเป็นได้${text} = ?%`,
          answer: percentage
        };
      },
      () => {
        // ความน่าจะเป็นของการ์ด
        const total = 52;
        const favorable = 13; // 1 ชุด
        const percentage = Math.round((favorable / total) * 100);
        return {
          question: `จั่วไพ่ 1 ใบจาก 52 ใบ ความน่าจะเป็นได้โพดำ = ?%`,
          answer: percentage
        };
      },
      () => {
        // ความน่าจะเป็นของเหรียญ
        const flips = 2;
        const favorable = 1; // HH หรือ TT
        const total = 4; // HH, HT, TH, TT
        const percentage = Math.round((favorable / total) * 100);
        return {
          question: `โยนเหรียญ 2 ครั้ง ความน่าจะเป็นได้หัว 2 ครั้ง = ?%`,
          answer: percentage
        };
      },
      () => {
        // ความน่าจะเป็นง่ายๆ
        const red = random(5, 15);
        const blue = random(5, 15);
        const total = red + blue;
        const percentage = Math.round((red / total) * 100);
        return {
          question: `ลูกบอลแดง ${red} น้ำเงิน ${blue} สุ่ม 1 ลูก ความน่าจะเป็นได้แดง = ?%`,
          answer: percentage
        };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, 10)
    );
  }

  // Level 96-100: โจทย์ผสม
  private generateMixedProblems(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // เลขยกกำลัง + พหุนาม
        const base = random(2, 4);
        const exp = random(2, 3);
        const a = random(2, 5);
        const b = random(3, 8);
        const answer = Math.pow(base, exp) + a + b;
        return {
          question: `${base}^${exp} + ${a} + ${b} = ?`,
          answer: answer
        };
      },
      () => {
        // ฟังก์ชันเชิงเส้นผสม
        const m1 = random(2, 4);
        const m2 = random(1, 3);
        const x = random(1, 5);
        const answer = m1 * x + m2 * x;
        return {
          question: `f(x) = ${m1}x, g(x) = ${m2}x, f(${x}) + g(${x}) = ?`,
          answer: answer
        };
      },
      () => {
        // พีทาโกรัสง่ายๆ
        const squares = [9, 16, 25, 36, 49, 64, 81, 100];
        const a2 = randomChoice(squares);
        const b2 = randomChoice(squares);
        const c2 = a2 + b2;
        return {
          question: `a² = ${a2}, b² = ${b2}, c² = ?`,
          answer: c2
        };
      },
      () => {
        // แยกตัวประกอบ + แทนค่า
        const common = random(3, 7);
        const x = random(2, 6);
        const answer = common * x;
        return {
          question: `${common}x เมื่อ x = ${x} มีค่า = ?`,
          answer: answer
        };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(10, Math.floor(type.answer * 0.2)))
    );
  }
}