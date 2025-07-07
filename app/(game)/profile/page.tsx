// app/(game)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, updateUserProfile } from '@/lib/firebase/auth';
import { User } from '@/types';
import { User as UserIcon, School, GraduationCap, Save, ArrowLeft, AlertCircle, Edit, TrendingUp, Pi, Sparkles, Gift, Trophy, Zap } from 'lucide-react';
import AvatarDisplay from '@/components/avatar/AvatarDisplay';
import LevelProgressDisplay from '@/components/game/LevelProgressDisplay';

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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGradeWarning, setShowGradeWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'progress'>('profile');
  
  const [formData, setFormData] = useState({
    displayName: '',
    school: '',
    grade: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser();
      if (!userData) {
        router.push('/login');
        return;
      }
      
      setUser(userData);
      setFormData({
        displayName: userData.displayName || '',
        school: userData.school,
        grade: userData.grade,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Show warning if changing grade
    if (name === 'grade' && user && value !== user.grade) {
      setShowGradeWarning(true);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.school.trim()) {
      newErrors.school = 'กรุณากรอกชื่อโรงเรียน';
    }
    
    if (!formData.grade) {
      newErrors.grade = 'กรุณาเลือกระดับชั้น';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;
    
    setSaving(true);
    setSuccessMessage('');
    
    try {
      await updateUserProfile(user.id, {
        displayName: formData.displayName || undefined,
        school: formData.school,
        grade: formData.grade,
      });
      
      setSuccessMessage('บันทึกข้อมูลสำเร็จ!');
      setShowGradeWarning(false);
      
      // Reload user data
      await loadUserData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-30"></div>
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
            className="relative z-10"
        >
            <Pi className="w-24 h-24 text-metaverse-purple filter drop-shadow-[0_0_50px_rgba(147,51,234,0.7)]" />
        </motion.div>
        </div>
    );
    }

  if (!user) return null;

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
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => router.push('/play')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            กลับ
          </button>
          
          <h1 className="text-3xl font-bold text-white">ข้อมูลส่วนตัว</h1>
          
          <div className="w-20" /> {/* Spacer for center alignment */}
        </motion.div>

        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-3xl shadow-xl border border-metaverse-purple/30 overflow-hidden"
        >
          {/* User Info Header (Always visible) */}
          <div className="p-8 pb-6 border-b border-metaverse-purple/20">
            <div className="flex items-center gap-6 mb-6">
              <Link href="/my-avatar" className="group">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative"
                >
                  <AvatarDisplay
                    avatarData={user.avatarData}
                    basicAvatar={user.avatar}
                    size="large"
                    showEffects={true}
                    showTitle={true}
                    titleBadge={user.currentTitleBadge}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
              </Link>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user.displayName || user.username}
                </h2>
                <p className="text-white/60">@{user.username}</p>
                {user.currentTitleBadge && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 text-sm font-medium border border-yellow-400/30">
                    {user.currentTitleBadge}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">สมัครเมื่อ</p>
                <p className="text-lg font-medium text-white">
                  {new Date(user.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                className="glass rounded-xl p-3 text-center border border-metaverse-purple/20"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-2xl font-bold text-metaverse-purple">{user.level}</p>
                <p className="text-sm text-white/60">Level</p>
              </motion.div>
              <motion.div 
                className="glass rounded-xl p-3 text-center border border-metaverse-purple/20"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-2xl font-bold text-metaverse-pink">{user.totalScore.toLocaleString()}</p>
                <p className="text-sm text-white/60">คะแนนรวม</p>
              </motion.div>
              <motion.div 
                className="glass rounded-xl p-3 text-center border border-metaverse-purple/20"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-2xl font-bold text-yellow-400">{user.experience.toLocaleString()}</p>
                <p className="text-sm text-white/60">EXP</p>
              </motion.div>
              <motion.div 
                className="glass rounded-xl p-3 text-center border border-metaverse-purple/20"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-2xl font-bold text-orange-400">{user.playStreak || 0}</p>
                <p className="text-sm text-white/60">วันต่อเนื่อง</p>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 mt-6">
              <Link
                href="/my-avatar"
                className="flex-1 glass rounded-xl p-3 hover:bg-white/10 transition border border-metaverse-purple/30 flex items-center justify-center gap-2 text-white/80 hover:text-white"
              >
                <Sparkles className="w-5 h-5" />
                จัดการ Avatar
              </Link>
              <Link
                href="/rewards"
                className="flex-1 glass rounded-xl p-3 hover:bg-white/10 transition border border-metaverse-purple/30 flex items-center justify-center gap-2 text-white/80 hover:text-white"
              >
                <Gift className="w-5 h-5" />
                Reward Shop
              </Link>
              <Link
                href="/highscores"
                className="flex-1 glass rounded-xl p-3 hover:bg-white/10 transition border border-metaverse-purple/30 flex items-center justify-center gap-2 text-white/80 hover:text-white"
              >
                <Trophy className="w-5 h-5" />
                คะแนนสูงสุด
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-metaverse-purple/20">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 font-medium transition relative ${
                activeTab === 'profile'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Edit className="w-5 h-5" />
                แก้ไขข้อมูล
              </span>
              {activeTab === 'profile' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-metaverse-purple to-metaverse-pink"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 px-6 py-4 font-medium transition relative ${
                activeTab === 'progress'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                ความก้าวหน้า
              </span>
              {activeTab === 'progress' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-metaverse-purple to-metaverse-pink"
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Success Message */}
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400"
                    >
                      ✅ {successMessage}
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    {/* Display Name */}
                    <div>
                      <label className="block text-white/80 font-medium mb-2">
                        ชื่อที่แสดง (ไม่บังคับ)
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                        <input
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
                          placeholder="ชื่อที่จะแสดงใน Ranking"
                        />
                      </div>
                      <p className="text-sm text-white/50 mt-1">
                        หากไม่กรอก จะแสดง username แทน
                      </p>
                    </div>

                    {/* School */}
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

                    {/* Grade */}
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
                      
                      {/* Grade Change Warning */}
                      {showGradeWarning && formData.grade !== user.grade && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg"
                        >
                          <div className="flex gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-orange-400 font-medium">
                                ⚠️ การเปลี่ยนระดับชั้นจะรีเซ็ต Level เป็น 1
                              </p>
                              <p className="text-xs text-orange-400/80 mt-1">
                                คะแนนสะสมจะยังคงอยู่ แต่ระดับความยากของโจทย์จะเปลี่ยนตามชั้นเรียนใหม่
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass border border-red-500/50 text-red-400 px-4 py-3 rounded-xl"
                      >
                        {errors.submit}
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                      <motion.button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-4 metaverse-button text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        whileHover={{ scale: saving ? 1 : 1.02 }}
                        whileTap={{ scale: saving ? 1 : 0.98 }}
                      >
                        {saving ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              ⏳
                            </motion.span>
                            กำลังบันทึก...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            บันทึกข้อมูล
                          </>
                        )}
                      </motion.button>
                      
                      <button
                        type="button"
                        onClick={() => router.push('/play')}
                        className="px-8 py-4 glass border border-metaverse-purple/50 text-white font-bold rounded-xl shadow-lg hover:bg-white/10 transition"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                <LevelProgressDisplay grade={user.grade} currentLevel={user.level} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 glass-dark p-4 rounded-xl text-sm border border-metaverse-purple/20"
        >
          <p className="text-white/60">
            <span className="font-semibold">หมายเหตุ:</span> Username ไม่สามารถเปลี่ยนได้ 
            หากต้องการเปลี่ยน Username จะต้องสร้างบัญชีใหม่
          </p>
        </motion.div>
      </div>
    </div>
  );
}