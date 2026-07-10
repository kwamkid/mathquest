// components/typing/HandsGuide.tsx
//
// Line-art hands over the virtual keyboard, fingers FANNED so each fingertip
// visibly rests on its home key — left pinky→A, ring→S, middle→D, index→F;
// mirrored right hand index→J … pinky→;. (A natural closed hand can't show
// the home position, so function wins over anatomy here.) Fingertips carry
// colored "nails" matching the keyboard finger tints; the finger for the
// next key glows. Shape verified by rasterizing the SVG (qlmanage).
//
// Renders as an absolute inset-0 layer — drop it inside the keyboard's
// `relative` wrapper and the two hands position themselves:
//   left hand:  left 12%, width 34%  → nails on A S D F
//   right hand: mirrored at right 12% → nails on J K L ;
// (percentages match the FULL_ROWS home-row key centers; keep in sync if
// row widths change). Pointer-events none — a guide, not a control.

'use client';

import { motion } from 'framer-motion';
import type { Finger } from '@/lib/typing/layouts';

interface Props {
  activeFingers: Finger[];
  className?: string;
}

const NAIL_HEX: Record<'pinky' | 'ring' | 'middle' | 'index' | 'thumb', string> = {
  pinky: '#fb7185', // rose-400
  ring: '#fbbf24', // amber-400
  middle: '#34d399', // emerald-400
  index: '#22d3ee', // cyan-400
  thumb: '#a78bfa', // violet-400
};

const SKIN = 'rgba(240,236,255,0.10)';
const OUTLINE = 'rgba(255,255,255,0.65)';

// One LEFT hand, fingers fanned (viewBox 260×240), wrist runs off the bottom.
const HAND_PATH = `
  M 84 240
  L 74 205
  C 64 188 52 172 48 160
  C 40 148 30 120 19 64
  C 17 52 26 45 33 54
  C 38 68 52 120 61 152
  C 65 160 70 160 72 154
  C 72 120 71 85 71 59
  C 70 46 84 42 88 50
  C 92 80 97 125 100 150
  C 103 158 112 158 116 150
  C 120 120 123 80 124 53
  C 125 41 139 40 143 50
  C 145 90 143 125 141 150
  C 143 158 152 158 157 151
  C 163 125 172 85 178 58
  C 181 47 194 49 197 60
  C 193 95 186 130 181 156
  C 180 162 184 166 189 168
  C 198 164 212 160 222 162
  C 233 165 232 176 223 179
  C 212 182 200 186 194 192
  C 188 208 176 224 158 236
  L 156 240
  Z
`;

type FingerType = 'pinky' | 'ring' | 'middle' | 'index';

// Nail anchor per fingertip (left hand). x positions are linear enough that
// pinky/ring/middle/index land on A/S/D/F when the svg spans 34% of the
// keyboard starting at 12%.
const NAILS: { type: FingerType | 'thumb'; cx: number; cy: number; rotate?: number }[] = [
  // Fingertip nails sit on ONE line at uniform 53-unit pitch — that pitch is
  // scaled to the keyboard's key pitch so all four land on their home keys.
  { type: 'pinky', cx: 28, cy: 62, rotate: -12 },
  { type: 'ring', cx: 81, cy: 56, rotate: -4 },
  { type: 'middle', cx: 134, cy: 52, rotate: 4 },
  { type: 'index', cx: 187, cy: 59, rotate: 12 },
  { type: 'thumb', cx: 224, cy: 170, rotate: 75 },
];

function Hand({
  side,
  activeFingers,
}: {
  side: 'left' | 'right';
  activeFingers: Finger[];
}) {
  const isActive = (type: FingerType | 'thumb') => {
    if (type === 'thumb') return activeFingers.includes('thumb');
    const map: Record<FingerType, Finger> = {
      pinky: side === 'left' ? 'lp' : 'rp',
      ring: side === 'left' ? 'lr' : 'rr',
      middle: side === 'left' ? 'lm' : 'rm',
      index: side === 'left' ? 'li' : 'ri',
    };
    return activeFingers.includes(map[type]);
  };

  return (
    <svg
      viewBox="0 0 260 240"
      // left hand: pinky nail on A (16.2% − 28/260·33%); right hand mirrored so
      // its index nail hits J at 56.8%. Derived from FULL_ROWS home-row pitch.
      className={`absolute top-[60px] w-[33%] ${
        side === 'left' ? 'left-[12.6%]' : 'left-[47.5%] -scale-x-100'
      }`}
      aria-hidden="true"
    >
      <path
        d={HAND_PATH}
        fill={SKIN}
        stroke={OUTLINE}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 3px 7px rgba(0,0,0,0.5))' }}
      />
      {NAILS.map(({ type, cx, cy, rotate }) => {
        const active = isActive(type);
        return (
          <motion.ellipse
            key={type}
            cx={cx}
            cy={cy}
            rx={5.5}
            ry={7.5}
            transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined}
            fill={NAIL_HEX[type]}
            animate={{
              opacity: active ? 1 : 0.55,
              scale: active ? 1.45 : 1,
              y: active ? -4 : 0,
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            style={
              active
                ? { filter: `drop-shadow(0 0 8px ${NAIL_HEX[type]})` }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}

// Absolute layer over the keyboard: drop inside a `relative` wrapper.
export default function HandsGuide({ activeFingers, className = '' }: Props) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <Hand side="left" activeFingers={activeFingers} />
      <Hand side="right" activeFingers={activeFingers} />
    </div>
  );
}
