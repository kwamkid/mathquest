'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/firebase/auth';

export default function LoginPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
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
              <span className="text-6xl">🎮</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800">
              Math<span className="text-red-500">Quest</span>
            </h1>
            <p className="text-gray-600 mt-2">เข้าสู่ระบบเพื่อเริ่มการผจญภัย</p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl"
              >
                ✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ
              </motion.div>
            )}

            {/* Username */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-2xl">👤</span>
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-red-500 transition ${
                    errors.username ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="ชื่อผู้ใช้ของคุณ"
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-2xl">🔐</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:border-red-500 transition ${
                    errors.password ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="รหัสผ่านของคุณ"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-2xl">
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-600">จดจำฉัน</span>
              </label>
              <Link href="#" className="text-sm text-red-500 hover:text-red-600">
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
              >
                {errors.submit}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                'เข้าสู่ระบบ'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">หรือ</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600">
              ยังไม่มีบัญชี?{' '}
              <Link 
                href="/register" 
                className="text-red-500 hover:text-red-600 font-medium"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link 
            href="/" 
            className="text-white/80 hover:text-white transition flex items-center justify-center gap-2"
          >
            <span>←</span>
            <span>กลับหน้าหลัก</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}