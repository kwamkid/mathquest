'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Math symbols for floating animation
const mathSymbols = ['+', '-', '×', '÷', '=', '>', '<', '√', 'π', '∞', '∑', '∫'];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 overflow-hidden relative">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Floating Math Symbols */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingSymbols.map((item) => (
            <motion.div
              key={item.id}
              className="absolute text-white/10 text-4xl md:text-6xl font-bold"
              style={{ left: item.left }}
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
            className="inline-block mb-6"
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
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
              <span className="text-7xl">🎮</span>
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-lg">
            Math
            <span className="text-yellow-300">Quest</span>
          </h1>
          <p className="text-xl md:text-3xl text-white/90 font-medium">
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
          <div className="bg-white/10 backdrop-blur-md rounded-full px-8 py-4 flex items-center gap-4 shadow-xl">
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
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Link
            href="/register"
            className="group relative px-10 py-5 bg-white text-red-600 font-bold text-xl rounded-full shadow-2xl overflow-hidden transition-all hover:shadow-3xl inline-block"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
              <span className="text-2xl">🚀</span>
              เริ่มการผจญภัย
            </span>
          </Link>

          <Link
            href="/login"
            className="px-10 py-5 bg-white/20 backdrop-blur-md text-white font-bold text-xl rounded-full shadow-xl border-2 border-white/30 hover:bg-white/30 transition-all inline-block"
          >
            <motion.span 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">⚔️</span>
              เข้าสู่ระบบ
            </motion.span>
          </Link>
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
              icon: '🎯',
              title: '100 ระดับท้าทาย',
              description: 'ฝึกฝนทักษะคณิตศาสตร์ ตั้งแต่ง่ายจนถึงยาก',
              color: 'from-pink-500 to-red-500'
            },
            {
              icon: '🏆',
              title: 'ระบบแรงกิ้ง',
              description: 'แข่งขันกับเพื่อนๆ ในระดับชั้นเดียวกัน',
              color: 'from-yellow-500 to-orange-500'
            },
            {
              icon: '🎁',
              title: 'รางวัลทุกวัน',
              description: 'เข้าเล่นต่อเนื่อง รับโบนัสพิเศษ',
              color: 'from-green-500 to-teal-500'
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
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl h-full">
                <motion.div 
                  className="text-5xl mb-4"
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
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white/20 backdrop-blur-md rounded-full px-8 py-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8 text-white">
            <motion.div 
              className="text-center"
              animate={{ scale: mounted ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-3xl font-bold">1,000+</p>
              <p className="text-sm opacity-90">นักเรียน</p>
            </motion.div>
            <div className="hidden sm:block w-px h-12 bg-white/30" />
            <motion.div 
              className="text-center"
              animate={{ scale: mounted ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <p className="text-3xl font-bold">50,000+</p>
              <p className="text-sm opacity-90">โจทย์ที่ถูกแก้</p>
            </motion.div>
            <div className="hidden sm:block w-px h-12 bg-white/30" />
            <motion.div 
              className="text-center"
              animate={{ scale: mounted ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <p className="text-3xl font-bold">4.9 ⭐</p>
              <p className="text-sm opacity-90">คะแนนรีวิว</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-white/80 text-center text-lg"
        >
          📱 เล่นได้ทุกอุปกรณ์ • 🌐 ไม่ต้องดาวน์โหลด • 🔒 ปลอดภัย 100%
        </motion.p>
      </div>
    </div>
  );
}