// quiz/q5-hard.ts — Final Quiz Level 5 (hardest — two-step word problems).

import type { Lesson } from '@/types/curriculum';
import {
  lesson,
  miniQuiz,
  reflection,
} from '@/lib/curricula/helpers/lesson-builders';
import { H3, H5, H6, H7, H8, H9, H10 } from '../content/questions';

const SUB = 'life-math-percentages';

export const quiz5: Lesson = lesson({
  id: `${SUB}-quiz-5`,
  subTopicId: SUB,
  order: 104,
  title: '🏆 Final Quiz · Level 5 — ยากสุด',
  description: '7 ข้อ — โจทย์รวม VAT + ส่วนลด + คำนวณซ้อน',
  estimatedMinutes: 15,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: ['ผ่านโจทย์ % ยากที่สุดของระดับเริ่มต้น'],
  steps: [
    miniQuiz({
      id: `${SUB}-quiz-5-s1`,
      title: 'Level 5 · 7 ข้อ',
      questions: [
        H3.question, H5.question, H6.question, H7.question,
        H8.question, H9.question, H10.question,
      ],
      passingScore: 0.7,
      starsOnPass: 5,
      starsOnPerfect: 8,
    }),
    reflection({
      id: `${SUB}-quiz-5-s2`,
      title: 'จบ Percentages ทั้งหมด! 🎉',
      keyTakeaways: [
        'คุณเชี่ยวชาญ % แล้ว!',
        'ดาวที่ได้สะสมเข้า EXP รวม',
      ],
    }),
  ],
});
