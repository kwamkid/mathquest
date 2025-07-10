// lib/game/config.ts
import { Grade, QuestionType } from '@/types';

// จำนวนข้อสอบตามระดับชั้น
export const QUESTION_COUNT: Record<string, number> = {
  // อนุบาล
  K1: 10,
  K2: 10,
  K3: 10,
  // ประถม 1-3
  P1: 20,
  P2: 20,
  P3: 20,
  // ประถม 4-6
  P4: 20,
  P5: 20,
  P6: 20,
  // มัธยม 1-6
  M1: 20,
  M2: 20,
  M3: 20,
  M4: 20,
  M5: 20,
  M6: 20,
};

// Get question count for grade
export const getQuestionCount = (grade: string): number => {
  return QUESTION_COUNT[grade] || 30;
};

// Level progression config
export interface LevelConfig {
  minLevel: number;
  maxLevel: number;
  description: string;
  questionTypes: QuestionType[];
  numberRange: {
    min: number;
    max: number;
  };
  features?: string[];
}

// Question difficulty config by grade
export const GRADE_CONFIGS: Record<string, LevelConfig[]> = {
  // อนุบาล 1
  K1: [
    {
      minLevel: 1,
      maxLevel: 30,
      description: 'นับเลข 1-5',
      questionTypes: [QuestionType.ADDITION],
      numberRange: { min: 1, max: 3 },
      features: ['countingObjects', 'visualAids']
    },
    {
      minLevel: 31,
      maxLevel: 60,
      description: 'บวกเลข 1-5',
      questionTypes: [QuestionType.ADDITION],
      numberRange: { min: 1, max: 5 }
    },
    {
      minLevel: 61,
      maxLevel: 100,
      description: 'บวกเลข 1-10',
      questionTypes: [QuestionType.ADDITION],
      numberRange: { min: 1, max: 10 }
    }
  ],

  // อนุบาล 2
  K2: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'บวกเลข 1-5',
      questionTypes: [QuestionType.ADDITION],
      numberRange: { min: 1, max: 5 }
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'บวกเลข 1-10',
      questionTypes: [QuestionType.ADDITION],
      numberRange: { min: 1, max: 10 }
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'ลบเลขง่ายๆ (ผลลัพธ์ไม่ติดลบ)',
      questionTypes: [QuestionType.SUBTRACTION],
      numberRange: { min: 1, max: 10 }
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'บวกลบผสม (ไม่เกิน 10)',
      questionTypes: [QuestionType.ADDITION, QuestionType.SUBTRACTION],
      numberRange: { min: 1, max: 10 }
    }
  ],

  // อนุบาล 3
  K3: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'บวกเลข 1-10',
      questionTypes: [QuestionType.ADDITION],
      numberRange: { min: 1, max: 10 }
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'ลบเลข (ไม่เกิน 10)',
      questionTypes: [QuestionType.SUBTRACTION],
      numberRange: { min: 1, max: 10 }
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'บวกเลขได้ผลลัพธ์เกิน 10',
      questionTypes: [QuestionType.ADDITION],
      numberRange: { min: 5, max: 10 }
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'บวกลบผสม (ผลลัพธ์ไม่เกิน 20)',
      questionTypes: [QuestionType.ADDITION, QuestionType.SUBTRACTION],
      numberRange: { min: 1, max: 15 }
    }
  ],

  // ประถม 1
  P1: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'บวกเลขหลักเดียว',
      questionTypes: [QuestionType.ADDITION],
      numberRange: { min: 1, max: 9 }
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'ลบเลขหลักเดียว',
      questionTypes: [QuestionType.SUBTRACTION],
      numberRange: { min: 1, max: 10 }
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'บวกเลข 2 หลักกับ 1 หลัก',
      questionTypes: [QuestionType.ADDITION],
      numberRange: { min: 10, max: 20 },
      features: ['twoDigitPlusOne']
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'บวกลบผสม (ไม่เกิน 20)',
      questionTypes: [QuestionType.ADDITION, QuestionType.SUBTRACTION],
      numberRange: { min: 1, max: 20 }
    }
  ],

  // ประถม 2
  P2: [
    {
      minLevel: 1,
      maxLevel: 20,
      description: 'บวกเลข 2 หลัก (ไม่ทด)',
      questionTypes: [QuestionType.ADDITION],
      numberRange: { min: 10, max: 40 },
      features: ['noCarrying']
    },
    {
      minLevel: 21,
      maxLevel: 40,
      description: 'ลบเลข 2 หลัก',
      questionTypes: [QuestionType.SUBTRACTION],
      numberRange: { min: 10, max: 50 }
    },
    {
      minLevel: 41,
      maxLevel: 60,
      description: 'สูตรคูณแม่ 2, 5, 10',
      questionTypes: [QuestionType.MULTIPLICATION],
      numberRange: { min: 1, max: 10 },
      features: ['multiplicationTables', 'tables_2_5_10']
    },
    {
      minLevel: 61,
      maxLevel: 80,
      description: 'สูตรคูณแม่ 3, 4',
      questionTypes: [QuestionType.MULTIPLICATION],
      numberRange: { min: 1, max: 10 },
      features: ['multiplicationTables', 'tables_3_4']
    },
    {
      minLevel: 81,
      maxLevel: 100,
      description: 'บวกลบเลข 2 หลัก (มีการทด)',
      questionTypes: [QuestionType.ADDITION, QuestionType.SUBTRACTION],
      numberRange: { min: 15, max: 70 },
      features: ['carrying', 'borrowing']
    }
  ],

  // ประถม 3
  P3: [
    {
      minLevel: 1,
      maxLevel: 20,
      description: 'บวกลบเลข 3 หลัก',
      questionTypes: [QuestionType.ADDITION, QuestionType.SUBTRACTION],
      numberRange: { min: 50, max: 300 }
    },
    {
      minLevel: 21,
      maxLevel: 40,
      description: 'สูตรคูณแม่ 2-5',
      questionTypes: [QuestionType.MULTIPLICATION],
      numberRange: { min: 1, max: 12 },
      features: ['multiplicationTables', 'tables_2_to_5']
    },
    {
      minLevel: 41,
      maxLevel: 60,
      description: 'สูตรคูณแม่ 6-9',
      questionTypes: [QuestionType.MULTIPLICATION],
      numberRange: { min: 1, max: 12 },
      features: ['multiplicationTables', 'tables_6_to_9']
    },
    {
      minLevel: 61,
      maxLevel: 80,
      description: 'หารเบื้องต้น',
      questionTypes: [QuestionType.DIVISION],
      numberRange: { min: 2, max: 10 },
      features: ['basicDivision']
    },
    {
      minLevel: 81,
      maxLevel: 100,
      description: 'โจทย์ปัญหาง่ายๆ',
      questionTypes: [QuestionType.WORD_PROBLEM],
      numberRange: { min: 5, max: 50 },
      features: ['simpleWordProblems']
    }
  ],

  // ประถม 4
  P4: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'คูณเลข 2 หลัก',
      questionTypes: [QuestionType.MULTIPLICATION],
      numberRange: { min: 10, max: 25 }
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'หารพื้นฐาน',
      questionTypes: [QuestionType.DIVISION],
      numberRange: { min: 2, max: 12 }
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'โจทย์ผสมมีวงเล็บ',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 5, max: 50 },
      features: ['parentheses', 'orderOfOperations']
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'โจทย์ปัญหา',
      questionTypes: [QuestionType.WORD_PROBLEM],
      numberRange: { min: 50, max: 500 }
    }
  ],

  // ประถม 5
  P5: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'คูณเลข 3 หลัก',
      questionTypes: [QuestionType.MULTIPLICATION],
      numberRange: { min: 100, max: 300 }
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'หารยาว',
      questionTypes: [QuestionType.DIVISION],
      numberRange: { min: 10, max: 50 }
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'เศษส่วนเบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 10 },
      features: ['fractions', 'simpleFractions']
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'โจทย์ปัญหาซับซ้อน',
      questionTypes: [QuestionType.WORD_PROBLEM],
      numberRange: { min: 100, max: 1000 },
      features: ['multiStepProblems']
    }
  ],

  // ประถม 6
  P6: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'การคำนวณเศษส่วน',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 20 },
      features: ['fractions', 'fractionOperations']
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'ทศนิยมเบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 100 },
      features: ['decimals', 'basicDecimals']
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'ร้อยละเบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 100 },
      features: ['percentages', 'basicPercentages']
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'โจทย์ปัญหาประยุกต์',
      questionTypes: [QuestionType.WORD_PROBLEM],
      numberRange: { min: 1, max: 1000 },
      features: ['realWorldProblems', 'multiConcepts']
    }
  ],

  // มัธยม 1 (existing)
  M1: [
    {
      minLevel: 1,
      maxLevel: 20,
      description: 'จำนวนเต็มบวกและลบ',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -100, max: 100 },
      features: ['integers', 'negativeNumbers']
    },
    {
      minLevel: 21,
      maxLevel: 40,
      description: 'เลขยกกำลัง',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 10 },
      features: ['exponents', 'basicPowers']
    },
    {
      minLevel: 41,
      maxLevel: 60,
      description: 'สมการเชิงเส้นตัวแปรเดียว',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 50 },
      features: ['algebra', 'linearEquations']
    },
    {
      minLevel: 61,
      maxLevel: 80,
      description: 'อัตราส่วนและสัดส่วน',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 100 },
      features: ['ratios', 'proportions']
    },
    {
      minLevel: 81,
      maxLevel: 100,
      description: 'โจทย์ปัญหาพีชคณิต',
      questionTypes: [QuestionType.WORD_PROBLEM],
      numberRange: { min: 1, max: 100 },
      features: ['algebraWordProblems']
    }
  ],

  // มัธยม 2
  M2: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'สมการเชิงเส้น 2 ตัวแปร',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -50, max: 50 },
      features: ['linearEquations', 'twoVariables']
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'ฟังก์ชันเชิงเส้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -20, max: 20 },
      features: ['linearFunctions']
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'ความน่าจะเป็นเบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 10 },
      features: ['probability', 'basicProbability']
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'สถิติเบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 100 },
      features: ['statistics', 'meanMedianMode']
    }
  ],

  // มัธยม 3
  M3: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'สมการกำลังสอง',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -10, max: 10 },
      features: ['quadraticEquations']
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'ฟังก์ชันกำลังสอง',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -15, max: 15 },
      features: ['quadraticFunctions']
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'เรขาคณิตเบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 50 },
      features: ['geometry', 'area', 'perimeter']
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'ตรีโกณมิติเบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 90 },
      features: ['trigonometry', 'basicTrig']
    }
  ],

  // มัธยม 4
  M4: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'ลอการิทึม',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 1, max: 100 },
      features: ['logarithms']
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'เมทริกซ์เบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -10, max: 10 },
      features: ['matrices']
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'ตรีโกณมิติขั้นสูง',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: 0, max: 360 },
      features: ['trigonometry', 'advancedTrig']
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'เวกเตอร์เบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -20, max: 20 },
      features: ['vectors']
    }
  ],

  // มัธยม 5
  M5: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'แคลคูลัสเบื้องต้น (ลิมิต)',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -10, max: 10 },
      features: ['calculus', 'limits']
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'อนุพันธ์',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -5, max: 5 },
      features: ['calculus', 'derivatives']
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'การประยุกต์อนุพันธ์',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -20, max: 20 },
      features: ['calculus', 'derivativeApplications']
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'ปริพันธ์เบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -10, max: 10 },
      features: ['calculus', 'integrals']
    }
  ],

  // มัธยม 6
  M6: [
    {
      minLevel: 1,
      maxLevel: 25,
      description: 'ปริพันธ์ขั้นสูง',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -15, max: 15 },
      features: ['calculus', 'advancedIntegrals']
    },
    {
      minLevel: 26,
      maxLevel: 50,
      description: 'การประยุกต์ปริพันธ์',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -25, max: 25 },
      features: ['calculus', 'integralApplications']
    },
    {
      minLevel: 51,
      maxLevel: 75,
      description: 'สมการเชิงอนุพันธ์เบื้องต้น',
      questionTypes: [QuestionType.MIXED],
      numberRange: { min: -10, max: 10 },
      features: ['calculus', 'differentialEquations']
    },
    {
      minLevel: 76,
      maxLevel: 100,
      description: 'โจทย์รวมคณิตศาสตร์',
      questionTypes: [QuestionType.MIXED, QuestionType.WORD_PROBLEM],
      numberRange: { min: -50, max: 50 },
      features: ['comprehensiveMath', 'examPrep']
    }
  ]
};

// Get level config for specific grade and level
export const getLevelConfig = (grade: string, level: number): LevelConfig | null => {
  const gradeConfigs = GRADE_CONFIGS[grade];
  if (!gradeConfigs) return null;
  
  return gradeConfigs.find(config => 
    level >= config.minLevel && level <= config.maxLevel
  ) || null;
};

// Score requirements for level progression
export const LEVEL_PROGRESSION = {
  DECREASE_THRESHOLD: 50,  // < 50% = ลดระดับ
  MAINTAIN_THRESHOLD: 80,  // 50-80% = คงระดับเดิม  
  INCREASE_THRESHOLD: 84,  // > 84% = เพิ่มระดับ
};

// Calculate level change based on score percentage
export const calculateLevelChange = (scorePercentage: number): 'decrease' | 'maintain' | 'increase' => {
  if (scorePercentage < LEVEL_PROGRESSION.DECREASE_THRESHOLD) {
    return 'decrease';
  } else if (scorePercentage > LEVEL_PROGRESSION.INCREASE_THRESHOLD) {
    return 'increase';
  }
  return 'maintain';
};