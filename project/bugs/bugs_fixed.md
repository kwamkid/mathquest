# 🐛 Bugs & traps — grep before debugging

> Traps we keep re-hitting: symptom → root cause → fix → file links,
> grouped by subsystem, dated. **Grep this BEFORE debugging** so a bug
> logged once is never re-debugged. Append-only via `/memo`.

<!-- toc -->
**Contents** (15)
- 2026-06-18 — sed `&` ใน replacement หมายถึง matched string ทั้งหมด
- 2026-06-18 — Chrome autofill ทับ input style เป็นสีเหลือง/ม่วงอ่อน
- 2026-06-18 — `sticky bottom-0` ใช้ไม่ได้ถ้าเนื้อหา fit viewport
- 2026-06-18 — /learn auto-resumer hijack ด้วย life-math progress
- 2026-06-18 — avatar accessoryOffsets/Layer หายหลัง refresh
- 2026-06-18 — z-index ของ accessory ไม่ทำงาน (stack layer ไม่เปลี่ยน)
- 2026-06-18 — emoji avatar ลอยขึ้นบน ไม่อยู่กลางวงกลม
- 2026-07-10 — `router.refresh()` ไม่รีเซ็ต client state → ปุ่ม "เล่นซ้ำ" ค้าง
- 2026-07-10 — framer-motion animate ทับ Tailwind translate class
- 2026-07-10 — overlay "แตะเพื่อเล่นต่อ" refocus แล้วโดน browser ดึง focus คืนทันที
- 2026-06-18 — interactive question auto-submit ตอน mount (set-clock)
- 2026-07-12 — framer-motion ทับ Tailwind translate ทุกครั้งที่ node มี `animate` (โดนแล้ว 3 รอบ!)
- 2026-07-23 — key-remount เพื่อรีสตาร์ทอนิเมชัน = กระพริบเป็นพักๆ (mask/img re-decode)
- 2026-07-23 — Keyboard ghosting: ห้ามออกแบบท่า "กดพร้อมกัน 6+ ปุ่ม"
- 2026-07-23 — ล้าง state ด้วย useEffect ตอนเปลี่ยนข้อ = เฉลยแดง/เขียวแวบบนข้อใหม่ 1 เฟรม
<!-- /toc -->

---

## 2026-06-18 — sed `&` ใน replacement หมายถึง matched string ทั้งหมด

**Symptom:** ตอน batch rename lesson titles ด้วย `sed -i.bak "s/'เปรียบเทียบราคา — เลือกที่คุ้มกว่า'/'เปรียบเทียบราคา (Compare & Find Best Value)'/"` ผลออกมาเป็น `title: 'เปรียบเทียบราคา (Compare title: 'เปรียบเทียบราคา — เลือกที่คุ้มกว่า' Find Best Value)'` — TS syntax error

**Root cause:** `&` ใน replacement ของ sed หมายถึง "ทั้ง matched string" — มันแทรกตัวเองเข้าไปกลาง replacement

**Fix:** escape เป็น `\&` หรือเลี่ยงเลย (ใช้ `and`/`+` แทน) — ทุก batch sed ที่จะมี `&` ต้องระวัง. เคสนี้แก้มือใน [l3-compare.ts](/lib/curricula/life-math-beginner/topics/unitary-method/lessons/l3-compare.ts) และ [l4-tricks-and-word-problems.ts](/lib/curricula/life-math-beginner/topics/unitary-method/lessons/l4-tricks-and-word-problems.ts)

---

## 2026-06-18 — Chrome autofill ทับ input style เป็นสีเหลือง/ม่วงอ่อน

**Symptom:** หน้า login กรอกแล้ว Chrome/Safari paint สี autofill ทับ — background กลายเป็นม่วงอ่อนมาก + text fill color ไม่ใช่ขาวจริง → text จมกับ background

**Root cause:** browser autofill animation จะ override `background-color` ของ input — `!important` ก็ไม่ชนะ

**Fix:** Canonical hack ใน [globals.css](/app/globals.css) — ผสม 3 ส่วน:
1. `transition: background-color 99999s` — browser apply animation จริงแต่ duration ใหญ่จน invisible
2. `-webkit-box-shadow: 0 0 0 1000px <bg> inset` — paint background ของเราเองด้วย inset shadow
3. `-webkit-text-fill-color: #ffffff` — force text color เพราะ `color` ไม่ทำงาน

---

## 2026-06-18 — `sticky bottom-0` ใช้ไม่ได้ถ้าเนื้อหา fit viewport

**Symptom:** Lesson footer ตั้ง `sticky bottom-0` แต่บน mobile บางหน้าปุ่ม "ตรวจคำตอบ" หายไปกลางจอ — กดไม่ถึง

**Root cause:** `position: sticky` ทำงานเฉพาะตอน scroll container เกิน viewport ถ้า content สั้น → footer flow ไป "ตำแหน่งปกติ" (end of content) ไม่ pin ขอบจอ

**Fix:** `fixed inset-x-0 bottom-0 z-30` + `pb-[max(0.75rem,env(safe-area-inset-bottom))]` สำหรับ iOS home bar. ตัวเนื้อหา main ต้องเพิ่ม `pb-32` กัน footer ทับ. ดู [LessonFooter.tsx](/components/lesson/LessonFooter.tsx) + [LessonPlayer.tsx](/components/lesson/LessonPlayer.tsx)

---

## 2026-06-18 — /learn auto-resumer hijack ด้วย life-math progress

**Symptom:** หลังย้าย Life Math ไป `/life-math` top-level — แต่ user ที่เคยเล่น Life Math เข้า /learn → curriculum timeline ยังโชว์ Life Math เพราะ `findContinueLesson` resolve curriculum จาก `user.currentCurriculumId`

**Root cause:** `/learn` ใช้ `Object.keys(user.curriculumProgress)[0]` หรือ `currentCurriculumId` โดยไม่ filter ว่า curriculum นั้นอยู่ใน school-curriculum family หรือเปล่า

**Fix:** Filter ด้วย `schoolCurriculumIds` set (sourced จาก `families.flatMap(grades).curriculumId`) ก่อน pick. ดู [app/(game)/learn/page.tsx](/memo/app/(game)/learn/page.tsx) — `active` useMemo. Pattern นี้ใช้ซ้ำได้ถ้าจะแยก curriculum อื่นออกจาก /learn อนาคต

---

## 2026-06-18 — avatar accessoryOffsets/Layer หายหลัง refresh

**Symptom:** ปรับตำแหน่ง accessory ในหน้า My Avatar บันทึกแล้ว พอ refresh ตำแหน่งเด้งกลับ default ("เลื่อนลงเอง")

**Root cause:** หน้า my-avatar rebuild `currentAvatar` แบบ field-by-field **2 จุด** (load-init `else` branch + `needsSync` write-back) แต่ copy แค่ `type/id/accessories` — **ทิ้ง `accessoryOffsets` + `accessoryLayerOrder`**

**Fix:** ทั้ง 2 จุดต้อง carry `accessoryOffsets` + `accessoryLayerOrder` มาด้วย. ดู [app/(game)/my-avatar/page.tsx](/memo/app/(game)/my-avatar/page.tsx). **กฎ: ถ้าเพิ่ม field ใน `currentAvatar` ต้องอัปเดตทั้ง 2 rebuild path เสมอ**

---

## 2026-06-18 — z-index ของ accessory ไม่ทำงาน (stack layer ไม่เปลี่ยน)

**Symptom:** ตั้ง layer order แล้วชิ้น accessory ไม่สลับหน้า-หลังจริง

**Root cause (สองชั้น):** (1) `accessoryLayerOrder` เริ่มเป็น `[]` → ทุกชิ้น z=10 เท่ากัน → tie ตัดสินด้วย DOM order. (2) ตอนแก้ครั้งแรกเผลอใส่ `position:relative` ที่ wrapper 0×0 → ทำให้ absolute child `left:50%` คิดจาก wrapper ขนาด 0 แทน parent 300px → ตำแหน่งพัง

**Fix:** z-index = `100 - layerOrder.indexOf(type)` (background = −1). อย่าทำ wrapper เป็น positioned + ขนาด 0 — ปล่อย wrapper เป็น static, absolute children share positioned ancestor (`.relative` 300px) อยู่แล้ว z-index ข้ามกันได้. ดู [EnhancedAvatarDisplay.tsx](/components/avatar/EnhancedAvatarDisplay.tsx)

---

## 2026-06-18 — emoji avatar ลอยขึ้นบน ไม่อยู่กลางวงกลม

**Symptom:** avatar (emoji) ในกรอบวงกลม header/preview ลอยขึ้นบน ไม่อยู่กลาง

**Root cause:** emoji `text-[120px]` ไม่มี `leading-none` → line-height ดัน glyph เบี้ยว + glyph metrics ของ emoji เองนั่งสูงในกล่อง พอ scale ลงเห็นชัด

**Fix:** กล่อง emoji เป็น `flex items-center justify-center` + `leading-none` ขนาด 120×120 + `translateY(6%)` optically centre. ดู [EnhancedAvatarDisplay.tsx](/components/avatar/EnhancedAvatarDisplay.tsx)

---

## 2026-07-10 — `router.refresh()` ไม่รีเซ็ต client state → ปุ่ม "เล่นซ้ำ" ค้าง

**Symptom:** ปุ่ม "ฝึกรอบนี้อีกครั้ง" ใน round player กดแล้วหน้าไม่เริ่มใหม่ — ค้างที่ result screen เดิม

**Root cause:** `router.refresh()` ของ Next รีเฟรชเฉพาะ server components — **useState ใน client component คงอยู่ครบ** (`finished` ยัง true, โจทย์ชุดเดิม)

**Fix:** ทำ `restart()` เอง: bump `attempt` state ที่อยู่ใน deps ของ `useMemo` โจทย์ (ได้ชุดใหม่) + รีเซ็ต state ทุกตัว. ดู [TimetableRoundPlayer.tsx](/components/timetable/TimetableRoundPlayer.tsx), [TypingRoundPlayer.tsx](/components/typing/TypingRoundPlayer.tsx). **กฎ: ปุ่ม replay ใน client component ห้ามใช้ router.refresh()**

---

## 2026-07-10 — framer-motion animate ทับ Tailwind translate class

**Symptom:** หินอุกกาบาต (typing game) ใช้ `-translate-x-1/2` จัดกลาง + framer `animate={{ x: [0,-7,7,0] }}` สั่นตอนพิมพ์ผิด → หินกระโดดหลุดตำแหน่ง (ไม่ centre แล้ว)

**Root cause:** framer-motion เขียน `transform` inline ทั้งก้อน — keyframes `x` ทับ `translateX(-50%)` ของ Tailwind ทิ้ง

**Fix:** แยกชั้น: outer div ถือตำแหน่ง (`style={{top,left}}` + Tailwind translate) / inner `motion.div` ถือเฉพาะ animation transform. ดู [TypingRoundPlayer.tsx](/components/typing/TypingRoundPlayer.tsx) — meteor block. **กฎ: อย่าให้ framer animate transform บน element เดียวกับที่ใช้ Tailwind translate/scale class**

---

## 2026-07-10 — overlay "แตะเพื่อเล่นต่อ" refocus แล้วโดน browser ดึง focus คืนทันที

**Symptom:** typing game pause overlay กดแล้วไม่ resume — เกมค้างที่ overlay เดิม

**Root cause:** default action ของ mousedown/pointerdown คือ**ย้าย focus ไปที่ element ที่กด** (หรือ body) — เรา `input.focus()` ใน handler แล้ว browser ก็ blur คืนทันทีใน default action → paused วนกลับมา. ยิ่งซ้อน: overlay unmount กลางท่า (paused เปลี่ยนตอน pointerdown) ทำให้ click ไม่ fire เลย

**Fix:** `e.preventDefault()` ใน `onPointerDown` (ตัด default focus steal — gesture ยังนับสำหรับ iOS keyboard) + focus ตรงนั้นเลย ไม่รอ onClick. สนามเกมทั้ง field ก็ทำเหมือนกันตอน playing กันแตะจอแล้วเกม pause เอง. ดู [TypingRoundPlayer.tsx](/components/typing/TypingRoundPlayer.tsx). **กฎ: จะ focus input จาก pointer handler ต้อง preventDefault ที่ pointerdown เสมอ**

---

## 2026-06-18 — interactive question auto-submit ตอน mount (set-clock)

**Symptom:** ข้อลากเข็มนาฬิกา (set-clock) พอกดเข้าข้อ ขึ้น ✕ แดง "ผิด" ทันทีทั้งที่ยังไม่ได้ลาก

**Root cause:** effect `[submitSignal]` รันครั้งแรกตอน mount (ค่าเริ่ม 0) → เรียก `submit()` กับนาฬิกา 12:00 ที่ยังไม่แตะ. ข้ออื่น (text-input/click-fraction) ไม่เจอเพราะ `submit()` มี guard "ถ้ายังว่าง return" แต่ set-clock ไม่มี

**Fix:** ข้าม effect รอบ mount ด้วย ref (`submitMounted`) + guard `if (!draggedAny) return` ใน submit(). **กฎ: ทุก interactive question ที่ผูก submit กับ signal ต้องข้าม initial mount + guard ค่าว่าง**. ดู [SetClockQuestion.tsx](/components/question/interactive/SetClockQuestion.tsx)

## 2026-07-12 — framer-motion ทับ Tailwind translate ทุกครั้งที่ node มี `animate` (โดนแล้ว 3 รอบ!)

**Symptom:** (1) meteor pill หลุดขอบจอขวาในเกม typing (2) dino ห้อยใต้เส้นพื้นตั้งแต่เกิด (3) กระบองเพชร obstacle อยู่บนพื้นถูกต้อง แต่พอ**พิมพ์ผิดครั้งแรก**ก็ร่วงลงมาทั้งแท่ง

**Root cause:** motion.div ที่มี prop `animate` **แบบใดก็ตาม** — รวมถึง `animate={{rotate: 0}}` เฉย ๆ หรือ `animate={tick ? {...} : undefined}` ที่เพิ่งได้ค่าครั้งแรก — framer จะเขียน `style.transform` ทับทั้งก้อน ทำให้ Tailwind class `-translate-x-1/2` / `-translate-y-full` ที่อยู่บน node เดียวกันหายทันที เคส obstacle เจ็บสุดเพราะ animate เป็น undefined ตอน mount → ดูปกติ → พังตอน interaction แรก (heisenbug)

**Fix (กฎเหล็ก):** **positioning transform (centering/lift) ต้องอยู่บน div ที่ไม่มี `animate` เท่านั้น** — โครงที่ถูก: outer div ธรรมดาถือ `absolute + left/top + -translate-x-1/2 -translate-y-full` → inner motion.div ถือเฉพาะ animation (shake/recoil/stumble) แก้แล้วใน [SpaceDefenseField.tsx](/components/typing/games/SpaceDefenseField.tsx) และ [DinoRunField.tsx](/components/typing/games/DinoRunField.tsx) — เขียน component เกมใหม่ทุกครั้งให้เช็คข้อนี้ก่อน

---

## 2026-07-23 — key-remount เพื่อรีสตาร์ทอนิเมชัน = กระพริบเป็นพักๆ (mask/img re-decode)

**Symptom:** เกม Dino กระพริบวาบๆ เป็นบางจังหวะระหว่างเล่น (ไม่ทุกครั้ง) — ไดโนหาย/เป็นสี่เหลี่ยมแวบเดียว, หินหมุนกระตุก

**Root cause:** pattern `key={laserTick}` (หรือ tick อื่น) เพื่อบังคับอนิเมชันเล่นใหม่ = React **รื้อ DOM ทิ้งแล้วสร้างใหม่ทุก keystroke**. node ที่เป็น CSS mask (ไดโน) ต้อง re-resolve/decode mask ใหม่ — เฟรมไหนเครื่องยุ่งจะวาดแบบไม่มี mask 1 เฟรม = วาบ. node ที่มี `<img>`+อนิเมชันวน (หินหมุน) ก็รีเซ็ตมุมหมุน = กระตุก

**Fix:** ห้าม remount เพื่อรีสตาร์ทเอฟเฟกต์ — ใช้ `useAnimationControls()` + `useEffect(() => { if (tick > 0) void controls.start({...}) }, [tick])` บน node เดิม. Sprite ที่สลับเฟรมด้วย mask หลายไฟล์ ให้ mount ทุกเฟรมค้างไว้แล้วสลับด้วย `visibility` (ห้ามสลับ mask URL บน node เดียว). แก้แล้วใน [DinoRunField.tsx](/components/typing/games/DinoRunField.tsx) (recoil/stumble/shake/flinch + DinoSprite 3 ชั้น) และ [SpaceDefenseField.tsx](/components/typing/games/SpaceDefenseField.tsx) (shake)

**เกี่ยวข้องกับ** กฎ framer-ทับ-translate (2026-07-12): คนละอาการ แต่รากเดียวกัน — เอฟเฟกต์ต้องอยู่บน node ของตัวเอง และ node ต้องมีชีวิตยาว

---

## 2026-07-23 — Keyboard ghosting: ห้ามออกแบบท่า "กดพร้อมกัน 6+ ปุ่ม"

**Symptom:** HomeRowGate (วาง 8 นิ้ว asdf jkl; แล้วกดพร้อมกัน) เด็กกดยังไงก็ไม่ผ่านเป็นบางเครื่อง — "เหมือน detect ไม่พร้อมกันสักที"

**Root cause:** คีย์บอร์ดทั่วไป (โน้ตบุ๊ก/เมมเบรน) matrix รายงานปุ่มพร้อมกันได้แค่ ~3-6 ปุ่ม (ghosting/rollover) — กด 8 ปุ่มค้างพร้อมกัน **บาง keydown ไม่ถูกส่งมาเลย** ไม่ใช่แค่ delay. rolling window ก็ช่วยไม่ได้เพราะ event ไม่มา

**Fix:** เปลี่ยน ritual เป็น **collect-the-set**: กดทีละปุ่ม (ลำดับ/จังหวะอิสระ) ปุ่มที่กดแล้วติดสว่างค้าง สะสมครบ 8 = ผ่าน — การกดทีละปุ่มรอด ghosting เสมอ. แก้ใน [HomeRowGate.tsx](/components/typing/HomeRowGate.tsx). กติกา: อย่าออกแบบ interaction ที่ต้องกดค้างพร้อมกันเกิน ~4 ปุ่มบนคีย์บอร์ดผู้บริโภค

---

## 2026-07-23 — ล้าง state ด้วย useEffect ตอนเปลี่ยนข้อ = เฉลยแดง/เขียวแวบบนข้อใหม่ 1 เฟรม

**Symptom:** ตอนโหลดคำถามข้อใหม่ (โดยเฉพาะหลัง auto-advance) เห็นตัวเลือกโดน highlight แดง/เขียวแวบๆ ทั้งที่ยังไม่ได้ตอบ

**Root cause:** MCQ เก็บ `selected` แล้วล้างด้วย `useEffect(..., [question.id])` — effect รัน**หลัง paint** → ข้อใหม่ถูกวาดเฟรมแรกด้วย selected ของข้อเก่า และ id ตัวเลือก (c1,c2,…) ซ้ำกันทุกข้อ เลย match แล้วทาสีเฉลยผิดข้อ

**Fix:** ผูก state กับเจ้าของ: `useState<{qid, id}>` แล้ว `selected = pick?.qid === question.id ? pick.id : null` — ล้างตัวเองตั้งแต่เฟรมแรกโดยไม่ต้องรอ effect. แก้ใน [MultipleChoiceTextQuestion.tsx](/components/question/MultipleChoiceTextQuestion.tsx) + [MultipleChoiceVisualQuestion.tsx](/components/question/MultipleChoiceVisualQuestion.tsx). กติกา: derived-state ที่ต้อง reset ตาม prop ให้เก็บคู่กับ key ของ prop นั้น (หรือใช้ `key=` remount) ห้าม reset ใน effect
