// components/layout/SoundToggles.tsx
//
// ONE sound icon in the top bar (mobile header space is precious) that opens
// a small dropdown panel with the two switches — sound effects + background
// music. The icon lights up when anything is on. Dropdown follows the
// UserMenu pattern (outside-click / Escape to close).

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/lib/game/soundManager';
import { useBackgroundMusic } from '@/lib/game/backgroundMusicManager';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const STR = {
  th: {
    open: 'ตั้งค่าเสียง',
    soundTitle: 'เสียงเอฟเฟกต์',
    musicTitle: 'เพลงประกอบ',
    on: 'เปิด',
    off: 'ปิด',
  },
  en: {
    open: 'Sound settings',
    soundTitle: 'Sound effects',
    musicTitle: 'Background music',
    on: 'On',
    off: 'Off',
  },
} as const;

export default function SoundToggles() {
  const { lang } = useLanguage();
  const L = STR[lang];
  const { toggleSound, isEnabled: soundInitial } = useSound();
  const {
    isEnabled: musicEnabled,
    toggleMusic,
    stopMusic,
    resumeMusic,
  } = useBackgroundMusic();

  // useSound().isEnabled isn't reactive, so mirror it locally for instant UI.
  const [soundOn, setSoundOn] = useState(soundInitial);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside-click or Escape (same pattern as UserMenu).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const handleSound = useCallback(() => {
    const next = toggleSound();
    setSoundOn(next);
  }, [toggleSound]);

  const handleMusic = useCallback(() => {
    if (musicEnabled) {
      stopMusic();
      toggleMusic();
    } else {
      const on = toggleMusic();
      if (on) setTimeout(() => resumeMusic(), 100);
    }
  }, [musicEnabled, stopMusic, toggleMusic, resumeMusic]);

  const anyOn = soundOn || musicEnabled;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.9 }}
        className="glass flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
        aria-label={L.open}
        aria-expanded={open}
        title={L.open}
      >
        {anyOn ? (
          <Volume2 className="h-4 w-4 text-green-400" />
        ) : (
          <VolumeX className="h-4 w-4 text-white/40" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-metaverse-purple/40 bg-[#15101f] p-1.5 shadow-2xl"
          >
            <ToggleRow
              icon={
                soundOn ? (
                  <Volume2 className="h-4 w-4 text-green-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-white/40" />
                )
              }
              label={L.soundTitle}
              on={soundOn}
              onLabel={L.on}
              offLabel={L.off}
              onToggle={handleSound}
            />
            <ToggleRow
              icon={
                <Music
                  className={`h-4 w-4 ${musicEnabled ? 'text-green-400' : 'text-white/40'}`}
                />
              }
              label={L.musicTitle}
              on={musicEnabled}
              onLabel={L.on}
              offLabel={L.off}
              onToggle={handleMusic}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  on,
  onLabel,
  offLabel,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  on: boolean;
  onLabel: string;
  offLabel: string;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10"
    >
      {icon}
      <span className="min-w-0 flex-1 text-left">{label}</span>
      <span className={`text-xs font-bold ${on ? 'text-green-400' : 'text-white/40'}`}>
        {on ? onLabel : offLabel}
      </span>
      {/* Switch track */}
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          on ? 'bg-green-500/70' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            on ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}
