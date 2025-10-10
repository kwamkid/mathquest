// lib/game/generators/secondary/m5.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices, 
  randomChoice,
  randomFloat
} from '../utils';

export class M5Generator extends BaseGenerator {
  constructor() {
    super('M5');
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
      return this.generateLimits(level, config);
    } else if (level <= 50) {
      return this.generateDerivatives(level, config);
    } else if (level <= 75) {
      return this.generateDerivativeApplications(level, config);
    } else {
      return this.generateBasicIntegrals(level, config);
    }
  }

  private generateLimits(level: number, config: LevelConfig): Question {
    const limitTypes = [
      {
        generate: () => {
          // lim(x→a) c = c
          const c = random(5, 50);
          const a = random(1, 10);
          return {
            question: `lim(x→${a}) ${c} = ?`,
            answer: c
          };
        }
      },
      {
        generate: () => {
          // lim(x→a) x = a
          const a = random(2, 15);
          return {
            question: `lim(x→${a}) x = ?`,
            answer: a
          };
        }
      },
      {
        generate: () => {
          // lim(x→a) (x + b) = a + b
          const a = random(3, 12);
          const b = random(5, 20);
          const result = a + b;
          return {
            question: `lim(x→${a}) (x + ${b}) = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // lim(x→0) (sin x)/x = 1
          return {
            question: `lim(x→0) (sin x)/x = ? (× 100)`,
            answer: 100
          };
        }
      },
      {
        generate: () => {
          // lim(x→∞) 1/x = 0
          return {
            question: `lim(x→∞) 1/x = ?`,
            answer: 0
          };
        }
      },
      {
        generate: () => {
          // lim(x→a) x² = a²
          const a = random(2, 8);
          const result = a * a;
          return {
            question: `lim(x→${a}) x² = ?`,
            answer: result
          };
        }
      }
    ];
    
    const limitType = randomChoice(limitTypes).generate();
    
    // ✅ Validate answer
    if (!Number.isFinite(limitType.answer)) {
      console.error('Invalid answer in generateLimits:', limitType.answer);
      return this.createQuestion('lim(x→5) x = ?', 5, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      limitType.question,
      limitType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(limitType.answer, 4, Math.max(3, Math.floor(Math.abs(limitType.answer) * 0.3)))
    );
  }

  private generateDerivatives(level: number, config: LevelConfig): Question {
    const derivativeTypes = [
      {
        generate: () => {
          // d/dx(c) = 0
          const c = random(5, 50);
          return {
            question: `d/dx(${c}) = ?`,
            answer: 0
          };
        }
      },
      {
        generate: () => {
          // d/dx(x) = 1
          return {
            question: `d/dx(x) = ?`,
            answer: 1
          };
        }
      },
      {
        generate: () => {
          // d/dx(x^n) = nx^(n-1), at x=1
          const n = random(2, 5);
          return {
            question: `d/dx(x^${n})|ₓ₌₁ = ?`,
            answer: n
          };
        }
      },
      {
        generate: () => {
          // d/dx(ax) = a
          const a = random(3, 15);
          return {
            question: `d/dx(${a}x) = ?`,
            answer: a
          };
        }
      },
      {
        generate: () => {
          // d/dx(ax²) = 2ax, at x=1
          const a = random(2, 8);
          const result = 2 * a;
          return {
            question: `d/dx(${a}x²)|ₓ₌₁ = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // d/dx(sin x) at x=0 = cos(0) = 1
          return {
            question: `d/dx(sin x)|ₓ₌₀ = ? (× 100)`,
            answer: 100
          };
        }
      },
      {
        generate: () => {
          // d/dx(cos x) at x=0 = -sin(0) = 0
          return {
            question: `d/dx(cos x)|ₓ₌₀ = ?`,
            answer: 0
          };
        }
      },
      {
        generate: () => {
          // d/dx(e^x) at x=0 = e^0 = 1
          return {
            question: `d/dx(e^x)|ₓ₌₀ = ? (× 100)`,
            answer: 100
          };
        }
      }
    ];
    
    const derivType = randomChoice(derivativeTypes).generate();
    
    // ✅ Validate answer
    if (!Number.isFinite(derivType.answer)) {
      console.error('Invalid answer in generateDerivatives:', derivType.answer);
      return this.createQuestion('d/dx(5x) = ?', 5, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      derivType.question,
      derivType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(derivType.answer, 4, Math.max(2, Math.abs(derivType.answer)))
    );
  }

  private generateDerivativeApplications(level: number, config: LevelConfig): Question {
    const applicationTypes = [
      {
        generate: () => {
          // f'(x) = 0, critical point
          const a = random(2, 10);
          return {
            question: `f(x) = x² - ${2*a}x, f'(x) = 0, x = ?`,
            answer: a
          };
        }
      },
      {
        generate: () => {
          // Second derivative
          return {
            question: `f(x) = x² + 3x + 5, f''(x) = ?`,
            answer: 2
          };
        }
      },
      {
        generate: () => {
          // Rate of change
          const a = random(3, 8);
          const result = 2 * a;
          return {
            question: `s(t) = ${a}t², v(1) = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // Maximum of quadratic
          const b = random(4, 16);
          
          // ✅ ป้องกัน division by zero (แม้ว่าจะไม่น่าเกิด)
          if (b <= 0) {
            return {
              question: `f(x) = -x² + 8x, max at x = ?`,
              answer: 4
            };
          }
          
          const result = Math.floor(b / 2);
          return {
            question: `f(x) = -x² + ${b}x, max at x = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // Chain rule
          return {
            question: `d/dx((2x)²)|ₓ₌₁ = ?`,
            answer: 8
          };
        }
      },
      {
        generate: () => {
          // Product rule
          const a = random(3, 12);
          const result = 2 * a;
          return {
            question: `d/dx(x · x)|ₓ₌${a} = ?`,
            answer: result
          };
        }
      }
    ];
    
    const appType = randomChoice(applicationTypes).generate();
    
    // ✅ Validate answer
    if (!Number.isFinite(appType.answer)) {
      console.error('Invalid answer in generateDerivativeApplications:', appType.answer);
      return this.createQuestion('f(x) = x² + 3x + 5, f\'\'(x) = ?', 2, QuestionType.MIXED, level, [1, 2, 3, 4]);
    }
    
    return this.createQuestion(
      appType.question,
      appType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(appType.answer, 4, Math.max(3, Math.floor(Math.abs(appType.answer) * 0.3)))
    );
  }

  private generateBasicIntegrals(level: number, config: LevelConfig): Question {
    const integralTypes = [
      {
        generate: () => {
          // ∫ c dx = cx, from 0 to a
          const c = random(2, 10);
          const a = random(3, 8);
          const result = c * a;
          return {
            question: `∫₀^${a} ${c} dx = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // ∫ x dx = x²/2, from 0 to a
          const a = random(2, 6);
          const result = Math.floor(a * a / 2);
          return {
            question: `∫₀^${a} x dx = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // ∫ x² dx = x³/3, from 0 to 3
          return {
            question: `∫₀³ x² dx = ?`,
            answer: 9
          };
        }
      },
      {
        generate: () => {
          // ∫ 2x dx = x², from 0 to a
          const a = random(2, 5);
          const result = a * a;
          return {
            question: `∫₀^${a} 2x dx = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // ∫ ax dx = ax²/2, from 0 to 2
          const a = random(3, 8);
          
          // ✅ ป้องกัน division (แม้จะปลอดภัย)
          if (a <= 0) {
            return {
              question: `∫₀² 4x dx = ?`,
              answer: 8
            };
          }
          
          const result = Math.floor(a * 4 / 2);
          return {
            question: `∫₀² ${a}x dx = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // ∫ e^x dx, from 0 to ln(a)
          const a = random(5, 10);
          const result = a - 1;
          return {
            question: `∫₀^(ln ${a}) e^x dx = ?`,
            answer: result
          };
        }
      },
      {
        generate: () => {
          // ∫ 1/x dx = ln|x|, from 1 to e
          return {
            question: `∫₁^e (1/x) dx = ? (× 100)`,
            answer: 100
          };
        }
      }
    ];
    
    const integralType = randomChoice(integralTypes).generate();
    
    // ✅ Validate answer
    if (!Number.isFinite(integralType.answer)) {
      console.error('Invalid answer in generateBasicIntegrals:', integralType.answer);
      return this.createQuestion('∫₀³ x² dx = ?', 9, QuestionType.MIXED, level, [8, 9, 10, 11]);
    }
    
    return this.createQuestion(
      integralType.question,
      integralType.answer,
      QuestionType.MIXED,
      level,
      generateChoices(integralType.answer, 4, Math.max(3, Math.floor(Math.abs(integralType.answer) * 0.2)))
    );
  }
}