// lib/curricula/bnc-y3/topics/fractions/index.ts
//
// Topic: Fractions. Phase 1 has just one sub-topic ("Adding Fractions").
// Phase 2+ will add: Compare, Subtract, Mixed Numbers, etc.

import { topic } from '@/lib/curricula/helpers/lesson-builders';
import { addingFractions } from './adding-fractions';

export const fractionsTopic = topic({
  id: 'bnc-y3-fractions',
  curriculumId: 'bnc-y3',
  slug: 'fractions',
  title: 'Fractions',
  thaiTitle: 'เศษส่วน',
  description: 'เรียนรู้เศษส่วน — รู้จัก, เปรียบเทียบ, บวก, ลบ',
  icon: '🍕',
  order: 4,
  subTopics: [addingFractions],
});
