// components/game/EnhancedSoundToggle.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Zap, X } from 'lucide-react';
import { useSound } from '@/lib/game/soundManager';
import { useBackgroundMusic } from '@/lib/game/backgroundMusicManager';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Local bilingual UI strings for this component
const STR = {
  th: {
    soundSettings: 'ตั้งค่าเสียง',
    bgMusic: 'เพลงประกอบ',
    playing: '♪ กำลังเล่น',
    on: 'เปิดแล้ว',
    off: 'ปิดอยู่',
    soundEffects: 'เสียงเอฟเฟค',
    soundEffectsDesc: 'คลิก, ถูก-ผิด, เลื่อนระดับ',
    closeTip: '💡 คลิกข้างนอกหรือกด ESC เพื่อปิด',
    close: 'ปิด',
  },
  en: {
    soundSettings: 'Sound settings',
    bgMusic: 'Background music',
    playing: '♪ Playing',
    on: 'On',
    off: 'Off',
    soundEffects: 'Sound effects',
    soundEffectsDesc: 'Clicks, right/wrong, level up',
    closeTip: '💡 Click outside or press ESC to close',
    close: 'Close',
  },
} as const;

export default function EnhancedSoundToggle() {
  const [showDialog, setShowDialog] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();
  const L = STR[lang];
  
  const { isEnabled: soundEnabled, toggleSound } = useSound();
  const { 
    isEnabled: musicEnabled, 
    isPlaying: musicPlaying, 
    toggleMusic: originalToggleMusic,
    stopMusic,
    resumeMusic 
  } = useBackgroundMusic();

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    if (!showDialog) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDialog(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside the modal
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowDialog(false);
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDialog]);

  // Prevent multiple toggles
  const handleSoundToggle = useCallback(async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      toggleSound();
    } finally {
      setTimeout(() => setIsToggling(false), 200);
    }
  }, [isToggling, toggleSound]);

  const handleMusicToggle = useCallback(async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      if (musicEnabled) {
        stopMusic();
        originalToggleMusic();
      } else {
        const newState = originalToggleMusic();
        if (newState) {
          setTimeout(() => {
            resumeMusic();
          }, 100);
        }
      }
    } finally {
      setTimeout(() => setIsToggling(false), 200);
    }
  }, [isToggling, musicEnabled, stopMusic, originalToggleMusic, resumeMusic]);

  // Get overall sound status for main button
  const hasAnySound = soundEnabled || musicEnabled;

  return (
    <>
      {/* Main Sound Button */}
      <motion.button
        onClick={() => setShowDialog(true)}
        className="p-1.5 md:p-2 glass rounded-full transition hover:bg-white/10 group relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={L.soundSettings}
      >
        {hasAnySound ? (
          <Volume2 className={`w-4 h-4 md:w-5 md:h-5 ${
            (soundEnabled && musicEnabled) 
              ? 'text-green-400' 
              : soundEnabled || musicEnabled 
                ? 'text-yellow-400' 
                : 'text-white/70'
          } group-hover:text-white transition`} />
        ) : (
          <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-red-400 group-hover:text-white transition" />
        )}
        
        {/* Desktop tooltip */}
        <span className="hidden md:block absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/0 group-hover:text-white/80 transition whitespace-nowrap">
          {L.soundSettings}
        </span>
      </motion.button>

      {/* Sound Control Dialog - Centered */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[9999]"
            style={{ marginTop: 0, paddingTop: '10vh' }}
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-metaverse-purple/50 mx-auto my-auto shadow-2xl"
              style={{ position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">{L.soundSettings}</h3>
                <motion.button
                  onClick={() => setShowDialog(false)}
                  className="p-1.5 glass rounded-full hover:bg-white/10 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 text-white/60" />
                </motion.button>
              </div>

              {/* Sound Controls */}
              <div className="space-y-4">
                {/* Background Music */}
                <motion.div 
                  className="flex items-center justify-between p-4 glass rounded-xl border border-blue-500/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <motion.div 
                      className="p-2 bg-blue-500/20 rounded-lg"
                      animate={musicPlaying ? { 
                        rotate: [0, 360],
                      } : {}}
                      transition={musicPlaying ? { 
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      } : {}}
                    >
                      <Music className="w-5 h-5 text-blue-400" />
                    </motion.div>
                    <div>
                      <h4 className="font-medium text-white">{L.bgMusic}</h4>
                      <p className="text-xs text-white/60">
                        {musicEnabled
                          ? musicPlaying
                            ? L.playing
                            : L.on
                          : L.off
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleMusicToggle}
                    disabled={isToggling}
                    className="flex-shrink-0 focus:outline-none"
                  >
                    <div
                      className={`w-12 h-6 rounded-full transition-all duration-300 ${
                        musicEnabled 
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                          : 'bg-gray-600'
                      } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-md"
                        animate={{
                          x: musicEnabled ? 26 : 2,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </button>
                </motion.div>

                {/* Sound Effects */}
                <motion.div 
                  className="flex items-center justify-between p-4 glass rounded-xl border border-orange-500/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <motion.div 
                      className="p-2 bg-orange-500/20 rounded-lg"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Zap className="w-5 h-5 text-orange-400" />
                    </motion.div>
                    <div>
                      <h4 className="font-medium text-white">{L.soundEffects}</h4>
                      <p className="text-xs text-white/60">
                        {L.soundEffectsDesc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSoundToggle}
                    disabled={isToggling}
                    className="flex-shrink-0 focus:outline-none"
                  >
                    <div
                      className={`w-12 h-6 rounded-full transition-all duration-300 ${
                        soundEnabled 
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                          : 'bg-gray-600'
                      } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-md"
                        animate={{
                          x: soundEnabled ? 26 : 2,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </button>
                </motion.div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs text-white/50 text-center">
                  {L.closeTip}
                </p>
              </div>

              {/* Close Button (Mobile) */}
              <motion.button
                onClick={() => setShowDialog(false)}
                className="md:hidden w-full mt-4 py-2.5 metaverse-button text-white font-medium rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {L.close}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}