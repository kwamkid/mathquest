// app/admin/codes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Plus, Search, Copy, Edit, Trash2 } from 'lucide-react';

interface RegistrationCode {
  id: string;
  code: string;
  createdBy: string;
  createdAt: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  description?: string;
  expiresAt?: string;
}

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<RegistrationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const codesSnapshot = await getDocs(collection(db, 'registrationCodes'));
      const codesData = codesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RegistrationCode));
      
      setCodes(codesData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'registrationCodes', codeId), {
        isActive: !currentStatus
      });
      
      // Update local state
      setCodes(codes.map(code => 
        code.id === codeId ? { ...code, isActive: !currentStatus } : code
      ));
    } catch (error) {
      console.error('Error updating code:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดต');
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Registration Code นี้?')) return;
    
    try {
      await deleteDoc(doc(db, 'registrationCodes', codeId));
      setCodes(codes.filter(code => code.id !== codeId));
    } catch (error) {
      console.error('Error deleting code:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  // Filter codes
  const filteredCodes = codes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (code.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && code.isActive) ||
                         (filterActive === 'inactive' && !code.isActive);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Registration Codes</h1>
          <p className="text-white/60 mt-2">จัดการรหัสสำหรับสมัครสมาชิก</p>
        </div>
        <Link
          href="/admin/codes/new"
          className="metaverse-button text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          สร้าง Code ใหม่
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-dark rounded-xl p-6 mb-6 border border-metaverse-purple/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              ค้นหา Code
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="พิมพ์ code หรือคำอธิบาย..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              สถานะ
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-4 py-2 bg-white/10 border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white"
            >
              <option value="all">ทั้งหมด</option>
              <option value="active">ใช้งานได้</option>
              <option value="inactive">ปิดการใช้งาน</option>
            </select>
          </div>
        </div>
      </div>

      {/* Codes Table */}
      <div className="glass-dark rounded-xl overflow-hidden border border-metaverse-purple/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-metaverse-darkPurple/50 border-b border-metaverse-purple/30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 hidden md:table-cell">คำอธิบาย</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">การใช้งาน</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">สถานะ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 hidden lg:table-cell">สร้างเมื่อ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-metaverse-purple/20">
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    ไม่พบ Registration Code
                  </td>
                </tr>
              ) : (
                filteredCodes.map((code) => (
                  <motion.tr
                    key={code.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-metaverse-purple/20 px-3 py-1 rounded font-mono text-sm text-white">
                          {code.code}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(code.code)}
                          className="text-white/40 hover:text-white/80 transition"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60 hidden md:table-cell">
                      {code.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-white">
                        <span className="font-semibold">{code.currentUses}</span>
                        {code.maxUses && (
                          <span className="text-white/60">/{code.maxUses}</span>
                        )}
                      </div>
                      {code.maxUses && (
                        <div className="w-24 mx-auto mt-1 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-metaverse-purple to-metaverse-pink h-2 rounded-full"
                            style={{ width: `${(code.currentUses / code.maxUses) * 100}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleCodeStatus(code.id, code.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          code.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {code.isActive ? 'ใช้งานได้' : 'ปิดการใช้งาน'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60 hidden lg:table-cell">
                      {new Date(code.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/codes/${code.id}/edit`}
                          className="text-metaverse-pink hover:text-metaverse-glow transition"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteCode(code.id)}
                          className="text-red-400 hover:text-red-300 transition"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">จำนวน Code ทั้งหมด</p>
          <p className="text-2xl font-bold text-white">{codes.length}</p>
        </div>
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">Code ที่ใช้งานได้</p>
          <p className="text-2xl font-bold text-green-400">
            {codes.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">ใช้งานไปแล้ว</p>
          <p className="text-2xl font-bold text-metaverse-pink">
            {codes.reduce((sum, c) => sum + c.currentUses, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}