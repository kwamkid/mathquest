// lib/timetable/curriculum.ts
//
// Adapts the runtime timetable config into a synthetic `Curriculum` object so
// the สูตรคูณ landing can render through the SAME shared <CurriculumTimeline>
// the /learn and /life-math pages use — one accordion per table, a numbered
// list of rounds inside. No real lesson content lives here (steps are empty);
// the round player generates questions at runtime. Lesson ids deliberately
// match roundId(table, round) so the existing completedLessonIds light up.

import type { Curriculum, Lesson, SubTopic, Topic } from '@/types/curriculum';
import { Grade } from '@/types';
import { ROUNDS, TABLE_ORDER } from './config';
import { roundId, TIMETABLE_CURRICULUM_ID } from './progress';

// ~20 questions/round at a few seconds each ≈ a couple of minutes.
const MINUTES_PER_ROUND = 2;

export const subTopicIdForTable = (table: number) => `tt-table-${table}`;

function buildTableSubTopic(table: number, index: number): SubTopic {
  const lessons: Lesson[] = ROUNDS.map((r) => ({
    id: roundId(table, r.round),
    subTopicId: subTopicIdForTable(table),
    order: r.round,
    title: `${r.thaiLabel}`,
    description: r.enLabel,
    estimatedMinutes: MINUTES_PER_ROUND,
    steps: [],
    learningObjectives: [],
    kind: 'lesson',
  }));

  // Each table requires the previous one in TABLE_ORDER (first has none).
  const prerequisites =
    index > 0 ? [subTopicIdForTable(TABLE_ORDER[index - 1])] : [];

  return {
    id: subTopicIdForTable(table),
    topicId: 'tt-topic',
    slug: String(table),
    title: `Table of ${table}`,
    thaiTitle: `แม่ ${table} · ×${table}`,
    description: `ฝึกแม่ ${table} ${ROUNDS.length} รอบ`,
    learningObjectives: [],
    prerequisites,
    estimatedTotalMinutes: MINUTES_PER_ROUND * ROUNDS.length,
    order: index + 1,
    lessons,
  };
}

export function buildTimetableCurriculum(): Curriculum {
  const topic: Topic = {
    id: 'tt-topic',
    curriculumId: TIMETABLE_CURRICULUM_ID,
    slug: 'tables',
    title: 'Multiplication Tables',
    thaiTitle: 'สูตรคูณ',
    description: 'ฝึกท่องสูตรคูณซ้ำๆ จนจำได้ขึ้นใจ',
    iconName: 'calculator',
    order: 1,
    subTopics: TABLE_ORDER.map((table, i) => buildTableSubTopic(table, i)),
  };

  return {
    id: TIMETABLE_CURRICULUM_ID,
    name: 'สูตรคูณ',
    fullName: 'Multiplication Tables Drill',
    description: 'ฝึกท่องสูตรคูณซ้ำๆ จนจำได้ขึ้นใจ',
    publisher: 'MathQuest',
    region: 'TH',
    targetAge: '7-10',
    gradeLevel: Grade.P2,
    language: 'mixed',
    topicTags: ['multiplication', 'tables'],
    topics: [topic],
    version: '1.0.0',
  };
}
