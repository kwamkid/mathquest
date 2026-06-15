// topics/percentages/index.ts — wire the Percentages topic together.

import { subTopic, topic } from '@/lib/curricula/helpers/lesson-builders';
import { lesson1, lesson2, lesson3, lesson4 } from './lessons';
import { mini1, mini2, mini3, mini4 } from './mini-quizzes';
import { finalQuiz } from './quiz/final-quiz';

const SUB_ID = 'life-math-percentages';

const percentagesSubTopic = subTopic({
  id: SUB_ID,
  topicId: 'life-math-percentages-topic',
  slug: 'percentages',
  title: 'Percentages',
  thaiTitle: 'เปอร์เซ็นต์ — บัญญัติไตรยางศ์',
  description:
    'รู้จัก % คืออะไร เรียนสูตรบัญญัติไตรยางศ์ และฝึกใช้กับโจทย์จริงในชีวิตประจำวัน',
  learningObjectives: [
    'อธิบายความหมายของ % ได้',
    'ใช้สูตร X% × N ÷ 100 และทางลัด 10% ได้',
    'แก้โจทย์ลดราคา / VAT / คะแนนสอบได้',
  ],
  estimatedTotalMinutes: 95,
  order: 1,
  // Lessons render in this order; the chapter UI re-groups them by kind.
  lessons: [
    lesson1, mini1,
    lesson2, mini2,
    lesson3, mini3,
    lesson4, mini4,
    finalQuiz,
  ],
});

export const percentagesTopic = topic({
  id: 'life-math-percentages-topic',
  curriculumId: 'life-math-beginner',
  slug: 'percentages',
  title: 'Percentages',
  thaiTitle: 'เปอร์เซ็นต์',
  description:
    'เรียนเปอร์เซ็นต์จากต้น — สิ่งที่ใช้ได้จริงเวลาซื้อของและคิดส่วนลด',
  icon: '🧮',
  order: 1,
  subTopics: [percentagesSubTopic],
});
