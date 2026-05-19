// lib/curricula/bnc-y3/topics/fractions/subtracting-fractions/index.ts

import { subTopic } from '@/lib/curricula/helpers/lesson-builders';
import { subtractingFractionsLessons } from './lessons';

export const subtractingFractions = subTopic({
  id: 'bnc-y3-fractions-subtracting',
  topicId: 'bnc-y3-fractions',
  slug: 'subtracting-fractions',
  title: 'Subtracting Fractions (Same Denominator)',
  thaiTitle: 'ลบเศษส่วน (ตัวส่วนเท่ากัน)',
  description:
    'เรียนวิธีลบเศษส่วนที่ตัวส่วนเท่ากัน — ต่อยอดจากบวก ใช้กฎเดียวกัน: ตัวส่วนคงเดิม ลบเฉพาะตัวเศษ',
  learningObjectives: [
    'อธิบายการลบเศษส่วนตัวส่วนเท่ากันได้ด้วยภาพ',
    'ลบเศษส่วนตัวส่วนเท่ากันได้ด้วยตัวเลข',
    'ลบเศษส่วนจาก 1 ทั้งอันได้ (เช่น 1 - 2/5)',
    'เข้าใจกรณีผลลัพธ์เป็น 0',
    'แก้ word problem 1-2 ขั้นเกี่ยวกับการลบเศษส่วนได้',
  ],
  prerequisites: ['bnc-y3-fractions-adding'],
  estimatedTotalMinutes: 180,
  order: 2,
  lessons: subtractingFractionsLessons,
});
