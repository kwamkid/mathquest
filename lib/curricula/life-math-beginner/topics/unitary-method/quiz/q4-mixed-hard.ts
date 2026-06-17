import type { Lesson } from '@/types/curriculum';
import { lesson, miniQuiz, reflection } from '@/lib/curricula/helpers/lesson-builders';
import { M4, M5, M6, H1, H2, H3, H5 } from '../content/questions';

const SUB = 'life-math-unitary';

export const quiz4: Lesson = lesson({
  id: `${SUB}-quiz-4`,
  subTopicId: SUB,
  order: 103,
  title: 'Final Quiz · Level 4 (ยาก)',
  description: '7 ข้อ — โจทย์ผสม รถยนต์ คนงาน เปรียบเทียบราคา',
  estimatedMinutes: 15,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: ['ใช้บัญญัติไตรยางศ์กับสถานการณ์จริง'],
  steps: [
    miniQuiz({
      id: `${SUB}-quiz-4-s1`,
      title: 'Level 4 · 7 ข้อ',
      questions: [M4.question, M5.question, M6.question, H1.question, H2.question, H3.question, H5.question],
      passingScore: 0.7,
      starsOnPass: 4,
      starsOnPerfect: 5,
    }),
    reflection({
      id: `${SUB}-quiz-4-s2`,
      title: 'Level 4 ผ่านแล้ว',
      keyTakeaways: ['Level 5 ด่านสุดท้าย — สัดส่วนผกผัน'],
    }),
  ],
});
