// lib/curricula/bnc-y3/topics/fractions/index.ts
//
// Topic: Fractions. Phase 1 ครอบคลุม Adding + Subtracting (same denominator).
// Phase 2+ will add: Equivalent, Compare, Mixed Numbers, etc.

import { topic } from '@/lib/curricula/helpers/lesson-builders';
import { addingFractions } from './adding-fractions';
import { subtractingFractions } from './subtracting-fractions';

export const fractionsTopic = topic({
  id: 'bnc-y3-fractions',
  curriculumId: 'bnc-y3',
  slug: 'fractions',
  title: 'Fractions',
  thaiTitle: 'เศษส่วน',
  description: 'เรียนรู้เศษส่วน — รู้จัก, บวก, ลบ, เปรียบเทียบ',
  icon: '🍕',
  order: 4,
  subTopics: [addingFractions, subtractingFractions],
});
