// app/(game)/ranking/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User } from '@/types';
import { Trophy, Medal, Crown, ArrowLeft } from 'lucide-react';

interface RankingUser {
  id: string;
  username: string;
  displayName?: string;
  avatar: string;
  grade: string;
  level: number;
  totalScore: number;
  rank?: number;
}

export default function RankingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadRankings(selectedGrade === 'all' ? null : selectedGrade);
    }
  }, [selectedGrade, currentUser]);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);
      setSelectedGrade(user.grade); // Default to user's grade
    } catch (error) {
      console.error('Error loading user:', error);
      router.push('/login');
    }
  };

  const loadRankings = async (grade: string | null) => {
    try {
      let q;
      if (grade) {
        q = query(
          collection(db, 'users'),
          where('grade', '==', grade),
          where('isActive', '==', true),
          orderBy('totalScore', 'desc'),
          limit(100)
        );
      } else {
        q = query(
          collection(db, 'users'),
          where('isActive', '==', true),
          orderBy('totalScore', 'desc'),
          limit(100)
        );
      }

      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        rank: index + 1
      } as RankingUser));

      setRankings(users);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="text-lg font-bold text-white/60">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-30"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl relative z-10"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metaverse-black py-8">
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
          
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            อันดับคะแนน
          </h1>
          
          <div className="w-20" />
        </motion.div>

        {/* Grade Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark rounded-xl p-4 mb-6 border border-metaverse-purple/30"
        >
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-metaverse-purple/30 rounded-lg text-white focus:outline-none focus:border-metaverse-pink"
          >
            <option value="all" className="bg-metaverse-black">ทุกระดับชั้น</option>
            <option value={currentUser?.grade || ''} className="bg-metaverse-black">
              ชั้นของฉัน ({getGradeDisplayName(currentUser?.grade || '')})
            </option>
            <optgroup label="อนุบาล" className="bg-metaverse-black">
              <option value="K1" className="bg-metaverse-black">อนุบาล 1</option>
              <option value="K2" className="bg-metaverse-black">อนุบาล 2</option>
              <option value="K3" className="bg-metaverse-black">อนุบาล 3</option>
            </optgroup>
            <optgroup label="ประถม" className="bg-metaverse-black">
              <option value="P1" className="bg-metaverse-black">ประถม 1</option>
              <option value="P2" className="bg-metaverse-black">ประถม 2</option>
              <option value="P3" className="bg-metaverse-black">ประถม 3</option>
              <option value="P4" className="bg-metaverse-black">ประถม 4</option>
              <option value="P5" className="bg-metaverse-black">ประถม 5</option>
              <option value="P6" className="bg-metaverse-black">ประถม 6</option>
            </optgroup>
            <optgroup label="มัธยม" className="bg-metaverse-black">
              <option value="M1" className="bg-metaverse-black">มัธยม 1</option>
              <option value="M2" className="bg-metaverse-black">มัธยม 2</option>
              <option value="M3" className="bg-metaverse-black">มัธยม 3</option>
              <option value="M4" className="bg-metaverse-black">มัธยม 4</option>
              <option value="M5" className="bg-metaverse-black">มัธยม 5</option>
              <option value="M6" className="bg-metaverse-black">มัธยม 6</option>
            </optgroup>
          </select>
        </motion.div>

        {/* Rankings List */}
        <div className="space-y-3">
          {rankings.length === 0 ? (
            <div className="glass-dark rounded-xl p-8 text-center border border-metaverse-purple/30">
              <p className="text-white/60">ยังไม่มีข้อมูลอันดับ</p>
            </div>
          ) : (
            rankings.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className={`glass-dark rounded-xl p-4 border ${
                  user.id === currentUser?.id
                    ? 'border-metaverse-purple bg-metaverse-purple/10'
                    : 'border-metaverse-purple/20'
                } ${
                  user.rank === 1 ? 'bg-yellow-400/5' :
                  user.rank === 2 ? 'bg-gray-400/5' :
                  user.rank === 3 ? 'bg-orange-400/5' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-12 text-center">
                    {getRankIcon(user.rank || index + 1)}
                  </div>

                  {/* Avatar */}
                  <div className="text-3xl">
                    {getAvatarEmoji(user.avatar)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {user.displayName || user.username}
                      {user.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-metaverse-purple">(คุณ)</span>
                      )}
                    </p>
                    <p className="text-sm text-white/60">
                      {getGradeDisplayName(user.grade)} • Level {user.level}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                      {user.totalScore.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60">คะแนน</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}