// topics/percentages/index.ts — wire the Percentages topic together.

import { subTopic, topic } from '@/lib/curricula/helpers/lesson-builders';
import { lesson1, lesson2, lesson3, lesson4, lesson5 } from './lessons';
import { quiz1, quiz2, quiz3, quiz4, quiz5 } from './quiz';

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
  estimatedTotalMinutes: 110,
  order: 1,
  // Lesson timeline: 4 teaching lessons (each ends with a 🎯 mini practice
  // step embedded inside) followed by 5 final-quiz levels in ramping
  // difficulty. The chapter UI keeps this order in a single timeline.
  lessons: [
    lesson1,
    lesson2,
    lesson3,
    lesson4,
    lesson5,
    quiz1,
    quiz2,
    quiz3,
    quiz4,
    quiz5,
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
