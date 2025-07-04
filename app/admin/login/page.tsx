// app/admin/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pi, User, Lock, Eye, EyeOff } from 'lucide-react';

// Admin credentials (ในระบบจริงควรเก็บใน environment variables และใช้ Firebase Admin)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'mathquest2024' // ควรเปลี่ยนเป็นรหัสที่ปลอดภัยกว่านี้
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Simple authentication (ในระบบจริงควรใช้ Firebase Admin SDK)
    if (formData.username === ADMIN_CREDENTIALS.username && 
        formData.password === ADMIN_CREDENTIALS.password) {
      // Set admin session (ในระบบจริงควรใช้ secure session)
      localStorage.setItem('adminAuth', 'true');
      router.push('/admin/dashboard');
    } else {
      setErrors({ submit: 'Username หรือ Password ไม่ถูกต้อง' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-metaverse-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-30"></div>
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-metaverse-purple/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-metaverse-red/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-dark rounded-3xl shadow-2xl p-8 border border-metaverse-purple/30">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-block mb-4"
            >
              <div className="relative">
                <Pi className="w-20 h-20 text-metaverse-purple filter drop-shadow-[0_0_30px_rgba(147,51,234,0.5)]" />
                <motion.div
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-metaverse-purple to-metaverse-red rounded-full flex items-center justify-center text-white text-xs font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  A
                </motion.div>
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
            <p className="text-white/60 mt-2">MathQuest Administration</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
                  placeholder="Admin username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
                  placeholder="Admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/80 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass border border-red-500/50 text-red-400 px-4 py-3 rounded-lg"
              >
                {errors.submit}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 metaverse-button text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 relative overflow-hidden"
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

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link 
              href="/" 
              className="text-white/60 hover:text-white transition inline-flex items-center gap-2"
            >
              ← กลับหน้าหลัก
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 glass-dark p-4 rounded-lg text-sm border border-metaverse-purple/20"
        >
          <p className="font-semibold mb-1 text-white flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Admin Access Only
          </p>
          <p className="text-white/60">
            หน้านี้สำหรับผู้ดูแลระบบเท่านั้น หากไม่ใช่ผู้ดูแลระบบ กรุณากลับไปหน้าหลัก
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}