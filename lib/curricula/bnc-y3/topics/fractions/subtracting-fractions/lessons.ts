// lib/curricula/bnc-y3/topics/fractions/subtracting-fractions/lessons.ts
//
// 7 lessons that progressively teach subtracting fractions (same denominator).
// Mirrors the structure of adding-fractions so learners feel a continuous flow.

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

const SUB = 'bnc-y3-fractions-subtracting';

// ---------------------------------------------------------------------------
// Lesson 1 — Pizza Take-Away (visual intro)
// ---------------------------------------------------------------------------
const lesson1: Lesson = lesson({
  id: `${SUB}-l1`,
  subTopicId: SUB,
  order: 1,
  title: 'Pizza Take-Away — กินไปแล้วเหลือเท่าไร? 🍕',
  description: 'รู้จักการลบเศษส่วนด้วยภาพ — เริ่มจากของที่หายไป',
  estimatedMinutes: 30,
  learningObjectives: [
    'อธิบายความหมายของการลบเศษส่วนได้',
    'ใช้ภาพแสดงการลบเศษส่วนตัวส่วนเท่ากันได้',
  ],
  steps: [
    concept(`${SUB}-l1-s1`, 'ทบทวนเศษส่วน + การลบคืออะไร', [
      text(
        '**ทบทวน** — เลขข้างบน = **numerator (ตัวเศษ)** บอกว่าเอาไปกี่ส่วน ส่วนเลขข้างล่าง = **denominator (ตัวส่วน)** บอกว่าทั้งหมดมีกี่ส่วน',
      ),
      fractionCircle(3, 4, 'พิซซ่า 3/4 — มี 4 ชิ้น เหลือ 3 ชิ้น'),
      text(
        '**subtracting fractions (การลบเศษส่วน)** คือการดูว่า "**take away (เอาออก)** แล้ว **left (เหลือ)** เท่าไร?" — เหมือนเดิมที่บวก (**add**) คือ "รวมกันได้เท่าไร" แต่ลบ (**subtract**) คือ "เอาออกแล้วเหลือ"',
      ),
      callout(
        'tip',
        'นึกถึง **pizza (พิซซ่า)** 4 ชิ้น (4/4 = 1 ถาดเต็ม) — กินไป 1 ชิ้น (1/4) **left (เหลือ)** กี่ชิ้น? เหลือ 3 ชิ้น คือ 3/4',
      ),
    ]),
    workedExample({
      id: `${SUB}-l1-s2`,
      title: 'ทำให้ดู — 5/6 - 2/6 = ?',
      problemStatement: '5/6 - 2/6 = ?',
      steps: [
        {
          narration:
            'เริ่มต้นด้วย **pizza (พิซซ่า)** ที่ตัดเป็น 6 ชิ้น และมีอยู่ 5 ชิ้น คือ 5/6',
          visual: fractionBar(5, 6, 'เริ่มต้น 5/6'),
        },
        {
          narration: 'น้องหยิบกินไป 2 ชิ้น (2/6) — แปลว่า **take away (เอาออก)** 2 ส่วน',
        },
        {
          narration:
            'สังเกตว่า **same denominator (ตัวส่วนเท่ากัน)** = 6 → แต่ละชิ้นขนาด **equal (เท่ากัน)** พอดี เราจึง **subtract (ลบ)** กันได้ตรงๆ',
          visual: callout(
            'info',
            'กฎสำคัญ: ถ้า **denominator เท่ากัน** เราลบแค่ **numerator** ตัวส่วนคงเดิม',
          ),
        },
        {
          narration: 'ดังนั้น 5 ชิ้น - 2 ชิ้น = 3 ชิ้น จากทั้งหมด 6 ชิ้น → **answer (คำตอบ)** คือ 3/6',
          visual: fractionBar(3, 6, 'left (เหลือ) 3/6'),
          formula: '5/6 - 2/6 = 3/6',
        },
      ],
    }),
    guidedPractice({
      id: `${SUB}-l1-s3`,
      title: 'ลองดูเอง — ระบายส่วนที่เหลือ',
      question: clickFraction({
        id: `${SUB}-l1-q1`,
        prompt:
          'พิซซ่าตัด 8 ชิ้น มี 7 ชิ้น (7/8) กินไป 3 ชิ้น (3/8) — ระบายส่วนที่ "เหลือ" ให้ดู',
        totalParts: 8,
        expectedFilled: 4,
        style: 'circle',
      }),
      hints: [
        '7 - 3 = ? — บอก numerator ใหม่',
        'denominator ยังเป็น 8 อยู่ คงเดิม',
        '7 - 3 = 4 → เหลือ 4/8 → ระบาย 4 ชิ้น',
      ],
      fullExplanation: '7/8 - 3/8 = 4/8 — denominator คงเดิม ลบแค่ numerator',
    }),
    guidedPractice({
      id: `${SUB}-l1-s4`,
      title: 'เลือกรูปที่แสดงคำตอบ',
      question: mcqVisual({
        id: `${SUB}-l1-q2`,
        prompt: '6/8 - 2/8 = ? — รูปไหนแสดงผลลัพธ์ถูกต้อง?',
        choices: [
          { id: 'a', visual: fractionBar(4, 8, '4/8') },
          { id: 'b', visual: fractionBar(2, 8, '2/8') },
          { id: 'c', visual: fractionBar(8, 8, '8/8') },
          { id: 'd', visual: fractionBar(6, 8, '6/8') },
        ],
        correctChoiceId: 'a',
      }),
      hints: ['denominator คงเดิม = 8', '6 - 2 = ?'],
      fullExplanation: '6/8 - 2/8 = 4/8 — denominator คงเดิม',
    }),
    independentPractice({
      id: `${SUB}-l1-s5`,
      title: 'ฝึก 4 ข้อ',
      questions: [
        mcqVisual({
          id: `${SUB}-l1-q3`,
          prompt: '4/5 - 1/5 = ? — รูปไหนใช่?',
          choices: [
            { id: 'a', visual: fractionBar(3, 5, '3/5') },
            { id: 'b', visual: fractionBar(5, 5, '5/5') },
            { id: 'c', visual: fractionBar(1, 5, '1/5') },
            { id: 'd', visual: fractionBar(4, 5, '4/5') },
          ],
          correctChoiceId: 'a',
        }),
        clickFraction({
          id: `${SUB}-l1-q4`,
          prompt: 'มี 5/6 กินไป 1/6 ระบายส่วนที่เหลือ',
          totalParts: 6,
          expectedFilled: 4,
          style: 'bar',
        }),
        mcqVisual({
          id: `${SUB}-l1-q5`,
          prompt: '7/10 - 4/10 = ?',
          choices: [
            { id: 'a', visual: fractionBar(3, 10, '3/10') },
            { id: 'b', visual: fractionBar(4, 10, '4/10') },
            { id: 'c', visual: fractionBar(11, 10, '11/10') },
            { id: 'd', visual: fractionBar(7, 10, '7/10') },
          ],
          correctChoiceId: 'a',
        }),
        clickFraction({
          id: `${SUB}-l1-q6`,
          prompt: 'มี 6/8 กินไป 4/8 ระบายส่วนที่เหลือ',
          totalParts: 8,
          expectedFilled: 2,
          style: 'circle',
        }),
      ],
    }),
    reflection({
      id: `${SUB}-l1-s6`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**subtract (ลบ) fractions** = "take away (เอาออก) แล้ว left (เหลือ) เท่าไร"',
        '**same denominator** (ตัวส่วนเท่ากัน) → ลบแค่ **numerator** (ตัวเศษ)',
        '**denominator** คงเดิม (stays the same) — ไม่ลบกัน',
      ],
      nextUp: 'บทต่อไปเราจะลบโดยใช้ตัวเลขล้วนๆ (symbols) ไม่ต้องวาดรูป',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 2 — From Visual to Symbolic
// ---------------------------------------------------------------------------
const lesson2: Lesson = lesson({
  id: `${SUB}-l2`,
  subTopicId: SUB,
  order: 2,
  title: 'From Visual to Symbolic — จากภาพสู่ตัวเลข ✏️',
  description: 'ลบเศษส่วนด้วยตัวเลขล้วนๆ — ไม่ต้องวาดรูป',
  estimatedMinutes: 30,
  learningObjectives: [
    'ลบเศษส่วนตัวส่วนเท่ากันด้วยสัญลักษณ์ได้',
    'ระบุได้ว่าเมื่อใดจะใช้กฎ "denominator คงเดิม"',
  ],
  steps: [
    concept(`${SUB}-l2-s1`, 'กฎ 2 ข้อของการลบเศษส่วน', [
      text('เวลา **subtract (ลบ)** เศษส่วนที่ **same denominator (ตัวส่วนเท่ากัน)** ให้ใช้กฎง่ายๆ 2 ข้อ (rules):'),
      callout(
        'tip',
        '**Rule 1: denominator stays the same (ตัวส่วนคงเดิม)** — เพราะแต่ละชิ้นยังขนาดเท่าเดิม\n\n**Rule 2: subtract numerators (ลบแค่ตัวเศษ)** — เพราะเรานับว่า "left (เหลือ) กี่ชิ้น"',
      ),
      text('**Example (ตัวอย่าง):**'),
      text('`8/9 - 3/9 = (8-3)/9 = 5/9` — denominator (9) คงเดิม แค่คำนวณ 8 - 3 = 5'),
    ]),
    workedExample({
      id: `${SUB}-l2-s2`,
      title: 'ทำให้ดู — 7/10 - 4/10',
      problemStatement: '7/10 - 4/10 = ?',
      steps: [
        { narration: '**Check (ตรวจ) denominator:** 10 = 10 → equal (เท่ากัน) ✓ ลบได้เลย' },
        {
          narration: '**denominator stays the same** (คงเดิม) = 10',
          formula: '?/10',
        },
        {
          narration: '**Subtract numerators (ลบตัวเศษ):** 7 - 4 = 3',
          formula: '7 - 4 = 3',
        },
        {
          narration: '**Answer (คำตอบ)** คือ 3/10',
          formula: '7/10 - 4/10 = 3/10',
          visual: fractionBar(3, 10, 'left (เหลือ) 3/10'),
        },
      ],
    }),
    workedExample({
      id: `${SUB}-l2-s3`,
      title: 'อีกตัวอย่าง — 5/8 - 1/8',
      problemStatement: '5/8 - 1/8 = ?',
      steps: [
        { narration: 'denominator: 8 = 8 → เท่ากัน ✓' },
        { narration: 'denominator คงเดิม = 8' },
        { narration: '5 - 1 = 4 → คำตอบ 4/8', formula: '5/8 - 1/8 = 4/8' },
      ],
    }),
    guidedPractice({
      id: `${SUB}-l2-s4`,
      title: 'ลองทำเอง — 9/12 - 5/12',
      question: textInput({
        id: `${SUB}-l2-q1`,
        prompt: '9/12 - 5/12 = ? (พิมพ์เป็น a/b)',
        expectedAnswer: '4/12',
        answerType: 'fraction',
      }),
      hints: ['denominator คงเดิม = 12', '9 - 5 = ?'],
      fullExplanation: '9 - 5 = 4 → 4/12',
    }),
    guidedPractice({
      id: `${SUB}-l2-s5`,
      title: 'ลองทำเอง — 6/7 - 2/7',
      question: textInput({
        id: `${SUB}-l2-q2`,
        prompt: '6/7 - 2/7 = ? (พิมพ์เป็น a/b)',
        expectedAnswer: '4/7',
        answerType: 'fraction',
      }),
      hints: ['denominator คงเดิม = 7', '6 - 2 = ?'],
      fullExplanation: '6 - 2 = 4 → 4/7',
    }),
    independentPractice({
      id: `${SUB}-l2-s6`,
      title: 'ฝึก 6 ข้อ',
      questions: [
        textInput({
          id: `${SUB}-l2-q3`,
          prompt: '8/9 - 3/9 = ?',
          expectedAnswer: '5/9',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l2-q4`,
          prompt: '7/8 - 4/8 = ?',
          expectedAnswer: '3/8',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l2-q5`,
          prompt: '5/6 - 3/6 = ?',
          choices: [
            { id: 'a', text: '2/6' },
            { id: 'b', text: '2/12' },
            { id: 'c', text: '8/6' },
            { id: 'd', text: '5/3' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l2-q6`,
          prompt: '10/11 - 6/11 = ?',
          expectedAnswer: '4/11',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l2-q7`,
          prompt: '7/10 - 2/10 = ?',
          choices: [
            { id: 'a', text: '5/10' },
            { id: 'b', text: '5/0' },
            { id: 'c', text: '9/10' },
            { id: 'd', text: '5/20' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l2-q8`,
          prompt: '11/12 - 7/12 = ?',
          expectedAnswer: '4/12',
          answerType: 'fraction',
        }),
      ],
    }),
    reflection({
      id: `${SUB}-l2-s7`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**Rule (กฎ)** เหมือนเดิม: **denominator stays the same** ลบแค่ **numerator**',
        '**Same denominator** (ตัวส่วนเท่ากัน) → ลบเลข numerator ตรงๆ',
        '**Warning (ระวัง)** — อย่าลบ **denominator**!',
      ],
      nextUp: 'บทต่อไปเป็น **practice day (วันฝึก)** 10 ข้อ — รวมทั้งภาพและตัวเลข',
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
  title: 'Practice Day — ฝึกลบเศษส่วน 💪',
  description: 'ฝึก 10 ข้อ รวมทั้งภาพและตัวเลข + Mini Quiz',
  estimatedMinutes: 30,
  learningObjectives: [
    'ลบเศษส่วนตัวส่วนเท่ากันได้คล่อง',
    'สลับระหว่างวิธีคิดด้วยภาพและตัวเลขได้',
  ],
  steps: [
    concept(`${SUB}-l3-s1`, 'ก่อนเริ่ม — เคล็ดลับ (tips)', [
      text('ก่อนเริ่ม **practice (ฝึก)** วันนี้ จำเคล็ดลับ 3 ข้อ (3 tips):'),
      callout(
        'tip',
        '**1.** **Check (ตรวจ) denominator** — เท่ากันไหม? (ถ้าเท่ากันก็ลบได้เลย)\n\n**2.** **Subtract numerators** (ลบตัวเศษ): บน - บน\n\n**3.** **denominator stays the same** (คงเดิม) — ไม่ต้องลบ',
      ),
    ]),
    independentPractice({
      id: `${SUB}-l3-s2`,
      title: 'ฝึก 10 ข้อ',
      questions: [
        textInput({
          id: `${SUB}-l3-q1`,
          prompt: '6/8 - 3/8 = ?',
          expectedAnswer: '3/8',
          answerType: 'fraction',
        }),
        mcqVisual({
          id: `${SUB}-l3-q2`,
          prompt: '7/9 - 2/9 = ? — เลือกรูปที่ถูก',
          choices: [
            { id: 'a', visual: fractionBar(5, 9, '5/9') },
            { id: 'b', visual: fractionBar(9, 9, '9/9') },
            { id: 'c', visual: fractionBar(2, 9, '2/9') },
            { id: 'd', visual: fractionBar(7, 9, '7/9') },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l3-q3`,
          prompt: '9/10 - 4/10 = ?',
          expectedAnswer: '5/10',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l3-q4`,
          prompt: '8/12 - 5/12 = ?',
          choices: [
            { id: 'a', text: '3/12' },
            { id: 'b', text: '3/0' },
            { id: 'c', text: '13/12' },
            { id: 'd', text: '3/24' },
          ],
          correctChoiceId: 'a',
        }),
        clickFraction({
          id: `${SUB}-l3-q5`,
          prompt: 'มี 5/6 กินไป 2/6 — ระบายส่วนที่เหลือ',
          totalParts: 6,
          expectedFilled: 3,
          style: 'circle',
        }),
        textInput({
          id: `${SUB}-l3-q6`,
          prompt: '11/12 - 8/12 = ?',
          expectedAnswer: '3/12',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l3-q7`,
          prompt: '6/7 - 1/7 = ?',
          expectedAnswer: '5/7',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l3-q8`,
          prompt: '10/11 - 3/11 = ?',
          choices: [
            { id: 'a', text: '7/11' },
            { id: 'b', text: '13/11' },
            { id: 'c', text: '7/0' },
            { id: 'd', text: '7/22' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l3-q9`,
          prompt: '4/5 - 2/5 = ?',
          expectedAnswer: '2/5',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l3-q10`,
          prompt: '9/10 - 7/10 = ?',
          expectedAnswer: '2/10',
          answerType: 'fraction',
        }),
      ],
    }),
    miniQuiz({
      id: `${SUB}-l3-s3`,
      title: 'Mini Quiz — 5 ข้อ',
      questions: [
        textInput({
          id: `${SUB}-l3-mq1`,
          prompt: '5/8 - 2/8 = ?',
          expectedAnswer: '3/8',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l3-mq2`,
          prompt: '7/10 - 3/10 = ?',
          expectedAnswer: '4/10',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l3-mq3`,
          prompt: '8/9 - 5/9 = ?',
          choices: [
            { id: 'a', text: '3/9' },
            { id: 'b', text: '13/9' },
            { id: 'c', text: '3/0' },
            { id: 'd', text: '3/18' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l3-mq4`,
          prompt: '11/12 - 5/12 = ?',
          expectedAnswer: '6/12',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l3-mq5`,
          prompt: '6/7 - 3/7 = ?',
          expectedAnswer: '3/7',
          answerType: 'fraction',
        }),
      ],
      passingScore: 0.7,
      starsOnPass: 5,
      starsOnPerfect: 10,
    }),
    reflection({
      id: `${SUB}-l3-s4`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        'ทำได้แล้ว 10 ข้อรวบยอด! (well done!)',
        '**Rule (กฎ)** เดิม: **denominator stays the same** ลบเฉพาะ **numerator**',
      ],
      nextUp: 'บทต่อไปจะเรียนการลบเศษส่วนจาก **1 whole (1 ทั้งอัน)** เช่น 1 - 2/5',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 4 — Subtracting from a Whole
// ---------------------------------------------------------------------------
const lesson4: Lesson = lesson({
  id: `${SUB}-l4`,
  subTopicId: SUB,
  order: 4,
  title: 'Subtracting from a Whole — ลบจาก 1 ทั้งอัน 🍰',
  description: 'เรียนวิธีลบเศษส่วนจาก 1 (เช่น 1 - 2/5 = 3/5)',
  estimatedMinutes: 30,
  learningObjectives: [
    'เข้าใจว่า 1 = a/a เมื่อ a เท่ากับ denominator ที่ต้องการ',
    'ลบเศษส่วนจาก 1 ได้',
  ],
  steps: [
    concept(`${SUB}-l4-s1`, '1 whole (1 ทั้งอัน) = a/a', [
      text(
        'ถ้า **pizza (พิซซ่า)** 1 ถาดเต็มถูกตัดเป็น 5 ชิ้น — **1 whole (1 ทั้งถาด)** ก็คือ 5/5 (5 ใน 5 ส่วน)',
      ),
      fractionBar(5, 5, '1 whole = 5/5'),
      callout(
        'tip',
        '**กฎใหม่ (new rule):** **1 whole (หนึ่งทั้งอัน)** = `a/a` เมื่อ a เป็นเลข **denominator** ใดๆ — เช่น 5/5, 6/6, 8/8 ทั้งหมดเท่ากับ 1',
      ),
    ]),
    concept(`${SUB}-l4-s2`, 'ทำไมต้องแปลง 1 เป็น a/a ก่อนลบ', [
      text(
        'ถ้าจะลบ `1 - 2/5` — เราต้อง **convert (เปลี่ยน)** 1 ให้อยู่ในรูปเศษส่วนที่มี **same denominator** ก่อน',
      ),
      text(
        '**denominator** ของ 2/5 = 5 → **convert (เปลี่ยน)** 1 เป็น 5/5 → ตอนนี้เรา **subtract (ลบ)** `5/5 - 2/5` ได้แล้ว',
      ),
      callout('info', '**Step 1:** **convert (เปลี่ยน)** 1 → a/a (ใช้ denominator ของเศษอีกตัว)\n\n**Step 2:** **subtract (ลบ)** ตามปกติ — denominator stays the same, subtract numerators'),
    ]),
    workedExample({
      id: `${SUB}-l4-s3`,
      title: 'ทำให้ดู — 1 - 2/5',
      problemStatement: '1 - 2/5 = ?',
      steps: [
        {
          narration: '**denominator** ของเศษอีกตัว = 5 → **convert (เปลี่ยน)** 1 เป็น 5/5',
          formula: '1 = 5/5',
          visual: fractionBar(5, 5, '1 whole = 5/5'),
        },
        {
          narration: 'ตอนนี้เรามี 5/5 - 2/5 — **same denominator** (ตัวส่วนเท่ากัน) แล้ว',
          formula: '5/5 - 2/5 = ?',
        },
        {
          narration: '**Subtract numerators (ลบตัวเศษ):** 5 - 2 = 3 → **answer** 3/5',
          formula: '5/5 - 2/5 = 3/5',
          visual: fractionBar(3, 5, 'left (เหลือ) 3/5'),
        },
      ],
    }),
    workedExample({
      id: `${SUB}-l4-s4`,
      title: 'อีกตัวอย่าง (another example) — 1 - 4/7',
      problemStatement: '1 - 4/7 = ?',
      steps: [
        { narration: '**denominator** = 7 → **convert (เปลี่ยน)** 1 = 7/7', formula: '1 = 7/7' },
        { narration: '**Subtract (ลบ):** 7 - 4 = 3 → **answer** 3/7', formula: '1 - 4/7 = 3/7' },
      ],
    }),
    guidedPractice({
      id: `${SUB}-l4-s5`,
      title: 'ลองทำเอง — 1 - 3/8',
      question: textInput({
        id: `${SUB}-l4-q1`,
        prompt: '1 - 3/8 = ? (พิมพ์เป็น a/b)',
        expectedAnswer: '5/8',
        answerType: 'fraction',
      }),
      hints: ['เปลี่ยน 1 เป็น 8/8 ก่อน', '8 - 3 = ?'],
      fullExplanation: '1 = 8/8 → 8/8 - 3/8 = 5/8',
    }),
    guidedPractice({
      id: `${SUB}-l4-s6`,
      title: '1 = a/a ตัวไหน?',
      question: mcqText({
        id: `${SUB}-l4-q2`,
        prompt: 'ถ้าจะลบ 1 - 4/9 ต้องเปลี่ยน 1 เป็นอะไร?',
        choices: [
          { id: 'a', text: '9/9' },
          { id: 'b', text: '4/4' },
          { id: 'c', text: '1/9' },
          { id: 'd', text: '9/4' },
        ],
        correctChoiceId: 'a',
      }),
      hints: ['ดู denominator ของเศษอีกตัว — เป็น 9'],
      fullExplanation: '1 = 9/9 เพราะ denominator ของ 4/9 = 9',
    }),
    independentPractice({
      id: `${SUB}-l4-s7`,
      title: 'ฝึก 5 ข้อ',
      questions: [
        textInput({
          id: `${SUB}-l4-q3`,
          prompt: '1 - 2/6 = ?',
          expectedAnswer: '4/6',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l4-q4`,
          prompt: '1 - 5/10 = ?',
          expectedAnswer: '5/10',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l4-q5`,
          prompt: '1 - 3/4 = ?',
          choices: [
            { id: 'a', text: '1/4' },
            { id: 'b', text: '3/4' },
            { id: 'c', text: '4/4' },
            { id: 'd', text: '1/3' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l4-q6`,
          prompt: '1 - 7/12 = ?',
          expectedAnswer: '5/12',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l4-q7`,
          prompt: '1 - 6/11 = ?',
          choices: [
            { id: 'a', text: '5/11' },
            { id: 'b', text: '6/11' },
            { id: 'c', text: '5/22' },
            { id: 'd', text: '11/5' },
          ],
          correctChoiceId: 'a',
        }),
      ],
    }),
    reflection({
      id: `${SUB}-l4-s8`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**1 whole (1 ทั้งอัน) = a/a** เช่น 5/5, 8/8, 12/12',
        'ก่อนลบจาก 1 — **convert (เปลี่ยน)** 1 เป็น a/a โดยใช้ **denominator** ของเศษอีกตัว',
        'แล้วลบตามกฎเดิม: **denominator stays the same**, **subtract numerators**',
      ],
      nextUp: 'บทต่อไปจะดูกรณีที่ผลลัพธ์ = **zero (ศูนย์)**',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 5 — When the Result is Zero
// ---------------------------------------------------------------------------
const lesson5: Lesson = lesson({
  id: `${SUB}-l5`,
  subTopicId: SUB,
  order: 5,
  title: 'When the Result is Zero — เมื่อผลลัพธ์เป็นศูนย์ 0️⃣',
  description: 'รู้จักกรณีพิเศษ — ลบหมดเหลือศูนย์',
  estimatedMinutes: 30,
  learningObjectives: [
    'เข้าใจว่า a/a - a/a = 0',
    'อ่าน 0/a เป็น 0 ได้',
  ],
  steps: [
    concept(`${SUB}-l5-s1`, 'กินหมดเหลือศูนย์ (eat all → zero)', [
      text(
        'ลองนึกภาพ — มี **pizza (พิซซ่า)** 4 ชิ้นจาก 4 ชิ้น (4/4 = 1 ทั้งถาด) แล้วกินไปหมด 4 ชิ้น (4/4) — **left (เหลือ)** กี่ชิ้น?',
      ),
      fractionBar(4, 4, 'before (ก่อนกิน): 4/4'),
      text('**Answer (คำตอบ)** คือ **zero (ศูนย์) = 0 ชิ้น** = 0/4 — ซึ่งเขียนสั้นๆ ว่า **0**'),
      fractionBar(0, 4, 'after (หลังกิน): 0/4 = 0'),
      callout(
        'tip',
        '**กฎใหม่ (new rule):** ถ้า **numerator = 0** → เศษส่วนนั้น = **zero (ศูนย์) = 0**\n\nเช่น 0/3 = 0, 0/8 = 0, 0/100 = 0',
      ),
    ]),
    concept(`${SUB}-l5-s2`, 'a/a - a/a = 0', [
      text(
        'ถ้าเศษส่วน 2 ตัวเหมือนกัน (same fraction) — เช่น 3/5 - 3/5 — ลบกันแล้วได้ **zero (ศูนย์) = 0** เพราะ "เอาออกหมดเหลือศูนย์"',
      ),
      callout(
        'info',
        'จำได้ไหม — 4/4 = **1 whole**, 7/7 = **1 whole** → ถ้าลบกัน 1 - 1 ก็เป็น **0 (zero)** ใช่มั้ย?',
      ),
    ]),
    workedExample({
      id: `${SUB}-l5-s3`,
      title: 'ทำให้ดู — 5/6 - 5/6',
      problemStatement: '5/6 - 5/6 = ?',
      steps: [
        { narration: '**denominator:** 6 = 6 → equal (เท่ากัน) ✓' },
        { narration: '**Subtract numerators (ลบตัวเศษ):** 5 - 5 = 0', formula: '5 - 5 = 0' },
        {
          narration: 'ดังนั้น **answer (คำตอบ)** = 0/6 → เขียนสั้นๆ = **zero (ศูนย์) = 0**',
          formula: '5/6 - 5/6 = 0',
          visual: fractionBar(0, 6, '0/6 = 0'),
        },
      ],
    }),
    guidedPractice({
      id: `${SUB}-l5-s4`,
      title: 'ลองทำเอง',
      question: mcqText({
        id: `${SUB}-l5-q1`,
        prompt: '7/9 - 7/9 = ?',
        choices: [
          { id: 'a', text: '0' },
          { id: 'b', text: '7/9' },
          { id: 'c', text: '14/9' },
          { id: 'd', text: '1' },
        ],
        correctChoiceId: 'a',
      }),
      hints: [
        'numerator: 7 - 7 = ?',
        'ถ้า numerator = 0 → คำตอบเป็น 0',
      ],
      fullExplanation: '7 - 7 = 0 → 0/9 = 0',
    }),
    guidedPractice({
      id: `${SUB}-l5-s5`,
      title: 'อีกข้อ',
      question: mcqText({
        id: `${SUB}-l5-q2`,
        prompt: '8/8 - 8/8 = ?',
        choices: [
          { id: 'a', text: '0' },
          { id: 'b', text: '8/8' },
          { id: 'c', text: '1' },
          { id: 'd', text: '16/8' },
        ],
        correctChoiceId: 'a',
      }),
      hints: ['8/8 = 1 และ 1 - 1 = ?', '8 - 8 = 0 → 0/8 = 0'],
      fullExplanation: '8/8 = 1 (ทั้งอัน) → 1 - 1 = 0',
    }),
    independentPractice({
      id: `${SUB}-l5-s6`,
      title: 'ฝึก 6 ข้อ',
      questions: [
        mcqText({
          id: `${SUB}-l5-q3`,
          prompt: '4/7 - 4/7 = ?',
          choices: [
            { id: 'a', text: '0' },
            { id: 'b', text: '4/7' },
            { id: 'c', text: '8/7' },
            { id: 'd', text: '1' },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l5-q4`,
          prompt: '0/5 = ?',
          choices: [
            { id: 'a', text: '0' },
            { id: 'b', text: '5' },
            { id: 'c', text: '1/5' },
            { id: 'd', text: '5/0' },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l5-q5`,
          prompt: '9/10 - 9/10 = ?',
          choices: [
            { id: 'a', text: '0' },
            { id: 'b', text: '9/10' },
            { id: 'c', text: '18/10' },
            { id: 'd', text: '0/10 (ผิดรูปแบบ)' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l5-q6`,
          prompt: '6/12 - 6/12 = ? (พิมพ์ 0 ถ้าผลลัพธ์ = 0)',
          expectedAnswer: 0,
          answerType: 'number',
        }),
        mcqText({
          id: `${SUB}-l5-q7`,
          prompt: '6/8 - 6/8 = ?',
          choices: [
            { id: 'a', text: '0' },
            { id: 'b', text: '6/8' },
            { id: 'c', text: '12/8' },
            { id: 'd', text: '0/0' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l5-q8`,
          prompt: '3/4 - 3/4 = ? (พิมพ์ 0)',
          expectedAnswer: 0,
          answerType: 'number',
        }),
      ],
    }),
    reflection({
      id: `${SUB}-l5-s7`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        'ถ้า **numerator = 0** → เศษส่วนเท่ากับ **zero (0)**',
        '**a/a - a/a = 0** (ลบเศษส่วนที่เหมือนกัน ได้ **zero**)',
        '0/5, 0/8, 0/100 ทั้งหมดเท่ากับ **zero (ศูนย์)**',
      ],
      nextUp: 'บทต่อไปจะลอง **word problem (โจทย์ปัญหา)** — โจทย์ลบในชีวิตจริง',
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
  description: 'แก้ word problem 1-2 ขั้นเกี่ยวกับการลบเศษส่วน',
  estimatedMinutes: 30,
  learningObjectives: [
    'อ่านโจทย์ปัญหา แล้วระบุได้ว่าตัวเลขใดคือ numerator และ denominator',
    'แก้ word problem การลบเศษส่วนตัวส่วนเท่ากันได้',
  ],
  steps: [
    concept(`${SUB}-l6-s1`, 'วิธีแก้ word problem 3 ขั้น', [
      text('**Word problem (โจทย์ปัญหา)** เรื่องลบใช้กฎ 3 ขั้นเดิมที่เราใช้ในตอนบวก:'),
      callout(
        'tip',
        '**1. Read (อ่าน)** — โจทย์ถามอะไร? "**left (เหลือ)**" หรือ "**take away (เอาออก)**"?\n\n**2. Identify (ระบุ)** — ตัวเลขในโจทย์คือ **numerator**/**denominator** อะไร\n\n**3. Compute (คำนวณ)** — **subtract numerators** (ลบตัวเศษ), **denominator stays the same**',
      ),
      callout(
        'info',
        '**Keywords (คำใบ้)** — โจทย์ลบมักใช้คำพวก "**left (เหลือ)**, **take away (เอาออก)**, **lost (หายไป)**, **break (หัก)**, **eat (กินไป)**" → แสดงว่าเป็น **subtraction (โจทย์ลบ)**',
      ),
    ]),
    workedExample({
      id: `${SUB}-l6-s2`,
      title: 'ทำให้ดู — โจทย์ chocolate 🍫',
      problemStatement:
        '**Chocolate (ช็อกโกแลต)** หักได้ 8 ช่อง พี่กินไป 3 ช่อง (3/8) **left (เหลือ)** กี่ช่องของแท่ง (bar)?',
      steps: [
        {
          narration: '**Step 1 (Read)** — โจทย์ถามว่า "left (เหลือ) กี่ช่องของแท่ง" → เป็น **subtraction (โจทย์ลบ)** (8/8 - 3/8)',
        },
        {
          narration: '**Step 2 (Identify)** — denominator = 8 / มีทั้งหมด 8/8 / กินไป 3/8',
          formula: '8/8 - 3/8 = ?',
        },
        {
          narration: '**Step 3 (Compute)** — 8 - 3 = 5 → **left** 5/8',
          formula: '8/8 - 3/8 = 5/8',
          visual: fractionBar(5, 8, 'left (เหลือ) 5/8'),
        },
        { narration: '**Answer (ตอบ):** เหลือ **5/8** ของแท่ง (bar)' },
      ],
    }),
    guidedPractice({
      id: `${SUB}-l6-s3`,
      title: 'ลองทำเอง — โจทย์ orange juice 🥤',
      question: textInput({
        id: `${SUB}-l6-q1`,
        prompt:
          '**Orange juice (น้ำส้ม)** 1 ขวด (bottle) แบ่งเป็น 5 **glasses (แก้ว)** เท่ากัน พี่ดื่มไป 3 แก้ว (3/5) — **left (เหลือ)** น้ำส้มกี่ส่วนของขวด?',
        expectedAnswer: '2/5',
        answerType: 'fraction',
      }),
      hints: ['1 ขวดเต็ม (1 whole bottle) = 5/5', '5/5 - 3/5 = ?'],
      fullExplanation: '5/5 - 3/5 = 2/5 → left (เหลือ) 2/5 ของขวด',
    }),
    guidedPractice({
      id: `${SUB}-l6-s4`,
      title: 'โจทย์ cake 🍰',
      question: textInput({
        id: `${SUB}-l6-q2`,
        prompt:
          'แม่ทำ **cake (เค้ก)** แบ่งเป็น 10 ชิ้น น้องกินไป 3/10 และพี่กินไป 2/10 — **left (เหลือ)** เค้กกี่ส่วน?',
        expectedAnswer: '5/10',
        answerType: 'fraction',
      }),
      hints: [
        'รวมที่กินไปก่อน (total eaten): 3/10 + 2/10 = ?',
        'จากนั้น 10/10 - (ที่กินไปทั้งหมด)',
      ],
      fullExplanation: '3/10 + 2/10 = 5/10 (eaten — กินไป) → 10/10 - 5/10 = 5/10 (left — เหลือ)',
    }),
    guidedPractice({
      id: `${SUB}-l6-s5`,
      title: 'โจทย์ cookies 🍪',
      question: mcqText({
        id: `${SUB}-l6-q3`,
        prompt:
          'มี **cookies (คุกกี้)** ในกล่อง (box) 12 ชิ้น น้องหยิบไป 7/12 — **left (เหลือ)** คุกกี้ในกล่องกี่ส่วน?',
        choices: [
          { id: 'a', text: '5/12' },
          { id: 'b', text: '7/12' },
          { id: 'c', text: '19/12' },
          { id: 'd', text: '5/0' },
        ],
        correctChoiceId: 'a',
      }),
      hints: ['ทั้งหมด (total) = 12/12', '12 - 7 = ?'],
      fullExplanation: '12/12 - 7/12 = 5/12 — left (เหลือ) 5/12 ของกล่อง',
    }),
    independentPractice({
      id: `${SUB}-l6-s6`,
      title: 'ฝึก word problem 5 ข้อ',
      questions: [
        textInput({
          id: `${SUB}-l6-q4`,
          prompt:
            'พิซซ่าตัดเป็น 8 ชิ้น พี่กิน 5/8 — เหลือพิซซ่ากี่ส่วนของถาด?',
          expectedAnswer: '3/8',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l6-q5`,
          prompt:
            'มีแอปเปิ้ลในตะกร้า 9 ลูก แม่หยิบไป 4 ลูก (4/9) — เหลือแอปเปิ้ลกี่ส่วนของตะกร้า?',
          expectedAnswer: '5/9',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l6-q6`,
          prompt:
            'เค้กแบ่งเป็น 6 ชิ้น น้องกิน 2/6 พี่กิน 1/6 — เหลือเค้กกี่ส่วน?',
          choices: [
            { id: 'a', text: '3/6' },
            { id: 'b', text: '3/12' },
            { id: 'c', text: '5/6' },
            { id: 'd', text: '6/6' },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l6-q7`,
          prompt: 'น้ำผลไม้ 1 เหยือกแบ่งได้ 10 แก้ว ดื่มไปแล้ว 7 แก้ว (7/10) — เหลือกี่ส่วน?',
          expectedAnswer: '3/10',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l6-q8`,
          prompt:
            'เชือก 1 เส้นแบ่งเป็น 7 ส่วนเท่ากัน ตัดออกไป 4 ส่วน (4/7) — เหลือกี่ส่วนของเชือก?',
          expectedAnswer: '3/7',
          answerType: 'fraction',
        }),
      ],
    }),
    reflection({
      id: `${SUB}-l6-s7`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        '**Subtraction (โจทย์ลบ)** — มองหาคำว่า "**left (เหลือ)**, **take away (เอาออก)**, **eat (กินไป)**, **break (หัก)**"',
        'ทั้งหมด (total) = **a/a** เช่น 8 ชิ้นทั้งหมด = 8/8',
        'แล้วลบตามกฎเดิม: **denominator stays the same**, **subtract numerators**',
      ],
      nextUp: 'บทถัดไปคือ **chapter assessment (ทดสอบประจำหัวข้อ)** — เก็บดาว (stars) ให้เต็ม!',
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
  isAssessment: true,
  learningObjectives: [
    'แสดงว่าเข้าใจการลบเศษส่วนตัวส่วนเท่ากันได้ครบถ้วน',
  ],
  steps: [
    concept(`${SUB}-l7-s1`, 'พร้อมแล้วใช่ไหม? (Ready?)', [
      text('นี่คือ **chapter assessment (บททดสอบประจำหัวข้อ)** — ทบทวน (review) ทุกอย่างที่เราเรียนกันมา 6 บทที่แล้ว'),
      callout(
        'info',
        '**Pass (ผ่าน) 70%** = ได้ดาว (stars) 5 ⭐\n\n**Perfect (เต็ม) 100%** = ได้ดาว 10 ⭐ + **badge** "Fraction Subtractor"',
      ),
    ]),
    miniQuiz({
      id: `${SUB}-l7-s2`,
      title: 'ทดสอบ 10 ข้อ',
      questions: [
        textInput({
          id: `${SUB}-l7-q1`,
          prompt: '6/8 - 2/8 = ?',
          expectedAnswer: '4/8',
          answerType: 'fraction',
        }),
        mcqVisual({
          id: `${SUB}-l7-q2`,
          prompt: '7/10 - 3/10 = ? — เลือกรูปที่ถูก',
          choices: [
            { id: 'a', visual: fractionBar(4, 10, '4/10') },
            { id: 'b', visual: fractionBar(10, 10, '10/10') },
            { id: 'c', visual: fractionBar(3, 10, '3/10') },
            { id: 'd', visual: fractionBar(7, 10, '7/10') },
          ],
          correctChoiceId: 'a',
        }),
        textInput({
          id: `${SUB}-l7-q3`,
          prompt: '11/12 - 4/12 = ?',
          expectedAnswer: '7/12',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l7-q4`,
          prompt: '1 - 3/7 = ?',
          choices: [
            { id: 'a', text: '4/7' },
            { id: 'b', text: '3/7' },
            { id: 'c', text: '7/4' },
            { id: 'd', text: '1/4' },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l7-q5`,
          prompt: '5/6 - 5/6 = ?',
          choices: [
            { id: 'a', text: '0' },
            { id: 'b', text: '5/6' },
            { id: 'c', text: '10/6' },
            { id: 'd', text: '1' },
          ],
          correctChoiceId: 'a',
        }),
        clickFraction({
          id: `${SUB}-l7-q6`,
          prompt: 'มี 6/8 กินไป 1/8 — ระบายส่วนที่เหลือ',
          totalParts: 8,
          expectedFilled: 5,
          style: 'circle',
        }),
        textInput({
          id: `${SUB}-l7-q7`,
          prompt: '9/11 - 5/11 = ?',
          expectedAnswer: '4/11',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l7-q8`,
          prompt: '**Cake (เค้ก)** ตัด 9 ชิ้น พี่กิน 4/9 น้องกิน 3/9 — **left (เหลือ)** เค้กกี่ส่วน?',
          expectedAnswer: '2/9',
          answerType: 'fraction',
        }),
        textInput({
          id: `${SUB}-l7-q9`,
          prompt: '1 - 5/12 = ?',
          expectedAnswer: '7/12',
          answerType: 'fraction',
        }),
        mcqText({
          id: `${SUB}-l7-q10`,
          prompt: 'มี **orange juice (น้ำส้ม)** 1 ขวด (bottle) แบ่งได้ 5 **glasses (แก้ว)** ดื่มไป 4/5 — **left (เหลือ)** น้ำส้มกี่ส่วน?',
          choices: [
            { id: 'a', text: '1/5' },
            { id: 'b', text: '4/5' },
            { id: 'c', text: '5/5' },
            { id: 'd', text: '1/4' },
          ],
          correctChoiceId: 'a',
        }),
      ],
      passingScore: 0.7,
      starsOnPass: 5,
      starsOnPerfect: 10,
      badgeOnPerfect: 'Fraction Subtractor',
    }),
    reflection({
      id: `${SUB}-l7-s3`,
      title: 'เก่งมาก! (Great job!)',
      keyTakeaways: [
        'จบหัวข้อ **"Subtracting Fractions — Same Denominator"** (ลบเศษส่วนตัวส่วนเท่ากัน) แล้ว!',
        'เราใช้ **rule** เดียวกับการบวก (adding): **denominator stays the same**, ทำเฉพาะ **numerator**',
        'รู้จัก **subtracting from 1 whole** (ลบจาก 1) และกรณีผลลัพธ์เป็น **zero (0)**',
      ],
      nextUp: 'หัวข้อถัดไปจะเรียนเรื่อง **equivalent fractions (เศษส่วนที่เท่ากัน)**',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Export — all 7 lessons in order
// ---------------------------------------------------------------------------
export const subtractingFractionsLessons: Lesson[] = [
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
  lesson6,
  lesson7,
];
