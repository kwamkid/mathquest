// lib/curricula/bnc-y3/meta.ts
//
// British National Curriculum — Year 3 metadata.
// Used by both the curriculum object and the curriculum browser UI.

import { Grade } from '@/types';

export const bncY3Meta = {
  id: 'bnc-y3',
  name: 'British National Curriculum',
  fullName: 'British National Curriculum — Year 3 Mathematics',
  description:
    'หลักสูตรคณิตศาสตร์ระดับ Year 3 ของอังกฤษ ครอบคลุมจำนวน เศษส่วน การวัด เรขาคณิต และสถิติ — สอดคล้องกับ UK National Curriculum Key Stage 2',
  publisher: 'UK Department for Education',
  region: 'UK / International Schools',
  targetAge: '7-8 years',
  gradeLevel: Grade.P3,
  language: 'mixed' as const,
  topicTags: [
    'place-value',
    'addition-subtraction',
    'multiplication-division',
    'fractions',
    'measurement-length',
    'measurement-mass',
    'measurement-capacity',
    'money',
    'time',
    'geometry-shapes',
    'geometry-angles',
    'geometry-perimeter',
    'statistics',
  ],
  version: '1.0.0',
};
