// lib/game/gradeProgression.ts

/**
 * Helper functions for grade progression
 */

import { Grade } from '@/types';

// Grade order
const GRADE_ORDER: Grade[] = [
  Grade.K1, Grade.K2, Grade.K3,
  Grade.P1, Grade.P2, Grade.P3, Grade.P4, Grade.P5, Grade.P6,
  Grade.M1, Grade.M2, Grade.M3, Grade.M4, Grade.M5, Grade.M6
];

// Grade display names
export const GRADE_DISPLAY_NAMES: Record<Grade, string> = {
  [Grade.K1]: 'อนุบาล 1',
  [Grade.K2]: 'อนุบาล 2',
  [Grade.K3]: 'อนุบาล 3',
  [Grade.P1]: 'ประถม 1',
  [Grade.P2]: 'ประถม 2',
  [Grade.P3]: 'ประถม 3',
  [Grade.P4]: 'ประถม 4',
  [Grade.P5]: 'ประถม 5',
  [Grade.P6]: 'ประถม 6',
  [Grade.M1]: 'มัธยม 1',
  [Grade.M2]: 'มัธยม 2',
  [Grade.M3]: 'มัธยม 3',
  [Grade.M4]: 'มัธยม 4',
  [Grade.M5]: 'มัธยม 5',
  [Grade.M6]: 'มัธยม 6'
};

/**
 * Get next grade
 */
export const getNextGrade = (currentGrade: string): Grade | null => {
  const currentIndex = GRADE_ORDER.findIndex(g => g === currentGrade);
  
  if (currentIndex === -1) {
    console.error('Invalid grade:', currentGrade);
    return null;
  }
  
  // Check if already at max grade
  if (currentIndex === GRADE_ORDER.length - 1) {
    return null; // Already at M6
  }
  
  return GRADE_ORDER[currentIndex + 1];
};

/**
 * Get previous grade
 */
export const getPreviousGrade = (currentGrade: string): Grade | null => {
  const currentIndex = GRADE_ORDER.findIndex(g => g === currentGrade);
  
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }
  
  return GRADE_ORDER[currentIndex - 1];
};

/**
 * Check if can upgrade grade
 */
export const canUpgradeGrade = (currentGrade: string, currentLevel: number): boolean => {
  // Must be at level 100
  if (currentLevel !== 100) {
    return false;
  }
  
  // Check if there's a next grade
  return getNextGrade(currentGrade) !== null;
};

/**
 * Check if can downgrade grade
 */
export const canDowngradeGrade = (currentGrade: string, currentLevel: number): boolean => {
  // Must be at level 1
  if (currentLevel !== 1) {
    return false;
  }
  
  // Check if there's a previous grade
  return getPreviousGrade(currentGrade) !== null;
};

/**
 * Check if is max grade
 */
export const isMaxGrade = (grade: string): boolean => {
  return grade === Grade.M6;
};

/**
 * Check if is min grade
 */
export const isMinGrade = (grade: string): boolean => {
  return grade === Grade.K1;
};

/**
 * Get grade display name
 */
export const getGradeDisplayName = (grade: string): string => {
  return GRADE_DISPLAY_NAMES[grade as Grade] || grade;
};

/**
 * Calculate grade progression
 * Returns new grade and level based on current state and score
 */
export interface GradeProgressionResult {
  newGrade: Grade;
  newLevel: number;
  gradeChanged: boolean;
  levelChanged: boolean;
  message?: string;
}

export const calculateGradeProgression = (
  currentGrade: string,
  currentLevel: number,
  scorePercentage: number
): GradeProgressionResult => {
  // Default result
  let newGrade = currentGrade as Grade;
  let newLevel = currentLevel;
  let gradeChanged = false;
  let levelChanged = false;
  let message: string | undefined;
  
  // Check score thresholds
  const shouldIncrease = scorePercentage > 84;
  const shouldDecrease = scorePercentage < 50;
  
  // Case 1: At Level 100 and should increase
  if (currentLevel === 100 && shouldIncrease) {
    const nextGrade = getNextGrade(currentGrade);
    
    if (nextGrade) {
      // Upgrade grade!
      newGrade = nextGrade;
      newLevel = 1;
      gradeChanged = true;
      levelChanged = true;
      message = `🎉 ยินดีด้วย! เลื่อนชั้นเป็น ${getGradeDisplayName(nextGrade)} แล้ว!`;
    } else {
      // Already at max grade (M6), stay at 100
      newLevel = 100;
      message = `🏆 คุณอยู่ในระดับสูงสุดแล้ว! (${getGradeDisplayName(currentGrade)})`;
    }
  }
  // Case 2: At Level 1 and should decrease
  else if (currentLevel === 1 && shouldDecrease) {
    const prevGrade = getPreviousGrade(currentGrade);
    
    if (prevGrade) {
      // Downgrade grade
      newGrade = prevGrade;
      newLevel = 100;
      gradeChanged = true;
      levelChanged = true;
      message = `⚠️ กลับไปชั้น ${getGradeDisplayName(prevGrade)} Level 100`;
    } else {
      // Already at min grade (K1), stay at 1
      newLevel = 1;
      message = `อยู่ที่ระดับต่ำสุดแล้ว (${getGradeDisplayName(currentGrade)} Level 1)`;
    }
  }
  // Case 3: Normal level progression
  else {
    if (shouldIncrease && currentLevel < 100) {
      newLevel = currentLevel + 1;
      levelChanged = true;
    } else if (shouldDecrease && currentLevel > 1) {
      newLevel = currentLevel - 1;
      levelChanged = true;
    }
    // else: maintain current level
  }
  
  return {
    newGrade,
    newLevel,
    gradeChanged,
    levelChanged,
    message
  };
};