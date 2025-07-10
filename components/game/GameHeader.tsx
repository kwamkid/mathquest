// components/game/GameHeader.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Trophy, Zap, X, Gift, Info, Crown } from 'lucide-react';
import EnhancedSoundToggle from './EnhancedSoundToggle';
import { getQuestionCount } from '@/lib/game/config';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import { useBackgroundMusic } from '@/lib/game/backgroundMusicManager';
import Link from 'next/link';
import { TITLE_BADGES } from '@/lib/data/items';

interface GameHeaderProps {
  user: User;
  hideActions?: boolean;
}

export default function GameHeader({ user, hideActions = false }: GameHeaderProps) {
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

  // คำนวณจำนวน level ที่ผ่านแล้ว
  const getPassedLevels = (): number => {
    if (!user.levelScores) return 0;
    
    return Object.values(user.levelScores).filter(score => {
      const questionCount = getQuestionCount(user.grade);
      const percentage = (score.highScore / questionCount) * 100;
      return percentage > 85;
    }).length;
  };

  // Get title badge data
  const getTitleBadgeData = (titleId: string | undefined) => {
    if (!titleId) return null;
    
    // ลองหาจาก local data ก่อน
    const localData = TITLE_BADGES[titleId];
    if (localData) {
      return {
        name: localData.name,
        color: localData.color || '#FFD700'
      };
    }
    
    // ถ้าไม่มีใน local data ให้ใช้ default
    return {
      name: titleId.replace(/title-/g, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: '#FFD700'
    };
  };

  const titleData = getTitleBadgeData(user.currentTitleBadge);

  return (
    <>
      <header className="glass-dark border-b border-metaverse-purple/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-2 md:py-3">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Row 1: User Info + Actions */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {hideActions ? (
                  <div className="cursor-not-allowed opacity-60">
                    <EnhancedAvatarDisplay
                      userId={user.id}
                      avatarData={user.avatarData}
                      basicAvatar={user.avatar}
                      size="tiny"
                      showEffects={false}
                      showAccessories={true}
                    />
                  </div>
                ) : (
                  <Link href="/my-avatar" className="group">
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <EnhancedAvatarDisplay
                        userId={user.id}
                        avatarData={user.avatarData}
                        basicAvatar={user.avatar}
                        size="tiny"
                        showEffects={false}
                        showAccessories={true}
                      />
                    </motion.div>
                  </Link>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    {/* แสดง Title Badge เป็นส่วนหนึ่งของชื่อ */}
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                      {titleData && (
                        <span 
                          className="font-bold"
                          style={{ color: titleData.color }}
                        >
                          {titleData.name}
                        </span>
                      )}
                      <span className={titleData ? 'text-white' : ''}>
                        {user.displayName || user.username}
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70 mt-0.5">
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
              {!hideActions && (
                <div className="flex items-center gap-1">
                  <Link
                    href="/rewards"
                    className="p-1.5 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                  >
                    <Gift className="w-4 h-4" />
                  </Link>
                  
                  <EnhancedSoundToggle />
                  
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
              )}
            </div>
            
            {/* Row 2: Stats */}
            <div className="flex items-center gap-2">
              <motion.div 
                className="flex-1 glass-dark px-2 py-1.5 rounded-lg border border-metaverse-purple/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">คะแนนรวม</span>
                  <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    {user.totalScore.toLocaleString()}
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="flex-1 glass-dark px-2 py-1.5 rounded-lg border border-yellow-400/30 relative cursor-pointer bg-gradient-to-br from-yellow-400/5 to-orange-400/5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !hideActions && setShowExpModal(true)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">EXP</span>
                  <div className="flex items-center gap-1">
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                      {user.experience.toLocaleString()}
                    </p>
                    {!hideActions && (
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
                        <Info className="w-3 h-3 text-yellow-400" />
                      </motion.div>
                    )}
                  </div>
                </div>
                {!hideActions && (
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-metaverse-black rounded-full px-1 py-0.5 text-[9px] font-bold shadow-lg"
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
                )}
              </motion.div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            {/* User Info */}
            <div className="flex items-center gap-3">
              {hideActions ? (
                <div className="cursor-not-allowed opacity-60">
                  <EnhancedAvatarDisplay
                    userId={user.id}
                    avatarData={user.avatarData}
                    basicAvatar={user.avatar}
                    size="tiny"
                    showEffects={false}
                    showTitle={false}
                    showAccessories={true}
                  />
                </div>
              ) : (
                <Link href="/my-avatar" className="group">
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <EnhancedAvatarDisplay
                      userId={user.id}
                      avatarData={user.avatarData}
                      basicAvatar={user.avatar}
                      size="tiny"
                      showEffects={false}
                      showTitle={false}
                      showAccessories={true}
                    />
                  </motion.div>
                </Link>
              )}
              <div>
                {/* แสดง Title Badge เป็นส่วนหนึ่งของชื่อ */}
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  {titleData && (
                    <span 
                      className="font-bold"
                      style={{ color: titleData.color }}
                    >
                      {titleData.name}
                    </span>
                  )}
                  <span className={titleData ? 'text-white' : ''}>
                    {user.displayName || user.username}
                  </span>
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
                  className="text-center glass-dark px-3 py-1.5 rounded-xl border border-metaverse-purple/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div>
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                      {user.totalScore.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60">คะแนนรวม</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="text-center glass-dark px-3 py-1.5 rounded-xl border border-yellow-400/30 relative cursor-pointer bg-gradient-to-br from-yellow-400/5 to-orange-400/5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !hideActions && setShowExpModal(true)}
                >
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                      {user.experience}
                    </p>
                    {!hideActions && (
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
                    )}
                  </div>
                  <p className="text-xs text-white/60">EXP</p>
                </motion.div>
              </div>

              {/* Actions */}
              {!hideActions && (
                <>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Link
                      href="/rewards"
                      className="p-2 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white group relative"
                    >
                      <Gift className="w-5 h-5" />
                      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/0 group-hover:text-white/80 transition whitespace-nowrap">
                        Reward Shop
                      </span>
                    </Link>
                    
                    <EnhancedSoundToggle />
                    
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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* EXP Modal */}
      <AnimatePresence>
        {showExpModal && !hideActions && (
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
                <Link
                  href="/rewards"
                  className="mt-3 block text-center py-2 metaverse-button rounded-lg text-white font-medium"
                >
                  ไปที่ Reward Shop
                </Link>
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

              {/* EXP Usage */}
              <div className="glass bg-gradient-to-r from-metaverse-purple/20 to-metaverse-pink/20 rounded-xl p-4 border border-metaverse-purple/30">
                <div className="flex items-start gap-3">
                  <Gift className="w-6 h-6 text-metaverse-purple mt-0.5" />
                  <div>
                    <p className="font-semibold text-white mb-1">ใช้ EXP แลกรางวัล</p>
                    <p className="text-sm text-white/70 mb-2">
                      นำ EXP ไปแลก Avatars พิเศษ, เครื่องประดับ, Title Badges, 
                      Boost Items หรือของรางวัลจริง!
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-white/10 rounded-full text-white/80">🦸 Premium Avatars</span>
                      <span className="px-2 py-1 bg-white/10 rounded-full text-white/80">👑 Accessories</span>
                      <span className="px-2 py-1 bg-white/10 rounded-full text-white/80">🏆 Title Badges</span>
                      <span className="px-2 py-1 bg-white/10 rounded-full text-white/80">⚡ EXP Boosts</span>
                      <span className="px-2 py-1 bg-white/10 rounded-full text-white/80">📦 ของจริง</span>
                    </div>
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