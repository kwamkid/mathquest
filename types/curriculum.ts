// types/curriculum.ts
//
// Multi-curriculum math teaching system types.
// See MATH_TEACHING_SYSTEM_SPEC.md section 4 for design rationale.

import { Grade } from './index';

// ---------------------------------------------------------------------------
// Top-level groupings:
//   CurriculumFamily (publisher/region, e.g. "British")
//      └── Curriculum (per grade, e.g. BNC-Y3)
//            └── Topic → SubTopic → Lesson → LessonStep
// ---------------------------------------------------------------------------

export interface CurriculumFamily {
  key: string;              // url-safe, e.g. "british", "thai", "american"
  name: string;              // "British National Curriculum"
  thaiName?: string;         // "หลักสูตรอังกฤษ"
  description: string;
  flag?: string;             // emoji shortcut: 🇬🇧 🇹🇭 🇺🇸
  comingSoon?: boolean;      // true if no curricula registered yet
  // Ordered list of grades to offer (some may be marked comingSoon).
  grades: CurriculumFamilyGrade[];
}

export interface CurriculumFamilyGrade {
  key: string;               // url-safe within the family, e.g. "y3", "p3"
  label: string;             // "Year 3", "ประถม 3"
  ageRange: string;          // "7-8 years"
  // If set, points to a registered Curriculum id (e.g. "bnc-y3").
  // Absent or null = coming soon (not yet implemented).
  curriculumId?: string;
}

export interface Curriculum {
  id: string;
  name: string;
  fullName: string;
  description: string;
  publisher: string;
  region: string;
  targetAge: string;
  gradeLevel: Grade;
  language: 'en' | 'th' | 'mixed';
  topicTags: string[];      // domain tags (e.g. "fractions", "place-value")
  topics: Topic[];          // actual content tree
  version: string;
  authorNote?: string;
}

export interface Topic {
  id: string;               // "bnc-y3-fractions"
  curriculumId: string;
  slug: string;             // url-safe segment, e.g. "fractions"
  title: string;            // English title, e.g. "Fractions"
  thaiTitle?: string;       // e.g. "เศษส่วน"
  description: string;
  icon?: string;            // emoji shortcut for cards
  order: number;            // sort order within curriculum
  subTopics: SubTopic[];
}

export interface SubTopic {
  id: string;               // "bnc-y3-fractions-adding"
  topicId: string;
  slug: string;             // "adding-fractions"
  title: string;            // "Adding Fractions (Same Denominator)"
  thaiTitle?: string;       // "บวกเศษส่วน (ตัวส่วนเท่ากัน)"
  description: string;
  learningObjectives: string[];
  prerequisites: string[];  // subtopic ids that must be completed first
  estimatedTotalMinutes: number;
  order: number;
  lessons: Lesson[];
}

// What kind of "lesson card" this is. Drives how it groups in the chapter UI
// and whether completing it gives stars/EXP:
//   - 'lesson'  (default): teach a concept, mixes worked examples + practice
//   - 'mini'    : short reinforcement after a lesson (~3-5 questions). NO reward.
//   - 'quiz'    : end-of-chapter assessment, gives stars + EXP via mini-quiz step.
export type LessonKind = 'lesson' | 'mini' | 'quiz';

export interface Lesson {
  id: string;
  subTopicId: string;
  order: number;            // 1-based order within sub-topic
  title: string;            // "Pizza and Fractions — Day 1"
  description?: string;
  estimatedMinutes: number;
  steps: LessonStep[];
  learningObjectives: string[];
  // Whether this lesson acts as the chapter assessment.
  // If true, completing it counts toward unlocking the next sub-topic.
  isAssessment?: boolean;
  // Optional grouping signal — defaults to 'lesson' if omitted (back-compat).
  kind?: LessonKind;
}

// ---------------------------------------------------------------------------
// LessonStep: discriminated union on `type`
// ---------------------------------------------------------------------------

export type LessonStep =
  | ConceptStep
  | WorkedExampleStep
  | GuidedPracticeStep
  | IndependentPracticeStep
  | MiniQuizStep
  | ReflectionStep;

export interface ConceptStep {
  id: string;
  type: 'concept';
  title: string;
  blocks: ConceptBlock[];
}

export interface WorkedExampleStep {
  id: string;
  type: 'worked-example';
  title: string;
  problemStatement: string;
  problemVisual?: ConceptBlock;
  steps: ExampleSubStep[];
}

export interface ExampleSubStep {
  narration: string;
  visual?: ConceptBlock;
  formula?: string;
  highlightInPreviousVisual?: number[];
}

export interface GuidedPracticeStep {
  id: string;
  type: 'guided-practice';
  title: string;
  question: Question;
  hints: string[];
  fullExplanation: string;
  fullExplanationVisual?: ConceptBlock;
}

export interface IndependentPracticeStep {
  id: string;
  type: 'independent-practice';
  title: string;
  questions: Question[];
  passingScore: number;
  allowRetry: boolean;
}

export interface MiniQuizStep {
  id: string;
  type: 'mini-quiz';
  title: string;
  questions: Question[];
  passingScore: number;
  starsOnPass: number;
  starsOnPerfect: number;
  badgeOnPerfect?: string;
}

export interface ReflectionStep {
  id: string;
  type: 'reflection';
  title: string;
  keyTakeaways: string[];
  nextUp?: string;
}

// ---------------------------------------------------------------------------
// ConceptBlock: discriminated union on `kind` — used by Concept and visuals
// ---------------------------------------------------------------------------

export type ConceptBlock =
  | { kind: 'text'; markdown: string }
  | { kind: 'callout'; tone: 'info' | 'tip' | 'warning'; markdown: string }
  | { kind: 'image'; src: string; alt: string; caption?: string }
  | { kind: 'fractionBar'; numerator: number; denominator: number; label?: string }
  | { kind: 'fractionCircle'; numerator: number; denominator: number; label?: string }
  | { kind: 'fractionAddition'; left: FractionPair; right: FractionPair; result: FractionPair; style?: 'bar' | 'circle' }
  | { kind: 'numberLine'; from: number; to: number; step: number; highlight?: number[] }
  | { kind: 'shape'; shape: ShapeName; size: number; labels?: boolean }
  | { kind: 'analogClock'; hours: number; minutes: number; interactive?: false }
  | { kind: 'percentBar'; percent: number; label?: string }
  | { kind: 'ruler'; lengthCm: number; markedAt?: number }
  | { kind: 'barChart'; data: ChartData; title?: string }
  | { kind: 'mathExpression'; latex: string };

export interface FractionPair {
  numerator: number;
  denominator: number;
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export type ShapeName =
  | 'square' | 'rectangle' | 'circle' | 'triangle'
  | 'pentagon' | 'hexagon'
  | 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid';

// ---------------------------------------------------------------------------
// Question types: 4 modalities (text input, MCQ-text, MCQ-visual, interactive)
// ---------------------------------------------------------------------------

export type Question =
  | TextInputQuestion
  | MultipleChoiceTextQuestion
  | MultipleChoiceVisualQuestion
  | InteractiveQuestion;

export interface TextInputQuestion {
  id: string;
  format: 'text-input';
  prompt: string;
  promptVisual?: ConceptBlock;
  expectedAnswer: number | string;
  answerType: 'number' | 'fraction' | 'string';
  tolerance?: number;
  unit?: string;
}

export interface MultipleChoiceTextQuestion {
  id: string;
  format: 'mcq-text';
  prompt: string;
  promptVisual?: ConceptBlock;
  choices: { id: string; text: string }[];
  correctChoiceId: string;
  shuffleChoices?: boolean;
}

export interface MultipleChoiceVisualQuestion {
  id: string;
  format: 'mcq-visual';
  prompt: string;
  promptText?: string;
  choices: { id: string; visual: ConceptBlock }[];
  correctChoiceId: string;
  shuffleChoices?: boolean;
}

export type InteractiveQuestion =
  | ClickFractionQuestion
  | DragDropQuestion
  | SetClockQuestion
  | ReadScaleQuestion
  | DrawShapeQuestion;

export interface ClickFractionQuestion {
  id: string;
  format: 'interactive';
  variant: 'click-fraction';
  prompt: string;
  totalParts: number;
  expectedFilled: number;
  style: 'bar' | 'circle';
}

export interface DragDropQuestion {
  id: string;
  format: 'interactive';
  variant: 'drag-drop';
  prompt: string;
  items: { id: string; label: string; visual?: ConceptBlock }[];
  zones: { id: string; label: string; acceptItemIds: string[] }[];
}

export interface SetClockQuestion {
  id: string;
  format: 'interactive';
  variant: 'set-clock';
  prompt: string;
  expectedHours: number;
  expectedMinutes: number;
  tolerance: number;
}

export interface ReadScaleQuestion {
  id: string;
  format: 'interactive';
  variant: 'read-scale';
  prompt: string;
  scaleType: 'ruler' | 'mass-scale' | 'liquid-cylinder' | 'thermometer';
  visual: ConceptBlock;
  expectedReading: number;
  unit: string;
  tolerance: number;
}

export interface DrawShapeQuestion {
  id: string;
  format: 'interactive';
  variant: 'draw-shape';
  prompt: string;
  gridSize: { width: number; height: number };
  expectedProperty: { kind: 'perimeter' | 'area' | 'sides'; value: number };
}

// ---------------------------------------------------------------------------
// User progress (extension types — see commit #2 for User integration)
// ---------------------------------------------------------------------------

export interface CurriculumProgress {
  curriculumId: string;
  startedAt: string;
  lastActiveAt: string;

  // pointers: where the learner left off (so we can show "Continue").
  currentTopicId?: string;
  currentSubTopicId?: string;
  currentLessonId?: string;
  currentStepIndex?: number;

  // history
  completedLessonIds: string[];
  unlockedSubTopicIds: string[];           // gates next chapter when prereqs met
  lessonScores: Record<string, LessonScore>;
  subTopicScores: Record<string, SubTopicScore>;  // key = subTopic id

  // adaptive
  mistakePatterns: MistakePattern[];

  // stats
  totalMinutesSpent: number;
  totalStarsEarned: number;
}

export interface LessonScore {
  lessonId: string;
  attempts: number;
  bestScore: number;
  totalTimeSeconds: number;
  lastAttemptAt: string;
  completedAt?: string;
  starsAwarded: number;
}

export interface SubTopicScore {
  subTopicId: string;
  bestScore: number;
  passed: boolean;
  attempts: number;
  completedAt?: string;
}

export interface MistakePattern {
  questionId: string;
  lessonId: string;
  topic: string;
  userAnswer: string;
  correctAnswer: string;
  timestamp: string;
  reviewed: boolean;
}
