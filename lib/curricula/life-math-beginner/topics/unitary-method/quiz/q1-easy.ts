import type { Lesson } from '@/types/curriculum';
import { lesson, miniQuiz, reflection } from '@/lib/curricula/helpers/lesson-builders';
import { E1, E2, E3, E4, E5, E6 } from '../content/questions';

const SUB = 'life-math-unitary';

export const quiz1: Lesson = lesson({
  id: `${SUB}-quiz-1`,
  subTopicId: SUB,
  order: 100,
  title: 'Final Quiz · Level 1 (ง่ายมาก)',
  description: '6 ข้อ — ราคาต่อ 1 หน่วย และคูณกลับเลขกลม',
  estimatedMinutes: 8,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: ['ทดสอบสูตรพื้นฐาน'],
  steps: [
    miniQuiz({
      id: `${SUB}-quiz-1-s1`,
      title: 'Level 1 · 6 ข้อ',
      questions: [E1.question, E2.question, E3.question, E4.question, E5.question, E6.question],
      passingScore: 0.66,
      starsOnPass: 1,
      starsOnPerfect: 2,
    }),
    reflection({
      id: `${SUB}-quiz-1-s2`,
      title: 'ผ่าน Level 1!',
      keyTakeaways: ['Level 2 ปลดล็อกแล้ว'],
    }),
  ],
});
