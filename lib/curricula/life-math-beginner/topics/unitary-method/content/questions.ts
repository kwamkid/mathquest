// content/questions.ts — Unitary Method question bank.
// Skills: price-per-unit (ราคาต่อ 1), multiply-back (คูณกลับ),
// compare (เปรียบเทียบราคา), word-problem (สถานการณ์ผสม).

import type { Question } from '@/types/curriculum';
import { mcqText, textInput } from '@/lib/curricula/helpers/question-builders';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Skill = 'price-per-unit' | 'multiply-back' | 'compare' | 'word-problem';

export interface BankedQuestion {
  question: Question;
  difficulty: Difficulty;
  skill: Skill;
}

const P = 'um';

// ---------------------------------------------------------------------------
// EASY — clean division/multiplication, "round" prices
// ---------------------------------------------------------------------------

export const E1: BankedQuestion = {
  difficulty: 'easy',
  skill: 'price-per-unit',
  question: textInput({
    id: `${P}-e1`,
    prompt: 'แก้ว 50 ใบ ราคา 250 บาท — ใบละกี่บาท?',
    expectedAnswer: 5,
    unit: 'บาท',
  }),
};

export const E2: BankedQuestion = {
  difficulty: 'easy',
  skill: 'price-per-unit',
  question: textInput({
    id: `${P}-e2`,
    prompt: 'ไข่ 30 ฟอง ราคา 120 บาท — ฟองละกี่บาท?',
    expectedAnswer: 4,
    unit: 'บาท',
  }),
};

export const E3: BankedQuestion = {
  difficulty: 'easy',
  skill: 'price-per-unit',
  question: textInput({
    id: `${P}-e3`,
    prompt: 'ดินสอ 5 แท่ง ราคา 45 บาท — แท่งละกี่บาท?',
    expectedAnswer: 9,
    unit: 'บาท',
  }),
};

export const E4: BankedQuestion = {
  difficulty: 'easy',
  skill: 'multiply-back',
  question: textInput({
    id: `${P}-e4`,
    prompt: 'ดินสอแท่งละ 8 บาท — ซื้อ 6 แท่ง ราคาเท่าไร?',
    expectedAnswer: 48,
    unit: 'บาท',
  }),
};

export const E5: BankedQuestion = {
  difficulty: 'easy',
  skill: 'multiply-back',
  question: textInput({
    id: `${P}-e5`,
    prompt: 'แก้วใบละ 5 บาท — ซื้อ 12 ใบ ราคาเท่าไร?',
    expectedAnswer: 60,
    unit: 'บาท',
  }),
};

export const E6: BankedQuestion = {
  difficulty: 'easy',
  skill: 'multiply-back',
  question: mcqText({
    id: `${P}-e6`,
    prompt: 'ขนมชิ้นละ 7 บาท ซื้อ 10 ชิ้นเท่าไร?',
    choices: [
      { id: 'a', text: '70 บาท' },
      { id: 'b', text: '7 บาท' },
      { id: 'c', text: '17 บาท' },
      { id: 'd', text: '700 บาท' },
    ],
    correctChoiceId: 'a',
  }),
};

export const E7: BankedQuestion = {
  difficulty: 'easy',
  skill: 'price-per-unit',
  question: textInput({
    id: `${P}-e7`,
    prompt: 'สมุด 10 เล่ม ราคา 150 บาท — เล่มละกี่บาท?',
    expectedAnswer: 15,
    unit: 'บาท',
  }),
};

export const E8: BankedQuestion = {
  difficulty: 'easy',
  skill: 'price-per-unit',
  question: textInput({
    id: `${P}-e8`,
    prompt: 'น้ำดื่ม 12 ขวด ราคา 60 บาท — ขวดละกี่บาท?',
    expectedAnswer: 5,
    unit: 'บาท',
  }),
};

// ---------------------------------------------------------------------------
// MEDIUM — slightly trickier numbers, mixed skills
// ---------------------------------------------------------------------------

export const M1: BankedQuestion = {
  difficulty: 'medium',
  skill: 'price-per-unit',
  question: textInput({
    id: `${P}-m1`,
    prompt: 'น้ำตาล 4 ถุง ราคา 100 บาท — ถุงละกี่บาท?',
    expectedAnswer: 25,
    unit: 'บาท',
  }),
};

export const M2: BankedQuestion = {
  difficulty: 'medium',
  skill: 'price-per-unit',
  question: textInput({
    id: `${P}-m2`,
    prompt: 'ผลไม้ 6 กิโล ราคา 180 บาท — กิโลละกี่บาท?',
    expectedAnswer: 30,
    unit: 'บาท',
  }),
};

export const M3: BankedQuestion = {
  difficulty: 'medium',
  skill: 'multiply-back',
  question: textInput({
    id: `${P}-m3`,
    prompt: 'ส้มกิโลละ 25 บาท — ซื้อ 4 กิโล ราคาเท่าไร?',
    expectedAnswer: 100,
    unit: 'บาท',
  }),
};

export const M4: BankedQuestion = {
  difficulty: 'medium',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-m4`,
    prompt: 'ซื้อข้าวสาร 4 กระสอบ 1,000 บาท — 7 กระสอบราคาเท่าไร?',
    expectedAnswer: 1750,
    unit: 'บาท',
  }),
};

export const M5: BankedQuestion = {
  difficulty: 'medium',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-m5`,
    prompt: 'พิมพ์งาน 6 หน้า ใช้เวลา 30 นาที — พิมพ์ 10 หน้า ใช้เวลากี่นาที?',
    expectedAnswer: 50,
    unit: 'นาที',
  }),
};

export const M6: BankedQuestion = {
  difficulty: 'medium',
  skill: 'compare',
  question: mcqText({
    id: `${P}-m6`,
    prompt:
      'ร้าน A: น้ำ 3 ขวด 60 บาท / ร้าน B: น้ำ 5 ขวด 90 บาท — ร้านไหนถูกกว่า?',
    choices: [
      { id: 'a', text: 'ร้าน B (ขวดละ 18 บาท)' },
      { id: 'b', text: 'ร้าน A (ขวดละ 20 บาท)' },
      { id: 'c', text: 'เท่ากัน' },
      { id: 'd', text: 'ตอบไม่ได้' },
    ],
    correctChoiceId: 'a',
  }),
};

export const M7: BankedQuestion = {
  difficulty: 'medium',
  skill: 'price-per-unit',
  question: textInput({
    id: `${P}-m7`,
    prompt: 'นม 8 กล่อง ราคา 160 บาท — กล่องละกี่บาท?',
    expectedAnswer: 20,
    unit: 'บาท',
  }),
};

export const M8: BankedQuestion = {
  difficulty: 'medium',
  skill: 'multiply-back',
  question: textInput({
    id: `${P}-m8`,
    prompt: 'ไข่ฟองละ 4 บาท — ซื้อ 25 ฟอง ราคาเท่าไร?',
    expectedAnswer: 100,
    unit: 'บาท',
  }),
};

// ---------------------------------------------------------------------------
// HARD — multi-step word problems, two-step comparisons
// ---------------------------------------------------------------------------

export const H1: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h1`,
    prompt:
      'คนงาน 4 คน ทำงานเสร็จใน 12 วัน — ถ้าใช้ 8 คน จะเสร็จในกี่วัน?',
    expectedAnswer: 6,
    unit: 'วัน',
  }),
};

export const H2: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h2`,
    prompt:
      'รถวิ่ง 60 กม. ใช้น้ำมัน 4 ลิตร — วิ่ง 150 กม. ใช้น้ำมันกี่ลิตร?',
    expectedAnswer: 10,
    unit: 'ลิตร',
  }),
};

export const H3: BankedQuestion = {
  difficulty: 'hard',
  skill: 'compare',
  question: mcqText({
    id: `${P}-h3`,
    prompt:
      'แชมพู: ขวดเล็ก 200 ml ราคา 80 บาท / ขวดใหญ่ 500 ml ราคา 180 บาท — ขนาดไหนคุ้มกว่า?',
    choices: [
      { id: 'a', text: 'ขวดใหญ่ (0.36 บาท/ml)' },
      { id: 'b', text: 'ขวดเล็ก (0.40 บาท/ml)' },
      { id: 'c', text: 'เท่ากัน' },
      { id: 'd', text: 'ขวดเล็ก (0.50 บาท/ml)' },
    ],
    correctChoiceId: 'a',
  }),
};

export const H4: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h4`,
    prompt:
      'นักวิ่ง 5 คน วิ่งครบสนาม ใช้เวลารวม 75 นาที — ถ้านักวิ่ง 12 คน วิ่งครบสนาม ใช้เวลากี่นาที? (อัตราคงที่)',
    expectedAnswer: 180,
    unit: 'นาที',
  }),
};

export const H5: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h5`,
    prompt:
      'ของขวัญ 6 กล่อง ใช้กระดาษห่อ 18 แผ่น — ถ้าห่อ 15 กล่อง ใช้กระดาษกี่แผ่น?',
    expectedAnswer: 45,
    unit: 'แผ่น',
  }),
};

export const H6: BankedQuestion = {
  difficulty: 'hard',
  skill: 'compare',
  question: mcqText({
    id: `${P}-h6`,
    prompt:
      'กาแฟ: ถุงเล็ก 250g ราคา 200 บาท / ถุงใหญ่ 1000g ราคา 750 บาท — แบบไหนคุ้มกว่า/กรัม?',
    choices: [
      { id: 'a', text: 'ถุงใหญ่ (0.75 บาท/g)' },
      { id: 'b', text: 'ถุงเล็ก (0.80 บาท/g)' },
      { id: 'c', text: 'เท่ากัน' },
      { id: 'd', text: 'ถุงเล็ก (0.50 บาท/g)' },
    ],
    correctChoiceId: 'a',
  }),
};

export const H7: BankedQuestion = {
  difficulty: 'hard',
  skill: 'word-problem',
  question: textInput({
    id: `${P}-h7`,
    prompt:
      'ปั๊มน้ำ 3 ตัว สูบน้ำเต็มถังใช้เวลา 40 นาที — ถ้าใช้ 5 ตัว ใช้เวลากี่นาที?',
    expectedAnswer: 24,
    unit: 'นาที',
  }),
};

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export const allQuestions: BankedQuestion[] = [
  E1, E2, E3, E4, E5, E6, E7, E8,
  M1, M2, M3, M4, M5, M6, M7, M8,
  H1, H2, H3, H4, H5, H6, H7,
];

export const byDifficulty = (d: Difficulty): Question[] =>
  allQuestions.filter((q) => q.difficulty === d).map((q) => q.question);

export const bySkill = (s: Skill): Question[] =>
  allQuestions.filter((q) => q.skill === s).map((q) => q.question);
