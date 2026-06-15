// lessons/l4-tricks-and-word-problems.ts
//
// Lesson 4 — combine mental tricks with real-world word problems
// (inverse relationships: more workers → fewer days, more cars → more fuel).

import type { Lesson } from '@/types/curriculum';
import {
  guidedPractice,
  independentPractice,
  lesson,
  reflection,
  workedExample,
} from '@/lib/curricula/helpers/lesson-builders';
import { callout, text } from '@/lib/curricula/helpers/visual-builders';
import { C_unitaryTricks } from '../content/concepts';
import { M4, M5, H1, H2, H4, H5, H7 } from '../content/questions';

const SUB = 'life-math-unitary';

export const lesson4: Lesson = lesson({
  id: `${SUB}-l4`,
  subTopicId: SUB,
  order: 4,
  title: '🚀 เทคนิคคิดเร็ว + โจทย์ผสม',
  description: 'ใช้กับเวลา ระยะทาง คนทำงาน — ไม่ใช่แค่ราคา',
  estimatedMinutes: 25,
  kind: 'lesson',
  learningObjectives: [
    'ใช้บัญญัติไตรยางศ์กับโจทย์เวลา/ระยะทาง/คนทำงาน',
    'แยกแยะ "สัดส่วนตรง" กับ "สัดส่วนผกผัน"',
    'ใช้เทคนิคคิดเร็วช่วยตัดสินใจ',
  ],
  steps: [
    C_unitaryTricks,

    workedExample({
      id: `${SUB}-l4-s2`,
      title: 'ทำให้ดู — รถวิ่ง',
      problemStatement: 'รถวิ่ง 60 กม. ใช้น้ำมัน 4 ลิตร — วิ่ง 150 กม. ใช้กี่ลิตร?',
      steps: [
        {
          narration: 'นี่คือ**สัดส่วนตรง** — ระยะทางมาก = ใช้น้ำมันมาก',
        },
        {
          narration:
            '**ขั้น 1**: น้ำมัน 1 ลิตร วิ่งได้กี่กม.? → 60 ÷ 4 = **15 กม./ลิตร**',
          formula: '60 ÷ 4 = 15',
        },
        {
          narration: '**ขั้น 2**: 150 กม. ÷ 15 = **10 ลิตร**',
          formula: '150 ÷ 15 = 10',
        },
      ],
    }),

    workedExample({
      id: `${SUB}-l4-s3`,
      title: 'ทำให้ดู — สัดส่วนผกผัน',
      problemStatement: 'คนงาน 4 คน ทำเสร็จใน 12 วัน — ถ้า 8 คนล่ะ?',
      steps: [
        {
          narration:
            '**สัดส่วนผกผัน** — คนมากขึ้น → เวลาน้อยลง (ตรงข้ามกัน)',
        },
        {
          narration:
            '**คิดเป็น "คน-วัน"** (total work) — 4 คน × 12 วัน = **48 คน-วัน**',
          formula: '4 × 12 = 48',
        },
        {
          narration: 'ถ้ามี 8 คน → 48 ÷ 8 = **6 วัน**',
          formula: '48 ÷ 8 = 6',
        },
        {
          narration:
            '⚡ ทางลัด: คนเพิ่มเป็น 2 เท่า → เวลาลดเหลือครึ่งหนึ่ง (12 ÷ 2 = 6)',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l4-s4`,
      title: 'พิมพ์งาน',
      question: M5.question,
      hints: ['1 หน้า ใช้กี่นาที? 30÷6 = 5', '10 × 5 = ?'],
      fullExplanation: '30÷6 = 5 นาที/หน้า → 10 × 5 = 50 นาที',
    }),

    guidedPractice({
      id: `${SUB}-l4-s5`,
      title: 'รถวิ่ง',
      question: H2.question,
      hints: ['60÷4 = 15 กม./ลิตร', '150÷15 = ?'],
      fullExplanation: '60÷4 = 15 → 150÷15 = 10 ลิตร',
    }),

    guidedPractice({
      id: `${SUB}-l4-s6`,
      title: 'คนงาน 8 คน',
      question: H1.question,
      hints: ['4×12 = 48 คน-วัน', '48÷8 = ?'],
      fullExplanation: '4×12 = 48 → 48÷8 = 6 วัน',
    }),

    guidedPractice({
      id: `${SUB}-l4-s7`,
      title: 'ห่อกระดาษ',
      question: H5.question,
      hints: ['1 กล่อง ใช้กระดาษกี่แผ่น? 18÷6 = 3', '15 × 3 = ?'],
      fullExplanation: '18÷6 = 3 แผ่น/กล่อง → 15 × 3 = 45 แผ่น',
    }),

    guidedPractice({
      id: `${SUB}-l4-s8`,
      title: 'ปั๊มน้ำ (ผกผัน)',
      question: H7.question,
      hints: ['3 × 40 = 120 ปั๊ม-นาที (รวม)', '120 ÷ 5 = ?'],
      fullExplanation: '3×40 = 120 → 120÷5 = 24 นาที',
    }),

    independentPractice({
      id: `${SUB}-l4-mini`,
      title: '🎯 ฝึกท้ายบท — 4 ข้อ',
      questions: [M4.question, H2.question, H4.question, H5.question],
      passingScore: 0.6,
    }),

    reflection({
      id: `${SUB}-l4-s10`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**สัดส่วนตรง**: ทางมาก → ใช้มาก (ระยะทาง, จำนวนซื้อ)',
        '**สัดส่วนผกผัน**: คนมาก → เวลาน้อย (คน-วัน รวมคงที่)',
        'บัญญัติไตรยางศ์ใช้กับทุกอย่าง ไม่ใช่แค่ราคา',
      ],
      nextUp: 'ทดสอบรวม — Final Quiz 5 level',
    }),
  ],
});
