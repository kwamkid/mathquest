// lib/curricula/bnc-y3/topics/fractions/adding-fractions/lessons.ts
//
// 7 lessons that progressively teach adding fractions (same denominator).
// Lesson order is the chapter's reading order — lesson 1 → 7.

import type { Lesson } from '@/types/curriculum';
import {
  concept,
  guidedPractice,
  independentPractice,
  lesson,
  miniQuiz,
  reflection,
  workedExample,
} from '@/lib/curricula/helpers/lesson-builders';
import {
  callout,
  fractionAddition,
  fractionBar,
  fractionCircle,
  text,
} from '@/lib/curricula/helpers/visual-builders';
import {
  clickFraction,
  mcqText,
  mcqVisual,
  textInput,
} from '@/lib/curricula/helpers/question-builders';

const SUB = 'bnc-y3-fractions-adding';

// ---------------------------------------------------------------------------
// Lesson 1 — Pizza & Fractions (visual intro)
// ---------------------------------------------------------------------------
const lesson1: Lesson = lesson({
  id: `${SUB}-l1`,
  subTopicId: SUB,
  order: 1,
  title: 'Pizza and Fractions — พิซซ่ากับเศษส่วน 🍕',
  description: 'รู้จัก fraction และวิธีบวกแบบใช้ภาพ',
  estimatedMinutes: 30,
  learningObjectives: [
    'อธิบายความหมายของ numerator และ denominator ได้',
    'แสดงเศษส่วนตัวส่วนเท่ากันด้วยภาพได้',
    'บวกเศษส่วนตัวส่วนเท่ากันโดยใช้ภาพได้',
  ],
  steps: [
    concept(`${SUB}-l1-s1`, 'Fraction คืออะไร', [
      text('**fraction (เศษส่วน)** คือการแบ่งของหนึ่งชิ้นออกเป็นส่วนๆ ที่เท่ากัน'),
      text(
        'เลขข้างบนเรียกว่า **numerator (ตัวเศษ)** บอกว่าเราเอาไปกี่ส่วน และเลขข้างล่างเรียกว่า **denominator (ตัวส่วน)** บอกว่าทั้งหมดมีกี่ส่วน',
      ),
      fractionCircle(1, 4, 'หนึ่งส่วนสี่ของพิซซ่า'),
      callout('tip', 'จำง่ายๆ: ตัวเลขข้าง**บน** = ส่วนที่เราเอา ตัวเลขข้าง**ล่าง** = ส่วนทั้งหมด'),
    ]),
    workedExample({
      id: `${SUB}-l1-s2`,
      title: 'ลองทำให้ดู — 1/5 + 2/5 = ?',
      problemStatement: '1/5 + 2/5 = ?',
      steps: [
        {
          narration:
            'ลองดูพิซซ่า 2 ถาดของเรา — ถาดซ้ายแบ่งเป็น 5 ส่วน แม่กินไป 1 ส่วน คือ 1/5 ส่วนถาดขวาก็แบ่งเป็น 5 ส่วน พี่กินไป 2 ส่วน คือ 2/5',
          visual: fractionAddition({
            left: { numerator: 1, denominator: 5 },
            right: { numerator: 2, denominator: 5 },
            result: { numerator: 0, denominator: 5 },
            style: 'circle',
          }),
        },
        {
          narration:
            'สังเกตไหมว่าทั้ง 2 ถาดมี **denominator เท่ากัน** = 5 — แปลว่าแต่ละชิ้นมีขนาดเท่ากันพอดี เราจึงรวมเข้าด้วยกันได้เลย',
          visual: callout(
            'info',
            'กฎสำคัญ: ถ้า **denominator เท่ากัน** เราบวกแค่ **numerator** ตัวส่วนคงเดิม',
          ),
        },
        {
          narration: 'ดังนั้น 1 ชิ้น + 2 ชิ้น = 3 ชิ้น จากทั้งหมด 5 ชิ้น → คำตอบคือ 3/5',
          visual: fractionAddition({
            left: { numerator: 1, denominator: 5 },
            right: { numerator: 2, denominator: 5 },
            result: { numerator: 3, denominator: 5 },
            style: 'circle',
          }),
          formula: '1/5 + 2/5 = 3/5',
        },
      ],
    }),
    guidedPractice({
      id: `${SUB}-l1-s3`,
      title: 'ลองดูเอง — ระบายพิซซ่า',
      question: clickFraction({
        id: `${SUB}-l1-q1`,
        prompt: 'ระบาย 3 ชิ้นจาก 8 ชิ้น เพื่อแสดงเศษส่วน 3/8',
        totalParts: 8,
        expectedFilled: 3,
        style: 'circle',
      }),
      hints: [
        'ตัวเลขข้างบนของ 3/8 คือ 3 — แปลว่าเราต้องระบาย 3 ชิ้น',
        'นับดีๆ — กดเพื่อระบาย กดอีกครั้งเพื่อเอาออก',
      ],
      fullExplanation:
        'numerator ของ 3/8 คือ 3 ดังนั้นต้องระบายให้ครบ 3 ชิ้น (จะเลือกชิ้นไหนก็ได้)',
    }),
    guidedPractice({
      id: `${SUB}-l1-s4`,
      title: 'พิซซ่ารวมกันได้เท่าไร',
      question: mcqVisual({
        id: `${SUB}-l1-q2`,
        prompt: 'แม่ตัดพิซซ่าเป็น 6 ชิ้น น้องกินไป 2/6 พี่กินไป 3/6 รวมกันกินไปเท่าไร?',
        choices: [
          { id: 'a', visual: fractionCircle(5, 6, '5/6') },
          { id: 'b', visual: fractionCircle(4, 6, '4/6') },
          { id: 'c', visual: fractionCircle(5, 12, '5/12') },
          { id: 'd', visual: fractionCircle(1, 6, '1/6') },
        ],
        correctChoiceId: 'a',
      }),
      hints: ['numerator: 2 + 3 = ?', 'denominator เท่าเดิม = 6 (อย่าเปลี่ยน!)'],
      fullExplanation: '2/6 + 3/6 — ตัวส่วนเหมือนกัน บวกแค่ตัวเศษ → 2 + 3 = 5 → คำตอบ 5/6',
    }),
    guidedPractice({
      id: `${SUB}-l1-s5`,
      title: 'เลือกคำตอบที่ถูก',
      question: mcqText({
        id: `${SUB}-l1-q3`,
        prompt: '1/4 + 2/4 = ?',
        choices: [
          { id: 'a', text: '3/4' },
          { id: 'b', text: '3/8' },
          { id: 'c', text: '2/4' },
          { id: 'd', text: '1/8' },
        ],
        correctChoiceId: 'a',
      }),
      hints: ['denominator เท่ากัน บวกแค่ numerator', '1 + 2 = 3 → 3 อยู่บน, 4 อยู่ล่าง'],
      fullExplanation: 'ตัวส่วนเหมือนกัน = 4 → numerator: 1 + 2 = 3 → 3/4',
    }),
    independentPractice({
      id: `${SUB}-l1-s6`,
      title: 'ฝึกเอง 3 ข้อ',
      questions: [
        mcqText({
          id: `${SUB}-l1-q4`,
          prompt: '2/5 + 1/5 = ?',
          choices: [
            { id: 'a', text: '3/5' },
            { id: 'b', text: '3/10' },
            { id: 'c', text: '2/5' },
            { id: 'd', text: '1/5' },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l1-q5`,
          prompt: '3/7 + 2/7 = ?',
          choices: [
            { id: 'a', text: '5/7' },
            { id: 'b', text: '5/14' },
            { id: 'c', text: '6/7' },
            { id: 'd', text: '1/7' },
          ],
          correctChoiceId: 'a',
        }),
        mcqVisual({
          id: `${SUB}-l1-q6`,
          prompt: 'พิซซ่า 8 ชิ้น — กิน 1/8 + 3/8 รวมกินไปเท่าไร?',
          choices: [
            { id: 'a', visual: fractionCircle(4, 8, '4/8') },
            { id: 'b', visual: fractionCircle(3, 8, '3/8') },
            { id: 'c', visual: fractionCircle(4, 16, '4/16') },
            { id: 'd', visual: fractionCircle(2, 8, '2/8') },
          ],
          correctChoiceId: 'a',
        }),
      ],
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 2 — From Pictures to Numbers (chocolate)
// ---------------------------------------------------------------------------
const lesson2: Lesson = lesson({
  id: `${SUB}-l2`,
  subTopicId: SUB,
  order: 2,
  title: 'From Pictures to Numbers — จากภาพสู่ตัวเลข 🍫',
  description: 'บวกเศษส่วนตัวส่วนเท่ากันด้วยตัวเลขล้วน',
  estimatedMinutes: 30,
  learningObjectives: [
    'อธิบายได้ว่าทำไม denominator ไม่เปลี่ยน',
    'บวกเศษส่วนตัวส่วนเท่ากันจากโจทย์ตัวเลขล้วนได้',
  ],
  steps: [
    concept(`${SUB}-l2-s1`, 'ทำไม denominator ถึงไม่เปลี่ยน?', [
      text('ลองนึกถึง **chocolate bar (ช็อกโกแลตแท่ง)** ที่หักได้ 8 ช่องเท่ากัน — ช่องหนึ่งช่องเรียกว่า 1/8'),
      fractionBar(1, 8, '1 ช่อง = 1/8'),
      text(
        'ถ้าเราเอาช็อกโกแลต 2 ช่อง บวกกับอีก 3 ช่อง — เรามีช็อกโกแลต **5 ช่อง** ใช่ไหม? แต่ละช่องยังเป็น 1/8 เท่าเดิม',
      ),
      fractionAddition({
        left: { numerator: 2, denominator: 8 },
        right: { numerator: 3, denominator: 8 },
        result: { numerator: 5, denominator: 8 },
      }),
      callout(
        'tip',
        '**denominator** บอกว่าแต่ละชิ้นใหญ่แค่ไหน — ถ้าขนาดชิ้นไม่เปลี่ยน เลขข้างล่างก็ไม่เปลี่ยน',
      ),
    ]),
    workedExample({
      id: `${SUB}-l2-s2`,
      title: 'ทำให้ดู — ไม่ต้องวาดภาพแล้ว',
      problemStatement: '3/10 + 4/10 = ?',
      steps: [
        {
          narration:
            'ตรวจดูก่อน — denominator ของทั้งสองตัวคืออะไร? ตัวซ้าย 10 ตัวขวา 10 → **เท่ากัน** ✓',
          formula: 'ตัวส่วน: 10 = 10 ✓',
        },
        {
          narration: 'เมื่อ denominator เท่ากัน เราบวกเฉพาะ numerator: 3 + 4 = 7',
          formula: '3 + 4 = 7',
        },
        {
          narration: 'เอา numerator ใหม่ (= 7) มาวางบน denominator เดิม (= 10) → คำตอบคือ 7/10',
          formula: '3/10 + 4/10 = 7/10',
          visual: fractionBar(7, 10, 'ตรวจดูด้วยภาพ — 7 ใน 10'),
        },
      ],
    }),
    workedExample({
      id: `${SUB}-l2-s3`,
      title: 'อีกหนึ่งตัวอย่าง',
      problemStatement: '2/6 + 3/6 = ?',
      steps: [
        { narration: 'denominator เท่ากันไหม? 6 = 6 ✓' },
        {
          narration: '2 + 3 = 5 → คำตอบ 5/6',
          formula: '2/6 + 3/6 = 5/6',
          visual: fractionBar(5, 6),
        },
      ],
    }),
    guidedPractice({
      id: `${SUB}-l2-s4`,
      title: 'ลองพิมพ์คำตอบเอง',
      question: textInput({
        id: `${SUB}-l2-q1`,
        prompt: '1/4 + 2/4 = ? (พิมพ์แบบ a/b เช่น 3/4)',
        expectedAnswer: '3/4',
        answerType: 'fraction',
      }),
      hints: ['denominator เหมือนกัน คงเป็น 4', '1 + 2 = 3 → คำตอบขึ้นต้นด้วย 3/...'],
      fullExplanation: 'ตัวส่วนเท่ากัน = 4 → numerator: 1 + 2 = 3 → 3/4',
    }),
    guidedPractice({
      id: `${SUB}-l2-s5`,
      title: 'ฝึกอีกข้อ',
      question: textInput({
        id: `${SUB}-l2-q2`,
        prompt: '4/9 + 2/9 = ?',
        expectedAnswer: '6/9',
        answerType: 'fraction',
      }),
      hints: ['denominator คงเป็น 9', '4 + 2 = ?'],
      fullExplanation: '4 + 2 = 6 → 6/9',
    }),
    independentPractice({
      id: `${SUB}-l2-s6`,
      title: 'ฝึกเอง 4 ข้อ',
      questions: [
        textInput({
          id: `${SUB}-l2-q3`,
          prompt: '1/5 + 3/5 = ?',
          expectedAnswer: '4/5',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l2-q4`,
          prompt: '2/7 + 4/7 = ?',
          expectedAnswer: '6/7',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l2-q5`,
          prompt: '3/8 + 2/8 = ?',
          choices: [
            { id: 'a', text: '5/8' },
            { id: 'b', text: '5/16' },
            { id: 'c', text: '6/8' },
            { id: 'd', text: '1/8' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l2-q6`,
          prompt: '5/10 + 4/10 = ?',
          expectedAnswer: '9/10',
          answerType: 'fraction',
        }),
      ],
    }),
    reflection({
      id: `${SUB}-l2-s7`,
      title: 'สิ่งที่ได้เรียนวันนี้',
      keyTakeaways: [
        'เมื่อ denominator เท่ากัน เราบวกแค่ numerator',
        'denominator คงเดิมเพราะขนาดชิ้นไม่เปลี่ยน',
        'เขียนเป็นตัวเลขก็ใช้กฎเดียวกับภาพ',
      ],
      nextUp: 'บทต่อไปจะฝึกหลายๆ ข้อ และเริ่มเห็นโจทย์ word problem',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 3 — Practice (10 mixed)
// ---------------------------------------------------------------------------
const lesson3: Lesson = lesson({
  id: `${SUB}-l3`,
  subTopicId: SUB,
  order: 3,
  title: 'Practice — ฝึกบวกเศษส่วน 🍰',
  description: 'ฝึก 10 ข้อผสม visual + symbolic',
  estimatedMinutes: 20,
  learningObjectives: ['บวกเศษส่วนตัวส่วนเท่ากันได้คล่อง'],
  steps: [
    independentPractice({
      id: `${SUB}-l3-s1`,
      title: 'ฝึก 10 ข้อ — เค้กและคุกกี้',
      questions: [
        mcqVisual({
          id: `${SUB}-l3-q1`,
          prompt: 'เค้กตัดเป็น 4 ชิ้น — กิน 1/4 + 2/4 รวมเท่าไร?',
          choices: [
            { id: 'a', visual: fractionCircle(3, 4) },
            { id: 'b', visual: fractionCircle(2, 4) },
            { id: 'c', visual: fractionCircle(3, 8) },
            { id: 'd', visual: fractionCircle(1, 4) },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l3-q2`,
          prompt: '2/9 + 5/9 = ?',
          expectedAnswer: '7/9',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l3-q3`,
          prompt: '3/7 + 3/7 = ?',
          choices: [
            { id: 'a', text: '6/7' },
            { id: 'b', text: '6/14' },
            { id: 'c', text: '3/7' },
            { id: 'd', text: '9/7' },
          ],
          correctChoiceId: 'a',
        }),
        clickFraction({
          id: `${SUB}-l3-q4`,
          prompt: 'ระบาย 5/8 บนคุกกี้ (กดเพื่อระบาย กดอีกครั้งเพื่อเอาออก)',
          totalParts: 8,
          expectedFilled: 5,
          style: 'circle',
        }),
        textInput({
          id: `${SUB}-l3-q5`,
          prompt: '1/6 + 4/6 = ?',
          expectedAnswer: '5/6',
          answerType: 'fraction',
        }),
        mcqVisual({
          id: `${SUB}-l3-q6`,
          prompt: 'รูปไหนแสดง 4/10?',
          choices: [
            { id: 'a', visual: fractionBar(4, 10) },
            { id: 'b', visual: fractionBar(4, 8) },
            { id: 'c', visual: fractionBar(3, 10) },
            { id: 'd', visual: fractionBar(6, 10) },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l3-q7`,
          prompt: '2/12 + 5/12 = ?',
          expectedAnswer: '7/12',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l3-q8`,
          prompt: 'มีคุกกี้ 12 ชิ้น — กิน 3/12 ตอนเช้า กิน 5/12 ตอนบ่าย รวมกินไปเท่าไร?',
          choices: [
            { id: 'a', text: '8/12' },
            { id: 'b', text: '8/24' },
            { id: 'c', text: '4/12' },
            { id: 'd', text: '15/12' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l3-q9`,
          prompt: '4/11 + 2/11 = ?',
          expectedAnswer: '6/11',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l3-q10`,
          prompt: '1/3 + 1/3 = ?',
          expectedAnswer: '2/3',
          answerType: 'fraction',
        }),
      ],
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 4 — Mini Quiz (5 stars / 10 perfect)
// ---------------------------------------------------------------------------
const lesson4: Lesson = lesson({
  id: `${SUB}-l4`,
  subTopicId: SUB,
  order: 4,
  title: 'Mini Quiz — เก็บดาว ⭐',
  description: 'ทดสอบ 5 ข้อ — ได้ 5 ดาวถ้าผ่าน, เต็มทุกข้อได้ 10 ดาว',
  estimatedMinutes: 10,
  learningObjectives: ['ผ่าน mini quiz ที่ระดับ 70% ขึ้นไป'],
  steps: [
    miniQuiz({
      id: `${SUB}-l4-s1`,
      title: 'Mini Quiz — บวกเศษส่วน',
      questions: [
        textInput({
          id: `${SUB}-l4-q1`,
          prompt: '2/5 + 2/5 = ?',
          expectedAnswer: '4/5',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l4-q2`,
          prompt: '3/10 + 4/10 = ?',
          choices: [
            { id: 'a', text: '7/10' },
            { id: 'b', text: '7/20' },
            { id: 'c', text: '12/10' },
            { id: 'd', text: '1/10' },
          ],
          correctChoiceId: 'a',
        }),
        mcqVisual({
          id: `${SUB}-l4-q3`,
          prompt: '1/6 + 3/6 = ? (เลือกรูปที่ถูก)',
          choices: [
            { id: 'a', visual: fractionCircle(4, 6) },
            { id: 'b', visual: fractionCircle(2, 6) },
            { id: 'c', visual: fractionCircle(4, 12) },
            { id: 'd', visual: fractionCircle(3, 6) },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l4-q4`,
          prompt: '1/8 + 6/8 = ?',
          expectedAnswer: '7/8',
          answerType: 'fraction',
        }),
        clickFraction({
          id: `${SUB}-l4-q5`,
          prompt: 'ระบาย 2/4 ในคุกกี้',
          totalParts: 4,
          expectedFilled: 2,
          style: 'circle',
        }),
      ],
      passingScore: 0.7,
      starsOnPass: 5,
      starsOnPerfect: 10,
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 5 — Sum ≥ 1 (juice)
// ---------------------------------------------------------------------------
const lesson5: Lesson = lesson({
  id: `${SUB}-l5`,
  subTopicId: SUB,
  order: 5,
  title: 'When the Sum is Whole — เมื่อผลลัพธ์เกิน 1 🥤',
  description: 'รู้จัก improper fraction และอ่านเป็น mixed number',
  estimatedMinutes: 30,
  learningObjectives: [
    'เข้าใจว่าผลบวกสามารถเท่ากับหรือมากกว่า 1 ได้',
    'อ่าน improper fraction และ mixed number เบื้องต้น',
  ],
  steps: [
    concept(`${SUB}-l5-s1`, 'น้ำส้ม 1 แก้ว = 4/4', [
      text('ลองนึกถึง **glass (แก้ว)** น้ำส้มที่แบ่งเป็น 4 ส่วน — ถ้าเต็มแก้วก็คือ 4/4 หรือเท่ากับ **1 แก้วเต็ม**'),
      fractionBar(4, 4, '4/4 = 1 แก้วเต็ม'),
      callout('info', 'ถ้า numerator = denominator → เท่ากับ **1 whole (หนึ่งทั้งอัน)**'),
    ]),
    concept(`${SUB}-l5-s2`, 'ผลบวกที่เกิน 1', [
      text('สมมติพี่ดื่มน้ำส้มไป 3/4 แก้ว แล้วน้องดื่มไปอีก 2/4 แก้ว — รวมกันดื่มไปกี่ส่วน?'),
      fractionAddition({
        left: { numerator: 3, denominator: 4 },
        right: { numerator: 2, denominator: 4 },
        result: { numerator: 5, denominator: 4 },
      }),
      text('numerator 3 + 2 = 5 → 5/4 — แต่เดี๋ยวก่อน! 5/4 มี numerator **มากกว่า** denominator'),
      callout(
        'tip',
        'เมื่อ **numerator > denominator** เรียกว่า **improper fraction (เศษเกิน)** — แปลว่าผลลัพธ์มากกว่า 1',
      ),
      text(
        '5/4 อ่านว่า "ห้าส่วนสี่" หรือเขียนเป็น **mixed number (จำนวนคละ)** ได้ว่า `1 1/4` — แปลว่า **1 แก้วเต็ม** บวกอีก **1/4 แก้ว**',
      ),
    ]),
    workedExample({
      id: `${SUB}-l5-s3`,
      title: 'ทำให้ดู — 3/5 + 4/5',
      problemStatement: '3/5 + 4/5 = ?',
      steps: [
        { narration: 'denominator เท่ากันไหม? 5 = 5 ✓' },
        { narration: 'บวก numerator: 3 + 4 = 7', formula: '3 + 4 = 7' },
        {
          narration: '7/5 — สังเกตว่า 7 > 5 → improper fraction (เกิน 1)',
          formula: '3/5 + 4/5 = 7/5',
          visual: fractionBar(5, 5, 'เต็ม 1 แก้ว (5/5)'),
        },
        { narration: 'อ่านเป็น mixed number ได้ว่า 1 2/5 — เต็ม 1 แล้วเหลือ 2/5' },
      ],
    }),
    guidedPractice({
      id: `${SUB}-l5-s4`,
      title: 'ลองทำเอง',
      question: textInput({
        id: `${SUB}-l5-q1`,
        prompt: '2/3 + 2/3 = ? (ตอบเป็น improper fraction รูปแบบ a/b เช่น 4/3 — ยังไม่ต้องแปลงเป็น mixed number)',
        expectedAnswer: '4/3',
        answerType: 'fraction',
      }),
      hints: [
        'denominator คงเป็น 3',
        '2 + 2 = 4 → numerator มากกว่า denominator ใช่ไหม? ไม่เป็นไร เขียนเป็น 4/3 ได้เลย',
        'ตอบในรูป a/b เท่านั้น (ไม่ต้องเขียน mixed number 1 1/3)',
      ],
      fullExplanation: '2 + 2 = 4 → 4/3 (improper fraction) อ่านได้ว่า 1 1/3',
    }),
    guidedPractice({
      id: `${SUB}-l5-s5`,
      title: 'อ่าน mixed number',
      question: mcqText({
        id: `${SUB}-l5-q2`,
        prompt: '6/4 อ่านเป็น mixed number ว่าอะไร?',
        choices: [
          { id: 'a', text: '1 2/4' },
          { id: 'b', text: '2 6/4' },
          { id: 'c', text: '6 1/4' },
          { id: 'd', text: '1 1/4' },
        ],
        correctChoiceId: 'a',
      }),
      hints: ['4/4 = 1 เต็ม → เหลือ numerator อีกเท่าไร?', '6 - 4 = 2 → เหลือ 2/4'],
      fullExplanation: '6/4: 4/4 = 1 เต็ม เหลือ 2/4 → 1 2/4',
    }),
    independentPractice({
      id: `${SUB}-l5-s6`,
      title: 'ฝึก 7 ข้อ',
      questions: [
        textInput({
          id: `${SUB}-l5-q3`,
          prompt: '4/5 + 3/5 = ? (ตอบในรูป a/b เช่น 7/5)',
          expectedAnswer: '7/5',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l5-q4`,
          prompt: '5/8 + 5/8 = ? (ตอบในรูป a/b เช่น 10/8)',
          expectedAnswer: '10/8',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l5-q5`,
          prompt: '3/4 + 3/4 = ?',
          choices: [
            { id: 'a', text: '6/4' },
            { id: 'b', text: '6/8' },
            { id: 'c', text: '3/4' },
            { id: 'd', text: '9/4' },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l5-q6`,
          prompt: '8/5 เท่ากับ mixed number ตัวไหน?',
          choices: [
            { id: 'a', text: '1 3/5' },
            { id: 'b', text: '8 0/5' },
            { id: 'c', text: '3 1/5' },
            { id: 'd', text: '5 3/8' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l5-q7`,
          prompt: '6/7 + 5/7 = ? (ตอบในรูป a/b เช่น 11/7)',
          expectedAnswer: '11/7',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l5-q8`,
          prompt: '4/6 + 4/6 = 8/6 — เขียนเป็น mixed number ได้ว่าอะไร?',
          choices: [
            { id: 'a', text: '1 2/6' },
            { id: 'b', text: '2 4/6' },
            { id: 'c', text: '8 1/6' },
            { id: 'd', text: '1 4/6' },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l5-q9`,
          prompt: '7/4 เขียนเป็น mixed number ได้ว่าอะไร?',
          choices: [
            { id: 'a', text: '1 3/4' },
            { id: 'b', text: '3 1/4' },
            { id: 'c', text: '2 1/4' },
            { id: 'd', text: '7 1/4' },
          ],
          correctChoiceId: 'a',
        }),
      ],
    }),
    reflection({
      id: `${SUB}-l5-s7`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        'ผลบวกเศษส่วนอาจ "เกิน 1" ได้ — เรียกว่า improper fraction',
        '4/4 = 1, 5/5 = 1, 8/8 = 1 — denominator เท่ากับ numerator คือ 1 เต็ม',
        'mixed number ใช้บอกเต็มกี่อัน + เหลือเท่าไร',
      ],
      nextUp: 'บทต่อไปจะลอง word problem — โจทย์เป็นเรื่องราว',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 6 — Word Problems
// ---------------------------------------------------------------------------
const lesson6: Lesson = lesson({
  id: `${SUB}-l6`,
  subTopicId: SUB,
  order: 6,
  title: 'Word Problems — โจทย์ปัญหา',
  description: 'แก้ word problem 1-2 ขั้นเกี่ยวกับการบวกเศษส่วน',
  estimatedMinutes: 30,
  learningObjectives: [
    'อ่านโจทย์ปัญหา แล้วระบุได้ว่าตัวเลขใดคือ numerator และ denominator',
    'แก้ word problem การบวกเศษส่วนตัวส่วนเท่ากันได้',
  ],
  steps: [
    concept(`${SUB}-l6-s1`, 'วิธีแก้โจทย์ปัญหา 3 ขั้น', [
      text('โจทย์ word problem ฟังดูเยอะ แต่จริงๆ ใช้กฎเดิมที่เราเรียนมา 3 ขั้นง่ายๆ:'),
      callout(
        'tip',
        '**1. Read (อ่าน)** — อ่านช้าๆ ดูว่าโจทย์ถามอะไร\n\n**2. Identify (ระบุ)** — ตัวเลขในโจทย์คือ numerator/denominator อะไร\n\n**3. Compute (คำนวณ)** — บวก numerator (ตัวส่วนคงเดิม)',
      ),
    ]),
    workedExample({
      id: `${SUB}-l6-s2`,
      title: 'ทำให้ดู — โจทย์เค้ก 🍰',
      problemStatement:
        'แม่ทำเค้กแบ่งเป็น 8 ชิ้น น้องกินไป 2/8 ของเค้ก พี่กินไป 3/8 ของเค้ก รวมทั้งสองคนกินไปเท่าไรของเค้ก?',
      steps: [
        {
          narration: 'ขั้นที่ 1 (Read) — โจทย์ถามว่า "รวมทั้งสองคนกินไปเท่าไร" → ต้องหาผลบวก',
        },
        {
          narration: 'ขั้นที่ 2 (Identify) — denominator = 8 (เค้กแบ่ง 8 ชิ้น) / น้องกิน 2/8, พี่กิน 3/8',
          formula: '2/8 + 3/8 = ?',
        },
        {
          narration: 'ขั้นที่ 3 (Compute) — 2 + 3 = 5 → 5/8',
          formula: '2/8 + 3/8 = 5/8',
          visual: fractionAddition({
            left: { numerator: 2, denominator: 8 },
            right: { numerator: 3, denominator: 8 },
            result: { numerator: 5, denominator: 8 },
          }),
        },
        { narration: 'ตอบ: รวมทั้งสองคนกินไป **5/8** ของเค้ก' },
      ],
    }),
    guidedPractice({
      id: `${SUB}-l6-s3`,
      title: 'ลองทำเอง — โจทย์น้ำส้ม 🥤',
      question: textInput({
        id: `${SUB}-l6-q1`,
        prompt:
          'น้ำส้ม 1 ขวดแบ่งเป็น 5 แก้วเท่ากัน เช้านี้พี่ดื่มไป 2 แก้ว (2/5) ตอนบ่ายดื่มอีก 1 แก้ว (1/5) — รวมพี่ดื่มไปเท่าไรของขวด?',
        expectedAnswer: '3/5',
        answerType: 'fraction',
      }),
      hints: ['denominator = 5 (5 แก้วจากขวดเดียว)', '2/5 + 1/5 — บวกแค่ numerator'],
      fullExplanation: '2 + 1 = 3 → 3/5 ของขวด',
    }),
    guidedPractice({
      id: `${SUB}-l6-s4`,
      title: 'โจทย์ขนม 🍪',
      question: textInput({
        id: `${SUB}-l6-q2`,
        prompt:
          'มีคุกกี้ในกล่อง 10 ชิ้น น้องหยิบไป 3 ชิ้น (3/10) พี่หยิบไป 4 ชิ้น (4/10) — รวมหยิบไปเท่าไรของกล่อง?',
        expectedAnswer: '7/10',
        answerType: 'fraction',
      }),
      hints: ['denominator คงเป็น 10', '3 + 4 = ?'],
      fullExplanation: '3 + 4 = 7 → 7/10',
    }),
    guidedPractice({
      id: `${SUB}-l6-s5`,
      title: 'โจทย์ที่ผลลัพธ์เกิน 1',
      question: mcqText({
        id: `${SUB}-l6-q3`,
        prompt:
          'พิซซ่า 1 ถาด ตัดเป็น 4 ชิ้น พี่กิน 3/4 ของถาด น้องกิน 2/4 ของถาด — รวมกินไปเท่าไรของถาด?',
        choices: [
          { id: 'a', text: '5/4 (เกิน 1 ถาด — เป็นไปไม่ได้?)' },
          { id: 'b', text: '5/8' },
          { id: 'c', text: '1/4' },
          { id: 'd', text: '6/4' },
        ],
        correctChoiceId: 'a',
      }),
      hints: [
        'denominator = 4',
        '3 + 2 = 5 → 5/4 — ผลลัพธ์เกิน 1 (ในทางคณิตศาสตร์ — แต่ในความจริงต้องมีพิซซ่ามากกว่า 1 ถาด!)',
      ],
      fullExplanation:
        '3/4 + 2/4 = 5/4 — โจทย์นี้ผลลัพธ์เป็น improper fraction (เกิน 1) แสดงว่าในความเป็นจริงต้องมีพิซซ่ามากกว่า 1 ถาด',
    }),
    independentPractice({
      id: `${SUB}-l6-s6`,
      title: 'ฝึก word problem 5 ข้อ',
      questions: [
        textInput({
          id: `${SUB}-l6-q4`,
          prompt:
            'มีแอปเปิ้ลในตะกร้า 6 ลูก แม่หยิบไป 1 ลูก (1/6) ลุงหยิบไป 2 ลูก (2/6) — รวมหยิบไปเท่าไรของตะกร้า?',
          expectedAnswer: '3/6',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l6-q5`,
          prompt: 'พิซซ่าตัดเป็น 8 ชิ้น พี่กิน 3/8 น้องกิน 2/8 — รวมกินไปเท่าไรของถาด?',
          expectedAnswer: '5/8',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l6-q6`,
          prompt: 'ช็อกโกแลตหักได้ 12 ช่อง น้องกิน 4 ช่อง พี่กิน 3 ช่อง — รวมกี่ส่วนของแท่ง?',
          choices: [
            { id: 'a', text: '7/12' },
            { id: 'b', text: '7/24' },
            { id: 'c', text: '1/12' },
            { id: 'd', text: '12/7' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l6-q7`,
          prompt: 'เค้กตัด 9 ชิ้น พี่กิน 2/9 น้องกิน 4/9 ลุงกิน 1/9 — รวมกินไปเท่าไรของเค้ก?',
          expectedAnswer: '7/9',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l6-q8`,
          prompt: 'น้ำผลไม้ 1 เหยือกแบ่งเป็น 10 แก้ว เช้าดื่ม 3/10 บ่ายดื่ม 5/10 — รวมดื่มไปเท่าไรของเหยือก?',
          expectedAnswer: '8/10',
          answerType: 'fraction',
        }),
      ],
    }),
    reflection({
      id: `${SUB}-l6-s7`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        'โจทย์ word problem ใช้กฎเดิม: denominator คงเดิม บวก numerator',
        'อ่านโจทย์ช้าๆ — ระบุ denominator (ของทั้งหมดมีกี่ส่วน) ก่อนเสมอ',
        'ผลลัพธ์ที่เกิน 1 (เช่น 5/4) ในโลกจริงอาจหมายความว่าต้องมีของมากกว่า 1 ชิ้น',
      ],
      nextUp: 'บทถัดไปคือทดสอบประจำหัวข้อ — เก็บดาวให้เต็ม!',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 7 — Chapter Assessment (10 mixed)
// ---------------------------------------------------------------------------
const lesson7: Lesson = lesson({
  id: `${SUB}-l7`,
  subTopicId: SUB,
  order: 7,
  title: 'Chapter Assessment — ทดสอบบท',
  description: 'ทดสอบ 10 ข้อรวบยอดทั้งบท',
  estimatedMinutes: 20,
  learningObjectives: ['ผ่านบท Adding Fractions ที่ 70% ขึ้นไป'],
  isAssessment: true,
  steps: [
    miniQuiz({
      id: `${SUB}-l7-s1`,
      title: 'Chapter Assessment — บวกเศษส่วน',
      questions: [
        textInput({
          id: `${SUB}-l7-q1`,
          prompt: '2/7 + 3/7 = ?',
          expectedAnswer: '5/7',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l7-q2`,
          prompt: '1/9 + 4/9 = ?',
          expectedAnswer: '5/9',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l7-q3`,
          prompt: '3/8 + 3/8 = ?',
          expectedAnswer: '6/8',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l7-q4`,
          prompt: '5/6 + 4/6 = ? (อาจเกิน 1)',
          expectedAnswer: '9/6',
          answerType: 'fraction',
        }),
        mcqVisual({
          id: `${SUB}-l7-q5`,
          prompt: 'รูปไหนแสดง 3/5?',
          choices: [
            { id: 'a', visual: fractionBar(3, 5) },
            { id: 'b', visual: fractionBar(2, 5) },
            { id: 'c', visual: fractionBar(3, 8) },
            { id: 'd', visual: fractionBar(5, 3) },
          ],
          correctChoiceId: 'a',
        }),
        mcqVisual({
          id: `${SUB}-l7-q6`,
          prompt: '1/4 + 2/4 = ? (เลือกรูปที่ถูก)',
          choices: [
            { id: 'a', visual: fractionCircle(3, 4) },
            { id: 'b', visual: fractionCircle(2, 4) },
            { id: 'c', visual: fractionCircle(3, 8) },
            { id: 'd', visual: fractionCircle(1, 4) },
          ],
          correctChoiceId: 'a',
        }),
        mcqVisual({
          id: `${SUB}-l7-q7`,
          prompt: 'รูปไหนแสดง 4/4?',
          choices: [
            { id: 'a', visual: fractionCircle(4, 4) },
            { id: 'b', visual: fractionCircle(3, 4) },
            { id: 'c', visual: fractionCircle(4, 8) },
            { id: 'd', visual: fractionCircle(1, 4) },
          ],
          correctChoiceId: 'a',
        }),
        clickFraction({
          id: `${SUB}-l7-q8`,
          prompt: 'ระบาย 4/6',
          totalParts: 6,
          expectedFilled: 4,
          style: 'circle',
        }),
        clickFraction({
          id: `${SUB}-l7-q9`,
          prompt: 'ระบาย 5/8 บนแท่งช็อกโกแลต',
          totalParts: 8,
          expectedFilled: 5,
          style: 'bar',
        }),
        mcqText({
          id: `${SUB}-l7-q10`,
          prompt:
            'พิซซ่าตัดเป็น 12 ชิ้น พี่กิน 4 ชิ้น น้องกิน 5 ชิ้น — รวมกินไปเท่าไรของถาด?',
          choices: [
            { id: 'a', text: '9/12' },
            { id: 'b', text: '9/24' },
            { id: 'c', text: '1/12' },
            { id: 'd', text: '12/9' },
          ],
          correctChoiceId: 'a',
        }),
      ],
      passingScore: 0.7,
      starsOnPass: 5,
      starsOnPerfect: 10,
      badgeOnPerfect: 'Fraction Adder',
    }),
  ],
});

export const addingFractionsLessons: Lesson[] = [
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
  lesson6,
  lesson7,
];
