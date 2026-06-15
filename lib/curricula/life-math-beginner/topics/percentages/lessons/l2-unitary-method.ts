// lessons/l2-unitary-method.ts
//
// Lesson 2 — teach the unitary method (X% of N = N × X / 100) and the 10%
// shortcut. Practice draws from medium-difficulty bank entries.

import type { Lesson } from '@/types/curriculum';
import {
  guidedPractice,
  independentPractice,
  lesson,
  reflection,
  workedExample,
} from '@/lib/curricula/helpers/lesson-builders';
import { callout } from '@/lib/curricula/helpers/visual-builders';
import { C_tenPercentTrick, C_unitaryMethod } from '../content/concepts';
import { E4, E5, E10, M1, M2, M3, M5, M6 } from '../content/questions';

const SUB = 'life-math-percentages';

export const lesson2: Lesson = lesson({
  id: `${SUB}-l2`,
  subTopicId: SUB,
  order: 2,
  title: 'บัญญัติไตรยางศ์ — สูตรหา % 📐',
  description: 'เรียนสูตร X% ของ N พร้อมทางลัด',
  estimatedMinutes: 20,
  kind: 'lesson',
  learningObjectives: [
    'ใช้สูตร X% × N ÷ 100 ได้',
    'ใช้ทางลัด 10% (÷10), 50% (÷2), 25% (÷4)',
  ],
  steps: [
    C_unitaryMethod,

    workedExample({
      id: `${SUB}-l2-s2`,
      title: 'ทำให้ดู — 20% ของ 150',
      problemStatement: '20% ของ 150 = ?',
      steps: [
        {
          narration: 'ใช้สูตร: **N × X ÷ 100**',
        },
        {
          narration: 'คูณก่อน: 150 × 20 = 3,000',
          formula: '150 × 20 = 3,000',
        },
        {
          narration: 'หาร 100: 3,000 ÷ 100 = **30**',
          formula: '3,000 ÷ 100 = 30',
        },
        {
          narration: 'ดังนั้น **20% ของ 150 = 30**',
        },
      ],
    }),

    C_tenPercentTrick,

    workedExample({
      id: `${SUB}-l2-s4`,
      title: 'ทางลัด — 30% ของ 250',
      problemStatement: '30% ของ 250 = ?',
      steps: [
        {
          narration:
            'ใช้ทางลัด — หา **10% ก่อน** แล้วคูณ 3',
        },
        {
          narration: '10% ของ 250 = 250 ÷ 10 = **25**',
          formula: '250 ÷ 10 = 25',
        },
        {
          narration: '30% = 10% × 3 → 25 × 3 = **75**',
          formula: '25 × 3 = 75',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l2-s5`,
      title: '50% ใช้ทางลัด',
      question: E4.question,
      hints: ['50% = ÷ 2', 'ครึ่งของ 200 = ?'],
      fullExplanation: '50% ของ 200 = 200 ÷ 2 = **100**',
    }),

    guidedPractice({
      id: `${SUB}-l2-s6`,
      title: '25% ใช้ทางลัด',
      question: E5.question,
      hints: ['25% = ÷ 4', '100 ÷ 4 = ?'],
      fullExplanation: '25% ของ 100 = 100 ÷ 4 = **25**',
    }),

    guidedPractice({
      id: `${SUB}-l2-s7`,
      title: 'ลองโจทย์ปานกลาง',
      question: M1.question,
      hints: ['หา 10% ก่อน (150 ÷ 10 = 15)', '20% = 10% × 2 → 15 × 2 = ?'],
      fullExplanation:
        '10% ของ 150 = 15 → 20% = 15 × 2 = **30**',
    }),

    guidedPractice({
      id: `${SUB}-l2-s8`,
      title: '15% ของ 80',
      question: M2.question,
      hints: [
        '15% = 10% + 5%',
        '10% ของ 80 = 8, 5% = ครึ่งของ 10% = 4',
        '8 + 4 = ?',
      ],
      fullExplanation:
        '10% ของ 80 = 8 → 5% = 4 → 15% = 8 + 4 = **12**',
    }),

    independentPractice({
      id: `${SUB}-l2-mini`,
      title: '🎯 ฝึกท้ายบท — 4 ข้อ',
      questions: [E10.question, M3.question, M5.question, M6.question],
      passingScore: 0.6,
    }),

    reflection({
      id: `${SUB}-l2-s9`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        'สูตรเปอร์เซ็นต์: **N × X ÷ 100**',
        'ทางลัด: **10% = ÷10** | **50% = ÷2** | **25% = ÷4**',
        'หา 10% ก่อน แล้วต่อยอด (×2 = 20%, ×3 = 30%, ÷2 = 5%)',
      ],
      nextUp: 'บทต่อไป: % กับเลขใหญ่ขึ้น',
    }),
  ],
});
