// lib/curricula/index.ts
//
// Curriculum registry — mirrors the pattern of lib/game/generators/index.ts
// To add a new curriculum: import its object and add to the `curricula` map.

import { Curriculum } from '@/types/curriculum';
import { Grade } from '@/types';
import { bncY3 } from './bnc-y3';
import { lifeMathBeginner } from './life-math-beginner';

export const curricula: Record<string, Curriculum> = {
  'bnc-y3': bncY3,
  'life-math-beginner': lifeMathBeginner,
  // future: 'cambridge-stage-3': cambridgeStage3,
  // future: 'thai-p3': thaiP3,
};

export const getCurriculum = (id: string): Curriculum | null => {
  return curricula[id] || null;
};

export const listCurricula = (): Curriculum[] => {
  return Object.values(curricula);
};

export const getCurriculumsForGrade = (grade: Grade): Curriculum[] => {
  return listCurricula().filter((c) => c.gradeLevel === grade);
};

export const getDefaultCurriculumId = (): string | null => {
  const all = listCurricula();
  return all.length > 0 ? all[0].id : null;
};
