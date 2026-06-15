// lib/curricula/life-math-beginner/meta.ts
//
// Life Math — beginner-level practical math skills. Not bound to any national
// syllabus; designed for everyday situations (shopping, discounts, sharing).

import { Grade } from '@/types';

export const lifeMathBeginnerMeta = {
  id: 'life-math-beginner',
  name: 'Life Math',
  fullName: 'Life Math — ทักษะคำนวณในชีวิตประจำวัน (ระดับเริ่มต้น)',
  description:
    'ทักษะคณิตศาสตร์ที่ใช้ในชีวิตประจำวัน — เปอร์เซ็นต์ บัญญัติไตรยางศ์ การเลือกของคุ้มราคา เหมาะกับเด็ก 8 ปีขึ้นไป',
  publisher: 'MathQuest',
  region: 'International',
  targetAge: '8+ years',
  gradeLevel: Grade.P4,
  language: 'mixed' as const,
  topicTags: ['percentages', 'unitary-method', 'money', 'word-problems'],
  version: '1.0.0',
};
