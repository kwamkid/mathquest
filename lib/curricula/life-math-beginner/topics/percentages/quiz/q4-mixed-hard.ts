// quiz/q4-mixed-hard.ts — Final Quiz Level 4 (medium + hard word problems).

import type { Lesson } from '@/types/curriculum';
import {
  lesson,
  miniQuiz,
  reflection,
} from '@/lib/curricula/helpers/lesson-builders';
import { M9, M10, H1, H2, H4, H5, H9, H10 } from '../content/questions';

const SUB = 'life-math-percentages';

export const quiz4: Lesson = lesson({
  id: `${SUB}-quiz-4`,
  subTopicId: SUB,
  order: 103,
  title: '🏆 Final Quiz · Level 4 — ยาก',
  description: '8 ข้อ — โจทย์ลดราคา VAT และสถานการณ์จริง',
  estimatedMinutes: 15,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: ['แก้โจทย์ % แบบสถานการณ์จริง'],
  steps: [
    miniQuiz({
      id: `${SUB}-quiz-4-s1`,
      title: 'Level 4 · 8 ข้อ',
      questions: [
        M9.question, M10.question,
        H1.question, H2.question, H4.question,
        H5.question, H9.question, H10.question,
      ],
      passingScore: 0.7,
      starsOnPass: 4,
      starsOnPerfect: 5,
    }),
    reflection({
      id: `${SUB}-quiz-4-s2`,
      title: 'Level 4 ผ่านแล้ว',
      keyTakeaways: ['Level 5 คือด่านสุดท้าย — โจทย์ยากสุด'],
    }),
  ],
});
