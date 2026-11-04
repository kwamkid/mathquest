# 📚 Learning — patterns & techniques worth remembering

> New things discovered worth keeping. Append-only via `/memo`.

<!-- toc -->
**Contents** (13)
- 2026-06-18 — Shared route templates pattern
- 2026-06-18 — Optional `iconName` registry สำหรับ migrate emoji → Lucide
- 2026-06-18 — Content bank pattern สำหรับ curriculum
- 2026-06-18 — Soft prerequisite hint แทน hard route lock
- 2026-06-18 — Synthetic curriculum adapter (reuse shared UI กับ runtime data)
- 2026-06-18 — framer-motion `Reorder` สำหรับ drag-to-reorder list
- 2026-07-10 — ตรวจงาน SVG ที่วาดเองด้วย `qlmanage` (macOS) ไม่ต้องมี browser
- 2026-07-10 — รับ keystroke ให้เวิร์กทั้งคอม + iPad (typing game)
- 2026-07-10 — Game loop แบบ pause ได้ด้วย useAnimationFrame + MotionValue
- 2026-07-10 — i18n สองชั้น: central strings + local STR dict ต่อหน้า
- 2026-06-18 — `.next` cache เสีย → `Cannot find module './XXXX.js'`
- 2026-07-23 — คำนวณข้อจำกัดเนื้อหาจาก curriculum แทนการติดป้ายมือ
- 2026-07-23 — Multi-target render ด้วย MotionValue pool ต่อ slot (ไม่ใช่ต่อ object)
<!-- /toc -->

---

## 2026-06-18 — Shared route templates pattern

แยก layout/logic ออกจาก Next route file → component ใน `components/curriculum/` route file เหลือเป็น thin wrapper ที่ resolve curriculum/topic จาก URL params

```
components/curriculum/
├── ChapterPage.tsx       — 2-col chapter detail
├── TopicListPage.tsx     — topic grid
└── LessonPlayerHost.tsx  — wrap LessonPlayer + Firestore save
```

Route files (~50 lines each) แค่:
1. Parse params
2. Resolve curriculum/topic/etc
3. Pass to template + `chapterUrl` (namespace-agnostic link prefix)

**Benefit:** `/learn` (BNC) และ `/life-math` ใช้ template เดียวกัน — รูปร่างหน้าตาเหมือนกัน 100% ปรับ layout ที่เดียว. Bundle ลด ~9 kB ต่อ route. ดู commit `61e7994`

**When to use:** เมื่อมี 2+ routes ที่แสดง entity เดียวกันแค่ namespace ต่างกัน — pattern นี้ดีกว่า `[catchAll]` route เพราะ URL ยังอ่านง่ายและ Next route grouping ยังใช้ได้

---

## 2026-06-18 — Optional `iconName` registry สำหรับ migrate emoji → Lucide

ต้อง migrate emoji icons → Lucide icons ในระบบที่มี content data 30+ จุด — แทนที่จะ rip-and-replace ทีเดียว ใช้ optional field + helper component:

```typescript
// types: เพิ่ม optional iconName คู่กับ icon เดิม
interface Topic {
  icon?: string;     // legacy emoji
  iconName?: 'percent' | 'shopping-cart' | ...;  // new
}

// <TopicIcon topic={t} /> prefers iconName, falls back to emoji, then default
```

ตั้ง `iconName` ทีละ topic ได้ → ไม่ต้อง migrate ทั้งหมดทีเดียว, ไม่ break รุ่นเก่า. ดู [TopicIcon.tsx](/components/lesson/TopicIcon.tsx)

**When to use:** registry-style mapping ที่ data layer + render layer ต่างไฟล์ ต้อง migrate แบบ rolling

---

## 2026-06-18 — Content bank pattern สำหรับ curriculum

แยก concept + question ออกจาก lesson ไป `content/{concepts,questions}.ts` แล้วทุก lesson/quiz/practice import โดย ID:

```
topics/percentages/
├── content/
│   ├── concepts.ts     ← C_whatIsPercent, C_unitaryMethod, …
│   └── questions.ts    ← E1, E2, …, M1, …, H1, …, T1, … + tag difficulty/skill
├── lessons/            ← import { E4, E5, E6 } from '../content/questions'
└── quiz/               ← import same Q's, different combo per level
```

**Benefit:** เขียนคำถามครั้งเดียว — lesson L1 ใช้ E1-E5 เป็น guided practice, final quiz L1 ใช้ E1-E10 mix กับของอื่น. แก้คำถามที่เดียว มีผลทุกที่. Tag ด้วย `difficulty: 'easy' | 'medium' | 'hard'` แล้วมี helper `byDifficulty()` ให้ quiz level ดึง subset ตามต้องการ

---

## 2026-06-18 — Soft prerequisite hint แทน hard route lock

ตอน Percentages L2 ใช้บัญญัติไตรยางศ์เป็นพื้นฐาน — แทนที่จะ lock ไม่ให้เข้า ใส่ concept block สั้นๆ ที่ต้น lesson:

```typescript
const C_unitaryHint = concept(`${SUB}-l2-hint`, 'เกริ่นนำก่อนเรียน', [
  text('บทนี้ใช้ **บัญญัติไตรยางศ์ (Unitary Method)** เป็นพื้นฐาน — ถ้ายังไม่คุ้น แนะนำให้ลองเรียนหัวข้อ **บัญญัติไตรยางศ์** ก่อน'),
  callout('tip', 'เคยเรียนบัญญัติไตรยางศ์มาแล้ว? ข้ามมาทำเลย'),
]);
```

User control: เคยเรียนแล้วก็ข้าม, ไม่เคยก็ไปเรียน prerequisite. ดีกว่า hard lock ที่บังคับ flow. ดู [l2-unitary-method.ts](/lib/curricula/life-math-beginner/topics/percentages/lessons/l2-unitary-method.ts)

---

## 2026-06-18 — Synthetic curriculum adapter (reuse shared UI กับ runtime data)

Timetable (สูตรคูณ) เป็น runtime-generated drill ไม่มี static lesson data — แต่อยากใช้ `<CurriculumTimeline>` ตัวเดียวกับ /learn, /life-math. วิธี: สร้าง **synthetic `Curriculum`** จาก config:

```typescript
// lib/timetable/curriculum.ts
buildTimetableCurriculum(): Curriculum
// topic = สูตรคูณ, แต่ละแม่ → SubTopic, แต่ละรอบ → Lesson (steps: [])
// lesson.id = roundId(table, round) → completedLessonIds ติดเข้ากันพอดี
```

`CurriculumTimeline` อ่านแค่ `lesson.id/kind/title/estimatedMinutes` — empty `steps` ก็พอ. คำถามจริง generate ตอนเล่นใน round player แยก. ดู [lib/timetable/](/lib/timetable)

**When to use:** อยากใช้ component ที่ผูกกับ data model หนึ่ง กับ data ที่มาจาก source อื่น — adapt ให้เป็น shape เดิม ดีกว่า fork component

---

## 2026-06-18 — framer-motion `Reorder` สำหรับ drag-to-reorder list

ต้องการ list ที่ลากสลับลำดับได้ (item ลอยตามนิ้ว + ตัวอื่น reflow live) ทั้ง touch+mouse — framer-motion มี `Reorder.Group` + `Reorder.Item` ให้ฟรี:

```tsx
<Reorder.Group axis="y" values={list} onReorder={setList}>
  {list.map(t => <LayerRow key={t} ... />)}   // child = Reorder.Item
</Reorder.Item value={t} dragListener={false} dragControls={controls} whileDrag={{scale:1.04}}>
```

- `dragListener={false}` + `useDragControls()` → ลากได้เฉพาะที่ handle (`controls.start(e)`) — body ยัง tap เลือกได้
- แยก hooks: ต้องทำ row เป็น child component เพราะ `useDragControls` เรียกใน map ไม่ได้
- `select-none` กัน text-selection highlight ตอนลาก
- HTML5 DnD ใช้บนมือถือไม่ได้ — `Reorder` เป็น pointer-based ใช้ได้ทั้งคู่

ดู [AvatarCustomizationTab.tsx](/components/avatar/tabs/AvatarCustomizationTab.tsx)

---

## 2026-07-10 — ตรวจงาน SVG ที่วาดเองด้วย `qlmanage` (macOS) ไม่ต้องมี browser

จะวาด SVG path ซับซ้อน (รูปมือ ฯลฯ) อย่าเขียน blind — render ดูเองได้ด้วย QuickLook CLI:

```bash
qlmanage -t -s 1120 -o <outdir> file.svg   # ได้ file.svg.png
```

แล้วเปิดภาพดู → แก้พิกัด → render ซ้ำ จนทรงถูก ค่อยย้ายพิกัดเข้า component. รอบที่วาด blind ส่งไปให้ user ดู เสียไป 2 รอบ; พอ render เองก่อน จบในรอบเดียว. ใช้กับ HandsGuide ของ typing game — ดู [HandsGuide.tsx](/components/typing/HandsGuide.tsx)

---

## 2026-07-10 — รับ keystroke ให้เวิร์กทั้งคอม + iPad (typing game)

จะอ่านคีย์พิมพ์บน iPad ห้ามใช้ `keydown` — คีย์บอร์ด OS ของ iOS ยิง keydown ไม่น่าเชื่อถือ (keyCode 229/`Unidentified`). Path เดียวที่เวิร์กทั้งสองอุปกรณ์:

1. `<input>` ซ่อนแบบ `h-px w-px opacity-0` **วางในพื้นที่ที่มองเห็น** (ห้าม `display:none` = focus ไม่ได้, ห้าม `top:-9999px` = iOS scroll หนี) + `focus({ preventScroll: true })`
2. อ่านจาก **`onBeforeInput`** (`(e.nativeEvent as InputEvent).data` เมื่อ `inputType === 'insertText'`) + `onInput` fallback ที่ consume แล้วเคลียร์ value
3. attributes กันระบบช่วยพิมพ์: `autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="off"` — และ**เทียบแบบ lowercase เสมอ** เพราะ iOS บางรุ่นดื้อ capitalize ตัวแรก
4. iOS เปิดคีย์บอร์ดจาก programmatic focus ไม่ได้ — ต้องมี **ปุ่ม "แตะเพื่อเริ่ม"** (focus ใน gesture จริง) และ overlay "แตะเพื่อเล่นต่อ" ตอน blur (ห้าม auto-refocus ด้วย timer)
5. คีย์บอร์ด OS ดันจอ → subscribe `window.visualViewport` `resize` แล้วสลับ layout compact

ดู [TypingRoundPlayer.tsx](/components/typing/TypingRoundPlayer.tsx)

---

## 2026-07-10 — Game loop แบบ pause ได้ด้วย useAnimationFrame + MotionValue

ของตกลงมาช้าๆ ที่ pause/resume ได้ (typing game meteor): อย่าใช้ framer `animate` duration ตรงๆ (pause ยาก) — ใช้ `useAnimationFrame((_, delta) => elapsed += delta)` สะสมเวลาเองเฉพาะตอนไม่ pause แล้ว `motionValue.set(progress)` → `useTransform` เป็น `top` — **ไม่มี react re-render ต่อ frame** และ pause = แค่หยุดสะสม delta. ใช้ ref guard (`shieldHitGuard`) กันเหตุการณ์ end-of-fall ยิงซ้ำ. ดู [TypingRoundPlayer.tsx](/components/typing/TypingRoundPlayer.tsx)

---

## 2026-07-10 — i18n สองชั้น: central strings + local STR dict ต่อหน้า

ระบบ TH/EN ใช้ dictionary กลาง ([lib/i18n/strings.ts](/lib/i18n/strings.ts) — `th` เป็น shape source, `en: typeof th` type บังคับครบคู่) เฉพาะ string ที่หลายหน้าแชร์ ส่วน string เฉพาะหน้าใช้ **local dict ในไฟล์นั้นเอง**: `const STR = { th: {...}, en: {...} } as const` + `const L = STR[lang]` — ข้อดี: ไฟล์กลางไม่บวม, หลาย agent/คน แก้คนละหน้าพร้อมกันไม่ conflict, string อยู่ติดที่ใช้. convention: โหมดไทยตั้งใจคงศัพท์อังกฤษ (Level/Star/Quiz/ชื่อโหมด) ให้เด็กซึม vocab

---

## 2026-06-18 — `.next` cache เสีย → `Cannot find module './XXXX.js'`

อาการ dev/build error `Cannot find module './4447.js'` หรือ `./vendor-chunks/@firebase.js` = **`.next` build cache เสีย** (มักเกิดตอนลบ route file / `.next/types` ขณะ server ถือ dir อยู่) ไม่ใช่บั๊กโค้ด

**Fix:** `rm -rf .next && npm run dev` (หรือ `npx next build`). ถ้าลบ dynamic route ต้องเคลียร์ `.next/types` ด้วย

---

## 2026-07-23 — คำนวณข้อจำกัดเนื้อหาจาก curriculum แทนการติดป้ายมือ

ประโยคใน [sentences.ts](/lib/typing/sentences.ts) ต้องใช้เฉพาะตัวอักษรที่เด็กเรียนถึงแล้ว — แทนที่จะ tag `minUnit` มือทีละประโยค (พลาดง่าย/drift ได้) ให้**คำนวณตอน module load**: สร้าง map ตัวอักษร→unit จาก `UNITS` แล้ว `minUnit = max(unit ของทุกตัวอักษร)` + regex validate โครงประโยค (ตัวที่ผิดถูก filter ทิ้งเงียบๆ ไม่ crash) → เพิ่มประโยคใหม่แค่พิมพ์ string เดียว ระบบกรองให้เองตลอดกาล. ใช้หลักเดียวกันได้ทุกที่ที่ "เนื้อหาต้อง gate ตามบทเรียน"

---

## 2026-07-23 — Multi-target render ด้วย MotionValue pool ต่อ slot (ไม่ใช่ต่อ object)

เกม typing โชว์หิน 2-4 ก้อนพร้อมกัน แต่ hook สร้างต่อก้อนไม่ได้ → สร้าง `useMotionValue` **จำนวนคงที่ต่อ slot** (`[p0,p1,p2,p3]`), render keyed ด้วย **slot index ไม่ใช่ rock id** — พอก้อนหน้าแตก engine เลื่อน array + `set()` ค่า progress ของก้อนหลังเข้า slot ใหม่ → node เดิม rerender ค่าใหม่ **ไม่ remount ไม่กระตุก** และก้อนหลังเก็บ progress ตัวเองไว้ (spawn คิดจากก้อนหลังสุด: `gap = min(0.45, 0.9/n)`). ดู [TypingRoundPlayer.tsx](/components/typing/TypingRoundPlayer.tsx) + skins
