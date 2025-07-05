// app/admin/codes/new/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NewCodePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    maxUses: '',
    expiresAt: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'กรุณากรอก Registration Code';
    } else {
      // Check if code already exists
      const codeDoc = await getDoc(doc(db, 'registrationCodes', formData.code));
      if (codeDoc.exists()) {
        newErrors.code = 'Code นี้มีอยู่ในระบบแล้ว';
      }
    }

    if (formData.maxUses && (isNaN(Number(formData.maxUses)) || Number(formData.maxUses) < 1)) {
      newErrors.maxUses = 'จำนวนครั้งต้องเป็นตัวเลขที่มากกว่า 0';
    }

    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      if (expiryDate <= new Date()) {
        newErrors.expiresAt = 'วันหมดอายุต้องเป็นวันในอนาคต';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true);

    try {
      const codeData = {
        id: formData.code,
        code: formData.code,
        description: formData.description || '',
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        currentUses: 0,
        isActive: true,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        expiresAt: formData.expiresAt || null,
      };

      await setDoc(doc(db, 'registrationCodes', formData.code), codeData);
      
      // Success - redirect back to codes list
      router.push('/admin/codes');
    } catch (error) {
      console.error('Error creating code:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง Registration Code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/codes"
            className="text-white/60 hover:text-white transition flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            กลับ
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white">สร้าง Registration Code ใหม่</h1>
        <p className="text-white/60 mt-2">สร้างรหัสสำหรับให้นักเรียนใช้สมัครสมาชิก</p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl shadow-xl p-8 border border-metaverse-purple/30"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Registration Code <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className={`flex-1 px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
                  errors.code ? 'border-red-500' : 'border-metaverse-purple/30'
                }`}
                placeholder="เช่น SCHOOL2024"
                required
              />
              <button
                type="button"
                onClick={generateRandomCode}
                className="px-4 py-3 glass bg-metaverse-purple/20 text-white rounded-lg hover:bg-metaverse-purple/30 transition flex items-center gap-2 border border-metaverse-purple/30"
              >
                <Sparkles className="w-5 h-5" />
                สุ่ม Code
              </button>
            </div>
            {errors.code && (
              <p className="text-red-400 text-sm mt-1">{errors.code}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              คำอธิบาย
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
              placeholder="เช่น สำหรับโรงเรียน ABC"
            />
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              จำนวนครั้งที่ใช้ได้
            </label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
                errors.maxUses ? 'border-red-500' : 'border-metaverse-purple/30'
              }`}
              placeholder="ไม่จำกัด"
              min="1"
            />
            {errors.maxUses && (
              <p className="text-red-400 text-sm mt-1">{errors.maxUses}</p>
            )}
            <p className="text-white/50 text-sm mt-1">
              เว้นว่างหากไม่ต้องการจำกัดจำนวน
            </p>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              วันหมดอายุ
            </label>
            <input
              type="date"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40 ${
                errors.expiresAt ? 'border-red-500' : 'border-metaverse-purple/30'
              }`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.expiresAt && (
              <p className="text-red-400 text-sm mt-1">{errors.expiresAt}</p>
            )}
            <p className="text-white/50 text-sm mt-1">
              เว้นว่างหากไม่ต้องการกำหนดวันหมดอายุ
            </p>
          </div>

          {/* Summary */}
          <div className="glass bg-metaverse-purple/10 rounded-xl p-5 border border-metaverse-purple/30">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-metaverse-purple" />
              สรุปข้อมูล
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-white/80">
                <span className="text-metaverse-purple">•</span>
                <span>Code:</span>
                <code className="bg-metaverse-purple/20 px-3 py-1 rounded text-white font-mono">
                  {formData.code || '-'}
                </code>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="text-metaverse-purple">•</span>
                <span>จำนวนครั้งที่ใช้ได้:</span>
                <span className="text-metaverse-pink font-semibold">
                  {formData.maxUses || 'ไม่จำกัด'}
                </span>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="text-metaverse-purple">•</span>
                <span>วันหมดอายุ:</span>
                <span className="text-metaverse-pink font-semibold">
                  {formData.expiresAt ? new Date(formData.expiresAt).toLocaleDateString('th-TH') : 'ไม่มี'}
                </span>
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 metaverse-button text-white py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⏳
                  </motion.span>
                  กำลังสร้าง...
                </span>
              ) : (
                'สร้าง Registration Code'
              )}
            </motion.button>
            <Link
              href="/admin/codes"
              className="flex-1 glass border border-metaverse-purple/30 text-white py-3 rounded-lg font-medium hover:bg-white/10 transition text-center"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}