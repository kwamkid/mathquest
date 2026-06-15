// mini-quizzes/m2-after-lesson-2.ts — reinforce L2 (unitary method).

import type { Lesson } from '@/types/curriculum';
import {
  independentPractice,
  lesson,
} from '@/lib/curricula/helpers/lesson-builders';
import { E10, M3, M5, M6 } from '../content/questions';

const SUB = 'life-math-percentages';

export const mini2: Lesson = lesson({
  id: `${SUB}-mini-2`,
  subTopicId: SUB,
  order: 12,
  title: 'ฝึกหลังบทที่ 2 — 4 ข้อ 🎯',
  description: 'ทดสอบสูตรบัญญัติไตรยางศ์',
  estimatedMinutes: 5,
  kind: 'mini',
  learningObjectives: ['ใช้สูตร X% × N ÷ 100 ได้คล่อง'],
  steps: [
    independentPractice({
      id: `${SUB}-mini-2-s1`,
      title: '4 ข้อสั้นๆ',
      questions: [E10.question, M3.question, M5.question, M6.question],
      passingScore: 0.6,
    }),
  ],
});
