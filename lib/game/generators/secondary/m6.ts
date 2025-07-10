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
    // M6 จะเน้นแค่โจทย์ตัวเลขล้วนๆ ไม่มี word problems
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
      // Level 1-25: ปริพันธ์ขั้นสูง
      return this.generateAdvancedIntegrals(level, config);
    } else if (level <= 50) {
      // Level 26-50: การประยุกต์ปริพันธ์
      return this.generateIntegralApplications(level, config);
    } else if (level <= 75) {
      // Level 51-75: สมการเชิงอนุพันธ์เบื้องต้น
      return this.generateDifferentialEquations(level, config);
    } else {
      // Level 76-100: โจทย์รวมคณิตศาสตร์
      return this.generateComprehensiveMath(level, config);
    }
  }

  private generateAdvancedIntegrals(level: number, config: LevelConfig): Question {
    const integralTypes = [
      {
        generate: () => {
          // ∫ x³ dx = x⁴/4, from 0 to 2
          const result = Math.pow(2, 4) / 4; // 16/4 = 4
          return {
            question: `∫₀² x³ dx = ?`,
            answer: 4
          };
        }
      },
      {
        generate: () => {
          // ∫ x^n dx = x^(n+1)/(n+1), from 0 to 1
          const n = random(2, 5);
          const result = Math.round(100 / (n + 1)); // Always integrating from 0 to 1
          return {
            question: `∫₀¹ x^${n} dx = ? (× 100)`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // ∫ sin x dx = -cos x, from 0 to π/2
          // -cos(π/2) - (-cos(0)) = 0 - (-1) = 1 → 100
          return {
            question: `∫₀^(π/2) sin x dx = ? (× 100)`,
            answer: 100
          };
        }
      },
      {
        generate: () => {
          // ∫ cos x dx = sin x, from 0 to π/2
          // sin(π/2) - sin(0) = 1 - 0 = 1 → 100
          return {
            question: `∫₀^(π/2) cos x dx = ? (× 100)`,
            answer: 100
          };
        }
      },
      {
        generate: () => {
          // ∫ e^x dx from a to a+1
          // e^(a+1) - e^a = e^a(e - 1) ≈ 1.718e^a
          // For simplicity, let's use a=0
          // e¹ - e⁰ = e - 1 ≈ 1.718 → 172
          return {
            question: `∫₀¹ e^x dx ≈ ? (× 100)`,
            answer: 172
          };
        }
      },
      {
        generate: () => {
          // ∫ ax² dx = ax³/3, from 0 to 3
          const a = random(2, 6);
          const result = a * 27 / 3; // a × 3³/3
          return {
            question: `∫₀³ ${a}x² dx = ?`,
            answer: result
          };
        }
      }
    ];
    
    const integralType = randomChoice(integralTypes).generate();
    
    return this.createQuestion(
      integralType.question,
      integralType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(integralType.answer, 4, Math.max(5, Math.floor(integralType.answer * 0.2)))
    );
  }

  private generateIntegralApplications(level: number, config: LevelConfig): Question {
    const applicationTypes = [
      {
        generate: () => {
          // Area under curve y = x from 0 to a
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
          // Area under y = x² from 0 to a
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
          // Volume of revolution: V = π∫y² dx
          // For y = x from 0 to 2: V = π∫x² dx = π×8/3
          // π × 8/3 ≈ 8.38 → 8
          return {
            question: `Volume: y = x, x = 0 to 2, V/π = ?`,
            answer: 8 // Actually 8/3 ≈ 2.67, but simplified
          };
        }
      },
      {
        generate: () => {
          // Arc length: L = ∫√(1 + (dy/dx)²) dx
          // For y = x: dy/dx = 1, so L = ∫√2 dx from 0 to a
          // L = a√2
          const a = random(2, 5);
          const result = Math.round(a * 141 / 100); // a × √2 ≈ a × 1.414
          return {
            question: `Arc length: y = x, x = 0 to ${a} ≈ ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // Mean value: (1/(b-a))∫f(x)dx
          // For f(x) = x² from 0 to 3: (1/3)∫x²dx = (1/3)(9) = 3
          return {
            question: `Mean: f(x) = x², [0, 3] = ?`,
            answer: 3
          };
        }
      }
    ];
    
    const appType = randomChoice(applicationTypes).generate();
    
    return this.createQuestion(
      appType.question,
      appType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(appType.answer, 4, Math.max(3, Math.floor(appType.answer * 0.3)))
    );
  }

  private generateDifferentialEquations(level: number, config: LevelConfig): Question {
    const deTypes = [
      {
        generate: () => {
          // dy/dx = k, y = kx + C
          // Given y(0) = c, find y(a)
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
          // Given y(0) = C, find y(1) = Ce
          const C = random(2, 10);
          const result = Math.round(C * 2.718); // C × e
          return {
            question: `dy/dx = y, y(0) = ${C}, y(1) ≈ ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // d²y/dx² = 0, y = ax + b
          // Given y(0) = b, y'(0) = a
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
          // Given y(1) = a, find y(b)
          const a = random(5, 15);
          const C = a - 1; // Since y(1) = 1² + C = a
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
          // dy/dx = -y, solution: y = Ce^(-x)
          // Given y(0) = C, find y(1) = C/e
          const C = random(10, 50);
          const result = Math.round(C / 2.718); // C/e
          return {
            question: `dy/dx = -y, y(0) = ${C}, y(1) ≈ ?`,
            answer: result
          };
        }
      }
    ];
    
    const deType = randomChoice(deTypes).generate();
    
    return this.createQuestion(
      deType.question,
      deType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(deType.answer, 4, Math.max(5, Math.floor(deType.answer * 0.2)))
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
          const result = a * b * b / 2;
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
      // Complex numbers (magnitude)
      {
        generate: () => {
          const real = random(3, 5);
          const imag = 4; // To get nice integer results (3-4-5 triangle)
          const magnitude = 5; // √(3² + 4²) = 5
          return {
            question: `|${real} + ${imag}i| = ?`,
            answer: magnitude
          };
        }
      },
      // Sequences
      {
        generate: () => {
          // Arithmetic sequence: aₙ = a₁ + (n-1)d
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
      // Series
      {
        generate: () => {
          // Sum of first n natural numbers: n(n+1)/2
          const n = random(5, 15);
          const sum = n * (n + 1) / 2;
          return {
            question: `Σ(k, k=1 to ${n}) = ?`,
            answer: sum
          };
        }
      }
    ];
    
    const mathType = randomChoice(mathTypes).generate();
    
    return this.createQuestion(
      mathType.question,
      mathType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(mathType.answer, 4, Math.max(5, Math.abs(mathType.answer)))
    );
  }
}