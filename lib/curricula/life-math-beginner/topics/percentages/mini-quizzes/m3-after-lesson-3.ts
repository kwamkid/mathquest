// mini-quizzes/m3-after-lesson-3.ts — reinforce L3 (harder numbers).

import type { Lesson } from '@/types/curriculum';
import {
  independentPractice,
  lesson,
} from '@/lib/curricula/helpers/lesson-builders';
import { M7, M8, H6, H7 } from '../content/questions';

const SUB = 'life-math-percentages';

export const mini3: Lesson = lesson({
  id: `${SUB}-mini-3`,
  subTopicId: SUB,
  order: 13,
  title: 'ฝึกหลังบทที่ 3 — 4 ข้อ 🎯',
  description: 'ทดสอบ % ของเลขที่ยากขึ้น',
  estimatedMinutes: 5,
  kind: 'mini',
  learningObjectives: ['คำนวณ % ของเลขใหญ่และไม่ลงตัวได้'],
  steps: [
    independentPractice({
      id: `${SUB}-mini-3-s1`,
      title: '4 ข้อสั้นๆ',
      questions: [M7.question, M8.question, H6.question, H7.question],
      passingScore: 0.6,
    }),
  ],
});
