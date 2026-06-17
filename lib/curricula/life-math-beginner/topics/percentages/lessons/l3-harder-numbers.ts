// lessons/l3-harder-numbers.ts
//
// Lesson 3 — practice unitary method on larger / less-round numbers.
// Builds confidence before word problems in L4.

import type { Lesson } from '@/types/curriculum';
import {
  guidedPractice,
  independentPractice,
  lesson,
  reflection,
  workedExample,
} from '@/lib/curricula/helpers/lesson-builders';
import { M3, M5, M6, M7, M8, H6, H7 } from '../content/questions';

const SUB = 'life-math-percentages';

export const lesson3: Lesson = lesson({
  id: `${SUB}-l3`,
  subTopicId: SUB,
  order: 3,
  title: '% เลขที่ยากขึ้น (Harder Numbers)',
  description: 'ฝึกหา % ของเลขใหญ่ขึ้นและไม่ลงตัวพอ',
  estimatedMinutes: 20,
  kind: 'lesson',
  learningObjectives: [
    'หา % ของเลขใหญ่ (100-500) ได้',
    'แตกเปอร์เซ็นต์ที่ไม่ลงตัวออกเป็นส่วนๆ (เช่น 35% = 30% + 5%)',
  ],
  steps: [
    workedExample({
      id: `${SUB}-l3-s1`,
      title: 'ทำให้ดู — 12% ของ 250',
      problemStatement: '12% ของ 250 = ?',
      steps: [
        {
          narration:
            '12% เป็นเลขที่ไม่ลงตัวง่าย — แตกเป็น **10% + 1% + 1%**',
        },
        {
          narration: '10% ของ 250 = 250 ÷ 10 = **25**',
          formula: '250 ÷ 10 = 25',
        },
        {
          narration: '1% = 10% ÷ 10 = 25 ÷ 10 = **2.5**',
          formula: '25 ÷ 10 = 2.5',
        },
        {
          narration: '12% = 10% + 2% = 25 + 5 = **30**',
          formula: '25 + 5 = 30',
        },
      ],
    }),

    workedExample({
      id: `${SUB}-l3-s2`,
      title: 'ทำให้ดู — 35% ของ 400',
      problemStatement: '35% ของ 400 = ?',
      steps: [
        {
          narration: 'แตก 35% = **30% + 5%** หรือ **25% + 10%**',
        },
        {
          narration: 'วิธี 1: 25% ของ 400 = 400 ÷ 4 = **100**',
          formula: '400 ÷ 4 = 100',
        },
        {
          narration: '10% ของ 400 = 400 ÷ 10 = **40**',
          formula: '400 ÷ 10 = 40',
        },
        {
          narration: '35% = 25% + 10% = 100 + 40 = **140**',
          formula: '100 + 40 = 140',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l3-s3`,
      title: '30% ของ 200',
      question: M3.question,
      hints: ['10% = 200 ÷ 10 = 20', '30% = 10% × 3 → 20 × 3 = ?'],
      fullExplanation: '10% ของ 200 = 20 → 30% = 60',
    }),

    guidedPractice({
      id: `${SUB}-l3-s4`,
      title: '40% ของ 250',
      question: M5.question,
      hints: ['10% = 250 ÷ 10 = 25', '40% = 10% × 4 → 25 × 4 = ?'],
      fullExplanation: '10% ของ 250 = 25 → 40% = 100',
    }),

    guidedPractice({
      id: `${SUB}-l3-s5`,
      title: '60% ของ 150',
      question: M6.question,
      hints: ['10% = 15', '60% = 10% × 6 = 90'],
      fullExplanation: '10% ของ 150 = 15 → 60% = 15 × 6 = 90',
    }),

    guidedPractice({
      id: `${SUB}-l3-s6`,
      title: '8% ของ 50',
      question: M7.question,
      hints: ['10% ของ 50 = 5', '1% = 0.5 → 8% = 10% - 2% = 5 - 1 = ?'],
      fullExplanation: '10% = 5, 2% = 1 → 8% = 5 − 1 = 4',
    }),

    guidedPractice({
      id: `${SUB}-l3-s7`,
      title: '75% ของ 80',
      question: M8.question,
      hints: ['75% = 25% × 3', '25% ของ 80 = 20 → 20 × 3 = ?'],
      fullExplanation: '25% = 20 → 75% = 20 × 3 = 60',
    }),

    guidedPractice({
      id: `${SUB}-l3-s8`,
      title: '35% ของ 400',
      question: H6.question,
      hints: ['25% = 100, 10% = 40', '35% = 25% + 10%'],
      fullExplanation: '25% ของ 400 = 100 + 10% (40) = **140**',
    }),

    guidedPractice({
      id: `${SUB}-l3-s9`,
      title: '12% ของ 250',
      question: H7.question,
      hints: ['10% = 25, 1% = 2.5', '12% = 10% + 2%'],
      fullExplanation: '10% = 25 + 2% (5) = **30**',
    }),

    independentPractice({
      id: `${SUB}-l3-mini`,
      title: 'ฝึกท้ายบท — 4 ข้อ',
      questions: [M7.question, M8.question, H6.question, H7.question],
      passingScore: 0.6,
    }),

    reflection({
      id: `${SUB}-l3-s10`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        'เปอร์เซ็นต์ที่ไม่ลงตัว → **แตกเป็นชิ้นง่ายๆ** ที่บวก/ลบกัน',
        '**10%** เป็นจุดเริ่มเสมอ — ใหญ่/เล็กกว่าก็คูณ/หารต่อ',
        '12% = 10% + 2% | 35% = 25% + 10% | 75% = 50% + 25%',
      ],
      nextUp: 'บทต่อไป: โจทย์ปัญหาในชีวิตจริง — ลดราคา/VAT',
    }),
  ],
});
