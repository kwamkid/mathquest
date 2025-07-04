// app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalCodes: number;
  activeCodes: number;
  todayLogins: number;
  totalGames: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalCodes: 0,
    activeCodes: 0,
    todayLogins: 0,
    totalGames: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Get users stats
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());
      
      const today = new Date().toISOString().split('T')[0];
      const todayLogins = users.filter(user => 
        user.lastLoginDate && user.lastLoginDate.startsWith(today)
      ).length;

      // Get registration codes stats
      const codesSnapshot = await getDocs(collection(db, 'registrationCodes'));
      const codes = codesSnapshot.docs.map(doc => doc.data());

      // Get game sessions stats (if collection exists)
      let totalGames = 0;
      try {
        const gamesSnapshot = await getDocs(collection(db, 'gameSessions'));
        totalGames = gamesSnapshot.size;
      } catch (error) {
        console.log('Game sessions collection not found');
      }

      setStats({
        totalStudents: users.length,
        activeStudents: users.filter(u => u.isActive).length,
        totalCodes: codes.length,
        activeCodes: codes.filter(c => c.isActive).length,
        todayLogins,
        totalGames,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'นักเรียนทั้งหมด',
      value: stats.totalStudents,
      icon: '👥',
      gradient: 'from-metaverse-purple to-metaverse-pink',
      subtext: `${stats.activeStudents} คนที่ใช้งานอยู่`,
    },
    {
      title: 'Registration Codes',
      value: stats.totalCodes,
      icon: '🎫',
      gradient: 'from-metaverse-pink to-metaverse-red',
      subtext: `${stats.activeCodes} codes ที่ใช้งานได้`,
    },
    {
      title: 'เข้าสู่ระบบวันนี้',
      value: stats.todayLogins,
      icon: '📅',
      gradient: 'from-metaverse-red to-metaverse-darkRed',
      subtext: 'นักเรียนที่ login วันนี้',
    },
    {
      title: 'เกมที่เล่นทั้งหมด',
      value: stats.totalGames,
      icon: '🎮',
      gradient: 'from-metaverse-darkPurple to-metaverse-purple',
      subtext: 'จำนวนครั้งที่เล่นเกม',
    },
  ];

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
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/60 mt-2">ภาพรวมระบบ MathQuest</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-dark rounded-xl overflow-hidden border border-metaverse-purple/20 hover:border-metaverse-purple/40 transition-all"
          >
            <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl filter drop-shadow-lg">{stat.icon}</span>
                <span className={`text-2xl lg:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value.toLocaleString()}
                </span>
              </div>
              <h3 className="text-white font-semibold text-sm lg:text-base">{stat.title}</h3>
              <p className="text-xs lg:text-sm text-white/50 mt-1">{stat.subtext}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-dark rounded-xl p-6 mb-8 border border-metaverse-purple/20">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/codes/new">
            <motion.div
              className="flex items-center gap-3 p-4 glass rounded-lg hover:bg-white/5 transition cursor-pointer border border-metaverse-purple/20 hover:border-metaverse-purple/40"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-semibold text-white">สร้าง Registration Code</p>
                <p className="text-sm text-white/60">สร้าง code ใหม่สำหรับนักเรียน</p>
              </div>
            </motion.div>
          </Link>

          <Link href="/admin/students">
            <motion.div
              className="flex items-center gap-3 p-4 glass rounded-lg hover:bg-white/5 transition cursor-pointer border border-metaverse-purple/20 hover:border-metaverse-purple/40"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">👀</span>
              <div>
                <p className="font-semibold text-white">ดูรายชื่อนักเรียน</p>
                <p className="text-sm text-white/60">จัดการข้อมูลนักเรียน</p>
              </div>
            </motion.div>
          </Link>

          <Link href="/admin/reports">
            <motion.div
              className="flex items-center gap-3 p-4 glass rounded-lg hover:bg-white/5 transition cursor-pointer border border-metaverse-purple/20 hover:border-metaverse-purple/40"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-semibold text-white">ดูรายงาน</p>
                <p className="text-sm text-white/60">วิเคราะห์ผลการเรียน</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-dark rounded-xl p-6 border border-metaverse-purple/20">
        <h2 className="text-xl font-bold text-white mb-4">กิจกรรมล่าสุด</h2>
        <div className="text-center text-white/50 py-8">
          <span className="text-4xl mb-2 block opacity-50">📝</span>
          <p>ยังไม่มีข้อมูลกิจกรรม</p>
        </div>
      </div>
    </div>
  );
}