// app/(game)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { updateUserProfile } from '@/lib/firebase/auth';
import { User as UserIcon, School, GraduationCap, Save, ArrowLeft, AlertCircle, Edit, TrendingUp, Pi, Sparkles, Gift, Trophy, Zap, AlertTriangle, X } from 'lucide-react';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
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
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showGradeWarning, setShowGradeWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'progress'>('profile');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [pendingGrade, setPendingGrade] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: '',
    school: '',
    grade: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        school: user.school,
        grade: user.grade,
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Special handling for grade change
    if (name === 'grade' && user && value !== user.grade) {
      // Don't update form immediately, show confirmation modal
      setPendingGrade(value);
      setShowConfirmModal(true);
      setConfirmText('');
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGradeConfirm = () => {
    if (confirmText.toUpperCase() === 'CONFIRM') {
      setFormData(prev => ({ ...prev, grade: pendingGrade }));
      setShowGradeWarning(true);
      setShowConfirmModal(false);
      setConfirmText('');
      setPendingGrade('');
    }
  };

  const handleGradeCancel = () => {
    setShowConfirmModal(false);
    setConfirmText('');
    setPendingGrade('');
    // Reset select to current value
    const selectElement = document.querySelector('select[name="grade"]') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = formData.grade;
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
      // Check if grade changed
      const gradeChanged = formData.grade !== user.grade;
      
      // Prepare update data
      const updateData: any = {
        displayName: formData.displayName || undefined,
        school: formData.school,
        grade: formData.grade,
      };
      
      // If grade changed, reset EXP and level
      if (gradeChanged) {
        updateData.experience = 0;
        updateData.level = 1;
        updateData.levelScores = {};
      }
      
      await updateUserProfile(user.id, updateData);
      
      setSuccessMessage('บันทึกข้อมูลสำเร็จ!');
      setShowGradeWarning(false);
      
      // Refresh user data in context
      await refreshUser();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setSaving(false);
    }
  };

  const getGradeLabel = (gradeValue: string) => {
    const grade = grades.find(g => g.value === gradeValue);
    return grade ? grade.label : gradeValue;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-metaverse-black">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Content Container - ปรับให้เป็น scroll ทั้งหน้า */}
      <div className="relative z-10 min-h-screen">
        {/* Header - Fixed */}
        <div className="sticky top-0 z-20 bg-metaverse-black/80 backdrop-blur-md border-b border-metaverse-purple/20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between"
          >
            <button
              onClick={() => router.push('/play')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              กลับ
            </button>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white">ข้อมูลส่วนตัว</h1>
            
            <div className="w-20" />
          </motion.div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-3xl shadow-xl border border-metaverse-purple/30 overflow-hidden"
          >
            {/* User Info Header */}
            <div className="p-6 border-b border-metaverse-purple/20">
              <div className="flex items-center gap-4 mb-4">
                <Link href="/my-avatar" className="group">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative"
                  >
                    <EnhancedAvatarDisplay
                      userId={user.id}
                      avatarData={user.avatarData}
                      basicAvatar={user.avatar}
                      size="medium"
                      showEffects={true}
                      showTitle={true}
                      titleBadge={user.currentTitleBadge}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                </Link>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                    {user.displayName || user.username}
                  </h2>
                  <p className="text-white/60 text-sm">@{user.username}</p>
                  {user.currentTitleBadge && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-medium border border-yellow-400/30">
                      {user.currentTitleBadge}
                    </span>
                  )}
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-xs text-white/60">สมัครเมื่อ</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(user.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <motion.div 
                  className="glass rounded-xl p-3 text-center border border-metaverse-purple/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-xl md:text-2xl font-bold text-metaverse-purple">{user.level}</p>
                  <p className="text-xs text-white/60">Level</p>
                </motion.div>
                <motion.div 
                  className="glass rounded-xl p-3 text-center border border-metaverse-purple/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-xl md:text-2xl font-bold text-metaverse-pink">{user.totalScore.toLocaleString()}</p>
                  <p className="text-xs text-white/60">คะแนน</p>
                </motion.div>
                <motion.div 
                  className="glass rounded-xl p-3 text-center border border-metaverse-purple/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-xl md:text-2xl font-bold text-yellow-400">{user.experience.toLocaleString()}</p>
                  <p className="text-xs text-white/60">EXP</p>
                </motion.div>
                <motion.div 
                  className="glass rounded-xl p-3 text-center border border-metaverse-purple/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-xl md:text-2xl font-bold text-orange-400">{user.playStreak || 0}</p>
                  <p className="text-xs text-white/60">วันต่อเนื่อง</p>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <Link
                  href="/my-avatar"
                  className="glass rounded-xl p-3 hover:bg-white/10 transition border border-metaverse-purple/30 flex items-center justify-center gap-2 text-white/80 hover:text-white"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="hidden md:inline">จัดการ Avatar</span>
                  <span className="md:hidden">Avatar</span>
                </Link>
                <Link
                  href="/rewards"
                  className="glass rounded-xl p-3 hover:bg-white/10 transition border border-metaverse-purple/30 flex items-center justify-center gap-2 text-white/80 hover:text-white"
                >
                  <Gift className="w-5 h-5" />
                  <span className="hidden md:inline">Reward Shop</span>
                  <span className="md:hidden">Shop</span>
                </Link>
                <Link
                  href="/highscores"
                  className="glass rounded-xl p-3 hover:bg-white/10 transition border border-metaverse-purple/30 flex items-center justify-center gap-2 text-white/80 hover:text-white"
                >
                  <Trophy className="w-5 h-5" />
                  <span className="hidden md:inline">คะแนนสูงสุด</span>
                  <span className="md:hidden">คะแนน</span>
                </Link>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-metaverse-purple/20">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-4 py-4 font-medium transition relative ${
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
                className={`flex-1 px-4 py-4 font-medium transition relative ${
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
                  className="p-6"
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
                          <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                          <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-metaverse-purple/30 rounded-xl focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
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
                          <School className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                          <input
                            type="text"
                            name="school"
                            value={formData.school}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition ${
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
                          <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                          <select
                            name="grade"
                            value={formData.grade}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl focus:outline-none transition appearance-none ${
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
                            className="mt-3 p-4 bg-orange-500/20 border border-orange-500/50 rounded-xl"
                          >
                            <div className="flex gap-3">
                              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-orange-400 font-medium mb-2">
                                  ⚠️ การเปลี่ยนระดับชั้นจะรีเซ็ต:
                                </p>
                                <ul className="text-orange-400/80 space-y-1 list-disc list-inside">
                                  <li>Level กลับเป็น 1</li>
                                  <li><strong className="text-red-400">EXP กลับเป็น 0</strong></li>
                                  <li>ประวัติการเล่นของระดับชั้นเดิมจะถูกล้าง</li>
                                </ul>
                                <p className="text-sm text-orange-400/60 mt-2">
                                  (คะแนนรวมจะยังคงอยู่)
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
                          className="flex-1 py-3 metaverse-button text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                          className="px-8 py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl shadow-lg hover:bg-white/10 transition"
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
                  className="p-6"
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

      {/* Grade Change Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleGradeCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-3xl p-8 max-w-md w-full border border-red-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </motion.div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white text-center mb-4">
                ⚠️ คำเตือน: ยืนยันการเปลี่ยนระดับชั้น
              </h3>

              {/* Current to New Grade */}
              <div className="glass bg-red-500/10 rounded-xl p-4 mb-6 border border-red-500/30">
                <div className="flex items-center justify-center gap-4 text-xl font-bold">
                  <span className="text-white">{getGradeLabel(user.grade)}</span>
                  <span className="text-red-400">→</span>
                  <span className="text-red-400">{getGradeLabel(pendingGrade)}</span>
                </div>
              </div>

              {/* Warning Details */}
              <div className="space-y-4 mb-6">
                <div className="glass bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                  <p className="text-orange-400 font-semibold mb-2">
                    การเปลี่ยนระดับชั้นจะส่งผลให้:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span className="text-white/80">Level กลับไปเป็น <strong className="text-yellow-400">1</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span className="text-white/80">
                        <strong className="text-red-400">EXP ทั้งหมดจะถูกรีเซ็ตเป็น 0</strong>
                        <br />
                        <span className="text-white/60 text-xs">
                          (จาก {user.experience.toLocaleString()} EXP → 0 EXP)
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span className="text-white/80">ประวัติการเล่นของระดับชั้นเดิมจะถูกล้าง</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span className="text-white/80">คะแนนรวมยังคงเหมือนเดิม</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Confirm Input */}
              <div className="mb-6">
                <p className="text-white/80 text-center mb-3">
                  พิมพ์ <strong className="text-red-400">&quot;CONFIRM&quot;</strong> เพื่อยืนยันการเปลี่ยนระดับชั้น
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="พิมพ์ CONFIRM"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-red-500/50 rounded-xl focus:outline-none focus:border-red-400 text-white placeholder-white/40 text-center text-lg font-bold"
                  autoFocus
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleGradeCancel}
                  className="flex-1 py-3 glass border border-metaverse-purple/50 text-white font-bold rounded-xl hover:bg-white/10 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-5 h-5 inline mr-2" />
                  ยกเลิก
                </motion.button>
                
                <motion.button
                  onClick={handleGradeConfirm}
                  disabled={confirmText.toUpperCase() !== 'CONFIRM'}
                  className={`flex-1 py-3 font-bold rounded-xl transition ${
                    confirmText.toUpperCase() === 'CONFIRM'
                      ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                      : 'glass opacity-50 cursor-not-allowed text-white/50'
                  }`}
                  whileHover={confirmText.toUpperCase() === 'CONFIRM' ? { scale: 1.02 } : {}}
                  whileTap={confirmText.toUpperCase() === 'CONFIRM' ? { scale: 0.98 } : {}}
                >
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                  ยืนยันเปลี่ยนระดับชั้น
                </motion.button>
              </div>

              {/* Additional Warning */}
              <p className="text-xs text-red-400/60 text-center mt-4">
                * การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}