// quiz/q2-mixed-easy.ts — Final Quiz Level 2 (easy + early medium).

import type { Lesson } from '@/types/curriculum';
import {
  lesson,
  miniQuiz,
  reflection,
} from '@/lib/curricula/helpers/lesson-builders';
import { E4, E6, E8, E10, M1, M3, M4 } from '../content/questions';

const SUB = 'life-math-percentages';

export const quiz2: Lesson = lesson({
  id: `${SUB}-quiz-2`,
  subTopicId: SUB,
  order: 101,
  title: '🏆 Final Quiz · Level 2 — ง่าย',
  description: '7 ข้อ — เริ่มมีตัวเลขใหญ่ขึ้น',
  estimatedMinutes: 10,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: ['คำนวณ % ของจำนวนเลขกลมได้คล่อง'],
  steps: [
    miniQuiz({
      id: `${SUB}-quiz-2-s1`,
      title: 'Level 2 · 7 ข้อ',
      questions: [
        E4.question, E6.question, E8.question, E10.question,
        M1.question, M3.question, M4.question,
      ],
      passingScore: 0.7,
      starsOnPass: 2,
      starsOnPerfect: 3,
    }),
    reflection({
      id: `${SUB}-quiz-2-s2`,
      title: 'Level 2 ผ่านแล้ว',
      keyTakeaways: ['Level 3 จะใช้สูตรบัญญัติไตรยางศ์เต็มที่'],
    }),
  ],
});
