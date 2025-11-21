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
      return this.generateLinearInequality(level, config);
    } else if (level <= 30) {
      return this.generateSystemOfEquations(level, config);
    } else if (level <= 45) {
      return this.generateQuadraticFunction(level, config);
    } else if (level <= 60) {
      return this.generateQuadraticEquation(level, config);
    } else if (level <= 70) {
      return this.generateSimilarity(level, config);
    } else if (level <= 85) {
      return this.generateTrigonometry(level, config);
    } else if (level <= 95) {
      return this.generateCircle(level, config);
    } else {
      return this.generateMixedProblems(level, config);
    }
  }

  // Level 1-15: อสมการเชิงเส้น
  private generateLinearInequality(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const x = random(1, 10);
        const a = random(2, 8);
        const b = a + x + random(1, 5);
        return {
          question: `x + ${a} < ${b}, x < ?`,
          answer: b - a
        };
      },
      () => {
        const x = random(5, 15);
        const a = random(1, 5);
        const b = x - a - random(1, 3);
        return {
          question: `x - ${a} > ${b}, x > ?`,
          answer: b + a
        };
      },
      () => {
        const a = random(2, 5);
        const x = random(2, 8);
        const b = a * x;
        return {
          question: `${a}x < ${b}, x < ?`,
          answer: x
        };
      },
      () => {
        const a = random(2, 6);
        const x = random(3, 10);
        const b = a * x;
        return {
          question: `${a}x ≥ ${b}, x ≥ ?`,
          answer: x
        };
      },
      () => {
        const x = random(3, 12);
        return {
          question: `-x < -${x}, x > ?`,
          answer: x
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('x + 5 < 10, x < ?', 5, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, type.answer))
    );
  }

  // Level 16-30: ระบบสมการ
  private generateSystemOfEquations(level: number, config: LevelConfig): Question {
    const types = [
      () => {
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
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('x + y = 10, x - y = 2, x = ?', 6, QuestionType.MIXED, level, [5, 6, 7, 8]);
    }
    
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
        const x = random(-5, 5);
        const c = random(-10, 10);
        const answer = x * x + c;
        return {
          question: `f(x) = x² + ${c}, f(${x}) = ?`,
          answer: answer
        };
      },
      () => {
        const a = random(1, 4);
        const x = random(-4, 4);
        const answer = a * x * x;
        return {
          question: `f(x) = ${a}x², f(${x}) = ?`,
          answer: answer
        };
      },
      () => {
        const c = random(-20, 20);
        return {
          question: `y = x² + ${c}, จุดยอดอยู่ที่ (0, ?)`,
          answer: c
        };
      },
      () => {
        const x = random(2, 8);
        const y = x * x;
        return {
          question: `y = x², ถ้า y = ${y} แล้ว x = ? (ตอบค่าบวก)`,
          answer: x
        };
      },
      () => {
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
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('f(x) = x² + 3, f(2) = ?', 7, QuestionType.MIXED, level, [6, 7, 8, 9]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(5, Math.abs(type.answer)))
    );
  }

  // Level 46-60: สมการกำลังสอง
  private generateQuadraticEquation(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const x = random(2, 12);
        const a = x * x;
        return {
          question: `x² = ${a}, x = ? (ตอบค่าบวก)`,
          answer: x
        };
      },
      () => {
        const x = random(2, 10);
        const b = -x;
        return {
          question: `x² + ${b}x = 0, x = ? (ตอบค่าที่ไม่ใช่ 0)`,
          answer: -b
        };
      },
      () => {
        const a = random(1, 8);
        const b = random(1, 8);
        const larger = Math.max(a, b);
        return {
          question: `(x - ${a})(x - ${b}) = 0, x = ? (ตอบค่ามากกว่า)`,
          answer: larger
        };
      },
      () => {
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
        const a = random(3, 9);
        const a2 = a * a;
        return {
          question: `(x - ${a})² = 0, x = ?`,
          answer: a
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('x² = 9, x = ?', 3, QuestionType.MIXED, level, [2, 3, 4, 5]);
    }
    
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
        const ratio = random(2, 5);
        const a = random(3, 8);
        const b = a * ratio;
        return {
          question: `รูปคล้าย ด้านแรก ${a}:${b} ด้านสมนัย 6:?`,
          answer: 6 * ratio
        };
      },
      () => {
        const scale = random(2, 4);
        const side1 = random(4, 10);
        const side2 = side1 * scale;
        return {
          question: `รูปคล้าย อัตราส่วน 1:${scale} ด้านเล็ก ${side1} ด้านใหญ่ = ?`,
          answer: side2
        };
      },
      () => {
        const ratio = random(2, 5);
        const area1 = random(4, 16);
        const area2 = area1 * ratio * ratio;
        return {
          question: `รูปคล้าย อัตราส่วนด้าน 1:${ratio} พื้นที่เล็ก ${area1} พื้นที่ใหญ่ = ?`,
          answer: area2
        };
      },
      () => {
        const a1 = random(3, 9);
        const ratio = random(2, 4);
        const a2 = a1 * ratio;
        return {
          question: `รูปคล้าย ด้าน ${a1} และ ${a2} อัตราส่วน 1:?`,
          answer: ratio
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('รูปคล้าย 3:6 = 4:?', 8, QuestionType.MIXED, level, [6, 7, 8, 9]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, Math.floor(type.answer * 0.3)))
    );
  }

  // Level 71-85: ตรีโกณมิติ
  private generateTrigonometry(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const angles = [
          { angle: 30, sin: 1, cos: 3, tan: 1 },
          { angle: 45, sin: 1, cos: 1, tan: 1 },
          { angle: 60, sin: 3, cos: 1, tan: 3 }
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
        const result = 1;
        return {
          question: `sin²θ + cos²θ = ?`,
          answer: result
        };
      },
      () => {
        // ✅ แก้ไข: ใช้ค่าที่หารลงตัวเพื่อหลีกเลี่ยง floating-point errors
        const pairs = [
          { sin: 3, cos: 4, tan10: 8 },   // tan = 0.75 → × 10 = 7.5 ≈ 8
          { sin: 4, cos: 3, tan10: 13 },  // tan = 1.33 → × 10 = 13.3 ≈ 13
          { sin: 1, cos: 2, tan10: 5 },   // tan = 0.5 → × 10 = 5
          { sin: 2, cos: 1, tan10: 20 },  // tan = 2 → × 10 = 20
          { sin: 3, cos: 5, tan10: 6 },   // tan = 0.6 → × 10 = 6
          { sin: 5, cos: 4, tan10: 13 },  // tan = 1.25 → × 10 = 12.5 ≈ 13
          { sin: 2, cos: 5, tan10: 4 },   // tan = 0.4 → × 10 = 4
        ];
        const selected = randomChoice(pairs);
        return {
          question: `sinθ = ${selected.sin}, cosθ = ${selected.cos}, tanθ × 10 = ? (ปัดเศษ)`,
          answer: selected.tan10
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('sin²θ + cos²θ = ?', 1, QuestionType.MIXED, level, [0, 1, 2, 3]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, type.answer))
    );
  }

  // Level 86-95: วงกลม (✅ แก้ไข: ใช้ค่าที่หารลงตัวกับ π = 22/7)
  private generateCircle(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        // ✅ ใช้รัศมีที่เป็นพหุคูณของ 7 เพื่อให้หารลงตัว
        const r = randomChoice([7, 14, 21]);
        const circumference = 2 * 22 * r / 7; // จะได้เลขจำนวนเต็มเสมอ
        return {
          question: `วงกลมรัศมี ${r} เส้นรอบวง = ? (ใช้ π = 22/7)`,
          answer: circumference
        };
      },
      () => {
        // ✅ ใช้รัศมีที่เป็นพหุคูณของ 7 เพื่อให้หารลงตัว
        const r = randomChoice([7, 14, 21]);
        const area = 22 * r * r / 7; // จะได้เลขจำนวนเต็มเสมอ
        return {
          question: `วงกลมรัศมี ${r} พื้นที่ = ? (ใช้ π = 22/7)`,
          answer: area
        };
      },
      () => {
        const r = randomChoice([7, 14, 21]);
        const c = 2 * 22 * r / 7;
        return {
          question: `วงกลมเส้นรอบวง ${c} รัศมี = ? (ใช้ π = 22/7)`,
          answer: r
        };
      },
      () => {
        const r = random(5, 20);
        const d = 2 * r;
        return {
          question: `วงกลมรัศมี ${r} เส้นผ่านศูนย์กลาง = ?`,
          answer: d
        };
      },
      () => {
        // ✅ ใช้ค่าที่คำนวณไว้ล่วงหน้าเพื่อหลีกเลี่ยง floating-point errors
        const precomputed = [
          { r: 7, angle: 90, arc: 11 },   // 2×22×7×90/(7×360) = 11
          { r: 7, angle: 180, arc: 22 },  // 2×22×7×180/(7×360) = 22
          { r: 14, angle: 90, arc: 22 },  // 2×22×14×90/(7×360) = 22
          { r: 14, angle: 180, arc: 44 }, // 2×22×14×180/(7×360) = 44
          { r: 21, angle: 90, arc: 33 },  // 2×22×21×90/(7×360) = 33
          { r: 21, angle: 180, arc: 66 }, // 2×22×21×180/(7×360) = 66
        ];
        const selected = randomChoice(precomputed);
        return {
          question: `วงกลมรัศมี ${selected.r} ส่วนโค้ง ${selected.angle}° ยาว = ? (ใช้ π = 22/7)`,
          answer: selected.arc
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('วงกลมรัศมี 7 เส้นรอบวง = ?', 44, QuestionType.MIXED, level, [40, 42, 44, 46]);
    }
    
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
        const x = random(3, 10);
        const x2 = x * x;
        return {
          question: `x² = ${x2} และ x > 0, x = ?`,
          answer: x
        };
      },
      () => {
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
        const a = 6;
        const b = 8;
        const c = 10;
        return {
          question: `สามเหลี่ยม 6-8-10, sin(มุมตรงข้าม 6) = 6/?`,
          answer: c
        };
      },
      () => {
        const r1 = random(3, 8);
        const scale = random(2, 4);
        const r2 = r1 * scale;
        const areaRatio = scale * scale;
        return {
          question: `วงกลม 2 วง รัศมี ${r1}:${r2} อัตราส่วนพื้นที่ 1:?`,
          answer: areaRatio
        };
      },
      () => {
        const x = random(2, 8);
        const y = x * x;
        return {
          question: `f(x) = x², f(x) < ${y + 10}, f(${x}) = ?`,
          answer: y
        };
      }
    ];
    
    const type = randomChoice(types)();
    
    if (!Number.isFinite(type.answer)) {
      return this.createQuestion('x² = 9 และ x > 0, x = ?', 3, QuestionType.MIXED, level, [2, 3, 4, 5]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(5, Math.floor(type.answer * 0.2)))
    );
  }
}