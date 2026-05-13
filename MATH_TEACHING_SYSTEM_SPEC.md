# MathQuest → Multi-Curriculum Math Teaching System

> **Mission:** เปลี่ยน MathQuest จาก "drill game" → "ระบบสอนคณิตศาสตร์ครบวงจร ที่รองรับหลายหลักสูตร" — สอน + ฝึก + ประเมิน
>
> **Audience:** Claude Code agent ที่จะ implement
>
> **First curriculum to implement:** **British National Curriculum (Year 3)** — Aster International School Bangkok ใช้หลักสูตรนี้
>
> **Other curricula in the future:** Cambridge Primary, IB PYP, Thai MoE (กระทรวงศึกษา), Singapore Math, custom
>
> **Constraint:** ใช้ infrastructure เดิมของ MathQuest (Next.js + Firebase + auth + avatar + rewards) — extend ไม่ rewrite

---

## 0. TL;DR (อ่านก่อน implement)

1. นี่คือ **multi-curriculum** system — Aster Y3 เป็นแค่ curriculum แรกที่ implement
2. **เปลี่ยน mental model:** ก่อนเป็น "Grade → Level" (ตอบคำถาม) ตอนนี้เป็น "Curriculum → Week → Day → Lesson → Step"
3. **ระบบเดิม (drill/play) ซ่อนไว้** — ไม่ลบ แค่ไม่แสดงใน main nav
4. ทำ **Phase 1 ก่อน** = lesson engine + BNC-Y3 Week 24 — แล้วเทสต์กับเด็กตัวจริง
5. คำถามมี 4 แบบ: free input, text MCQ, visual MCQ, interactive (drag-drop, click-fraction ฯลฯ)
6. **อย่า** ทำ Phase 2+ ก่อน user confirm Phase 1

---

## 1. Vision: ระบบสอนคณิตศาสตร์ที่:

1. **เปิดสำหรับหลายหลักสูตร** — admin/dev เพิ่ม curriculum ใหม่ได้ ไม่ต้อง refactor
2. **สอนจริง** — มี concept introduction, worked examples, guided practice
3. **ฝึกหลายแบบ** — text, visual context, visual answers, drag-drop, free input
4. **Track ความก้าวหน้า** — บันทึก progress per lesson + mistake patterns
5. **Adaptive** — เด็กผิดบ่อยเรื่องไหน ระบบให้ฝึกซ้ำ
6. **Reusable infra** — ใช้ auth, avatar, rewards, sounds เดิมทั้งหมด

### What this is NOT
- ไม่ใช่ tutor 1-on-1 ที่คุย AI ได้
- ไม่ใช่ collaborative/multiplayer
- ไม่ใช่ teacher classroom management (อนาคต)
- ไม่ทำเอง content authoring UI ใน Phase 1 — เขียน content ใน TypeScript file ก่อน

---

## 2. Current State Snapshot

### ระบบเดิมที่จะ reuse 100%
- Auth: `app/(auth)/`, `components/auth/AuthGuard.tsx`
- Avatar + customization: `components/avatar/`
- Stars/XP/Streak: `User` type, level scores
- Rewards + admin: `app/(game)/rewards/`, `app/admin/rewards/`
- Sound effects: `lib/game/soundManager.ts`
- Admin dashboard: `app/admin/`

### ระบบเดิมที่จะ "ซ่อน" (ไม่ลบ)
- `app/(game)/play/page.tsx` — drill mode
- `lib/game/generators/` — random question generators
- `app/(game)/summary/page.tsx` — drill summary

**วิธีซ่อน:** ลบ link จาก main nav, ย้ายไปอยู่ใต้ `/legacy/play` หรือเข้าได้แค่จาก URL ตรงๆ หรือ admin toggle

### ระบบที่จะสร้างใหม่ทั้งหมด
- Curriculum data model + registry
- Lesson player (sequence of steps)
- Visual/interactive components
- Question authoring patterns
- Curriculum browser UI (Curriculum → Week → Day → Lesson)
- Progress tracking + Firestore schema
- Adaptive review (Phase 2)

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  CURRICULUM REGISTRY                    │
│   key=id, value=Curriculum object (TypeScript file)     │
│  - bnc-y3 (British National Curriculum Year 3) ⭐ first │
│  - bnc-y4 (future)                                      │
│  - cambridge-stage-3 (future)                           │
│  - thai-p3 (future)                                     │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │      Curriculum             │
        │  - id, name, description    │
        │  - publisher, region        │
        │  - gradeLevel, targetAge    │
        │  - weeks: Week[]            │
        └──────────────┬──────────────┘
                       │
            ┌──────────▼──────────┐
            │       Week          │  ─── ครบ 32 สำหรับ BNC-Y3
            │  - number, title    │
            │  - days: Day[]      │
            │  - prerequisites    │
            └──────────┬──────────┘
                       │
              ┌────────▼────────┐
              │      Day        │  ─── 6 วัน/สัปดาห์
              │  - lessons[]    │
              │  - isAssessment │
              └────────┬────────┘
                       │
                ┌──────▼──────┐
                │   Lesson    │  ─── 1-2 lessons/วัน
                │  - steps[]  │
                └──────┬──────┘
                       │
            ┌──────────▼──────────┐
            │     LessonStep      │
            │  ดูประเภทต่อด้านล่าง  │
            └─────────────────────┘
```

---

## 4. Data Models

### 4.1 Curriculum Types (`types/curriculum.ts`)

```typescript
// types/curriculum.ts

import { Grade } from './index';

export interface Curriculum {
  id: string;                    // "bnc-y3", "cambridge-stage-3"
  name: string;                  // "British National Curriculum"
  fullName: string;              // "British National Curriculum — Year 3 Mathematics"
  description: string;
  publisher: string;             // "UK Department for Education"
  region: string;                // "UK / International"
  targetAge: string;             // "7-8 years"
  gradeLevel: Grade;             // Grade.P3 (reuse existing enum)
  language: 'en' | 'th' | 'mixed';
  totalWeeks: number;            // 32
  weeks: Week[];
  topics: string[];              // tags: ["place-value", "fractions", "geometry"]
  version: string;               // "1.0.0"
  authorNote?: string;
}

export interface Week {
  id: string;                    // "bnc-y3-w24"
  curriculumId: string;          // "bnc-y3"
  number: number;                // 1-32
  title: string;                 // "Adding Fractions (Same Denominator)"
  thaiTitle?: string;            // "บวกเศษส่วน (ตัวส่วนเท่ากัน)"
  description: string;
  learningObjectives: string[];
  topics: string[];              // tags
  days: Day[];
  prerequisites: string[];       // ["bnc-y3-w23"]
  estimatedTotalMinutes: number;
}

export interface Day {
  id: string;                    // "bnc-y3-w24-d1"
  weekId: string;
  number: number;                // 1-6 (1-5 = teaching days, 6 = assessment)
  title: string;
  type: 'lesson' | 'practice' | 'assessment' | 'review';
  lessons: Lesson[];
  estimatedMinutes: number;      // 30
}

export interface Lesson {
  id: string;                    // "bnc-y3-w24-d1-l1"
  dayId: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  steps: LessonStep[];
  learningObjectives: string[];
}

// LessonStep = discriminated union — เลือก type จาก field 'type'
export type LessonStep =
  | ConceptStep
  | WorkedExampleStep
  | GuidedPracticeStep
  | IndependentPracticeStep
  | MiniQuizStep
  | ReflectionStep;
```

### 4.2 Lesson Step Types

```typescript
// Concept = อธิบายเรื่อง pure exposition + visual
export interface ConceptStep {
  id: string;
  type: 'concept';
  title: string;
  blocks: ConceptBlock[];        // mix of content blocks
}

export type ConceptBlock =
  | { kind: 'text'; markdown: string }
  | { kind: 'callout'; tone: 'info' | 'tip' | 'warning'; markdown: string }
  | { kind: 'image'; src: string; alt: string; caption?: string }
  | { kind: 'fractionBar'; numerator: number; denominator: number; label?: string }
  | { kind: 'fractionCircle'; numerator: number; denominator: number; label?: string }
  | { kind: 'numberLine'; from: number; to: number; step: number; highlight?: number[] }
  | { kind: 'shape'; shape: ShapeName; size: number; labels?: boolean }
  | { kind: 'analogClock'; hours: number; minutes: number; interactive?: false }
  | { kind: 'ruler'; lengthCm: number; markedAt?: number }
  | { kind: 'barChart'; data: ChartData; title?: string }
  | { kind: 'mathExpression'; latex: string };

export type ShapeName =
  | 'square' | 'rectangle' | 'circle' | 'triangle'
  | 'pentagon' | 'hexagon'
  | 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid';

// Worked Example = อาจารย์ทำให้ดู step-by-step
export interface WorkedExampleStep {
  id: string;
  type: 'worked-example';
  title: string;
  problemStatement: string;      // "1/5 + 2/5 = ?"
  problemVisual?: ConceptBlock;
  steps: ExampleSubStep[];       // เปิดทีละ step
}

export interface ExampleSubStep {
  narration: string;             // "Step 1: ตรวจดูตัวส่วน"
  visual?: ConceptBlock;
  formula?: string;
  highlightInPreviousVisual?: number[]; // hint
}

// Guided Practice = ลองทำ มี hints ถ้าผิด
export interface GuidedPracticeStep {
  id: string;
  type: 'guided-practice';
  title: string;
  question: Question;            // see Question types below
  hints: string[];               // เปิดทีละขั้นเมื่อผิด
  fullExplanation: string;       // เปิดเมื่อผิด 4 ครั้ง (markdown)
  fullExplanationVisual?: ConceptBlock;
}

// Independent Practice = หลายข้อ ไม่มี hints
export interface IndependentPracticeStep {
  id: string;
  type: 'independent-practice';
  title: string;
  questions: Question[];         // 5-10 ข้อ
  passingScore: number;          // 0.0 - 1.0 (0.7 = 70%)
  allowRetry: boolean;
}

// Mini Quiz = formal assessment
export interface MiniQuizStep {
  id: string;
  type: 'mini-quiz';
  title: string;
  questions: Question[];
  passingScore: number;          // 0.7
  starsOnPass: number;           // เช่น 5 ดาว
  starsOnPerfect: number;        // เช่น 10 ดาว
  badgeOnPerfect?: string;       // badge id
}

// Reflection = end-of-lesson summary
export interface ReflectionStep {
  id: string;
  type: 'reflection';
  title: string;                 // "วันนี้เรียนอะไรไปบ้าง"
  keyTakeaways: string[];
  nextUp?: string;               // "พรุ่งนี้เราจะเรียน..."
}
```

### 4.3 Question Types (รองรับ 4 modalities)

```typescript
// คำถามมี 4 แบบหลัก + variations
export type Question =
  | TextInputQuestion
  | MultipleChoiceTextQuestion
  | MultipleChoiceVisualQuestion
  | InteractiveQuestion;

// 1. Free input — พิมพ์ตัวเลข
export interface TextInputQuestion {
  id: string;
  format: 'text-input';
  prompt: string;                // "คำนวณ: 1/5 + 2/5 = ?"
  promptVisual?: ConceptBlock;
  expectedAnswer: number | string;
  answerType: 'number' | 'fraction' | 'string'; // fraction = "3/5" format
  tolerance?: number;            // สำหรับ number ใกล้เคียง
  unit?: string;                 // "cm", "kg" etc.
}

// 2. Multiple choice — text choices
export interface MultipleChoiceTextQuestion {
  id: string;
  format: 'mcq-text';
  prompt: string;
  promptVisual?: ConceptBlock;
  choices: { id: string; text: string }[];
  correctChoiceId: string;
  shuffleChoices?: boolean;
}

// 3. Multiple choice — visual choices (ตัวเลือกเป็นรูป)
export interface MultipleChoiceVisualQuestion {
  id: string;
  format: 'mcq-visual';
  prompt: string;
  promptText?: string;
  choices: { id: string; visual: ConceptBlock }[];
  correctChoiceId: string;
  shuffleChoices?: boolean;
}

// 4. Interactive — drag-drop, click-fraction, set-clock ฯลฯ
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
  prompt: string;                // "คลิกระบายให้ได้ 3/8"
  totalParts: number;            // 8
  expectedFilled: number;        // 3
  style: 'bar' | 'circle';
}

export interface DragDropQuestion {
  id: string;
  format: 'interactive';
  variant: 'drag-drop';
  prompt: string;
  items: { id: string; label: string; visual?: ConceptBlock }[];
  zones: { id: string; label: string; acceptItemIds: string[] }[];
  // เช่น ลากเศษส่วนมายังกลุ่ม "เกิน 1/2" หรือ "น้อยกว่า 1/2"
}

export interface SetClockQuestion {
  id: string;
  format: 'interactive';
  variant: 'set-clock';
  prompt: string;                // "ตั้งเวลา 3:45"
  expectedHours: number;
  expectedMinutes: number;
  tolerance: number;             // นาที
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
  prompt: string;                // "วาดสี่เหลี่ยมที่มีเส้นรอบรูป 12 cm"
  gridSize: { width: number; height: number };
  expectedProperty: { kind: 'perimeter' | 'area' | 'sides'; value: number };
}
```

### 4.4 User Progress

```typescript
// ขยาย types/index.ts — เพิ่ม optional field ใน User

export interface User {
  // ...existing fields
  curriculumProgress?: Record<string, CurriculumProgress>;
  // key = curriculum id เช่น "bnc-y3"
  currentCurriculumId?: string;  // ที่เลือกใช้อยู่
}

export interface CurriculumProgress {
  curriculumId: string;
  startedAt: string;
  lastActiveAt: string;

  // pointers (ตำแหน่งล่าสุด)
  currentWeekNumber: number;
  currentDayNumber: number;
  currentLessonId?: string;
  currentStepIndex?: number;

  // history
  completedLessonIds: string[];
  unlockedWeekNumbers: number[];   // ปกติ unlock ตามลำดับ admin สามารถ override
  lessonScores: Record<string, LessonScore>; // key = lesson id
  weekAssessmentScores: Record<number, WeekScore>; // key = week number

  // adaptive
  mistakePatterns: MistakePattern[];

  // stats
  totalMinutesSpent: number;
  totalStarsEarned: number;
}

export interface LessonScore {
  lessonId: string;
  attempts: number;
  bestScore: number;             // 0-1
  totalTimeSeconds: number;
  lastAttemptAt: string;
  completedAt?: string;
  starsAwarded: number;
}

export interface WeekScore {
  weekNumber: number;
  bestScore: number;
  passed: boolean;
  attempts: number;
  completedAt?: string;
}

export interface MistakePattern {
  questionId: string;
  lessonId: string;
  topic: string;                 // tag from week.topics
  userAnswer: string;
  correctAnswer: string;
  timestamp: string;
  reviewed: boolean;             // มี review session แล้วหรือยัง
}
```

---

## 5. Curriculum Registry

### 5.1 Registry Pattern (`lib/curricula/index.ts`)

```typescript
import { Curriculum } from '@/types/curriculum';
import { bncY3 } from './bnc-y3';
// future: import { cambridgeStage3 } from './cambridge-stage-3';
// future: import { thaiP3 } from './thai-p3';

export const curricula: Record<string, Curriculum> = {
  'bnc-y3': bncY3,
  // 'cambridge-stage-3': cambridgeStage3,
  // 'thai-p3': thaiP3,
};

export const getCurriculum = (id: string): Curriculum | null => {
  return curricula[id] || null;
};

export const listCurricula = (): Curriculum[] => {
  return Object.values(curricula);
};

export const getCurriculumsForGrade = (grade: Grade): Curriculum[] => {
  return listCurricula().filter(c => c.gradeLevel === grade);
};
```

### 5.2 File Structure

```
lib/curricula/
  ├── index.ts                       # registry
  ├── helpers/
  │   ├── lesson-builders.ts         # helper functions to build common steps
  │   ├── question-builders.ts       # helpers for common Q types
  │   └── visual-builders.ts         # helpers for common visuals
  └── bnc-y3/                        # British National Curriculum Y3
      ├── index.ts                   # export bncY3 Curriculum object
      ├── meta.ts                    # metadata
      └── weeks/
          ├── week-01.ts
          ├── week-02.ts
          ├── ...
          ├── week-24.ts             # ⭐ Phase 1 priority
          └── week-32.ts
```

### 5.3 Example: meta.ts

```typescript
// lib/curricula/bnc-y3/meta.ts
import { Grade } from '@/types';

export const bncY3Meta = {
  id: 'bnc-y3',
  name: 'British National Curriculum',
  fullName: 'British National Curriculum — Year 3 Mathematics',
  description: 'Year 3 maths covering number, fractions, measurement, geometry, and statistics — aligned with UK National Curriculum Key Stage 2.',
  publisher: 'UK Department for Education',
  region: 'UK / International Schools',
  targetAge: '7-8 years',
  gradeLevel: Grade.P3,
  language: 'mixed' as const,
  totalWeeks: 32,
  topics: [
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
```

---

## 6. Components

### 6.1 Lesson Player

```
components/lesson/
  ├── LessonPlayer.tsx              # main controller
  ├── LessonHeader.tsx              # title + progress bar + close
  ├── LessonFooter.tsx              # next/previous buttons
  ├── LessonProgress.tsx            # step counter
  ├── LessonComplete.tsx            # celebration screen
  └── steps/
      ├── ConceptStepView.tsx
      ├── WorkedExampleStepView.tsx
      ├── GuidedPracticeStepView.tsx
      ├── IndependentPracticeStepView.tsx
      ├── MiniQuizStepView.tsx
      └── ReflectionStepView.tsx
```

### 6.2 Question Components

```
components/question/
  ├── QuestionRenderer.tsx          # switch by Question.format
  ├── TextInputQuestion.tsx
  ├── MultipleChoiceTextQuestion.tsx
  ├── MultipleChoiceVisualQuestion.tsx
  └── interactive/
      ├── ClickFractionQuestion.tsx
      ├── DragDropQuestion.tsx
      ├── SetClockQuestion.tsx
      ├── ReadScaleQuestion.tsx
      └── DrawShapeQuestion.tsx
```

### 6.3 Visual Components (สำคัญที่สุด)

```
components/visuals/
  ├── ConceptBlockRenderer.tsx      # switch by ConceptBlock.kind
  ├── FractionBar.tsx               # ⭐ Phase 1
  ├── FractionCircle.tsx            # ⭐ Phase 1
  ├── FractionAddition.tsx          # ⭐ Phase 1 (3 bars: a + b = c)
  ├── NumberLine.tsx                # Phase 1
  ├── Shape2D.tsx                   # Phase 2
  ├── Shape3D.tsx                   # Phase 3 (pseudo-3D SVG)
  ├── AngleDisplay.tsx              # Phase 3
  ├── AnalogClock.tsx               # Phase 3 (interactive)
  ├── Ruler.tsx                     # Phase 2
  ├── MassScale.tsx                 # Phase 3
  ├── LiquidCylinder.tsx            # Phase 3
  ├── Thermometer.tsx               # Phase 3
  ├── Coin.tsx + Bill.tsx           # Phase 3
  └── BarChartViz.tsx               # Phase 3
```

### 6.4 Curriculum Browser

```
components/curriculum/
  ├── CurriculumPicker.tsx          # เลือก curriculum
  ├── CurriculumOverview.tsx        # ข้อมูล curriculum
  ├── WeekGrid.tsx                  # 32 cards
  ├── WeekDetail.tsx                # 6 days
  ├── DayDetail.tsx                 # lessons
  └── LessonCard.tsx
```

### 6.5 FractionBar Component Spec (Phase 1 ตัวแรก)

```typescript
interface FractionBarProps {
  numerator: number;
  denominator: number;
  width?: number;                   // default 320
  height?: number;                  // default 64
  filledColor?: string;             // default theme primary
  emptyColor?: string;              // default theme bg-soft
  borderColor?: string;
  showLabel?: boolean;              // แสดง "2/5" ใต้แท่ง
  showFraction?: boolean;           // แสดง "2/5" บนแท่ง
  interactive?: boolean;            // คลิกเปลี่ยน fill ได้
  onPartClick?: (partIndex: number) => void;
  filledIndices?: number[];         // override which parts are filled
  ariaLabel?: string;
}
```

Render as SVG, แบ่งเท่ากัน n ส่วน, ระบาย k ส่วน (default first k or controlled by filledIndices).

---

## 7. Routes

```
app/(game)/
  ├── learn/
  │   ├── page.tsx                              # CurriculumPicker
  │   ├── [curriculumId]/
  │   │   ├── page.tsx                          # WeekGrid (32 weeks)
  │   │   ├── week/
  │   │   │   └── [weekNum]/
  │   │   │       ├── page.tsx                  # WeekDetail (6 days)
  │   │   │       └── day/
  │   │   │           └── [dayNum]/
  │   │   │               ├── page.tsx          # DayDetail (lessons list)
  │   │   │               └── lesson/
  │   │   │                   └── [lessonId]/
  │   │   │                       └── page.tsx  # LessonPlayer
  └── (legacy)/
      └── play/                                  # ⬅ ย้าย drill mode มาที่นี่
```

### Hide legacy drill mode
- ลบ link "เล่นเกม" จาก `app/(game)/layout.tsx` main nav
- คงไฟล์ `app/(game)/play/` ไว้ (ยังเข้าได้จาก URL ตรงๆ)
- หรือย้ายเป็น `app/(game)/(legacy)/play/` (Next.js group routing — URL ไม่เปลี่ยน)
- อนาคต admin toggle เปิด/ปิดได้

### Update main nav
```
[เรียน] [Ranking] [Avatar] [Rewards] [Profile]
   ↑
default landing page
```

---

## 8. Phased Implementation

### Phase 1: Foundation + BNC-Y3 Week 24
**Goal:** ระบบสอนใช้งานได้จริง 1 สัปดาห์ (Week 24 = Fraction Addition)

**Deliverables:**
- [ ] All TypeScript types (`types/curriculum.ts`)
- [ ] Extend `User` with `curriculumProgress` (backward compatible)
- [ ] Curriculum registry pattern (`lib/curricula/index.ts`)
- [ ] BNC-Y3 metadata file
- [ ] Visual components: FractionBar, FractionCircle, FractionAddition, NumberLine
- [ ] Question components: TextInput, MCQ-Text, MCQ-Visual, ClickFraction (interactive)
- [ ] Lesson player + 6 step view components
- [ ] Routes for /learn flow
- [ ] **Week 24 full content** (6 days, ~10 lessons)
- [ ] Firebase save/load for `curriculumProgress`
- [ ] Hide legacy drill from nav (URL still works)
- [ ] Default landing for game = `/learn`

**Out of scope (Phase 1):**
- Weeks 1-23 content
- Other interactive types (clock, ruler, drag-drop, etc.)
- Adaptive review
- Admin authoring UI

### Phase 2: Build out Term 3 (Weeks 19-26)
- Content for weeks 19-23 (intro fractions through comparing)
- Content for week 25-26 (mixed numbers, length)
- Adaptive review v1 (every 5 lessons, review mistakes)
- Add Ruler visual + ReadScale question type
- DragDrop question type

### Phase 3: Term 3 visuals + content
- Weeks 27-32 (mass/capacity, money/time, geometry, stats)
- All remaining visuals (AnalogClock, MassScale, Coin/Bill, Shape2D/3D, AngleDisplay, BarChart)
- All remaining interactive types (SetClock, DrawShape)

### Phase 4: Backfill + Authoring + 2nd Curriculum
- Weeks 1-18 content
- Admin Lesson Authoring UI
- Parent view (read-only progress)
- Add Cambridge Stage 3 (or Thai P3) as second curriculum to validate multi-curriculum

---

## 9. Phase 1 Deep Dive — BNC-Y3 Week 24

### Week 24 Structure

```typescript
// lib/curricula/bnc-y3/weeks/week-24.ts
export const week24: Week = {
  id: 'bnc-y3-w24',
  curriculumId: 'bnc-y3',
  number: 24,
  title: 'Adding Fractions (Same Denominator)',
  thaiTitle: 'บวกเศษส่วน (ตัวส่วนเท่ากัน)',
  description: '...',
  learningObjectives: [
    'อธิบายการบวกเศษส่วนตัวส่วนเท่ากันได้ด้วยภาพ',
    'บวกเศษส่วนตัวส่วนเท่ากันได้ด้วยตัวเลข',
    'เข้าใจเมื่อผลลัพธ์เกิน 1 (improper / mixed number เบื้องต้น)',
    'แก้ word problem 1-2 ขั้นได้',
  ],
  topics: ['fractions', 'addition'],
  prerequisites: ['bnc-y3-w23'],
  estimatedTotalMinutes: 180,    // 6 days × 30 min
  days: [day1, day2, day3, day4, day5, day6],
};
```

### Day 1 — Visual Introduction (30 min)
**Lesson 1.1 "พิซซ่าและเศษส่วน"**
- Concept (5 min)
  - Block: Text "ทบทวน — เศษส่วนคืออะไร?"
  - Block: FractionCircle 1/4, label "หนึ่งส่วนสี่"
  - Block: Callout "เลขข้างบน = numerator (ตัวเศษ), ข้างล่าง = denominator (ตัวส่วน)"
- Worked Example (5 min): 1/4 + 2/4 ด้วย pizza
  - Step 1: "มาดูพิซซ่า 2 ถาด" + 2 FractionCircles (1/4 และ 2/4)
  - Step 2: "เอามารวมกัน" + FractionAddition animation
  - Step 3: "ตัวส่วนเหมือนกัน บวกแค่ตัวเศษ" + formula
- Guided Practice (15 min): 5 ข้อ
  - Q1: ClickFraction "ระบาย 2/5 ในแท่งซ้าย แล้ว 1/5 ในแท่งขวา รวมเท่าไร?"
  - Q2-Q5: MCQ-Visual (เลือกรูปที่ถูก)
  - Hints: "ตัวส่วนเปลี่ยนไหม?" → "แค่บวกตัวเศษ"
- Mini check (5 min): 3 ข้อ Independent Practice

### Day 2 — Visual to Symbolic (30 min)
**Lesson 2.1 "จากภาพสู่ตัวเลข"**
- Concept: ทำไมตัวส่วนเหมือนเดิม
- Worked Example: 3 examples
- Guided Practice: 6 ข้อ — TextInput (พิมพ์ตัวเลข)
- Reflection: keyTakeaways

### Day 3 — Practice Day (30 min)
**Lesson 3.1 "ฝึกบวกเศษส่วน"**
- Independent Practice: 10 ข้อ mixed (visual + symbolic + 1-2 word problems)
- Mini Quiz: 5 ข้อ — 5 ดาว ถ้าผ่าน

### Day 4 — Sum ≥ 1 (30 min)
**Lesson 4.1 "เมื่อผลลัพธ์เกิน 1"**
- Concept: 3/4 + 2/4 = 5/4 = 1 1/4
- Worked Example: 3 examples + FractionBar visuals
- Guided Practice: 6 ข้อ

### Day 5 — Word Problems (30 min)
**Lesson 5.1 "โจทย์ปัญหา"**
- Concept: 3-step process (read → identify → compute)
- Worked Example: "แม่ทำเค้กแบ่งเป็น 8 ชิ้น น้องกิน 2/8 พี่กิน 3/8 รวมกินไปเท่าไร?"
- Guided Practice: 5 word problems
- Independent Practice: 5 word problems

### Day 6 — Week Assessment (20 min)
**Mini Quiz Step:** 10 questions mixed
- Format mix: 4 TextInput, 3 MCQ-Visual, 2 ClickFraction, 1 Word problem
- Passing 70%
- Perfect (100%) = 10 stars + badge "Fraction Adder"

---

## 10. Quality Bar (Phase 1)

### Functional
- [ ] Login → /learn → เห็น BNC-Y3 card → กดเข้า → Week 24 unlocked
- [ ] เข้า Day 1 Lesson 1 → จบ → save progress → refresh ยังอยู่ที่ขั้นเดิม
- [ ] ผิด 2 ครั้ง → hint โผล่ ; ผิด 4 ครั้ง → full explanation
- [ ] Day 6 mini-test ผ่าน → ดาว+badge ; ไม่ผ่าน → ห้าม unlock Week 25
- [ ] Visual components ทำงานทุก fraction 1/2 ถึง 11/12

### Question modalities
- [ ] TextInput รับเลข decimal/fraction format
- [ ] MCQ-Text shuffle ทำงาน
- [ ] MCQ-Visual ตัวเลือกเป็นรูป (FractionBar/Circle) ใช้ได้
- [ ] ClickFraction interactive — คลิกแล้วเปลี่ยน fill ได้
- [ ] ทุก question มี audio feedback (correct/incorrect)

### UX
- [ ] iPad 10" portrait + landscape
- [ ] Laptop 1280×800 OK
- [ ] Touch targets ≥ 44px
- [ ] Animation smooth ที่ 60fps
- [ ] เด็กตัวจริงใช้ 30 นาทีโดยไม่ติด

### Code
- [ ] TypeScript strict — no `any` ใน new code
- [ ] เก่าไม่ break — `npm run build` pass, drill mode ยังเข้าได้
- [ ] Test page `app/test/visuals/` แสดงทุก visual component
- [ ] Curriculum file type-safe (compiler ช่วยจับ error)
- [ ] Tailwind only, no inline styles

### Content
- [ ] Week 24 ครบ 6 days, ≥ 10 lessons
- [ ] Hints ≥ 2 ต่อ guided practice
- [ ] Wrong choices เป็น plausible misconceptions
- [ ] ภาษาถูก — ไม่มี mojibake, สะกดถูก

---

## 11. Design System

### Colors
```typescript
// extend tailwind.config.ts
export const colors = {
  primary: '#FF6B9D',       // bright pink
  secondary: '#FFD93D',     // bright yellow
  accent: '#4ECDC4',        // turquoise
  success: '#6BCB77',
  error: '#FF6B6B',
  info: '#4DABF7',
  warning: '#FFA94D',
  // soft variants
  'primary-soft': '#FFE5EE',
  'secondary-soft': '#FFF8DC',
  'success-soft': '#E6F7E9',
};
```

### Typography
- Headings: rounded font (Quicksand, Nunito, หรือ default with rounded)
- Body: friendly readable
- Math: monospace-friendly (Roboto Mono) for numbers, KaTeX optional for formulas

### Spacing & Radius
- Base radius 16px, large 24px
- Soft drop shadow throughout
- Padding generous (เด็กกด)

### Motion
- Bouncy ease-out-back for celebrations
- Smooth ease-out for transitions
- Use Framer Motion (`npm i framer-motion` ถ้ายังไม่มี)

### Sound
- Reuse `lib/game/soundManager.ts`
- correct.mp3, incorrect.mp3, levelup.mp3 existing

---

## 12. Things to NOT Do

1. ❌ อย่า rewrite generators เดิม — แค่ซ่อนจาก UI
2. ❌ อย่าลบ play/summary pages — ย้ายไปอยู่ใน (legacy) group
3. ❌ อย่าทำ Phase 2 ก่อน user confirm Phase 1
4. ❌ อย่าใช้ canvas/three.js — SVG เท่านั้น (light + debuggable)
5. ❌ อย่าทำ admin authoring UI ใน Phase 1
6. ❌ อย่าทำ multiplayer
7. ❌ อย่าทำ User schema breaking — เพิ่ม optional fields เท่านั้น
8. ❌ อย่าใส่ multiplication drill — user จัดการสูตรคูณนอกระบบ
9. ❌ อย่าใส่ฟีเจอร์ที่ spec ไม่ได้บอก (เช่น chat AI, video) — ถาม user ก่อน

---

## 13. Suggested Commits Sequence

1. `feat: add curriculum + lesson type definitions`
2. `feat: extend User type with curriculumProgress (backward compatible)`
3. `chore: scaffold lib/curricula directory + registry`
4. `feat: create FractionBar SVG component + test page`
5. `feat: create FractionCircle SVG component`
6. `feat: create FractionAddition combo visual`
7. `feat: create NumberLine SVG component`
8. `feat: create ConceptBlockRenderer (switch by kind)`
9. `feat: create LessonPlayer + 6 step views (skeleton)`
10. `feat: create QuestionRenderer + 4 question type components`
11. `feat: scaffold /learn routes`
12. `feat: hide legacy drill from main nav (preserve URL)`
13. `feat: persist curriculumProgress to Firestore`
14. `content: BNC-Y3 metadata + week-24 day 1 lesson`
15. `content: week-24 day 2-3`
16. `content: week-24 day 4-5`
17. `content: week-24 day 6 assessment`
18. `polish: animations + sounds + responsive`
19. `test: e2e walk-through of week-24`

หลัง commit 19 → ลูก user เทสต์ → iterate → ค่อย Phase 2

---

## 14. Open Questions to Confirm (during implementation)

ถ้าเจอ ระหว่าง implement หยุดถาม user ก่อน:

1. ภาษาในเนื้อหา — เห็น "1/5" หรือ "หนึ่งส่วนห้า" หรือ "one-fifth"? (default: ใช้ "1/5" + ภาษาไทยบรรยาย)
2. Font หลัก — รุ่นการ์ตูน (Quicksand) หรือ rounded standard?
3. Reward — ดาวอย่างเดียว หรือมี XP + ดาว?
4. Retry rule — Mini quiz ผ่านแล้วทำซ้ำได้ดาวมั้ย?
5. Parent dashboard ตอนไหน — Phase 4 หรือเร็วกว่า?
6. Hide drill mode — ซ่อน 100% หรือเข้าได้จาก Profile setting?

---

## 15. Reference: Code Pointers to Read First

Agent ควรอ่านไฟล์เหล่านี้ก่อนเริ่ม Phase 1:

- `types/index.ts` — User, Question, Grade enum
- `lib/game/generators/elementary/p3.ts` — pattern ของ generator เดิม (จะถูกแทนที่ในระบบใหม่)
- `lib/game/generators/index.ts` — registry pattern (curriculum registry จะ mirror pattern นี้)
- `app/(game)/play/page.tsx` — play flow เดิม
- `app/(game)/layout.tsx` — game layout + nav
- `components/game/GameHeader.tsx` — header pattern
- `lib/game/soundManager.ts` — sound API
- `lib/contexts/AuthContext.tsx` — user state pattern
- `app/globals.css` + `tailwind.config.ts` — design tokens
- `components/avatar/EnhancedAvatarDisplay.tsx` — pattern สำหรับ celebration components

---

## End of Spec

**For agent (TL;DR):**
> Multi-curriculum math teaching system. First curriculum = `bnc-y3`. Phase 1 = lesson engine + Week 24 (fraction addition). Hide old drill mode. 4 question types (text input, MCQ-text, MCQ-visual, interactive). SVG-only visuals. Don't proceed past Phase 1 without user signoff.
