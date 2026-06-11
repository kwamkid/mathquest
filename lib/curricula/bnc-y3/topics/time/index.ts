// lib/curricula/bnc-y3/topics/time/index.ts
//
// Topic: Time. Phase 1 ครอบคลุม Reading the Clock (analog).
// Phase 2+ will add: 12/24-hour, duration, calendar, Roman numerals.

import { topic } from '@/lib/curricula/helpers/lesson-builders';
import { readingTheClock } from './reading-the-clock';

export const timeTopic = topic({
  id: 'bnc-y3-time',
  curriculumId: 'bnc-y3',
  slug: 'time',
  title: 'Time',
  thaiTitle: 'เวลา',
  description: 'อ่านนาฬิกาเข็ม — รู้จักเข็มสั้น/ยาว, past, to, quarter',
  icon: '⏰',
  order: 5,
  subTopics: [readingTheClock],
});
