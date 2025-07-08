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
  Zap
} from 'lucide-react';

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
  grade: string;
}

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

export default function RankingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
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

  const loadRankings = async (grade: string, userId: string) => {
    setLoadingRankings(true);
    try {
      // Query ข้อมูลเฉพาะระดับชั้นที่เลือก
      console.log('Loading rankings for grade:', grade);
      
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('grade', '==', grade),
        where('isActive', '==', true),
        orderBy(rankingType === 'score' ? 'totalScore' : 'experience', 'desc'),
        limit(20) // จำกัดแค่ 20 อันดับแรก
      );
      
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
      
      // ถ้า user ไม่อยู่ใน top 20 และดูระดับชั้นตัวเอง ให้คำนวณอันดับจริง
      if (!currentUserInList && grade === user?.grade && userId) {
        try {
          const countQuery = query(
            usersRef,
            where('grade', '==', grade),
            where('isActive', '==', true),
            where(rankingType === 'score' ? 'totalScore' : 'experience', '>', 
                  rankingType === 'score' ? (user?.totalScore || 0) : (user?.experience || 0))
          );
          
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
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setShowGradeDropdown(false);
    setUserRank(null);
  };

  // Get grade display name
  const getGradeDisplayName = (grade: string): string => {
    const gradeInfo = grades.find(g => g.value === grade);
    return gradeInfo?.label || grade;
  };

  // Get rank medal
  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 filter drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />;
      case 2:
        return <Medal className="w-7 h-7 md:w-9 md:h-9 text-gray-300 filter drop-shadow-[0_0_15px_rgba(192,192,192,0.8)]" />;
      case 3:
        return <Medal className="w-6 h-6 md:w-8 md:h-8 text-orange-400 filter drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]" />;
      default:
        return <span className="text-2xl md:text-3xl font-bold text-white/80">#{rank}</span>;
    }
  };

  // Get rank color
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400/30 to-orange-400/20 border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.3)]';
      case 2:
        return 'from-gray-300/30 to-gray-400/20 border-gray-300/50 shadow-[0_0_20px_rgba(192,192,192,0.3)]';
      case 3:
        return 'from-orange-400/30 to-orange-500/20 border-orange-400/50 shadow-[0_0_20px_rgba(251,146,60,0.3)]';
      default:
        return 'from-metaverse-purple/10 to-metaverse-pink/10 border-metaverse-purple/30';
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

  return (
    <div className="min-h-screen max-h-screen bg-metaverse-black flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-4 max-w-5xl mx-auto w-full">
        {/* Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <div className="flex items-center justify-between">
            {/* Left side - Back button, Title and Grade Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/play')}
                className="p-1.5 glass rounded-full hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
              
              <h1 className="text-lg md:text-2xl font-bold text-white flex items-center gap-1">
                <Trophy className="w-5 h-5 md:w-7 md:h-7 text-yellow-400" />
                <span className="hidden sm:inline">อันดับคะแนน</span>
                <span className="sm:hidden">อันดับ</span>
              </h1>
              
              {/* Grade Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                  className="flex items-center gap-1 metaverse-button px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-white font-medium text-sm"
                >
                  <span>{getGradeDisplayName(selectedGrade)}</span>
                  <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Grade Dropdown */}
                <AnimatePresence>
                  {showGradeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 w-40 glass-dark rounded-xl border border-metaverse-purple/30 overflow-hidden z-50 shadow-xl"
                    >
                      <div className="max-h-48 overflow-y-auto">
                        {grades.map((grade) => (
                          <button
                            key={grade.value}
                            onClick={() => handleGradeChange(grade.value)}
                            className={`w-full px-3 py-2 text-left hover:bg-white/10 transition flex items-center justify-between text-sm ${
                              selectedGrade === grade.value 
                                ? 'bg-metaverse-purple/20 text-white' 
                                : 'text-white/70 hover:text-white'
                            }`}
                          >
                            <span>{grade.label}</span>
                            {grade.value === user?.grade && (
                              <span className="text-xs text-metaverse-purple">(คุณ)</span>
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
            {userRank && selectedGrade === user?.grade && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-dark rounded-xl px-3 py-1.5 border border-metaverse-purple/30"
              >
                <p className="text-xs text-white/60">อันดับคุณ</p>
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                  #{userRank}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Filter Tabs - Compact */}
        <div className="glass-dark rounded-xl p-1 mb-3 border border-metaverse-purple/30">
          <div className="flex">
            <button
              onClick={() => setRankingType('score')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1 text-sm ${
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
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1 text-sm ${
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

        {/* Rankings List - Scrollable */}
        <div className="flex-1 glass-dark rounded-2xl p-3 md:p-4 border border-metaverse-purple/30 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-bold text-white">
              Top 20 - {getGradeDisplayName(selectedGrade)}
            </h2>
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
                className="text-5xl"
              >
                ⏳
              </motion.div>
            </div>
          ) : rankings.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-2">
              {rankings.map((player, index) => {
                const isCurrentUser = player.id === user?.id;
                
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass rounded-lg p-3 border bg-gradient-to-r ${
                      getRankColor(player.rank || index + 1)
                    } ${isCurrentUser ? 'ring-2 ring-metaverse-purple' : ''} transition-all hover:scale-[1.01]`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className="w-12 md:w-16 text-center">
                        {getRankMedal(player.rank || index + 1)}
                      </div>
                      
                      {/* Avatar - Now using EnhancedAvatarDisplay */}
                      <EnhancedAvatarDisplay
                        userId={player.id}
                        avatarData={player.avatarData}
                        basicAvatar={player.avatar}
                        size="small"
                        showEffects={!!player.rank && player.rank <= 3}
                        showAccessories={true}
                      />
                      
                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm md:text-base truncate">
                            {player.displayName || player.username}
                          </h3>
                          {isCurrentUser && (
                            <span className="text-xs px-1.5 py-0.5 bg-metaverse-purple/30 text-metaverse-purple rounded-full">
                              คุณ
                            </span>
                          )}
                        </div>
                        {player.currentTitleBadge && (
                          <p 
                            className="text-xs truncate"
                            style={{ color: getTitleColor(player.currentTitleBadge) }}
                          >
                            {player.currentTitleBadge.replace(/title-/g, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        )}
                        <p className="text-xs md:text-sm text-white/60">
                          Level {player.level}
                        </p>
                      </div>
                      
                      {/* Score/EXP */}
                      <div className="text-right">
                        <p className="text-lg md:text-xl font-bold text-white">
                          {rankingType === 'score' 
                            ? player.totalScore.toLocaleString()
                            : player.experience.toLocaleString()
                          }
                        </p>
                        <p className="text-xs text-white/50">
                          {rankingType === 'score' ? 'คะแนน' : 'EXP'}
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
                <p className="text-white/40 text-base md:text-lg">ยังไม่มีข้อมูลอันดับสำหรับ {getGradeDisplayName(selectedGrade)}</p>
                <p className="text-xs md:text-sm text-white/30 mt-2">
                  อาจจะยังไม่มีผู้เล่นในระดับชั้นนี้ หรือยังไม่มีคะแนน
                </p>
              </div>
            </div>
          )}

          {/* Show message if user not in top 20 */}
          {rankings.length > 0 && userRank && userRank > 20 && selectedGrade === user?.grade && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 glass bg-metaverse-purple/10 rounded-lg p-3 border border-metaverse-purple/30"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-metaverse-purple" />
                <div>
                  <p className="text-white font-medium text-sm">
                    คุณอยู่อันดับที่ #{userRank} ใน {getGradeDisplayName(selectedGrade)}
                  </p>
                  <p className="text-xs text-white/60">
                    แสดงเฉพาะ 20 อันดับแรก - เล่นต่อเพื่อขึ้น Top 20!
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
          className="hidden md:block mt-3 glass-dark p-3 rounded-xl text-xs border border-metaverse-purple/20"
        >
          <div className="flex items-start gap-2">
            <Trophy className="w-4 h-4 text-metaverse-purple mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/80 font-medium mb-0.5">ระบบอันดับแยกตามระดับชั้น</p>
              <ul className="text-white/60 space-y-0.5">
                <li>• แต่ละระดับชั้นมีการจัดอันดับแยกกัน</li>
                <li>• แสดง Top 20 ของแต่ละระดับชั้น</li>
                <li>• อัพเดททันทีเมื่อเล่นเกม</li>
                <li>• เลือกดูได้ทั้งคะแนนรวมและ EXP</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}