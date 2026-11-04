# 📏 Rules & conventions

> Hard rules Claude MUST follow in this repo — "always X", "never Y".
> Newest at the bottom. Append-only via `/memo`.

<!-- toc -->
**Contents** (6)
- 2026-06-18 — Curriculum content conventions
- 2026-06-18 — Route conventions
- 2026-06-18 — UI conventions
- 2026-06-18 — Persistence conventions
- 2026-06-18 — Navigation flow
- 2026-07-11 — Dual-model workflow (Fable plan → Opus implement)
<!-- /toc -->

---

## 2026-06-18 — Curriculum content conventions

1. **Lesson titles ไม่ใส่ emoji** — ใช้ `<TopicIcon>` ที่ row-level แทน. Topic icon ตั้งผ่าน `iconName` (Lucide registry) ไม่ใช่ emoji string
2. **Bilingual titles**: ไทยก่อน อังกฤษในวงเล็บ — `"เปอร์เซ็นต์ (Percentages)"`, `"ราคาต่อ 1 หน่วย (Price per Unit)"`
3. **Sub-topic title ไม่ echo topic title** — ถ้า topic ชื่อ "เปอร์เซ็นต์" แล้ว sub-topic ก็ "เปอร์เซ็นต์" ระบบจะ collapse breadcrumb อัตโนมัติ. แต่ก็ไม่ควรตั้งชื่อ sub-topic เป็น `"เปอร์เซ็นต์ — บัญญัติไตรยางศ์"` เพราะ "บัญญัติไตรยางศ์" เป็น topic แยก
4. **Quiz title format**: `"Final Quiz · Level N (descriptor)"` — เลขจาก order, descriptor สั้น

## 2026-06-18 — Route conventions

5. **Family `skipGradePicker: true`** → family page auto-redirect ไป first playable grade. ใช้กับ family ที่ไม่มี grade level จริง (Life Math) — แต่ Life Math ตอนนี้ย้ายไป `/life-math` top-level แล้ว ไม่อยู่ใน families list
6. **Topic ที่มี 1 sub-topic** → topic page auto-redirect ไป chapter detail. ไม่ render รายการที่มี item เดียว
7. **Deprecated URLs → 404** ไม่ redirect (user เลือกแล้ว) — มี [app/not-found.tsx](/app/not-found.tsx) สำหรับ recovery

## 2026-06-18 — UI conventions

8. **`LessonFooter` ใช้ `fixed bottom-0`** ไม่ใช่ `sticky` — กัน button หายตอน content fit viewport. Main container ต้องมี `pb-32` กัน content ทับใต้ footer
9. **Active lesson row ใน list** ใช้ `learn-accent-pill` (gradient ทึบ) — ContinueCard ข้างบนเหลือแค่ "▶ เรียนต่อ" ไม่ซ้ำชื่อบท
10. **2-col layout ที่ ≥lg**: hero (left, sticky) | timeline (right) — ใช้ `grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`. Container `max-w-7xl`. ทุก chapter ใช้ pattern เดียวกันผ่าน `<ChapterPage>`

## 2026-06-18 — Persistence conventions

11. **Mini quiz step (kind='mini')** → clamp `starsAwarded = 0` ก่อน save — ไม่ให้ดาว/EXP เพราะเป็น reinforcement ไม่ใช่ assessment. ทำใน LessonPlayerHost
12. **EXP_PER_STAR = 50, SCORE_PER_STAR = 10** — export จาก `curriculum-progress.ts` ให้ UI ใช้ preview reward (ห้าม hardcode ที่อื่น)
13. **Timetable EXP ต่ำกว่าโหมดอื่น** — `EXP_PER_ROUND = 10` (+5 perfect), จ่ายครั้งเดียวต่อรอบ (no double-pay). config ใน [lib/timetable/config.ts](/lib/timetable/config.ts)
14. **เพิ่ม field ใน `UserAvatarData.currentAvatar` → ต้องอัปเดต rebuild path ทั้งหมด** — หน้า my-avatar rebuild object 2 จุด (load-init + needsSync) ถ้าไม่ carry field ใหม่มาด้วย จะหายตอน refresh (เคยเจอกับ accessoryOffsets/Layer)

## 2026-06-18 — Navigation flow

15. **back จาก profile/my-avatar/rewards → กลับหน้าแรก `/` เสมอ** (ไม่ใช่ /learn). `AppHeader variant="sub" backHref="/"`
16. **X ออกจาก player → กลับ landing ของโหมดนั้น** (lesson→/learn หรือ chapter, timetable→/timetable, quiz→reset ใน /play)
17. **AppHeader layout**: Logo (เดี่ยว ไม่มีคำว่า MathQuest) · spacer · score/EXP · SoundToggles (2 icon toggle) · UserMenu (avatar dropdown ขวาสุด). Sound เป็น inline toggle ไม่ใช่ modal. avatar+ชื่อ/shop/setting/logout รวมใน UserMenu dropdown หมด
18. **Accessory editor (my-avatar)**: แตะแถว Layer = เลือก → ลากบน preview ขยับตำแหน่ง · ลาก handle ⠿ = สลับชั้น. ปุ่ม save/cancel ลอยมุมขวาล่าง (label "บันทึก")

## 2026-07-11 — Dual-model workflow (Fable plan → Opus implement)

19. **ใช้ 2 โมเดลแบ่งเฟสงาน**: วางแผน/ออกแบบ/เขียน plan + todo อย่างละเอียด → **Claude Fable 5** · ลงมือ implement ตาม plan → **Claude Opus 4.8**
20. **Claude สลับโมเดลเองไม่ได้** (ไม่มี alias แบบ `fableplan` — มีแค่ `opusplan` ซึ่งกลับด้านไม่ได้, เช็ค docs 2026-07-11) ดังนั้น Claude ต้อง **เตือน user ให้สลับเอง** ทุกครั้ง:
    - จบ planning / plan ได้รับ approve แล้ว → เตือนให้พิมพ์ `/model opus` ก่อนเริ่ม implement
    - จะเริ่มวางแผนงานใหม่ / เข้า plan mode → เตือนให้พิมพ์ `/model fable` ก่อน
21. **ตอนเป็น Fable**: ทำ plan ให้ละเอียดพอที่ Opus ทำตามได้โดยไม่ต้องตัดสินใจ architecture เอง — ระบุไฟล์ที่แตะ, ลำดับขั้น, edge cases, เกณฑ์ว่า "เสร็จ" คืออะไร
