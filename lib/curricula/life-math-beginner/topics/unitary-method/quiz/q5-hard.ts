import type { Lesson } from '@/types/curriculum';
import { lesson, miniQuiz, reflection } from '@/lib/curricula/helpers/lesson-builders';
import { H1, H2, H3, H4, H5, H6, H7 } from '../content/questions';

const SUB = 'life-math-unitary';

export const quiz5: Lesson = lesson({
  id: `${SUB}-quiz-5`,
  subTopicId: SUB,
  order: 104,
  title: '🏆 Final Quiz · Level 5 — ยากสุด',
  description: '7 ข้อ — โจทย์รวม สัดส่วนผกผัน เลือกของคุ้ม',
  estimatedMinutes: 15,
  kind: 'quiz',
  isAssessment: true,
  learningObjectives: ['ผ่านโจทย์บัญญัติไตรยางศ์ยากสุด'],
  steps: [
    miniQuiz({
      id: `${SUB}-quiz-5-s1`,
      title: 'Level 5 · 7 ข้อ',
      questions: [H1.question, H2.question, H3.question, H4.question, H5.question, H6.question, H7.question],
      passingScore: 0.7,
      starsOnPass: 5,
      starsOnPerfect: 8,
    }),
    reflection({
      id: `${SUB}-quiz-5-s2`,
      title: 'จบ Unitary Method! 🎉',
      keyTakeaways: [
        'คุณเชี่ยวชาญบัญญัติไตรยางศ์แล้ว',
        'ใช้ในชีวิตประจำวันได้เลย',
      ],
    }),
  ],
});
