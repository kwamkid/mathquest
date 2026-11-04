# 🗺️ Devplan

> คิวงาน + แผนที่วางไว้แล้ว. Newest plan on top.

<!-- toc -->
**Contents** (9)
- 2026-07-12 — Typing "แผน 100 วัน" (daily mission layer) — แผนโดย Fable → Opus implement
- 💰 2026-07-23 — Typing economy rebalance (user: "13 เหรียญน้อยไป ด่านยาก+แม่นควร ~50")
- 🏎️ 2026-07-23 — เกมที่ 3 (ตัดสินแล้ว): Typing Racer รับ stage คำศัพท์
- 🍣 2026-07-23 — เกมที่ 3: Sushi Belt (user เลือกจาก Racer/Balloon/Sushi/Ninja) → ❌ แพ้ Racer หลังเห็นของจริง
- 📐 แผนละเอียด v2 (2026-07-22) — typing = 100 วัน + Freestyle (แผนโดย Fable → Opus implement)
- 2026-07-12 — Typing stage modifiers: ⏱ Timed bonus + ✌️ Multi-obstacle (แผนโดย Fable → Opus implement)
- 2026-07-12 — Typing multi-game: เพิ่ม Dino Run (แผนโดย Fable → ให้ Opus implement)
- 🔜 Next up (อื่น ๆ)
- ✅ Done
<!-- /toc -->

---

## 2026-07-12 — Typing "แผน 100 วัน" (daily mission layer) — แผนโดย Fable → Opus implement

### Concept ใหญ่
**ชั้น daily-mission ครอบ curriculum เดิม — ไม่รื้อของเก่า.** 10 units × 3 stages (30 ดาว) ยังอยู่ครบ
เป็น "ฝึกอิสระ" ส่วน "แผน 100 วัน" คือเส้นทางรายวัน: วันละ 1 ภารกิจ ไต่จากตัวอักษร → คำ → ประโยค →
สปีด. ids เดิมห้ามแตะ (rule: never renumber) — day ใช้ id ใหม่ `ty-day-{n}` ต่อท้ายใน completedLessonIds.

### ⚠️ REFINEMENT 2026-07-22 (user ยืนยันภาพใหม่ — Fable ต้อง re-plan รอบละเอียดก่อน implement)
User งงกับชื่อ unit จ๋าๆ ("แถวบนนิ้วกลาง / คำศัพท์") แล้วยืนยันภาพที่ต้องการ:
1. **100 วัน = เส้นทางหลัก "อันเดียว" ไม่ใช่ชั้นคู่ขนานเหนือ unit grid.** มันคือเนื้อหา unit เดิม
   นั่นแหละ (ไต่ทักษะทีละนิด) แต่ห่อใหม่เป็น "วันที่ 1→100". **ไม่โชว์ตาราง unit แยกอีก** —
   ชื่อนิ้ว/แถว/stage ถูกแทนด้วยเลขวันในหน้าหลัก (ระบบ unit/stage/ดาว + ids เดิมยังอยู่ใต้ฝากระโปรง
   เพื่อ progress + เนื้อหา แต่ไม่ใช่ UI พระเอกอีกต่อไป — Phase A day 1-30 = map 1:1 กับ 30 stage เดิม)
2. **จบ day 100 → โหมด Freestyle (endgame เล่นไม่รู้จบ):** พิมพ์ตามประโยคต่างๆ ทำคะแนน **WPM**
   (Words Per Minute, 1 word = 5 ตัวอักษร — แอปคำนวณ wpm ในหน้า result อยู่แล้ว) + accuracy
   ให้ไวสุด. ไม่มีดาว/วันจบ — วัดสถิติความเร็วส่วนตัว (personal best WPM)
→ ผลต่อแผนเดิม: ส่วน "ฝึกอิสระ = unit grid เดิมโชว์คู่กัน" **ยกเลิก** แทนด้วยโมเดลนี้.
  Landing ใหม่ = hero 100 วัน + dot grid + (หลังจบ 100) การ์ดเข้าโหมด Freestyle.
  Fable ต้องปรับ: โครง dayPlan (ยังใช้ interleaveMix ได้), landing (ตัด unit grid), + sec ใหม่ Freestyle mode
  (sentence source, WPM scoring UI, personal-best เก็บใน user doc, ไม่มี anti-farm เพราะไม่จ่าย EXP/coin
  หรือจ่ายน้อยแบบ replay). ⚠️ ยังต้องกันของเก่าไว้ให้คนที่เล่น unit ไปแล้ว (ดาวสะสม) ไม่หาย

---

## 💰 2026-07-23 — Typing economy rebalance (user: "13 เหรียญน้อยไป ด่านยาก+แม่นควร ~50")
ฐานไต่ตามความยาก: `dayBaseExp(day) = 10 + floor((day-1)/10)*3` (10→37) · perfect = +ครึ่งฐาน ·
timeBonus 0-5 เดิม → day 1 max 20, day 50 max 38, **day 100 perfect+time = 60** · classic route
`stageBaseExp(unit) = 10+(unit-1)*2` (u10 perfect+time = 47) · replay 3 คงเดิม (rule #13 กันปั๊ม:
จ่ายเต็ม first-clear เท่านั้น) · timetable economy แยกไฟล์ ไม่แตะ (รอบสั้นกว่า จ่ายน้อยกว่าสมเหตุผล)

---

## 🏎️ 2026-07-23 — เกมที่ 3 (ตัดสินแล้ว): Typing Racer รับ stage คำศัพท์

ลอง Sushi Belt ก่อน (user เลือก) แต่เห็นของจริงแล้ว "ดูตลก" → สร้าง Racer เทียบ → **user เคาะ Racer**.
- `gameForStage`: keys→dino, **words→racer**, combos/runs→space · GAME_SPEED racer 0.85
- Racer = รถเราไล่จี้รถคู่แข่ง (คำอยู่บนป้ายหลังคา) พิมพ์จบ = **แซง**: คันหน้าไหลถอยเบี่ยงเลนไกล
  หลุดจอซ้าย + รถเราพุ่ง (boom ส่ง `id` เพื่อให้ effect วาดรถคันเดิมสีเดิม — contract เพิ่ม field เดียว)
- Sushi Belt ยังอยู่ใน /game-test เฉยๆ (ไฟล์ standalone — จะลบเมื่อไหร่ก็ได้)
- ไฟล์: `games/RacerField.tsx` · CSS ล้วน (โฟลเดอร์ public/game/typing-racer/ ว่างรอ SVG สวยๆ)

---

## 🍣 2026-07-23 — เกมที่ 3: Sushi Belt (user เลือกจาก Racer/Balloon/Sushi/Ninja) → ❌ แพ้ Racer หลังเห็นของจริง

จานซูชิเลื่อนบนสายพานขวา→ซ้าย มีป้ายคำ พิมพ์จบ = ลูกค้า (🐼) ได้กิน (boom) ·
เลื่อนถึงลูกค้าโดยไม่พิมพ์ = soft miss (หน้าเศร้า จานผ่านไป) · multi-obstacle = หลายจานเรียงบนสายพาน
(ตรง conveyor model เป๊ะ). **Presentation-only skin** — engine ไม่แตะ:
- Mapping: progress 0→1 = x 105%→12% (ตำแหน่งลูกค้า) · แกนเดียวกับ Dino
- **Context: เกมของ "คำ"** — `gameForStage`: keys→dino, **words→sushi**, อื่นๆ→space
  (จุดเดียว ทั้ง day mode + route เดิมเปลี่ยนตาม) · GAME_SPEED sushi = 1
- Assets: CSS ล้วน (จาน ellipse + ซูชิ 3 แบบสลับตาม hash: แซลมอน/ทามาโกะ/มากิ) + emoji 🐼🥢
  — โฟลเดอร์ `public/game/sushi-belt/` เผื่อ user อยากทำ SVG สวยๆ แทนทีหลัง
- กฎ bugs.md 2026-07-23: เอฟเฟกต์ทุกตัวใช้ animation controls (ห้าม key-remount), positioning
  บน plain node
- ไฟล์: `games/SushiBeltField.tsx` (ใหม่) + config (GameId+'sushi') + player render branch +
  intro 🍣 + game-test ปุ่มที่ 3

---

## 📐 แผนละเอียด v2 (2026-07-22) — typing = 100 วัน + Freestyle (แผนโดย Fable → Opus implement)

> โมเดลใหม่: หน้า typing มี **เส้นทางเดียว** = 100 วัน (แทน unit grid) แล้วจบ 100 → **Freestyle** วัด WPM
> แทนที่แผน section "แผน 100 วัน (daily mission layer)" ด้านบน — ข้อตัดสินใจ 1-8 เดิมยังใช้
> เว้นที่ระบุใหม่ตรงนี้ · Phase 2 multi-obstacle **เสร็จแล้ว** (day 51+ ใช้ได้เลย)

### A) โครง 100 วัน — REV 2026-07-23 (user เคาะ: ยืด Phase A เป็น 1-50, ประโยคซึมเข้าตั้งแต่ day 25)
| Phase | วัน | เนื้อหา | มาจาก |
|---|---|---|---|
| A เรียนแป้น+คำ (บล็อก unit ละ 5 วัน) | 1-50 | ดู A2 — เรียนแป้น→คำเทียม→คำจริง→ผสมทบทวน→ด่านท้าทาย · **day 25+ แทรกประโยคสั้น 2-3 คำ** | stages เดิม + `words.ts` + `sentences.ts` band ต้น |
| B ประโยค | 51-70 | ประโยคเป็นเนื้อหลัก 51-60: 3-4 คำ · 61-70: 4-5 คำ + timed ทุกวัน + tracker bar · 66-70 วันคำ concurrent 2 | `sentences.ts` |
| C สปีดมาสเตอร์ | 71-90 | adaptive เปิดตลอด + เป้า WPM ไต่ 12→20 · **errorPenaltySeconds: 2 เปิดที่ 81+** | ผสม |
| D มาราธอน | 91-100 | marathon mix ทุก content kind ยาวขึ้น · **day 100 = Grand Test** ฉลองใหญ่ | ผสม |

### A2) Phase A: 1 unit = บล็อก 5 วัน (10 units × 5 = 50 พอดี) — โครงต่อบล็อก unit u:
| slot | day = (u-1)×5+slot | เนื้อหา | นับผ่านด้วย |
|---|---|---|---|
| 1 | +1 | **แป้นใหม่** — stage 1 เดิม (keys) | ⭐ ดาว s1 (ของเดิม!) |
| 2 | +2 | **คำเทียมของแป้นนี้** — stage 2 เดิม (combos "ไม่มีความหมายก็ได้" ตามที่ user บอก) | ⭐ ดาว s2 |
| 3 | +3 | **คำจริงของแป้นนี้** — stage 3 เดิม (words/runs) | ⭐ ดาว s3 |
| 4 | +4 | **ผสม+ทบทวน** — words ใหม่วันนี้ 50% + review ทุก unit ก่อน 50% (~26 rocks) | `ty-day-{n}` |
| 5 | +5 | **ด่านท้าทาย unit** — mix ทุกอย่างของ unit + เร็วขึ้นนิด (speedFactor 0.9) · **unit ≥5 (day 25,30,…,50): จบท้ายด้วยประโยค 2-3 คำ × 3 ประโยค** 🎉 | `ty-day-{n}` |
- **ทุกวัน slot 1-3 ยังมีช่วงฝึกฝนต่อท้าย** (PRACTICE_SIZE=12: 50% วันนี้ / 50% ทบทวน + interleaveMix
  30% ในช่วงเนื้อหา — กติกา 2 ช่วง/cheer/badge ตามเดิมด้านล่าง) · slot 4-5 คือวันฝึกล้วนอยู่แล้ว
- **รอยต่อช่วง:** เข้าช่วงฝึก/ช่วงประโยค → cheer "ต่อด้วยฝึกฝน! 💪" / "ลองประโยคแรก! ✨" + badge HUD
  เปลี่ยน (plain div ตามกฎ bugs.md) — ไม่มีหน้าคั่น flow เดียวรวด · ดาว/ผ่านคิด accuracy ทั้งรอบเหมือนเดิม
- **ประโยคก่อนครบ a-z ต้องกรองตัวอักษร:** sentences.ts ติดป้าย `minUnit` ต่อประโยค (= max unit
  ของคำในประโยค) — day ใช้ได้เฉพาะประโยคที่ `minUnit ≤ unit ปัจจุบัน` (unit 5 มี 11 ตัวอักษร:
  f j d k s l a g h e i → ประโยคแบบ "he did ask", "she has a leg" ทำได้จริง — คำใน words.ts
  กรองตาม unit อยู่แล้ว เอามาประกอบ)

### B) ผูกกับ progress เดิม (ไม่ migrate, ไม่เสียดาว) — อัลกอริทึม REV บล็อก 5 วัน
- **Mapping day (1-50):** `unit = ceil(n/5)`, `slot = ((n-1)%5)+1` · slot 1/2/3 = stage 1/2/3,
  slot 4/5 = วันฝึกใหม่ (ty-day)
- **doneDay(n):**
  - slot 1-3 → `stageId(unit,slot) ∈ completedLessonIds` (ดาวเดิมนับเลย!)
  - slot 4-5 → `'ty-day-'+n ∈ completedLessonIds` **หรือ unit ถัดไปมีดาว ≥1**
    (= surpass credit: คนเก่าที่เลย unit นี้ไปแล้วไม่ต้องย้อนมา grind วันฝึก 20 วัน —
    เด็กมี 24 ดาวจะโผล่แถว day ~42 ไม่ใช่โดนดันกลับไป day 4)
  - n≥51 → `'ty-day-'+n ∈ completedLessonIds`
- **currentDay = day แรกที่ !doneDay** สแกน 1→100 (derive ทุกครั้ง ไม่เก็บ field — ไม่มีทาง desync)
  · จบครบ 100 → currentDay = 101
- **Save ตอนจบ day:** slot 1-3 → ใช้ `saveTypingStage(unit,slot,…)` เดิมทั้งดุ้น (ดาว+EXP+anti-farm)
  · slot 4-5 และ n≥51 → `saveTypingDay(n)` ใหม่ (ty-day id + EXP ตาม economy เดิม:
  10+perfect5+timeBonus, replay 3) · **ทุกเคสอัปเดต streak** (ข้อ C)
- **⚠️ เปลี่ยนใหม่ (user เคาะ 2026-07-22): เล่นได้ไม่จำกัดต่อวันปฏิทิน** — จบ day N แล้ว day N+1
  เปิด**ทันที** เล่นรวดหลาย day ได้ (ยกเลิกกติกา Duolingo วันละ 1 เดิมทั้งหมด — ห้ามมี lock UI ใดๆ)
  · "100 วัน" = 100 บทเรียนเรียงลำดับ ไม่ใช่ 100 วันปฏิทิน · แรงจูงใจกลับมารายวันอยู่ที่ **streak**
  (ข้อ C) ล้วนๆ · day ที่จบแล้ว replay ได้เสมอ (จ่ายแบบ replay 3 EXP)

### C) Streak (ล็อกกติกา) — streak = วันปฏิทินที่ "มาเล่น" ไม่ใช่ตัวนับ day
- Field ใหม่ใน user doc: `typingStreak: { current: number; best: number; lastDayISO: string;
  milestonesPaid: number[] }` (⚠️ rule #14: เพิ่มใน register defaults + login rebuild path ใน auth.ts)
- อัปเดตตอน**จบ mission แรกของวันปฏิทินนั้น** (day ใหม่หรือ replay ก็นับ — มาเล่นคือมา):
  lastDayISO === เมื่อวาน → current+1; lastDayISO === วันนี้ → ไม่ทำอะไร; อื่นๆ → current = 1
  · best = max · lastDayISO = วันนี้ (วันที่ local เครื่อง 'YYYY-MM-DD')
- Milestones one-time (เช็ค milestonesPaid): current ถึง 7/30/50/100 → +15/+30/+50/+100 coins
- เล่นรวดหลาย day ในวันเดียว = streak ขยับแค่ +1 (ตามนิยามวันปฏิทิน) — day position วิ่งไปได้เรื่อยๆ

### D) Freestyle mode (endgame หลัง day 100) — สเปกล็อกแล้ว
- **ปลดล็อกเมื่อ currentDay > 100** · route `app/(game)/typing/freestyle/page.tsx`
- 1 รอบ = **5 ประโยคสุ่ม** จาก sentences.ts (คละความยาว 2-5 คำ) เล่นผ่าน TypingRoundPlayer
  (prop `freestyle`) — sentence = คิว word-rocks+space-rocks + tracker bar เหมือน Phase C
- **HUD WPM สด** (engine-level เหมือน timer pill): `hits/5/(activeMs/60000)` อัปเดตวินาทีละครั้ง
  (ห้ามทุกเฟรม) · จบรอบโชว์ WPM + accuracy ใหญ่ๆ + "สถิติของฉัน"
- **Personal best:** user doc field `typingBestWpm: number` — เขียนเมื่อ (ทำลายสถิติ && accuracy ≥ 0.85)
  กัน WPM ปลอมจากรัวมั่ว · ทำลายสถิติ = ฉลอง confetti + badge line
- Economy: จ่ายแบบ replay (3 EXP) ทุกรอบ ไม่มีดาว ไม่มี timeBonus (rule #13 กันฟาร์ม) · ไม่มี fail
- ความเร็ว fall: ใช้ meteorSeconds U8 (เร็วสุดของ curve เดิม) + adaptive mod เปิดตลอด

### E) Landing ใหม่ (`app/(game)/typing/page.tsx`) — เส้นทางเดียว
- **Hero**: "วันที่ N/100" + streak 🔥 (current/best) + การ์ดภารกิจ: ชื่อ day (label เด็กเข้าใจ เช่น
  "วันที่ 7 — แป้นใหม่ T Y + ฝึกฝน" / "วันที่ 40 — คำศัพท์จับเวลา") + ปุ่มเล่น · จบ day →
  result มีปุ่ม **"เล่นต่อ วันที่ N+1 →"** ทันที (ไม่มี lock รายวัน — เล่นรวดได้) + บรรทัดชวน
  "กลับมาพรุ่งนี้เพื่อรักษา 🔥 streak"
- **100-dot grid** 10×10: จุดเขียว=จบ (กด→replay day นั้น), จุดชมพู pulse=วันปัจจุบัน (กด→เล่น),
  เทา=ยังไม่ถึง (กดไม่ได้) · แบ่งแถบสี phase A/B/C/D จางๆ ให้เห็น arc
- **การ์ด Freestyle**: ก่อนจบ 100 = โชว์แบบล็อก 🔒 "ปลดล็อกเมื่อจบ 100 วัน" (สร้างความอยาก) ·
  หลังจบ = ปุ่มเข้าเล่น + best WPM
- **ตัด unit grid ออกทั้งหมด** — ชื่อ "นิ้วชี้/แถวบน/จับคู่" หายจาก UI หลัก · route `/typing/[unit]/[stage]`
  เดิม**คงอยู่** (คือ play surface ของ day 1-30 + ลิงก์เก่า) แต่ไม่มี UI ชี้ไปนอกจาก dot grid
- day label ใน hero/dots มาจาก `dayPlan(n).label` (TH/EN) — ภาษาเด็ก ไม่ใช้ศัพท์ครูพิมพ์ดีด

### F) เทคนิค engine (กติกาที่ Opus ห้ามตัดสินเอง)
- **Sentence = คิว rocks:** คำละก้อน + space-rock คั่น (space rock มีแล้ว) · **tracker bar** = HUD
  engine-level ใต้ header: ประโยคเต็มบรรทัดเดียว คำที่จบ = ขีดฆ่าเขียวจาง, คำปัจจุบัน = highlight,
  space แสดง "·" · เป็น plain div (กฎ bugs.md framer/translate)
- **Adaptive speed:** `adaptiveFactorRef` เริ่ม 1 · เคลียร์ rock แบบไม่มี error ในก้อนนั้น →
  `factor = max(factor × stepFactor(0.95), floorFactor(0.6))` · error/arrival → reset 1 ·
  ใช้ตอน spawn: `fallMs = meteorSeconds × roundPace × speedFactor × factor` (ก้อนที่ลอยอยู่ไม่เปลี่ยน
  ความเร็วกลางอากาศ — จุดเดียวกับที่ Phase 2 fix ไว้แล้ว) · ต้องนับ "error ในก้อนนั้น" ด้วย ref ต่อก้อน
- **speedFactor ต่อ day:** `dayPlan(n).speedFactor` (Phase B ไต่ 1.0→0.85, C 0.85, D 0.8) คูณใน
  fallMs — คนละตัวกับ adaptive (อันแรก = base ของวัน, อันหลัง = ผลงานสด)
- **WPM target (Phase C):** day 71-90 มี `wpmTarget` ไต่ 12→20 — โชว์ใน result ("ถึงเป้า/ยังไม่ถึง")
  **ไม่ใช่เงื่อนไข fail** (soft-fail เดิม) แค่ bonus บรรทัดฉลอง + จ่าย timeBonus ตามเดิม
- **errorPenaltySeconds: 2 เปิดจริง** เฉพาะ day 81+ ผ่าน dayPlan().mods (กลไกเสร็จแล้วตั้งแต่ Phase 1)
- **ช่วงฝึกฝน (A2):** `generateDayRocks` คืน `{rocks, practiceStartIndex}` — engine เช็ค
  `resolvedCount === practiceStartIndex` ครั้งแรก → ยิง cheer "ต่อด้วยฝึกฝน! 💪" + สลับ badge
  "ฝึกฝน" (state เดียว ไม่แตะ fall loop) · day 31+ / stage เดิม → practiceStartIndex = rocks.length
  (ไม่มีช่วง 2, badge ไม่โผล่)

### G) ไฟล์
| ไฟล์ | ทำอะไร |
|---|---|
| `lib/typing/days.ts` (ใหม่) | `dayPlan(n): DayPlan` {phase,label{th,en},contentKind: 'keys'\|'combos'\|'words'\|'mixReview'\|'unitChallenge'\|'sentences'\|'wpm'\|'marathon',stageRef?,mods,speedFactor,wpmTarget?,coinBase}; `generateDayRocks(n)` (slot logic ตาม A2 + ช่วงฝึกฝน); `interleaveMix` (DAY_MIX_RATIO=0.3); `practiceBlock(n)` (PRACTICE_SIZE=12, 50/50 วันนี้/ทบทวน); `DAY_MILESTONES` |
| `lib/typing/sentences.ts` (ใหม่) | ~150 ประโยคเด็ก lowercase ไร้ punctuation, คำจาก words.ts ≥80%, **ทุกประโยคติดป้าย `minUnit`** (max unit ของคำ) + จัดกลุ่มยาว 2/3/4/5 คำ — ต้องมี band `minUnit ≤ 5..10` อย่างละ ≥8 ประโยคสำหรับ day 25-50 |
| `lib/typing/progress.ts` | `doneDay/currentDay/getTypingDayState`, `saveTypingDay` (รวม streak+milestones), `saveFreestyleBest` |
| `TypingRoundPlayer.tsx` | props `day?: number` / `freestyle?: boolean` — เลือก rocks/save path/tracker/WPM HUD ตามโหมด |
| `app/(game)/typing/day/[n]/page.tsx` + `freestyle/page.tsx` (ใหม่) | routes |
| `types/index.ts` + `lib/firebase/auth.ts` | `typingStreak`, `typingBestWpm` (⚠️ rule #14: register defaults + login rebuild) |
| `app/(game)/typing/page.tsx` | landing ใหม่ตาม E |
| `lib/i18n/strings.ts` | ~18 keys (dayTitle, missionToday, doneToday, streakLabel, dotLocked, freestyleLocked, wpmBest, newRecord, …) TH/EN |

### H) ลำดับ implement (Opus — ทีละ increment, จบแต่ละอันต้อง tsc+lint+เล่นได้; ห้าม next build ตอน dev รัน)
1. days.ts (บล็อก 5 วัน: slot 1-5 + practiceBlock + interleaveMix) + doneDay/currentDay
   (รวม surpass credit) + route day/[n] + saveTypingDay+streak+milestones +
   **landing ใหม่ (ตัด unit grid, ไม่มี lock รายวัน)** + i18n
   → เล่น day 1-24 ได้จริง, เล่นรวดหลาย day ได้, คนมีดาวเดิมเด้ง frontier ถูก (~day 42 สำหรับ 24 ดาว)
2. sentences.ts (ติด minUnit) + sentence-rock queue + **tracker bar** → day 25-50 ครบ
   (ด่านท้าทาย unit 5+ จบท้ายด้วยประโยค)
3. Phase B (51-70): ประโยคเนื้อหลัก + timed ทุกวัน + 66-70 concurrent 2
4. Phase C (71-90): wpmTarget ไต่ + errorPenalty เปิด 81+ · Phase D (91-100):
   marathon + day-100 celebration
   ⚠️ adaptive speed **ship แล้ว 2026-07-23 แบบ combo-driven ทั้งเกม** (user เสนอ — ดีกว่าแผนเดิม):
   `comboPace()` ใน config — ทุก combo 5 เร็วขึ้น 5% cap 25% (floor 0.75), พลาด = combo รีเซ็ต =
   ความเร็วคลายเอง, ป้าย 🔥×N ขึ้น ⚡ ตอน boost ทำงาน · Phase C อาจแค่กด floor ลึกขึ้น (0.6) ผ่าน mods
5. **Freestyle**: route + WPM HUD สด + typingBestWpm + การ์ด landing + confetti ทำลายสถิติ
6. QA เต็ม: คนเก่า (24 ดาว→~day 42, surpass credit ทำงาน), คนใหม่ (day 1), ขาดวัน (streak reset,
   day ค้าง), replay day (ไม่แตะ streak), day 25 ประโยคแรก filter ตัวอักษรถูก, mock วันปฏิทิน
   (แก้ lastDayISO ใน Firestore dev), tsc+lint+build

### I) การตัดสินใจที่ล็อกแล้ว (จาก 3 ข้อเปิด — ตัดสินตามที่ user คุยไว้)
1. **currentDay เด้งจากดาวเดิม** ✅ (24 ดาว ≈ day 25 — ไม่บังคับเล่นซ้ำ)
2. **Freestyle ปลดหลังจบ day 100** ✅ ("ที่เหลือถ้าจบแล้ว จะเป็นบท freestyle" — คำ user เอง)
   แต่การ์ดล็อกโชว์ตั้งแต่แรกให้เห็นเป้า
3. **unit grid ตัดจาก UI, route เดิมคงไว้** ✅ (dot grid ทำหน้าที่ replay แทน — ดาวสะสมไม่หายเพราะ
   doneDay อ่านจากดาวโดยตรง)

### การตัดสินใจดีไซน์ (ตัดสินแล้ว — Opus ห้ามเปลี่ยน)
1. **Day position ≠ Streak.** Day N = ตำแหน่งเนื้อหา **ไม่มีวันรีเซ็ต** (ขาดกี่วันก็กลับมาทำ day เดิมต่อ).
   Streak 🔥 = ตัวนับวันติดต่อกัน (แรงจูงใจ) — ขาดวัน streak รีเซ็ตแต่ best เก็บไว้ + มี milestone
   โบนัส. เหตุผล: บังคับเนื้อหารีเซ็ตตอนขาดวัน = โหดเกินสำหรับเด็ก, แต่ "100 วันติดต่อกัน" ยังมีความหมาย
   ผ่าน streak
2. **วันละ 1 day เท่านั้น** (Duolingo-style): จบ day N แล้ว day N+1 เปิด**วันปฏิทินถัดไป** — pacing คือ
   หัวใจของแผน 100 วัน เด็กอยากเล่นเพิ่ม → ฝึกอิสระ (unit grid เดิม) เปิดตลอด
3. **ประโยค = คิวของ word-rocks + space-rocks** ไม่ใช่ rock ยาวก้อนเดียว — engine ไม่ต้องแตะเลย
   (space rock มีอยู่แล้ว!) เพิ่มแค่ "sentence tracker bar" (HUD บรรทัดเดียว โชว์ทั้งประโยค + คำที่ถึงคิว
   ไฮไลต์). ประโยคโผล่หลัง day 55 = เรียน a-z ครบแล้ว → ไม่ต้อง filter ตัวอักษร, lowercase ไม่มี
   เครื่องหมายวรรคตอน (ข้อจำกัด iPad เดิม)
4. **Adaptive speed** (ตามที่ user ขอ "พิมพ์ถูก+ไว → เร็วขึ้นเรื่อยๆ"): เพิ่มใน `StageMods`:
   `adaptive?: { stepFactor: 0.95, floorFactor: 0.6 }` — เคลียร์ rock โดยไม่มี error → เวลา rock ถัดไป
   ×0.95 (ทบไปเรื่อยๆ ถึง floor 0.6×), มี error → รีเซ็ตกลับ base ของวันนั้น. ซ้อนกับ roundPace เดิมได้
5. **Coins เร็ว = ได้เยอะ**: timed bonus (มีแล้ว 0-5) ใช้ทุก day ตั้งแต่ Phase B + **streak milestones**
   one-time: วัน 7=+15, 30=+30, 50=+50, 100=+100 เหรียญ (one-time ไม่ขัด rule #13 anti-farm)
6. **errorPenaltySeconds เปิดใช้จริงครั้งแรกใน Phase D** (day 81+) — โหดขึ้นตอนเด็กพร้อมแล้ว
7. **Landing**: hero การ์ด "วันที่ N/100" + streak 🔥 + ภารกิจวันนี้ (แทน banner เล่นต่อเดิม) +
   **100-dot grid** (10×10 จุดความคืบหน้า — เห็นภาพรวมทั้งแผน) · unit grid เดิมอยู่ใต้หัวข้อ "ฝึกอิสระ"
8. **ทุก day = mixed session ไม่ใช่ drill ล้วน** (user สั่ง: "ฝึก alphabet ก็อยากให้มี word คำน้อยๆ
   สลับไปด้วย ไม่งั้นไม่สนุก"). Phase A day ไม่ใช่ replay stage เพียวๆ — คิว rock ของวัน =
   **core content ของ stage นั้นครบชุด** (เพื่อให้ยังนับดาว stage ได้ตามข้อ A) + **แทรก word/review
   rocks ~30%** ทุกๆ 3-4 ก้อน: คำสั้น ≤4 ตัวจาก pool สะสม (words.ts จัดตาม unit อยู่แล้ว —
   ทุก unit มีคำที่ใช้เฉพาะแป้นที่เรียนถึง ดังนั้น day 1 ก็มีคำแทรกได้เลย เช่น fff jjj → คำ unit 1)
   + ตัวอักษร review จาก unit ก่อนๆ. วัน stage-3 (words อยู่แล้ว) แทรกเป็นคำ review จาก unit เก่า
   (spaced repetition) แทน. สัดส่วนเป็น constant `DAY_MIX_RATIO = 0.3` ใน days.ts

### โครง 100 วัน (สร้าง runtime จาก dayPlan(n) — ห้าม hand-type 100 แถว)
| Phase | Days | เนื้อหา | เกม | Mods |
|---|---|---|---|---|
| **A รู้จักแป้น+คำสั้น** | 1-30 | day n = **mixed round** อิง stage ลำดับที่ n (u1s1→u10s3): core rocks ของ stage นั้นครบ + แทรกคำสั้น/review ~30% ตามข้อ 8 — จบ day = เคลียร์ stage นั้น (ดาวเข้าระบบเดิมด้วย!) | ตาม stage เดิม | ตาม stageMods เดิม |
| **B คำศัพท์** | 31-55 | word rounds จาก pool สะสม: 31-40 คำสั้น (unit คู่ที่เกี่ยว), 41-50 คำยาว+mix ทุก unit, 51-55 mix + x2 obstacles | สลับ dino(คำ≤3 ตัว)/space | timed ทุกวัน + speedFactor ไต่ 1.0→0.85; 51-55 maxConcurrent 2 |
| **C ประโยค** | 56-80 | sentence rounds: 56-65 ประโยค 2-3 คำ ×6, 66-75 ประโยค 3-4 คำ ×6, 76-80 ประโยค 4-5 คำ ×5 | space (มี tracker bar) | timed + adaptive เปิดครั้งแรก day 66 |
| **D สปีดมาสเตอร์** | 81-100 | 81-90 WPM-target days (คำ+ประโยคสลับ เป้า WPM ต่อวันไต่ 12→20), 91-99 marathon mix (ทุก content kind), **day 100 = Grand Test** (ประโยค marathon + timed + adaptive, ฉลองใหญ่) | สลับ | timed + adaptive + **errorPenaltySeconds: 2** |

### ไฟล์ใหม่/แก้
| ไฟล์ | ทำอะไร |
|---|---|
| `lib/typing/days.ts` (ใหม่) | `dayPlan(n): DayPlan` — {phase, label TH/EN, contentKind: 'stage-mix'\|'words'\|'sentences'\|'wpm'\|'marathon', stageRef?, wordOpts?, sentenceOpts?, mods: StageMods, speedFactor, coinBase}; `generateDayRocks(n)` (reuse generateStageRocks/wordsFor/sentence gen — Phase A: core stage rocks + `interleaveMix()` แทรกคำ/review ตาม `DAY_MIX_RATIO = 0.3` ทุก 3-4 ก้อน, คำ ≤4 ตัวจาก pool สะสมถึง unit ปัจจุบัน); `DAY_MILESTONES` |
| `lib/typing/sentences.ts` (ใหม่) | คลัง ~100 ประโยคเด็ก lowercase ไม่มี punctuation ประกอบจากคำใน words.ts เป็นหลัก (เช่น 'the red fox runs', 'i can see a star') จัดกลุ่มตามความยาว 2/3/4/5 คำ — Opus เขียนเองได้ ยึดคำจาก words.ts ≥80% |
| `lib/typing/progress.ts` | `saveTypingDay(n, …)` → เขียน `ty-day-{n}` + coins (base+timeBonus) + streak update; `getTypingDayState(user)` → {currentDay, doneToday, streak {current,best,lastDayISO}, milestonesPaid[]}; streak เก็บใน user doc field `typingStreak` (สร้าง type ใน types/) — ⚠️ rule #14: เพิ่ม field user ต้องเช็ค rebuild paths |
| `lib/typing/config.ts` | ขยาย `StageMods`: `adaptive?: {stepFactor; floorFactor}`, `speedFactor?: number` |
| `TypingRoundPlayer.tsx` | รับ optional `day?: number` prop (day mode: ใช้ generateDayRocks + saveTypingDay แทน; sentence tracker bar; adaptive speed ใน fall loop — คูณ fallMsRef ด้วย adaptiveFactorRef) |
| `app/(game)/typing/day/[n]/page.tsx` (ใหม่) | route เล่น day mission |
| `app/(game)/typing/page.tsx` | hero 100 วัน + dot grid + mission card วันนี้; unit grid → หัวข้อ "ฝึกอิสระ" |
| `lib/i18n/strings.ts` | ~12 keys ใหม่ (dayTitle, streakLabel, missionToday, dayLocked-มาพรุ่งนี้, milestone ฯลฯ TH/EN) |

### ลำดับ implement (Opus — ทีละ increment, จบแต่ละอันต้อง tsc+เล่นได้จริง)
0. **Phase 2 multi-obstacle ก่อน** (แผนเดิมใน section ล่าง — เป็น prerequisite ของ day 51-55/91+)
1. days.ts + dayPlan Phase A mapping **+ interleaveMix (word/review แทรก 30%)** + route
   /typing/day/[n] + saveTypingDay/streak + landing hero
   (core content ใช้ stage เดิม + คำจาก words.ts เดิม → ไม่ต้องเขียนเนื้อหาใหม่ ทดสอบ loop วัน/streak ได้เลย)
2. Phase B: word-day generator + speedFactor + timed ทุกวัน
3. Phase C: sentences.ts + sentence rocks + tracker bar
4. Adaptive speed ใน engine + Phase D (WPM target แสดงใน result, errorPenalty เปิด)
5. Milestones + ฉลอง day 100 + QA เต็ม (วันปฏิทินเปลี่ยน = mock ด้วยการแก้ lastDayISO ใน dev)
⚠️ ทุก UI node ใหม่เช็คกฎ framer/translate ใน bugs.md

---

## 2026-07-12 — Typing stage modifiers: ⏱ Timed bonus + ✌️ Multi-obstacle (แผนโดย Fable → Opus implement)

### เป้าหมาย
2 mechanic ใหม่แบบ **opt-in ต่อ stage ผ่าน config กลาง** (user ขอ "ทำเป็น prop รองรับอนาคต"):
1. **Timed stage** — จับเวลา เอาเวลาที่เหลือไปคิดโบนัส
2. **Multi-obstacle** — obstacle ออกมา 2 อันพร้อมกัน (ซ้อนจังหวะ)

### การตัดสินใจดีไซน์ (ตัดสินแล้ว — Opus ห้ามเปลี่ยนเอง)
1. **Timer = โบนัส ไม่ใช่ fail.** หมดเวลา → เกม**ไม่จบ** เด็กเล่นต่อจนครบทุกก้อน แค่ไม่ได้โบนัส
   (คงปรัชญา soft-fail + must-correct: accuracy ≥85% ตัดสินผ่านเหมือนเดิม ไม่เพิ่มความกดดันให้เด็กเล็ก)
2. **Multi-obstacle = "conveyor" model ไม่ใช่ ZType.** เป้า active มีตัวเดียวเสมอ = ก้อนหน้าสุด
   (ใกล้ผู้เล่นสุด) — พิมพ์ได้เฉพาะก้อนหน้า ก้อนหลังโผล่มาเป็น "ภัยที่มองเห็น" (dimmed) สร้างความตื่นเต้น
   แต่ไม่สร้างความกำกวมว่าพิมพ์ใส่ก้อนไหน. เหตุผล: must-correct ต้องมี expectedChar เดียว,
   ZType-style targeting ทำเด็กงง (f กับ j โผล่คู่กัน กด j = error หรือสลับเป้า?) + engine รื้อน้อยกว่ามาก
3. **Rollout v1** (แก้ทีหลังได้ที่ฟังก์ชันเดียว): Timed → stage 3 ของ unit 4-10 (words) ·
   Concurrent 2 → stage 2 ของ unit 6-10 (combos, เด็กมือถึงแล้ว) · stage 1 = เดี่ยวเสมอ (กำลังหัดแป้นใหม่) ·
   unit 1-3 ไม่มี mod เลย (เด็กเริ่มต้น) · **ห้าม stack 2 mods บน stage เดียวใน v1**
4. **Economy guard (rule #13 — EXP ต่ำกันปั๊ม):** time bonus = `floor(remaining/limit × 5)` = **0-5 EXP,
   first-clear เท่านั้น** (สเกลเดียวกับ perfect bonus). replay ไม่มี time bonus. score/ดาว ไม่แตะ
5. **Timer พักอัตโนมัติ** ตอน paused/wrongLang — ฟรี เพราะใช้ `activeMsRef` ที่ increment ใน guard เดิมอยู่แล้ว
6. **Error penalty (เผื่ออนาคต — v1 ยังไม่เปิดใช้ที่ stage ไหน):** `errorPenaltySeconds` — พิมพ์ผิดหัก
   เวลาที่เหลือ N วิ. กติกา: (a) หักเฉพาะ error ที่ถูกนับจริง (branch เดียวกับ `setErrors` — ผ่าน
   wrong-repeat guard 120ms แล้ว ไม่โดนซ้ำจาก key-repeat) (b) wrongLang ไม่ใช่ error → ไม่หัก
   (c) หักได้แค่ถึง 0 — กินแต่โบนัส **ไม่ทำให้รอบ fail** (soft-fail คงเดิม) (d) implement กลไก+
   visual ให้ครบตั้งแต่ v1 (gated ด้วย config) แค่ไม่ enable ใน rollout — เปิดทีหลังคือแก้ `stageMods()` บรรทัดเดียว

### สถาปัตยกรรม prop (อนาคต-proof)
```ts
// lib/typing/config.ts
export interface StageMods {
  timed?: {
    secondsPerChar: number;      // limit = ceil(totalKeystrokes × secondsPerChar)
    bonusExpMax: number;
    errorPenaltySeconds?: number; // พิมพ์ผิด 1 ครั้ง = หักเวลาที่เหลือ N วิ (undefined = ปิด)
  };
  maxConcurrent?: number; // default 1; v1 ใช้ 2; contract รองรับ N
}
export function stageMods(unit: number, stage: number): StageMods {
  // rollout ตามข้อ 3 — จุดเดียวที่แก้เมื่อเปลี่ยน mapping/เพิ่ม mod ใหม่
}
export const TIMED_SECONDS_PER_CHAR = 2.5; // 12 words ≈ 48 keys ≈ 120s — generous
export const EXP_TIME_BONUS_MAX = 5;
```
**GameFieldProps เปลี่ยน contract** จาก single rock → array (นี่คือ "prop รองรับอนาคต" ตัวจริง):
```ts
export interface LiveTarget {
  rock: Rock;
  charIndex: number;              // มีความหมายเฉพาะ active (ตัวอื่น = 0)
  progress: MotionValue<number>;  // 0..1 ของก้อนนั้นเอง
  x: number;                      // คอลัมน์ (จาก rockXs เดิม)
  active: boolean;                // true เฉพาะ index 0 (ก้อนหน้าสุด)
}
// ใน GameFieldProps: แทน rock/charIndex/progress/rockX เดี่ยว ด้วย
targets: LiveTarget[];            // [0] = active เสมอ; length 1 เมื่อ maxConcurrent=1
```
ticks (shake/laser/boom/arrival) คงเดิม — ใช้กับ active target เท่านั้น

### Engine changes (TypingRoundPlayer)
- **Live-rock set แทน single timer:** `liveRocks: {index, spawnedAtMs}[]` — progress_i =
  `(activeMs - spawnedAt_i) / fallMs_i` คำนวณใน `useAnimationFrame` เดิม (MotionValue ต่อก้อน, สร้างไว้ 2 ตัว fix)
- **Spawn rule:** ก้อนถัดไป spawn เมื่อก้อนหน้า progress ≥ **0.45** (SPAWN_GAP) และยังมีก้อนเหลือ
  และ liveRocks.length < maxConcurrent
- **ก้อนหลังไม่ reset ตอนก้อนหน้าแตก/พลาด** — เก็บ progress ต่อ (นี่แหละความรู้สึก "ต่อเนื่องพร้อมกัน")
- **Arrival (p=1) เช็คเฉพาะก้อนหน้า** (gap 0.45 การันตีก้อนหลังยังไม่ถึงตอนก้อนหน้า arrive)
- **roundPace** คิดต่อก้อนตอน spawn (ramp เดิมใช้ได้)
- **Timed HUD:** state `timeLeftSec` อัปเดตเฉพาะวินาทีเปลี่ยน (ห้าม setState ทุกเฟรม) —
  pill ⏱ กลางบน field (engine-level เหมือน combo badge ไม่ใช่ใน skin), เหลือง <10s, "หมดเวลาโบนัส" ที่ 0
- **Error penalty wiring:** `penaltyMsRef` accumulator — บวกใน branch พิมพ์ผิดของ `processChar`
  (หลัง repeat-guard, เฉพาะเมื่อ `mods.timed?.errorPenaltySeconds` มีค่า). remaining =
  `limit − activeMs − penaltyMs` clamp ≥ 0. Visual ตอนโดนหัก: pill ⏱ แฟลชแดง + ตัวเลข "−Ns"
  ลอยขึ้นจาง ๆ (0.5s) — node ใหม่เช็คกฎ framer/translate ใน bugs.md ด้วย
- **saveTypingStage:** เพิ่ม optional `bonusExp?: number` — บวกเข้า expGained เฉพาะ firstClear
- **Result screen:** บรรทัด "⏱ โบนัสเวลา +N" (เฉพาะ timed + firstClear + N>0) + เวลาที่เหลือ

### Skin changes (ทั้ง 2 เกม migrate เป็น targets[])
- **ก้อน active:** render เหมือนปัจจุบันทุกอย่าง (charIndex highlight, shake, ยิงใส่)
- **ก้อน trailing:** `opacity-60`, ไม่มี current-char glow (charIndex=0, RockText แสดงข้อความเฉย ๆ),
  ไม่รับ shake/boom — Dino: ก้อนหินลูกที่ 2 กลิ้งตามบนพื้น (ธรรมชาติมาก) · Space: อุกกาบาตลูกที่ 2
  สูงกว่าในคอลัมน์ของตัวเอง
- **DinoRunField bullet/explosion:** เล็ง targets[0].progress (แทน progress เดี่ยว) — lastObstacleX
  tracking ย้ายไปอ่านจาก active target
- **Intro badges:** บรรทัดเสริมใต้ hint เมื่อ stage มี mod: "⏱ พิมพ์ให้ทันเวลา รับโบนัส!" /
  "✌️ หินมา 2 ก้อนติด!" — i18n ใหม่ใน strings.ts (TH/EN): `timedIntro, multiIntro, timeBonus(n), timeLeft(s), timeBonusOver`
- ⚠️ ทุก node ใหม่เช็คกฎ bugs.md 2026-07-12 (framer ทับ translate) ก่อนเขียน

### ลำดับ implement (ตรวจได้ทุกขั้น — Phase 1 จบก่อนค่อยเริ่ม 2)
**Phase 1 — Timed (engine-local, ไม่แตะ contract):**
1. config: `StageMods` + `stageMods()` + constants + i18n strings
2. engine: countdown (จาก activeMsRef) + HUD pill + bonus คำนวณตอนจบ + `bonusExp` ใน saveTypingStage
3. result screen + intro badge · QA: /typing/4/3 (timed) vs /typing/1/1 (ไม่มี timer โผล่)
**Phase 2 — Multi-obstacle (contract refactor):**
4. types.ts: `LiveTarget` + `targets[]`; engine สร้าง array (maxConcurrent=1 ทุก stage ก่อน) →
   ทั้ง 2 skin migrate → **พฤติกรรมต้องเหมือนเดิม 100%** (นี่คือขั้น zero-behavior-change)
5. engine: spawn/advance logic concurrent + เปิด stage 2 U6-10 ผ่าน stageMods
6. skins: render trailing target (dimmed) ทั้ง 2 เกม
7. QA: /typing/6/2 (คู่), pause/resume กลางคู่, wrongLang กลางคู่, ก้อนหน้า miss ตอนก้อนหลังตาม,
   ก้อนสุดท้ายไม่มี follower, restart เคลียร์ live set, tsc + lint + **production build**

---

## 2026-07-12 — Typing multi-game: เพิ่ม Dino Run (แผนโดย Fable → ให้ Opus implement)

### เป้าหมาย
เพิ่มความหลากหลาย/ตื่นเต้นให้โหมด Typing โดยมีหลายเกมสลับกันตามชนิด stage
— **v1 = 2 เกม**: Space Defense (เดิม) + **Dino Run** (ใหม่) — สถาปัตยกรรมเปิดให้เพิ่มเกมที่ 3-4 ทีหลังได้โดยไม่ rework.

### หลักการใหญ่ (ตัดสินใจแล้ว — Opus ไม่ต้องเลือกเอง)
1. **แยก "game skin" ออกจาก engine.** `TypingRoundPlayer.tsx` เก็บ state/logic ทั้งหมดไว้เหมือนเดิม
   (hidden-input keystroke path, must-correct, combo/accuracy, fall loop, pause/wrongLang overlay,
   HUD, result screen, save progress) — เกมแต่ละตัวเป็น **component แสดงผลล้วน ๆ** ที่รับ props ชุดเดียวกัน.
2. **Timing model ใช้ร่วมกัน**: ตัวจับเวลาเดิม (`meteorSeconds` → progress MotionValue 0..1,
   p=1 = soft miss) ตีความใหม่เป็น "ระยะที่ภัยเข้าใกล้ตัวผู้เล่น" — Space map p→top (ตกลงมา),
   Dino map p→x (วิ่งเข้ามาจากขวา). engine ไม่เปลี่ยนสักบรรทัดในส่วนนี้.
3. **เกมถูกกำหนดโดย stage kind อัตโนมัติ** (ไม่ให้เด็กเลือกใน v1 — เรียบง่าย + ได้ variety ในตัว):
   - stage 1 (`keys`, ทีละ 1 ตัว + space) → **dino**
   - stage 2 (`combos`) / stage 3 (`runs`/`words`) → **space**
   - ฟังก์ชันกลาง `gameForStage()` จุดเดียว → อนาคตเปลี่ยน mapping/เพิ่ม picker ได้ง่าย.
4. **Progression/economy ห้ามแตะ**: stage ids `ty-en-{unit}-s{stage}`, PASSING_ACCURACY, EXP,
   saveTypingStage, result screen — เหมือนเดิมทุกอย่าง (rule #13 + "never renumber").

### ไฟล์ที่แตะ
| ไฟล์ | ทำอะไร |
|---|---|
| `lib/typing/config.ts` | เพิ่ม `export type GameId = 'space' \| 'dino'` + `gameForStage(unit, stage): GameId` (= kind==='keys' ? 'dino' : 'space'). แก้ข้อความ stage-1 ใน `stageMeta` เป็นธีมไดโน: TH `'ช่วยไดโนกระโดดข้ามหิน — วางนิ้วตามสีบนแป้น!'` EN `'Help Dino jump the rocks — match your fingers to the key colors!'` |
| `components/typing/RockText.tsx` (ใหม่) | ย้าย `RockText` ออกจาก TypingRoundPlayer เป็นไฟล์แชร์ (ทั้ง 2 เกมใช้) |
| `components/typing/games/types.ts` (ใหม่) | `interface GameFieldProps` (สัญญากลาง — ดูด้านล่าง) |
| `components/typing/games/SpaceDefenseField.tsx` (ใหม่) | **ย้าย** JSX เดิม: meteor pill, laser flash, explosion particles, shield line, spaceship (`ROCK_TRAVEL_PCT` ย้ายมาอยู่นี่ — มันเป็นเรื่องของ skin) |
| `components/typing/games/DinoRunField.tsx` (ใหม่) | เกมใหม่ (สเปกด้านล่าง) |
| `components/typing/TypingRoundPlayer.tsx` | เลือก skin จาก `gameForStage()`, render ในพื้นที่ field เดิม; intro icon สลับตามเกม (space=Rocket เดิม, dino=🦖). state เดิมทั้งหมดคงชื่อเดิม |

### GameFieldProps (สัญญากลาง — skin รับอย่างเดียว ห้ามมี state เกม)
```ts
interface GameFieldProps {
  rock: Rock | undefined;          // เป้าปัจจุบัน
  charIndex: number;               // พิมพ์ถึงตัวที่เท่าไร
  progress: MotionValue<number>;   // 0..1 ภัยเข้าใกล้ (จาก fall loop เดิม)
  rockX: number;                   // ตำแหน่ง % ที่ clamp แล้ว (space ใช้; dino ไม่ใช้ก็ได้)
  paused: boolean;
  shakeTick: number;               // พิมพ์ผิด → สั่นเป้า
  laserTick: number;               // พิมพ์ถูก 1 ตัว → เอฟเฟกต์ยิง/เตรียมกระโดด
  boom: { x: number; tick: number } | null; // เป้าแตก → ระเบิด/กระโดดข้ามสำเร็จ
  arrivalTick: number;             // เป้าถึงตัวผู้เล่น (soft miss) — คือ shieldFlash เดิม
  spaceLabel: string;              // t.typing.spaceKey (pill "เว้นวรรค (Space)")
}
```
HUD ที่เป็นกลาง (combo badge, avatar cheerleader + cheer bubble, overlay pause/wrongLang,
hidden input) **อยู่ใน engine** ไม่ย้ายเข้า skin — ใช้ร่วมทุกเกม.

### สเปก Dino Run (v1)
- **ฉาก**: พื้น (ground line) แนวนอนใกล้ล่างของ field — ทำด้วย CSS gradient ล้วน ไม่มี asset ใหม่.
  ตัววิ่ง = อีโมจิ 🦖 (scale ~3-4rem, ยืนที่ `left:18%` บนพื้น) — v1 ไม่ทำ asset/avatar custom.
- **Obstacle** = rock pill เดิม (RockText ใน pill สไตล์เดียวกับ space) วางบนพื้น
  เลื่อนจากขวา→ซ้าย: map `p` → `left = 105% → 18%` (`useTransform(progress, v => \`${105 - v*87}%\`)`).
- **พิมพ์ถูกครบ (boom)**: dino กระโดด — framer keyframes `y:[0,-70,0]` + `rotate:[0,-8,0]`
  duration ~0.5s, obstacle ระเบิดเป็น particles (ลอกโครง explosion เดิมมาปรับให้อยู่ระดับพื้น).
- **พิมพ์ผิด (shakeTick)**: pill สั่น (โครงเดียวกับ space).
- **Soft miss (arrivalTick)**: dino สะดุด (rotate -18°, dip ลง แล้วเด้งกลับ ~0.4s) + pill fade ผ่านหลังไป
  — economy เดิม: +1 error, ไม่มี game over.
- **Space rock (`text === ' '`)**: pill กว้าง "เว้นวรรค (Space)" เหมือนเดิม — กระโดดเหมือนกัน.
- ความเร็วใช้ `meteorSeconds` เดิม (13.5s→10s) — ยังไม่เพิ่ม tuning constant จนกว่าจะเล่นจริงแล้วรู้สึกช้า/เร็ว.

### ⚠️ Gotcha ที่รู้แล้ว (เพิ่งเจอวันนี้ — อย่าทำซ้ำ)
**ห้ามใส่ Tailwind `-translate-x-1/2` (centering) บน node เดียวกับที่ framer-motion จะ animate transform**
(shake `x:[...]`, jump `y:[...]`) — framer เขียน `transform` ทับแล้ว centering หาย ทำให้ pill หลุดจอ.
โครงที่ถูก: **outer div ถือ position + centering (ไม่มี animation), inner div ถือ animation อย่างเดียว.**
(บั๊กนี้เพิ่งแก้ใน meteor ของ space — DinoRunField ต้องเกิดมาถูกตั้งแต่แรก)

### ลำดับ implement (ทีละขั้น ตรวจได้ทุกขั้น)
1. **Extract แบบ zero-behavior-change**: สร้าง `RockText.tsx`, `games/types.ts`,
   `games/SpaceDefenseField.tsx` (ย้าย JSX เดิมทั้งก้อน) → TypingRoundPlayer render ผ่าน props ใหม่
   → `tsc` ผ่าน + เล่น space เหมือนเดิมทุกอย่าง.
2. เพิ่ม `GameId`/`gameForStage` ใน config + engine เลือก skin (ยังมีแต่ space → พฤติกรรมยังเหมือนเดิม).
3. สร้าง `DinoRunField.tsx` ตามสเปกบน.
4. Wire stage 1 → dino + แก้ stageMeta stage-1 (TH/EN) + intro icon 🦖.
5. (แถม ถ้าไหว) stage picker แสดง 🦖/🚀 หน้าชื่อ stage — อ่าน `gameForStage()`.
6. QA: desktop + iPad (beforeinput path), pause/resume, wrongLang overlay บนทั้ง 2 เกม,
   pill ไม่หลุดขอบทั้ง 2 เกม, replay ได้ EXP_PER_REPLAY, `tsc` + เล่นจบ 1 stage จริงทั้ง 2 เกม.

### Backlog เกมถัดไป (ยังไม่ทำ — สถาปัตยกรรมนี้รองรับแล้ว)
- **Typing Racer** 🏎️ — พิมพ์คำเร่งรถแข่งกับคู่แข่ง bot → เหมาะ stage 3 words (ฝึก WPM)
- **Balloon Pop** 🎈 — ลูกโป่งลอยขึ้น (กลับทิศ space) → สลับกับ space ใน combos กัน monotony
- **Challenge mode (multi-target streaming)** — obstacle หลายก้อนบนจอพร้อมกันแบบ ZType (user เสนอ 2026-07-12 "เด้งออกมาต่อๆ กัน") — **ตัดสินใจ: ยังไม่ทำใน learning stages** เพราะขัด must-correct pedagogy (เป้าเดียว/โฟกัสนิ้ว) + ต้องรื้อ engine เป็น multi-rock state; ถ้าทำให้เป็นโหมดพิเศษแยกหลังเคลียร์ curriculum. ส่วน "เพิ่มความไว" ทำแล้ว → `roundPace()` ramp 1→0.7 ในรอบ (2026-07-12)

---

## 🔜 Next up (อื่น ๆ)
- เปลี่ยนชื่อแอปจาก MathQuest (ตัวเลือกโดเมนที่เช็คว่างแล้ว: ManabiQuest.com, LudusQuest.com, Imparo.app, Manabee.app ฯลฯ — ยังไม่ตัดสินใจ)

## ✅ Done
- 2026-07-23: **Deploy `0e1facc`** — fix MCQ เฉลยแดง/เขียวแวบตอนโหลดข้อใหม่ (ผูก pick กับ
  question id แทนล้างใน effect — ราย detail ใน bugs.md 2026-07-23)
- 2026-07-23: **Deploy `e0e3fbe` — แผน 100 วัน + Freestyle ครบทุก increment** (17 ไฟล์ +2635/−293):
  ① 100-day plan ทั้งระบบ: days.ts (บล็อก 5 วัน/unit, interleaveMix, practiceBlock, dayPlan
  A/B/C/D), sentences.ts (88 ประโยค minUnit อัตโนมัติ), ประโยคจาก day 25, tracker bar,
  wpmTarget 12→20 (71-90), errorPenalty เปิด 81+, Grand Test day 100 + แบนเนอร์ฉลอง
  ② progress: isDayDone/currentTypingDay (surpass credit), saveTypingDay + typingStreak
  (advanceStreak helper, milestone 7/30/50/100) ③ landing ใหม่: hero + day list 100 แถวบอกเนื้อหา
  + progress bar (ตัด unit grid) ④ เกม Racer (words stage, overtake จริง + boom.id) + SushiBelt
  (แพ้โหวต อยู่ game-test) ⑤ comboPace ⚡ ทั้งเกม ⑥ economy: dayBaseExp 10→37 + perfect ครึ่งฐาน
  (max 60) ⑦ Freestyle: route + generateFreestyleRocks + live WPM HUD + typingBestWpm +
  new-record +10 ⑧ fix กระพริบ (controls แทน key-remount ทุก skin) + HomeRowGate collect-the-set
  (แก้ ghosting) — **ปิดแผน v2 ทุก increment (1-5)**; เหลือเฉพาะ QA จากการเล่นจริง
- 2026-07-22: **Deploy `4be39ca`** — ship งานสะสมทั้งหมดขึ้น main (47 ไฟล์ +2804/−1225):
  ① Typing stage modifiers ครบทั้ง 2 Phase: ⏱ timed bonus (U4-10 s3, โบนัส 0-5 first-clear,
  errorPenaltySeconds เตรียมไว้ยังไม่เปิด) + ✌️ multi-obstacle conveyor (U6-10 s2 = 2 ก้อน,
  engine รองรับถึง 4 — spawn วัดจากก้อนหลังสุด, gap = min(0.45, 0.9/n), contract ใหม่
  `targets: LiveTarget[]` + `laserProgress` ทั้ง 2 skin) ② 🖐️ Home-row gate: วาง 8 นิ้ว asdf jkl;
  ก่อนเริ่ม (rolling window 1.6s กัน n-key rollover, start guard 350ms กัน key-repeat รั่ว,
  skip link 5s, RESUME_READY='anykey' สลับ 'homerow' ได้) + เตือนแป้นไทยใน gate ③ 💻 Device
  gating: มือถือบล็อก, แท็บเล็ตเตือน (useDeviceClass — hover-primary = desktop รวม iPad+trackpad)
  ④ ⚡ Auto-advance ทุกเกม (Timetable + MiniQuiz + IndependentPractice, MCQ เท่านั้น,
  650/1500ms) ⑤ 🎨 Per-mode bg themes ผ่าน CSS vars + route class ที่ (game)/layout
  (lesson=น้ำเงิน, timetable=ส้ม, typing=เขียว) ⑥ Typing progression depth-first + avatar
  เชียร์มุมบน + หน้าแรก compact + game-test (gate+wrongLang+1-4 obstacles toggle)
  — ปิดแผน "Typing stage modifiers" ทั้ง section ด้านบน
- 2026-07-12: **Typing multi-game v1 — Dino Shoot 🦖🔥 + Space Defense 🚀** — แยก game skin ออกจาก engine (`GameFieldProps`); stage 1 (keys) = Dino Shoot (คอนเซ็ปต์เปลี่ยนจาก Dino Run ระหว่างทาง — user เลือกยิงแทนกระโดดเพราะเข้ากับ must-correct typing กว่า), combos/words = Space Defense. Dino Shoot v1: sprite 3 เฟรมจาก dino.svg ของ user (สลับขา hard-cut 200ms, ท่ายิง = เฟรม tucked-legs + เอนตัว pivot ที่เท้า), ก้อนหินกลิ้งหมุน (rock.svg สีฝังในตัว, ตัวอักษรล็อกกลางไม่หมุน), ลูกไฟหยุดที่ขอบหิน+หายตอนชน+หินสะดุ้ง delay ตรงจังหวะบิน, explosion ที่ตำแหน่งจริง (track ผ่าน useMotionValueEvent เพราะ engine reset progress ทันทีตอนแตก), พื้นสไตล์ Chrome dino (เส้น+pebbles เลื่อน). Assets ใน public/game/dino-run/ (cactus.svg เลิกใช้แล้ว ยังอยู่ในโฟลเดอร์). หน้าเทส `/game-test` (mock engine ไม่ต้อง login, ไม่ลิงก์จากไหน). ไฟล์ใหม่: `RockText.tsx`, `games/{types,SpaceDefenseField,DinoRunField}.tsx`; `gameForStage()` + `GAME_SPEED` (dino 0.6x เวลา = เร็วกว่า) ใน config; engine 921→824 บรรทัด. Progression/economy ไม่แตะ. ⚠️ ยังไม่ได้เทสใน `/typing/1/1` จริง (ต้อง login). Gotcha framer-ทับ-translate จดใน bugs.md แล้ว (โดน 3 รอบ)
- 2026-07-12: Home page fit-one-screen (logged-in): โลโก้/avatar ย่อ, badge ย้ายใต้ avatar (`titlePlacement`), bubble ชิดปาก; แก้ meteor pill หลุดจอ (centering vs framer transform)
