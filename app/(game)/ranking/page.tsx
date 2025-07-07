'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/auth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { User } from '@/types';
import AvatarDisplay from '@/components/avatar/AvatarDisplay';
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
  const [user, setUser] = useState<User | null>(null);
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [rankingType, setRankingType] = useState<'score' | 'exp'>('score');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [loadingRankings, setLoadingRankings] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (selectedGrade && user) {
      loadRankings(selectedGrade, user.id);
    }
  }, [selectedGrade, rankingType, user]);

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser();
      if (!userData) {
        router.push('/login');
        return;
      }
      
      setUser(userData);
      setSelectedGrade(userData.grade);
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

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
        return <Crown className="w-10 h-10 text-yellow-400 filter drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />;
      case 2:
        return <Medal className="w-9 h-9 text-gray-300 filter drop-shadow-[0_0_15px_rgba(192,192,192,0.8)]" />;
      case 3:
        return <Medal className="w-8 h-8 text-orange-400 filter drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]" />;
      default:
        return <span className="text-3xl font-bold text-white/80">#{rank}</span>;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🏆
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metaverse-black py-8">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {/* Left side - Back button, Title and Grade Selector */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/play')}
                className="p-2 glass rounded-full hover:bg-white/10 transition"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                อันดับคะแนน
              </h1>
              
              {/* Grade Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                  className="flex items-center gap-2 metaverse-button px-4 py-2 rounded-lg text-white font-medium"
                >
                  <span>{getGradeDisplayName(selectedGrade)}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Grade Dropdown */}
                <AnimatePresence>
                  {showGradeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 w-48 glass-dark rounded-xl border border-metaverse-purple/30 overflow-hidden z-50 shadow-xl"
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {grades.map((grade) => (
                          <button
                            key={grade.value}
                            onClick={() => handleGradeChange(grade.value)}
                            className={`w-full px-4 py-2.5 text-left hover:bg-white/10 transition flex items-center justify-between ${
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
            
            {/* Right side - User Rank (Only show if viewing own grade) */}
            {userRank && selectedGrade === user?.grade && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:block glass-dark rounded-2xl px-6 py-3 border border-metaverse-purple/30"
              >
                <p className="text-sm text-white/60">อันดับของคุณ</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                  #{userRank}
                </p>
              </motion.div>
            )}
          </div>

          {/* Mobile User Rank */}
          {userRank && selectedGrade === user?.grade && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:hidden glass-dark rounded-2xl px-4 py-2 border border-metaverse-purple/30 inline-block"
            >
              <p className="text-xs text-white/60">อันดับของคุณ: <span className="font-bold text-metaverse-purple">#{userRank}</span></p>
            </motion.div>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <div className="glass-dark rounded-2xl p-1 mb-6 border border-metaverse-purple/30">
          <div className="flex">
            <button
              onClick={() => setRankingType('score')}
              className={`flex-1 px-4 md:px-6 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                rankingType === 'score'
                  ? 'metaverse-button text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Star className="w-5 h-5" />
              <span className="hidden sm:inline">คะแนนรวม</span>
              <span className="sm:hidden">คะแนน</span>
            </button>
            <button
              onClick={() => setRankingType('exp')}
              className={`flex-1 px-4 md:px-6 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                rankingType === 'exp'
                  ? 'metaverse-button text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span className="hidden sm:inline">EXP สูงสุด</span>
              <span className="sm:hidden">EXP</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loadingRankings && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-6xl inline-block"
            >
              ⏳
            </motion.div>
            <p className="text-white/60 mt-4">กำลังโหลดอันดับของ {getGradeDisplayName(selectedGrade)}...</p>
          </div>
        )}

        {/* Rankings List */}
        {!loadingRankings && (
          <div className="glass-dark rounded-3xl p-6 border border-metaverse-purple/30">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Top 20 - {getGradeDisplayName(selectedGrade)}
              </h2>
              <div className="text-sm text-white/60">
                {rankingType === 'score' ? 'เรียงตามคะแนนรวม' : 'เรียงตาม EXP'}
              </div>
            </div>

            {rankings.length > 0 ? (
              <div className="space-y-3">
                {rankings.map((player, index) => {
                  const isCurrentUser = player.id === user?.id;
                  
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`glass rounded-xl p-4 border bg-gradient-to-r ${
                        getRankColor(player.rank || index + 1)
                      } ${isCurrentUser ? 'ring-2 ring-metaverse-purple' : ''} transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-16 text-center">
                          {getRankMedal(player.rank || index + 1)}
                        </div>
                        
                        {/* Avatar */}
                        <AvatarDisplay
                          avatarData={player.avatarData}
                          basicAvatar={player.avatar}
                          size="small"
                          showEffects={!!player.rank && player.rank <= 3}
                        />
                        
                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white truncate">
                              {player.displayName || player.username}
                            </h3>
                            {isCurrentUser && (
                              <span className="text-xs px-2 py-0.5 bg-metaverse-purple/30 text-metaverse-purple rounded-full">
                                คุณ
                              </span>
                            )}
                          </div>
                          {player.currentTitleBadge && (
                            <p className="text-xs text-yellow-400 truncate">
                              {player.currentTitleBadge}
                            </p>
                          )}
                          <p className="text-sm text-white/60">
                            Level {player.level}
                          </p>
                        </div>
                        
                        {/* Score/EXP */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
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
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40 text-lg">ยังไม่มีข้อมูลอันดับสำหรับ {getGradeDisplayName(selectedGrade)}</p>
                <p className="text-sm text-white/30 mt-2">
                  อาจจะยังไม่มีผู้เล่นในระดับชั้นนี้ หรือยังไม่มีคะแนน
                </p>
              </div>
            )}

            {/* Show message if user not in top 20 */}
            {rankings.length > 0 && userRank && userRank > 20 && selectedGrade === user?.grade && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 glass bg-metaverse-purple/10 rounded-xl p-4 border border-metaverse-purple/30"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-metaverse-purple" />
                  <div>
                    <p className="text-white font-medium">
                      คุณอยู่อันดับที่ #{userRank} ใน {getGradeDisplayName(selectedGrade)}
                    </p>
                    <p className="text-sm text-white/60">
                      แสดงเฉพาะ 20 อันดับแรก - เล่นต่อเพื่อขึ้น Top 20!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass-dark p-4 rounded-xl text-sm border border-metaverse-purple/20"
        >
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-metaverse-purple mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/80 font-medium mb-1">ระบบอันดับแยกตามระดับชั้น</p>
              <ul className="text-white/60 space-y-1">
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