// quiz/final-quiz.ts — Percentages final assessment.
//
// Pulls 20 questions from the shared bank: 7 easy + 8 medium + 5 hard.
// Uses the miniQuiz step type so the lesson player tallies score and the
// curriculum-progress save awards stars + EXP (per the existing pipeline).

import type { Lesson } from '@/types/curriculum';
import {
  lesson,
  miniQuiz,
  reflection,
} from '@/lib/curricula/helpers/lesson-builders';
import {
  E1, E2, E3, E4, E5, E6, E10,                  // easy
  M1, M2, M3, M5, M6, M7, M8, M9,               // medium
  H1, H2, H4, H6, H10,                           // hard
} from '../content/questions';

const SUB = 'life-math-percentages';

export const finalQuiz: Lesson = lesson({
  id: `${SUB}-final-quiz`,
  subTopicId: SUB,
  order: 99, // sort to the very end of the chapter
  title: '🏆 Final Quiz — Percentages (20 ข้อ)',
  description:
    'ทดสอบรวมเปอร์เซ็นต์ 20 ข้อ — ได้ดาว+EXP ตอนผ่าน เพอร์เฟ็กต์ได้รางวัลพิเศษ',
  estimatedMinutes: 25,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: [
    'ใช้ % ในชีวิตประจำวันได้คล่อง',
    'แก้โจทย์ผสมระหว่างคำนวณตรงและโจทย์ปัญหา',
  ],
  steps: [
    miniQuiz({
      id: `${SUB}-final-quiz-s1`,
      title: 'Quiz รวม 20 ข้อ',
      questions: [
        // easy — 7 ข้อ
        E1.question, E2.question, E3.question, E4.question,
        E5.question, E6.question, E10.question,
        // medium — 8 ข้อ
        M1.question, M2.question, M3.question, M5.question,
        M6.question, M7.question, M8.question, M9.question,
        // hard — 5 ข้อ
        H1.question, H2.question, H4.question, H6.question, H10.question,
      ],
      passingScore: 0.7,
      starsOnPass: 5,
      starsOnPerfect: 10,
    }),

    reflection({
      id: `${SUB}-final-quiz-s2`,
      title: 'จบบทเปอร์เซ็นต์! 🎉',
      keyTakeaways: [
        '% = ต่อหนึ่งร้อย — ของทั้งหมด = 100%',
        'สูตร: N × X ÷ 100 | ทางลัด 10% = ÷10',
        'ลดราคา & VAT — ใช้บ่อยในชีวิตจริง',
      ],
    }),
  ],
});
