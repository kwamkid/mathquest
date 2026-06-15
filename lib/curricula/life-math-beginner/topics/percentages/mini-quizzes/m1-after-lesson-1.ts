// mini-quizzes/m1-after-lesson-1.ts — reinforce L1 (what is %).
// Mini quiz: short, no reward. Pulls from the shared question bank.

import type { Lesson } from '@/types/curriculum';
import {
  independentPractice,
  lesson,
} from '@/lib/curricula/helpers/lesson-builders';
import { E4, E5, E6, E7, E8 } from '../content/questions';

const SUB = 'life-math-percentages';

export const mini1: Lesson = lesson({
  id: `${SUB}-mini-1`,
  subTopicId: SUB,
  order: 11,
  title: 'ฝึกหลังบทที่ 1 — 5 ข้อ 🎯',
  description: 'ทบทวน % ของจำนวนพื้นฐาน',
  estimatedMinutes: 5,
  kind: 'mini',
  learningObjectives: ['ทบทวน 10%, 25%, 50%'],
  steps: [
    independentPractice({
      id: `${SUB}-mini-1-s1`,
      title: '5 ข้อสั้นๆ',
      questions: [E4.question, E5.question, E6.question, E7.question, E8.question],
      passingScore: 0.6,
    }),
  ],
});
