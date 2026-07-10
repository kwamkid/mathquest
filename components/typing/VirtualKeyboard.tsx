// components/typing/VirtualKeyboard.tsx
//
// On-screen keyboard guide for the typing game — renders a COMPLETE keyboard
// frame (number row, Tab/Caps/Shift/Enter, space row) so it looks like the
// real thing; curriculum letters are tinted by finger (see FINGER_COLORS),
// everything else is an inert gray filler. The next target key glows. NOT
// tappable: on iPad the kid types on the OS keyboard, this is the finger map.
// Modes:
//   - player: highlightChar/pressedChar drive the glow + press animation
//   - unit preview: emphasizeKeys lights up the unit's new keys

'use client';

import { motion } from 'framer-motion';
import {
  FINGER_COLORS,
  FULL_ROWS,
  fingerName,
  type KeySlot,
  type LayoutId,
} from '@/lib/typing/layouts';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Legend entries — explicit dot classes so Tailwind JIT sees them literally.
const LEGEND = [
  { finger: 'lp', dot: 'bg-rose-400' },
  { finger: 'lr', dot: 'bg-amber-400' },
  { finger: 'lm', dot: 'bg-emerald-400' },
  { finger: 'li', dot: 'bg-cyan-400' },
  { finger: 'thumb', dot: 'bg-violet-400' },
] as const;

interface Props {
  layoutId?: LayoutId;
  // Next char to type (' ' highlights the space bar).
  highlightChar?: string | null;
  // Char just typed — brief press-down flash.
  pressedChar?: string | null;
  // Unit-page preview: light these keys up bright.
  emphasizeKeys?: string[];
  // Tighter rows when the iPad OS keyboard shrinks the viewport.
  compact?: boolean;
  showLegend?: boolean;
}

export default function VirtualKeyboard({
  highlightChar = null,
  pressedChar = null,
  emphasizeKeys,
  compact = false,
  showLegend = false,
}: Props) {
  const { lang } = useLanguage();

  const keyHeight = compact ? 'h-7 sm:h-8' : 'h-8 sm:h-10';

  const renderSlot = (slot: KeySlot, idx: number) => {
    const width = slot.w ?? 1;
    const isLetter = !!slot.char && !!slot.finger;

    if (!isLetter) {
      // Inert filler (numbers, modifiers, punctuation not in the curriculum).
      return (
        <div
          key={idx}
          style={{ flex: `${width} 1 0%` }}
          className={`flex ${keyHeight} items-center justify-center rounded-lg bg-white/[0.05] text-xs font-semibold text-white/30`}
        >
          {slot.label}
        </div>
      );
    }

    const colors = FINGER_COLORS[slot.finger!];
    const isTarget = highlightChar === slot.char;
    const isPressed = pressedChar === slot.char;
    const emphasized = emphasizeKeys?.includes(slot.char!) ?? false;
    const isSpace = slot.char === ' ';

    return (
      <motion.div
        key={idx}
        style={{ flex: `${width} 1 0%` }}
        animate={
          isTarget
            ? { scale: [1, 1.1, 1], transition: { duration: 0.9, repeat: Infinity } }
            : isPressed
              ? { scale: 0.92 }
              : { scale: 1 }
        }
        className={`relative flex ${keyHeight} items-center justify-center rounded-lg font-bold uppercase ${
          isSpace ? 'text-xs' : 'text-sm sm:text-base'
        } ${
          isTarget || emphasized ? `${colors.active} ring-2 shadow-lg` : colors.key
        }`}
      >
        {slot.label}
        {/* Tactile bump on F / J. */}
        {slot.homeKey && (
          <span
            className={`absolute bottom-1 h-0.5 w-3 rounded-full ${
              isTarget || emphasized ? 'bg-white/80' : 'bg-white/30'
            }`}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="select-none space-y-1" aria-hidden="true">
      {FULL_ROWS.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map(renderSlot)}
        </div>
      ))}

      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pt-2">
          {LEGEND.map(({ finger, dot }) => (
            <span
              key={finger}
              className="flex items-center gap-1.5 text-xs text-white/60"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
              {finger === 'thumb'
                ? fingerName('thumb')[lang]
                : // Legend shows the finger type (both hands share a hue).
                  fingerName(finger)[lang].replace(lang === 'th' ? 'ซ้าย' : 'left ', '').trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
