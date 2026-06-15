// lib/curricula/life-math-beginner/topics/percentages/content/concepts.ts
//
// Concept blocks for Percentages — written once, reused across lessons.
// Each export is a fully-formed ConceptStep that any lesson can drop in.

import { concept } from '@/lib/curricula/helpers/lesson-builders';
import {
  callout,
  percentBar,
  text,
} from '@/lib/curricula/helpers/visual-builders';

// "% คืออะไร" — base intuition: percent means "per 100".
export const C_whatIsPercent = concept('pct-c-intro', '% คืออะไร', [
  text(
    '**percent (%)** เป็นภาษาฝรั่งเศสมาจากคำว่า *per cent* แปลว่า **"ต่อหนึ่งร้อย"**',
  ),
  text(
    'สมมุติเรามีพิซซ่า **1 ถาด** ที่ตัดเป็น **100 ชิ้นเท่าๆ กัน** — ถ้าเรากินไป 1 ชิ้น เราจะกินไป **1/100 = 1%**',
  ),
  percentBar(100, '100% = ของทั้งหมด'),
  percentBar(50, '50% = ครึ่งหนึ่ง'),
  percentBar(25, '25% = หนึ่งในสี่'),
  percentBar(10, '10% = หนึ่งในสิบ'),
  callout(
    'tip',
    'จำง่ายๆ: **100 ทั้งหมด = 100%** — ครึ่งหนึ่ง = 50% — หนึ่งในสี่ = 25%',
  ),
]);

// "บัญญัติไตรยางศ์" — the core method for computing X% of N.
export const C_unitaryMethod = concept('pct-c-unitary', 'บัญญัติไตรยางศ์', [
  text(
    '**บัญญัติไตรยางศ์** เป็นวิธีคิดที่ใช้ในชีวิตประจำวัน — แปลว่า "การคำนวณจากของ 1 หน่วย"',
  ),
  text('สำหรับเปอร์เซ็นต์ สูตรคือ:'),
  callout('info', '**X% ของ N = (N × X) ÷ 100**'),
  text('ตัวอย่าง: หา 20% ของ 50'),
  text('- คูณก่อน: 50 × 20 = 1,000\n- หาร 100: 1,000 ÷ 100 = **10**'),
  text('ดังนั้น 20% ของ 50 = **10**'),
  callout(
    'tip',
    'ทางลัด: 10% = **÷10** | 50% = **÷2** | 25% = **÷4** | 1% = **÷100**',
  ),
]);

// "10% เป็นจุดเริ่ม" — emphasize the 10% shortcut as the foundation.
export const C_tenPercentTrick = concept('pct-c-ten', 'เริ่มจาก 10% ก่อน', [
  text(
    '**10% หาง่ายมาก** — แค่หารด้วย 10 (เลื่อนจุดทศนิยมไปทางซ้าย 1 ตำแหน่ง)',
  ),
  text(
    '- 10% ของ 100 = 10\n- 10% ของ 250 = 25\n- 10% ของ 80 = 8\n- 10% ของ 1,500 = 150',
  ),
  text('แล้วเปอร์เซ็นต์อื่นๆ ก็ต่อยอดจาก 10% ได้:'),
  text(
    '- **20%** = 10% × 2\n- **30%** = 10% × 3\n- **5%** = 10% ÷ 2\n- **15%** = 10% + 5%',
  ),
  callout('tip', 'ลองหา 10% ก่อน แล้วเพิ่ม/ลด — เร็วกว่าใช้สูตรตรงๆ'),
]);

// "เปอร์เซ็นต์ในชีวิตจริง" — context for word problems.
export const C_realWorldPercent = concept(
  'pct-c-real',
  'เปอร์เซ็นต์ในชีวิตจริง',
  [
    text('เปอร์เซ็นต์มีใช้ทุกที่ในชีวิตประจำวัน:'),
    text(
      '🛍 **ลดราคา** — เสื้อราคา 500 บาท ลด 20% เหลือ?\n🍎 **ภาษี VAT** — อาหาร 80 บาท + VAT 7%\n💰 **คะแนนสอบ** — ทำได้ 18/20 = 90%\n📊 **ส่วนผสม** — ขนม 30% น้ำตาล',
    ),
    callout(
      'tip',
      'ลด 20% = จ่ายแค่ 80% — มี 2 วิธีคิด: หาส่วนลดแล้วลบออก หรือคูณ 80% ของราคาเดิม',
    ),
  ],
);
