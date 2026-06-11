// lib/curricula/bnc-y3/topics/time/reading-the-clock/index.ts

import { subTopic } from '@/lib/curricula/helpers/lesson-builders';
import { readingTheClockLessons } from './lessons';

export const readingTheClock = subTopic({
  id: 'bnc-y3-time-reading',
  topicId: 'bnc-y3-time',
  slug: 'reading-the-clock',
  title: 'Reading the Clock',
  thaiTitle: 'อ่านเวลาจากนาฬิกาเข็ม',
  description:
    "อ่านนาฬิกาเข็มทุกรูปแบบ — o'clock, half past, quarter past, quarter to, minutes past/to",
  learningObjectives: [
    'แยกเข็มสั้นและเข็มยาวได้',
    "อ่าน o'clock, half past, quarter past, quarter to ได้",
    'อ่าน "X minutes past Y" และ "X minutes to Y" ได้',
    'ตั้งเวลาบนนาฬิกาเข็มได้',
  ],
  estimatedTotalMinutes: 130,
  order: 1,
  lessons: readingTheClockLessons,
});
