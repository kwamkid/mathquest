// app/(game)/summary/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  Award,
  Gift,
  Home,
  RefreshCw,
  Crown,
  Rocket,
  RotateCcw,
  BarChart3,
} from 'lucide-react';

interface ExpBreakdown {
  label: string;
  value: number;
  description: string;
}

// Confetti functions
const fireConfetti = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
};

const fireLevelUpConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

// Separate component for content that uses useSearchParams
function SummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Get params from URL
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const percentage = parseInt(searchParams.get('percentage') || '0');
  const levelChange = searchParams.get('levelChange') || 'maintain';
  const newLevel = parseInt(searchParams.get('newLevel') || '1');
  const oldLevel = parseInt(searchParams.get('oldLevel') || '1');
  const exp = parseInt(searchParams.get('exp') || '0');
  const isHighScore = searchParams.get('highScore') === 'true';
  const scoreDiff = parseInt(searchParams.get('scoreDiff') || '0');
  const timeSpent = parseInt(searchParams.get('time') || '0');
  const playStreak = parseInt(searchParams.get('playStreak') || '0');
  const isFirstToday = searchParams.get('isFirstToday') === 'true';
  const boostMultiplier = parseFloat(searchParams.get('boostMultiplier') || '1');
  
  // Parse EXP breakdown
  let expBreakdown: ExpBreakdown[] = [];
  try {
    const expBreakdownParam = searchParams.get('expBreakdown');
    if (expBreakdownParam) {
      expBreakdown = JSON.parse(expBreakdownParam);
    }
  } catch (e) {
    console.error('Error parsing exp breakdown:', e);
  }

  // Fire confetti effects
  useEffect(() => {
    // Delay a bit to ensure page is loaded
    const timer = setTimeout(() => {
      if (percentage >= 85) {
        fireConfetti();
      }
      if (levelChange === 'increase') {
        fireLevelUpConfetti();
      }
      if (percentage === 100) {
        // Special confetti for perfect score
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [percentage, levelChange]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get performance message
  const getPerformanceMessage = () => {
    if (percentage === 100) return { text: 'Perfect! ยอดเยี่ยมมาก!', color: 'text-yellow-400' };
    if (percentage >= 95) return { text: 'Excellent! เก่งมาก!', color: 'text-green-400' };
    if (percentage >= 90) return { text: 'Very Good! ดีมาก!', color: 'text-green-400' };
    if (percentage >= 85) return { text: 'Good! ดี!', color: 'text-blue-400' };
    if (percentage >= 70) return { text: 'ทำได้ดี พยายามต่อไป!', color: 'text-blue-400' };
    if (percentage >= 50) return { text: 'พยายามอีกนิด!', color: 'text-orange-400' };
    return { text: 'อย่าท้อ ลองใหม่นะ!', color: 'text-red-400' };
  };

  const performance = getPerformanceMessage();

  // Get level change info
  const getLevelChangeInfo = () => {
    switch (levelChange) {
      case 'increase':
        return {
          icon: <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />,
          text: 'Level Up!',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30'
        };
      case 'decrease':
        return {
          icon: <TrendingDown className="w-6 h-6 md:w-8 md:h-8" />,
          text: 'Level Down',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30'
        };
      default:
        return {
          icon: <Award className="w-6 h-6 md:w-8 md:h-8" />,
          text: 'Level คงเดิม',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/30'
        };
    }
  };

  const levelInfo = getLevelChangeInfo();

  // Handle play same level
  const handlePlaySameLevel = () => {
    // Force play the same level and auto start
    localStorage.setItem('forceLevel', oldLevel.toString());
    router.push(`/play?autoStart=true`);
  };

  // Handle play next
  const handlePlayNext = () => {
    // Clear force level to play the new level naturally and auto start
    localStorage.removeItem('forceLevel');
    router.push(`/play?autoStart=true`);
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-metaverse-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Main Container - ใช้ flex layout */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Navigation - Fixed */}
        <div className="flex-none p-4">
          <div className="flex justify-between max-w-4xl mx-auto">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push('/play')}
              className="p-2 glass rounded-full hover:bg-white/10 transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5 text-white/70" />
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push('/ranking')}
              className="p-2 glass rounded-full hover:bg-white/10 transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-5 h-5 text-white/70" />
            </motion.button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-3"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">สรุปผลการเล่น</h1>
              <p className={`text-lg md:text-xl font-medium ${performance.color}`}>
                {performance.text}
              </p>
            </motion.div>

            {/* Avatar & Main Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-dark rounded-2xl p-4 md:p-6 border border-metaverse-purple/30 text-center mb-3"
            >
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="inline-block mb-3"
              >
                <EnhancedAvatarDisplay
                  userId={user.id}
                  avatarData={user?.avatarData}
                  basicAvatar={user?.avatar}
                  size="large"
                  showEffects={true}
                  showTitle={true}
                  titleBadge={user?.currentTitleBadge}
                  showAccessories={true}
                />
              </motion.div>

              {/* Score Display */}
              <div className="mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.4 }}
                  className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink mb-2"
                >
                  {score}/{total}
                </motion.div>
                
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="w-full max-w-xs mx-auto bg-white/10 rounded-full h-6 overflow-hidden mb-3"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className={`h-full bg-gradient-to-r ${
                      percentage >= 85 ? 'from-green-400 to-emerald-400' :
                      percentage >= 50 ? 'from-orange-400 to-yellow-400' :
                      'from-red-400 to-pink-400'
                    }`}
                  />
                </motion.div>
                
                <p className="text-2xl font-bold text-white">
                  {percentage}% ถูกต้อง
                </p>
              </div>

              {/* High Score Badge */}
              {isHighScore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="inline-block glass bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full px-4 py-2 border border-yellow-400/30"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm md:text-base font-bold text-yellow-400">
                      New High Score! (+{scoreDiff} คะแนน)
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Level Change */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className={`glass-dark rounded-xl p-3 md:p-4 border ${levelInfo.borderColor} ${levelInfo.bgColor}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Level</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-xl font-bold text-white">
                        {oldLevel}
                      </span>
                      <span className={levelInfo.color}>→</span>
                      <span className={`text-lg md:text-xl font-bold ${levelInfo.color}`}>
                        {newLevel}
                      </span>
                    </div>
                    <p className={`font-medium text-sm ${levelInfo.color}`}>
                      {levelInfo.text}
                    </p>
                  </div>
                  <div className={levelInfo.color}>
                    {levelInfo.icon}
                  </div>
                </div>
              </motion.div>

              {/* Time */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="glass-dark rounded-xl p-3 md:p-4 border border-metaverse-purple/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60 mb-1">เวลาที่ใช้</p>
                    <p className="text-lg md:text-xl font-bold text-white">
                      {formatTime(timeSpent)}
                    </p>
                    <p className="text-xs text-white/60">
                      เฉลี่ย {Math.round(timeSpent / total)} วิ/ข้อ
                    </p>
                  </div>
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-metaverse-purple" />
                </div>
              </motion.div>
            </div>

            {/* EXP Earned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="glass-dark rounded-2xl p-4 border border-metaverse-purple/30 mb-3"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  EXP ที่ได้รับ
                </h3>
                {boostMultiplier > 1 && (
                  <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-medium">
                    Boost x{boostMultiplier}
                  </span>
                )}
              </div>
              
              {/* EXP Breakdown */}
              {expBreakdown.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {expBreakdown.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-white/80">{item.label}</span>
                        <span className="text-white/50 ml-1 text-xs hidden sm:inline">({item.description})</span>
                      </div>
                      <span className={`font-medium ${
                        item.value > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {item.value > 0 ? '+' : ''}{item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Total EXP */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base font-medium text-white">รวมทั้งหมด</span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 1.5 }}
                    className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400"
                  >
                    +{exp} EXP
                  </motion.span>
                </div>
              </div>

              {/* Streak Bonus Info */}
              {playStreak > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="mt-3 p-2 bg-yellow-400/10 rounded-lg border border-yellow-400/30"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400">
                      เล่นต่อเนื่อง {playStreak} วัน!
                      {isFirstToday && ' (+50 EXP โบนัสวันแรก)'}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Bottom Actions - Fixed */}
        <div className="flex-none p-4 bg-gradient-to-t from-metaverse-black via-metaverse-black/95 to-transparent">
          <div className="max-w-4xl mx-auto">
            {/* First Row - Play Buttons */}
            <div className="flex gap-3 mb-3">
              {/* เล่น Level เดิมซ้ำ */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.7 }}
                onClick={handlePlaySameLevel}
                className="flex-1 py-3 glass-dark rounded-xl border border-metaverse-purple/30 hover:bg-white/5 transition flex items-center justify-center gap-2 text-white font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-5 h-5" />
                <span>เล่น Level {oldLevel} อีกครั้ง</span>
              </motion.button>

              {/* เล่นต่อ */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 }}
                onClick={handlePlayNext}
                className={`flex-1 py-3 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-white font-bold ${
                  levelChange === 'increase' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : percentage >= 85
                      ? 'metaverse-button'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {levelChange === 'increase' ? (
                  <>
                    <Rocket className="w-5 h-5" />
                    <span>เข้าสู่ Level {newLevel}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>เล่นต่อ</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Second Row - Navigation Buttons */}
            <div className="flex gap-3">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.9 }}
                onClick={() => router.push('/play')}
                className="flex-1 py-2.5 glass rounded-xl border border-metaverse-purple/30 hover:bg-white/10 transition flex items-center justify-center gap-2 text-white/80 hover:text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-5 h-5" />
                <span>หน้าหลัก</span>
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                onClick={() => router.push('/ranking')}
                className="flex-1 py-2.5 glass rounded-xl border border-metaverse-purple/30 hover:bg-white/10 transition flex items-center justify-center gap-2 text-white/80 hover:text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BarChart3 className="w-5 h-5" />
                <span>อันดับ</span>
              </motion.button>
            </div>

            {/* EXP display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.1 }}
              className="text-center mt-2"
            >
              <p className="text-sm text-white/60">
                EXP ทั้งหมด: <span className="text-yellow-400 font-medium">{user?.experience.toLocaleString()}</span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          ⏳
        </motion.div>
      </div>
    }>
      <SummaryContent />
    </Suspense>
  );
}