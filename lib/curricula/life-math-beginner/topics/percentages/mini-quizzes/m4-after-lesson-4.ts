// mini-quizzes/m4-after-lesson-4.ts — reinforce L4 (word problems).

import type { Lesson } from '@/types/curriculum';
import {
  independentPractice,
  lesson,
} from '@/lib/curricula/helpers/lesson-builders';
import { H1, H2, H3, H4, H9 } from '../content/questions';

const SUB = 'life-math-percentages';

export const mini4: Lesson = lesson({
  id: `${SUB}-mini-4`,
  subTopicId: SUB,
  order: 14,
  title: 'ฝึกหลังบทที่ 4 — 5 ข้อ 🎯',
  description: 'ลดราคา VAT ฯลฯ',
  estimatedMinutes: 5,
  kind: 'mini',
  learningObjectives: ['แก้โจทย์ส่วนลด/VAT/เงินสะสม'],
  steps: [
    independentPractice({
      id: `${SUB}-mini-4-s1`,
      title: '5 ข้อสั้นๆ',
      questions: [H1.question, H2.question, H3.question, H4.question, H9.question],
      passingScore: 0.6,
    }),
  ],
});
