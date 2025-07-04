// app/admin/students/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { User } from '@/types';
import { Search, Eye, X } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      
      setStudents(usersData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', studentId), {
        isActive: !currentStatus
      });
      
      // Update local state
      setStudents(students.map(student => 
        student.id === studentId ? { ...student, isActive: !currentStatus } : student
      ));
    } catch (error) {
      console.error('Error updating student:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดต');
    }
  };

  const getGradeDisplayName = (grade: string): string => {
    const gradeMap: Record<string, string> = {
      K1: 'อนุบาล 1', K2: 'อนุบาล 2', K3: 'อนุบาล 3',
      P1: 'ประถม 1', P2: 'ประถม 2', P3: 'ประถม 3',
      P4: 'ประถม 4', P5: 'ประถม 5', P6: 'ประถม 6',
      M1: 'มัธยม 1', M2: 'มัธยม 2', M3: 'มัธยม 3',
      M4: 'มัธยม 4', M5: 'มัธยม 5', M6: 'มัธยม 6',
    };
    return gradeMap[grade] || grade;
  };

  const getAvatarEmoji = (avatarId: string): string => {
    const avatarMap: Record<string, string> = {
      'knight': '🤴', 'warrior': '🦸‍♂️', 'warrioress': '🦸‍♀️', 'ninja': '🥷',
      'wizard': '🧙‍♂️', 'witch': '🧙‍♀️', 'superhero': '🦹‍♂️', 'superheroine': '🦹‍♀️',
      'vampire': '🧛‍♂️', 'vampiress': '🧛‍♀️', 'dragon': '🐉', 'unicorn': '🦄',
      'fox': '🦊', 'lion': '🦁', 'tiger': '🐯', 'wolf': '🐺', 'bear': '🐻',
      'panda': '🐼', 'monkey': '🐵', 'owl': '🦉', 'fairy': '🧚‍♀️', 'fairy-man': '🧚‍♂️',
      'mage': '🧙', 'genie': '🧞', 'mermaid': '🧜‍♀️', 'merman': '🧜‍♂️',
      'robot': '🤖', 'alien': '👽', 'ghost': '👻', 'zombie': '🧟'
    };
    return avatarMap[avatarId] || '👤';
  };

  // Get unique grades for filter
  const uniqueGrades = Array.from(new Set(students.map(s => s.grade))).sort();

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && student.isActive) ||
                         (filterStatus === 'inactive' && !student.isActive);
    
    return matchesSearch && matchesGrade && matchesStatus;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">จัดการนักเรียน</h1>
        <p className="text-white/60 mt-2">ดูและจัดการข้อมูลนักเรียนในระบบ</p>
      </div>

      {/* Filters */}
      <div className="glass-dark rounded-xl p-6 mb-6 border border-metaverse-purple/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              ค้นหา
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Username, ชื่อ, โรงเรียน..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white placeholder-white/40"
              />
            </div>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              ระดับชั้น
            </label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white"
            >
              <option value="all">ทั้งหมด</option>
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>
                  {getGradeDisplayName(grade)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              สถานะ
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-4 py-2 bg-white/10 border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white"
            >
              <option value="all">ทั้งหมด</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table - Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {filteredStudents.map((student) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-dark rounded-xl p-4 border border-metaverse-purple/20"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getAvatarEmoji(student.avatar)}</span>
                <div>
                  <p className="font-medium text-white">
                    {student.displayName || student.username}
                  </p>
                  <p className="text-sm text-white/60">@{student.username}</p>
                </div>
              </div>
              <button
                onClick={() => toggleStudentStatus(student.id, student.isActive)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {student.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-white/60">โรงเรียน:</span>
                <p className="text-white">{student.school}</p>
              </div>
              <div>
                <span className="text-white/60">ระดับชั้น:</span>
                <p className="text-white">{getGradeDisplayName(student.grade)}</p>
              </div>
              <div>
                <span className="text-white/60">Level:</span>
                <p className="text-white font-semibold">{student.level}</p>
              </div>
              <div>
                <span className="text-white/60">คะแนน:</span>
                <p className="text-metaverse-pink font-semibold">{student.totalScore.toLocaleString()}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSelectedStudent(student);
                setShowModal(true);
              }}
              className="mt-3 w-full py-2 bg-metaverse-purple/20 text-white rounded-lg hover:bg-metaverse-purple/30 transition flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              ดูรายละเอียด
            </button>
          </motion.div>
        ))}
      </div>

      {/* Students Table - Desktop View */}
      <div className="hidden lg:block glass-dark rounded-xl overflow-hidden border border-metaverse-purple/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-metaverse-darkPurple/50 border-b border-metaverse-purple/30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">นักเรียน</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">โรงเรียน</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">ระดับชั้น</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">Level</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">คะแนนรวม</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">สถานะ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-metaverse-purple/20">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                    ไม่พบนักเรียน
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getAvatarEmoji(student.avatar)}</span>
                        <div>
                          <p className="font-medium text-white">
                            {student.displayName || student.username}
                          </p>
                          <p className="text-sm text-white/60">@{student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/80">
                      {student.school}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className="px-2 py-1 bg-metaverse-purple/20 text-metaverse-pink rounded border border-metaverse-purple/30">
                        {getGradeDisplayName(student.grade)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-white">
                      {student.level}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-metaverse-pink">
                      {student.totalScore.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStudentStatus(student.id, student.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {student.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowModal(true);
                        }}
                        className="text-metaverse-pink hover:text-metaverse-glow transition"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">นักเรียนทั้งหมด</p>
          <p className="text-2xl font-bold text-white">{students.length}</p>
        </div>
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">Active</p>
          <p className="text-2xl font-bold text-green-400">
            {students.filter(s => s.isActive).length}
          </p>
        </div>
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">โรงเรียน</p>
          <p className="text-2xl font-bold text-metaverse-purple">
            {new Set(students.map(s => s.school)).size}
          </p>
        </div>
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">คะแนนรวมทั้งหมด</p>
          <p className="text-2xl font-bold text-metaverse-pink">
            {students.reduce((sum, s) => sum + s.totalScore, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Student Detail Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-xl p-6 max-w-md w-full border border-metaverse-purple/30"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">ข้อมูลนักเรียน</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getAvatarEmoji(selectedStudent.avatar)}</span>
                <div>
                  <p className="font-semibold text-white">{selectedStudent.displayName || selectedStudent.username}</p>
                  <p className="text-sm text-white/60">@{selectedStudent.username}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-white/60">โรงเรียน</p>
                  <p className="font-medium text-white">{selectedStudent.school}</p>
                </div>
                <div>
                  <p className="text-white/60">ระดับชั้น</p>
                  <p className="font-medium text-white">{getGradeDisplayName(selectedStudent.grade)}</p>
                </div>
                <div>
                  <p className="text-white/60">Level</p>
                  <p className="font-medium text-white">{selectedStudent.level}</p>
                </div>
                <div>
                  <p className="text-white/60">คะแนนรวม</p>
                  <p className="font-medium text-white">{selectedStudent.totalScore}</p>
                </div>
                <div>
                  <p className="text-white/60">EXP</p>
                  <p className="font-medium text-white">{selectedStudent.experience}</p>
                </div>
                <div>
                  <p className="text-white/60">Daily Streak</p>
                  <p className="font-medium text-white">{selectedStudent.dailyStreak} วัน</p>
                </div>
                <div>
                  <p className="text-white/60">Registration Code</p>
                  <p className="font-medium text-white">{selectedStudent.registrationCode}</p>
                </div>
                <div>
                  <p className="text-white/60">สมัครเมื่อ</p>
                  <p className="font-medium text-white">
                    {new Date(selectedStudent.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full py-2 bg-metaverse-purple/20 text-white rounded-lg hover:bg-metaverse-purple/30 transition"
            >
              ปิด
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}