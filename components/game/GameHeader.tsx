// components/game/GameHeader.tsx
'use client';

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, X, Gift, Info, Crown, ShoppingBag, Zap,Sparkles } from 'lucide-react';
import EnhancedSoundToggle from './EnhancedSoundToggle';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import Link from 'next/link';
import { TITLE_BADGES } from '@/lib/data/items';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface GameHeaderProps {
  user: User;
  hideActions?: boolean;
}

// ✅ Move cache outside component to persist across re-renders
const titleCache = new Map<string, { name: string; color: string }>();

function GameHeader({ user, hideActions = false }: GameHeaderProps) {
  const router = useRouter();
  const [showExpModal, setShowExpModal] = useState(false);
  const [titleData, setTitleData] = useState<{ name: string; color: string } | null>(null);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // ✅ Optimize: Load title only once per titleBadge
  useEffect(() => {
    // ถ้าไม่มี titleBadge หรือมีใน cache แล้ว ไม่ต้อง load
    if (!user.currentTitleBadge) {
      setTitleData(null);
      return;
    }
    
    if (titleCache.has(user.currentTitleBadge)) {
      setTitleData(titleCache.get(user.currentTitleBadge)!);
      return;
    }
    
    // Load จาก local data หรือ Firebase
    const loadTitleData = async () => {
      // Try local data first
      const localData = TITLE_BADGES[user.currentTitleBadge!];
      if (localData) {
        const data = {
          name: localData.name,
          color: localData.color || '#FFD700'
        };
        titleCache.set(user.currentTitleBadge!, data);
        setTitleData(data);
        return;
      }
      
      // Try Firebase (only if not in local)
      try {
        const rewardsQuery = query(
          collection(db, 'rewards'),
          where('itemId', '==', user.currentTitleBadge),
          where('type', '==', 'titleBadge'),
          limit(1)
        );
        
        const snapshot = await getDocs(rewardsQuery);
        
        if (!snapshot.empty) {
          const rewardData = snapshot.docs[0].data();
          const data = {
            name: rewardData.name || user.currentTitleBadge,
            color: rewardData.color || '#FFD700'
          };
          titleCache.set(user.currentTitleBadge!, data);
          setTitleData(data);
          return;
        }
      } catch (error) {
        console.error('Error loading title badge:', error);
      }
      
      // Use default
      const defaultData = {
        name: user.currentTitleBadge!.replace(/title-/g, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        color: '#FFD700'
      };
      titleCache.set(user.currentTitleBadge!, defaultData);
      setTitleData(defaultData);
    };
    
    loadTitleData();
  }, [user.currentTitleBadge]); // ✅ เปลี่ยนเฉพาะเมื่อ titleBadge เปลี่ยน

  // Helper function to check if color is gradient
  const isGradient = (color: string) => {
    return color.includes('linear-gradient') || color.includes('radial-gradient');
  };

  // Get grade display name
  const getGradeDisplayName = (grade: string): string => {
    const gradeMap: Record<string, string> = {
      K1: 'อนุบาล 1', K2: 'อนุบาล 2', K3: 'อนุบาล 3',
      P1: 'ประถม 1', P2: 'ประถม 2', P3: 'ประถม 3',
      P4: 'ประถม 4', P5: 'ประถม 5', P6: 'ประถม 6',
      M1: 'มัธยม 1', M2: 'มัธยม 2', M3: 'มัธยม 3',
      M4: 'มัธยม 4', M5: 'มัธยม 5', M6: 'มัธยม 6',
    };
    return gradeMap[grade] || grade;
  };

  return (
    <>
      <header className="glass-dark border-b border-metaverse-purple/30 sticky top-0 z-40">
        <div className="container mx-auto px-3 py-1">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Row 1: User Info + Actions */}
            <div className="flex items-center justify-between mb-0.5">
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
                  <Link href="/my-avatar" className="group relative">
                    {/* ✅ ลด avatar animation complexity */}
                    <div className="relative">
                      <EnhancedAvatarDisplay
                        userId={user.id}
                        avatarData={user.avatarData}
                        basicAvatar={user.avatar}
                        size="tiny"
                        showEffects={false}
                        showAccessories={true}
                      />
                    </div>
                  </Link>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                      {titleData && (
                        <span 
                          className="font-bold"
                          style={isGradient(titleData.color) ? {
                            background: titleData.color,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent'
                          } : {
                            color: titleData.color
                          }}
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
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              {!hideActions && (
                <div className="flex items-center gap-1">
                  {/* Reward Shop Button */}
                  <Link href="/rewards" className="relative">
                    {/* ✅ ลด animation complexity */}
                    <div className="p-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full px-1">
                      SHOP
                    </div>
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
                className="flex-1 glass-dark px-2 py-1 rounded-lg border border-metaverse-purple/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60">คะแนน</span>
                  <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    {user.totalScore.toLocaleString()}
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="flex-1 glass-dark px-2 py-1 rounded-lg border border-yellow-400/30 relative cursor-pointer bg-gradient-to-br from-yellow-400/5 to-orange-400/5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !hideActions && setShowExpModal(true)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60">EXP</span>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                      {user.experience.toLocaleString()}
                    </p>
                    {!hideActions && (
                      <Info className="w-2.5 h-2.5 text-yellow-400" />
                    )}
                  </div>
                </div>
                {!hideActions && (
                  <div className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-metaverse-black rounded-full px-1 py-0.5 text-[8px] font-bold shadow-lg">
                    กดดู
                  </div>
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
                <Link href="/my-avatar" className="group relative">
                  {/* ✅ ลด animation */}
                  <div className="relative">
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
                </Link>
              )}
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  {titleData && (
                    <span 
                      className="font-bold"
                      style={isGradient(titleData.color) ? {
                        background: titleData.color,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent'
                      } : {
                        color: titleData.color
                      }}
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
                </div>
              </div>
            </div>

            {/* Right Side: Stats + Actions */}
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-2">
                <motion.div 
                  className="text-center glass-dark px-2.5 py-1 rounded-xl border border-metaverse-purple/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div>
                    <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                      {user.totalScore.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-white/60">คะแนนรวม</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="text-center glass-dark px-2.5 py-1 rounded-xl border border-yellow-400/30 relative cursor-pointer bg-gradient-to-br from-yellow-400/5 to-orange-400/5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !hideActions && setShowExpModal(true)}
                >
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                      {user.experience}
                    </p>
                    {!hideActions && (
                      <Info className="w-3.5 h-3.5 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-white/60">EXP</p>
                </motion.div>
              </div>

              {/* Actions */}
              {!hideActions && (
                <>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="flex items-center gap-2">
                    {/* Reward Shop */}
                    <Link href="/rewards" className="relative group">
                      {/* ✅ ลด animation */}
                      <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 shadow-md">
                        SHOP
                      </div>
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
                    <Crown className="w-6 h-6 text-yellow-400" />
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

// ✅ เพิ่ม React.memo พร้อม custom comparison
export default memo(GameHeader, (prevProps, nextProps) => {
  // Only re-render if these specific fields change
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.totalScore === nextProps.user.totalScore &&
    prevProps.user.experience === nextProps.user.experience &&
    prevProps.user.level === nextProps.user.level &&
    prevProps.user.currentTitleBadge === nextProps.user.currentTitleBadge &&
    prevProps.hideActions === nextProps.hideActions
  );
});