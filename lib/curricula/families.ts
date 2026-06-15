// lib/curricula/families.ts
//
// Curriculum-family registry — top-level groupings shown on /learn.
// Each family lists the grades it offers; only grades with a `curriculumId`
// pointing to a registered Curriculum are playable. The rest render as
// "coming soon".

import type { CurriculumFamily } from '@/types/curriculum';

export const families: CurriculumFamily[] = [
  {
    key: 'life-math',
    name: 'Life Math',
    thaiName: 'Life Math · ทักษะคำนวณในชีวิตประจำวัน',
    description:
      'คณิตศาสตร์ที่ใช้ในชีวิตจริง — เปอร์เซ็นต์ บัญญัติไตรยางศ์ ลดราคา ของคุ้มราคา',
    flag: '💡',
    grades: [
      {
        key: 'beginner',
        label: 'ระดับเริ่มต้น',
        ageRange: '8+ ปี',
        curriculumId: 'life-math-beginner',
      },
    ],
  },
  {
    key: 'british',
    name: 'British National Curriculum',
    thaiName: 'British National Curriculum',
    description:
      'หลักสูตรคณิตศาสตร์ของอังกฤษ ครอบคลุม Key Stage 1-2 — Year 1 ถึง Year 6',
    flag: '🇬🇧',
    grades: [
      { key: 'y1', label: 'Year 1', ageRange: '5-6 ปี' },
      { key: 'y2', label: 'Year 2', ageRange: '6-7 ปี' },
      // Phase 1: Year 3 is the only playable grade — linked to bnc-y3 curriculum.
      { key: 'y3', label: 'Year 3', ageRange: '7-8 ปี', curriculumId: 'bnc-y3' },
      { key: 'y4', label: 'Year 4', ageRange: '8-9 ปี' },
      { key: 'y5', label: 'Year 5', ageRange: '9-10 ปี' },
      { key: 'y6', label: 'Year 6', ageRange: '10-11 ปี' },
    ],
  },
  {
    key: 'thai',
    name: 'หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน (กระทรวงศึกษาธิการ)',
    thaiName: 'Thai National Curriculum',
    description: 'หลักสูตรกระทรวงศึกษาธิการของไทย — อนุบาล ประถม มัธยม',
    flag: '🇹🇭',
    comingSoon: true,
    grades: [
      { key: 'p1', label: 'ประถม 1', ageRange: '6-7 ปี' },
      { key: 'p2', label: 'ประถม 2', ageRange: '7-8 ปี' },
      { key: 'p3', label: 'ประถม 3', ageRange: '8-9 ปี' },
      { key: 'p4', label: 'ประถม 4', ageRange: '9-10 ปี' },
      { key: 'p5', label: 'ประถม 5', ageRange: '10-11 ปี' },
      { key: 'p6', label: 'ประถม 6', ageRange: '11-12 ปี' },
    ],
  },
  {
    key: 'american',
    name: 'American Common Core',
    thaiName: 'American Common Core',
    description: 'หลักสูตร Common Core State Standards ของสหรัฐอเมริกา — Grade K-5',
    flag: '🇺🇸',
    comingSoon: true,
    grades: [
      { key: 'k', label: 'Kindergarten', ageRange: '5-6 ปี' },
      { key: 'g1', label: 'Grade 1', ageRange: '6-7 ปี' },
      { key: 'g2', label: 'Grade 2', ageRange: '7-8 ปี' },
      { key: 'g3', label: 'Grade 3', ageRange: '8-9 ปี' },
      { key: 'g4', label: 'Grade 4', ageRange: '9-10 ปี' },
      { key: 'g5', label: 'Grade 5', ageRange: '10-11 ปี' },
    ],
  },
];

export const getFamily = (key: string): CurriculumFamily | null => {
  return families.find((f) => f.key === key) ?? null;
};

export const getFamilyGrade = (familyKey: string, gradeKey: string) => {
  const family = getFamily(familyKey);
  if (!family) return null;
  const grade = family.grades.find((g) => g.key === gradeKey);
  if (!grade) return null;
  return { family, grade };
};
