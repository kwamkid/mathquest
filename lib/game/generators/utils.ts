// lib/game/generators/utils.ts

/**
 * สุ่มตัวเลขระหว่าง min ถึง max (รวม min และ max)
 */
export const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * สุ่มตัวเลขทศนิยม
 */
export const randomFloat = (min: number, max: number, decimals: number = 2): number => {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * สุ่มเลือกจาก array
 */
export const randomChoice = <T>(array: T[]): T => {
  return array[random(0, array.length - 1)];
};

/**
 * สุ่มหลายตัวจาก array (ไม่ซ้ำ)
 */
export const randomChoices = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};

/**
 * สร้างตัวเลือกสำหรับโจทย์ปรนัย
 */
export const generateChoices = (
  correctAnswer: number,
  count: number = 4,
  range: number = 10
): number[] => {
  const choices = new Set<number>();
  choices.add(correctAnswer);
  
  // สร้างตัวเลือกผิด
  while (choices.size < count) {
    const offset = random(-range, range);
    const wrongAnswer = correctAnswer + offset;
    
    // หลีกเลี่ยงคำตอบที่เป็นลบหรือ 0 (ถ้าไม่เหมาะสม)
    if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
      choices.add(wrongAnswer);
    }
  }
  
  // สุ่มลำดับ
  return Array.from(choices).sort(() => 0.5 - Math.random());
};

/**
 * สร้างตัวเลือกสำหรับเศษส่วน
 */
export const generateFractionChoices = (
  numerator: number,
  denominator: number,
  count: number = 4
): string[] => {
  const correctAnswer = `${numerator}/${denominator}`;
  const choices = new Set<string>();
  choices.add(correctAnswer);
  
  while (choices.size < count) {
    const wrongNum = numerator + random(-3, 3);
    const wrongDen = denominator + random(-2, 2);
    
    if (wrongNum > 0 && wrongDen > 0) {
      choices.add(`${wrongNum}/${wrongDen}`);
    }
  }
  
  return Array.from(choices).sort(() => 0.5 - Math.random());
};

/**
 * ลดรูปเศษส่วน
 */
export const simplifyFraction = (numerator: number, denominator: number): [number, number] => {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(numerator, denominator);
  return [numerator / divisor, denominator / divisor];
};

/**
 * แปลงเศษส่วนเป็นทศนิยม
 */
export const fractionToDecimal = (numerator: number, denominator: number, decimals: number = 2): number => {
  return Math.round((numerator / denominator) * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * ตรวจสอบว่าเป็นจำนวนเต็มหรือไม่
 */
export const isInteger = (value: number): boolean => {
  return Number.isInteger(value);
};

/**
 * สร้างตัวเลขที่หารลงตัว
 */
export const generateDivisibleNumbers = (divisor: number, min: number = 1, max: number = 100): number => {
  const quotient = random(Math.ceil(min / divisor), Math.floor(max / divisor));
  return quotient * divisor;
};

/**
 * หาตัวประกอบของตัวเลข
 */
export const getFactors = (n: number): number[] => {
  const factors: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) {
      factors.push(i);
    }
  }
  return factors;
};

/**
 * ตรวจสอบจำนวนเฉพาะ
 */
export const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};

/**
 * สร้างสีสำหรับโจทย์
 */
export const getRandomColor = (): string => {
  const colors = ['แดง', 'น้ำเงิน', 'เหลือง', 'เขียว', 'ส้ม', 'ม่วง', 'ชมพู', 'ดำ', 'ขาว', 'น้ำตาล'];
  return randomChoice(colors);
};

/**
 * สร้างชื่อผลไม้สำหรับโจทย์
 */
export const getRandomFruit = (): string => {
  const fruits = ['แอปเปิ้ล', 'กล้วย', 'ส้ม', 'องุ่น', 'สตรอเบอร์รี่', 'มะม่วง', 'สับปะรด', 'แตงโม', 'ลิ้นจี่', 'ลองกอง'];
  return randomChoice(fruits);
};

/**
 * สร้างชื่อสัตว์สำหรับโจทย์
 */
export const getRandomAnimal = (): string => {
  const animals = ['แมว', 'หมา', 'นกฟูก', 'เป็ด', 'ไก่', 'หมู', 'วัว', 'ช้าง', 'ลิง', 'กบ'];
  return randomChoice(animals);
};

/**
 * สร้างชื่อของเล่นสำหรับโจทย์
 */
export const getRandomToy = (): string => {
  const toys = ['ตุ๊กตา', 'ลูกบอล', 'รถของเล่น', 'หุ่นยนต์', 'เลโก้', 'ตัวต่อ', 'ไดโนเสาร์', 'หมี', 'กิตาร์', 'กลอง'];
  return randomChoice(toys);
};

/**
 * สร้างชื่อคนสำหรับโจทย์คำปัญหา
 */
export const getRandomName = (): string => {
  const names = ['น้องอานิ', 'น้องบีม', 'น้องแคท', 'น้องเดฟ', 'น้องเอ็มม่า', 'น้องฟิลม์', 'น้องก้อง', 'น้องหนิง', 'น้องไอซ์', 'น้องเจน'];
  return randomChoice(names);
};

/**
 * แปลงตัวเลขเป็นข้อความไทย (1-20)
 */
export const numberToThai = (n: number): string => {
  const thaiNumbers = [
    '', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า', 'สิบ',
    'สิบเอ็ด', 'สิบสอง', 'สิบสาม', 'สิบสี่', 'สิบห้า', 'สิบหก', 'สิบเจ็ด', 'สิบแปด', 'สิบเก้า', 'ยี่สิบ'
  ];
  
  if (n >= 0 && n < thaiNumbers.length) {
    return thaiNumbers[n];
  }
  
  return n.toString();
};

/**
 * สร้าง HTML สำหรับเศษส่วน
 */
export const formatFraction = (numerator: number, denominator: number): string => {
  return `${numerator}/${denominator}`;
};

/**
 * ตรวจสอบความยากง่ายของโจทย์
 */
export const calculateDifficulty = (
  numberRange: { min: number; max: number },
  operations: string[],
  level: number
): number => {
  const rangeSize = numberRange.max - numberRange.min;
  const operationComplexity = operations.length;
  const levelFactor = level / 100;
  
  return Math.min(10, Math.round((rangeSize / 10) + operationComplexity + (levelFactor * 5)));
};