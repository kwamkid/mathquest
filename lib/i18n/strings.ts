// lib/i18n/strings.ts
//
// Central bilingual dictionary for shared chrome + the main learning
// surfaces. Conventions:
//
//   - EN mode: full English.
//   - TH mode: Thai UI, but key ENGLISH VOCABULARY stays visible on purpose
//     (mode names, math terms, "Level/Star/Quiz"…) — the parent wants the kid
//     to pick up English words while using the Thai UI. So Thai strings are
//     often "ไทย · English" pairs, not pure translations.
//   - Page-specific text that no other page shares may live in a local
//     `{ th: {...}, en: {...} }` object inside that page, same shape, using
//     `useLanguage().lang` to pick — keep this file for shared/multi-page
//     strings so it doesn't balloon.
//
// `th` is the source of truth for the shape; `en` must mirror it (typed).

const th = {
  common: {
    score: 'คะแนน',
    exp: 'EXP',
    level: 'Level',
    continue: 'เรียนต่อ',
    start: 'เริ่มเรียน',
    play: 'เล่นต่อ',
    back: 'ย้อนกลับ',
    backHome: 'กลับหน้าแรก',
    locked: 'ล็อกอยู่',
    completed: 'เรียนจบแล้ว',
    inProgress: 'กำลังเรียนอยู่',
    quiz: 'QUIZ',
    practice: 'ฝึก',
    minutes: 'นาที',
    lessons: 'บทเรียน',
    notReady: 'ยังไม่พร้อมใช้งาน',
    userMenu: 'เมนูผู้ใช้',
    logout: 'ออกจากระบบ',
    myAvatar: 'My Avatar',
    shop: 'Shop',
    settings: 'Setting',
  },

  home: {
    tagline: 'การผจญภัยแห่งตัวเลข',
    hello: 'สวัสดี',
    whatToday: 'วันนี้อยากทำอะไรดี?',
    groupLearn: 'เรียนตามบทเรียน · Learn',
    groupPractice: 'เกมฝึกให้คล่อง · Practice',
    playDesc: 'ผจญภัย 100 ด่าน เก็บคะแนน',
    lifeMathDesc: 'คณิตในชีวิตประจำวัน',
    learnDesc: 'บทเรียนตามหลักสูตรโรงเรียน',
    timetableDesc: 'ฝึกสูตรคูณ เก็บดาวทุกแม่',
    typingDesc: 'เกมพิมพ์เร็ว ฝึกศัพท์อังกฤษ',
    comingSoon: 'เร็วๆ นี้ · Coming soon',
    startAdventure: 'เริ่มการผจญภัย',
    noAccount: 'ยังไม่มีบัญชี?',
    register: 'สมัครสมาชิก',
    feat100Title: '100 Levels',
    feat100Desc: 'ฝึกฝนทักษะคณิตศาสตร์ ตั้งแต่ง่ายจนถึงยาก',
    featRankTitle: 'Ranking',
    featRankDesc: 'แข่งขันกับเพื่อนๆ ในระดับชั้นเดียวกัน',
    featRewardTitle: 'Daily Rewards',
    featRewardDesc: 'เข้าเล่นต่อเนื่อง รับโบนัสพิเศษ',
    statStudents: 'นักเรียน',
    statQuestions: 'โจทย์',
    statReviews: 'รีวิว',
    footerNote: '📱 เล่นได้ทุกอุปกรณ์ • 🌐 ไม่ต้องดาวน์โหลด • 🔒 ปลอดภัย 100%',
  },

  timetable: {
    title: 'สูตรคูณ',
    titleTag: 'Timetable',
    subtitle: 'เก็บดาว (star) ให้ครบทุกแม่ — ได้ดาวดวงแรกเมื่อไร แม่ถัดไปปลดล็อกทันที',
    table: 'แม่',
    chooseTable: 'เลือกแม่ที่อยากฝึก',
    approxMinutes: '~2 นาที',
    roundsOf: (done: number, total: number) => `${done}/${total} รอบ`,
    master: 'มาสเตอร์!',
    playHere: 'เล่นต่อตรงนี้',
    mixTitle: 'ด่านรวมพลัง',
    mixTag: 'Mix Challenge',
    mixReady: (n: number) =>
      `สุ่มโจทย์จากทุกแม่ที่ปลดล็อกแล้ว (${n} แม่) เล่นซ้ำได้ไม่จำกัด`,
    mixLocked: 'ปลดล็อกเมื่อมีแม่ที่เล่นได้ 2 แม่ขึ้นไป',
    mixClaimed: 'รับ EXP วันนี้แล้ว ✓',
    mixClaimToday: (exp: number) => `+${exp} EXP วันนี้`,
    mixNeed2: 'ด่านรวมพลัง (Mix Challenge) จะเปิดเมื่อมีแม่ที่เล่นได้ 2 แม่ขึ้นไป',
    stageWord: 'ระดับ',
    collectStars: (stages: number) =>
      `เก็บให้ครบ ${stages} ดาว — ดาวละ 3 รอบ`,
    peekChart: (table: number) => `แอบดูตารางแม่ ${table} ก่อนเล่น (review)`,
    tableLocked: 'แม่นี้ยังล็อกอยู่ — เก็บดาวแม่ก่อนหน้าก่อนนะ',
    tableNotFound: 'ไม่พบแม่สูตรคูณนี้',
    roundNotFound: 'ไม่พบรอบฝึกนี้',
    backToTimetable: 'กลับหน้าสูตรคูณ',
    backToTable: (table: number) => `กลับหน้าแม่ ${table}`,
    // Round player
    questionOf: (i: number, total: number) => `ข้อ ${i} จาก ${total}`,
    correctSoFar: (n: number, total: number) => `ถูก ${n}/${total}`,
    nextQuestion: 'ข้อถัดไป',
    seeResult: 'ดูผล',
    answeredRight: (n: number, total: number, pct: number) =>
      `ตอบถูก ${n}/${total} ข้อ (${pct}%)`,
    passed: 'ผ่านแล้ว! 🎉',
    perfectScore: 'สุดยอด เต็ม 20 ข้อ! 🎉',
    failed: 'ยังไม่ผ่าน ลองอีกครั้งนะ',
    expGained: (exp: number) => `⚡ ได้รับ +${exp} EXP`,
    mixAlreadyPaid: 'วันนี้รับ EXP ไปแล้ว — ฝึกซ้ำได้ไม่จำกัด 👍',
    roundAlreadyPaid: 'ฝึกซ้ำได้ EXP ครบแล้วรอบนี้ 👍',
    playNext: (table: number, stage: string) => `เล่นต่อ: แม่ ${table} · ${stage}`,
    replay: 'ฝึกรอบนี้อีกครั้ง',
    retry: 'ลองใหม่อีกครั้ง',
    correct: 'ถูกต้อง',
    incorrect: 'ยังไม่ใช่',
  },

  curriculum: {
    learnTitle: 'เรียนคณิตศาสตร์ · School Learn',
    welcomeBack: 'ยินดีต้อนรับกลับมา',
    pickCurriculum: 'เลือกหลักสูตร',
    otherCurricula: 'เลือกหลักสูตรอื่น',
    allCurricula: 'หลักสูตรทั้งหมด',
    comingSoon: 'เร็วๆ นี้',
    gradesReady: (ready: number, total: number) =>
      `${ready}/${total} ระดับชั้นพร้อมใช้งาน`,
    lifeMathSubtitle:
      'คณิตศาสตร์ที่ใช้ในชีวิตจริง — เปอร์เซ็นต์ (percent) บัญญัติไตรยางศ์ ลดราคา ของคุ้มราคา',
    lifeMathHeading: 'Life Math · ทักษะคำนวณในชีวิตประจำวัน',
    lessonsProgress: (done: number, total: number) => `${done}/${total} บทเรียน`,
    estMinutes: (m: number) => `⏱ ${m} นาที`,
  },
};

// EN mirrors th's shape exactly.
const en: typeof th = {
  common: {
    score: 'Score',
    exp: 'EXP',
    level: 'Level',
    continue: 'Continue',
    start: 'Start',
    play: 'Play',
    back: 'Back',
    backHome: 'Back to home',
    locked: 'Locked',
    completed: 'Completed',
    inProgress: 'In progress',
    quiz: 'QUIZ',
    practice: 'Practice',
    minutes: 'min',
    lessons: 'lessons',
    notReady: 'Not available yet',
    userMenu: 'User menu',
    logout: 'Log out',
    myAvatar: 'My Avatar',
    shop: 'Shop',
    settings: 'Setting',
  },

  home: {
    tagline: 'The Number Adventure',
    hello: 'Hi',
    whatToday: 'What would you like to do today?',
    groupLearn: 'Learn',
    groupPractice: 'Practice',
    playDesc: 'Adventure through 100 levels',
    lifeMathDesc: 'Math for everyday life',
    learnDesc: 'Lessons that follow the school curriculum',
    timetableDesc: 'Drill times tables, collect stars',
    typingDesc: 'Speed typing, learn English words',
    comingSoon: 'Coming soon',
    startAdventure: 'Start the Adventure',
    noAccount: "Don't have an account?",
    register: 'Sign up',
    feat100Title: '100 Levels',
    feat100Desc: 'Practice math skills from easy to hard',
    featRankTitle: 'Ranking',
    featRankDesc: 'Compete with friends in your grade',
    featRewardTitle: 'Daily Rewards',
    featRewardDesc: 'Play every day, earn special bonuses',
    statStudents: 'students',
    statQuestions: 'questions',
    statReviews: 'reviews',
    footerNote: '📱 Any device • 🌐 No download • 🔒 100% safe',
  },

  timetable: {
    title: 'Times Tables',
    titleTag: 'Practice',
    subtitle:
      'Collect every star — the first star on a table unlocks the next one right away',
    table: 'Table',
    chooseTable: 'Pick a table to practice',
    approxMinutes: '~2 min',
    roundsOf: (done: number, total: number) => `${done}/${total} rounds`,
    master: 'Mastered!',
    playHere: 'Continue here',
    mixTitle: 'Mix Challenge',
    mixTag: 'all tables',
    mixReady: (n: number) =>
      `Random questions from all ${n} unlocked tables — replay any time`,
    mixLocked: 'Unlocks once 2 tables are playable',
    mixClaimed: "Today's EXP claimed ✓",
    mixClaimToday: (exp: number) => `+${exp} EXP today`,
    mixNeed2: 'The Mix Challenge opens once 2 tables are playable',
    stageWord: 'Level',
    collectStars: (stages: number) =>
      `Collect all ${stages} stars — 3 rounds per star`,
    peekChart: (table: number) => `Peek at the ${table} times table first`,
    tableLocked: 'This table is locked — earn a star on the one before it',
    tableNotFound: 'Times table not found',
    roundNotFound: 'Round not found',
    backToTimetable: 'Back to Times Tables',
    backToTable: (table: number) => `Back to table ${table}`,
    // Round player
    questionOf: (i: number, total: number) => `Question ${i} of ${total}`,
    correctSoFar: (n: number, total: number) => `${n}/${total} correct`,
    nextQuestion: 'Next',
    seeResult: 'See result',
    answeredRight: (n: number, total: number, pct: number) =>
      `${n}/${total} correct (${pct}%)`,
    passed: 'Passed! 🎉',
    perfectScore: 'Perfect — all 20! 🎉',
    failed: "Not yet — try again!",
    expGained: (exp: number) => `⚡ +${exp} EXP earned`,
    mixAlreadyPaid: "Today's EXP already claimed — practice as much as you like 👍",
    roundAlreadyPaid: 'EXP already earned for this round 👍',
    playNext: (table: number, stage: string) =>
      `Next: table ${table} · ${stage}`,
    replay: 'Play this round again',
    retry: 'Try again',
    correct: 'Correct',
    incorrect: 'Not quite',
  },

  curriculum: {
    learnTitle: 'School Learn',
    welcomeBack: 'Welcome back',
    pickCurriculum: 'Pick a curriculum',
    otherCurricula: 'Choose another curriculum',
    allCurricula: 'All curricula',
    comingSoon: 'Coming soon',
    gradesReady: (ready: number, total: number) =>
      `${ready}/${total} grades available`,
    lifeMathSubtitle:
      'Math you actually use — percentages, unit prices, discounts, best value',
    lifeMathHeading: 'Life Math · everyday number skills',
    lessonsProgress: (done: number, total: number) =>
      `${done}/${total} lessons`,
    estMinutes: (m: number) => `⏱ ${m} min`,
  },
};

export type Lang = 'th' | 'en';
export type Strings = typeof th;

export const STRINGS: Record<Lang, Strings> = { th, en };
