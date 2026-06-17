import type { Lesson } from '@/types/curriculum';
import { lesson, miniQuiz, reflection } from '@/lib/curricula/helpers/lesson-builders';
import { E7, E8, M1, M2, M3, M7, M8 } from '../content/questions';

const SUB = 'life-math-unitary';

export const quiz2: Lesson = lesson({
  id: `${SUB}-quiz-2`,
  subTopicId: SUB,
  order: 101,
  title: 'Final Quiz · Level 2 (ง่าย)',
  description: '7 ข้อ — ราคาต่อหน่วยกับคูณกลับเลขใหญ่ขึ้น',
  estimatedMinutes: 10,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: ['คำนวณ ÷ และ × เลขที่ไม่ลงตัวง่าย'],
  steps: [
    miniQuiz({
      id: `${SUB}-quiz-2-s1`,
      title: 'Level 2 · 7 ข้อ',
      questions: [E7.question, E8.question, M1.question, M2.question, M3.question, M7.question, M8.question],
      passingScore: 0.7,
      starsOnPass: 2,
      starsOnPerfect: 3,
    }),
    reflection({
      id: `${SUB}-quiz-2-s2`,
      title: 'Level 2 ผ่านแล้ว',
      keyTakeaways: ['ต่อไปเป็นโจทย์ปัญหา'],
    }),
  ],
});
