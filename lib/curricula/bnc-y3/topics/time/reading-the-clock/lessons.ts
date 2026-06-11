// lib/curricula/bnc-y3/topics/time/reading-the-clock/lessons.ts
//
// 5 lessons that progressively teach reading an analog clock for BNC Y3:
//   1. Hours & half past
//   2. Quarter past & quarter to
//   3. Minutes past the hour (5-minute increments)
//   4. Minutes to the next hour ("10 minutes to 3")
//   5. Mixed-practice mini-quiz

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
  analogClock,
  callout,
  text,
} from '@/lib/curricula/helpers/visual-builders';
import {
  mcqText,
  mcqVisual,
  setClock,
  textInput,
} from '@/lib/curricula/helpers/question-builders';

const SUB = 'bnc-y3-time-reading';

// ---------------------------------------------------------------------------
// Lesson 1 — Hours & Half Past
// ---------------------------------------------------------------------------
const lesson1: Lesson = lesson({
  id: `${SUB}-l1`,
  subTopicId: SUB,
  order: 1,
  title: "O'clock & Half Past — เวลาเต็มชั่วโมงกับครึ่งชั่วโมง ⏰",
  description: 'รู้จักเข็มสั้น–เข็มยาว และอ่านเวลาเต็มชั่วโมง / ครึ่งชั่วโมง',
  estimatedMinutes: 25,
  learningObjectives: [
    'แยกเข็มสั้น (ชั่วโมง) และเข็มยาว (นาที) ได้',
    "อ่าน o'clock (เต็มชั่วโมง) ได้",
    'อ่าน half past (ครึ่งชั่วโมง) ได้',
  ],
  steps: [
    concept(`${SUB}-l1-s1`, 'เข็มสั้น และ เข็มยาว', [
      text('นาฬิกาเข็มมี **2 เข็มหลัก** ที่เราต้องรู้จัก:'),
      text(
        '**เข็มสั้น (hour hand)** — บอก **ชั่วโมง** ชี้ไปที่ตัวเลข 1 ถึง 12',
      ),
      text(
        '**เข็มยาว (minute hand)** — บอก **นาที** เคลื่อนเร็วกว่าเข็มสั้น 60 นาทีก็ครบ 1 รอบ',
      ),
      analogClock(3, 0),
      callout('tip', 'จำง่ายๆ: เข็ม**สั้น = ชั่วโมง** เข็ม**ยาว = นาที**'),
    ]),

    concept(`${SUB}-l1-s2`, "อ่านเวลาเต็มชั่วโมง (o'clock)", [
      text(
        'เมื่อเข็มยาวชี้ตรง **12** เป๊ะ แปลว่าเป็นเวลา **เต็มชั่วโมง** — ภาษาอังกฤษเรียก **o\'clock**',
      ),
      text('ดูเข็มสั้นว่าชี้เลขอะไร เลขนั้นคือชั่วโมง'),
      analogClock(7, 0),
      text('เข็มสั้นชี้ **7** เข็มยาวชี้ **12** → อ่านว่า **"7 o\'clock"** หรือ "7 โมง"'),
    ]),

    workedExample({
      id: `${SUB}-l1-s3`,
      title: 'ลองอ่านดู — Half Past',
      problemStatement: 'เวลานี้คืออะไร?',
      problemVisual: analogClock(4, 30),
      steps: [
        {
          narration:
            'เข็มยาวชี้ที่ **6** — แปลว่าเดินมาแล้ว **ครึ่งทาง** (30 นาทีจากชั่วโมงที่แล้ว) ภาษาอังกฤษเรียก **half past**',
        },
        {
          narration:
            'เข็มสั้นอยู่ระหว่าง **4 กับ 5** — เพราะ "ครึ่งทาง" จากชั่วโมง 4 ไปชั่วโมง 5 เราจึงบอกเป็นชั่วโมง **4**',
        },
        {
          narration:
            'อ่านว่า **"half past 4"** หรือ "4 โมงครึ่ง" (= 4:30)',
          formula: '4:30 = half past 4',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l1-s4`,
      title: 'อ่านเข็มดู',
      question: mcqText({
        id: `${SUB}-l1-q1`,
        prompt: 'เวลานี้คืออะไร?',
        promptVisual: analogClock(8, 0),
        choices: [
          { id: 'a', text: "8 o'clock" },
          { id: 'b', text: 'half past 8' },
          { id: 'c', text: "12 o'clock" },
          { id: 'd', text: 'half past 12' },
        ],
        correctChoiceId: 'a',
      }),
      hints: [
        'เข็มยาวชี้ตรง 12 → เวลาเต็มชั่วโมง',
        'เข็มสั้นชี้เลขอะไร เลขนั้นคือชั่วโมง',
      ],
      fullExplanation: "เข็มยาวอยู่ที่ 12 = o'clock, เข็มสั้นอยู่ที่ 8 → \"8 o'clock\"",
    }),

    guidedPractice({
      id: `${SUB}-l1-s5`,
      title: 'Half past ไหน?',
      question: mcqText({
        id: `${SUB}-l1-q2`,
        prompt: 'เวลานี้คืออะไร?',
        promptVisual: analogClock(2, 30),
        choices: [
          { id: 'a', text: 'half past 2' },
          { id: 'b', text: 'half past 3' },
          { id: 'c', text: "2 o'clock" },
          { id: 'd', text: "3 o'clock" },
        ],
        correctChoiceId: 'a',
      }),
      hints: [
        'เข็มยาวอยู่ที่ 6 → half past',
        'เข็มสั้นอยู่ระหว่าง 2 กับ 3 — แต่ยังไม่ถึง 3 ดังนั้นเป็น half past 2',
      ],
      fullExplanation:
        'เข็มยาวที่ 6 = half past เข็มสั้นเพิ่งผ่าน 2 ไป (ยังไม่ถึง 3) จึงเป็น "half past 2"',
    }),

    independentPractice({
      id: `${SUB}-l1-s6`,
      title: 'ฝึกเอง 3 ข้อ',
      questions: [
        mcqVisual({
          id: `${SUB}-l1-q3`,
          prompt: 'นาฬิกาไหนแสดงเวลา 6 o\'clock?',
          choices: [
            { id: 'a', visual: analogClock(6, 0) },
            { id: 'b', visual: analogClock(12, 30) },
            { id: 'c', visual: analogClock(6, 30) },
            { id: 'd', visual: analogClock(7, 0) },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l1-q4`,
          prompt: 'เวลานี้คืออะไร?',
          promptVisual: analogClock(11, 30),
          choices: [
            { id: 'a', text: 'half past 11' },
            { id: 'b', text: 'half past 12' },
            { id: 'c', text: "11 o'clock" },
            { id: 'd', text: 'half past 6' },
          ],
          correctChoiceId: 'a',
        }),
        setClock({
          id: `${SUB}-l1-q5`,
          prompt: 'ลากเข็มให้แสดงเวลา 9 o\'clock',
          expectedHours: 9,
          expectedMinutes: 0,
          tolerance: 3,
        }),
      ],
    }),

    reflection({
      id: `${SUB}-l1-s7`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        'เข็ม**สั้น**บอกชั่วโมง เข็ม**ยาว**บอกนาที',
        "เข็มยาวที่ 12 = **o'clock** (เต็มชั่วโมง)",
        'เข็มยาวที่ 6 = **half past** (ครึ่งชั่วโมง)',
      ],
      nextUp: 'บทต่อไป: quarter past และ quarter to (15 นาที)',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 2 — Quarter Past & Quarter To
// ---------------------------------------------------------------------------
const lesson2: Lesson = lesson({
  id: `${SUB}-l2`,
  subTopicId: SUB,
  order: 2,
  title: 'Quarter Past & Quarter To — สิบห้านาที 🕐',
  description: 'อ่านเวลา quarter past (xx:15) และ quarter to (xx:45)',
  estimatedMinutes: 25,
  learningObjectives: [
    'อ่าน quarter past ได้ (เข็มยาวที่ 3 = 15 นาที)',
    'อ่าน quarter to ได้ (เข็มยาวที่ 9 = อีก 15 นาทีถึงชั่วโมงถัดไป)',
    'แยกแยะ past กับ to ได้',
  ],
  steps: [
    concept(`${SUB}-l2-s1`, 'แบ่งหน้าปัดเป็น 4 ส่วน', [
      text(
        'นาฬิกามี 60 นาทีรอบ 1 รอบ — แบ่งเป็น **4 ส่วนเท่าๆ กัน** ส่วนละ **15 นาที**',
      ),
      text(
        'แต่ละส่วน 15 นาทีนี้เรียกว่า **a quarter (หนึ่งในสี่)** เหมือนเศษส่วน 1/4',
      ),
      callout(
        'info',
        '60 ÷ 4 = 15 → **1 quarter = 15 นาที**',
      ),
    ]),

    concept(`${SUB}-l2-s2`, 'Quarter Past = ผ่านมา 15 นาที', [
      text(
        'เมื่อเข็มยาวชี้ที่ **3** แปลว่าเดินมาแล้ว 1/4 รอบ = **15 นาที**',
      ),
      text('เราเรียกว่า **quarter past** (ผ่านชั่วโมงนั้นมา 15 นาที)'),
      analogClock(5, 15),
      text(
        'เช่นภาพนี้ — เข็มยาวที่ 3, เข็มสั้นเพิ่งผ่าน 5 → **"quarter past 5"** = 5:15',
      ),
    ]),

    workedExample({
      id: `${SUB}-l2-s3`,
      title: 'Quarter To — อีก 15 นาทีจะถึงชั่วโมงถัดไป',
      problemStatement: 'เวลานี้คืออะไร?',
      problemVisual: analogClock(7, 45),
      steps: [
        {
          narration:
            'เข็มยาวชี้ที่ **9** — แปลว่าเดินมาแล้ว **3 ใน 4 ส่วน** = 45 นาที จากชั่วโมงก่อนหน้า',
        },
        {
          narration:
            'อีกวิธีคิด: เหลืออีก **1 quarter (15 นาที)** จะครบ 1 ชั่วโมง — เราเรียกว่า **"quarter to"**',
        },
        {
          narration:
            'เข็มสั้นเกือบจะถึง 8 แล้ว แต่ยังไม่ถึง → quarter to **8** (อีก 15 นาทีจะ 8 โมง)',
          formula: '7:45 = quarter to 8',
        },
        {
          narration:
            '⚠️ ระวัง! "quarter to 8" **ไม่ใช่** "quarter to 7" — ใช้ชั่วโมงที่กำลัง**จะถึง** ไม่ใช่ชั่วโมงที่ผ่านมา',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l2-s4`,
      title: 'Past หรือ To?',
      question: mcqText({
        id: `${SUB}-l2-q1`,
        prompt: 'เวลานี้คืออะไร?',
        promptVisual: analogClock(2, 15),
        choices: [
          { id: 'a', text: 'quarter past 2' },
          { id: 'b', text: 'quarter to 2' },
          { id: 'c', text: 'quarter past 3' },
          { id: 'd', text: 'half past 2' },
        ],
        correctChoiceId: 'a',
      }),
      hints: [
        'เข็มยาวอยู่ที่ 3 → ผ่านมา 15 นาที = quarter past',
        'เข็มสั้นเพิ่งผ่าน 2 → quarter past 2',
      ],
      fullExplanation:
        'เข็มยาวที่ 3 = past เข็มสั้นผ่าน 2 มาแล้ว → "quarter past 2" (2:15)',
    }),

    guidedPractice({
      id: `${SUB}-l2-s5`,
      title: 'Quarter to ไหน?',
      question: mcqText({
        id: `${SUB}-l2-q2`,
        prompt: 'เวลานี้คืออะไร?',
        promptVisual: analogClock(10, 45),
        choices: [
          { id: 'a', text: 'quarter to 11' },
          { id: 'b', text: 'quarter to 10' },
          { id: 'c', text: 'quarter past 10' },
          { id: 'd', text: 'quarter past 11' },
        ],
        correctChoiceId: 'a',
      }),
      hints: [
        'เข็มยาวอยู่ที่ 9 → "quarter to" (เหลืออีก 15 นาที)',
        'เข็มสั้นเกือบจะถึง 11 → quarter to **11**',
      ],
      fullExplanation:
        'เข็มยาวที่ 9 = quarter to อีก 15 นาทีจะ 11 โมง → "quarter to 11" (10:45)',
    }),

    independentPractice({
      id: `${SUB}-l2-s6`,
      title: 'ฝึกเอง 4 ข้อ',
      questions: [
        mcqText({
          id: `${SUB}-l2-q3`,
          prompt: 'เวลานี้คืออะไร?',
          promptVisual: analogClock(6, 15),
          choices: [
            { id: 'a', text: 'quarter past 6' },
            { id: 'b', text: 'quarter to 6' },
            { id: 'c', text: 'half past 6' },
            { id: 'd', text: 'quarter past 3' },
          ],
          correctChoiceId: 'a',
        }),
        mcqVisual({
          id: `${SUB}-l2-q4`,
          prompt: 'นาฬิกาไหนแสดง quarter to 5?',
          choices: [
            { id: 'a', visual: analogClock(4, 45) },
            { id: 'b', visual: analogClock(5, 45) },
            { id: 'c', visual: analogClock(5, 15) },
            { id: 'd', visual: analogClock(4, 15) },
          ],
          correctChoiceId: 'a',
        }),
        setClock({
          id: `${SUB}-l2-q5`,
          prompt: 'ลากเข็มให้แสดงเวลา quarter past 9 (9:15)',
          expectedHours: 9,
          expectedMinutes: 15,
        }),
        setClock({
          id: `${SUB}-l2-q6`,
          prompt: 'ลากเข็มให้แสดงเวลา quarter to 4 (3:45)',
          expectedHours: 3,
          expectedMinutes: 45,
        }),
      ],
    }),

    reflection({
      id: `${SUB}-l2-s7`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        'เข็มยาวที่ **3** = **quarter past** (15 นาทีผ่านมา)',
        'เข็มยาวที่ **9** = **quarter to** (เหลืออีก 15 นาที)',
        '**quarter to** ใช้ชั่วโมงที่กำลังจะถึง ไม่ใช่ที่ผ่านมา',
      ],
      nextUp: 'บทต่อไป: นาทีอื่นๆ — 5, 10, 20, 25 minutes past',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 3 — Minutes Past (5-minute steps)
// ---------------------------------------------------------------------------
const lesson3: Lesson = lesson({
  id: `${SUB}-l3`,
  subTopicId: SUB,
  order: 3,
  title: 'Minutes Past — 5, 10, 20, 25 นาทีผ่านไป ⏱',
  description: 'อ่านนาทีจากตำแหน่งของเข็มยาวทีละ 5 นาที',
  estimatedMinutes: 30,
  learningObjectives: [
    'นับนาทีจากเข็มยาวทีละ 5 ได้',
    'อ่านเวลาแบบ "X minutes past Y"',
  ],
  steps: [
    concept(`${SUB}-l3-s1`, 'นับทีละ 5 รอบหน้าปัด', [
      text(
        'ตัวเลข 1-12 บนหน้าปัด **ไม่ได้บอกนาที** — มันบอก **ชั่วโมง** สำหรับเข็มสั้น',
      ),
      text(
        'แต่ละช่องระหว่างตัวเลข = **5 นาที** สำหรับเข็มยาว ดังนั้น:',
      ),
      text(
        '- เข็มยาวที่ **1** = 5 นาที\n- เข็มยาวที่ **2** = 10 นาที\n- เข็มยาวที่ **3** = 15 นาที (= quarter past)\n- เข็มยาวที่ **4** = 20 นาที\n- เข็มยาวที่ **5** = 25 นาที\n- เข็มยาวที่ **6** = 30 นาที (= half past)',
      ),
      callout(
        'tip',
        'นับ 5, 10, 15, 20, 25, 30 ไปเรื่อยๆ — เลขที่เข็มยาวชี้ × 5 = นาที',
      ),
    ]),

    workedExample({
      id: `${SUB}-l3-s2`,
      title: 'ทำให้ดู — 20 minutes past 6',
      problemStatement: 'เวลานี้คืออะไร?',
      problemVisual: analogClock(6, 20),
      steps: [
        {
          narration:
            'เข็มยาวชี้ที่ **4** — นับ 5, 10, 15, 20 → **20 นาที** ผ่านชั่วโมงนั้นไปแล้ว',
        },
        {
          narration:
            'เข็มสั้นอยู่หลัง 6 เล็กน้อย → ชั่วโมง = 6',
        },
        {
          narration: 'อ่านว่า **"20 minutes past 6"** = 6:20',
          formula: '6:20 = 20 minutes past 6',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l3-s3`,
      title: 'นับนาทีดู',
      question: mcqText({
        id: `${SUB}-l3-q1`,
        prompt: 'เวลานี้คืออะไร?',
        promptVisual: analogClock(3, 10),
        choices: [
          { id: 'a', text: '10 minutes past 3' },
          { id: 'b', text: '2 minutes past 3' },
          { id: 'c', text: '10 minutes past 2' },
          { id: 'd', text: 'quarter past 3' },
        ],
        correctChoiceId: 'a',
      }),
      hints: [
        'เข็มยาวอยู่ที่ 2 → นับ 5, 10 → 10 นาที',
        'เข็มสั้นเพิ่งผ่าน 3 → ชั่วโมง 3',
      ],
      fullExplanation: 'เข็มยาวที่ 2 = 10 นาที, ชั่วโมง 3 → "10 minutes past 3"',
    }),

    guidedPractice({
      id: `${SUB}-l3-s4`,
      title: '25 past',
      question: textInput({
        id: `${SUB}-l3-q2`,
        prompt: 'เข็มยาวชี้ที่เลข 5 = กี่นาทีผ่านชั่วโมง?',
        expectedAnswer: 25,
        answerType: 'number',
        unit: 'นาที',
        promptVisual: analogClock(8, 25),
      }),
      hints: ['นับทีละ 5: 5, 10, 15, 20, 25', '5 × 5 = ?'],
      fullExplanation: '5 × 5 = 25 → เข็มยาวที่ 5 = 25 นาทีผ่านชั่วโมง',
    }),

    independentPractice({
      id: `${SUB}-l3-s5`,
      title: 'ฝึกเอง 4 ข้อ',
      questions: [
        mcqText({
          id: `${SUB}-l3-q3`,
          prompt: 'เวลานี้คืออะไร?',
          promptVisual: analogClock(7, 25),
          choices: [
            { id: 'a', text: '25 minutes past 7' },
            { id: 'b', text: '5 minutes past 7' },
            { id: 'c', text: '25 minutes past 5' },
            { id: 'd', text: '7 minutes past 25' },
          ],
          correctChoiceId: 'a',
        }),
        mcqVisual({
          id: `${SUB}-l3-q4`,
          prompt: 'นาฬิกาไหนแสดง 20 minutes past 9?',
          choices: [
            { id: 'a', visual: analogClock(9, 20) },
            { id: 'b', visual: analogClock(9, 40) },
            { id: 'c', visual: analogClock(4, 45) },
            { id: 'd', visual: analogClock(9, 10) },
          ],
          correctChoiceId: 'a',
        }),
        setClock({
          id: `${SUB}-l3-q5`,
          prompt: 'ลากเข็มให้แสดง 10 minutes past 5 (5:10)',
          expectedHours: 5,
          expectedMinutes: 10,
        }),
        setClock({
          id: `${SUB}-l3-q6`,
          prompt: 'ลากเข็มให้แสดง 25 minutes past 2 (2:25)',
          expectedHours: 2,
          expectedMinutes: 25,
        }),
      ],
    }),

    reflection({
      id: `${SUB}-l3-s6`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        'แต่ละช่อง = 5 นาที — นับทีละ 5 รอบหน้าปัด',
        'เลขที่เข็มยาวชี้ **× 5** = นาที',
        'รูปแบบ: "X minutes past Y"',
      ],
      nextUp: 'บทต่อไป: ครึ่งหลังของหน้าปัด — minutes **to** the next hour',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 4 — Minutes To (the lesson the user asked for: "10 minutes to 3")
// ---------------------------------------------------------------------------
const lesson4: Lesson = lesson({
  id: `${SUB}-l4`,
  subTopicId: SUB,
  order: 4,
  title: 'Minutes To — "10 minutes to 3" และเพื่อนๆ 🕥',
  description:
    'ครึ่งหลังของหน้าปัด — นับนาทีที่เหลือก่อนถึงชั่วโมงถัดไป',
  estimatedMinutes: 30,
  learningObjectives: [
    'เข้าใจว่าเมื่อไรใช้ "past" และเมื่อไรใช้ "to"',
    'นับนาทีที่เหลือก่อนถึงชั่วโมงถัดไป',
    'อ่านเวลาแบบ "X minutes to Y" ได้',
  ],
  steps: [
    concept(`${SUB}-l4-s1`, 'สองครึ่งของหน้าปัด', [
      text(
        'หน้าปัดนาฬิกาแบ่งเป็น **2 ครึ่ง** ที่ใช้คนละแบบ:',
      ),
      text(
        '🟢 **ครึ่งขวา** (เข็มยาวอยู่เลข 1-6) → ใช้ **"past"** (ผ่านมาแล้ว)\n🟡 **ครึ่งซ้าย** (เข็มยาวอยู่เลข 7-11) → ใช้ **"to"** (อีกกี่นาทีจะถึง)',
      ),
      callout(
        'tip',
        'เกินครึ่งทาง (เลย 6 ไปแล้ว) → ใกล้ชั่วโมงใหม่กว่า เลยพูดถึง**ชั่วโมงที่จะถึง**',
      ),
    ]),

    concept(`${SUB}-l4-s2`, 'นับนาทีที่เหลือถอยหลัง', [
      text(
        'ตอนใช้ "to" เราต้องนับ **นาทีที่เหลือ** ก่อนจะถึงชั่วโมงถัดไป — นับ**ถอยหลัง** จาก 12:',
      ),
      text(
        '- เข็มยาวที่ **11** = 5 นาทีก่อนถึงชั่วโมงถัดไป → **5 minutes to**\n- เข็มยาวที่ **10** = 10 นาทีก่อน → **10 minutes to**\n- เข็มยาวที่ **9** = 15 นาทีก่อน → **quarter to**\n- เข็มยาวที่ **8** = 20 นาทีก่อน → **20 minutes to**\n- เข็มยาวที่ **7** = 25 นาทีก่อน → **25 minutes to**',
      ),
      callout(
        'info',
        'อีกวิธีคิด: **60 − นาทีในตัวเลขดิจิทัล** = นาทีก่อนถึงชั่วโมงถัดไป\nเช่น 2:50 → 60 − 50 = 10 → "10 minutes to 3"',
      ),
    ]),

    workedExample({
      id: `${SUB}-l4-s3`,
      title: 'ทำให้ดู — 10 minutes to 3',
      problemStatement: 'เวลานี้คืออะไร?',
      problemVisual: analogClock(2, 50),
      steps: [
        {
          narration:
            'เข็มยาวชี้ที่ **10** — เกินครึ่งทางมาแล้ว (เลย 6) เราจึงใช้ **"to"**',
        },
        {
          narration:
            'นับถอยหลังจาก 12: 12 → 11 (5 นาที) → 10 (10 นาที) → เหลืออีก **10 นาที** ก่อนถึงชั่วโมงใหม่',
        },
        {
          narration:
            'เข็มสั้นเกือบจะถึง **3** แล้ว แต่ยังไม่ถึง → ใช้ชั่วโมงที่กำลังจะถึง = **3**',
        },
        {
          narration: 'อ่านว่า **"10 minutes to 3"** = 2:50',
          formula: '2:50 = 10 minutes to 3',
        },
        {
          narration:
            '⚠️ ระวัง! ไม่ใช่ "10 minutes to 2" — ใช้ชั่วโมง **3** เพราะ 3 คือชั่วโมงที่กำลังจะถึง',
        },
      ],
    }),

    guidedPractice({
      id: `${SUB}-l4-s4`,
      title: 'อ่านแบบ "to"',
      question: mcqText({
        id: `${SUB}-l4-q1`,
        prompt: 'เวลานี้คืออะไร?',
        promptVisual: analogClock(4, 55),
        choices: [
          { id: 'a', text: '5 minutes to 5' },
          { id: 'b', text: '5 minutes to 4' },
          { id: 'c', text: '55 minutes past 4' },
          { id: 'd', text: '5 minutes past 5' },
        ],
        correctChoiceId: 'a',
      }),
      hints: [
        'เข็มยาวที่ 11 = 5 นาทีก่อนถึงชั่วโมงใหม่',
        'เข็มสั้นเกือบถึง 5 → ใช้ 5 (ชั่วโมงที่กำลังจะถึง)',
      ],
      fullExplanation:
        'เข็มยาวที่ 11 = 5 minutes to, เข็มสั้นใกล้ 5 → "5 minutes to 5" (4:55)',
    }),

    guidedPractice({
      id: `${SUB}-l4-s5`,
      title: '20 minutes to ไหน?',
      question: mcqText({
        id: `${SUB}-l4-q2`,
        prompt: 'เวลานี้คืออะไร?',
        promptVisual: analogClock(7, 40),
        choices: [
          { id: 'a', text: '20 minutes to 8' },
          { id: 'b', text: '20 minutes to 7' },
          { id: 'c', text: '40 minutes to 8' },
          { id: 'd', text: '20 minutes past 7' },
        ],
        correctChoiceId: 'a',
      }),
      hints: [
        'เข็มยาวที่ 8 → นับถอยหลัง 12, 11, 10, 9, 8 = 20 นาที',
        'เข็มสั้นใกล้ 8 → ใช้ 8',
      ],
      fullExplanation:
        'เข็มยาวที่ 8 = 20 minutes to, เข็มสั้นใกล้ 8 → "20 minutes to 8" (7:40)',
    }),

    guidedPractice({
      id: `${SUB}-l4-s6`,
      title: 'คำนวณจากดิจิทัล',
      question: textInput({
        id: `${SUB}-l4-q3`,
        prompt:
          'เวลา 6:50 — อีกกี่นาทีจะถึง 7 โมง? (พิมพ์เฉพาะตัวเลข)',
        expectedAnswer: 10,
        answerType: 'number',
        unit: 'นาที',
      }),
      hints: ['60 − 50 = ?', 'จาก 50 ถึง 60 นับเท่าไร'],
      fullExplanation:
        '60 − 50 = 10 → อีก 10 นาทีจะถึง 7 โมง = "10 minutes to 7"',
    }),

    independentPractice({
      id: `${SUB}-l4-s7`,
      title: 'ฝึกเอง 5 ข้อ',
      questions: [
        mcqText({
          id: `${SUB}-l4-q4`,
          prompt: 'เวลานี้คืออะไร?',
          promptVisual: analogClock(2, 50),
          choices: [
            { id: 'a', text: '10 minutes to 3' },
            { id: 'b', text: '10 minutes to 2' },
            { id: 'c', text: '10 minutes past 2' },
            { id: 'd', text: '50 minutes to 3' },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l4-q5`,
          prompt: 'เวลานี้คืออะไร?',
          promptVisual: analogClock(11, 35),
          choices: [
            { id: 'a', text: '25 minutes to 12' },
            { id: 'b', text: '25 minutes past 11' },
            { id: 'c', text: '5 minutes to 12' },
            { id: 'd', text: '35 minutes to 12' },
          ],
          correctChoiceId: 'a',
        }),
        mcqVisual({
          id: `${SUB}-l4-q6`,
          prompt: 'นาฬิกาไหนแสดง 10 minutes to 6?',
          choices: [
            { id: 'a', visual: analogClock(5, 50) },
            { id: 'b', visual: analogClock(6, 10) },
            { id: 'c', visual: analogClock(5, 10) },
            { id: 'd', visual: analogClock(6, 50) },
          ],
          correctChoiceId: 'a',
        }),
        setClock({
          id: `${SUB}-l4-q7`,
          prompt: 'ลากเข็มให้แสดง 10 minutes to 3 (2:50)',
          expectedHours: 2,
          expectedMinutes: 50,
        }),
        setClock({
          id: `${SUB}-l4-q8`,
          prompt: 'ลากเข็มให้แสดง 25 minutes to 9 (8:35)',
          expectedHours: 8,
          expectedMinutes: 35,
        }),
      ],
    }),

    reflection({
      id: `${SUB}-l4-s8`,
      title: 'สรุปบทนี้',
      keyTakeaways: [
        'เข็มยาวเลย 6 (ครึ่งซ้าย) → ใช้ **"to"**',
        '**ใช้ชั่วโมงที่กำลังจะถึง** ไม่ใช่ที่ผ่านมา',
        'จากดิจิทัล: **60 − นาที** = นาทีถึงชั่วโมงถัดไป',
      ],
      nextUp: 'บทต่อไป: ทดสอบรวม past + to + quarter + half + o\'clock',
    }),
  ],
});

// ---------------------------------------------------------------------------
// Lesson 5 — Mini quiz (assessment)
// ---------------------------------------------------------------------------
const lesson5: Lesson = lesson({
  id: `${SUB}-l5`,
  subTopicId: SUB,
  order: 5,
  title: 'Time Quiz — ทดสอบรวมการอ่านเวลา 🏆',
  description: 'รวมทุกรูปแบบ — o\'clock, half past, quarter, past, to',
  estimatedMinutes: 20,
  isAssessment: true,
  learningObjectives: [
    'อ่านเวลานาฬิกาเข็มได้ทุกรูปแบบ',
  ],
  steps: [
    miniQuiz({
      id: `${SUB}-l5-s1`,
      title: 'ทดสอบ — 8 ข้อ',
      questions: [
        mcqText({
          id: `${SUB}-l5-q1`,
          prompt: 'เวลานี้คืออะไร?',
          promptVisual: analogClock(9, 0),
          choices: [
            { id: 'a', text: "9 o'clock" },
            { id: 'b', text: "12 o'clock" },
            { id: 'c', text: 'half past 9' },
            { id: 'd', text: '9 minutes past 12' },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l5-q2`,
          prompt: 'เวลานี้คืออะไร?',
          promptVisual: analogClock(1, 30),
          choices: [
            { id: 'a', text: 'half past 1' },
            { id: 'b', text: 'half past 6' },
            { id: 'c', text: 'half past 2' },
            { id: 'd', text: "1 o'clock" },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l5-q3`,
          prompt: 'เวลานี้คืออะไร?',
          promptVisual: analogClock(4, 15),
          choices: [
            { id: 'a', text: 'quarter past 4' },
            { id: 'b', text: 'quarter to 4' },
            { id: 'c', text: 'quarter past 3' },
            { id: 'd', text: 'half past 4' },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l5-q4`,
          prompt: 'เวลานี้คืออะไร?',
          promptVisual: analogClock(11, 45),
          choices: [
            { id: 'a', text: 'quarter to 12' },
            { id: 'b', text: 'quarter to 11' },
            { id: 'c', text: 'quarter past 11' },
            { id: 'd', text: '45 minutes to 12' },
          ],
          correctChoiceId: 'a',
        }),
        mcqText({
          id: `${SUB}-l5-q5`,
          prompt: 'เวลานี้คืออะไร?',
          promptVisual: analogClock(2, 50),
          choices: [
            { id: 'a', text: '10 minutes to 3' },
            { id: 'b', text: '10 minutes past 2' },
            { id: 'c', text: '10 minutes to 2' },
            { id: 'd', text: '50 minutes to 3' },
          ],
          correctChoiceId: 'a',
        }),
        mcqVisual({
          id: `${SUB}-l5-q6`,
          prompt: 'นาฬิกาไหนแสดง 20 minutes past 5?',
          choices: [
            { id: 'a', visual: analogClock(5, 20) },
            { id: 'b', visual: analogClock(4, 20) },
            { id: 'c', visual: analogClock(5, 40) },
            { id: 'd', visual: analogClock(20, 5) },
          ],
          correctChoiceId: 'a',
        }),
        setClock({
          id: `${SUB}-l5-q7`,
          prompt: 'ลากเข็มให้แสดง quarter past 7 (7:15)',
          expectedHours: 7,
          expectedMinutes: 15,
        }),
        setClock({
          id: `${SUB}-l5-q8`,
          prompt: 'ลากเข็มให้แสดง 5 minutes to 10 (9:55)',
          expectedHours: 9,
          expectedMinutes: 55,
        }),
      ],
      starsOnPass: 5,
      starsOnPerfect: 10,
    }),
    reflection({
      id: `${SUB}-l5-s2`,
      title: 'จบบทอ่านเวลาแล้ว! 🎉',
      keyTakeaways: [
        'เข็ม**สั้น** = ชั่วโมง, เข็ม**ยาว** = นาที',
        "ครึ่งขวา (1-6) → **past** | ครึ่งซ้าย (7-11) → **to**",
        '**to** ใช้ชั่วโมงที่**กำลังจะถึง**',
      ],
    }),
  ],
});

export const readingTheClockLessons: Lesson[] = [
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
];
