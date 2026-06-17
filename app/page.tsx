'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swords, Target, Trophy, Gift, Pi, UserPlus, BookOpen, Gamepad2, Lightbulb } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

// Math symbols for floating animation
const mathSymbols = ['+', '-', '×', '÷', '=', '>', '<', '√', 'π', '∞', '∑', '∫'];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate floating symbols with fixed positions
  const floatingSymbols = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    symbol: mathSymbols[i % mathSymbols.length],
    left: `${(i * 5) % 100}%`,
    delay: i * 0.3,
    duration: 15 + (i % 3) * 5,
  }));

  return (
    <div className="min-h-screen bg-metaverse-black overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-50"></div>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.3) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Floating Math Symbols */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingSymbols.map((item) => (
            <motion.div
              key={item.id}
              className="absolute text-metaverse-purple/30 text-4xl md:text-6xl font-bold"
              style={{ left: item.left, textShadow: '0 0 20px rgba(147, 51, 234, 0.5)' }}
              initial={{ y: '120vh' }}
              animate={{ y: '-20vh' }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                delay: item.delay,
                ease: 'linear',
              }}
            >
              {item.symbol}
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="text-center mb-12"
        >
          {/* Animated Game Icon */}
          <motion.div
            className="inline-block mb-6 text-white"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Pi className="w-20 h-20 filter drop-shadow-[0_0_30px_rgba(147,51,234,0.5)]" />
          </motion.div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-lg">
            Math
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-red">
              Quest
            </span>
          </h1>
          <p className="text-xl md:text-3xl text-white/80 font-medium">
            การผจญภัยแห่งตัวเลข
          </p>
        </motion.div>

        {/* Character Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-12"
        >
          <div className="glass-dark rounded-full px-8 py-4 flex items-center gap-4 shadow-xl border border-metaverse-purple/30">
            {['🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🦹‍♂️', '🦹‍♀️', '🐉', '🦊'].map((emoji, index) => (
              <motion.span
                key={index}
                className="text-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-4 mb-16 w-full max-w-2xl"
        >
          {user ? (
            <>
              {/* Welcome message */}
              <div className="text-center mb-6">
                <p className="text-white/80 text-lg md:text-xl">
                  สวัสดี <span className="font-bold text-white">{user.displayName || user.username}</span> 👋
                </p>
                <p className="text-white/60 text-base md:text-lg mt-1">
                  วันนี้อยากทำอะไรดี?
                </p>
              </div>

              {/* Three-choice grid: Play Quiz / Life Math / Learn */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <Link href="/play" className="group block">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative glass-dark rounded-3xl p-6 shadow-xl border border-metaverse-red/30 h-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-metaverse-red/30 to-metaverse-darkRed/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-metaverse-red to-metaverse-darkRed flex items-center justify-center mb-4 shadow-lg shadow-metaverse-red/40">
                        <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Play Quiz</h3>
                      <p className="text-white/70 text-xs sm:text-sm">
                        ผจญภัย 100 ด่าน เก็บคะแนน
                      </p>
                    </div>
                  </motion.div>
                </Link>

                <Link
                  href="/life-math"
                  className="group block"
                >
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative glass-dark rounded-3xl p-6 shadow-xl border border-amber-400/40 h-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/40">
                        <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Life Math</h3>
                      <p className="text-white/70 text-xs sm:text-sm">
                        ทักษะคำนวณในชีวิตประจำวัน
                      </p>
                    </div>
                  </motion.div>
                </Link>

                <Link href="/learn" className="group block">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative glass-dark rounded-3xl p-6 shadow-xl border border-metaverse-purple/30 h-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-metaverse-purple/30 to-metaverse-pink/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-metaverse-purple to-metaverse-pink flex items-center justify-center mb-4 shadow-lg shadow-metaverse-purple/40">
                        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Learn</h3>
                      <p className="text-white/70 text-xs sm:text-sm">
                        บทเรียนคณิตศาสตร์ พร้อมแบบฝึก
                      </p>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Main Login Button */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="group relative px-12 py-5 metaverse-button text-white font-bold text-xl rounded-full shadow-2xl overflow-hidden transition-all hover:shadow-metaverse-purple/50 inline-block"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Swords className="w-6 h-6" />
                    เริ่มการผจญภัย
                  </span>
                </Link>
              </div>

              {/* Register Section */}
              <div className="text-center">
                <p className="text-white/60 mb-2">ยังไม่มีบัญชี?</p>
                <Link
                  href="/register"
                  className="px-8 py-3 glass text-white font-medium text-lg rounded-full shadow-xl border border-metaverse-purple/50 hover:bg-white/10 transition-all inline-block"
                >
                  <motion.span
                    className="flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserPlus className="w-5 h-5" />
                    สมัครสมาชิก
                  </motion.span>
                </Link>
              </div>
            </>
          )}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-12"
        >
          {[
            {
              icon: <Target className="w-12 h-12" />,
              title: '100 Levels',
              description: 'ฝึกฝนทักษะคณิตศาสตร์ ตั้งแต่ง่ายจนถึงยาก',
              color: 'from-metaverse-purple to-metaverse-pink'
            },
            {
              icon: <Trophy className="w-12 h-12" />,
              title: 'Ranking',
              description: 'แข่งขันกับเพื่อนๆ ในระดับชั้นเดียวกัน',
              color: 'from-metaverse-pink to-metaverse-red'
            },
            {
              icon: <Gift className="w-12 h-12" />,
              title: 'Daily Rewards',
              description: 'เข้าเล่นต่อเนื่อง รับโบนัสพิเศษ',
              color: 'from-metaverse-red to-metaverse-darkRed'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`} />
              <div className="relative glass-dark rounded-3xl p-8 shadow-xl h-full border border-metaverse-purple/20">
                <motion.div 
                  className="text-white mb-4"
                  animate={{ 
                    rotate: mounted ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="glass-dark rounded-full px-6 py-4 sm:px-8 sm:py-6 shadow-xl border border-metaverse-purple/30 w-full max-w-sm sm:max-w-none"
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-white">
            <motion.div 
              className="text-center"
              animate={{ scale: mounted ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-xl sm:text-3xl font-bold">1,000+</p>
              <p className="text-xs sm:text-sm opacity-70">นักเรียน</p>
            </motion.div>
            <motion.div 
              className="text-center"
              animate={{ scale: mounted ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <p className="text-xl sm:text-3xl font-bold">50K+</p>
              <p className="text-xs sm:text-sm opacity-70">โจทย์</p>
            </motion.div>
            <motion.div 
              className="text-center"
              animate={{ scale: mounted ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <p className="text-xl sm:text-3xl font-bold">4.9⭐</p>
              <p className="text-xs sm:text-sm opacity-70">รีวิว</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-white/60 text-center text-lg"
        >
          📱 เล่นได้ทุกอุปกรณ์ • 🌐 ไม่ต้องดาวน์โหลด • 🔒 ปลอดภัย 100%
        </motion.p>
      </div>
    </div>
  );
}