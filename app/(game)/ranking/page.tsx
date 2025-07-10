// app/(game)/ranking/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import { 
  Trophy, 
  Medal, 
  Crown, 
  ArrowLeft, 
  Users,
  Star,
  ChevronDown,
  Zap,
  Globe,
  TrendingUp
} from 'lucide-react';
import { Grade } from '@/types';

interface RankingUser {
  id: string;
  username: string;
  displayName?: string;
  avatar: string;
  avatarData?: any;
  currentTitleBadge?: string;
  totalScore: number;
  level: number;
  experience: number;
  rank?: number;
  grade: Grade | string;
}

const grades = [
  { value: 'ALL' as const, label: 'รวมทุกระดับ', icon: '🌟' },
  { value: Grade.K1, label: 'อนุบาล 1', icon: '🎈' },
  { value: Grade.K2, label: 'อนุบาล 2', icon: '🎨' },
  { value: Grade.K3, label: 'อนุบาล 3', icon: '🚀' },
  { value: Grade.P1, label: 'ประถม 1', icon: '📚' },
  { value: Grade.P2, label: 'ประถม 2', icon: '✏️' },
  { value: Grade.P3, label: 'ประถม 3', icon: '📖' },
  { value: Grade.P4, label: 'ประถม 4', icon: '🧮' },
  { value: Grade.P5, label: 'ประถม 5', icon: '📐' },
  { value: Grade.P6, label: 'ประถม 6', icon: '🎯' },
  { value: Grade.M1, label: 'มัธยม 1', icon: '🔬' },
  { value: Grade.M2, label: 'มัธยม 2', icon: '📊' },
  { value: Grade.M3, label: 'มัธยม 3', icon: '📈' },
  { value: Grade.M4, label: 'มัธยม 4', icon: '🎓' },
  { value: Grade.M5, label: 'มัธยม 5', icon: '🏆' },
  { value: Grade.M6, label: 'มัธยม 6', icon: '👑' },
];

export default function RankingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | 'ALL'>('ALL');
  const [rankingType, setRankingType] = useState<'score' | 'exp'>('score');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [loadingRankings, setLoadingRankings] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedGrade(user.grade);
    }
  }, [user]);

  useEffect(() => {
    if (selectedGrade && user) {
      loadRankings(selectedGrade, user.id);
    }
  }, [selectedGrade, rankingType, user]);

  const loadRankings = async (grade: Grade | 'ALL', userId: string) => {
    setLoadingRankings(true);
    try {
      console.log('Loading rankings for grade:', grade);
      
      const usersRef = collection(db, 'users');
      let q;
      
      if (grade === 'ALL') {
        // รวมทุกระดับ
        q = query(
          usersRef,
          where('isActive', '==', true),
          orderBy(rankingType === 'score' ? 'totalScore' : 'experience', 'desc'),
          limit(50) // เพิ่มจำนวนสำหรับ ranking รวม
        );
      } else {
        // แยกตามระดับ
        q = query(
          usersRef,
          where('grade', '==', grade),
          where('isActive', '==', true),
          orderBy(rankingType === 'score' ? 'totalScore' : 'experience', 'desc'),
          limit(30) // จำกัดแค่ 30 อันดับแรก
        );
      }
      
      const snapshot = await getDocs(q);
      console.log('Found users:', snapshot.size);
      
      const users: RankingUser[] = [];
      let currentUserRank = null;
      let currentUserInList = false;
      
      // Process users
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        
        const rankUser: RankingUser = {
          id: doc.id,
          username: data.username || 'Unknown',
          displayName: data.displayName,
          avatar: data.avatar || '👤',
          avatarData: data.avatarData,
          currentTitleBadge: data.currentTitleBadge,
          totalScore: data.totalScore || 0,
          level: data.level || 1,
          experience: data.experience || 0,
          rank: index + 1,
          grade: data.grade
        };
        
        users.push(rankUser);
        
        if (doc.id === userId) {
          currentUserRank = index + 1;
          currentUserInList = true;
        }
      });
      
      // Sort by rank
      users.sort((a, b) => (a.rank || 0) - (b.rank || 0));
      
      // ถ้า user ไม่อยู่ใน top และดูระดับชั้นตัวเอง ให้คำนวณอันดับจริง
      if (!currentUserInList && (grade === user?.grade || grade === 'ALL') && userId) {
        try {
          let countQuery;
          if (grade === 'ALL') {
            countQuery = query(
              usersRef,
              where('isActive', '==', true),
              where(rankingType === 'score' ? 'totalScore' : 'experience', '>', 
                    rankingType === 'score' ? (user?.totalScore || 0) : (user?.experience || 0))
            );
          } else {
            countQuery = query(
              usersRef,
              where('grade', '==', grade),
              where('isActive', '==', true),
              where(rankingType === 'score' ? 'totalScore' : 'experience', '>', 
                    rankingType === 'score' ? (user?.totalScore || 0) : (user?.experience || 0))
            );
          }
          
          const higherRankedUsers = await getDocs(countQuery);
          currentUserRank = higherRankedUsers.size + 1;
        } catch (error) {
          console.error('Error calculating user rank:', error);
        }
      }
      
      setRankings(users);
      setUserRank(currentUserRank);
    } catch (error) {
      console.error('Error loading rankings:', error);
      setRankings([]);
      setUserRank(null);
    } finally {
      setLoadingRankings(false);
    }
  };

  // Change grade
  const handleGradeChange = (grade: Grade | 'ALL') => {
    setSelectedGrade(grade);
    setShowGradeDropdown(false);
    setUserRank(null);
  };

  // Get grade display info
  const getGradeInfo = (grade: Grade | 'ALL') => {
    const gradeInfo = grades.find(g => g.value === grade);
    return gradeInfo || { value: grade, label: String(grade), icon: '📚' };
  };

  // Get rank medal
  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 filter drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />;
      case 2:
        return <Medal className="w-4 h-4 md:w-5 md:h-5 text-gray-300 filter drop-shadow-[0_0_10px_rgba(192,192,192,0.8)]" />;
      case 3:
        return <Medal className="w-4 h-4 md:w-5 md:h-5 text-orange-400 filter drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]" />;
      default:
        return (
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-metaverse-purple to-metaverse-pink flex items-center justify-center">
            <span className="text-xs md:text-sm font-bold text-white">{rank}</span>
          </div>
        );
    }
  };

  // Get rank color
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400/20 to-orange-400/10 border-yellow-400/40';
      case 2:
        return 'from-gray-300/20 to-gray-400/10 border-gray-300/40';
      case 3:
        return 'from-orange-400/20 to-orange-500/10 border-orange-400/40';
      default:
        return rank <= 10 
          ? 'from-metaverse-purple/15 to-metaverse-pink/10 border-metaverse-purple/30'
          : 'from-metaverse-purple/10 to-metaverse-pink/5 border-metaverse-purple/20';
    }
  };

  // Get title color
  const getTitleColor = (titleId: string): string => {
    const colors: Record<string, string> = {
      'title-legend': '#FFD700',
      'title-champion': '#FF6B6B',
      'title-math-master': '#9333EA',
      'title-speed-demon': '#3B82F6',
      'title-perfect-scorer': '#10B981',
      'title-dedication-hero': '#F59E0B'
    };
    return colors[titleId] || '#FFD700';
  };

  if (!user) return null;

  const selectedGradeInfo = getGradeInfo(selectedGrade);

  return (
    <div className="min-h-screen bg-metaverse-black flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 flex flex-col p-3 md:p-4 max-w-6xl mx-auto w-full h-screen">
        {/* Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => router.push('/play')}
                className="p-1.5 md:p-2 glass rounded-full hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
              
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                <h1 className="text-lg md:text-xl font-bold text-white">
                  <span className="hidden sm:inline">อันดับคะแนน</span>
                  <span className="sm:hidden">อันดับ</span>
                </h1>
              </div>
              
              {/* Grade Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                  className="flex items-center gap-1.5 md:gap-2 metaverse-button px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-white font-medium text-sm md:text-base"
                >
                  <span className="text-sm md:text-base">{selectedGradeInfo.icon}</span>
                  <span className="hidden sm:inline">{selectedGradeInfo.label}</span>
                  <span className="sm:hidden">{selectedGrade === 'ALL' ? 'รวม' : selectedGrade}</span>
                  <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Grade Dropdown */}
                <AnimatePresence>
                  {showGradeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 w-48 md:w-52 glass-dark rounded-xl border border-metaverse-purple/30 overflow-hidden z-50 shadow-xl"
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {grades.map((grade) => (
                          <button
                            key={grade.value}
                            onClick={() => handleGradeChange(grade.value)}
                            className={`w-full px-3 py-2.5 text-left hover:bg-white/10 transition flex items-center gap-2 text-sm ${
                              selectedGrade === grade.value 
                                ? 'bg-metaverse-purple/20 text-white' 
                                : 'text-white/70 hover:text-white'
                            }`}
                          >
                            <span className="text-base">{grade.icon}</span>
                            <span className="flex-1">{grade.label}</span>
                            {grade.value === 'ALL' && (
                              <Globe className="w-4 h-4 text-metaverse-purple" />
                            )}
                            {grade.value !== 'ALL' && grade.value === user?.grade && (
                              <span className="text-xs text-metaverse-purple font-medium">(คุณ)</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Right side - User Rank */}
            {userRank && (selectedGrade === user?.grade || selectedGrade === 'ALL') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-dark rounded-xl px-2 md:px-3 py-1.5 border border-metaverse-purple/30"
              >
                <p className="text-xs text-white/60">อันดับคุณ</p>
                <p className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                  #{userRank}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Filter Tabs - Compact */}
        <div className="glass-dark rounded-xl p-1 mb-3 border border-metaverse-purple/30 flex-shrink-0">
          <div className="flex">
            <button
              onClick={() => setRankingType('score')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 text-sm ${
                rankingType === 'score'
                  ? 'metaverse-button text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">คะแนนรวม</span>
              <span className="sm:hidden">คะแนน</span>
            </button>
            <button
              onClick={() => setRankingType('exp')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 text-sm ${
                rankingType === 'exp'
                  ? 'metaverse-button text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">EXP สูงสุด</span>
              <span className="sm:hidden">EXP</span>
            </button>
          </div>
        </div>

        {/* Rankings List - Fixed Height Container */}
        <div className="flex-1 glass-dark rounded-2xl p-3 md:p-4 border border-metaverse-purple/30 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-metaverse-purple" />
              <h2 className="text-sm md:text-base font-bold text-white">
                Top {selectedGrade === 'ALL' ? '50' : '30'} - {selectedGradeInfo.label}
              </h2>
            </div>
            <div className="text-xs text-white/60">
              {rankingType === 'score' ? 'เรียงตามคะแนนรวม' : 'เรียงตาม EXP'}
            </div>
          </div>

          {/* Loading State */}
          {loadingRankings ? (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-4xl md:text-5xl"
              >
                ⏳
              </motion.div>
            </div>
          ) : rankings.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {rankings.map((player, index) => {
                const isCurrentUser = player.id === user?.id;
                
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`rounded-md p-2 md:p-2.5 border transition-all hover:scale-[1.005] ${
                      isCurrentUser 
                        ? 'bg-metaverse-purple/25 border-metaverse-purple' 
                        : `glass bg-gradient-to-r ${getRankColor(player.rank || index + 1)}`
                    }`}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      {/* Rank - Compact */}
                      <div className="w-6 md:w-7 text-center flex-shrink-0">
                        {getRankMedal(player.rank || index + 1)}
                      </div>
                      
                      {/* Avatar - Proper container */}
                      <div className="flex-shrink-0">
                        <EnhancedAvatarDisplay
                          userId={player.id}
                          avatarData={player.avatarData}
                          basicAvatar={player.avatar}
                          size="tiny"
                          showEffects={false}
                          showAccessories={true}
                        />
                      </div>
                      
                      {/* Player Name + Level */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-base md:text-lg truncate leading-tight">
                          {player.displayName || player.username}
                        </h3>
                        <div className="text-xs md:text-sm text-white/60 leading-none">
                          Level {player.level}
                        </div>
                      </div>
                      
                      {/* Compact Info */}
                      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                        {/* User indicator */}
                        {isCurrentUser && (
                          <span className="text-xs px-1.5 py-0.5 bg-white/25 text-white rounded-full font-bold">
                            ME
                          </span>
                        )}
                        
                        {/* Grade for ALL view */}
                        {selectedGrade === 'ALL' && (
                          <span className="text-xs px-1 py-0.5 bg-metaverse-purple/25 text-metaverse-purple rounded font-bold">
                            {player.grade}
                          </span>
                        )}
                        
                        {/* Title Badge - Ultra compact */}
                        {player.currentTitleBadge && (
                          <span 
                            className="text-xs font-bold truncate max-w-12 md:max-w-16 hidden sm:inline"
                            style={{ color: getTitleColor(player.currentTitleBadge) }}
                          >
                            {player.currentTitleBadge.replace(/title-/g, '').replace(/-/g, '').slice(0, 6)}
                          </span>
                        )}
                      </div>
                      
                      {/* Score/EXP - Much bigger font */}
                      <div className="text-right flex-shrink-0 min-w-0">
                        <p className="text-lg md:text-xl font-black text-white leading-none">
                          {(rankingType === 'score' 
                            ? player.totalScore 
                            : player.experience
                          ).toLocaleString()}
                        </p>
                        <p className="text-xs md:text-sm text-white/60 leading-none font-medium">
                          {rankingType === 'score' ? 'PTS' : 'EXP'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-8">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-base md:text-lg">ยังไม่มีข้อมูลอันดับ</p>
                <p className="text-xs md:text-sm text-white/30 mt-2">
                  {selectedGrade === 'ALL' 
                    ? 'ยังไม่มีผู้เล่นในระบบ หรือยังไม่มีคะแนน'
                    : `อาจจะยังไม่มีผู้เล่นใน${selectedGradeInfo.label} หรือยังไม่มีคะแนน`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Show message if user not in top - Fixed */}
          {rankings.length > 0 && userRank && 
           ((selectedGrade === 'ALL' && userRank > 50) || 
            (selectedGrade !== 'ALL' && userRank > 30)) && 
           (selectedGrade === user?.grade || selectedGrade === 'ALL') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 glass bg-metaverse-purple/10 rounded-lg p-2.5 md:p-3 border border-metaverse-purple/30 flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-metaverse-purple" />
                <div>
                  <p className="text-white font-medium text-sm">
                    คุณอยู่อันดับที่ #{userRank} ใน {selectedGradeInfo.label}
                  </p>
                  <p className="text-xs text-white/60">
                    แสดงเฉพาะ {selectedGrade === 'ALL' ? '50' : '30'} อันดับแรก - เล่นต่อเพื่อขึ้น Top!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Info Box - Only on desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="hidden lg:block mt-3 glass-dark p-3 rounded-xl text-xs border border-metaverse-purple/20 flex-shrink-0"
        >
          <div className="flex items-start gap-2">
            <Trophy className="w-4 h-4 text-metaverse-purple mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/80 font-medium mb-0.5">ระบบอันดับ MathQuest</p>
              <ul className="text-white/60 space-y-0.5 text-xs">
                <li>• <strong>รวมทุกระดับ:</strong> แสดง Top 50 ของทุกคน</li>
                <li>• <strong>แยกตามระดับ:</strong> แสดง Top 30 ของแต่ละระดับชั้น</li>
                <li>• <strong>คะแนนรวม:</strong> คะแนนสะสมจากการเล่นเกม</li>
                <li>• <strong>EXP:</strong> ประสบการณ์ที่ใช้แลกรางวัล</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}