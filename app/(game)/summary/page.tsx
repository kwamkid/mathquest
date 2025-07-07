'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User } from '@/types';
import AvatarDisplay from '@/components/avatar/AvatarDisplay';
import Link from 'next/link';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  Target,
  Award,
  Gift,
  CheckCircle,
  XCircle,
  Home,
  RefreshCw,
  Sparkles,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExpBreakdown {
  label: string;
  value: number;
  description: string;
}

export default function SummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get params from URL
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const percentage = parseInt(searchParams.get('percentage') || '0');
  const levelChange = searchParams.get('levelChange') || 'maintain';
  const newLevel = parseInt(searchParams.get('newLevel') || '1');
  const oldLevel = parseInt(searchParams.get('oldLevel') || '1');
  const exp = parseInt(searchParams.get('exp') || '0');
  const isHighScore = searchParams.get('highScore') === 'true';
  const oldHighScore = parseInt(searchParams.get('oldHighScore') || '0');
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

  useEffect(() => {
    loadUser();
    
    // Trigger confetti for good scores
    if (percentage >= 85 || isHighScore) {
      triggerConfetti();
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (!userData) {
        router.push('/login');
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
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
          icon: <TrendingUp className="w-8 h-8" />,
          text: 'Level Up!',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30'
        };
      case 'decrease':
        return {
          icon: <TrendingDown className="w-8 h-8" />,
          text: 'Level Down',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30'
        };
      default:
        return {
          icon: <Award className="w-8 h-8" />,
          text: 'Level คงเดิม',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/30'
        };
    }
  };

  const levelInfo = getLevelChangeInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metaverse-black py-8">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">สรุปผลการเล่น</h1>
          <p className={`text-2xl font-medium ${performance.color}`}>
            {performance.text}
          </p>
        </motion.div>

        {/* Avatar & Main Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-dark rounded-3xl p-8 mb-6 border border-metaverse-purple/30 text-center"
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="inline-block mb-6"
          >
            <AvatarDisplay
              avatarData={user?.avatarData}
              basicAvatar={user?.avatar}
              size="xlarge"
              showEffects={true}
              showTitle={true}
              titleBadge={user?.currentTitleBadge}
            />
          </motion.div>

          {/* Score Display */}
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink mb-2"
            >
              {score}/{total}
            </motion.div>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 1 }}
              className="w-full max-w-md mx-auto bg-white/10 rounded-full h-8 overflow-hidden mb-4"
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
            
            <p className="text-3xl font-bold text-white">
              {percentage}% ถูกต้อง
            </p>
          </div>

          {/* High Score Badge */}
          {isHighScore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="inline-block glass bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full px-6 py-3 border border-yellow-400/30"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <span className="text-lg font-bold text-yellow-400">
                  New High Score! (+{scoreDiff} คะแนน)
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Level Change */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className={`glass-dark rounded-2xl p-6 border ${levelInfo.borderColor} ${levelInfo.bgColor}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Level</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {oldLevel}
                  </span>
                  <span className={levelInfo.color}>→</span>
                  <span className={`text-2xl font-bold ${levelInfo.color}`}>
                    {newLevel}
                  </span>
                </div>
                <p className={`font-medium ${levelInfo.color}`}>
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
            className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">เวลาที่ใช้</p>
                <p className="text-2xl font-bold text-white">
                  {formatTime(timeSpent)}
                </p>
                <p className="text-sm text-white/60">
                  เฉลี่ย {Math.round(timeSpent / total)} วินาที/ข้อ
                </p>
              </div>
              <Clock className="w-8 h-8 text-metaverse-purple" />
            </div>
          </motion.div>
        </div>

        {/* EXP Earned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="glass-dark rounded-3xl p-6 mb-6 border border-metaverse-purple/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              EXP ที่ได้รับ
            </h3>
            {boostMultiplier > 1 && (
              <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-medium">
                Boost x{boostMultiplier}
              </span>
            )}
          </div>
          
          {/* EXP Breakdown */}
          {expBreakdown.length > 0 && (
            <div className="space-y-2 mb-4">
              {expBreakdown.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="text-white/80">{item.label}</span>
                    <span className="text-white/50 ml-2 text-xs">({item.description})</span>
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
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-white">รวมทั้งหมด</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 1.5 }}
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400"
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
              className="mt-4 p-3 bg-yellow-400/10 rounded-xl border border-yellow-400/30"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-yellow-400">
                  เล่นต่อเนื่อง {playStreak} วัน!
                  {isFirstToday && ' (+50 EXP โบนัสวันแรก)'}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
            onClick={() => router.push('/play')}
            className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30 hover:bg-white/5 transition group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-8 h-8 text-metaverse-purple mx-auto mb-2 group-hover:rotate-180 transition-transform duration-500" />
            <p className="text-white font-medium">เล่นอีกครั้ง</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            onClick={() => router.push('/ranking')}
            className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30 hover:bg-white/5 transition group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2 group-hover:bounce transition" />
            <p className="text-white font-medium">ดูอันดับ</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9 }}
            onClick={() => router.push('/rewards')}
            className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30 hover:bg-white/5 transition group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Gift className="w-8 h-8 text-metaverse-pink mx-auto mb-2 group-hover:wiggle transition" />
            <p className="text-white font-medium">แลกรางวัล</p>
            <p className="text-xs text-white/60 mt-1">
              EXP: {user?.experience.toLocaleString()}
            </p>
          </motion.button>
        </div>
      </div>
    </div>
  );
}