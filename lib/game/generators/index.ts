// lib/game/generators/index.ts

// Types
export * from './types';

// Utils
export * from './utils';

// Kindergarten generators
export * from './kindergarten';
import { K1Generator, K2Generator, K3Generator } from './kindergarten';

// Elementary generators
export * from './elementary';
import { P1Generator, P2Generator, P3Generator, P4Generator, P5Generator, P6Generator } from './elementary';

// Secondary generators
export * from './secondary';
import { M1Generator, M2Generator, M3Generator, M4Generator, M5Generator, M6Generator } from './secondary';

// Grade generator interface
import { GradeGenerator } from './types';

/**
 * Registry of all grade generators
 * Each grade has its own specialized generator with appropriate algorithms
 */
export const gradeGenerators: Record<string, GradeGenerator> = {
  // Kindergarten (อนุบาล)
  K1: new K1Generator(),
  K2: new K2Generator(),
  K3: new K3Generator(),
  
  // Elementary (ประถม)
  P1: new P1Generator(),
  P2: new P2Generator(),
  P3: new P3Generator(),
  P4: new P4Generator(),
  P5: new P5Generator(),
  P6: new P6Generator(),
  
  // Secondary (มัธยม)
  M1: new M1Generator(),
  M2: new M2Generator(),
  M3: new M3Generator(),
  M4: new M4Generator(),
  M5: new M5Generator(),
  M6: new M6Generator(),
};

/**
 * Get generator for specific grade
 */
export const getGeneratorForGrade = (grade: string): GradeGenerator | null => {
  return gradeGenerators[grade] || null;
};

/**
 * Check if grade is supported
 */
export const isSupportedGrade = (grade: string): boolean => {
  return grade in gradeGenerators;
};

/**
 * Get list of all supported grades
 */
export const getSupportedGrades = (): string[] => {
  return Object.keys(gradeGenerators);
};

/**
 * Get grade category (kindergarten, elementary, secondary)
 */
export const getGradeCategory = (grade: string): 'kindergarten' | 'elementary' | 'secondary' | 'unknown' => {
  if (grade.startsWith('K')) return 'kindergarten';
  if (grade.startsWith('P')) return 'elementary';
  if (grade.startsWith('M')) return 'secondary';
  return 'unknown';
};

/**
 * Validate if level is appropriate for grade
 */
export const isValidLevelForGrade = (grade: string, level: number): boolean => {
  const generator = getGeneratorForGrade(grade);
  if (!generator) return false;
  
  return generator.supportsLevel(level);
};

// Grade display names in Thai
export const GRADE_DISPLAY_NAMES: Record<string, string> = {
  // Kindergarten
  K1: 'อนุบาล 1',
  K2: 'อนุบาล 2', 
  K3: 'อนุบาล 3',
  
  // Elementary
  P1: 'ประถม 1',
  P2: 'ประถม 2',
  P3: 'ประถม 3',
  P4: 'ประถม 4',
  P5: 'ประถม 5',
  P6: 'ประถม 6',
  
  // Secondary
  M1: 'มัธยม 1',
  M2: 'มัธยม 2',
  M3: 'มัธยม 3',
  M4: 'มัธยม 4',
  M5: 'มัธยม 5',
  M6: 'มัธยม 6',
};

/**
 * Get Thai display name for grade
 */
export const getGradeDisplayName = (grade: string): string => {
  return GRADE_DISPLAY_NAMES[grade] || grade;
};

// Debug information
export const DEBUG_INFO = {
  totalGenerators: Object.keys(gradeGenerators).length,
  kindergartenGrades: Object.keys(gradeGenerators).filter(g => g.startsWith('K')),
  elementaryGrades: Object.keys(gradeGenerators).filter(g => g.startsWith('P')),
  secondaryGrades: Object.keys(gradeGenerators).filter(g => g.startsWith('M')),
  implementedGrades: Object.keys(gradeGenerators),
  pendingGrades: [] // All grades implemented!
};