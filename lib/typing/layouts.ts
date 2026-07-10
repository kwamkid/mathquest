// lib/typing/layouts.ts
//
// Keyboard geometry + finger map for the typing tutor. v1 ships the EN
// (QWERTY) letter layout only; the shapes are designed so a Thai (Kedmanee)
// layout can be added later as LAYOUTS.th — that's why KeyDef reserves
// `shiftChar` even though lowercase-only EN never uses it.

export type Finger =
  | 'lp' | 'lr' | 'lm' | 'li' // left pinky/ring/middle/index
  | 'ri' | 'rm' | 'rr' | 'rp' // right index/middle/ring/pinky
  | 'thumb';

export interface KeyDef {
  char: string;        // the character this key produces (lowercase)
  label: string;       // cap label (uppercase for EN letters)
  finger: Finger;
  homeKey?: boolean;   // F / J — render the tactile bump dot
  shiftChar?: string;  // reserved for the future Thai layout
}

export type LayoutId = 'en';

export interface KeyboardLayout {
  id: LayoutId;
  rows: KeyDef[][]; // 3 letter rows; the space bar is rendered separately
}

const k = (char: string, finger: Finger, homeKey = false): KeyDef => ({
  char,
  label: char.toUpperCase(),
  finger,
  homeKey,
});

export const LAYOUTS: Record<LayoutId, KeyboardLayout> = {
  en: {
    id: 'en',
    rows: [
      [
        k('q', 'lp'), k('w', 'lr'), k('e', 'lm'), k('r', 'li'), k('t', 'li'),
        k('y', 'ri'), k('u', 'ri'), k('i', 'rm'), k('o', 'rr'), k('p', 'rp'),
      ],
      [
        k('a', 'lp'), k('s', 'lr'), k('d', 'lm'), k('f', 'li', true), k('g', 'li'),
        k('h', 'ri'), k('j', 'ri', true), k('k', 'rm'), k('l', 'rr'),
      ],
      [
        k('z', 'lp'), k('x', 'lr'), k('c', 'lm'), k('v', 'li'), k('b', 'li'),
        k('n', 'ri'), k('m', 'ri'),
      ],
    ],
  },
};

// Tailwind classes per finger — mirrored left/right pairs share a hue so the
// legend stays simple (pinky=rose, ring=amber, middle=emerald, index=cyan,
// thumb=violet).
export const FINGER_COLORS: Record<Finger, { key: string; active: string }> = {
  lp: { key: 'bg-rose-500/15 text-rose-200/80', active: 'bg-rose-500 text-white ring-rose-300' },
  rp: { key: 'bg-rose-500/15 text-rose-200/80', active: 'bg-rose-500 text-white ring-rose-300' },
  lr: { key: 'bg-amber-500/15 text-amber-200/80', active: 'bg-amber-500 text-white ring-amber-300' },
  rr: { key: 'bg-amber-500/15 text-amber-200/80', active: 'bg-amber-500 text-white ring-amber-300' },
  lm: { key: 'bg-emerald-500/15 text-emerald-200/80', active: 'bg-emerald-500 text-white ring-emerald-300' },
  rm: { key: 'bg-emerald-500/15 text-emerald-200/80', active: 'bg-emerald-500 text-white ring-emerald-300' },
  li: { key: 'bg-cyan-500/15 text-cyan-200/80', active: 'bg-cyan-500 text-white ring-cyan-300' },
  ri: { key: 'bg-cyan-500/15 text-cyan-200/80', active: 'bg-cyan-500 text-white ring-cyan-300' },
  thumb: { key: 'bg-violet-500/15 text-violet-200/80', active: 'bg-violet-500 text-white ring-violet-300' },
};

export const fingerName = (f: Finger): { th: string; en: string } => {
  switch (f) {
    case 'lp': return { th: 'นิ้วก้อยซ้าย', en: 'left pinky' };
    case 'lr': return { th: 'นิ้วนางซ้าย', en: 'left ring' };
    case 'lm': return { th: 'นิ้วกลางซ้าย', en: 'left middle' };
    case 'li': return { th: 'นิ้วชี้ซ้าย', en: 'left index' };
    case 'ri': return { th: 'นิ้วชี้ขวา', en: 'right index' };
    case 'rm': return { th: 'นิ้วกลางขวา', en: 'right middle' };
    case 'rr': return { th: 'นิ้วนางขวา', en: 'right ring' };
    case 'rp': return { th: 'นิ้วก้อยขวา', en: 'right pinky' };
    case 'thumb': return { th: 'นิ้วโป้ง', en: 'thumb' };
  }
};

// Look up a key's finger on a layout (space = thumb).
export const fingerForChar = (layout: KeyboardLayout, char: string): Finger | null => {
  if (char === ' ') return 'thumb';
  for (const row of layout.rows) {
    const hit = row.find((key) => key.char === char);
    if (hit) return hit.finger;
  }
  return null;
};
