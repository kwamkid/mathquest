// lib/game/generators/elementary/p6.ts

import { Question, QuestionType } from '../../../../types';
import { LevelConfig } from '../../config';
import { BaseGenerator } from '../types';
import { 
  random, 
  generateChoices,
  randomChoice
} from '../utils';

export class P6Generator extends BaseGenerator {
  constructor() {
    super('P6');
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
      return this.generateGCF(level, config);
    } else if (level <= 30) {
      return this.generateLCM(level, config);
    } else if (level <= 40) {
      return this.generateAdvancedFractions(level, config);
    } else if (level <= 50) {
      return this.generateMixedFractionOperations(level, config);
    } else if (level <= 60) {
      return this.generateAdvancedDecimals(level, config);
    } else if (level <= 70) {
      return this.generateRatioAndProportion(level, config);
    } else if (level <= 80) {
      return this.generateAdvancedPercentage(level, config);
    } else if (level <= 85) {
      return this.generateCircleArea(level, config);
    } else if (level <= 90) {
      return this.generateCircleCircumference(level, config);
    } else if (level <= 95) {
      return this.generate3DGeometry(level, config);
    } else {
      return this.generateMixedProblems(level, config);
    }
  }

  // Level 1-15: ห.ร.ม.
  private generateGCF(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const pairs = [
          { a: 12, b: 18, gcf: 6 }, { a: 15, b: 25, gcf: 5 },
          { a: 24, b: 36, gcf: 12 }, { a: 20, b: 30, gcf: 10 },
          { a: 16, b: 24, gcf: 8 }, { a: 18, b: 27, gcf: 9 },
          { a: 14, b: 21, gcf: 7 }, { a: 35, b: 45, gcf: 5 }
        ];
        const pair = randomChoice(pairs);
        return { question: `ห.ร.ม. ของ ${pair.a} และ ${pair.b} = ?`, answer: pair.gcf };
      },
      () => {
        const sets = [
          { a: 12, b: 18, c: 24, gcf: 6 },
          { a: 15, b: 20, c: 25, gcf: 5 },
          { a: 16, b: 24, c: 32, gcf: 8 },
          { a: 9, b: 12, c: 15, gcf: 3 }
        ];
        const set = randomChoice(sets);
        return { question: `ห.ร.ม. ของ ${set.a}, ${set.b}, ${set.c} = ?`, answer: set.gcf };
      },
      () => {
        const gcf = randomChoice([2, 3, 4, 5, 6]);
        const multiplier = random(2, 6);
        const num = gcf * multiplier;
        const den = gcf * (multiplier + random(1, 4));
        return { question: `ลดรูป ${num}/${den} ตัวหาร = ?`, answer: gcf };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generateGCF:', type.answer);
      return this.createQuestion('ห.ร.ม. ของ 12 และ 18 = ?', 6, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, Math.floor(type.answer * 0.5)))
    );
  }

  // Level 16-30: ค.ร.น.
  private generateLCM(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const pairs = [
          { a: 3, b: 4, lcm: 12 }, { a: 4, b: 6, lcm: 12 },
          { a: 5, b: 6, lcm: 30 }, { a: 6, b: 8, lcm: 24 },
          { a: 7, b: 8, lcm: 56 }, { a: 8, b: 12, lcm: 24 },
          { a: 9, b: 12, lcm: 36 }, { a: 10, b: 15, lcm: 30 }
        ];
        const pair = randomChoice(pairs);
        return { question: `ค.ร.น. ของ ${pair.a} และ ${pair.b} = ?`, answer: pair.lcm };
      },
      () => {
        const sets = [
          { a: 2, b: 3, c: 4, lcm: 12 },
          { a: 3, b: 4, c: 6, lcm: 12 },
          { a: 4, b: 5, c: 10, lcm: 20 },
          { a: 2, b: 5, c: 6, lcm: 30 }
        ];
        const set = randomChoice(sets);
        return { question: `ค.ร.น. ของ ${set.a}, ${set.b}, ${set.c} = ?`, answer: set.lcm };
      },
      () => {
        const pairs = [
          { a: 6, b: 8, gcf: 2, lcm: 24 },
          { a: 12, b: 15, gcf: 3, lcm: 60 },
          { a: 10, b: 15, gcf: 5, lcm: 30 }
        ];
        const pair = randomChoice(pairs);
        return { question: `ห.ร.ม.=${pair.gcf}, ค.ร.น.=? ของ ${pair.a} และ ${pair.b}`, answer: pair.lcm };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generateLCM:', type.answer);
      return this.createQuestion('ค.ร.น. ของ 3 และ 4 = ?', 12, QuestionType.MIXED, level, [10, 11, 12, 13]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(5, Math.floor(type.answer * 0.3)))
    );
  }

  // Level 31-40: เศษส่วนและจำนวนคละ (ขั้นสูง)
  private generateAdvancedFractions(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const whole1 = random(2, 4);
        const num1 = random(1, 3);
        const den1 = randomChoice([4, 5]);
        const whole2 = random(1, 3);
        const num2 = random(1, 2);
        const den2 = randomChoice([3, 4]);
        
        const improper1 = whole1 * den1 + num1;
        const improper2 = whole2 * den2 + num2;
        const answerNum = improper1 * improper2;
        const answerDen = den1 * den2;
        
        // ✅ Division by zero protection
        if (answerDen === 0) {
          return { question: '2 1/4 × 1 1/3 = ? (ตอบจำนวนเต็ม)', answer: 3 };
        }
        
        const answer = Math.floor(answerNum / answerDen);
        return { question: `${whole1} ${num1}/${den1} × ${whole2} ${num2}/${den2} = ? (ตอบจำนวนเต็ม)`, answer };
      },
      () => {
        const whole = random(3, 6);
        const num = random(1, 3);
        const den = randomChoice([4, 5, 6]);
        const divisor = random(2, 4);
        
        const improper = whole * den + num;
        const answerNum = improper;
        const answerDen = den * divisor;
        
        // ✅ Division by zero protection
        if (answerDen === 0) {
          return { question: '4 1/5 ÷ 2 = ? (ตอบจำนวนเต็ม)', answer: 2 };
        }
        
        const answer = Math.floor(answerNum / answerDen);
        return { question: `${whole} ${num}/${den} ÷ ${divisor} = ? (ตอบจำนวนเต็ม)`, answer };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generateAdvancedFractions:', type.answer);
      return this.createQuestion('2 1/2 × 2 = ? (ตอบจำนวนเต็ม)', 5, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(3, type.answer))
    );
  }

  // Level 41-50: การบวก ลบ คูณ หารเศษส่วนระคน
  private generateMixedFractionOperations(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const den = randomChoice([4, 5, 6]);
        const a = random(1, den - 1);
        const b = random(1, den - 1);
        const c = random(2, 4);
        const answer = (a + b) * c;
        return { question: `(${a}/${den} + ${b}/${den}) × ${c} = ?/${den}`, answer };
      },
      () => {
        const num1 = random(2, 4);
        const den1 = random(3, 5);
        const num2 = random(1, 3);
        const den2 = random(2, 4);
        const num3 = random(1, 5);
        const den3 = randomChoice([2, 3, 4]);
        
        const prodNum = num1 * num2;
        const prodDen = den1 * den2;
        
        const lcm = this.lcm(prodDen, den3);
        
        // ✅ Validate LCM
        if (!Number.isFinite(lcm) || lcm === 0) {
          return { question: '1/2 × 1/3 + 1/4 = ?/12', answer: 5 };
        }
        
        const answer = (prodNum * lcm / prodDen) + (num3 * lcm / den3);
        return { question: `${num1}/${den1} × ${num2}/${den2} + ${num3}/${den3} = ?/${lcm}`, answer };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generateMixedFractionOperations:', type.answer);
      return this.createQuestion('(1/4 + 2/4) × 2 = ?/4', 6, QuestionType.MIXED, level, [4, 5, 6, 7]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(5, Math.floor(type.answer * 0.3)))
    );
  }

  // Level 51-60: ทศนิยมและการดำเนินการ
  private generateAdvancedDecimals(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const a = random(10, 50) / 10;
        const b = random(5, 20) / 10;
        const c = random(2, 5);
        const answer = Math.round((a + b) * c * 10);
        return { question: `(${a.toFixed(1)} + ${b.toFixed(1)}) × ${c} = ? (ตอบ × 10)`, answer };
      },
      () => {
        const fractions = [
          { num: 1, den: 8, dec: 125 },
          { num: 3, den: 8, dec: 375 },
          { num: 5, den: 8, dec: 625 },
          { num: 7, den: 8, dec: 875 }
        ];
        const frac = randomChoice(fractions);
        return { question: `${frac.num}/${frac.den} = 0.??? (ตอบ 3 หลักหลังจุด)`, answer: frac.dec };
      },
      () => {
        const nums = [
          random(100, 400) / 100,
          random(401, 700) / 100,
          random(701, 999) / 100
        ];
        const largest = Math.max(...nums);
        const answer = Math.round(largest * 100);
        return { question: `ค่ามากสุด: ${nums[0].toFixed(2)}, ${nums[1].toFixed(2)}, ${nums[2].toFixed(2)} = ? (× 100)`, answer };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generateAdvancedDecimals:', type.answer);
      return this.createQuestion('(2.5 + 1.5) × 2 = ? (ตอบ × 10)', 80, QuestionType.MIXED, level, [70, 80, 90, 100]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(20, Math.floor(type.answer * 0.1)))
    );
  }

  // Level 61-70: อัตราส่วนและสัดส่วน
  private generateRatioAndProportion(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const a = random(2, 8);
        const b = random(3, 9);
        const c = random(4, 12);
        
        // ✅ Division by zero protection
        if (a === 0) {
          return { question: '2:3 = 4:?', answer: 6 };
        }
        
        const d = Math.round((b * c) / a);
        return { question: `${a}:${b} = ${c}:?`, answer: d };
      },
      () => {
        const ratio1 = random(2, 5);
        const ratio2 = random(3, 6);
        const ratio3 = random(4, 7);
        const multiplier = random(2, 5);
        const total = (ratio1 + ratio2 + ratio3) * multiplier;
        const part1 = ratio1 * multiplier;
        return { question: `แบ่ง ${total} อัตรา ${ratio1}:${ratio2}:${ratio3} ส่วนแรก = ?`, answer: part1 };
      },
      () => {
        const a = random(3, 8);
        const b = random(4, 10);
        const product = a * b;
        const c = random(2, 6);
        
        // ✅ Division by zero protection
        if (c === 0) {
          return { question: 'ผกผัน: 3 ต่อ 4, ถ้า 2 แล้ว ?', answer: 6 };
        }
        
        const d = Math.round(product / c);
        return { question: `ผกผัน: ${a} ต่อ ${b}, ถ้า ${c} แล้ว ?`, answer: d };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generateRatioAndProportion:', type.answer);
      return this.createQuestion('2:3 = 4:?', 6, QuestionType.MIXED, level, [5, 6, 7, 8]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(5, Math.floor(type.answer * 0.3)))
    );
  }

  // Level 71-80: ร้อยละ (ขั้นสูง)
  private generateAdvancedPercentage(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const cost = randomChoice([100, 200, 500, 1000]);
        const profitPercent = randomChoice([10, 15, 20, 25]);
        const profit = (cost * profitPercent) / 100;
        const sellingPrice = cost + profit;
        return { question: `ทุน ${cost} กำไร ${profitPercent}% ขาย = ?`, answer: sellingPrice };
      },
      () => {
        const originalPrice = randomChoice([200, 500, 1000]);
        const discount = randomChoice([10, 20, 25, 30]);
        const discountAmount = (originalPrice * discount) / 100;
        const finalPrice = originalPrice - discountAmount;
        return { question: `ราคา ${originalPrice} ลด ${discount}% เหลือ = ?`, answer: finalPrice };
      },
      () => {
        const principal = randomChoice([1000, 2000, 5000]);
        const rate = randomChoice([5, 8, 10]);
        const time = randomChoice([1, 2, 3]);
        const interest = (principal * rate * time) / 100;
        return { question: `เงิน ${principal} ดอก ${rate}%/ปี ${time} ปี ดอก = ?`, answer: interest };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generateAdvancedPercentage:', type.answer);
      return this.createQuestion('ทุน 100 กำไร 10% ขาย = ?', 110, QuestionType.MIXED, level, [100, 110, 120, 130]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(50, Math.floor(type.answer * 0.1)))
    );
  }

  // Level 81-85: พื้นที่วงกลม
  private generateCircleArea(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const r = randomChoice([7, 14, 21]);
        const area = (22 * r * r) / 7;
        return { question: `วงกลม รัศมี ${r} พื้นที่ = ? (π = 22/7)`, answer: Math.round(area) };
      },
      () => {
        const r = random(5, 10);
        const area = 3.14 * r * r;
        return { question: `วงกลม รัศมี ${r} พื้นที่ = ? (π = 3.14)`, answer: Math.round(area) };
      },
      () => {
        const r = randomChoice([5, 10, 15]);
        const area = (22 * r * r) / 7;
        return { question: `วงกลม พื้นที่ ${Math.round(area)} รัศมี = ? (π = 22/7)`, answer: r };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generateCircleArea:', type.answer);
      return this.createQuestion('วงกลม รัศมี 7 พื้นที่ = ? (π = 22/7)', 154, QuestionType.MIXED, level, [140, 154, 160, 170]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(10, Math.floor(type.answer * 0.2)))
    );
  }

  // Level 86-90: เส้นรอบวงกลม
  private generateCircleCircumference(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const r = randomChoice([7, 14, 21]);
        const circumference = (2 * 22 * r) / 7;
        return { question: `วงกลม รัศมี ${r} เส้นรอบวง = ? (π = 22/7)`, answer: Math.round(circumference) };
      },
      () => {
        const d = randomChoice([14, 28, 42]);
        const circumference = (22 * d) / 7;
        return { question: `วงกลม เส้นผ่านศูนย์กลาง ${d} เส้นรอบวง = ? (π = 22/7)`, answer: Math.round(circumference) };
      },
      () => {
        const d = randomChoice([7, 14, 21]);
        const circumference = (22 * d) / 7;
        return { question: `วงกลม เส้นรอบวง ${Math.round(circumference)} เส้นผ่านศูนย์กลาง = ? (π = 22/7)`, answer: d };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generateCircleCircumference:', type.answer);
      return this.createQuestion('วงกลม รัศมี 7 เส้นรอบวง = ? (π = 22/7)', 44, QuestionType.MIXED, level, [40, 44, 48, 52]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(10, Math.floor(type.answer * 0.2)))
    );
  }

  // Level 91-95: รูปเรขาคณิต 3 มิติ
  private generate3DGeometry(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const base = random(5, 15);
        const height = random(4, 12);
        const prismHeight = random(6, 20);
        const volume = (base * height * prismHeight) / 2;
        return { question: `ปริซึมสามเหลี่ยม ฐาน ${base}×${height} สูง ${prismHeight} ปริมาตร = ?`, answer: volume };
      },
      () => {
        const side = random(4, 12);
        const surfaceArea = 6 * side * side;
        return { question: `ลูกบาศก์ ขอบ ${side} พื้นที่ผิวทั้งหมด = ?`, answer: surfaceArea };
      },
      () => {
        const r = randomChoice([3, 5, 7]);
        const h = random(5, 15);
        const volume = Math.round((22 * r * r * h) / 7);
        return { question: `ทรงกระบอก รัศมี ${r} สูง ${h} ปริมาตร = ? (π = 22/7)`, answer: volume };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generate3DGeometry:', type.answer);
      return this.createQuestion('ลูกบาศก์ ขอบ 5 พื้นที่ผิวทั้งหมด = ?', 150, QuestionType.MIXED, level, [120, 150, 180, 200]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(20, Math.floor(type.answer * 0.1)))
    );
  }

  // Level 96-100: โจทย์ผสมขั้นสูง
  private generateMixedProblems(level: number, config: LevelConfig): Question {
    const types = [
      () => {
        const a = randomChoice([12, 15, 18]);
        const b = randomChoice([20, 24, 30]);
        const gcf = this.gcd(a, b);
        
        // ✅ Division by zero protection
        if (gcf === 0) {
          return { question: 'ห.ร.ม.(12,18) + ค.ร.น.(12,18) = ?', answer: 42 };
        }
        
        const lcm = (a * b) / gcf;
        const answer = gcf + lcm;
        return { question: `ห.ร.ม.(${a},${b}) + ค.ร.น.(${a},${b}) = ?`, answer };
      },
      () => {
        const fraction = randomChoice([1/2, 1/4, 3/4]);
        const percent = randomChoice([20, 40, 60]);
        const base = randomChoice([100, 200, 400]);
        const answer = Math.round(fraction * percent * base / 100);
        const fracDisplay = fraction === 0.5 ? '1/2' : fraction === 0.25 ? '1/4' : '3/4';
        return { question: `${fracDisplay} × ${percent}% × ${base} = ?`, answer };
      },
      () => {
        const scale = randomChoice([2, 3, 4]);
        const smallArea = random(10, 30);
        const largeArea = smallArea * scale * scale;
        return { question: `รูปคล้าย อัตรา 1:${scale} พื้นที่เล็ก ${smallArea} พื้นที่ใหญ่ = ?`, answer: largeArea };
      },
      () => {
        const r = random(5, 15);
        const pi = 3.14;
        const circumference = Math.round(2 * pi * r);
        const area = Math.round(pi * r * r);
        const answer = circumference + area;
        return { question: `วงกลม r=${r} (π=3.14) เส้นรอบ + พื้นที่ = ?`, answer };
      }
    ];
    
    const type = randomChoice(types)();
    
    // ✅ Validate
    if (!Number.isFinite(type.answer)) {
      console.error('P6: Invalid answer in generateMixedProblems:', type.answer);
      return this.createQuestion('ห.ร.ม.(12,18) + ค.ร.น.(12,18) = ?', 42, QuestionType.MIXED, level, [36, 42, 48, 54]);
    }
    
    return this.createQuestion(
      type.question,
      type.answer,
      QuestionType.MIXED,
      level,
      generateChoices(type.answer, 4, Math.max(20, Math.floor(type.answer * 0.1)))
    );
  }

  private gcd(a: number, b: number): number {
    // ✅ Validate inputs
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return 1;
    }
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private lcm(a: number, b: number): number {
    // ✅ Validate inputs and prevent division by zero
    const gcdValue = this.gcd(a, b);
    if (!Number.isFinite(a) || !Number.isFinite(b) || gcdValue === 0) {
      return 1;
    }
    return (a * b) / gcdValue;
  }
}