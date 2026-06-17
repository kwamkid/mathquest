// topics/unitary-method/index.ts — Unitary Method (บัญญัติไตรยางศ์).

import { subTopic, topic } from '@/lib/curricula/helpers/lesson-builders';
import { lesson1, lesson2, lesson3, lesson4 } from './lessons';
import { quiz1, quiz2, quiz3, quiz4, quiz5 } from './quiz';

const SUB_ID = 'life-math-unitary';

const unitarySubTopic = subTopic({
  id: SUB_ID,
  topicId: 'life-math-unitary-topic',
  slug: 'unitary-method',
  title: 'Unitary Method',
  thaiTitle: 'บัญญัติไตรยางศ์',
  description:
    'คิดจากของ 1 หน่วย — หาราคาต่อหน่วย คูณกลับ เปรียบเทียบราคา และโจทย์ปัญหาในชีวิตจริง',
  learningObjectives: [
    'หาราคาต่อ 1 หน่วยได้',
    'ใช้สูตร "คูณกลับ" หาราคารวมได้',
    'เปรียบเทียบราคา/หน่วยของ 2 ตัวเลือกได้',
    'แก้โจทย์ผสมที่ใช้บัญญัติไตรยางศ์ได้',
  ],
  estimatedTotalMinutes: 110,
  lessons: [
    lesson1,
    lesson2,
    lesson3,
    lesson4,
    quiz1,
    quiz2,
    quiz3,
    quiz4,
    quiz5,
  ],
  order: 1,
});

export const unitaryMethodTopic = topic({
  id: 'life-math-unitary-topic',
  curriculumId: 'life-math-beginner',
  slug: 'unitary-method',
  title: 'Unitary Method',
  thaiTitle: 'บัญญัติไตรยางศ์',
  description:
    'คณิตในชีวิตจริง — ซื้อของ หารราคา เปรียบเทียบของคุ้ม รถยนต์ คนงาน',
  icon: '🛒',
  order: 2,
  subTopics: [unitarySubTopic],
});
