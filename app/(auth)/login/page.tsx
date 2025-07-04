'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/firebase/auth';
import { Pi, User, Lock, Eye, EyeOff, Sparkles, Star, Zap } from 'lucide-react';

// Login form component wrapped with search params
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Show success message if just registered
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอก Username';
    }
    
    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Firebase authentication
      await signIn(formData.username, formData.password);
      
      // Success - redirect to game
      router.push('/play');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Username หรือรหัสผ่านไม่ถูกต้อง';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-metaverse-black flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-40"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-pulse"></div>
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-metaverse-purple/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-metaverse-red/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating math symbols */}
        {['π', '∞', '∑', '√', '∫', 'Δ'].map((symbol, i) => (
          <motion.div
            key={i}
            className="absolute text-metaverse-purple/20 text-6xl font-bold"
            style={{
              left: `${10 + i * 15}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-50, 50, -50],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          >
            {symbol}
          </motion.div>
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-dark rounded-3xl shadow-2xl p-8 border border-metaverse-purple/30 backdrop-blur-xl">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-metaverse-purple via-metaverse-pink to-metaverse-red opacity-50 blur-2xl -z-10 animate-pulse"></div>
          
          {/* Logo */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-8"
          >
            {/* Pi Logo Animation */}
            <motion.div
              className="inline-block mb-4 relative"
              animate={{ 
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <Pi className="w-24 h-24 text-metaverse-purple filter drop-shadow-[0_0_50px_rgba(147,51,234,0.8)]" />
                
                {/* Sparkles around logo */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 60}deg) translateX(50px)`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Orbiting stars */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Star className="absolute w-3 h-3 text-yellow-400 -top-2 left-1/2 transform -translate-x-1/2" />
                <Star className="absolute w-3 h-3 text-orange-400 -bottom-2 left-1/2 transform -translate-x-1/2" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Math<span className="text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-red">Quest</span>
            </motion.h1>
            <motion.p 
              className="text-white/70 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              เข้าสู่ระบบเพื่อเริ่มการผจญภัย
            </motion.p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="glass border border-green-500/50 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1 }}
                >
                  ✅
                </motion.div>
                สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ
              </motion.div>
            )}

            {/* Username */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-white/80 font-medium mb-2">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-white/40 group-focus-within:text-metaverse-purple transition" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition-all ${
                    errors.username ? 'border-2 border-red-500' : 'border border-metaverse-purple/50 focus:border-metaverse-pink focus:shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                  } text-white placeholder-white/50`}
                  placeholder="ชื่อผู้ใช้ของคุณ"
                  disabled={isLoading}
                />
                {/* Glow effect on focus */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-metaverse-purple to-metaverse-pink opacity-0 group-focus-within:opacity-20 blur-xl transition pointer-events-none"></div>
              </div>
              {errors.username && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.username}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-white/80 font-medium mb-2">
                รหัสผ่าน
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-white/40 group-focus-within:text-metaverse-purple transition" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition-all ${
                    errors.password ? 'border-2 border-red-500' : 'border border-metaverse-purple/50 focus:border-metaverse-pink focus:shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                  } text-white placeholder-white/50`}
                  placeholder="รหัสผ่านของคุณ"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white transition"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.div>
                </button>
                {/* Glow effect on focus */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-metaverse-purple to-metaverse-pink opacity-0 group-focus-within:opacity-20 blur-xl transition pointer-events-none"></div>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Remember & Forgot */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-white/10 border-metaverse-purple/50 rounded focus:ring-metaverse-pink"
                />
                <span className="ml-2 text-sm text-white/70">จดจำฉัน</span>
              </label>
              <Link href="#" className="text-sm text-metaverse-pink hover:text-metaverse-glow transition">
                ลืมรหัสผ่าน?
              </Link>
            </motion.div>

            {/* Error Message */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="glass border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{ duration: 0.5 }}
                >
                  ⚠️
                </motion.div>
                {errors.submit}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 metaverse-button text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: [-200, 200],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {isLoading ? (
                <span className="flex items-center justify-center relative z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block mr-2"
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  เข้าสู่ระบบ
                </span>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.9 }}
            className="relative my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-metaverse-purple/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-metaverse-black/50 backdrop-blur-sm text-white/50">หรือ</span>
            </div>
          </motion.div>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <p className="text-white/70">
              ยังไม่มีบัญชี?{' '}
              <Link 
                href="/register" 
                className="text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink hover:from-metaverse-pink hover:to-metaverse-purple font-medium transition"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-6"
        >
          <Link 
            href="/" 
            className="text-white/60 hover:text-white transition inline-flex items-center gap-2 group"
          >
            <motion.span
              className="group-hover:-translate-x-1 transition"
            >
              ←
            </motion.span>
            <span>กลับหน้าหลัก</span>
          </Link>
        </motion.div>

        {/* Fun floating elements */}
        <div className="absolute -top-5 -right-5">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="text-4xl opacity-20"
          >
            🌟
          </motion.div>
        </div>
        
        <div className="absolute -bottom-5 -left-5">
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 0.8, 1],
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="text-4xl opacity-20"
          >
            🎯
          </motion.div>
        </div>
      </motion.div>

      {/* Additional floating elements */}
      <div className="absolute bottom-10 left-10 pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-6xl"
        >
          🚀
        </motion.div>
      </div>
      
      <div className="absolute top-10 right-10 pointer-events-none">
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-6xl"
        >
          🎮
        </motion.div>
      </div>
    </div>
  );
}

// Loading component
function LoginLoading() {
  return (
    <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
      <div className="absolute inset-0 bg-metaverse-gradient opacity-40"></div>
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, -10, 0],
          scale: [1, 1.1, 0.9, 1.1, 1],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-6xl relative z-10"
      >
        <Pi className="w-24 h-24 text-metaverse-purple filter drop-shadow-[0_0_50px_rgba(147,51,234,0.8)]" />
      </motion.div>
    </div>
  );
}

// Main component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}