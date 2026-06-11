// lib/curricula/bnc-y3/index.ts
//
// British National Curriculum — Year 3 entry point.
// Phase 1: Fractions (Adding/Subtracting) and Time (Reading the Clock).

import type { Curriculum, Topic } from '@/types/curriculum';
import { bncY3Meta } from './meta';
import { fractionsTopic } from './topics/fractions';
import { timeTopic } from './topics/time';

// Phase 2+ will add: place-value, addition-subtraction, multiplication-division,
// measurement, geometry, money, statistics.
const topics: Topic[] = [fractionsTopic, timeTopic];

export const bncY3: Curriculum = {
  ...bncY3Meta,
  topics,
};
