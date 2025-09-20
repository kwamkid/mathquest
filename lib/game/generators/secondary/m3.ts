// lib/game/generators/secondary/m3.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices,
  randomChoice
} from '../utils';

export class M3Generator extends BaseGenerator {
  constructor() {
    super('M3');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // M3 ใช้แค่ MIXED (ตัวเลขล้วน) ไม่มีโจทย์ปัญหา
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // M3 ไม่มีโจทย์ปัญหา ให้ส่ง MIXED แทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    // M3 มีแค่ MIXED (ตัวเลขล้วน)
    return [QuestionType.MIXED];
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 15) {
      // Level 1-15: อสมการเชิงเส้นตัวแปรเดียว
      return this.generateLinearInequality(level, config);
    } else if (level <= 30) {
      // Level 16-30: ระบบสมการเชิงเส้นสองตัวแปร
      return this.generateSystemOfEquations(level, config);
    } else if (level <= 45) {
      // Level 31-45: ฟังก์ชันกำลังสอง
      return this.generateQuadraticFunction(level, config);
    } else if (level <= 60) {
      // Level 46-60: สมการกำลังสองตัวแปรเดียว
      return this.generateQuadraticEquation(level, config);
    } else if (level <= 70) {
      // Level 61-70: ความคล้าย (อัตราส่วนที่เท่ากัน)
      return this.generateSimilarity(level, config);
    } else if (level <= 85) {
      // Level 71-85: อัตราส่วนตรีโกณมิติ
      return this.generateTrigonometry(level, config);
    } else if (level <= 95) {
      // Level 86-95: วงกลม (พื้นที่ เส้นรอบวง)
      return this.generateCircle(level, config);
    } else {
      // Level 96-100: โจทย์ผสม
      return this.generateMixedProblems(level, config);
    }
  }

  // Level 1-15: อสมการเชิงเส้นตัวแปรเดียว
  private generateLinearInequality(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // x + a < b
        const x = random(1, 10);
        const a = random(2, 8);
        const b = a + x + random(1, 5);
        return {
          question: `x + ${a} < ${b}, x < ?`,
          answer: b - a
        };
      },
      () => {
        // x - a > b
        const x = random(5, 15);
        const a = random(1, 5);
        const b = x - a - random(1, 3);
        return {
          question: `x - ${a} > ${b}, x > ?`,
          answer: b + a
        };
      },
      () => {
        // ax < b
        const a = random(2, 5);
        const x = random(2, 8);
        const b = a * x;
        return {
          question: `${a}x < ${b}, x < ?`,
          answer: x
        };
      },
      () => {
        // ax ≥ b
        const a = random(2, 6);
        const x = random(3, 10);
        const b = a * x;
        return {
          question: `${a}x ≥ ${b}, x ≥ ?`,
          answer: x
        };
      },
      () => {
        // -x < a
        const x = random(3, 12);
        return {
          question: `-x < -${x}, x > ?`,
          answer: x
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

  // Level 16-30: ระบบสมการเชิงเส้นสองตัวแปร
  private generateSystemOfEquations(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // วิธีบวก/ลบ
        const x = random(2, 8);
        const y = random(1, 6);
        const a1 = random(2, 5);
        const b1 = random(1, 4);
        const c1 = a1 * x + b1 * y;
        const a2 = random(1, 4);
        const b2 = random(2, 5);
        const c2 = a2 * x + b2 * y;
        return {
          question: `${a1}x + ${b1}y = ${c1}, ${a2}x + ${b2}y = ${c2}, x = ?`,
          answer: x
        };
      },
      () => {
        // วิธีแทนค่า
        const x = random(1, 10);
        const y = random(1, 10);
        const sum = x + y;
        const diff = 2 * x - y;
        return {
          question: `x + y = ${sum}, 2x - y = ${diff}, y = ?`,
          answer: y
        };
      },
      () => {
        // ระบบสมการพิเศษ
        const x = random(3, 12);
        const y = random(2, 8);
        const eq1 = 3 * x + 2 * y;
        const eq2 = x + y;
        return {
          question: `3x + 2y = ${eq1}, x + y = ${eq2}, x = ?`,
          answer: x
        };
      },
      () => {
        // หา x จากระบบสมการ
        const x = random(2, 10);
        const y = random(1, 8);
        const eq1 = 2 * x + 3 * y;
        const eq2 = x - y;
        return {
          question: `2x + 3y = ${eq1}, x - y = ${eq2}, x = ?`,
          answer: x
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

  // Level 31-45: ฟังก์ชันกำลังสอง
  private generateQuadraticFunction(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // f(x) = x² + c
        const x = random(-5, 5);
        const c = random(-10, 10);
        const answer = x * x + c;
        return {
          question: `f(x) = x² + ${c}, f(${x}) = ?`,
          answer: answer
        };
      },
      () => {
        // f(x) = ax²
        const a = random(1, 4);
        const x = random(-4, 4);
        const answer = a * x * x;
        return {
          question: `f(x) = ${a}x², f(${x}) = ?`,
          answer: answer
        };
      },
      () => {
        // จุดยอดของพาราโบลา y = x² + c
        const c = random(-20, 20);
        return {
          question: `y = x² + ${c}, จุดยอดอยู่ที่ (0, ?)`,
          answer: c
        };
      },
      () => {
        // หาค่า x² จากค่า y
        const x = random(2, 8);
        const y = x * x;
        return {
          question: `y = x², ถ้า y = ${y} แล้ว x = ? (ตอบค่าบวก)`,
          answer: x
        };
      },
      () => {
        // f(x) = (x + a)²
        const a = random(1, 5);
        const x = random(-3, 3);
        const answer = (x + a) * (x + a);
        return {
          question: `f(x) = (x + ${a})², f(${x}) = ?`,
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

  // Level 46-60: สมการกำลังสองตัวแปรเดียว
  private generateQuadraticEquation(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // x² = a
        const x = random(2, 12);
        const a = x * x;
        return {
          question: `x² = ${a}, x = ? (ตอบค่าบวก)`,
          answer: x
        };
      },
      () => {
        // x² + bx = 0
        const x = random(2, 10);
        const b = -x;
        return {
          question: `x² + ${b}x = 0, x = ? (ตอบค่าที่ไม่ใช่ 0)`,
          answer: -b
        };
      },
      () => {
        // (x - a)(x - b) = 0
        const a = random(1, 8);
        const b = random(1, 8);
        const larger = Math.max(a, b);
        return {
          question: `(x - ${a})(x - ${b}) = 0, x = ? (ตอบค่ามากกว่า)`,
          answer: larger
        };
      },
      () => {
        // x² - (a+b)x + ab = 0
        const a = random(2, 7);
        const b = random(3, 8);
        const sum = a + b;
        const product = a * b;
        return {
          question: `x² - ${sum}x + ${product} = 0, x = ? (ตอบค่าน้อยกว่า)`,
          answer: Math.min(a, b)
        };
      },
      () => {
        // กำลังสองสมบูรณ์
        const a = random(3, 9);
        const a2 = a * a;
        return {
          question: `(x - ${a})² = 0, x = ?`,
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

  // Level 61-70: ความคล้าย
  private generateSimilarity(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // อัตราส่วนด้านที่สมนัยกัน
        const ratio = random(2, 5);
        const a = random(3, 8);
        const b = a * ratio;
        return {
          question: `รูปคล้าย ด้านแรก ${a}:${b} ด้านสมนัย 6:?`,
          answer: 6 * ratio
        };
      },
      () => {
        // หาด้านที่สมนัยกัน
        const scale = random(2, 4);
        const side1 = random(4, 10);
        const side2 = side1 * scale;
        return {
          question: `รูปคล้าย อัตราส่วน 1:${scale} ด้านเล็ก ${side1} ด้านใหญ่ = ?`,
          answer: side2
        };
      },
      () => {
        // อัตราส่วนพื้นที่
        const ratio = random(2, 5);
        const area1 = random(4, 16);
        const area2 = area1 * ratio * ratio;
        return {
          question: `รูปคล้าย อัตราส่วนด้าน 1:${ratio} พื้นที่เล็ก ${area1} พื้นที่ใหญ่ = ?`,
          answer: area2
        };
      },
      () => {
        // หาอัตราส่วน
        const a1 = random(3, 9);
        const a2 = random(2, 6) * a1;
        const ratio = a2 / a1;
        return {
          question: `รูปคล้าย ด้าน ${a1} และ ${a2} อัตราส่วน 1:?`,
          answer: ratio
        };
      }
    ];
    
    const type = randomChoice(types)();
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, Math.floor(type.answer * 0.3)))
    );
  }

  // Level 71-85: อัตราส่วนตรีโกณมิติ (มุมพิเศษ)
  private generateTrigonometry(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // sin, cos, tan ของมุม 30, 45, 60
        const angles = [
          { angle: 30, sin: 1, cos: 3, tan: 1 }, // sin30 = 1/2, cos30 = √3/2, tan30 = 1/√3
          { angle: 45, sin: 1, cos: 1, tan: 1 }, // sin45 = cos45 = 1/√2, tan45 = 1
          { angle: 60, sin: 3, cos: 1, tan: 3 }  // sin60 = √3/2, cos60 = 1/2, tan60 = √3
        ];
        const selected = randomChoice(angles);
        const funcs = ['sin', 'cos', 'tan'];
        const func = randomChoice(funcs);
        let answer;
        if (func === 'sin') answer = selected.sin;
        else if (func === 'cos') answer = selected.cos;
        else answer = selected.tan;
        
        return {
          question: `${func}${selected.angle}° = ? (ตอบตัวเศษ ถ้า sin30°=1/2 ตอบ 1)`,
          answer: answer
        };
      },
      () => {
        // พีทาโกรัสในสามเหลี่ยมมุมฉาก
        const triangles = [
          { a: 3, b: 4, c: 5 },
          { a: 5, b: 12, c: 13 },
          { a: 8, b: 15, c: 17 },
          { a: 7, b: 24, c: 25 }
        ];
        const tri = randomChoice(triangles);
        return {
          question: `สามเหลี่ยมมุมฉาก ด้าน ${tri.a}, ${tri.b}, ?, ด้านตรงข้ามมุมฉาก = ?`,
          answer: tri.c
        };
      },
      () => {
        // sin² + cos² = 1
        const sinVal = randomChoice([3, 4, 5, 12]);
        const cosVal = randomChoice([4, 3, 12, 5]);
        const result = 1;
        return {
          question: `sin²θ + cos²θ = ?`,
          answer: result
        };
      },
      () => {
        // tan = sin/cos (ค่าง่ายๆ)
        const sin = random(1, 5);
        const cos = random(1, 5);
        const tan = Math.round((sin / cos) * 10); // คูณ 10 เพื่อได้จำนวนเต็ม
        return {
          question: `sinθ = ${sin}, cosθ = ${cos}, tanθ × 10 = ?`,
          answer: tan
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

  // Level 86-95: วงกลม
  private generateCircle(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // เส้นรอบวง (ใช้ π = 22/7 หรือ 3.14)
        const r = random(7, 21);
        const circumference = 2 * 22 * r / 7;
        return {
          question: `วงกลมรัศมี ${r} เส้นรอบวง = ? (ใช้ π = 22/7)`,
          answer: Math.round(circumference)
        };
      },
      () => {
        // พื้นที่วงกลม
        const r = random(3, 10);
        const area = 22 * r * r / 7;
        return {
          question: `วงกลมรัศมี ${r} พื้นที่ = ? (ใช้ π = 22/7)`,
          answer: Math.round(area)
        };
      },
      () => {
        // หารัศมีจากเส้นรอบวง
        const r = randomChoice([7, 14, 21]);
        const c = 2 * 22 * r / 7;
        return {
          question: `วงกลมเส้นรอบวง ${Math.round(c)} รัศมี = ? (ใช้ π = 22/7)`,
          answer: r
        };
      },
      () => {
        // เส้นผ่านศูนย์กลาง
        const r = random(5, 20);
        const d = 2 * r;
        return {
          question: `วงกลมรัศมี ${r} เส้นผ่านศูนย์กลาง = ?`,
          answer: d
        };
      },
      () => {
        // ความยาวส่วนโค้ง (องศาง่ายๆ)
        const r = random(6, 18);
        const angle = randomChoice([90, 180, 270]);
        const arcLength = Math.round(2 * 22 * r * angle / (7 * 360));
        return {
          question: `วงกลมรัศมี ${r} ส่วนโค้ง ${angle}° ยาว = ? (ใช้ π = 22/7)`,
          answer: arcLength
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

  // Level 96-100: โจทย์ผสม
  private generateMixedProblems(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // สมการกำลังสอง + อสมการ
        const x = random(3, 10);
        const x2 = x * x;
        return {
          question: `x² = ${x2} และ x > 0, x = ?`,
          answer: x
        };
      },
      () => {
        // ระบบสมการ + กำลังสอง
        const a = random(2, 6);
        const b = random(3, 8);
        const sum = a + b;
        const product = a * b;
        return {
          question: `x + y = ${sum}, xy = ${product}, x = ? (ตอบค่ามากกว่า)`,
          answer: Math.max(a, b)
        };
      },
      () => {
        // ตรีโกณ + พีทาโกรัส
        const a = 6;
        const b = 8;
        const c = 10;
        return {
          question: `สามเหลี่ยม 6-8-10, sin(มุมตรงข้าม 6) = 6/? `,
          answer: c
        };
      },
      () => {
        // วงกลม + ความคล้าย
        const r1 = random(3, 8);
        const scale = random(2, 4);
        const r2 = r1 * scale;
        const area1 = 22 * r1 * r1 / 7;
        const area2 = 22 * r2 * r2 / 7;
        const areaRatio = scale * scale;
        return {
          question: `วงกลม 2 วง รัศมี ${r1}:${r2} อัตราส่วนพื้นที่ 1:?`,
          answer: areaRatio
        };
      },
      () => {
        // ฟังก์ชันกำลังสอง + อสมการ
        const x = random(2, 8);
        const y = x * x;
        return {
          question: `f(x) = x², f(x) < ${y + 10}, f(${x}) = ?`,
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
      generateChoices(type.answer, 4, Math.max(5, Math.floor(type.answer * 0.2)))
    );
  }
}