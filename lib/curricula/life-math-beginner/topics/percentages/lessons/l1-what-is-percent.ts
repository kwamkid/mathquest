// lessons/l1-what-is-percent.ts
//
// Lesson 1 — introduce the meaning of "percent" with the 100-segment bar.
// Pulls the concept block from content/concepts.ts.

import type { Lesson } from '@/types/curriculum';
import {
  guidedPractice,
  independentPractice,
  lesson,
  reflection,
  workedExample,
} from '@/lib/curricula/helpers/lesson-builders';
import {
  callout,
  percentBar,
  text,
} from '@/lib/curricula/helpers/visual-builders';
import { C_whatIsPercent } from '../content/concepts';
import { E1, E2, E3, E4, E5, E6, E7, E8 } from '../content/questions';

const SUB = 'life-math-percentages';

export const lesson1: Lesson = lesson({
  id: `${SUB}-l1`,
  subTopicId: SUB,
  order: 1,
  title: '% คืออะไร 🎯',
  description: 'รู้จักความหมายของเปอร์เซ็นต์ — "ต่อหนึ่งร้อย"',
  estimatedMinutes: 15,
  kind: 'lesson',
  learningObjectives: [
    'อธิบายความหมายของ % ได้ ("ต่อหนึ่งร้อย")',
    'รู้จัก % ที่ใช้บ่อย: 100%, 50%, 25%, 10%',
  ],
  steps: [
    C_whatIsPercent,

    workedExample({
      id: `${SUB}-l1-s2`,
      title: 'ลองดู — ครึ่งหนึ่งของ 100 = กี่ %?',
      problemStatement: 'ครึ่งหนึ่งของ 100 = ?',
      steps: [
        {
          narration:
            'นึกถึงพิซซ่า 100 ชิ้น — ถ้าแบ่งครึ่ง แต่ละครึ่งจะมี **50 ชิ้น**',
          visual: percentBar(50, 'ครึ่งหนึ่ง = 50/100'),
        },
        {
          narration:
            '50 ชิ้น จาก 100 ชิ้น = **50/100** ซึ่งภาษาเปอร์เซ็นต์เรียกว่า **50%**',
        },
        {
          narration: 'ดังนั้น ครึ่งของ 100 = **50%**',
          formula: '50/100 = 50%',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l1-s3`,
      title: 'ลองตอบดู',
      question: E1.question,
      hints: [
        '100 ทั้งหมด = ของทั้งหมดเลย — เป็น 100%',
        'ถ้ามี 100 และเอามาทั้งหมด — เปอร์เซ็นต์เต็มที่',
      ],
      fullExplanation:
        'ของทั้งหมด = 100% เสมอ — 100 จาก 100 = 100/100 = 100%',
    }),

    guidedPractice({
      id: `${SUB}-l1-s4`,
      title: '50% ใช่หรือไม่?',
      question: E2.question,
      hints: ['ครึ่งหนึ่ง = 50/100', '50/100 อ่านเป็นเปอร์เซ็นต์ได้เลย'],
      fullExplanation: 'ครึ่งหนึ่งของ 100 = 50 → 50/100 = **50%**',
    }),

    guidedPractice({
      id: `${SUB}-l1-s5`,
      title: '10% ของ 100 = ?',
      question: E3.question,
      hints: ['10% = 10/100', '10 จาก 100 — มันคือเลขอะไร?'],
      fullExplanation: '10% ของ 100 = 10/100 ของ 100 = **10**',
    }),

    // Mini quiz — merged into the lesson flow (no separate card).
    independentPractice({
      id: `${SUB}-l1-mini`,
      title: '🎯 ฝึกท้ายบท — 5 ข้อ',
      questions: [E4.question, E5.question, E6.question, E7.question, E8.question],
      passingScore: 0.6,
    }),

    reflection({
      id: `${SUB}-l1-s6`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**%** แปลว่า "ต่อหนึ่งร้อย"',
        'ของทั้งหมด = **100%** เสมอ',
        'ครึ่งหนึ่ง = **50%**, หนึ่งในสี่ = **25%**, หนึ่งในสิบ = **10%**',
      ],
      nextUp: 'บทต่อไป: บัญญัติไตรยางศ์ — สูตรหา % ของจำนวนใดๆ',
    }),
  ],
});
