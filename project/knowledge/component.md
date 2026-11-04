# 🧩 Shared components

> Components ที่ตั้งใจให้ reuse — เพิ่ม/rename/behavior change. Append-only via `/memo`.

<!-- toc -->
**Contents** (3)
- 2026-06-18
- 2026-06-18 (later)
- 2026-07-23
<!-- /toc -->

---

## 2026-06-18

- **`<AppHeader>`** ([components/layout/AppHeader.tsx](/components/layout/AppHeader.tsx)) — unified top bar ทั้งระบบ. `variant: 'main' | 'sub'`, optional `extras` slot, `hideActions` สำหรับ /play. มี logo π ซ้ายสุดเสมอเป็นปุ่ม home. ใช้ทุกหน้า in-app (ยกเว้น lesson player ที่ใช้ LessonHeader)

- **`<TopicIcon topic={t} />`** ([components/lesson/TopicIcon.tsx](/components/lesson/TopicIcon.tsx)) — render topic icon, prefer Lucide ถ้า `iconName` ตั้ง, fallback emoji, fallback BookOpen. ใช้ทุกที่ที่อ้าง topic.icon

- **`<ChapterPage>` / `<TopicListPage>` / `<LessonPlayerHost>`** ([components/curriculum/](/components/curriculum)) — shared route templates. ใช้กับ /learn (BNC) และ /life-math. Route file pass curriculum/topic + `chapterUrl` (namespace-agnostic)

- **`<ChapterTimeline>` exports** ([components/lesson/ChapterTimeline.tsx](/components/lesson/ChapterTimeline.tsx)) — `ContinueCard`, `LessonListItem`, `QuizLevelItem`. ใช้ภายใน ChapterPage. Active row ของ LessonListItem ใช้ gradient ทึบ (full pill), ContinueCard ย่อเป็น compact button

- **`<CurriculumTimeline>`** ([components/curriculum/CurriculumTimeline.tsx](/components/curriculum/CurriculumTimeline.tsx)) — Udemy-style accordion timeline สำหรับ landing page ของ /learn และ /life-math. รับ curriculum + progress + `buildLessonHref` (namespace-agnostic)

- **`app/not-found.tsx`** — branded 404 page. มี 3 quick links (home / Learn / Life Math) + bonus "ไปเล่นเกม" CTA

## 2026-06-18 (later)

- **`<AppHeader>` รื้อใหม่** — layout: Logo เดี่ยว · spacer · score/EXP · `<SoundToggles>` · `<UserMenu>`. เอาปุ่ม home/shop/setting/logout แยก + avatar+ชื่อฝั่งซ้ายออก (รวมใน UserMenu). height มือถือ 64px / desktop 68px

- **`<SoundToggles>`** ([components/layout/SoundToggles.tsx](/components/layout/SoundToggles.tsx)) — 2 icon toggle (เสียงเอฟเฟกต์ 🔊 + เพลง 🎵) กดสลับ on/off ทันที (เขียว=เปิด/เทา=ปิด) ไม่มี modal. แทน EnhancedSoundToggle เดิม

- **`<UserMenu>`** ([components/layout/UserMenu.tsx](/components/layout/UserMenu.tsx)) — avatar กลมมีกรอบ ขวาสุด กดแล้ว dropdown (ทึบ): My Avatar / Shop / Setting / Log out + ชื่อ+เลเวล. ปิดด้วยคลิกนอก/Esc

- **`<CurriculumTimeline>` (ขยาย)** — ใช้ทั้ง /learn, /life-math, /timetable (synthetic curriculum). accordion เปิดทีละอัน (single-open), big numbers, gradient active row, badge "กำลังเรียนอยู่", bg เขียวสำหรับที่เรียนจบ, prop `hideTopicHeadings` (single-topic). รับ `continueLessonId` + `buildLessonHref`

- **`<CurriculumProgressHeader>`** ([components/curriculum/CurriculumProgressHeader.tsx](/components/curriculum/CurriculumProgressHeader.tsx)) — progress card + ปุ่มเรียนต่อ (▶ แนวตั้ง) บรรทัดเดียวทุกขนาดจอ. ใช้ใน CurriculumTimeline

- **`<TimetableRoundPlayer>`** ([components/timetable/TimetableRoundPlayer.tsx](/components/timetable/TimetableRoundPlayer.tsx)) — เล่นรอบสูตรคูณ (generate MCQ runtime) ใช้ `<LessonHeader>` ร่วม (มี X ออก) + MultipleChoiceTextQuestion. footer fixed ล่าง

## 2026-07-23

- **`<TypingRoundPlayer>` (ขยายเป็น 3 โหมด)** ([components/typing/TypingRoundPlayer.tsx](/components/typing/TypingRoundPlayer.tsx)) — props: `{unit,stage}` classic / `{day}` แผน 100 วัน / `{freestyle}` WPM arena. engine เดียว: multi-obstacle pool, combo-speed ⚡, timed HUD, sentence tracker bar, home-row gate, live WPM (freestyle)

- **`<HomeRowGate onReady readyLabel wrongLangHint>`** ([components/typing/HomeRowGate.tsx](/components/typing/HomeRowGate.tsx)) — ritual วางนิ้ว 8 ปุ่ม asdf jkl; แบบ collect-the-set (กันคีย์บอร์ด ghosting) + เตือนแป้นไทย. ใช้ตอนเริ่มเกม + resume mode 'homerow' + game-test

- **Game skins ×4** ([components/typing/games/](/components/typing/games)) — contract `GameFieldProps` (`targets: LiveTarget[]`, boom มี `progress`+`id`): `DinoRunField` (แป้นเดี่ยว), `RacerField` (คำ — แซงจริง), `SpaceDefenseField` (combos/ประโยค), `SushiBeltField` (สำรอง — อยู่แค่ /game-test). กฎ: effect ใช้ animation controls ห้าม key-remount

- **`useDeviceClass()`** ([lib/useDeviceClass.ts](/lib/useDeviceClass.ts)) — 'phone' | 'tablet' | 'desktop' จาก pointer+hover+จอ (iPad+trackpad = desktop). ใช้บล็อกมือถือ/เตือนแท็บเล็ตใน typing
