// app/admin/students/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { User } from '@/types';
import { 
  Search, 
  Eye, 
  X, 
  Calendar, 
  Zap, 
  Trophy, 
  TrendingUp, 
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown
} from 'lucide-react';
import AdminAvatarDisplay from '@/components/admin/AdminAvatarDisplay';

type SortField = 'level' | 'experience' | 'playStreak' | 'totalScore' | null;
type SortOrder = 'asc' | 'desc';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Sorting states
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          avatar: data.avatar || 'knight',
          // Ensure playStreak exists (migration from dailyStreak if needed)
          playStreak: data.playStreak ?? data.dailyStreak ?? 0,
          // Ensure lastPlayedAt exists
          lastPlayedAt: data.lastPlayedAt || data.lastLoginDate || data.createdAt
        } as User;
      });
      
      setStudents(usersData);
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

  // Format last login date
  const formatLastLogin = (dateString: string | undefined): string => {
    if (!dateString) return 'ไม่มีข้อมูล';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      
      if (diffMinutes < 1) return 'เมื่อสักครู่';
      if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
      if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
      if (diffDays === 0) return 'วันนี้';
      if (diffDays === 1) return 'เมื่อวาน';
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`;
      
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'ไม่มีข้อมูล';
    }
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with desc order
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Get unique grades for filter
  const uniqueGrades = Array.from(new Set(students.map(s => s.grade))).sort();

  // Filter and sort students
  const processedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.school.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
      
      return matchesSearch && matchesGrade;
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        // Handle null/undefined values
        if (aVal == null) aVal = 0;
        if (bVal == null) bVal = 0;
        
        // Convert to numbers for comparison
        aVal = Number(aVal);
        bVal = Number(bVal);
        
        if (sortOrder === 'asc') {
          return aVal - bVal;
        } else {
          return bVal - aVal;
        }
      });
    } else {
      // Default sort by created date (newest first)
      filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [students, searchTerm, filterGrade, sortField, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(processedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = processedStudents.slice(startIndex, endIndex);

  // Pagination controls
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGrade]);

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

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-white/30" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-metaverse-purple" />
      : <ChevronDown className="w-3 h-3 text-metaverse-purple" />;
  };

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

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              แสดงต่อหน้า
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-white/10 border border-metaverse-purple/30 rounded-lg focus:outline-none focus:border-metaverse-pink text-white"
            >
              <option value="10">10 รายการ</option>
              <option value="20">20 รายการ</option>
              <option value="50">50 รายการ</option>
              <option value="100">100 รายการ</option>
            </select>
          </div>
        </div>

        {/* Results info */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-white/60">
            พบ {processedStudents.length} คน 
            {sortField && ` (เรียงตาม ${sortField === 'level' ? 'Level' : sortField === 'experience' ? 'EXP' : sortField === 'playStreak' ? 'Streak' : 'คะแนนรวม'} ${sortOrder === 'asc' ? '↑' : '↓'})`}
          </p>
          {sortField && (
            <button
              onClick={() => {
                setSortField(null);
                setSortOrder('desc');
              }}
              className="text-sm text-metaverse-purple hover:text-metaverse-pink transition"
            >
              ล้างการเรียง
            </button>
          )}
        </div>
      </div>

      {/* Students Table - Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {currentStudents.map((student) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-dark rounded-xl p-4 border border-metaverse-purple/20"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <AdminAvatarDisplay
                  userId={student.id}
                  avatarData={student.avatarData}
                  basicAvatar={student.avatar}
                  size="small"
                />
                <div>
                  <p className="font-medium text-white">
                    {student.displayName || student.username}
                  </p>
                  <p className="text-sm text-white/60">@{student.username}</p>
                </div>
              </div>
              <div className="text-xs text-right">
                <p className="text-white/40">Login ล่าสุด</p>
                <p className="text-white/60">{formatLastLogin(student.lastPlayedAt || student.lastLoginDate)}</p>
              </div>
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
                <span className="text-white/60">EXP:</span>
                <p className="text-yellow-400 font-semibold">{student.experience.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-white/60">Streak:</span>
                <p className="text-white">
                  {student.playStreak && student.playStreak > 0 ? `🔥 ${student.playStreak} วัน` : '-'}
                </p>
              </div>
              <div>
                <span className="text-white/60">คะแนนรวม:</span>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-white/80">นักเรียน</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white/80">โรงเรียน</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white/80">ระดับชั้น</th>
                <th 
                  className="px-6 py-3 text-center text-sm font-semibold text-white/80 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => handleSort('level')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Level</span>
                    <SortIcon field="level" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-center text-sm font-semibold text-white/80 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => handleSort('experience')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>EXP</span>
                    <SortIcon field="experience" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-center text-sm font-semibold text-white/80 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => handleSort('playStreak')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Streak</span>
                    <SortIcon field="playStreak" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-center text-sm font-semibold text-white/80 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => handleSort('totalScore')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>คะแนนรวม</span>
                    <SortIcon field="totalScore" />
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white/80">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Login ล่าสุด</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white/80">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-metaverse-purple/20">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-white/50">
                    ไม่พบนักเรียน
                  </td>
                </tr>
              ) : (
                currentStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-white/5"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <AdminAvatarDisplay
                          userId={student.id}
                          avatarData={student.avatarData}
                          basicAvatar={student.avatar}
                          size="tiny"
                        />
                        <div>
                          <p className="font-medium text-white text-sm">
                            {student.displayName || student.username}
                          </p>
                          <p className="text-xs text-white/60">@{student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-white/80">
                      {student.school}
                    </td>
                    <td className="px-6 py-3 text-center text-sm">
                      <span className="px-2 py-0.5 bg-metaverse-purple/20 text-metaverse-pink rounded text-xs border border-metaverse-purple/30">
                        {getGradeDisplayName(student.grade)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center font-semibold text-white text-sm">
                      {student.level}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="font-semibold text-yellow-400">
                        {student.experience.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {student.playStreak && student.playStreak > 0 ? (
                          <>
                            <span className="text-orange-400">🔥</span>
                            <span className="text-sm text-white">{student.playStreak}</span>
                          </>
                        ) : (
                          <span className="text-sm text-white/40">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center font-semibold text-metaverse-pink text-sm">
                      {student.totalScore.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="text-xs">
                        <p className="text-white/70">
                          {formatLastLogin(student.lastPlayedAt || student.lastLoginDate)}
                        </p>
                        {student.lastPlayedAt && (
                          <p className="text-white/40">
                            {new Date(student.lastPlayedAt).toLocaleDateString('th-TH', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowModal(true);
                        }}
                        className="text-metaverse-pink hover:text-metaverse-glow transition"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page info */}
          <div className="text-sm text-white/60">
            แสดง {startIndex + 1}-{Math.min(endIndex, processedStudents.length)} จาก {processedStudents.length} คน
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition ${
                currentPage === 1 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                  : 'bg-metaverse-purple/20 text-white hover:bg-metaverse-purple/30'
              }`}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition ${
                currentPage === 1 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                  : 'bg-metaverse-purple/20 text-white hover:bg-metaverse-purple/30'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition ${
                    pageNum === currentPage
                      ? 'bg-gradient-to-r from-metaverse-purple to-metaverse-pink text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition ${
                currentPage === totalPages 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                  : 'bg-metaverse-purple/20 text-white hover:bg-metaverse-purple/30'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition ${
                currentPage === totalPages 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                  : 'bg-metaverse-purple/20 text-white hover:bg-metaverse-purple/30'
              }`}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Go to page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">ไปหน้า:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
              className="w-16 px-2 py-1 bg-white/10 border border-metaverse-purple/30 rounded text-white text-center"
            />
            <span className="text-sm text-white/60">/ {totalPages}</span>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">นักเรียนทั้งหมด</p>
          <p className="text-2xl font-bold text-white">{students.length}</p>
        </div>
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">โรงเรียน</p>
          <p className="text-2xl font-bold text-metaverse-purple">
            {new Set(students.map(s => s.school)).size}
          </p>
        </div>
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">EXP รวม</p>
          <p className="text-2xl font-bold text-yellow-400">
            {students.reduce((sum, s) => sum + s.experience, 0).toLocaleString()}
          </p>
        </div>
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">คะแนนรวมทั้งหมด</p>
          <p className="text-2xl font-bold text-metaverse-pink">
            {students.reduce((sum, s) => sum + s.totalScore, 0).toLocaleString()}
          </p>
        </div>
        <div className="glass-dark rounded-lg p-4 border border-metaverse-purple/20">
          <p className="text-sm text-white/60">Login วันนี้</p>
          <p className="text-2xl font-bold text-green-400">
            {students.filter(s => {
              const lastLogin = s.lastPlayedAt || s.lastLoginDate;
              if (!lastLogin) return false;
              const today = new Date().toDateString();
              return new Date(lastLogin).toDateString() === today;
            }).length}
          </p>
        </div>
      </div>

      {/* Student Detail Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-xl p-6 max-w-md w-full border border-metaverse-purple/30 max-h-[90vh] overflow-y-auto"
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
              <div className="flex items-center gap-4 mb-4">
                <AdminAvatarDisplay
                  userId={selectedStudent.id}
                  avatarData={selectedStudent.avatarData}
                  basicAvatar={selectedStudent.avatar}
                  size="medium"
                />
                <div>
                  <p className="font-semibold text-white text-lg">{selectedStudent.displayName || selectedStudent.username}</p>
                  <p className="text-sm text-white/60">@{selectedStudent.username}</p>
                  {selectedStudent.currentTitleBadge && (
                    <p className="text-xs text-yellow-400 mt-1">🏆 {selectedStudent.currentTitleBadge}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="glass rounded-lg p-2 border border-metaverse-purple/20">
                  <p className="text-white/60">โรงเรียน</p>
                  <p className="font-medium text-white">{selectedStudent.school}</p>
                </div>
                <div className="glass rounded-lg p-2 border border-metaverse-purple/20">
                  <p className="text-white/60">ระดับชั้น</p>
                  <p className="font-medium text-white">{getGradeDisplayName(selectedStudent.grade)}</p>
                </div>
                <div className="glass rounded-lg p-2 border border-metaverse-purple/20">
                  <p className="text-white/60">Level</p>
                  <p className="font-medium text-white">{selectedStudent.level}</p>
                </div>
                <div className="glass rounded-lg p-2 border border-yellow-400/20">
                  <p className="text-white/60 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    EXP
                  </p>
                  <p className="font-medium text-yellow-400">{selectedStudent.experience.toLocaleString()}</p>
                </div>
                <div className="glass rounded-lg p-2 border border-metaverse-purple/20">
                  <p className="text-white/60 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-metaverse-pink" />
                    คะแนนรวม
                  </p>
                  <p className="font-medium text-metaverse-pink">{selectedStudent.totalScore.toLocaleString()}</p>
                </div>
                <div className="glass rounded-lg p-2 border border-orange-400/20">
                  <p className="text-white/60">Play Streak</p>
                  <p className="font-medium text-orange-400">
                    {selectedStudent.playStreak && selectedStudent.playStreak > 0 
                      ? `🔥 ${selectedStudent.playStreak} วัน` 
                      : '-'}
                  </p>
                </div>
                <div className="glass rounded-lg p-2 border border-metaverse-purple/20 col-span-2">
                  <p className="text-white/60 flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" />
                    Login ล่าสุด
                  </p>
                  <p className="font-medium text-white">
                    {formatLastLogin(selectedStudent.lastPlayedAt || selectedStudent.lastLoginDate)}
                  </p>
                  {selectedStudent.lastPlayedAt && (
                    <p className="text-xs text-white/50">
                      {new Date(selectedStudent.lastPlayedAt).toLocaleString('th-TH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
                <div className="glass rounded-lg p-2 border border-metaverse-purple/20">
                  <p className="text-white/60">Registration Code</p>
                  <p className="font-medium text-white text-xs">{selectedStudent.registrationCode}</p>
                </div>
                <div className="glass rounded-lg p-2 border border-metaverse-purple/20">
                  <p className="text-white/60">สมัครเมื่อ</p>
                  <p className="font-medium text-white">
                    {new Date(selectedStudent.createdAt).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Additional Stats */}
              {selectedStudent.badges && selectedStudent.badges.length > 0 && (
                <div className="glass rounded-lg p-3 border border-metaverse-purple/20">
                  <p className="text-white/60 text-sm mb-2">🏅 Badges ({selectedStudent.badges.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.badges.map((badge, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudent.isActive ? (
                <div className="text-center py-2 text-green-400 text-sm">
                  ✅ บัญชีใช้งานปกติ
                </div>
              ) : (
                <div className="text-center py-2 text-red-400 text-sm">
                  ❌ บัญชีถูกระงับ
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  toggleStudentStatus(selectedStudent.id, selectedStudent.isActive);
                  setShowModal(false);
                }}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  selectedStudent.isActive
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {selectedStudent.isActive ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-metaverse-purple/20 text-white rounded-lg hover:bg-metaverse-purple/30 transition"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}