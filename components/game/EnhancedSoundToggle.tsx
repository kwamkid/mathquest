// components/game/EnhancedSoundToggle.tsx
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Zap, X } from 'lucide-react';
import { useSound } from '@/lib/game/soundManager';
import { useBackgroundMusic } from '@/lib/game/backgroundMusicManager';

export default function EnhancedSoundToggle() {
  const [showDialog, setShowDialog] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const { isEnabled: soundEnabled, toggleSound } = useSound();
  const { 
    isEnabled: musicEnabled, 
    isPlaying: musicPlaying, 
    toggleMusic: originalToggleMusic,
    stopMusic,
    resumeMusic 
  } = useBackgroundMusic();

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
        title="ตั้งค่าเสียง"
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
          ตั้งค่าเสียง
        </span>
      </motion.button>

      {/* Sound Control Dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowDialog(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-dark rounded-2xl p-6 w-full max-w-sm border border-metaverse-purple/30"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">ตั้งค่าเสียง</h3>
                <button
                  onClick={() => setShowDialog(false)}
                  className="p-1.5 glass rounded-full hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* Sound Controls */}
              <div className="space-y-4">
                {/* Background Music */}
                <div className="flex items-center justify-between p-4 glass rounded-xl border border-blue-500/30">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Music className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">เพลงประกอบ</h4>
                      <p className="text-xs text-white/60">
                        {musicEnabled 
                          ? musicPlaying 
                            ? '♪ กำลังเล่น' 
                            : 'เปิดแล้ว' 
                          : 'ปิดอยู่'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                        musicEnabled 
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                          : 'bg-gray-600'
                      } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={isToggling ? undefined : handleMusicToggle}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-md"
                        animate={{
                          x: musicEnabled ? 26 : 2,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sound Effects */}
                <div className="flex items-center justify-between p-4 glass rounded-xl border border-orange-500/30">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Zap className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">เสียงเอฟเฟค</h4>
                      <p className="text-xs text-white/60">
                        คลิก, ถูก-ผิด, เลื่อนระดับ
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                        soundEnabled 
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                          : 'bg-gray-600'
                      } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={isToggling ? undefined : handleSoundToggle}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-md"
                        animate={{
                          x: soundEnabled ? 26 : 2,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}