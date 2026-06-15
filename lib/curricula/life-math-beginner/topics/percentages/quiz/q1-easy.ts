// quiz/q1-easy.ts — Final Quiz Level 1 (easiest).
// Pulls 6 easy questions; pass = 4/6. Stars + EXP via miniQuiz step.

import type { Lesson } from '@/types/curriculum';
import {
  lesson,
  miniQuiz,
  reflection,
} from '@/lib/curricula/helpers/lesson-builders';
import { E1, E2, E3, E5, E7, E9 } from '../content/questions';

const SUB = 'life-math-percentages';

export const quiz1: Lesson = lesson({
  id: `${SUB}-quiz-1`,
  subTopicId: SUB,
  order: 100,
  title: '🏆 Final Quiz · Level 1 — ง่ายมาก',
  description: '6 ข้อง่ายๆ — ทบทวน 100%, 50%, 25%, 10%',
  estimatedMinutes: 8,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: ['ทดสอบความเข้าใจ % พื้นฐาน'],
  steps: [
    miniQuiz({
      id: `${SUB}-quiz-1-s1`,
      title: 'Level 1 · 6 ข้อ',
      questions: [
        E1.question, E2.question, E3.question,
        E5.question, E7.question, E9.question,
      ],
      passingScore: 0.66,
      starsOnPass: 1,
      starsOnPerfect: 2,
    }),
    reflection({
      id: `${SUB}-quiz-1-s2`,
      title: 'ผ่าน Level 1!',
      keyTakeaways: ['Level 2 จะปลดล็อกแล้ว ลองต่อกันเลย'],
    }),
  ],
});
