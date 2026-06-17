// lessons/l5-mental-tricks.ts
//
// Lesson 5 — pocket tricks for fast mental computation of percentages.
// The 4 tricks: 10% shift, half/double, X% of Y = Y% of X, discount = pay rest.

import type { Lesson } from '@/types/curriculum';
import {
  guidedPractice,
  independentPractice,
  lesson,
  reflection,
  workedExample,
} from '@/lib/curricula/helpers/lesson-builders';
import { callout, text } from '@/lib/curricula/helpers/visual-builders';
import { C_mentalTricks } from '../content/concepts';
import { T1, T2, T3, T4, T5, T6, T7, T8, T9, T10 } from '../content/questions';

const SUB = 'life-math-percentages';

export const lesson5: Lesson = lesson({
  id: `${SUB}-l5`,
  subTopicId: SUB,
  order: 5,
  title: 'เทคนิคคิดเลข % เร็วในใจ (Mental Math Tricks)',
  description: '4 ทางลัดที่ใช้ได้จริง — เลื่อนจุด, ครึ่ง/สองเท่า, สลับเลข, ลด=จ่าย',
  estimatedMinutes: 20,
  kind: 'lesson',
  learningObjectives: [
    'คิด 10% ของจำนวนใดๆ ได้ทันที',
    'ใช้ทางลัด 50%, 25%, 5%, 20% ได้คล่อง',
    'ใช้เทคนิค "สลับเลข" (X% ของ Y = Y% ของ X)',
    'แปลงโจทย์ลดราคาเป็น "จ่ายเหลือ" ได้',
  ],
  steps: [
    C_mentalTricks,

    workedExample({
      id: `${SUB}-l5-s2`,
      title: 'ทำให้ดู — เทคนิค "สลับเลข"',
      problemStatement: '4% ของ 75 = ?',
      steps: [
        {
          narration:
            '**4% ของ 75** ดูยากใช่ไหม? — ลอง**สลับ**เลขดู กลายเป็น **75% ของ 4**',
        },
        {
          narration: '75% ของ 4 — คิดง่ายมาก! 75% = 3 ส่วน 4',
        },
        {
          narration: '3 ใน 4 ส่วนของ 4 = **3**',
          formula: '4% ของ 75 = 75% ของ 4 = 3',
        },
        {
          narration:
            '⚡ เทคนิคนี้ใช้ได้เสมอ — ทุก X% ของ Y = Y% ของ X',
        },
      ],
    }),

    workedExample({
      id: `${SUB}-l5-s3`,
      title: 'ทำให้ดู — ลดราคา = จ่ายเหลือ',
      problemStatement: 'เสื้อ 800 บาท ลด 25% จ่ายเท่าไร?',
      steps: [
        {
          narration:
            '**ลด 25%** = จ่าย **75%** (เพราะ 100 − 25 = 75)',
        },
        {
          narration: '**75% ของ 800** = 800 ÷ 4 × 3',
        },
        {
          narration: '800 ÷ 4 = 200 → 200 × 3 = **600 บาท**',
          formula: '75% ของ 800 = 600',
        },
        {
          narration:
            '⚡ ไม่ต้องหาส่วนลดก่อน แล้วลบทีหลัง — คิดจาก "จ่ายเหลือ" เลยเร็วกว่า',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l5-s4`,
      title: '10% ทางลัด',
      question: T1.question,
      hints: ['ลบเลข 0 ตัวสุดท้าย', '80 → 8'],
      fullExplanation: '10% ของ 80 = 8 (เลื่อนจุดทศนิยม)',
    }),

    guidedPractice({
      id: `${SUB}-l5-s5`,
      title: '5% = ครึ่งของ 10%',
      question: T2.question,
      hints: ['10% ของ 80 = 8', 'ครึ่งของ 8 = ?'],
      fullExplanation: '5% = 10% ÷ 2 → 8 ÷ 2 = 4',
    }),

    guidedPractice({
      id: `${SUB}-l5-s6`,
      title: '20% = 10% × 2',
      question: T3.question,
      hints: ['10% ของ 70 = 7', '7 × 2 = ?'],
      fullExplanation: '20% = 10% × 2 → 7 × 2 = 14',
    }),

    guidedPractice({
      id: `${SUB}-l5-s7`,
      title: '50% ทางลัด',
      question: T4.question,
      hints: ['50% = ครึ่งหนึ่ง', '240 ÷ 2 = ?'],
      fullExplanation: '50% = ÷ 2 → 240 ÷ 2 = 120',
    }),

    guidedPractice({
      id: `${SUB}-l5-s8`,
      title: '25% ทางลัด',
      question: T5.question,
      hints: ['25% = หาร 4', '60 ÷ 4 = ?'],
      fullExplanation: '25% = ÷ 4 → 60 ÷ 4 = 15',
    }),

    guidedPractice({
      id: `${SUB}-l5-s9`,
      title: 'เทคนิคสลับเลข',
      question: T6.question,
      hints: ['ลอง 4% ของ 50 → ยาก', '50% ของ 4 → ครึ่งของ 4 = 2'],
      fullExplanation: 'X% ของ Y = Y% ของ X → 4% ของ 50 = 50% ของ 4 = **2**',
    }),

    guidedPractice({
      id: `${SUB}-l5-s10`,
      title: 'สลับ — 8% ของ 25',
      question: T7.question,
      hints: ['สลับ → 25% ของ 8', '8 ÷ 4 = ?'],
      fullExplanation: '25% ของ 8 = 8 ÷ 4 = 2',
    }),

    guidedPractice({
      id: `${SUB}-l5-s11`,
      title: 'ลด = จ่ายเหลือ',
      question: T10.question,
      hints: ['100 − 30 = ?', 'ลด 30% หมายความว่าจ่าย 70%'],
      fullExplanation: 'ลด 30% = จ่าย 70% (100 − 30 = 70)',
    }),

    independentPractice({
      id: `${SUB}-l5-mini`,
      title: 'ฝึกท้ายบท — 5 ข้อ',
      questions: [T8.question, T9.question, T2.question, T7.question, T10.question],
      passingScore: 0.6,
    }),

    reflection({
      id: `${SUB}-l5-s12`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**10% = เลื่อนจุดทศนิยม** → 10% ของ N ได้ทันที',
        '**50% ÷2 | 25% ÷4 | 5% = ครึ่งของ 10% | 20% = 10%×2**',
        '**สลับเลข**: X% ของ Y = Y% ของ X — ใช้เมื่อตัวหน้ายากกว่าตัวหลัง',
        '**ลด X% = จ่าย (100−X)%** — คิดทางลัดได้',
      ],
      nextUp: 'ทดสอบรวม — Final Quiz 5 level',
    }),
  ],
});
