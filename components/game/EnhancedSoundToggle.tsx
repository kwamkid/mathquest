// components/game/EnhancedSoundToggle.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Zap, X, Settings } from 'lucide-react';
import { useSound } from '@/lib/game/soundManager';
import { useBackgroundMusic } from '@/lib/game/backgroundMusicManager';

export default function EnhancedSoundToggle() {
  const [showDialog, setShowDialog] = useState(false);
  const { isEnabled: soundEnabled, toggleSound } = useSound();
  const { 
    isEnabled: musicEnabled, 
    isPlaying: musicPlaying, 
    toggleMusic: originalToggleMusic,
    stopMusic,
    resumeMusic 
  } = useBackgroundMusic();

  // Custom music toggle without fade
  const toggleMusic = () => {
    if (musicEnabled) {
      // Turn off music immediately (no fade)
      stopMusic();
      return originalToggleMusic(); // This will set enabled to false
    } else {
      // Turn on music
      const newState = originalToggleMusic();
      if (newState) {
        setTimeout(() => {
          resumeMusic();
        }, 100);
      }
      return newState;
    }
  };

  const handleSoundToggle = () => {
    toggleSound();
  };

  const handleMusicToggle = () => {
    toggleMusic();
  };

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
            onClick={() => setShowDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-dark rounded-2xl p-4 max-w-sm w-full border border-metaverse-purple/30 mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Compact */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-metaverse-purple/20 to-metaverse-pink/20 rounded-lg">
                    <Settings className="w-5 h-5 text-metaverse-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">ตั้งค่าเสียง</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowDialog(false)}
                  className="p-1.5 glass rounded-full hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* Sound Controls - Compact */}
              <div className="space-y-3">
                {/* Background Music */}
                <div className="glass bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500/20 rounded">
                        <Music className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">เพลงประกอบ</h4>
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
                    <motion.button
                      onClick={handleMusicToggle}
                      className={`w-10 h-5 rounded-full transition-all duration-300 ${
                        musicEnabled 
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                          : 'bg-gray-600'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-4 h-4 bg-white rounded-full shadow-md"
                        animate={{
                          x: musicEnabled ? 22 : 2,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>
                </div>

                {/* Button Effects */}
                <div className="glass bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-500/20 rounded">
                        <Zap className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">เสียงเอฟเฟค</h4>
                        <p className="text-xs text-white/60">
                          คลิก, ถูก-ผิด, เลื่อนระดับ
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleSoundToggle}
                      className={`w-10 h-5 rounded-full transition-all duration-300 ${
                        soundEnabled 
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                          : 'bg-gray-600'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-4 h-4 bg-white rounded-full shadow-md"
                        animate={{
                          x: soundEnabled ? 22 : 2,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Compact */}
              <div className="flex gap-2 mt-4">
                <motion.button
                  onClick={() => {
                    if (!soundEnabled) handleSoundToggle();
                    if (!musicEnabled) handleMusicToggle();
                  }}
                  disabled={soundEnabled && musicEnabled}
                  className="flex-1 py-2 px-3 metaverse-button rounded-lg font-medium text-white text-sm disabled:opacity-50"
                  whileHover={{ scale: soundEnabled && musicEnabled ? 1 : 1.02 }}
                  whileTap={{ scale: soundEnabled && musicEnabled ? 1 : 0.98 }}
                >
                  เปิดทั้งหมด
                </motion.button>
                <motion.button
                  onClick={() => {
                    if (soundEnabled) handleSoundToggle();
                    if (musicEnabled) handleMusicToggle();
                  }}
                  disabled={!soundEnabled && !musicEnabled}
                  className="flex-1 py-2 px-3 glass border border-red-500/50 text-red-400 rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-red-500/10"
                  whileHover={{ scale: !soundEnabled && !musicEnabled ? 1 : 1.02 }}
                  whileTap={{ scale: !soundEnabled && !musicEnabled ? 1 : 0.98 }}
                >
                  ปิดทั้งหมด
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}