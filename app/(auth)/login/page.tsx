'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/firebase/auth';
import { Pi, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { suppressConsoleError } from '@/lib/utils/suppressConsoleError';

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
  const [rememberMe, setRememberMe] = useState(true); // Default to true

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
    setErrors({}); // Clear previous errors
    
    // Suppress console errors temporarily
    const restoreConsoleError = suppressConsoleError();
    
    try {
      // Firebase authentication with remember me option
      await signIn(formData.username, formData.password, rememberMe);
      
      // Success - redirect to game
      router.push('/play');
    } catch (error: unknown) {
        // Get error message
        let errorMessage = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
        
        if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = (error as Error).message;
        }
        
        setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
      // Restore console.error
      restoreConsoleError();
    }
  };

  return (
    <div className="min-h-screen bg-metaverse-black flex items-center justify-center p-4">
      {/* Simpler Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        
        {/* Reduced floating orbs */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-metaverse-purple/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-metaverse-red/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-dark rounded-3xl shadow-2xl p-8 border border-metaverse-purple/30">
          {/* Logo */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              className="inline-block mb-4"
              animate={{ 
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Pi className="w-20 h-20 text-metaverse-purple filter drop-shadow-[0_0_20px_rgba(147,51,234,0.5)]" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-white">
              Math<span className="text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-red">Quest</span>
            </h1>
            <p className="text-white/70 mt-2">
              เข้าสู่ระบบเพื่อเริ่มการผจญภัย
            </p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Success Message */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass border border-green-500/50 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
              >
                ✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ
              </motion.div>
            )}

            {/* Username */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition-all ${
                    errors.username ? 'border-2 border-red-500' : 'border border-metaverse-purple/30 focus:border-metaverse-purple'
                  } text-white placeholder-white/50`}
                  placeholder="ชื่อผู้ใช้ของคุณ"
                  disabled={isLoading}
                />
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
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition-all ${
                    errors.password ? 'border-2 border-red-500' : 'border border-metaverse-purple/30 focus:border-metaverse-purple'
                  } text-white placeholder-white/50`}
                  placeholder="รหัสผ่านของคุณ"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 bg-white/10 border-metaverse-purple/50 rounded focus:ring-metaverse-purple accent-metaverse-purple"
                />
                <span className="ml-2 text-sm text-white/70">จดจำฉัน</span>
              </label>
              <Link href="#" className="text-sm text-metaverse-purple hover:text-metaverse-pink transition">
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass border border-red-500/50 text-red-400 px-4 py-3 rounded-xl"
              >
                ⚠️ {errors.submit}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 metaverse-button text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block mr-2"
                  >
                    ⏳
                  </motion.span>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  เข้าสู่ระบบ
                </span>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-metaverse-purple/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-metaverse-black/50 backdrop-blur-sm text-white/50">หรือ</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-white/70">
              ยังไม่มีบัญชี?{' '}
              <Link 
                href="/register" 
                className="text-metaverse-purple hover:text-metaverse-pink font-medium transition"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-white/60 hover:text-white transition inline-flex items-center gap-2"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// Loading component
function LoginLoading() {
  return (
    <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
      <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="text-6xl relative z-10"
      >
        <Pi className="w-24 h-24 text-metaverse-purple filter drop-shadow-[0_0_30px_rgba(147,51,234,0.5)]" />
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