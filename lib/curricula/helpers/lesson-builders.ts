// lib/curricula/helpers/lesson-builders.ts
//
// Builders for common lesson step shapes — keep curriculum content terse.
// Each helper returns a fully-typed LessonStep, so the compiler enforces shape.

import type {
  ConceptBlock,
  ConceptStep,
  ExampleSubStep,
  GuidedPracticeStep,
  IndependentPracticeStep,
  Lesson,
  LessonKind,
  LessonStep,
  MiniQuizStep,
  Question,
  ReflectionStep,
  SubTopic,
  Topic,
  WorkedExampleStep,
} from '@/types/curriculum';

type TopicIconName = NonNullable<Topic['iconName']>;

export const concept = (
  id: string,
  title: string,
  blocks: ConceptBlock[],
): ConceptStep => ({
  id,
  type: 'concept',
  title,
  blocks,
});

export const workedExample = (params: {
  id: string;
  title: string;
  problemStatement: string;
  problemVisual?: ConceptBlock;
  steps: ExampleSubStep[];
}): WorkedExampleStep => ({
  id: params.id,
  type: 'worked-example',
  title: params.title,
  problemStatement: params.problemStatement,
  problemVisual: params.problemVisual,
  steps: params.steps,
});

export const guidedPractice = (params: {
  id: string;
  title: string;
  question: Question;
  hints: string[];
  fullExplanation: string;
  fullExplanationVisual?: ConceptBlock;
}): GuidedPracticeStep => ({
  id: params.id,
  type: 'guided-practice',
  title: params.title,
  question: params.question,
  hints: params.hints,
  fullExplanation: params.fullExplanation,
  fullExplanationVisual: params.fullExplanationVisual,
});

export const independentPractice = (params: {
  id: string;
  title: string;
  questions: Question[];
  passingScore?: number;
  allowRetry?: boolean;
}): IndependentPracticeStep => ({
  id: params.id,
  type: 'independent-practice',
  title: params.title,
  questions: params.questions,
  passingScore: params.passingScore ?? 0.7,
  allowRetry: params.allowRetry ?? true,
});

export const miniQuiz = (params: {
  id: string;
  title: string;
  questions: Question[];
  passingScore?: number;
  starsOnPass?: number;
  starsOnPerfect?: number;
  badgeOnPerfect?: string;
}): MiniQuizStep => ({
  id: params.id,
  type: 'mini-quiz',
  title: params.title,
  questions: params.questions,
  passingScore: params.passingScore ?? 0.7,
  starsOnPass: params.starsOnPass ?? 5,
  starsOnPerfect: params.starsOnPerfect ?? 10,
  badgeOnPerfect: params.badgeOnPerfect,
});

export const reflection = (params: {
  id: string;
  title: string;
  keyTakeaways: string[];
  nextUp?: string;
}): ReflectionStep => ({
  id: params.id,
  type: 'reflection',
  title: params.title,
  keyTakeaways: params.keyTakeaways,
  nextUp: params.nextUp,
});

export const lesson = (params: {
  id: string;
  subTopicId: string;
  order: number;
  title: string;
  description?: string;
  estimatedMinutes: number;
  steps: LessonStep[];
  learningObjectives: string[];
  isAssessment?: boolean;
  kind?: LessonKind;
}): Lesson => ({
  id: params.id,
  subTopicId: params.subTopicId,
  order: params.order,
  title: params.title,
  description: params.description,
  estimatedMinutes: params.estimatedMinutes,
  steps: params.steps,
  learningObjectives: params.learningObjectives,
  isAssessment: params.isAssessment,
  kind: params.kind,
});

export const subTopic = (params: {
  id: string;
  topicId: string;
  slug: string;
  title: string;
  thaiTitle?: string;
  description: string;
  learningObjectives: string[];
  prerequisites?: string[];
  estimatedTotalMinutes: number;
  order: number;
  lessons: Lesson[];
}): SubTopic => ({
  id: params.id,
  topicId: params.topicId,
  slug: params.slug,
  title: params.title,
  thaiTitle: params.thaiTitle,
  description: params.description,
  learningObjectives: params.learningObjectives,
  prerequisites: params.prerequisites ?? [],
  estimatedTotalMinutes: params.estimatedTotalMinutes,
  order: params.order,
  lessons: params.lessons,
});

export const topic = (params: {
  id: string;
  curriculumId: string;
  slug: string;
  title: string;
  thaiTitle?: string;
  description: string;
  icon?: string;
  iconName?: TopicIconName;
  order: number;
  subTopics: SubTopic[];
}): Topic => ({
  id: params.id,
  curriculumId: params.curriculumId,
  slug: params.slug,
  title: params.title,
  thaiTitle: params.thaiTitle,
  description: params.description,
  icon: params.icon,
  iconName: params.iconName,
  order: params.order,
  subTopics: params.subTopics,
});
