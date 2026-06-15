// lessons/l1-price-per-unit.ts
//
// Lesson 1 — find price per unit. The "250฿ for 50 cups → ?/cup" prototype
// question the user asked for is the spine of this lesson.

import type { Lesson } from '@/types/curriculum';
import {
  guidedPractice,
  independentPractice,
  lesson,
  reflection,
  workedExample,
} from '@/lib/curricula/helpers/lesson-builders';
import { text } from '@/lib/curricula/helpers/visual-builders';
import { C_pricePerUnit, C_whatIsUnitary } from '../content/concepts';
import { E1, E2, E3, E7, E8 } from '../content/questions';

const SUB = 'life-math-unitary';

export const lesson1: Lesson = lesson({
  id: `${SUB}-l1`,
  subTopicId: SUB,
  order: 1,
  title: '🛒 ราคาต่อ 1 หน่วย',
  description: 'ซื้อแก้ว 250 บาท ได้ 50 ใบ ใบละกี่บาท — สูตรพื้นฐาน',
  estimatedMinutes: 18,
  kind: 'lesson',
  learningObjectives: [
    'อธิบายความหมายของ "บัญญัติไตรยางศ์" ได้',
    'หาราคาต่อ 1 หน่วยจากของจำนวนใดๆ ได้',
  ],
  steps: [
    C_whatIsUnitary,

    workedExample({
      id: `${SUB}-l1-s2`,
      title: 'ทำให้ดู — แก้ว 50 ใบ 250 บาท',
      problemStatement: 'แก้ว 50 ใบ ราคา 250 บาท — ใบละกี่บาท?',
      steps: [
        {
          narration: '**สูตร**: ราคาต่อ 1 = ราคาทั้งหมด ÷ จำนวน',
        },
        {
          narration:
            'แทนค่า: 250 ÷ 50',
          formula: '250 ÷ 50 = 5',
        },
        {
          narration: 'ดังนั้น **ใบละ 5 บาท**',
        },
      ],
    }),

    C_pricePerUnit,

    guidedPractice({
      id: `${SUB}-l1-s4`,
      title: 'ลองทำเอง — แก้ว 50 ใบ 250 บาท',
      question: E1.question,
      hints: ['ราคาต่อ 1 = ราคาทั้งหมด ÷ จำนวน', '250 ÷ 50 = ?'],
      fullExplanation: '250 ÷ 50 = 5 บาท/ใบ',
    }),

    guidedPractice({
      id: `${SUB}-l1-s5`,
      title: 'ไข่ 30 ฟอง 120 บาท',
      question: E2.question,
      hints: ['120 ÷ 30 = ?', '120 ÷ 30 = 4'],
      fullExplanation: '120 ÷ 30 = 4 บาท/ฟอง',
    }),

    guidedPractice({
      id: `${SUB}-l1-s6`,
      title: 'ดินสอ 5 แท่ง 45 บาท',
      question: E3.question,
      hints: ['45 ÷ 5 = ?'],
      fullExplanation: '45 ÷ 5 = 9 บาท/แท่ง',
    }),

    independentPractice({
      id: `${SUB}-l1-mini`,
      title: '🎯 ฝึกท้ายบท — 3 ข้อ',
      questions: [E7.question, E8.question, E2.question],
      passingScore: 0.66,
    }),

    reflection({
      id: `${SUB}-l1-s8`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**บัญญัติไตรยางศ์** = คำนวณจากของ 1 หน่วย',
        '**สูตร**: ราคาทั้งหมด ÷ จำนวน = ราคาต่อ 1',
        'หาราคาต่อ 1 ก่อน → ทำอะไรต่อก็ง่าย',
      ],
      nextUp: 'บทต่อไป: คูณกลับ — รู้ราคาต่อ 1 แล้วหาราคาของหลายชิ้น',
    }),
  ],
});
