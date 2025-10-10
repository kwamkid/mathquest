// lib/game/generators/secondary/m6.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice,
  randomFloat
} from '../utils';

export class M6Generator extends BaseGenerator {
  constructor() {
    super('M6');
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
      return this.generateAdvancedIntegrals(level, config);
    } else if (level <= 50) {
      return this.generateIntegralApplications(level, config);
    } else if (level <= 75) {
      return this.generateDifferentialEquations(level, config);
    } else {
      return this.generateComprehensiveMath(level, config);
    }
  }

  private generateAdvancedIntegrals(level: number, config: LevelConfig): Question {
    const integralTypes = [
      {
        generate: () => {
          // ∫ x³ dx = x⁴/4, from 0 to 2
          const result = Math.pow(2, 4) / 4;
          return {
            question: `∫₀² x³ dx = ?`,
            answer: 4
          };
        }
      },
      {
        generate: () => {
          // ∫ x^n dx, from 0 to 1
          const n = random(2, 5);
          
          // ✅ ป้องกัน division by zero
          if (n + 1 === 0) {
            return {
              question: `∫₀¹ x² dx = ? (× 100)`,
              answer: 33
            };
          }
          
          const result = Math.round(100 / (n + 1));
          return {
            question: `∫₀¹ x^${n} dx = ? (× 100)`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // ∫ sin x dx, from 0 to π/2
          return {
            question: `∫₀^(π/2) sin x dx = ? (× 100)`,
            answer: 100
          };
        }
      },
      {
        generate: () => {
          // ∫ cos x dx, from 0 to π/2
          return {
            question: `∫₀^(π/2) cos x dx = ? (× 100)`,
            answer: 100
          };
        }
      },
      {
        generate: () => {
          // ∫ e^x dx from 0 to 1
          return {
            question: `∫₀¹ e^x dx ≈ ? (× 100)`,
            answer: 172
          };
        }
      },
      {
        generate: () => {
          // ∫ ax² dx, from 0 to 3
          const a = random(2, 6);
          
          // ✅ ป้องกัน division
          if (a <= 0) {
            return {
              question: `∫₀³ 3x² dx = ?`,
              answer: 27
            };
          }
          
          const result = Math.floor(a * 27 / 3);
          return {
            question: `∫₀³ ${a}x² dx = ?`,
            answer: result
          };
        }
      }
    ];
    
    const integralType = randomChoice(integralTypes).generate();
    
    // ✅ Validate answer
    if (!Number.isFinite(integralType.answer)) {
      console.error('Invalid answer in generateAdvancedIntegrals:', integralType.answer);
      return this.createQuestion('∫₀² x³ dx = ?', 4, QuestionType.MIXED, level, [3, 4, 5, 6]);
    }
    
    return this.createQuestion(
      integralType.question,
      integralType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(integralType.answer, 4, Math.max(5, Math.floor(Math.abs(integralType.answer) * 0.2)))
    );
  }

  private generateIntegralApplications(level: number, config: LevelConfig): Question {
    const applicationTypes = [
      {
        generate: () => {
          // Area under y = x
          const a = random(3, 8);
          const area = Math.floor(a * a / 2);
          return {
            question: `Area: y = x, x = 0 to ${a} = ?`,
            answer: area
          };
        }
      },
      {
        generate: () => {
          // Area under y = x²
          const a = random(2, 5);
          const area = Math.floor(Math.pow(a, 3) / 3);
          return {
            question: `Area: y = x², x = 0 to ${a} = ?`,
            answer: area
          };
        }
      },
      {
        generate: () => {
          // Volume of revolution
          return {
            question: `Volume: y = x, x = 0 to 2, V/π = ?`,
            answer: 8
          };
        }
      },
      {
        generate: () => {
          // Arc length
          const a = random(2, 5);
          const result = Math.round(a * 141 / 100);
          return {
            question: `Arc length: y = x, x = 0 to ${a} ≈ ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // Mean value
          return {
            question: `Mean: f(x) = x², [0, 3] = ?`,
            answer: 3
          };
        }
      }
    ];
    
    const appType = randomChoice(applicationTypes).generate();
    
    // ✅ Validate answer
    if (!Number.isFinite(appType.answer)) {
      console.error('Invalid answer in generateIntegralApplications:', appType.answer);
      return this.createQuestion('Area: y = x, x = 0 to 4 = ?', 8, QuestionType.MIXED, level, [7, 8, 9, 10]);
    }
    
    return this.createQuestion(
      appType.question,
      appType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(appType.answer, 4, Math.max(3, Math.floor(Math.abs(appType.answer) * 0.3)))
    );
  }

  private generateDifferentialEquations(level: number, config: LevelConfig): Question {
    const deTypes = [
      {
        generate: () => {
          // dy/dx = k
          const k = random(2, 8);
          const c = random(5, 15);
          const a = random(2, 5);
          const result = k * a + c;
          return {
            question: `dy/dx = ${k}, y(0) = ${c}, y(${a}) = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // dy/dx = y, solution: y = Ce^x
          const C = random(2, 10);
          const result = Math.round(C * 2.718);
          return {
            question: `dy/dx = y, y(0) = ${C}, y(1) ≈ ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // d²y/dx² = 0
          const a = random(3, 12);
          const b = random(5, 20);
          const x = random(2, 5);
          const result = a * x + b;
          return {
            question: `y'' = 0, y(0) = ${b}, y'(0) = ${a}, y(${x}) = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // dy/dx = 2x, y = x² + C
          const a = random(5, 15);
          const C = a - 1;
          const b = random(2, 5);
          const result = b * b + C;
          return {
            question: `dy/dx = 2x, y(1) = ${a}, y(${b}) = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // dy/dx = -y
          const C = random(10, 50);
          
          // ✅ ป้องกัน division
          if (C <= 0) {
            return {
              question: `dy/dx = -y, y(0) = 27, y(1) ≈ ?`,
              answer: 10
            };
          }
          
          const result = Math.round(C / 2.718);
          return {
            question: `dy/dx = -y, y(0) = ${C}, y(1) ≈ ?`,
            answer: result
          };
        }
      }
    ];
    
    const deType = randomChoice(deTypes).generate();
    
    // ✅ Validate answer
    if (!Number.isFinite(deType.answer)) {
      console.error('Invalid answer in generateDifferentialEquations:', deType.answer);
      return this.createQuestion('dy/dx = 3, y(0) = 5, y(2) = ?', 11, QuestionType.MIXED, level, [10, 11, 12, 13]);
    }
    
    return this.createQuestion(
      deType.question,
      deType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(deType.answer, 4, Math.max(5, Math.floor(Math.abs(deType.answer) * 0.2)))
    );
  }

  private generateComprehensiveMath(level: number, config: LevelConfig): Question {
    const mathTypes = [
      // Calculus review
      {
        generate: () => {
          const a = random(2, 8);
          const n = random(2, 4);
          const result = n * Math.pow(a, n - 1);
          
          // ✅ Validate power result
          if (!Number.isFinite(result) || result > 10000) {
            return {
              question: `d/dx(x²)|ₓ₌₃ = ?`,
              answer: 6
            };
          }
          
          return {
            question: `d/dx(x^${n})|ₓ₌${a} = ?`,
            answer: result
          };
        }
      },
      // Integration review
      {
        generate: () => {
          const a = random(3, 10);
          const b = random(1, 5);
          const result = Math.floor(a * b * b / 2);
          return {
            question: `∫₀^${b} ${a}x dx = ?`,
            answer: result
          };
        }
      },
      // Trigonometry review
      {
        generate: () => {
          const values = [
            { angle: 0, sin: 0, cos: 100 },
            { angle: 30, sin: 50, cos: 87 },
            { angle: 45, sin: 71, cos: 71 },
            { angle: 60, sin: 87, cos: 50 },
            { angle: 90, sin: 100, cos: 0 }
          ];
          const v = randomChoice(values);
          const func = randomChoice(['sin', 'cos']);
          return {
            question: `${func}(${v.angle}°) = ? (%)`,
            answer: func === 'sin' ? v.sin : v.cos
          };
        }
      },
      // Logarithm review
      {
        generate: () => {
          const base = randomChoice([2, 3, 10]);
          const power = random(1, 4);
          const value = Math.pow(base, power);
          return {
            question: `log${base}(${value}) = ?`,
            answer: power
          };
        }
      },
      // Matrix determinant
      {
        generate: () => {
          const a = random(2, 8);
          const b = random(1, 6);
          const c = random(1, 7);
          const d = random(3, 9);
          const det = a * d - b * c;
          return {
            question: `|${a} ${b}; ${c} ${d}| = ?`,
            answer: det
          };
        }
      },
      // Complex numbers
      {
        generate: () => {
          const real = 3;
          const imag = 4;
          const magnitude = 5;
          return {
            question: `|${real} + ${imag}i| = ?`,
            answer: magnitude
          };
        }
      },
      // Arithmetic sequence
      {
        generate: () => {
          const a1 = random(2, 10);
          const d = random(2, 5);
          const n = random(5, 10);
          const result = a1 + (n - 1) * d;
          return {
            question: `Seq: a₁=${a1}, d=${d}, a${n} = ?`,
            answer: result
          };
        }
      },
      // Series sum
      {
        generate: () => {
          const n = random(5, 15);
          const sum = Math.floor(n * (n + 1) / 2);
          return {
            question: `Σ(k, k=1 to ${n}) = ?`,
            answer: sum
          };
        }
      }
    ];
    
    const mathType = randomChoice(mathTypes).generate();
    
    // ✅ Validate answer
    if (!Number.isFinite(mathType.answer)) {
      console.error('Invalid answer in generateComprehensiveMath:', mathType.answer);
      return this.createQuestion('sin(45°) = ? (%)', 71, QuestionType.MIXED, level, [69, 70, 71, 72]);
    }
    
    return this.createQuestion(
      mathType.question,
      mathType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(mathType.answer, 4, Math.max(5, Math.abs(mathType.answer)))
    );
  }
}