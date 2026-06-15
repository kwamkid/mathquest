// lib/curricula/life-math-beginner/topics/percentages/content/questions.ts
//
// Question bank for Percentages — single source of truth for every question
// used by lessons, mini-quizzes, and the final quiz. Each item is tagged with
// difficulty + skill so consumers (lessons / quizzes) can pull what they need
// without copy-pasting.

import type { Question } from '@/types/curriculum';
import {
  mcqText,
  textInput,
} from '@/lib/curricula/helpers/question-builders';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Skill =
  | 'identify'      // recognise common percents (50%, 25%, 10%)
  | 'compute'       // numeric: X% of N
  | 'word-problem'; // real-world scenarios

export interface BankedQuestion {
  question: Question;
  difficulty: Difficulty;
  skill: Skill;
}

const P = 'pct';

// ---------------------------------------------------------------------------
// EASY — common percentages of round numbers (50%, 25%, 10%)
// ---------------------------------------------------------------------------

export const E1: BankedQuestion = {
  difficulty: 'easy',
  skill: 'identify',
  question: textInput({
    id: `${P}-e1`,
    prompt: '100 = กี่ % ของ 100?',
    expectedAnswer: 100,
    unit: '%',
  }),
};

export const E2: BankedQuestion = {
  difficulty: 'easy',
  skill: 'identify',
  question: textInput({
    id: `${P}-e2`,
    prompt: 'ครึ่งหนึ่งของ 100 = กี่ %?',
    expectedAnswer: 50,
    unit: '%',
  }),
};

export const E3: BankedQuestion = {
  difficulty: 'easy',
  skill: 'compute',
  question: textInput({
    id: `${P}-e3`,
    prompt: '10% ของ 100 = ?',
    expectedAnswer: 10,
  }),
};

export const E4: BankedQuestion = {
  difficulty: 'easy',
  skill: 'compute',
  question: textInput({
    id: `${P}-e4`,
    prompt: '50% ของ 200 = ?',
    expectedAnswer: 100,
  }),
};

export const E5: BankedQuestion = {
  difficulty: 'easy',
  skill: 'compute',
  question: textInput({
    id: `${P}-e5`,
    prompt: '25% ของ 100 = ?',
    expectedAnswer: 25,
  }),
};

export const E6: BankedQuestion = {
  difficulty: 'easy',
  skill: 'compute',
  question: mcqText({
    id: `${P}-e6`,
    prompt: '10% ของ 50 = ?',
    choices: [
      { id: 'a', text: '5' },
      { id: 'b', text: '10' },
      { id: 'c', text: '50' },
      { id: 'd', text: '500' },
    ],
    correctChoiceId: 'a',
  }),
};

export const E7: BankedQuestion = {
  difficulty: 'easy',
  skill: 'compute',
  question: textInput({
    id: `${P}-e7`,
    prompt: '50% ของ 80 = ?',
    expectedAnswer: 40,
  }),
};

export const E8: BankedQuestion = {
  difficulty: 'easy',
  skill: 'compute',
  question: textInput({
    id: `${P}-e8`,
    prompt: '10% ของ 200 = ?',
    expectedAnswer: 20,
  }),
};

export const E9: BankedQuestion = {
  difficulty: 'easy',
  skill: 'identify',
  question: mcqText({
    id: `${P}-e9`,
    prompt: '1/4 ของของทั้งหมด = กี่ %?',
    choices: [
      { id: 'a', text: '25%' },
      { id: 'b', text: '50%' },
      { id: 'c', text: '10%' },
      { id: 'd', text: '4%' },
    ],
    correctChoiceId: 'a',
  }),
};

export const E10: BankedQuestion = {
  difficulty: 'easy',
  skill: 'compute',
  question: textInput({
    id: `${P}-e10`,
    prompt: '25% ของ 80 = ?',
    expectedAnswer: 20,
  }),
};

// ---------------------------------------------------------------------------
// MEDIUM — non-round percentages, slightly bigger numbers
// ---------------------------------------------------------------------------

export const M1: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-m1`,
    prompt: '20% ของ 150 = ?',
    expectedAnswer: 30,
  }),
};

export const M2: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-m2`,
    prompt: '15% ของ 80 = ?',
    expectedAnswer: 12,
  }),
};

export const M3: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-m3`,
    prompt: '30% ของ 200 = ?',
    expectedAnswer: 60,
  }),
};

export const M4: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-m4`,
    prompt: '5% ของ 200 = ?',
    expectedAnswer: 10,
  }),
};

export const M5: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-m5`,
    prompt: '40% ของ 250 = ?',
    expectedAnswer: 100,
  }),
};

export const M6: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: mcqText({
    id: `${P}-m6`,
    prompt: '60% ของ 150 = ?',
    choices: [
      { id: 'a', text: '90' },
      { id: 'b', text: '60' },
      { id: 'c', text: '100' },
      { id: 'd', text: '120' },
    ],
    correctChoiceId: 'a',
  }),
};

export const M7: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-m7`,
    prompt: '8% ของ 50 = ?',
    expectedAnswer: 4,
  }),
};

export const M8: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-m8`,
    prompt: '75% ของ 80 = ?',
    expectedAnswer: 60,
  }),
};

export const M9: BankedQuestion = {
  difficulty: 'medium',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-m9`,
    prompt: 'น้องทำข้อสอบ 20 ข้อ ถูก 18 ข้อ — คิดเป็นกี่ %?',
    expectedAnswer: 90,
    unit: '%',
  }),
};

export const M10: BankedQuestion = {
  difficulty: 'medium',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-m10`,
    prompt: 'พิซซ่า 8 ชิ้น กิน 2 ชิ้น — กินไปกี่ %?',
    expectedAnswer: 25,
    unit: '%',
  }),
};

// ---------------------------------------------------------------------------
// HARD — bigger numbers, two-step word problems (discounts, VAT)
// ---------------------------------------------------------------------------

export const H1: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h1`,
    prompt: 'เสื้อราคา 500 บาท ลด 20% — ส่วนลดกี่บาท?',
    expectedAnswer: 100,
    unit: 'บาท',
  }),
};

export const H2: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h2`,
    prompt: 'เสื้อราคา 500 บาท ลด 20% — จ่ายจริงกี่บาท?',
    expectedAnswer: 400,
    unit: 'บาท',
  }),
};

export const H3: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h3`,
    prompt: 'อาหาร 200 บาท + VAT 7% — จ่ายจริงกี่บาท?',
    expectedAnswer: 214,
    unit: 'บาท',
  }),
};

export const H4: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h4`,
    prompt: 'กระเป๋า 800 บาท ลด 25% — จ่ายจริงกี่บาท?',
    expectedAnswer: 600,
    unit: 'บาท',
  }),
};

export const H5: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h5`,
    prompt: 'รองเท้าราคา 1,200 บาท ลด 30% — ส่วนลดกี่บาท?',
    expectedAnswer: 360,
    unit: 'บาท',
  }),
};

export const H6: BankedQuestion = {
  difficulty: 'hard',
  skill: 'compute',
  question: textInput({
    id: `${P}-h6`,
    prompt: '35% ของ 400 = ?',
    expectedAnswer: 140,
  }),
};

export const H7: BankedQuestion = {
  difficulty: 'hard',
  skill: 'compute',
  question: textInput({
    id: `${P}-h7`,
    prompt: '12% ของ 250 = ?',
    expectedAnswer: 30,
  }),
};

export const H8: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: mcqText({
    id: `${P}-h8`,
    prompt:
      'หนังสือ 600 บาท ลด 15% แล้วต้องเสีย VAT 7% เพิ่ม — จ่ายจริงเท่าไร?',
    choices: [
      { id: 'a', text: '545.70 บาท' },
      { id: 'b', text: '510 บาท' },
      { id: 'c', text: '585 บาท' },
      { id: 'd', text: '465 บาท' },
    ],
    correctChoiceId: 'a',
  }),
};

export const H9: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h9`,
    prompt: 'น้องสะสมเงิน 800 บาท ใช้ไป 25% — เหลือกี่บาท?',
    expectedAnswer: 600,
    unit: 'บาท',
  }),
};

export const H10: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h10`,
    prompt: 'โรงเรียนมีนักเรียน 250 คน เป็นผู้หญิง 60% — มีผู้หญิงกี่คน?',
    expectedAnswer: 150,
    unit: 'คน',
  }),
};

// ---------------------------------------------------------------------------
// MENTAL TRICKS — fast computation drills (10% shortcut, doubling, etc.)
// Sit at easy-to-medium difficulty so they layer on top of L2's foundations.
// ---------------------------------------------------------------------------

export const T1: BankedQuestion = {
  difficulty: 'easy',
  skill: 'compute',
  question: textInput({
    id: `${P}-t1`,
    prompt: '10% ของ 80 = ? (เลื่อนจุดทศนิยม)',
    expectedAnswer: 8,
  }),
};

export const T2: BankedQuestion = {
  difficulty: 'easy',
  skill: 'compute',
  question: textInput({
    id: `${P}-t2`,
    prompt: '5% ของ 80 = ? (ครึ่งของ 10%)',
    expectedAnswer: 4,
  }),
};

export const T3: BankedQuestion = {
  difficulty: 'easy',
  skill: 'compute',
  question: textInput({
    id: `${P}-t3`,
    prompt: '20% ของ 70 = ? (10% × 2)',
    expectedAnswer: 14,
  }),
};

export const T4: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-t4`,
    prompt: '50% ของ 240 = ? (÷ 2)',
    expectedAnswer: 120,
  }),
};

export const T5: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-t5`,
    prompt: '25% ของ 60 = ? (÷ 4)',
    expectedAnswer: 15,
  }),
};

// "สลับเลข" trick: X% of Y = Y% of X.
export const T6: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: mcqText({
    id: `${P}-t6`,
    prompt:
      '4% ของ 50 — คิดยังไงได้เร็วสุด?',
    choices: [
      { id: 'a', text: 'สลับเป็น 50% ของ 4 = 2' },
      { id: 'b', text: 'หาร 50 ด้วย 4 = 12.5' },
      { id: 'c', text: 'ลบ 50 − 4 = 46' },
      { id: 'd', text: 'ไม่มีทางลัด ใช้สูตร' },
    ],
    correctChoiceId: 'a',
  }),
};

export const T7: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-t7`,
    prompt: '8% ของ 25 = ? (สลับเป็น 25% ของ 8)',
    expectedAnswer: 2,
  }),
};

export const T8: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-t8`,
    prompt: '15% ของ 60 = ? (10% + 5%)',
    expectedAnswer: 9,
  }),
};

export const T9: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compute',
  question: textInput({
    id: `${P}-t9`,
    prompt: '30% ของ 90 = ? (10% × 3)',
    expectedAnswer: 27,
  }),
};

// "ลดราคาแบบสลับ" trick: 30% off means pay 70%.
export const T10: BankedQuestion = {
  difficulty: 'medium',
  skill: 'word-problem',
  question: mcqText({
    id: `${P}-t10`,
    prompt: 'ของลด 30% หมายความว่าจ่ายกี่ % ของราคาเดิม?',
    choices: [
      { id: 'a', text: '70%' },
      { id: 'b', text: '30%' },
      { id: 'c', text: '130%' },
      { id: 'd', text: '60%' },
    ],
    correctChoiceId: 'a',
  }),
};

// ---------------------------------------------------------------------------
// Catalogue — bulk export for consumers
// ---------------------------------------------------------------------------

export const allQuestions: BankedQuestion[] = [
  // easy
  E1, E2, E3, E4, E5, E6, E7, E8, E9, E10,
  // medium
  M1, M2, M3, M4, M5, M6, M7, M8, M9, M10,
  // mental tricks
  T1, T2, T3, T4, T5, T6, T7, T8, T9, T10,
  // hard
  H1, H2, H3, H4, H5, H6, H7, H8, H9, H10,
];

// Filter helpers — keep consumer code terse.
export const byDifficulty = (d: Difficulty): Question[] =>
  allQuestions.filter((q) => q.difficulty === d).map((q) => q.question);

export const bySkill = (s: Skill): Question[] =>
  allQuestions.filter((q) => q.skill === s).map((q) => q.question);
