'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AvatarSelection from '@/components/AvatarSelection';
import { signUp, checkUsernameAvailability } from '@/lib/firebase/auth';
import { User, Lock, Eye, EyeOff, School, GraduationCap, Ticket, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';

// Grade options
const grades = [
  { value: 'K1', label: 'อนุบาล 1' },
  { value: 'K2', label: 'อนุบาล 2' },
  { value: 'K3', label: 'อนุบาล 3' },
  { value: 'P1', label: 'ประถม 1' },
  { value: 'P2', label: 'ประถม 2' },
  { value: 'P3', label: 'ประถม 3' },
  { value: 'P4', label: 'ประถม 4' },
  { value: 'P5', label: 'ประถม 5' },
  { value: 'P6', label: 'ประถม 6' },
  { value: 'M1', label: 'มัธยม 1' },
  { value: 'M2', label: 'มัธยม 2' },
  { value: 'M3', label: 'มัธยม 3' },
  { value: 'M4', label: 'มัธยม 4' },
  { value: 'M5', label: 'มัธยม 5' },
  { value: 'M6', label: 'มัธยม 6' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    school: '',
    grade: '',
    registrationCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username.length < 1) {
        setUsernameAvailable(null);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const available = await checkUsernameAvailability(formData.username);
        setUsernameAvailable(available);
        
        if (!available) {
          setErrors(prev => ({ ...prev, username: 'Username นี้มีผู้ใช้แล้ว' }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            if (newErrors.username === 'Username นี้มีผู้ใช้แล้ว') {
              delete newErrors.username;
            }
            return newErrors;
          });
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedAvatar) {
      newErrors.avatar = 'กรุณาเลือกตัวละคร';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอก Username';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Username นี้มีผู้ใช้แล้ว';
    }
    
    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }
    
    if (!formData.school.trim()) {
      newErrors.school = 'กรุณากรอกชื่อโรงเรียน';
    }
    
    if (!formData.grade) {
      newErrors.grade = 'กรุณาเลือกระดับชั้น';
    }
    
    if (!formData.registrationCode.trim()) {
      newErrors.registrationCode = 'กรุณากรอก Registration Code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double check username availability
    if (usernameAvailable === false) {
      setErrors({ submit: 'Username นี้มีผู้ใช้แล้ว' });
      return;
    }
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      // Firebase registration
      await signUp(
        formData.username,
        formData.password,
        formData.displayName,
        selectedAvatar!,
        formData.school,
        formData.grade,
        formData.registrationCode
      );
      
      // Success - redirect to login
      router.push('/login?registered=true');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-metaverse-black py-12 px-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">สมัครสมาชิก</h1>
          <p className="text-white/60">เริ่มต้นการผจญภัยในโลกแห่งตัวเลข</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <motion.div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-gradient-to-r from-metaverse-purple to-metaverse-red text-white' : 'bg-white/10 text-white/50'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              1
            </motion.div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-gradient-to-r from-metaverse-purple to-metaverse-red' : 'bg-white/10'}`} />
            <motion.div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-gradient-to-r from-metaverse-purple to-metaverse-red text-white' : 'bg-white/10 text-white/50'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              2
            </motion.div>
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-dark rounded-3xl shadow-xl p-8 border border-metaverse-purple/30"
        >
          {step === 1 ? (
            <>
              <AvatarSelection
                selectedAvatar={selectedAvatar}
                onSelectAvatar={setSelectedAvatar}
              />
              
              {errors.avatar && (
                <p className="text-red-400 text-center mt-4">{errors.avatar}</p>
              )}
              
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-3 text-white/60 hover:text-white transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 metaverse-button text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition flex items-center gap-2"
                >
                  ถัดไป
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Username & Display Name */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 font-medium mb-2">
                      Username <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition ${
                          errors.username ? 'border-2 border-red-500' : 
                          usernameAvailable === false ? 'border-2 border-red-500' :
                          usernameAvailable === true ? 'border-2 border-green-500' :
                          'border border-metaverse-purple/30 focus:border-metaverse-pink'
                        } text-white placeholder-white/40`}
                        placeholder="ชื่อผู้ใช้สำหรับเข้าสู่ระบบ"
                      />
                      {/* Username status indicator */}
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {isCheckingUsername ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="text-white/40"
                          >
                            ⏳
                          </motion.div>
                        ) : usernameAvailable === true && formData.username ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : usernameAvailable === false ? (
                          <X className="w-5 h-5 text-red-400" />
                        ) : null}
                      </div>
                    </div>
                    {errors.username && (
                      <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                    )}
                    {usernameAvailable === true && formData.username && (
                      <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Username นี้ใช้ได้
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-white/80 font-medium mb-2">
                      ชื่อที่แสดง (ไม่บังคับ)
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink transition text-white placeholder-white/40"
                      placeholder="ชื่อที่จะแสดงใน Ranking"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 font-medium mb-2">
                      รหัสผ่าน <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition ${
                          errors.password ? 'border-2 border-red-500' : 'border border-metaverse-purple/30 focus:border-metaverse-pink'
                        } text-white placeholder-white/40`}
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-white/80 font-medium mb-2">
                      ยืนยันรหัสผ่าน <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition ${
                          errors.confirmPassword ? 'border-2 border-red-500' : 'border border-metaverse-purple/30 focus:border-metaverse-pink'
                        } text-white placeholder-white/40`}
                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/80"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* School & Grade */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 font-medium mb-2">
                      โรงเรียน <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition ${
                          errors.school ? 'border-2 border-red-500' : 'border border-metaverse-purple/30 focus:border-metaverse-pink'
                        } text-white placeholder-white/40`}
                        placeholder="ชื่อโรงเรียน"
                      />
                    </div>
                    {errors.school && (
                      <p className="text-red-400 text-sm mt-1">{errors.school}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-white/80 font-medium mb-2">
                      ระดับชั้น <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition appearance-none ${
                          errors.grade ? 'border-2 border-red-500' : 'border border-metaverse-purple/30 focus:border-metaverse-pink'
                        } text-white`}
                      >
                        <option value="" className="bg-metaverse-black">เลือกระดับชั้น</option>
                        {grades.map(grade => (
                          <option key={grade.value} value={grade.value} className="bg-metaverse-black">
                            {grade.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.grade && (
                      <p className="text-red-400 text-sm mt-1">{errors.grade}</p>
                    )}
                  </div>
                </div>

                {/* Registration Code */}
                <div>
                  <label className="block text-white/80 font-medium mb-2">
                    Registration Code <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="text"
                      name="registrationCode"
                      value={formData.registrationCode}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition ${
                        errors.registrationCode ? 'border-2 border-red-500' : 'border border-metaverse-purple/30 focus:border-metaverse-pink'
                      } text-white placeholder-white/40`}
                      placeholder="รหัสที่ได้รับจากครู/ผู้ดูแล"
                    />
                  </div>
                  {errors.registrationCode && (
                    <p className="text-red-400 text-sm mt-1">{errors.registrationCode}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="glass border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                    {errors.submit}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-white/60 hover:text-white transition flex items-center gap-2"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-5 h-5" />
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 metaverse-button text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-white/60">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/login" className="text-metaverse-pink hover:text-metaverse-glow font-medium transition">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}