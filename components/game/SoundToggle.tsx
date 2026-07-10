// components/game/SoundToggle.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/lib/game/soundManager';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Local bilingual UI strings for this component
const STR = {
  th: { mute: 'ปิดเสียง', unmute: 'เปิดเสียง' },
  en: { mute: 'Mute', unmute: 'Unmute' },
} as const;

export default function SoundToggle() {
  const { isEnabled, toggleSound, playSound } = useSound();
  const [enabled, setEnabled] = useState(isEnabled);
  const { lang } = useLanguage();
  const L = STR[lang];

  const handleToggle = () => {
    const newState = toggleSound();
    setEnabled(newState);
    if (newState) {
      playSound('click');
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`p-2 glass rounded-full transition ${
        enabled 
          ? 'text-white hover:bg-white/10' 
          : 'text-white/40 hover:bg-white/10'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={enabled ? L.mute : L.unmute}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </motion.button>
  );
}