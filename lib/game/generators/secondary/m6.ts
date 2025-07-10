// lib/game/generators/secondary/m6.ts
import { Question, QuestionType } from '@/types';
import { LevelConfig } from '@/lib/game/config';
import { random, createQuestion } from '../utils';

export const generateM6Question = (config: LevelConfig, level: number): Question => {
  const { min, max } = config.numberRange;
  
  // Level 1-25: ปริพันธ์ขั้นสูง
  if (level <= 25) {
    const a = random(1, 4);
    const power = random(2, 4);
    
    // ∫ax^n dx = ax^(n+1)/(n+1) + C, evaluate from 0 to 2
    const newPower = power + 1;
    const result = a * Math.pow(2, newPower) / newPower;
    const answer = Math.round(result * 10) / 10; // Round to 1 decimal
    
    return createQuestion(
      `∫₀² ${a}x^${power} dx = ? (ทศนิยม 1 ตำแหน่ง แล้วคูณ 10)`,
      Math.round(answer * 10),
      QuestionType.MIXED,
      level
    );
  }
  
  // Level 26-50: การประยุกต์ปริพันธ์
  if (level <= 50) {
    const a = random(2, 6);
    const b = random(1, 5);
    
    // Area under curve y = ax + b from 0 to 2
    const area = a * 4 / 2 + b * 2; // ∫(ax + b)dx from 0 to 2
    
    return createQuestion(
      `หาพื้นที่ใต้กราฟ y = ${a}x + ${b} จาก x = 0 ถึง x = 2`,
      area,
      QuestionType.MIXED,
      level
    );
  }
  
  // Level 51-75: สมการเชิงอนุพันธ์เบื้องต้น
  if (level <= 75) {
    const a = random(1, 5);
    const c = random(5, 15);
    
    // dy/dx = a, y = ax + c at x = 0, find y at x = 3
    const answer = a * 3 + c;
    
    return createQuestion(
      `ถ้า dy/dx = ${a} และ y(0) = ${c} หา y(3)`,
      answer,
      QuestionType.MIXED,
      level
    );
  }
  
  // Level 76-100: โจทย์รวมคณิตศาสตร์
  const problemTypes = [
    // Calculus
    () => {
      const coeff = random(2, 5);
      const power = random(2, 3);
      const answer = power * coeff; // derivative at x=1
      return {
        question: `หาอนุพันธ์ของ ${coeff}x^${power} เมื่อ x = 1`,
        answer
      };
    },
    // Algebra
    () => {
      const a = random(2, 8);
      const b = random(10, 30);
      const answer = Math.floor(b / a);
      return {
        question: `แก้สมการ ${a}x = ${b} (ปัดลง)`,
        answer
      };
    },
    // Trigonometry
    () => {
      const angles = [0, 30, 45, 60, 90];
      const angle = angles[random(0, angles.length - 1)];
      const sinValues: Record<number, number> = { 0: 0, 30: 50, 45: 71, 60: 87, 90: 100 };
      return {
        question: `sin(${angle}°) = ? (เป็น % ปัดเป็นจำนวนเต็ม)`,
        answer: sinValues[angle]
      };
    },
    // Integration
    () => {
      const a = random(1, 3);
      const answer = a * 2; // ∫ax dx from 0 to 2 = a*2²/2 = 2a
      return {
        question: `∫₀² ${a}x dx = ?`,
        answer
      };
    }
  ];
  
  const problem = problemTypes[random(0, problemTypes.length - 1)]();
  
  return createQuestion(
    problem.question,
    problem.answer,
    QuestionType.MIXED,
    level
  );
};
