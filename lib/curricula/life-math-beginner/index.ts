// lib/curricula/life-math-beginner/index.ts
//
// Life Math — beginner curriculum entry point.
// Unitary Method is ordered before Percentages on purpose: % is best
// understood as a special case of the unitary method (find 1%, then scale),
// so the foundation lesson goes first. Learners can still jump straight to
// Percentages if they want — there's no hard lock — but the recommended
// order matches the math.

import type { Curriculum, Topic } from '@/types/curriculum';
import { lifeMathBeginnerMeta } from './meta';
import { percentagesTopic } from './topics/percentages';
import { unitaryMethodTopic } from './topics/unitary-method';

const topics: Topic[] = [unitaryMethodTopic, percentagesTopic];

export const lifeMathBeginner: Curriculum = {
  ...lifeMathBeginnerMeta,
  topics,
};
