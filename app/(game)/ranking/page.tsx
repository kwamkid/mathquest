// app/(game)/ranking/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import UserDisplayName from '@/components/user/UserDisplayName';
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
import AppHeader from '@/components/layout/AppHeader';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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
  playStreak?: number; // ✅ เพิ่มบรรทัดนี้

}

const grades = [
  { value: 'ALL' as const, label: { th: 'รวมทุกระดับ', en: 'All grades' }, icon: '🌟' },
  { value: Grade.K1, label: { th: 'อนุบาล 1', en: 'Kindergarten 1' }, icon: '🎈' },
  { value: Grade.K2, label: { th: 'อนุบาล 2', en: 'Kindergarten 2' }, icon: '🎨' },
  { value: Grade.K3, label: { th: 'อนุบาล 3', en: 'Kindergarten 3' }, icon: '🚀' },
  { value: Grade.P1, label: { th: 'ประถม 1', en: 'Grade 1' }, icon: '📚' },
  { value: Grade.P2, label: { th: 'ประถม 2', en: 'Grade 2' }, icon: '✏️' },
  { value: Grade.P3, label: { th: 'ประถม 3', en: 'Grade 3' }, icon: '📖' },
  { value: Grade.P4, label: { th: 'ประถม 4', en: 'Grade 4' }, icon: '🧮' },
  { value: Grade.P5, label: { th: 'ประถม 5', en: 'Grade 5' }, icon: '📐' },
  { value: Grade.P6, label: { th: 'ประถม 6', en: 'Grade 6' }, icon: '🎯' },
  { value: Grade.M1, label: { th: 'มัธยม 1', en: 'Grade 7' }, icon: '🔬' },
  { value: Grade.M2, label: { th: 'มัธยม 2', en: 'Grade 8' }, icon: '📊' },
  { value: Grade.M3, label: { th: 'มัธยม 3', en: 'Grade 9' }, icon: '📈' },
  { value: Grade.M4, label: { th: 'มัธยม 4', en: 'Grade 10' }, icon: '🎓' },
  { value: Grade.M5, label: { th: 'มัธยม 5', en: 'Grade 11' }, icon: '🏆' },
  { value: Grade.M6, label: { th: 'มัธยม 6', en: 'Grade 12' }, icon: '👑' },
];

// Local bilingual UI strings for this page
const STR = {
  th: {
    pageTitle: 'อันดับคะแนน',
    allShort: 'รวม',
    you: '(คุณ)',
    yourRank: 'อันดับคุณ',
    totalScoreTab: 'คะแนนรวม',
    scoreShort: 'คะแนน',
    topExpTab: 'EXP สูงสุด',
    sortedByScore: 'เรียงตามคะแนนรวม',
    sortedByExp: 'เรียงตาม EXP',
    noRankingData: 'ยังไม่มีข้อมูลอันดับ',
    noPlayersAll: 'ยังไม่มีผู้เล่นในระบบ หรือยังไม่มีคะแนน',
    noPlayersGrade: (label: string) => `อาจจะยังไม่มีผู้เล่นใน${label} หรือยังไม่มีคะแนน`,
    youAreRanked: (rank: number, label: string) => `คุณอยู่อันดับที่ #${rank} ใน ${label}`,
    onlyTopShown: (n: string) => `แสดงเฉพาะ ${n} อันดับแรก - เล่นต่อเพื่อขึ้น Top!`,
    systemTitle: 'ระบบอันดับ MathQuest',
    infoAllLabel: 'รวมทุกระดับ:',
    infoAllDesc: 'แสดง Top 50 ของทุกคน',
    infoGradeLabel: 'แยกตามระดับ:',
    infoGradeDesc: 'แสดง Top 30 ของแต่ละระดับชั้น',
    infoScoreLabel: 'คะแนนรวม:',
    infoScoreDesc: 'คะแนนสะสมจากการเล่นเกม',
    infoExpLabel: 'EXP:',
    infoExpDesc: 'ประสบการณ์ที่ใช้แลกรางวัล',
  },
  en: {
    pageTitle: 'Ranking',
    allShort: 'All',
    you: '(you)',
    yourRank: 'Your rank',
    totalScoreTab: 'Total score',
    scoreShort: 'Score',
    topExpTab: 'Top EXP',
    sortedByScore: 'Sorted by total score',
    sortedByExp: 'Sorted by EXP',
    noRankingData: 'No ranking data yet',
    noPlayersAll: 'No players yet, or no scores yet',
    noPlayersGrade: (label: string) => `No players in ${label} yet, or no scores yet`,
    youAreRanked: (rank: number, label: string) => `You are ranked #${rank} in ${label}`,
    onlyTopShown: (n: string) => `Only the top ${n} are shown — keep playing to climb!`,
    systemTitle: 'MathQuest Ranking',
    infoAllLabel: 'All grades:',
    infoAllDesc: 'shows the Top 50 across everyone',
    infoGradeLabel: 'By grade:',
    infoGradeDesc: 'shows the Top 30 for each grade',
    infoScoreLabel: 'Total score:',
    infoScoreDesc: 'points collected from playing games',
    infoExpLabel: 'EXP:',
    infoExpDesc: 'experience you can spend on rewards',
  },
} as const;

export default function RankingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const L = STR[lang];
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
        q = query(
          usersRef,
          where('isActive', '==', true),
          orderBy(rankingType === 'score' ? 'totalScore' : 'experience', 'desc'),
          limit(50)
        );
      } else {
        q = query(
          usersRef,
          where('grade', '==', grade),
          where('isActive', '==', true),
          orderBy(rankingType === 'score' ? 'totalScore' : 'experience', 'desc'),
          limit(30)
        );
      }
      
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
      
      users.sort((a, b) => (a.rank || 0) - (b.rank || 0));
      
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

  const handleGradeChange = (grade: Grade | 'ALL') => {
    setSelectedGrade(grade);
    setShowGradeDropdown(false);
    setUserRank(null);
  };

  const getGradeInfo = (grade: Grade | 'ALL') => {
    const gradeInfo = grades.find(g => g.value === grade);
    if (gradeInfo) {
      return { value: gradeInfo.value, label: gradeInfo.label[lang], icon: gradeInfo.icon };
    }
    return { value: grade, label: String(grade), icon: '📚' };
  };

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

  if (!user) return null;

  const selectedGradeInfo = getGradeInfo(selectedGrade);

  return (
    <div className="min-h-screen bg-metaverse-black flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {user && (
        <AppHeader
          user={user}
          variant="sub"
          title={L.pageTitle}
          titleIcon={<Trophy className="h-4 w-4 text-yellow-400" />}
          backHref="/learn"
        />
      )}

      <div className="relative z-10 flex flex-col p-3 md:p-4 max-w-6xl mx-auto w-full flex-1 overflow-hidden">
        {/* Grade selector + user rank */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center justify-between gap-3 flex-shrink-0"
        >
          {/* Grade Selector */}
          <div className="relative">
            <button
              onClick={() => setShowGradeDropdown(!showGradeDropdown)}
              className="flex items-center gap-1.5 md:gap-2 metaverse-button px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-white font-medium text-sm md:text-base"
            >
              <span className="text-sm md:text-base">{selectedGradeInfo.icon}</span>
              <span className="hidden sm:inline">{selectedGradeInfo.label}</span>
              <span className="sm:hidden">{selectedGrade === 'ALL' ? L.allShort : selectedGrade}</span>
              <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
            </button>

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
                        <span className="flex-1">{grade.label[lang]}</span>
                        {grade.value === 'ALL' && (
                          <Globe className="w-4 h-4 text-metaverse-purple" />
                        )}
                        {grade.value !== 'ALL' && grade.value === user?.grade && (
                          <span className="text-xs text-metaverse-purple font-medium">{L.you}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {userRank && (selectedGrade === user?.grade || selectedGrade === 'ALL') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-dark rounded-xl px-2 md:px-3 py-1.5 border border-metaverse-purple/30"
            >
              <p className="text-xs text-white/60">{L.yourRank}</p>
              <p className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                #{userRank}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Filter Tabs */}
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
              <span className="hidden sm:inline">{L.totalScoreTab}</span>
              <span className="sm:hidden">{L.scoreShort}</span>
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
              <span className="hidden sm:inline">{L.topExpTab}</span>
              <span className="sm:hidden">EXP</span>
            </button>
          </div>
        </div>

        {/* Rankings List */}
        <div className="flex-1 glass-dark rounded-2xl p-3 md:p-4 border border-metaverse-purple/30 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-metaverse-purple" />
              <h2 className="text-sm md:text-base font-bold text-white">
                Top {selectedGrade === 'ALL' ? '50' : '30'} - {selectedGradeInfo.label}
              </h2>
            </div>
            <div className="text-xs text-white/60">
              {rankingType === 'score' ? L.sortedByScore : L.sortedByExp}
            </div>
          </div>

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
                      {/* Rank */}
                      <div className="w-6 md:w-7 text-center flex-shrink-0">
                        {getRankMedal(player.rank || index + 1)}
                      </div>
                      
                      {/* Avatar */}
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
                        <h3 className="font-bold text-base md:text-lg truncate leading-tight">
                          <UserDisplayName 
                            user={{
                              id: player.id,
                              username: player.username,
                              displayName: player.displayName,
                              currentTitleBadge: player.currentTitleBadge,
                              avatar: player.avatar,
                              grade: player.grade as Grade,
                              level: player.level,
                              experience: player.experience,
                              totalScore: player.totalScore,
                              playStreak: player.playStreak || 0,  // ✅ แก้แล้ว
                              lastLoginDate: '',
                              registrationCode: '',
                              createdAt: '',
                              isActive: true,
                              school: ''
                            }}
                            className=""
                            showTitle={true}
                          />
                        </h3>
                        <div className="text-xs md:text-sm text-white/60 leading-none">
                          Level {player.level}
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                        {isCurrentUser && (
                          <span className="text-xs px-1.5 py-0.5 bg-white/25 text-white rounded-full font-bold">
                            ME
                          </span>
                        )}
                        
                        {selectedGrade === 'ALL' && (
                          <span className="text-xs px-1 py-0.5 bg-metaverse-purple/25 text-metaverse-purple rounded font-bold">
                            {player.grade}
                          </span>
                        )}
                      </div>
                      
                      {/* Score/EXP */}
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
                <p className="text-white/40 text-base md:text-lg">{L.noRankingData}</p>
                <p className="text-xs md:text-sm text-white/30 mt-2">
                  {selectedGrade === 'ALL'
                    ? L.noPlayersAll
                    : L.noPlayersGrade(selectedGradeInfo.label)
                  }
                </p>
              </div>
            </div>
          )}

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
                    {L.youAreRanked(userRank, selectedGradeInfo.label)}
                  </p>
                  <p className="text-xs text-white/60">
                    {L.onlyTopShown(selectedGrade === 'ALL' ? '50' : '30')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="hidden lg:block mt-3 glass-dark p-3 rounded-xl text-xs border border-metaverse-purple/20 flex-shrink-0"
        >
          <div className="flex items-start gap-2">
            <Trophy className="w-4 h-4 text-metaverse-purple mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/80 font-medium mb-0.5">{L.systemTitle}</p>
              <ul className="text-white/60 space-y-0.5 text-xs">
                <li>• <strong>{L.infoAllLabel}</strong> {L.infoAllDesc}</li>
                <li>• <strong>{L.infoGradeLabel}</strong> {L.infoGradeDesc}</li>
                <li>• <strong>{L.infoScoreLabel}</strong> {L.infoScoreDesc}</li>
                <li>• <strong>{L.infoExpLabel}</strong> {L.infoExpDesc}</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}