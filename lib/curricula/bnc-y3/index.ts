// lib/curricula/bnc-y3/index.ts
//
// British National Curriculum — Year 3 entry point.
// Phase 1: only Fractions > Adding Fractions has content.

import type { Curriculum, Topic } from '@/types/curriculum';
import { bncY3Meta } from './meta';
import { fractionsTopic } from './topics/fractions';

// Phase 2+ will add: place-value, addition-subtraction, multiplication-division,
// measurement, geometry, time, money, statistics.
const topics: Topic[] = [fractionsTopic];

export const bncY3: Curriculum = {
  ...bncY3Meta,
  topics,
};
