// app/admin/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { User } from '@/types';
import { BarChart3, School, Trophy, Download } from 'lucide-react';

interface GradeStats {
  grade: string;
  studentCount: number;
  avgLevel: number;
  avgScore: number;
  topStudent: string;
}

interface SchoolStats {
  school: string;
  studentCount: number;
  avgScore: number;
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<User[]>([]);
  const [gradeStats, setGradeStats] = useState<GradeStats[]>([]);
  const [schoolStats, setSchoolStats] = useState<SchoolStats[]>([]);
  const [topStudents, setTopStudents] = useState<User[]>([]);
  const [reportType, setReportType] = useState<'grade' | 'school' | 'top'>('grade');

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      
      setStudents(usersData);
      
      // Process grade statistics
      processGradeStats(usersData);
      
      // Process school statistics
      processSchoolStats(usersData);
      
      // Process top students
      processTopStudents(usersData);
      
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processGradeStats = (students: User[]) => {
    const gradeGroups: Record<string, User[]> = {};
    
    students.forEach(student => {
      if (!gradeGroups[student.grade]) {
        gradeGroups[student.grade] = [];
      }
      gradeGroups[student.grade].push(student);
    });

    const stats: GradeStats[] = Object.entries(gradeGroups).map(([grade, students]) => {
      const avgLevel = students.reduce((sum, s) => sum + s.level, 0) / students.length;
      const avgScore = students.reduce((sum, s) => sum + s.totalScore, 0) / students.length;
      const topStudent = students.sort((a, b) => b.totalScore - a.totalScore)[0];
      
      return {
        grade,
        studentCount: students.length,
        avgLevel: Math.round(avgLevel * 10) / 10,
        avgScore: Math.round(avgScore),
        topStudent: topStudent.displayName || topStudent.username,
      };
    });

    setGradeStats(stats.sort((a, b) => a.grade.localeCompare(b.grade)));
  };

  const processSchoolStats = (students: User[]) => {
    const schoolGroups: Record<string, User[]> = {};
    
    students.forEach(student => {
      if (!schoolGroups[student.school]) {
        schoolGroups[student.school] = [];
      }
      schoolGroups[student.school].push(student);
    });

    const stats: SchoolStats[] = Object.entries(schoolGroups).map(([school, students]) => {
      const avgScore = students.reduce((sum, s) => sum + s.totalScore, 0) / students.length;
      
      return {
        school,
        studentCount: students.length,
        avgScore: Math.round(avgScore),
      };
    });

    setSchoolStats(stats.sort((a, b) => b.studentCount - a.studentCount));
  };

  const processTopStudents = (students: User[]) => {
    const top = students
      .filter(s => s.isActive)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);
    
    setTopStudents(top);
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
        <h1 className="text-3xl font-bold text-white">รายงาน</h1>
        <p className="text-white/60 mt-2">วิเคราะห์ข้อมูลและผลการเรียนของนักเรียน</p>
      </div>

      {/* Report Type Selector */}
      <div className="glass-dark rounded-xl p-4 mb-6 border border-metaverse-purple/20">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setReportType('grade')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              reportType === 'grade'
                ? 'bg-gradient-to-r from-metaverse-purple to-metaverse-pink text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            รายงานตามระดับชั้น
          </button>
          <button
            onClick={() => setReportType('school')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              reportType === 'school'
                ? 'bg-gradient-to-r from-metaverse-purple to-metaverse-pink text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <School className="w-4 h-4" />
            รายงานตามโรงเรียน
          </button>
          <button
            onClick={() => setReportType('top')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              reportType === 'top'
                ? 'bg-gradient-to-r from-metaverse-purple to-metaverse-pink text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Top 10 นักเรียน
          </button>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'grade' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-xl overflow-hidden border border-metaverse-purple/20"
        >
          <h2 className="text-xl font-bold text-white p-6 border-b border-metaverse-purple/30">
            สถิติตามระดับชั้น
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-metaverse-darkPurple/50 border-b border-metaverse-purple/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">ระดับชั้น</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">จำนวนนักเรียน</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">Level เฉลี่ย</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">คะแนนเฉลี่ย</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 hidden md:table-cell">นักเรียนคะแนนสูงสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-metaverse-purple/20">
                {gradeStats.map((stat) => (
                  <tr key={stat.grade} className="hover:bg-white/5">
                    <td className="px-6 py-4 font-medium text-white">
                      {getGradeDisplayName(stat.grade)}
                    </td>
                    <td className="px-6 py-4 text-center text-white">
                      {stat.studentCount}
                    </td>
                    <td className="px-6 py-4 text-center text-white">
                      {stat.avgLevel}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-metaverse-pink">
                      {stat.avgScore.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-white hidden md:table-cell">
                      🏆 {stat.topStudent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {reportType === 'school' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-xl overflow-hidden border border-metaverse-purple/20"
        >
          <h2 className="text-xl font-bold text-white p-6 border-b border-metaverse-purple/30">
            สถิติตามโรงเรียน
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-metaverse-darkPurple/50 border-b border-metaverse-purple/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">โรงเรียน</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">จำนวนนักเรียน</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">คะแนนเฉลี่ย</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white/80 hidden md:table-cell">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-metaverse-purple/20">
                {schoolStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-white/5">
                    <td className="px-6 py-4 font-medium text-white">
                      {stat.school}
                    </td>
                    <td className="px-6 py-4 text-center text-white">
                      {stat.studentCount}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-metaverse-pink">
                      {stat.avgScore.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="w-32 mx-auto bg-white/10 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-metaverse-purple to-metaverse-pink h-3 rounded-full"
                          style={{ width: `${Math.min((stat.avgScore / 1000) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {reportType === 'top' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-xl overflow-hidden border border-metaverse-purple/20"
        >
          <h2 className="text-xl font-bold text-white p-6 border-b border-metaverse-purple/30 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Top 10 นักเรียนคะแนนสูงสุด
          </h2>
          <div className="p-6">
            <div className="space-y-4">
              {topStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg glass-dark border ${
                    index === 0 ? 'border-yellow-400/50 bg-yellow-400/5' :
                    index === 1 ? 'border-gray-400/50 bg-gray-400/5' :
                    index === 2 ? 'border-orange-400/50 bg-orange-400/5' :
                    'border-metaverse-purple/20'
                  }`}
                >
                  <div className={`text-3xl font-bold ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-orange-400' :
                    'text-white/50'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="text-3xl">
                    {getAvatarEmoji(student.avatar)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {student.displayName || student.username}
                    </p>
                    <p className="text-sm text-white/60">
                      {student.school} • {getGradeDisplayName(student.grade)} • Level {student.level}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-metaverse-pink">
                      {student.totalScore.toLocaleString()}
                    </p>
                    <p className="text-sm text-white/50">คะแนน</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Export Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => alert('ฟีเจอร์ Export กำลังพัฒนา')}
          className="metaverse-button text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2 mx-auto"
        >
          <Download className="w-5 h-5" />
          Export รายงาน (Excel)
        </button>
      </div>
    </div>
  );
}