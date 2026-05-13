// scripts/validate-curriculum.ts
//
// Smoke-test BNC-Y3 content end-to-end:
//   1. Curriculum resolves; has >= 1 topic.
//   2. Every step / question / choice id is unique.
//   3. Every MCQ has correctChoiceId among its choices.
//   4. Every text-input fraction answer parses as N/D.
//   5. ClickFraction expectedFilled <= totalParts.
//   6. Every guided-practice has >= 2 hints (per spec §10).
//
// Run with: npx tsx scripts/validate-curriculum.ts

import { getCurriculum } from '../lib/curricula';
import type {
  ConceptBlock,
  Lesson,
  LessonStep,
  Question,
} from '../types/curriculum';

let errors = 0;
const fail = (msg: string) => {
  errors++;
  console.error(`✗ ${msg}`);
};
const ok = (msg: string) => console.log(`✓ ${msg}`);

const seenIds = new Set<string>();
const checkId = (id: string, where: string) => {
  if (seenIds.has(id)) fail(`Duplicate id "${id}" in ${where}`);
  seenIds.add(id);
};

const validateQuestion = (q: Question, where: string) => {
  checkId(q.id, where);

  if (q.format === 'mcq-text' || q.format === 'mcq-visual') {
    const ids = q.choices.map((c) => c.id);
    if (new Set(ids).size !== ids.length) {
      fail(`${q.id}: duplicate choice ids`);
    }
    if (!ids.includes(q.correctChoiceId)) {
      fail(`${q.id}: correctChoiceId "${q.correctChoiceId}" not among choices`);
    }
    if (q.choices.length < 2) {
      fail(`${q.id}: needs >= 2 choices`);
    }
  }

  if (q.format === 'text-input') {
    if (q.answerType === 'fraction') {
      const m = String(q.expectedAnswer).match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
      if (!m) fail(`${q.id}: fraction answer "${q.expectedAnswer}" not N/D`);
    }
  }

  if (q.format === 'interactive' && q.variant === 'click-fraction') {
    if (q.expectedFilled > q.totalParts) {
      fail(`${q.id}: expectedFilled ${q.expectedFilled} > totalParts ${q.totalParts}`);
    }
  }

  const visualOf = (q: Question): ConceptBlock | undefined => {
    if (q.format === 'text-input') return q.promptVisual;
    if (q.format === 'mcq-text') return q.promptVisual;
    return undefined;
  };
  const v = visualOf(q);
  if (v && v.kind === 'fractionBar' && v.numerator > v.denominator) {
    fail(`${q.id}: fractionBar n > d`);
  }
};

const validateStep = (s: LessonStep, lessonId: string) => {
  const where = `${lessonId}/${s.id}`;
  checkId(s.id, where);
  switch (s.type) {
    case 'guided-practice':
      if (s.hints.length < 2) {
        fail(`${s.id}: guided-practice needs >= 2 hints, has ${s.hints.length}`);
      }
      validateQuestion(s.question, where);
      break;
    case 'independent-practice':
      if (s.questions.length < 3) fail(`${s.id}: independent-practice needs >= 3 questions`);
      s.questions.forEach((q) => validateQuestion(q, where));
      break;
    case 'mini-quiz':
      s.questions.forEach((q) => validateQuestion(q, where));
      break;
    case 'concept':
      if (s.blocks.length === 0) fail(`${s.id}: concept has no blocks`);
      break;
    case 'worked-example':
      if (s.steps.length === 0) fail(`${s.id}: worked-example has no sub-steps`);
      break;
    case 'reflection':
      if (s.keyTakeaways.length === 0) fail(`${s.id}: reflection has no takeaways`);
      break;
  }
};

const validateLesson = (l: Lesson) => {
  checkId(l.id, l.id);
  if (l.steps.length === 0) fail(`${l.id}: no steps`);
  l.steps.forEach((s) => validateStep(s, l.id));
};

// --- run ---
const curriculum = getCurriculum('bnc-y3');
if (!curriculum) {
  console.error('No bnc-y3 curriculum found');
  process.exit(1);
}
ok(`Loaded curriculum ${curriculum.id}: "${curriculum.fullName}"`);

if (curriculum.topics.length === 0) {
  fail('No topics in curriculum');
  process.exit(1);
}
ok(`Curriculum has ${curriculum.topics.length} topic(s)`);

let lessonCount = 0;
let questionCount = 0;
curriculum.topics.forEach((t) => {
  checkId(t.id, `topic/${t.slug}`);
  ok(`Topic: ${t.thaiTitle ?? t.title} (${t.subTopics.length} sub-topics)`);
  t.subTopics.forEach((st) => {
    checkId(st.id, `subTopic/${st.slug}`);
    ok(`  SubTopic: ${st.thaiTitle ?? st.title} (${st.lessons.length} lessons)`);
    st.lessons.forEach((l) => {
      lessonCount++;
      validateLesson(l);
      l.steps.forEach((s) => {
        if (s.type === 'guided-practice') questionCount++;
        if (s.type === 'independent-practice') questionCount += s.questions.length;
        if (s.type === 'mini-quiz') questionCount += s.questions.length;
      });
    });
  });
});

ok(`\nValidated ${lessonCount} lessons, ${questionCount} questions`);

if (errors > 0) {
  console.error(`\n✗ ${errors} error(s) found`);
  process.exit(1);
} else {
  console.log('\n✓ All checks passed');
}
