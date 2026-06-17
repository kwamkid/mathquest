// lessons/l3-compare.ts
//
// Lesson 3 — pick the better deal by comparing price-per-unit between options.

import type { Lesson } from '@/types/curriculum';
import {
  guidedPractice,
  independentPractice,
  lesson,
  reflection,
  workedExample,
} from '@/lib/curricula/helpers/lesson-builders';
import { C_compareValue } from '../content/concepts';
import { M6, H3, H6 } from '../content/questions';

const SUB = 'life-math-unitary';

export const lesson3: Lesson = lesson({
  id: `${SUB}-l3`,
  subTopicId: SUB,
  order: 3,
  title: 'เปรียบเทียบราคา (Compare & Find Best Value)',
  description: '2 ร้านราคาต่างกัน — แบบไหนคุ้ม?',
  estimatedMinutes: 20,
  kind: 'lesson',
  learningObjectives: [
    'เปรียบเทียบราคาต่อ 1 หน่วยของ 2 ตัวเลือกได้',
    'เลือกของที่คุ้มกว่าโดยใช้บัญญัติไตรยางศ์',
  ],
  steps: [
    C_compareValue,

    workedExample({
      id: `${SUB}-l3-s2`,
      title: 'ทำให้ดู — 2 ร้าน',
      problemStatement: 'น้ำ ร้าน A: 3 ขวด 60฿ vs ร้าน B: 5 ขวด 90฿ — ร้านไหนคุ้ม?',
      steps: [
        {
          narration: '**ขั้น 1**: หาราคา/ขวดของร้าน A',
        },
        {
          narration: '60 ÷ 3 = **20 บาท/ขวด**',
          formula: '60 ÷ 3 = 20',
        },
        {
          narration: '**ขั้น 2**: หาราคา/ขวดของร้าน B',
        },
        {
          narration: '90 ÷ 5 = **18 บาท/ขวด**',
          formula: '90 ÷ 5 = 18',
        },
        {
          narration:
            '**ร้าน B ถูกกว่า** (18 < 20) — แม้ราคารวมจะดูสูงกว่า',
        },
      ],
    }),

    workedExample({
      id: `${SUB}-l3-s3`,
      title: 'ทำให้ดู — ขนาดต่างกัน',
      problemStatement: 'แชมพู: เล็ก 200ml 80฿ vs ใหญ่ 500ml 180฿ — แบบไหนคุ้ม?',
      steps: [
        {
          narration: 'หาราคา/ml ของแต่ละขนาด',
        },
        {
          narration: 'เล็ก: 80 ÷ 200 = **0.40 บาท/ml**',
          formula: '80 ÷ 200 = 0.40',
        },
        {
          narration: 'ใหญ่: 180 ÷ 500 = **0.36 บาท/ml**',
          formula: '180 ÷ 500 = 0.36',
        },
        {
          narration: '**ขวดใหญ่ถูกกว่า** (0.36 < 0.40)',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l3-s4`,
      title: 'น้ำ 2 ร้าน',
      question: M6.question,
      hints: ['A: 60÷3 = ?', 'B: 90÷5 = ?', 'เปรียบเทียบ'],
      fullExplanation: 'A = 20฿/ขวด, B = 18฿/ขวด → ร้าน B ถูกกว่า',
    }),

    guidedPractice({
      id: `${SUB}-l3-s5`,
      title: 'แชมพู 2 ขนาด',
      question: H3.question,
      hints: ['เล็ก: 80÷200 = 0.40', 'ใหญ่: 180÷500 = 0.36'],
      fullExplanation: 'ขวดใหญ่: 0.36 บาท/ml < ขวดเล็ก 0.40 บาท/ml → ใหญ่คุ้มกว่า',
    }),

    guidedPractice({
      id: `${SUB}-l3-s6`,
      title: 'กาแฟ 2 ถุง',
      question: H6.question,
      hints: ['เล็ก: 200÷250 = 0.80', 'ใหญ่: 750÷1000 = 0.75'],
      fullExplanation: 'ใหญ่: 0.75 บาท/g < เล็ก 0.80 บาท/g → ใหญ่คุ้มกว่า',
    }),

    independentPractice({
      id: `${SUB}-l3-mini`,
      title: 'ฝึกท้ายบท — 3 ข้อ',
      questions: [M6.question, H3.question, H6.question],
      passingScore: 0.66,
    }),

    reflection({
      id: `${SUB}-l3-s8`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**ราคาต่อ 1 หน่วยน้อยกว่า = คุ้มกว่า**',
        'ขนาดใหญ่ไม่ได้คุ้มกว่าเสมอ — ต้องคำนวณดู',
        'ใช้บัญญัติไตรยางศ์เปรียบเทียบได้ทุกอย่าง',
      ],
      nextUp: 'บทต่อไป: โจทย์ผสม + เทคนิคคิดเร็ว',
    }),
  ],
});
