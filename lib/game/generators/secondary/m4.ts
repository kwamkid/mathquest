// lib/game/generators/secondary/m4.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice,
  randomFloat
} from '../utils';

export class M4Generator extends BaseGenerator {
  constructor() {
    super('M4');
  }

  generateQuestion(level: number, config: LevelConfig): Question {
    // M4 จะเน้นแค่โจทย์ตัวเลขล้วนๆ ไม่มี word problems
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    // ไม่ทำ word problem - return โจทย์ตัวเลขแทน
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    // ทุก level ใช้ MIXED เพราะเป็นโจทย์ตัวเลขล้วนๆ
    return [QuestionType.MIXED];
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      // Level 1-25: ลอการิทึม
      return this.generateLogarithms(level, config);
    } else if (level <= 50) {
      // Level 26-50: เมทริกซ์เบื้องต้น
      return this.generateMatrices(level, config);
    } else if (level <= 75) {
      // Level 51-75: ตรีโกณมิติขั้นสูง
      return this.generateAdvancedTrigonometry(level, config);
    } else {
      // Level 76-100: เวกเตอร์เบื้องต้น
      return this.generateVectors(level, config);
    }
  }

  private generateLogarithms(level: number, config: LevelConfig): Question {
    const logTypes = [
      {
        generate: () => {
          // log₂(8) = ?
          const bases = [2, 3, 5, 10];
          const base = randomChoice(bases);
          const power = random(1, 4);
          const value = Math.pow(base, power);
          return {
            question: `log₂(${value}) = ?`,
            answer: Math.log(value) / Math.log(2)
          };
        }
      },
      {
        generate: () => {
          // log(100) = ? (base 10)
          const powers = [1, 2, 3];
          const power = randomChoice(powers);
          const value = Math.pow(10, power);
          return {
            question: `log(${value}) = ?`,
            answer: power
          };
        }
      },
      {
        generate: () => {
          // ln(e²) = ?
          const power = random(1, 3);
          return {
            question: `ln(e^${power}) = ?`,
            answer: power
          };
        }
      },
      {
        generate: () => {
          // 2^x = 16, x = ?
          const base = random(2, 5);
          const result = random(2, 4);
          const value = Math.pow(base, result);
          return {
            question: `${base}^x = ${value}, x = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // log₃(27) = ?
          const base = random(2, 5);
          const power = random(2, 4);
          const value = Math.pow(base, power);
          return {
            question: `log${base}(${value}) = ?`,
            answer: power
          };
        }
      }
    ];
    
    const logType = randomChoice(logTypes).generate();
    const answer = Math.round(logType.answer);
    
    return this.createQuestion(
      logType.question,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, Math.max(2, Math.floor(answer * 0.5)))
    );
  }

  private generateMatrices(level: number, config: LevelConfig): Question {
    const matrixTypes = [
      {
        generate: () => {
          // Determinant of 2x2 matrix
          const a = random(-5, 8);
          const b = random(-4, 6);
          const c = random(-6, 5);
          const d = random(-3, 7);
          const det = a * d - b * c;
          return {
            question: `|${a} ${b}; ${c} ${d}| = ?`,
            answer: det
          };
        }
      },
      {
        generate: () => {
          // Matrix addition (single element)
          const a11 = random(-10, 10);
          const a12 = random(-8, 12);
          const b11 = random(-10, 10);
          const b12 = random(-8, 12);
          const sum11 = a11 + b11;
          return {
            question: `[${a11} ${a12}] + [${b11} ${b12}] = [? ...]`,
            answer: sum11
          };
        }
      },
      {
        generate: () => {
          // Scalar multiplication
          const scalar = random(2, 5);
          const element = random(-6, 8);
          const result = scalar * element;
          return {
            question: `${scalar} × [${element}] = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // Trace of matrix (sum of diagonal)
          const a = random(2, 12);
          const b = random(3, 15);
          const trace = a + b;
          return {
            question: `Trace([${a} ...; ... ${b}]) = ?`,
            answer: trace
          };
        }
      },
      {
        generate: () => {
          // Matrix transpose element
          const row = random(1, 3);
          const col = random(1, 3);
          const value = random(5, 25);
          return {
            question: `A[${row},${col}] = ${value}, A^T[${col},${row}] = ?`,
            answer: value
          };
        }
      }
    ];
    
    const matrixType = randomChoice(matrixTypes).generate();
    
    return this.createQuestion(
      matrixType.question,
      matrixType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(matrixType.answer, 4, Math.max(5, Math.abs(matrixType.answer)))
    );
  }

  private generateAdvancedTrigonometry(level: number, config: LevelConfig): Question {
    const trigTypes = [
      {
        generate: () => {
          // sin(2×30°) = ?
          const angles = [30, 45, 60];
          const angle = randomChoice(angles);
          const doubleAngle = 2 * angle;
          
          // sin(2θ) = 2sin(θ)cos(θ)
          const sinValues: Record<number, number> = {
            60: 87,  // sin(60°) ≈ 0.866 → 87%
            90: 100, // sin(90°) = 1 → 100%
            120: 87  // sin(120°) ≈ 0.866 → 87%
          };
          
          return {
            question: `sin(${doubleAngle}°) = ? (%)`,
            answer: sinValues[doubleAngle] || 0
          };
        }
      },
      {
        generate: () => {
          // cos²(45°) = ?
          const angles = [0, 30, 45, 60, 90];
          const angle = randomChoice(angles);
          
          const cos2Values: Record<number, number> = {
            0: 100,   // cos²(0°) = 1 → 100%
            30: 75,   // cos²(30°) = 0.75 → 75%
            45: 50,   // cos²(45°) = 0.5 → 50%
            60: 25,   // cos²(60°) = 0.25 → 25%
            90: 0     // cos²(90°) = 0 → 0%
          };
          
          return {
            question: `cos²(${angle}°) = ? (%)`,
            answer: cos2Values[angle]
          };
        }
      },
      {
        generate: () => {
          // tan(α + β) where tan(α) and tan(β) are known
          const tanA = random(1, 3);
          const tanB = random(1, 2);
          // tan(α + β) = (tanα + tanβ)/(1 - tanα×tanβ)
          const numerator = tanA + tanB;
          const denominator = 1 - tanA * tanB;
          
          if (denominator !== 0) {
            const result = Math.round(numerator / denominator);
            return {
              question: `tan(α) = ${tanA}, tan(β) = ${tanB}, tan(α+β) = ?`,
              answer: result
            };
          } else {
            // Fallback
            return {
              question: `tan(45°) = ?`,
              answer: 1
            };
          }
        }
      },
      {
        generate: () => {
          // sec(θ) = 1/cos(θ)
          const angles = [0, 60];
          const angle = randomChoice(angles);
          
          const secValues: Record<number, number> = {
            0: 100,   // sec(0°) = 1 → 100%
            60: 200   // sec(60°) = 2 → 200%
          };
          
          return {
            question: `sec(${angle}°) = ? (× 100)`,
            answer: secValues[angle]
          };
        }
      },
      {
        generate: () => {
          // Pythagorean identity: sin²θ + cos²θ = 1
          const sin = random(3, 8) / 10; // 0.3 to 0.8
          const cos2 = 1 - sin * sin;
          const cos = Math.round(Math.sqrt(cos2) * 100);
          
          return {
            question: `sin(θ) = ${Math.round(sin * 100)}%, cos(θ) = ? (%)`,
            answer: cos
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

  private generateVectors(level: number, config: LevelConfig): Question {
    const vectorTypes = [
      {
        generate: () => {
          // Vector magnitude |v| = √(x² + y²)
          const x = random(3, 12);
          const y = random(4, 9);
          const magnitude = Math.round(Math.sqrt(x * x + y * y));
          return {
            question: `|⟨${x}, ${y}⟩| = ?`,
            answer: magnitude
          };
        }
      },
      {
        generate: () => {
          // Dot product a·b = a₁b₁ + a₂b₂
          const a1 = random(-5, 8);
          const a2 = random(-4, 6);
          const b1 = random(-3, 7);
          const b2 = random(-5, 5);
          const dotProduct = a1 * b1 + a2 * b2;
          return {
            question: `⟨${a1}, ${a2}⟩ · ⟨${b1}, ${b2}⟩ = ?`,
            answer: dotProduct
          };
        }
      },
      {
        generate: () => {
          // Vector addition
          const a1 = random(-8, 10);
          const a2 = random(-6, 8);
          const b1 = random(-5, 9);
          const b2 = random(-7, 6);
          const sum1 = a1 + b1;
          return {
            question: `⟨${a1}, ${a2}⟩ + ⟨${b1}, ${b2}⟩ = ⟨?, ...⟩`,
            answer: sum1
          };
        }
      },
      {
        generate: () => {
          // Scalar multiplication
          const scalar = random(2, 5);
          const v1 = random(-6, 8);
          const v2 = random(-4, 7);
          const result1 = scalar * v1;
          return {
            question: `${scalar}⟨${v1}, ${v2}⟩ = ⟨?, ...⟩`,
            answer: result1
          };
        }
      },
      {
        generate: () => {
          // Unit vector (direction only)
          const angle = randomChoice([0, 90, 180, 270]);
          const unitVectors: Record<number, { x: number, y: number }> = {
            0: { x: 100, y: 0 },    // (1, 0) → (100, 0)
            90: { x: 0, y: 100 },   // (0, 1) → (0, 100)
            180: { x: -100, y: 0 }, // (-1, 0) → (-100, 0)
            270: { x: 0, y: -100 }  // (0, -1) → (0, -100)
          };
          
          const result = unitVectors[angle].x;
          return {
            question: `û(${angle}°) = ⟨?, ...⟩ (× 100)`,
            answer: result
          };
        }
      }
    ];
    
    const vectorType = randomChoice(vectorTypes).generate();
    
    return this.createQuestion(
      vectorType.question,
      vectorType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(vectorType.answer, 4, Math.max(8, Math.abs(vectorType.answer)))
    );
  }
}