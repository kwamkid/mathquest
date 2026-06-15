// lib/curricula/life-math-beginner/index.ts
//
// Life Math — beginner curriculum entry point.
// Phase 1: only Percentages has content. Unitary Method ships next.

import type { Curriculum, Topic } from '@/types/curriculum';
import { lifeMathBeginnerMeta } from './meta';
import { percentagesTopic } from './topics/percentages';

const topics: Topic[] = [percentagesTopic];

export const lifeMathBeginner: Curriculum = {
  ...lifeMathBeginnerMeta,
  topics,
};
