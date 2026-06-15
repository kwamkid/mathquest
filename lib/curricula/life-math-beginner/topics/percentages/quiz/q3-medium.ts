// quiz/q3-medium.ts — Final Quiz Level 3 (pure medium).

import type { Lesson } from '@/types/curriculum';
import {
  lesson,
  miniQuiz,
  reflection,
} from '@/lib/curricula/helpers/lesson-builders';
import { M2, M5, M6, M7, M8, M9, M10 } from '../content/questions';

const SUB = 'life-math-percentages';

export const quiz3: Lesson = lesson({
  id: `${SUB}-quiz-3`,
  subTopicId: SUB,
  order: 102,
  title: '🏆 Final Quiz · Level 3 — ปานกลาง',
  description: '7 ข้อ — % ที่ไม่ลงตัวง่าย และโจทย์ปัญหาเริ่มต้น',
  estimatedMinutes: 12,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: ['คำนวณ % ผสมแบบที่ต้องแตกเป็นชิ้นย่อย'],
  steps: [
    miniQuiz({
      id: `${SUB}-quiz-3-s1`,
      title: 'Level 3 · 7 ข้อ',
      questions: [
        M2.question, M5.question, M6.question, M7.question,
        M8.question, M9.question, M10.question,
      ],
      passingScore: 0.7,
      starsOnPass: 3,
      starsOnPerfect: 4,
    }),
    reflection({
      id: `${SUB}-quiz-3-s2`,
      title: 'Level 3 ผ่านแล้ว',
      keyTakeaways: ['Level 4 จะเป็นโจทย์ปัญหาจริงในชีวิตประจำวัน'],
    }),
  ],
});
