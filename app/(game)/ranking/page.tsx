// app/(game)/ranking/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import UserDisplayName from '@/components/user/UserDisplayName';
import {
  Trophy,
  Medal,
  Crown,
  Users,
  ChevronDown,
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
  coins: number; // เหรียญสะสมตลอดกาล (lifetimeExp ?? experience)
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
    pageTitle: 'อันดับเหรียญสะสม',
    allShort: 'รวม',
    you: '(คุณ)',
    yourRank: 'อันดับคุณ',
    coinsLabel: 'เหรียญ',
    difficulty: 'ระดับความยาก',
    sortedByCoins: 'เรียงตามเหรียญสะสมตลอดกาล',
    noRankingData: 'ยังไม่มีข้อมูลอันดับ',
    noPlayersAll: 'ยังไม่มีผู้เล่นในระบบ หรือยังไม่มีเหรียญ',
    noPlayersGrade: (label: string) => `อาจจะยังไม่มีผู้เล่นใน${label} หรือยังไม่มีเหรียญ`,
    youAreRanked: (rank: number, label: string) => `คุณอยู่อันดับที่ #${rank} ใน ${label}`,
    onlyTopShown: (n: string) => `แสดงเฉพาะ ${n} อันดับแรก - เล่นต่อเพื่อขึ้น Top!`,
    systemTitle: 'ระบบอันดับ MathQuest',
    infoAllLabel: 'รวมทุกระดับ:',
    infoAllDesc: 'แสดง Top 50 ของทุกคน',
    infoGradeLabel: 'แยกตามระดับ:',
    infoGradeDesc: 'แสดง Top 30 ของแต่ละระดับชั้น',
    infoCoinsLabel: 'เหรียญสะสม:',
    infoCoinsDesc: 'เหรียญทั้งหมดที่เคยได้รับ — เอาเหรียญไปแลกรางวัลแล้ว อันดับไม่ลด',
  },
  en: {
    pageTitle: 'Coin Ranking',
    allShort: 'All',
    you: '(you)',
    yourRank: 'Your rank',
    coinsLabel: 'Coins',
    difficulty: 'Difficulty',
    sortedByCoins: 'Sorted by lifetime coins',
    noRankingData: 'No ranking data yet',
    noPlayersAll: 'No players yet, or no coins yet',
    noPlayersGrade: (label: string) => `No players in ${label} yet, or no coins yet`,
    youAreRanked: (rank: number, label: string) => `You are ranked #${rank} in ${label}`,
    onlyTopShown: (n: string) => `Only the top ${n} are shown — keep playing to climb!`,
    systemTitle: 'MathQuest Ranking',
    infoAllLabel: 'All grades:',
    infoAllDesc: 'shows the Top 50 across everyone',
    infoGradeLabel: 'By grade:',
    infoGradeDesc: 'shows the Top 30 for each grade',
    infoCoinsLabel: 'Lifetime coins:',
    infoCoinsDesc: 'every coin ever earned — spending coins on rewards never lowers your rank',
  },
} as const;

export default function RankingPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const L = STR[lang];
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | 'ALL'>('ALL');
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
  }, [selectedGrade, user]);

  const loadRankings = async (grade: Grade | 'ALL', userId: string) => {
    setLoadingRankings(true);
    try {
      const usersRef = collection(db, 'users');
      const filters =
        grade === 'ALL'
          ? [where('isActive', '==', true)]
          : [where('grade', '==', grade), where('isActive', '==', true)];
      const lim = grade === 'ALL' ? 50 : 30;

      // Dual-query merge: orderBy('lifetimeExp') ไม่เห็นเอกสารที่ยังไม่มี field
      // (user เก่าที่ยังไม่ earn หลังอัปเดต) เลยยิง orderBy('experience') คู่กัน
      // แล้ว merge — พอ field saturate แล้วค่อยถอด query สำรองได้
      const [lifetimeSnap, expSnap] = await Promise.all([
        getDocs(query(usersRef, ...filters, orderBy('lifetimeExp', 'desc'), limit(lim)))
          // index ยังไม่ถูกสร้าง → ใช้ list สำรองไปก่อน (ดู console สำหรับลิงก์สร้าง index)
          .catch((e) => {
            console.error('lifetimeExp ranking query failed (missing index?):', e);
            return null;
          }),
        getDocs(query(usersRef, ...filters, orderBy('experience', 'desc'), limit(lim))),
      ]);

      const byId = new Map<string, RankingUser>();
      for (const snap of [lifetimeSnap, expSnap]) {
        if (!snap) continue;
        snap.docs.forEach((doc) => {
          if (byId.has(doc.id)) return;
          const data = doc.data();
          byId.set(doc.id, {
            id: doc.id,
            username: data.username || 'Unknown',
            displayName: data.displayName,
            avatar: data.avatar || '👤',
            avatarData: data.avatarData,
            currentTitleBadge: data.currentTitleBadge,
            totalScore: data.totalScore || 0,
            level: data.level || 1,
            experience: data.experience || 0,
            coins: data.lifetimeExp ?? data.experience ?? 0,
            grade: data.grade,
          });
        });
      }

      const users = Array.from(byId.values())
        .sort((a, b) => b.coins - a.coins)
        .slice(0, lim)
        .map((u, index) => ({ ...u, rank: index + 1 }));

      let currentUserRank: number | null =
        users.find((u) => u.id === userId)?.rank ?? null;
      const currentUserInList = currentUserRank !== null;

      if (!currentUserInList && (grade === user?.grade || grade === 'ALL') && userId) {
        try {
          const myCoins = user?.lifetimeExp ?? user?.experience ?? 0;
          // ช่วงเปลี่ยนผ่าน user ที่ยังไม่มี lifetimeExp จะไม่ถูกนับว่าอยู่เหนือเรา
          // (อันดับอาจดีเกินจริงเล็กน้อย) — self-heals เมื่อทุกคน earn ครั้งแรก
          const countQuery = query(
            usersRef,
            ...filters,
            where('lifetimeExp', '>', myCoins)
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

        {/* Rankings List */}
        <div className="flex-1 glass-dark rounded-2xl p-3 md:p-4 border border-metaverse-purple/30 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-metaverse-purple" />
              <h2 className="text-sm md:text-base font-bold text-white">
                Top {selectedGrade === 'ALL' ? '50' : '30'} - {selectedGradeInfo.label}
              </h2>
            </div>
            <div className="text-xs text-white/60">{L.sortedByCoins}</div>
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
                          {L.difficulty} {player.level}
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
                      
                      {/* Lifetime coins */}
                      <div className="text-right flex-shrink-0 min-w-0">
                        <p className="text-lg md:text-xl font-black text-white leading-none">
                          {player.coins.toLocaleString()}
                        </p>
                        <p className="text-xs md:text-sm text-white/60 leading-none font-medium">
                          {L.coinsLabel}
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
                <li>• <strong>{L.infoCoinsLabel}</strong> {L.infoCoinsDesc}</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}