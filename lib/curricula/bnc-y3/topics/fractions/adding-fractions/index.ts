// lib/curricula/bnc-y3/topics/fractions/adding-fractions/index.ts

import { subTopic } from '@/lib/curricula/helpers/lesson-builders';
import { addingFractionsLessons } from './lessons';

export const addingFractions = subTopic({
  id: 'bnc-y3-fractions-adding',
  topicId: 'bnc-y3-fractions',
  slug: 'adding-fractions',
  title: 'Adding Fractions (Same Denominator)',
  thaiTitle: 'บวกเศษส่วน (ตัวส่วนเท่ากัน)',
  description:
    'เรียนวิธีบวกเศษส่วนที่ตัวส่วนเท่ากัน — เริ่มจากภาพ → สัญลักษณ์ → โจทย์ปัญหา',
  learningObjectives: [
    'อธิบายการบวกเศษส่วนตัวส่วนเท่ากันได้ด้วยภาพ',
    'บวกเศษส่วนตัวส่วนเท่ากันได้ด้วยตัวเลข',
    'เข้าใจเมื่อผลลัพธ์เกิน 1 (improper fraction / mixed number เบื้องต้น)',
    'แก้ word problem 1-2 ขั้นได้',
  ],
  estimatedTotalMinutes: 180,
  order: 1,
  lessons: addingFractionsLessons,
});
