// lessons/l2-multiply-back.ts
//
// Lesson 2 — multiply the unit price back up to find the total for any
// quantity. Builds directly on L1.

import type { Lesson } from '@/types/curriculum';
import {
  guidedPractice,
  independentPractice,
  lesson,
  reflection,
  workedExample,
} from '@/lib/curricula/helpers/lesson-builders';
import { C_multiplyBack } from '../content/concepts';
import { E4, E5, E6, M3, M4, M8 } from '../content/questions';

const SUB = 'life-math-unitary';

export const lesson2: Lesson = lesson({
  id: `${SUB}-l2`,
  subTopicId: SUB,
  order: 2,
  title: 'คูณกลับ — หาราคารวม (Multiply Back)',
  description: 'รู้ราคา/ชิ้นแล้ว ซื้อหลายชิ้นเท่าไร?',
  estimatedMinutes: 18,
  kind: 'lesson',
  learningObjectives: [
    'ใช้สูตร "ราคารวม = ราคาต่อ 1 × จำนวน"',
    'แก้โจทย์ 2 ขั้น: หาร → คูณ',
  ],
  steps: [
    C_multiplyBack,

    workedExample({
      id: `${SUB}-l2-s2`,
      title: 'ทำให้ดู — รู้ราคา/ชิ้น',
      problemStatement: 'ดินสอแท่งละ 8 บาท ซื้อ 6 แท่ง ราคาเท่าไร?',
      steps: [
        {
          narration: '**สูตร**: ราคารวม = ราคาต่อ 1 × จำนวน',
        },
        {
          narration: 'แทนค่า: 8 × 6',
          formula: '8 × 6 = 48',
        },
        {
          narration: '**ราคารวม = 48 บาท**',
        },
      ],
    }),

    workedExample({
      id: `${SUB}-l2-s3`,
      title: 'ทำให้ดู — โจทย์ 2 ขั้น',
      problemStatement: 'ข้าวสาร 4 กระสอบ 1,000 บาท — 7 กระสอบกี่บาท?',
      steps: [
        {
          narration: '**ขั้น 1**: หาราคาต่อกระสอบก่อน',
        },
        {
          narration: '1,000 ÷ 4 = **250 บาท/กระสอบ**',
          formula: '1000 ÷ 4 = 250',
        },
        {
          narration: '**ขั้น 2**: คูณกลับ — 7 กระสอบ',
        },
        {
          narration: '250 × 7 = **1,750 บาท**',
          formula: '250 × 7 = 1750',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l2-s4`,
      title: 'คูณกลับ — แก้ว 12 ใบ',
      question: E5.question,
      hints: ['5 × 12 = ?'],
      fullExplanation: '5 × 12 = 60 บาท',
    }),

    guidedPractice({
      id: `${SUB}-l2-s5`,
      title: 'ดินสอ 6 แท่ง',
      question: E4.question,
      hints: ['8 × 6 = ?'],
      fullExplanation: '8 × 6 = 48 บาท',
    }),

    guidedPractice({
      id: `${SUB}-l2-s6`,
      title: 'ส้ม 4 กิโล',
      question: M3.question,
      hints: ['25 × 4 = ?'],
      fullExplanation: '25 × 4 = 100 บาท',
    }),

    guidedPractice({
      id: `${SUB}-l2-s7`,
      title: 'โจทย์ 2 ขั้น',
      question: M4.question,
      hints: ['ขั้น 1: 1000 ÷ 4 = 250/กระสอบ', 'ขั้น 2: 250 × 7 = ?'],
      fullExplanation: '1000 ÷ 4 = 250 → 250 × 7 = 1,750 บาท',
    }),

    independentPractice({
      id: `${SUB}-l2-mini`,
      title: 'ฝึกท้ายบท — 3 ข้อ',
      questions: [E6.question, M8.question, M3.question],
      passingScore: 0.66,
    }),

    reflection({
      id: `${SUB}-l2-s9`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**คูณกลับ** = ราคาต่อ 1 × จำนวน',
        'โจทย์ 2 ขั้น: **หาร → คูณ**',
        'ใช้กับอะไรก็ได้ — น้ำตาล/นม/ผลไม้',
      ],
      nextUp: 'บทต่อไป: เปรียบเทียบราคา — แบบไหนคุ้มกว่า',
    }),
  ],
});
