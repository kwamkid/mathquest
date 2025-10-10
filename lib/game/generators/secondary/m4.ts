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
    return this.generateMixed(level, config);
  }

  generateWordProblem(level: number, config: LevelConfig): Question {
    return this.generateMixed(level, config);
  }

  getAvailableQuestionTypes(level: number): QuestionType[] {
    return [QuestionType.MIXED];
  }

  private generateMixed(level: number, config: LevelConfig): Question {
    if (level <= 25) {
      return this.generateLogarithms(level, config);
    } else if (level <= 50) {
      return this.generateMatrices(level, config);
    } else if (level <= 75) {
      return this.generateAdvancedTrigonometry(level, config);
    } else {
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
          
          // ✅ ป้องกัน invalid log
          if (value <= 0 || base <= 0 || base === 1) {
            return { question: 'log₂(8) = ?', answer: 3 };
          }
          
          const answer = Math.log(value) / Math.log(base);
          
          // ✅ ตรวจสอบว่าได้จำนวนเต็ม
          if (!Number.isFinite(answer) || Math.abs(answer - Math.round(answer)) > 0.01) {
            return { question: 'log₂(8) = ?', answer: 3 };
          }
          
          return {
            question: `log₂(${value}) = ?`,
            answer: Math.round(answer)
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
    
    // ✅ Validate answer
    if (!Number.isFinite(logType.answer)) {
      console.error('Invalid answer in generateLogarithms:', logType.answer);
      return this.createQuestion('log₂(8) = ?', 3, QuestionType.MIXED, level, [2, 3, 4, 5]);
    }
    
    const answer = Math.round(logType.answer);
    
    return this.createQuestion(
      logType.question,
      answer,
      QuestionType.MIXED,
      level,
      generateChoices(answer, 4, Math.max(2, Math.floor(Math.abs(answer) * 0.5)))
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
    
    // ✅ Validate answer
    if (!Number.isFinite(matrixType.answer)) {
      console.error('Invalid answer in generateMatrices:', matrixType.answer);
      return this.createQuestion('[2 3] + [4 5] = [? ...]', 6, QuestionType.MIXED, level, [5, 6, 7, 8]);
    }
    
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
          
          const sinValues: Record<number, number> = {
            60: 87,
            90: 100,
            120: 87
          };
          
          return {
            question: `sin(${doubleAngle}°) = ? (%)`,
            answer: sinValues[doubleAngle] || 50
          };
        }
      },
      {
        generate: () => {
          // cos²(45°) = ?
          const angles = [0, 30, 45, 60, 90];
          const angle = randomChoice(angles);
          
          const cos2Values: Record<number, number> = {
            0: 100,
            30: 75,
            45: 50,
            60: 25,
            90: 0
          };
          
          return {
            question: `cos²(${angle}°) = ? (%)`,
            answer: cos2Values[angle]
          };
        }
      },
      {
        generate: () => {
          // tan(α + β)
          const tanA = random(1, 3);
          const tanB = random(1, 2);
          
          const numerator = tanA + tanB;
          const denominator = 1 - tanA * tanB;
          
          // ✅ ป้องกัน division by zero
          if (denominator === 0 || Math.abs(denominator) < 0.1) {
            return {
              question: `tan(45°) = ?`,
              answer: 1
            };
          }
          
          const result = numerator / denominator;
          
          // ✅ ตรวจสอบว่าได้จำนวนที่สมเหตุสมผล
          if (!Number.isFinite(result) || Math.abs(result) > 100) {
            return {
              question: `tan(45°) = ?`,
              answer: 1
            };
          }
          
          return {
            question: `tan(α) = ${tanA}, tan(β) = ${tanB}, tan(α+β) = ?`,
            answer: Math.round(result)
          };
        }
      },
      {
        generate: () => {
          // sec(θ) = 1/cos(θ)
          const angles = [0, 60];
          const angle = randomChoice(angles);
          
          const secValues: Record<number, number> = {
            0: 100,
            60: 200
          };
          
          return {
            question: `sec(${angle}°) = ? (× 100)`,
            answer: secValues[angle]
          };
        }
      },
      {
        generate: () => {
          // Pythagorean identity
          const sin = random(3, 8) / 10;
          const cos2 = 1 - sin * sin;
          
          // ✅ ป้องกัน sqrt ของจำนวนลบ
          if (cos2 < 0) {
            return {
              question: `sin(θ) = 60%, cos(θ) = ? (%)`,
              answer: 80
            };
          }
          
          const cos = Math.round(Math.sqrt(cos2) * 100);
          
          // ✅ Validate
          if (!Number.isFinite(cos) || cos < 0 || cos > 100) {
            return {
              question: `sin(θ) = 60%, cos(θ) = ? (%)`,
              answer: 80
            };
          }
          
          return {
            question: `sin(θ) = ${Math.round(sin * 100)}%, cos(θ) = ? (%)`,
            answer: cos
          };
        }
      }
    ];
    
    const trigType = randomChoice(trigTypes).generate();
    
    // ✅ Validate answer
    if (!Number.isFinite(trigType.answer)) {
      console.error('Invalid answer in generateAdvancedTrigonometry:', trigType.answer);
      return this.createQuestion('sin(90°) = ? (%)', 100, QuestionType.MIXED, level, [87, 90, 93, 100]);
    }
    
    return this.createQuestion(
      trigType.question,
      trigType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(trigType.answer, 4, Math.max(10, Math.floor(Math.abs(trigType.answer) * 0.2)))
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
          
          // ✅ Validate
          if (!Number.isFinite(magnitude) || magnitude <= 0) {
            return {
              question: `|⟨3, 4⟩| = ?`,
              answer: 5
            };
          }
          
          return {
            question: `|⟨${x}, ${y}⟩| = ?`,
            answer: magnitude
          };
        }
      },
      {
        generate: () => {
          // Dot product
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
          // Unit vector
          const angle = randomChoice([0, 90, 180, 270]);
          const unitVectors: Record<number, { x: number, y: number }> = {
            0: { x: 100, y: 0 },
            90: { x: 0, y: 100 },
            180: { x: -100, y: 0 },
            270: { x: 0, y: -100 }
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
    
    // ✅ Validate answer
    if (!Number.isFinite(vectorType.answer)) {
      console.error('Invalid answer in generateVectors:', vectorType.answer);
      return this.createQuestion('⟨3, 4⟩ · ⟨2, 1⟩ = ?', 10, QuestionType.MIXED, level, [8, 9, 10, 11]);
    }
    
    return this.createQuestion(
      vectorType.question,
      vectorType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(vectorType.answer, 4, Math.max(8, Math.abs(vectorType.answer)))
    );
  }
}