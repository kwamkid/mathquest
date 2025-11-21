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
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    return [QuestionType.MIXED];
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 15) {
      return this.generateIntegerExponents(level, config);
    } else if (level <= 30) {
      return this.generatePolynomials(level, config);
    } else if (level <= 45) {
      return this.generateFactoring(level, config);
    } else if (level <= 60) {
      return this.generateLinearTwoVariables(level, config);
    } else if (level <= 75) {
      return this.generateLinearFunctions(level, config);
    } else if (level <= 85) {
      return this.generatePythagorean(level, config);
    } else if (level <= 95) {
      return this.generateProbability(level, config);
    } else {
      return this.generateMixedProblems(level, config);
    }
  }

  // Level 1-15: เลขยกกำลัง
  private generateIntegerExponents(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const base = random(2, 8);
        const exp = random(-3, -1);
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
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('2^2 × 2^3 = 2^?', 5, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
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
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('2x + 3x = ?x', 5, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, Math.abs(type.answer)))
    );
  }

  // Level 31-45: การแยกตัวประกอบ
  private generateFactoring(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const common = random(2, 6);
        const a = random(2, 8);
        const b = random(3, 10);
        return {
          question: `${common * a}x + ${common * b} = ?(${a}x + ${b})`,
          answer: common
        };
      },
      () => {
        const a = random(2, 10);
        return {
          question: `x² - ${a*a} = (x + ${a})(x - ?)`,
          answer: a
        };
      },
      () => {
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
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('6x + 9 = ?(2x + 3)', 3, QuestionType.MIXED, level, [2, 3, 4, 5]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, type.answer))
    );
  }

  // Level 46-60: สมการสองตัวแปร
  private generateLinearTwoVariables(level: number, config: LevelConfig): Question {
    const types = [
      () => {
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
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('x + y = 10, x = 6, y = ?', 4, QuestionType.MIXED, level, [3, 4, 5, 6]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, type.answer))
    );
  }

  // Level 61-75: ฟังก์ชันเชิงเส้น (✅ แก้ไข division by zero)
  private generateLinearFunctions(level: number, config: LevelConfig): Question {
    const types = [
      () => {
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
        // ✅ แก้ไข: ใช้ค่าที่หารลงตัวเพื่อให้ได้ความชันเป็นจำนวนเต็ม
        const precomputed = [
          { x1: 0, y1: 0, x2: 3, y2: 6, slope: 2 },    // (6-0)/(3-0) = 2
          { x1: 1, y1: 2, x2: 4, y2: 11, slope: 3 },   // (11-2)/(4-1) = 3
          { x1: 0, y1: 5, x2: 5, y2: 15, slope: 2 },   // (15-5)/(5-0) = 2
          { x1: 2, y1: 1, x2: 6, y2: 9, slope: 2 },    // (9-1)/(6-2) = 2
          { x1: 1, y1: 3, x2: 5, y2: 7, slope: 1 },    // (7-3)/(5-1) = 1
          { x1: 0, y1: 1, x2: 2, y2: 9, slope: 4 },    // (9-1)/(2-0) = 4
          { x1: 3, y1: 2, x2: 6, y2: 17, slope: 5 },   // (17-2)/(6-3) = 5
        ];
        const selected = randomChoice(precomputed);
        return {
          question: `ผ่านจุด (${selected.x1}, ${selected.y1}) และ (${selected.x2}, ${selected.y2}) ความชัน = ?`,
          answer: selected.slope
        };
      },
      () => {
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
    
    if (!Number.isFinite(type.answer)) {
      console.error('Invalid answer in generateLinearFunctions:', type.answer);
      return this.createQuestion('f(x) = 2x + 3, f(5) = ?', 13, QuestionType.MIXED, level, [11, 12, 13, 14]);
    }
    
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
        const a = 3;
        const b = 4;
        const c = 5;
        return {
          question: `สามเหลี่ยมมุมฉาก ด้าน ${a} และ ${b} ด้านตรงข้ามมุมฉาก = ?`,
          answer: c
        };
      },
      () => {
        const a = 5;
        const b = 12;
        const c = 13;
        return {
          question: `สามเหลี่ยมมุมฉาก ด้าน ${a} และ ${b} ด้านตรงข้ามมุมฉาก = ?`,
          answer: c
        };
      },
      () => {
        const a = 8;
        const b = 15;
        const c = 17;
        return {
          question: `สามเหลี่ยมมุมฉาก ด้าน ${a} และ ${b} ด้านตรงข้ามมุมฉาก = ?`,
          answer: c
        };
      },
      () => {
        const c = 10;
        const a = 6;
        const b = 8;
        return {
          question: `สามเหลี่ยมมุมฉาก ด้านตรงข้ามมุมฉาก ${c} ด้านหนึ่ง ${a} อีกด้าน = ?`,
          answer: b
        };
      },
      () => {
        const a = random(3, 12);
        const answer = a * a;
        return {
          question: `${a}² = ?`,
          answer: answer
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('3² + 4² = ?²', 5, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, Math.floor(type.answer * 0.2)))
    );
  }

  // Level 86-95: ความน่าจะเป็น
  private generateProbability(level: number, config: LevelConfig): Question {
    const types = [
      () => {
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
        const total = 52;
        const favorable = 13;
        const percentage = Math.round((favorable / total) * 100);
        return {
          question: `จั่วไพ่ 1 ใบจาก 52 ใบ ความน่าจะเป็นได้โพดำ = ?%`,
          answer: percentage
        };
      },
      () => {
        const percentage = 25;
        return {
          question: `โยนเหรียญ 2 ครั้ง ความน่าจะเป็นได้หัว 2 ครั้ง = ?%`,
          answer: percentage
        };
      },
      () => {
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
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('ทอยลูกเต๋า ความน่าจะเป็นได้หน้า 6 = ?%', 17, QuestionType.MIXED, level, [15, 16, 17, 18]);
    }
    
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
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('2^2 + 5 = ?', 9, QuestionType.MIXED, level, [8, 9, 10, 11]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(10, Math.floor(type.answer * 0.2)))
    );
  }
}