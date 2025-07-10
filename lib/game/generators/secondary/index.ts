// lib/game/generators/secondary/index.ts

export { M1Generator } from './m1';
export { M2Generator } from './m2';
export { M3Generator } from './m3';
// TODO: export M4-M6 when implemented

// Helper type สำหรับ secondary generators
export type SecondaryGrade = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6';