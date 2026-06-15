// lessons/l4-word-problems.ts
//
// Lesson 4 — applied word problems: discounts, VAT, exam scores.
// Last "teaching" lesson; the final quiz comes next.

import type { Lesson } from '@/types/curriculum';
import {
  guidedPractice,
  lesson,
  reflection,
  workedExample,
} from '@/lib/curricula/helpers/lesson-builders';
import { C_realWorldPercent } from '../content/concepts';
import { H1, H2, H4, H5, H9, H10, M9, M10 } from '../content/questions';

const SUB = 'life-math-percentages';

export const lesson4: Lesson = lesson({
  id: `${SUB}-l4`,
  subTopicId: SUB,
  order: 4,
  title: 'โจทย์ปัญหาในชีวิตจริง 🛍',
  description: 'ลดราคา ภาษี และคะแนนสอบ — ใช้ % ในชีวิตประจำวัน',
  estimatedMinutes: 25,
  kind: 'lesson',
  learningObjectives: [
    'คำนวณส่วนลด และราคาหลังลด',
    'คำนวณ VAT 7%',
    'แปลคะแนนเป็นเปอร์เซ็นต์',
  ],
  steps: [
    C_realWorldPercent,

    workedExample({
      id: `${SUB}-l4-s2`,
      title: 'ลดราคา — เสื้อ 500 บาท ลด 20%',
      problemStatement: 'เสื้อราคา 500 บาท ลด 20% ส่วนลดและราคาจริงคือเท่าไร?',
      steps: [
        {
          narration: '**ขั้นที่ 1**: หาส่วนลด = 20% ของ 500',
        },
        {
          narration: '10% ของ 500 = 50 → 20% = **100 บาท**',
          formula: '500 × 20 ÷ 100 = 100',
        },
        {
          narration: '**ขั้นที่ 2**: ราคาจริง = 500 − 100 = **400 บาท**',
          formula: '500 − 100 = 400',
        },
        {
          narration:
            '**ทางลัด**: ลด 20% = จ่าย 80% → 500 × 80 ÷ 100 = 400 (ได้คำตอบเดียวกัน)',
        },
      ],
    }),

    workedExample({
      id: `${SUB}-l4-s3`,
      title: 'VAT — อาหาร 200 บาท + VAT 7%',
      problemStatement: 'อาหาร 200 บาท + VAT 7% รวมจ่ายเท่าไร?',
      steps: [
        {
          narration: 'หา VAT = 7% ของ 200',
        },
        {
          narration: '1% ของ 200 = 2 → 7% = 7 × 2 = **14 บาท**',
          formula: '200 × 7 ÷ 100 = 14',
        },
        {
          narration: 'รวมจ่าย = 200 + 14 = **214 บาท**',
          formula: '200 + 14 = 214',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l4-s4`,
      title: 'ส่วนลดเท่าไร?',
      question: H1.question,
      hints: ['20% ของ 500 = ?', '10% = 50 → 20% = 100'],
      fullExplanation: '20% ของ 500 = 100 บาท',
    }),

    guidedPractice({
      id: `${SUB}-l4-s5`,
      title: 'ราคาจริงหลังลด',
      question: H2.question,
      hints: ['ส่วนลด 100 บาท (จากข้อแล้ว)', '500 − 100 = ?'],
      fullExplanation: '500 − 100 = 400 บาท',
    }),

    guidedPractice({
      id: `${SUB}-l4-s6`,
      title: 'กระเป๋า 800 บาท ลด 25%',
      question: H4.question,
      hints: ['ลด 25% = จ่าย 75%', '25% ของ 800 = 200 → 800 − 200 = ?'],
      fullExplanation: '25% ของ 800 = 200 → 800 − 200 = **600 บาท**',
    }),

    guidedPractice({
      id: `${SUB}-l4-s7`,
      title: 'ส่วนลดรองเท้า',
      question: H5.question,
      hints: ['10% ของ 1,200 = 120', '30% = 10% × 3 = 360'],
      fullExplanation: '30% ของ 1,200 = 360 บาท',
    }),

    guidedPractice({
      id: `${SUB}-l4-s8`,
      title: 'แปลคะแนนสอบ',
      question: M9.question,
      hints: ['สูตร: (ที่ถูก × 100) ÷ เต็ม', '18 × 100 ÷ 20 = ?'],
      fullExplanation: '18 / 20 = 0.9 → 90%',
    }),

    guidedPractice({
      id: `${SUB}-l4-s9`,
      title: 'พิซซ่ากินไปกี่ %',
      question: M10.question,
      hints: ['สูตรเดียวกัน: (กิน × 100) ÷ เต็ม', '2 × 100 ÷ 8 = ?'],
      fullExplanation: '2 / 8 = 0.25 → 25%',
    }),

    guidedPractice({
      id: `${SUB}-l4-s10`,
      title: 'เงินสะสมหลังใช้',
      question: H9.question,
      hints: ['ใช้ 25% = เหลือ 75%', '75% ของ 800 = ?'],
      fullExplanation: '25% ของ 800 = 200 → 800 − 200 = 600 บาท',
    }),

    guidedPractice({
      id: `${SUB}-l4-s11`,
      title: 'นักเรียนผู้หญิงกี่คน',
      question: H10.question,
      hints: ['60% ของ 250 = ?', '10% = 25 → 60% = 25 × 6 = 150'],
      fullExplanation: '60% ของ 250 = 150 คน',
    }),

    reflection({
      id: `${SUB}-l4-s12`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**ลดราคา**: หาส่วนลด → ลบจากราคาเดิม (หรือคูณ % ที่จ่ายเลย)',
        '**VAT**: บวกเพิ่ม — ราคา + (% × ราคา ÷ 100)',
        '**คะแนน → %**: (ที่ถูก × 100) ÷ เต็ม',
      ],
      nextUp: 'ทดสอบรวม — Final Quiz 20 ข้อ ได้ดาว+EXP',
    }),
  ],
});
