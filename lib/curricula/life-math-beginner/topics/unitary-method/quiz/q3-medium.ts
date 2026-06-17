import type { Lesson } from '@/types/curriculum';
import { lesson, miniQuiz, reflection } from '@/lib/curricula/helpers/lesson-builders';
import { M3, M4, M5, M6, M7, M8 } from '../content/questions';

const SUB = 'life-math-unitary';

export const quiz3: Lesson = lesson({
  id: `${SUB}-quiz-3`,
  subTopicId: SUB,
  order: 102,
  title: 'Final Quiz · Level 3 (ปานกลาง)',
  description: '6 ข้อ — โจทย์ 2 ขั้น และเปรียบเทียบราคา',
  estimatedMinutes: 12,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: ['แก้โจทย์ 2 ขั้น (หาร → คูณ)'],
  steps: [
    miniQuiz({
      id: `${SUB}-quiz-3-s1`,
      title: 'Level 3 · 6 ข้อ',
      questions: [M3.question, M4.question, M5.question, M6.question, M7.question, M8.question],
      passingScore: 0.7,
      starsOnPass: 3,
      starsOnPerfect: 4,
    }),
    reflection({
      id: `${SUB}-quiz-3-s2`,
      title: 'Level 3 ผ่านแล้ว',
      keyTakeaways: ['Level 4 จะเป็นโจทย์ปัญหายาก'],
    }),
  ],
});
