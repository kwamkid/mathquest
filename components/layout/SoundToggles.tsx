// components/layout/SoundToggles.tsx
//
// Two inline icon toggles for the top bar — sound effects + background music.
// Tap to flip on/off instantly (no modal, no helper text). Replaces the old
// EnhancedSoundToggle dialog. Each icon shows its state by colour: lit when on,
// dimmed/struck when off.

'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/lib/game/soundManager';
import { useBackgroundMusic } from '@/lib/game/backgroundMusicManager';

export default function SoundToggles() {
  const { toggleSound, isEnabled: soundInitial } = useSound();
  const {
    isEnabled: musicEnabled,
    toggleMusic,
    stopMusic,
    resumeMusic,
  } = useBackgroundMusic();

  // useSound().isEnabled isn't reactive, so mirror it locally for instant UI.
  const [soundOn, setSoundOn] = useState(soundInitial);

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

  const btn =
    'glass flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10';

  return (
    <div className="flex items-center gap-1.5">
      <motion.button
        onClick={handleSound}
        whileTap={{ scale: 0.9 }}
        className={btn}
        aria-label={soundOn ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
        aria-pressed={soundOn}
        title="เสียงเอฟเฟกต์"
      >
        {soundOn ? (
          <Volume2 className="h-4 w-4 text-green-400" />
        ) : (
          <VolumeX className="h-4 w-4 text-white/40" />
        )}
      </motion.button>

      <motion.button
        onClick={handleMusic}
        whileTap={{ scale: 0.9 }}
        className={btn}
        aria-label={musicEnabled ? 'ปิดเพลงประกอบ' : 'เปิดเพลงประกอบ'}
        aria-pressed={musicEnabled}
        title="เพลงประกอบ"
      >
        <Music
          className={`h-4 w-4 ${musicEnabled ? 'text-green-400' : 'text-white/40'}`}
        />
      </motion.button>
    </div>
  );
}
