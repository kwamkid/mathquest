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
    exp: 'เหรียญ',
    lifetimeCoins: 'เหรียญสะสม',
    level: 'ระดับความยาก',
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
    typingDesc: 'ฝึกพิมพ์ดีดแบบเกมอวกาศ เก็บดาว',
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
    mixClaimed: 'รับเหรียญวันนี้แล้ว ✓',
    mixClaimToday: (exp: number) => `+${exp} เหรียญวันนี้`,
    mixNeed2: 'ด่านรวมพลัง (Mix Challenge) จะเปิดเมื่อมีแม่ที่เล่นได้ 2 แม่ขึ้นไป',
    peekChart: (table: number) => `แอบดูตารางแม่ ${table} ก่อนเล่น (review)`,
    roundNotFound: 'ไม่พบรอบฝึกนี้',
    backToTimetable: 'กลับหน้าสูตรคูณ',
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
    expGained: (exp: number) => `🪙 ได้รับ +${exp} เหรียญ`,
    replayGained: (exp: number) => `🪙 +${exp} เหรียญ (โบนัสฝึกซ้ำ — ครั้งแรกได้เต็ม)`,
    playNext: (table: number, stage: number, title: string) =>
      `เล่นต่อ: แม่ ${table} · ตอนที่ ${stage}/3 ${title}`,
    stageOf: (stage: number, title: string) => `ตอนที่ ${stage}/3 · ${title}`,
    replay: 'ฝึกรอบนี้อีกครั้ง',
    retry: 'ลองใหม่อีกครั้ง',
    correct: 'ถูกต้อง',
    incorrect: 'ยังไม่ใช่',
  },

  typing: {
    title: 'ฝึกพิมพ์ดีด',
    titleTag: 'Typing',
    subtitle:
      'ยิงอุกกาบาตด้วยการพิมพ์! เก็บดาวไต่แป้นทีละคู่ จนพิมพ์ครบ a-z ไม่ต้องมองแป้น',
    unitWord: 'บทเรียน',
    chooseUnit: 'เลือกบทเรียนที่อยากฝึก',
    enTrackTab: 'English',
    thTrackTabSoon: 'ไทย · เร็วๆ นี้',
    tapToStart: 'แตะเพื่อเริ่ม!',
    orPressSpace: 'หรือกดปุ่ม SPACE เพื่อเริ่ม',
    wrongLangTitle: 'คีย์บอร์ดยังเป็นภาษาไทยอยู่!',
    wrongLangHint: 'สลับเป็น English ก่อนนะ — Mac: ⌘+Space · Windows: Alt+Shift · iPad: ปุ่มลูกโลก 🌐',
    wrongLangResume: 'เกมหยุดรอให้แล้ว — เปลี่ยนเสร็จ พิมพ์ตัวไหนก็ได้เพื่อเล่นต่อ',
    tapToResume: 'แตะเพื่อเล่นต่อ',
    typeHere: 'พิมพ์ที่นี่',
    accuracyLabel: 'แม่นยำ',
    comboLabel: 'Combo',
    bestCombo: 'Combo สูงสุด',
    rocksLeft: (n: number) => `เหลือ ${n} ก้อน`,
    shieldHit: 'โล่กันไว้ได้! ระวังก้อนต่อไปนะ',
    passed: 'ผ่านแล้ว! 🎉',
    perfectRound: 'เพอร์เฟกต์ ไม่พลาดเลย! 🎉',
    failed: 'ยังไม่ผ่าน ลองอีกครั้งนะ',
    accuracyResult: (pct: number, errors: number) =>
      `แม่นยำ ${pct}% · พลาด ${errors} ครั้ง`,
    missCount: (n: number) => `พลาด ${n} ครั้ง`,
    wpmResult: (wpm: number) => `ความเร็ว ${wpm} คำ/นาที (WPM)`,
    expGained: (exp: number) => `🪙 ได้รับ +${exp} เหรียญ`,
    replayGained: (exp: number) => `🪙 +${exp} เหรียญ (โบนัสฝึกซ้ำ — ครั้งแรกได้เต็ม)`,
    playNext: (unit: number, stage: number, title: string) =>
      `เล่นต่อ: บทเรียน ${unit} · ตอนที่ ${stage}/3 ${title}`,
    stageOf: (stage: number, title: string) => `ตอนที่ ${stage}/3 · ${title}`,
    replay: 'เล่นตอนเดิมอีกครั้ง',
    retry: 'ลองใหม่อีกครั้ง',
    backToTyping: 'กลับหน้ารวมบทเรียน',
    stageNotFound: 'ไม่พบรอบฝึกนี้',
    approxMinutes: '~2 นาที',
    master: 'มาสเตอร์!',
    spaceKey: 'เว้นวรรค (Space)',
    // Stage modifiers
    timedIntro: '⏱ พิมพ์ให้ทันเวลา รับโบนัส!',
    multiIntro: (n: number) => `✌️ หินมา ${n} ก้อนพร้อมกัน!`,
    timeLeft: (s: number) => `⏱ ${s}s`,
    timeBonus: (n: number) => `⏱ โบนัสเวลา +${n} เหรียญ`,
    timeBonusOver: 'หมดเวลาโบนัส',
    timePenalty: (s: number) => `−${s}s`,
    // Device gating — typing needs a real keyboard.
    phoneBlockTitle: 'ฝึกพิมพ์ดีดบนคอมพิวเตอร์นะ 💻',
    phoneBlockBody:
      'การพิมพ์สัมผัสต้องใช้คีย์บอร์ดจริง วางครบ 10 นิ้ว บนมือถือฝึกได้ไม่เต็มที่ — เปิดในคอมพิวเตอร์แล้วมาลุยกัน! 🚀',
    phoneBlockBack: 'กลับหน้าหลัก',
    tabletKeyboardHint: 'ต่อคีย์บอร์ดจริงจะฝึกได้ดีที่สุดนะ ⌨️',
    // Home-row ready check — place all 8 fingers before playing.
    placeFingers: 'วางนิ้วให้ครบทั้ง 8 บนแป้นเหย้า แล้วกดพร้อมกัน!',
    placeFingersReady: 'พร้อมแล้ว! 🚀',
    todayKeys: 'วันนี้ฝึก',
    skipFingers: 'ข้ามการวางนิ้ว',
    fingersWrongLang: '⚠️ แป้นเป็นภาษาไทยอยู่ — สลับเป็น English ก่อนนะ 🌐',
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
    exp: 'Coins',
    lifetimeCoins: 'Lifetime coins',
    level: 'Difficulty',
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
    typingDesc: 'Space typing game — learn key by key',
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
    mixClaimed: "Today's coins claimed ✓",
    mixClaimToday: (exp: number) => `+${exp} coins today`,
    mixNeed2: 'The Mix Challenge opens once 2 tables are playable',
    peekChart: (table: number) => `Peek at the ${table} times table first`,
    roundNotFound: 'Round not found',
    backToTimetable: 'Back to Times Tables',
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
    expGained: (exp: number) => `🪙 +${exp} coins earned`,
    replayGained: (exp: number) => `🪙 +${exp} coins (practice bonus — first clear pays full)`,
    playNext: (table: number, stage: number, title: string) =>
      `Next: table ${table} · part ${stage}/3 ${title}`,
    stageOf: (stage: number, title: string) => `Part ${stage}/3 · ${title}`,
    replay: 'Play this round again',
    retry: 'Try again',
    correct: 'Correct',
    incorrect: 'Not quite',
  },

  typing: {
    title: 'Typing',
    titleTag: 'Space Defense',
    subtitle:
      'Zap meteors by typing! Collect stars key-pair by key-pair until you can type a-z without looking',
    unitWord: 'Lesson',
    chooseUnit: 'Pick a lesson to practice',
    enTrackTab: 'English',
    thTrackTabSoon: 'Thai · coming soon',
    tapToStart: 'Tap to start!',
    orPressSpace: 'or press SPACE to start',
    wrongLangTitle: 'Your keyboard is typing Thai!',
    wrongLangHint: 'Switch to English — Mac: ⌘+Space · Windows: Alt+Shift · iPad: globe key 🌐',
    wrongLangResume: 'Game paused for you — once switched, press any letter to continue',
    tapToResume: 'Tap to keep playing',
    typeHere: 'Type here',
    accuracyLabel: 'Accuracy',
    comboLabel: 'Combo',
    bestCombo: 'Best combo',
    rocksLeft: (n: number) => `${n} rocks left`,
    shieldHit: 'The shield caught it! Watch the next one',
    passed: 'Passed! 🎉',
    perfectRound: 'Perfect — not a single miss! 🎉',
    failed: 'Not yet — try again!',
    accuracyResult: (pct: number, errors: number) =>
      `${pct}% accuracy · ${errors} misses`,
    missCount: (n: number) => `${n} misses`,
    wpmResult: (wpm: number) => `Speed: ${wpm} WPM`,
    expGained: (exp: number) => `🪙 +${exp} coins earned`,
    replayGained: (exp: number) => `🪙 +${exp} coins (practice bonus — first clear pays full)`,
    playNext: (unit: number, stage: number, title: string) =>
      `Next: lesson ${unit} · part ${stage}/3 ${title}`,
    stageOf: (stage: number, title: string) => `Part ${stage}/3 · ${title}`,
    replay: 'Play this part again',
    retry: 'Try again',
    backToTyping: 'Back to all lessons',
    stageNotFound: 'Stage not found',
    approxMinutes: '~2 min',
    master: 'Mastered!',
    spaceKey: 'Space bar',
    // Stage modifiers
    timedIntro: '⏱ Beat the clock for a bonus!',
    multiIntro: (n: number) => `✌️ ${n} rocks at a time!`,
    timeLeft: (s: number) => `⏱ ${s}s`,
    timeBonus: (n: number) => `⏱ Time bonus +${n} coins`,
    timeBonusOver: 'Bonus time up',
    timePenalty: (s: number) => `−${s}s`,
    // Device gating — typing needs a real keyboard.
    phoneBlockTitle: 'Practice typing on a computer 💻',
    phoneBlockBody:
      'Touch typing needs a real keyboard so all ten fingers can rest in place. A phone screen can’t give you that — open this on a computer and let’s go! 🚀',
    phoneBlockBack: 'Back to home',
    tabletKeyboardHint: 'Best with a real keyboard connected ⌨️',
    // Home-row ready check — place all 8 fingers before playing.
    placeFingers: 'Rest all 8 fingers on the home row, then press together!',
    placeFingersReady: 'Ready! 🚀',
    todayKeys: 'Today',
    skipFingers: 'Skip finger check',
    fingersWrongLang: '⚠️ Keyboard is in Thai — switch to English first 🌐',
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
