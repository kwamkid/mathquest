// lib/game/generators/secondary/m3.ts

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

export class M3Generator extends BaseGenerator {
  constructor() {
    super('M3');
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
      () => this.generateQuadraticWordProblem(level, config),
      () => this.generateGeometryWordProblem(level, config),
      () => this.generateTrigonometryWordProblem(level, config),
      () => this.generateOptimizationProblem(level, config),
      () => this.generatePhysicsApplicationProblem(level, config)
    ];
    
    const generator = randomChoice(problemTypes);
    return generator();
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    if (level <= 25) {
      return [QuestionType.MIXED]; // สมการกำลังสอง
    } else if (level <= 50) {
      return [QuestionType.MIXED]; // ฟังก์ชันกำลังสอง
    } else if (level <= 75) {
      return [QuestionType.MIXED]; // เรขาคณิตเบื้องต้น
    } else {
      return [QuestionType.MIXED, QuestionType.WORD_PROBLEM]; // ตรีโกณมิติเบื้องต้น
    }
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: สมการกำลังสอง
      return this.generateQuadraticEquations(level, config);
    } else if (level <= 50) {
      // Level 26-50: ฟังก์ชันกำลังสอง
      return this.generateQuadraticFunctions(level, config);
    } else if (level <= 75) {
      // Level 51-75: เรขาคณิตเบื้องต้น
      return this.generateGeometry(level, config);
    } else {
      // Level 76+: ตรีโกณมิติเบื้องต้น
      return this.generateTrigonometry(level, config);
    }
  }

  private generateQuadraticEquations(level: number, config: LevelConfig): Question {
    const quadraticTypes = [
      {
        generate: () => {
          // x² = constant
          const x = random(2, 8);
          const constant = x * x;
          return {
            question: `x² = ${constant}, x = ? (ตอบค่าบวก)`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          // x² + c = result
          const x = random(3, 9);
          const c = random(5, 20);
          const result = x * x + c;
          return {
            question: `x² + ${c} = ${result}, x = ? (ตอบค่าบวก)`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          // (x + a)² = result
          const x = random(2, 6);
          const a = random(1, 5);
          const innerValue = x + a;
          const result = innerValue * innerValue;
          return {
            question: `(x + ${a})² = ${result}, x = ?`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          // ax² = result
          const x = random(2, 6);
          const a = random(2, 5);
          const result = a * x * x;
          return {
            question: `${a}x² = ${result}, x = ? (ตอบค่าบวก)`,
            answer: x
          };
        }
      },
      {
        generate: () => {
          // x² - bx = 0 → x(x - b) = 0
          const b = random(3, 12);
          return {
            question: `x² - ${b}x = 0, x = ? (ตอบค่าบวก)`,
            answer: b
          };
        }
      }
    ];
    
    const quadType = randomChoice(quadraticTypes).generate();
    
    return this.createQuestion(
      quadType.question,
      quadType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(quadType.answer, 4, Math.max(3, Math.floor(quadType.answer * 0.5)))
    );
  }

  private generateQuadraticFunctions(level: number, config: LevelConfig): Question {
    const functionTypes = [
      {
        generate: () => {
          // f(x) = ax² + bx + c, find f(k)
          const a = random(1, 4);
          const b = random(-5, 8);
          const c = random(-10, 15);
          const x = random(-3, 5);
          const result = a * x * x + b * x + c;
          return {
            question: `f(x) = ${a}x² + ${b}x + ${c}, f(${x}) = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // Vertex form: find vertex x-coordinate
          const a = random(1, 3);
          const h = random(-4, 6);
          const k = random(-8, 12);
          return {
            question: `y = ${a}(x - ${h})² + ${k}, จุดยอดที่ x = ?`,
            answer: h
          };
        }
      },
      {
        generate: () => {
          // y-intercept of quadratic
          const a = random(1, 4);
          const b = random(-6, 8);
          const c = random(-12, 20);
          return {
            question: `y = ${a}x² + ${b}x + ${c}, จุดตัด y-axis ที่ y = ?`,
            answer: c
          };
        }
      },
      {
        generate: () => {
          // Find when quadratic equals zero (simple case)
          const root = random(2, 8);
          const a = random(1, 3);
          const result = a * root * root;
          return {
            question: `${a}x² = ${result}, x = ? (ตอบค่าบวก)`,
            answer: root
          };
        }
      }
    ];
    
    const funcType = randomChoice(functionTypes).generate();
    
    return this.createQuestion(
      funcType.question,
      funcType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(funcType.answer, 4, Math.max(5, Math.abs(funcType.answer)))
    );
  }

  private generateGeometry(level: number, config: LevelConfig): Question {
    const geometryTypes = [
      {
        generate: () => {
          // Area of triangle
          const base = random(8, 25);
          const height = random(6, 20);
          const area = Math.floor(base * height / 2);
          return {
            question: `สามเหลี่ยมฐาน ${base} ซม. สูง ${height} ซม. พื้นที่กี่ตร.ซม.?`,
            answer: area
          };
        }
      },
      {
        generate: () => {
          // Area of circle
          const radius = random(5, 15);
          const area = Math.round(3.14 * radius * radius);
          return {
            question: `วงกลมรัศมี ${radius} ซม. พื้นที่กี่ตร.ซม.? (π = 3.14)`,
            answer: area
          };
        }
      },
      {
        generate: () => {
          // Perimeter of rectangle
          const length = random(12, 30);
          const width = random(8, 20);
          const perimeter = 2 * (length + width);
          return {
            question: `สี่เหลี่ยมผืนผ้า ยาว ${length} ซม. กว้าง ${width} ซม. เส้นรอบรูปกี่ซม.?`,
            answer: perimeter
          };
        }
      },
      {
        generate: () => {
          // Circumference of circle
          const radius = random(7, 20);
          const circumference = Math.round(2 * 3.14 * radius);
          return {
            question: `วงกลมรัศมี ${radius} ซม. เส้นรอบวงกี่ซม.? (π = 3.14)`,
            answer: circumference
          };
        }
      },
      {
        generate: () => {
          // Area of parallelogram
          const base = random(10, 25);
          const height = random(6, 18);
          const area = base * height;
          return {
            question: `สี่เหลี่ยมด้านขนาน ฐาน ${base} ซม. สูง ${height} ซม. พื้นที่กี่ตร.ซม.?`,
            answer: area
          };
        }
      }
    ];
    
    const geoType = randomChoice(geometryTypes).generate();
    
    return this.createQuestion(
      geoType.question,
      geoType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(geoType.answer, 4, Math.max(10, Math.floor(geoType.answer * 0.2)))
    );
  }

  private generateTrigonometry(level: number, config: LevelConfig): Question {
    const trigTypes = [
      {
        generate: () => {
          // Basic sine values
          const angles = [
            { angle: 0, sin: 0 },
            { angle: 30, sin: 50 }, // 0.5 → 50
            { angle: 45, sin: 71 }, // √2/2 ≈ 0.71 → 71
            { angle: 60, sin: 87 }, // √3/2 ≈ 0.87 → 87
            { angle: 90, sin: 100 } // 1 → 100
          ];
          const angleData = randomChoice(angles);
          return {
            question: `sin(${angleData.angle}°) = ? (ตอบเป็น % เช่น 0.5 → ตอบ 50)`,
            answer: angleData.sin
          };
        }
      },
      {
        generate: () => {
          // Basic cosine values
          const angles = [
            { angle: 0, cos: 100 }, // 1 → 100
            { angle: 30, cos: 87 }, // √3/2 ≈ 0.87 → 87
            { angle: 45, cos: 71 }, // √2/2 ≈ 0.71 → 71
            { angle: 60, cos: 50 }, // 0.5 → 50
            { angle: 90, cos: 0 }   // 0 → 0
          ];
          const angleData = randomChoice(angles);
          return {
            question: `cos(${angleData.angle}°) = ? (ตอบเป็น % เช่น 0.5 → ตอบ 50)`,
            answer: angleData.cos
          };
        }
      },
      {
        generate: () => {
          // Basic tangent values
          const angles = [
            { angle: 0, tan: 0 },
            { angle: 30, tan: 58 }, // 1/√3 ≈ 0.58 → 58
            { angle: 45, tan: 100 }, // 1 → 100
            { angle: 60, tan: 173 }  // √3 ≈ 1.73 → 173
          ];
          const angleData = randomChoice(angles);
          return {
            question: `tan(${angleData.angle}°) = ? (ตอบเป็น % เช่น 1.0 → ตอบ 100)`,
            answer: angleData.tan
          };
        }
      },
      {
        generate: () => {
          // Pythagorean theorem
          const a = random(3, 9);
          const b = random(4, 12);
          const c = Math.round(Math.sqrt(a * a + b * b));
          return {
            question: `สามเหลี่ยมมุมฉาก ด้าน ${a} ซม. และ ${b} ซม. ด้านตรงข้ามมุมฉากยาวกี่ซม.? (ปัดเป็นจำนวนเต็ม)`,
            answer: c
          };
        }
      }
    ];
    
    const trigType = randomChoice(trigTypes).generate();
    
    return this.createQuestion(
      trigType.question,
      trigType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(trigType.answer, 4, Math.max(10, Math.floor(trigType.answer * 0.2)))
    );
  }

  private generateQuadraticWordProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const side = random(5, 15);
          const area = side * side;
          return {
            question: `สี่เหลี่ยมจัตุรัสพื้นที่ ${area} ตร.ม. ด้านยาวกี่เมตร?`,
            answer: side
          };
        }
      },
      {
        generate: () => {
          const time = random(2, 6);
          const distance = Math.round(0.5 * 10 * time * time); // s = 1/2 * g * t², g = 10 m/s²
          return {
            question: `วัตถุตกอิสระ ${time} วินาที ตกได้ระยะทางกี่เมตร? (g = 10 ม./วิ²)`,
            answer: distance
          };
        }
      },
      {
        generate: () => {
          const width = random(4, 12);
          const length = width + random(2, 8);
          const area = width * length;
          return {
            question: `สี่เหลี่ยมผืนผ้า กว้าง ${width} ม. ยาวกว่ากว้าง ${length - width} ม. พื้นที่กี่ตร.ม.?`,
            answer: area
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

  private generateGeometryWordProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const radius = random(8, 25);
          const area = Math.round(3.14 * radius * radius);
          const cost = random(50, 150);
          const totalCost = Math.round(area * cost);
          return {
            question: `สวนกลม รัศมี ${radius} ม. ปูหญ้าตร.ม.ละ ${cost} บาท ค่าใช้จ่ายรวมเท่าไร? (π = 3.14)`,
            answer: totalCost
          };
        }
      },
      {
        generate: () => {
          const base = random(12, 30);
          const height = random(8, 20);
          const area = Math.round(base * height / 2);
          const pricePerSqm = random(200, 500);
          const totalPrice = area * pricePerSqm;
          return {
            question: `ที่ดินสามเหลี่ยม ฐาน ${base} ม. สูง ${height} ม. ราคาตร.ม.ละ ${pricePerSqm} บาท รวมเท่าไร?`,
            answer: totalPrice
          };
        }
      },
      {
        generate: () => {
          const side1 = random(8, 15);
          const side2 = random(6, 12);
          const side3 = random(10, 18);
          const perimeter = side1 + side2 + side3;
          const fencePrice = random(150, 300);
          const totalCost = perimeter * fencePrice;
          return {
            question: `รั้วรอบที่ดินสามเหลี่ยม ด้าน ${side1}, ${side2}, ${side3} ม. รั้วเมตรละ ${fencePrice} บาท ค่าใช้จ่ายรวม?`,
            answer: totalCost
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
      generateChoices(scenario.answer, 4, Math.max(1000, Math.floor(scenario.answer * 0.1)))
    );
  }

  private generateTrigonometryWordProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          const height = random(10, 30);
          const distance = random(15, 40);
          const hypotenuse = Math.round(Math.sqrt(height * height + distance * distance));
          return {
            question: `บันไดเท้ากับพื้น ${distance} ม. ยาวถึงหน้าต่างสูง ${height} ม. บันไดยาวกี่เมตร? (ปัดเป็นจำนวนเต็ม)`,
            answer: hypotenuse
          };
        }
      },
      {
        generate: () => {
          const adjacent = random(20, 50);
          const angle = 30; // degrees
          const result = Math.round(adjacent * 0.58);
          return {
            question: `ยืนห่างจากตึก ${adjacent} ม. มองขึ้นมุม 30° เห็นยอดตึก ตึกสูงกี่เมตร? (tan30° = 0.58)`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          const base = random(15, 35);
          const angle = 45; // degrees  
          const height = base; // tan(45°) = 1
          return {
            question: `เขาลาดเอียง 45° ฐาน ${base} ม. ความสูงของเขากี่เมตร?`,
            answer: height
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

  private generateOptimizationProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          // Maximum area rectangle with fixed perimeter
          const perimeter = random(40, 80);
          const side = perimeter / 4; // Square gives maximum area
          const maxArea = side * side;
          return {
            question: `เส้นรอบรูป ${perimeter} ม. สี่เหลี่ยมผืนผ้าพื้นที่มากสุดเท่าไร? (เป็นสี่เหลี่ยมจัตุรัส)`,
            answer: Math.round(maxArea)
          };
        }
      },
      {
        generate: () => {
          // Cost minimization
          const materialCost = random(100, 300);
          const laborCost = random(50, 150);
          const units = random(5, 15);
          const totalCost = (materialCost + laborCost) * units;
          return {
            question: `วัสดุ ${materialCost} บาท/หน่วย แรงงาน ${laborCost} บาท/หน่วย ผลิต ${units} หน่วย ต้นทุนรวม?`,
            answer: totalCost
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
      generateChoices(scenario.answer, 4, Math.max(100, Math.floor(scenario.answer * 0.15)))
    );
  }

  private generatePhysicsApplicationProblem(level: number, config: LevelConfig): Question {
    const scenarios = [
      {
        generate: () => {
          // Projectile motion - maximum height
          const initialVelocity = random(20, 50);
          const maxHeight = Math.round((initialVelocity * initialVelocity) / (2 * 10)); // h = v²/2g, g = 10
          return {
            question: `ขว้างลูกบอลขึ้นด้วยความเร็ว ${initialVelocity} ม./วิ สูงสุดกี่เมตร? (g = 10 ม./วิ²)`,
            answer: maxHeight
          };
        }
      },
      {
        generate: () => {
          // Work and energy
          const force = random(50, 200);
          const distance = random(10, 30);
          const work = force * distance;
          return {
            question: `แรง ${force} นิวตัน ผลัก ${distance} เมตร งานที่ทำกี่จูล?`,
            answer: work
          };
        }
      },
      {
        generate: () => {
          // Simple harmonic motion - period
          const frequency = random(2, 8);
          const period = Math.round(1 / frequency * 10) / 10; // Round to 1 decimal
          const periodInt = Math.round(period * 10); // Convert to integer for answer
          return {
            question: `การสั่นความถี่ ${frequency} เฮิร์ต คาบการสั่นกี่วินาที? (T = 1/f ตอบคูณ 10 เช่น 0.5 → ตอบ 5)`,
            answer: periodInt
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
      generateChoices(scenario.answer, 4, Math.max(10, Math.floor(scenario.answer * 0.3)))
    );
  }
}