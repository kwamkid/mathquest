// components/typing/VirtualKeyboard.tsx
//
// On-screen QWERTY guide for the typing game — pure presentational. Keys are
// tinted by finger (see FINGER_COLORS) so kids learn which finger owns which
// key; the next target key glows. NOT tappable: on iPad the kid types on the
// OS keyboard, this component is the finger map. Used in two modes:
//   - player: highlightChar/pressedChar drive the glow + press animation
//   - unit preview: emphasizeKeys lights up the unit's new keys

'use client';

import { motion } from 'framer-motion';
import {
  FINGER_COLORS,
  LAYOUTS,
  fingerName,
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
  // Next char to type ('' or ' ' highlights the space bar).
  highlightChar?: string | null;
  // Char just typed — brief press-down flash.
  pressedChar?: string | null;
  // Unit-page preview: emphasize these keys (full color), mute the rest.
  emphasizeKeys?: string[];
  // Tighter rows when the iPad OS keyboard shrinks the viewport.
  compact?: boolean;
  showLegend?: boolean;
}

export default function VirtualKeyboard({
  layoutId = 'en',
  highlightChar = null,
  pressedChar = null,
  emphasizeKeys,
  compact = false,
  showLegend = false,
}: Props) {
  const { lang } = useLanguage();
  const layout = LAYOUTS[layoutId];

  const keySize = compact
    ? 'h-8 min-w-7 text-xs sm:h-9 sm:min-w-8'
    : 'h-10 min-w-8 text-sm sm:h-12 sm:min-w-10 sm:text-base';

  const isSpaceTarget = highlightChar === ' ';

  const renderKey = (char: string, label: string, fingerKey: keyof typeof FINGER_COLORS, homeKey?: boolean) => {
    const colors = FINGER_COLORS[fingerKey];
    const isTarget = highlightChar === char;
    const isPressed = pressedChar === char;
    const muted = emphasizeKeys && !emphasizeKeys.includes(char);

    return (
      <motion.div
        key={char}
        animate={
          isTarget
            ? { scale: [1, 1.12, 1], transition: { duration: 0.9, repeat: Infinity } }
            : isPressed
              ? { scale: 0.9 }
              : { scale: 1 }
        }
        className={`relative flex ${keySize} flex-1 items-center justify-center rounded-lg font-bold uppercase ${
          isTarget
            ? `${colors.active} ring-2 shadow-lg`
            : muted
              ? 'bg-white/[0.03] text-white/25'
              : colors.key
        }`}
      >
        {label}
        {/* Tactile bump on F / J. */}
        {homeKey && (
          <span
            className={`absolute bottom-1 h-0.5 w-3 rounded-full ${
              isTarget ? 'bg-white/80' : 'bg-white/30'
            }`}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="select-none space-y-1.5" aria-hidden="true">
      {layout.rows.map((row, i) => (
        <div
          key={i}
          className="flex justify-center gap-1"
          // Stagger rows like a real keyboard.
          style={{ paddingLeft: `${i * 4}%`, paddingRight: `${i === 2 ? 8 : 0}%` }}
        >
          {row.map((key) => renderKey(key.char, key.label, key.finger, key.homeKey))}
        </div>
      ))}

      {/* Space bar. */}
      <div className="flex justify-center">
        <motion.div
          animate={
            isSpaceTarget
              ? { scale: [1, 1.06, 1], transition: { duration: 0.9, repeat: Infinity } }
              : pressedChar === ' '
                ? { scale: 0.95 }
                : { scale: 1 }
          }
          className={`flex ${compact ? 'h-8' : 'h-10 sm:h-11'} w-1/2 items-center justify-center rounded-lg text-xs font-bold ${
            isSpaceTarget
              ? `${FINGER_COLORS.thumb.active} ring-2 shadow-lg`
              : emphasizeKeys && !emphasizeKeys.includes(' ')
                ? 'bg-white/[0.03] text-white/25'
                : FINGER_COLORS.thumb.key
          }`}
        >
          SPACE
        </motion.div>
      </div>

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
