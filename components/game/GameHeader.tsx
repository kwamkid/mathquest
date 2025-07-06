// components/game/GameHeader.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Trophy, Zap, X, Gift, Info } from 'lucide-react';
import SoundToggle from './SoundToggle';
import { getQuestionCount } from '@/lib/game/config';

interface GameHeaderProps {
  user: User;
}

export default function GameHeader({ user }: GameHeaderProps) {
  const router = useRouter();
  const [showExpModal, setShowExpModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Get grade display name
  const getGradeDisplayName = (grade: string): string => {
    const gradeMap: Record<string, string> = {
      K1: 'อนุบาล 1',
      K2: 'อนุบาล 2',
      K3: 'อนุบาล 3',
      P1: 'ประถม 1',
      P2: 'ประถม 2',
      P3: 'ประถม 3',
      P4: 'ประถม 4',
      P5: 'ประถม 5',
      P6: 'ประถม 6',
      M1: 'มัธยม 1',
      M2: 'มัธยม 2',
      M3: 'มัธยม 3',
      M4: 'มัธยม 4',
      M5: 'มัธยม 5',
      M6: 'มัธยม 6',
    };
    return gradeMap[grade] || grade;
  };

  // Get avatar emoji from avatar id
  const getAvatarEmoji = (avatarId: string): string => {
    const avatarMap: Record<string, string> = {
      // Warriors
      'knight': '🤴',
      'warrior': '🦸‍♂️',
      'warrioress': '🦸‍♀️',
      'ninja': '🥷',
      'wizard': '🧙‍♂️',
      'witch': '🧙‍♀️',
      'superhero': '🦹‍♂️',
      'superheroine': '🦹‍♀️',
      'vampire': '🧛‍♂️',
      'vampiress': '🧛‍♀️',
      // Creatures
      'dragon': '🐉',
      'unicorn': '🦄',
      'fox': '🦊',
      'lion': '🦁',
      'tiger': '🐯',
      'wolf': '🐺',
      'bear': '🐻',
      'panda': '🐼',
      'monkey': '🐵',
      'owl': '🦉',
      // Mystical
      'fairy': '🧚‍♀️',
      'fairy-man': '🧚‍♂️',
      'mage': '🧙',
      'genie': '🧞',
      'mermaid': '🧜‍♀️',
      'merman': '🧜‍♂️',
      'robot': '🤖',
      'alien': '👽',
      'ghost': '👻',
      'zombie': '🧟'
    };
    
    return avatarMap[avatarId] || '👤';
  };

  // คำนวณจำนวน level ที่ผ่านแล้ว (คะแนน > 85%)
  const getPassedLevels = (): number => {
    if (!user.levelScores) return 0;
    
    return Object.values(user.levelScores).filter(score => {
      const questionCount = getQuestionCount(user.grade);
      const percentage = (score.highScore / questionCount) * 100;
      return percentage > 85;
    }).length;
  };

  return (
    <>
      <header className="glass-dark border-b border-metaverse-purple/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4">
          {/* Mobile Layout - 2 rows */}
          <div className="md:hidden">
            {/* Row 1: User Info + Actions */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <motion.div
                  className="text-3xl filter drop-shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  {getAvatarEmoji(user.avatar)}
                </motion.div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {user.displayName || user.username}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span>{getGradeDisplayName(user.grade)}</span>
                    <span className="text-metaverse-purple font-semibold">Lv.{user.level}</span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">{getPassedLevels()}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                <SoundToggle />
                <motion.button
                  onClick={() => router.push('/profile')}
                  className="p-1.5 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={handleSignOut}
                  className="p-1.5 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            
            {/* Row 2: Stats */}
            <div className="flex items-center gap-2">
              <motion.div 
                className="flex-1 glass-dark px-3 py-2 rounded-lg border border-metaverse-purple/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">คะแนนรวม</span>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    {user.totalScore.toLocaleString()}
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="flex-1 glass-dark px-3 py-2 rounded-lg border border-yellow-400/30 relative cursor-pointer bg-gradient-to-br from-yellow-400/5 to-orange-400/5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowExpModal(true)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">EXP</span>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                      {user.experience.toLocaleString()}
                    </p>
                    <motion.div
                      animate={{ 
                        rotate: [0, -10, 10, -10, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Info className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  </div>
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 bg-yellow-400 text-metaverse-black rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow-lg"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  กดดู
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Desktop Layout - Original */}
          <div className="hidden md:flex items-center justify-between">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <motion.div
                className="text-4xl filter drop-shadow-lg"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                {getAvatarEmoji(user.avatar)}
              </motion.div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {user.displayName || user.username}
                </h3>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <span>{getGradeDisplayName(user.grade)}</span>
                  <span>•</span>
                  <span className="text-metaverse-purple font-semibold">Level {user.level}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">{getPassedLevels()}</span> Level ผ่าน
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: Stats + Actions */}
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-3">
                <motion.div 
                  className="text-center glass-dark px-4 py-2 rounded-xl border border-metaverse-purple/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                      {user.totalScore.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60">คะแนนรวม</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="text-center glass-dark px-4 py-2 rounded-xl border border-yellow-400/30 relative cursor-pointer bg-gradient-to-br from-yellow-400/5 to-orange-400/5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowExpModal(true)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                      {user.experience}
                    </p>
                    <motion.div
                      animate={{ 
                        rotate: [0, -10, 10, -10, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Info className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  </div>
                  <p className="text-xs text-white/60">EXP</p>
                </motion.div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-white/20" />

              {/* Actions */}
              <div className="flex items-center gap-2">
                <SoundToggle />
                
                <motion.button
                  onClick={() => router.push('/profile')}
                  className="p-2 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  onClick={handleSignOut}
                  className="p-2 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* EXP Modal */}
      <AnimatePresence>
        {showExpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowExpModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-dark rounded-3xl p-6 md:p-8 max-w-lg w-full border border-metaverse-purple/30 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-xl">
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">ระบบ EXP</h3>
                    <p className="text-sm text-white/60">Experience Points</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExpModal(false)}
                  className="p-2 glass rounded-full hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Current EXP */}
              <div className="glass bg-gradient-to-r from-metaverse-purple/10 to-metaverse-pink/10 rounded-xl p-4 mb-6 border border-metaverse-purple/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">EXP ปัจจุบันของคุณ</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                      {user.experience.toLocaleString()}
                    </p>
                  </div>
                  <Zap className="w-12 h-12 text-metaverse-purple/30" />
                </div>
              </div>

              {/* Play Streak Info */}
              {user.playStreak && user.playStreak > 0 && (
                <div className="glass bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-xl p-4 mb-6 border border-yellow-400/30">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-white font-medium">
                        เล่นต่อเนื่อง {user.playStreak} วัน!
                      </p>
                      <p className="text-sm text-white/60">
                        รับโบนัส {Math.min(user.playStreak * 10, 100)} EXP ต่อเกม
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* How to earn EXP */}
              <div className="space-y-3 mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">วิธีรับ EXP:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-metaverse-purple">•</span>
                    <p className="text-white/80">
                      <span className="font-medium">คะแนนพื้นฐาน:</span> 10-20 EXP ต่อข้อที่ถูก (เพิ่มตาม Level)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-metaverse-purple">•</span>
                    <p className="text-white/80">
                      <span className="font-medium">โบนัสความสำเร็จ:</span> สูงสุด 100 EXP (Perfect Score)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-metaverse-purple">•</span>
                    <p className="text-white/80">
                      <span className="font-medium">โบนัสวันแรก:</span> 50 EXP (เล่นครั้งแรกของวัน)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-metaverse-purple">•</span>
                    <p className="text-white/80">
                      <span className="font-medium">โบนัสต่อเนื่อง:</span> 10-100 EXP (เล่นทุกวัน)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <p className="text-white/80">
                      <span className="font-medium text-red-400">หักคะแนน:</span> -50% ถ้าเล่น Level เดิมเกิน 3 ครั้ง
                    </p>
                  </div>
                </div>
              </div>

              {/* EXP Table */}
              <div className="space-y-3 mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">ตาราง EXP:</h4>
                <div className="glass rounded-xl overflow-hidden border border-metaverse-purple/20">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-metaverse-purple/20">
                        <th className="text-left p-3 text-white/80">ความสำเร็จ</th>
                        <th className="text-right p-3 text-white/80">โบนัส EXP</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-metaverse-purple/10">
                        <td className="p-3 text-white/70">Perfect (100%)</td>
                        <td className="text-right p-3 text-yellow-400 font-bold">+100</td>
                      </tr>
                      <tr className="border-t border-metaverse-purple/10">
                        <td className="p-3 text-white/70">Excellent (95%+)</td>
                        <td className="text-right p-3 text-green-400 font-bold">+80</td>
                      </tr>
                      <tr className="border-t border-metaverse-purple/10">
                        <td className="p-3 text-white/70">Very Good (90%+)</td>
                        <td className="text-right p-3 text-green-400 font-bold">+60</td>
                      </tr>
                      <tr className="border-t border-metaverse-purple/10">
                        <td className="p-3 text-white/70">Good (85%+)</td>
                        <td className="text-right p-3 text-blue-400 font-bold">+40</td>
                      </tr>
                      <tr className="border-t border-metaverse-purple/10">
                        <td className="p-3 text-white/70">เล่นครั้งแรกของวัน</td>
                        <td className="text-right p-3 text-orange-400 font-bold">+50</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Future use */}
              <div className="glass bg-gradient-to-r from-metaverse-purple/20 to-metaverse-pink/20 rounded-xl p-4 border border-metaverse-purple/30">
                <div className="flex items-start gap-3">
                  <Gift className="w-6 h-6 text-metaverse-purple mt-0.5" />
                  <div>
                    <p className="font-semibold text-white mb-1">นำ EXP ไปใช้ในอนาคต</p>
                    <p className="text-sm text-white/70">
                      สะสม EXP เพื่อแลกรางวัลพิเศษ เช่น ธีมใหม่, ตัวละครพิเศษ, 
                      หรือไอเทมช่วยเล่นในอนาคต!
                    </p>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <motion.button
                onClick={() => setShowExpModal(false)}
                className="w-full mt-6 py-3 metaverse-button text-white font-bold rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                เข้าใจแล้ว
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}