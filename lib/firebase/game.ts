// lib/firebase/game.ts
import { doc, updateDoc, setDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './client';
import { LevelScore } from '@/types';

interface GameUpdateData {
  level: number;
  totalScore: number;
  experience: number;
  lastPlayedAt: string;
  levelScores?: Record<string, LevelScore>;
  playStreak?: number;
}

interface GameSessionData {
  userId: string;
  grade: string;
  level: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
}

// Calculate score difference for level high score system
export const calculateScoreDifference = async (
  userId: string,
  level: number,
  newScore: number
): Promise<{ scoreDiff: number; isNewHighScore: boolean; oldHighScore: number }> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { scoreDiff: newScore, isNewHighScore: true, oldHighScore: 0 };
    }

    const userData = userDoc.data();
    const levelScores = userData.levelScores || {};
    const levelKey = level.toString();
    const currentLevelScore = levelScores[levelKey];

    if (!currentLevelScore) {
      // First time playing this level
      return { scoreDiff: newScore, isNewHighScore: true, oldHighScore: 0 };
    }

    const oldHighScore = currentLevelScore.highScore || 0;
    
    if (newScore > oldHighScore) {
      // New high score!
      return { 
        scoreDiff: newScore - oldHighScore, 
        isNewHighScore: true,
        oldHighScore 
      };
    } else {
      // Didn't beat high score
      return { 
        scoreDiff: 0, 
        isNewHighScore: false,
        oldHighScore 
      };
    }
  } catch (error) {
    console.error('Error calculating score difference:', error);
    return { scoreDiff: newScore, isNewHighScore: true, oldHighScore: 0 };
  }
};

// Update user game data with level score tracking
export const updateUserGameData = async (
  userId: string,
  data: GameUpdateData
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user game data:', error);
    throw new Error('ไม่สามารถบันทึกข้อมูลเกมได้');
  }
};

// Save game session
export const saveGameSession = async (
  sessionData: GameSessionData
): Promise<void> => {
  try {
    const sessionRef = doc(collection(db, 'gameSessions'));
    await setDoc(sessionRef, {
      ...sessionData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving game session:', error);
    // ไม่ throw error เพราะไม่อยากให้กระทบ UX
  }
};

// Update play streak
export const updatePlayStreak = async (userId: string): Promise<{ playStreak: number; isFirstToday: boolean }> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { playStreak: 1, isFirstToday: true };
    }

    const userData = userDoc.data();
    const lastPlayed = userData.lastPlayedAt ? new Date(userData.lastPlayedAt) : null;
    const today = new Date();
    
    // Set to start of day for comparison
    today.setHours(0, 0, 0, 0);
    
    if (!lastPlayed) {
      // First time playing
      await updateDoc(doc(db, 'users', userId), {
        playStreak: 1,
        lastPlayedAt: new Date().toISOString()
      });
      return { playStreak: 1, isFirstToday: true };
    }
    
    const lastPlayedDate = new Date(lastPlayed);
    lastPlayedDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - lastPlayedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let newStreak = userData.playStreak || 1;
    let isFirstToday = false;
    
    if (diffDays === 0) {
      // Already played today
      return { playStreak: newStreak, isFirstToday: false };
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak += 1;
      isFirstToday = true;
    } else {
      // Streak broken
      newStreak = 1;
      isFirstToday = true;
    }
    
    await updateDoc(doc(db, 'users', userId), {
      playStreak: newStreak,
      lastPlayedAt: new Date().toISOString()
    });
    
    return { playStreak: newStreak, isFirstToday };
  } catch (error) {
    console.error('Error updating play streak:', error);
    return { playStreak: 1, isFirstToday: false };
  }
};

// Calculate EXP with new system
export interface ExpCalculation {
  baseExp: number;
  levelBonus: number;
  performanceBonus: number;
  dailyBonus: number;
  streakBonus: number;
  repeatPenalty: number;
  totalExp: number;
  breakdown: {
    label: string;
    value: number;
    description: string;
  }[];
}

export const calculateExpGained = (
  score: number,
  totalQuestions: number,
  percentage: number,
  level: number,
  playStreak: number,
  isFirstToday: boolean,
  playCount: number
): ExpCalculation => {
  // 1. Base EXP (10 per correct answer + level bonus)
  const levelBonus = Math.floor(level / 10);
  const baseExp = score * (10 + levelBonus);
  
  // 2. Performance Bonus
  const performanceBonus = 
    percentage === 100 ? 100 :
    percentage >= 95 ? 80 :
    percentage >= 90 ? 60 :
    percentage >= 85 ? 40 :
    percentage >= 80 ? 30 :
    percentage >= 70 ? 20 : 0;
  
  // 3. Daily Bonus (first play of the day)
  const dailyBonus = isFirstToday ? 50 : 0;
  
  // 4. Streak Bonus (max 100)
  const streakBonus = Math.min(playStreak * 10, 100);
  
  // 5. Repeat Penalty (reduce if playing same level too much)
  const repeatPenalty = playCount > 3 ? 0.5 : 1;
  
  // Calculate total
  const totalBeforePenalty = baseExp + performanceBonus + dailyBonus + streakBonus;
  const totalExp = Math.floor(totalBeforePenalty * repeatPenalty);
  
  // Create breakdown for display
  const breakdown = [
    {
      label: 'คะแนนพื้นฐาน',
      value: baseExp,
      description: `${score} ข้อ × ${10 + levelBonus} EXP`
    }
  ];
  
  if (performanceBonus > 0) {
    breakdown.push({
      label: 'โบนัสความสำเร็จ',
      value: performanceBonus,
      description: percentage === 100 ? 'Perfect!' : `${percentage}% ถูกต้อง`
    });
  }
  
  if (dailyBonus > 0) {
    breakdown.push({
      label: 'โบนัสเล่นวันแรก',
      value: dailyBonus,
      description: 'เล่นครั้งแรกของวัน'
    });
  }
  
  if (streakBonus > 0) {
    breakdown.push({
      label: 'โบนัสต่อเนื่อง',
      value: streakBonus,
      description: `${playStreak} วันติดต่อกัน`
    });
  }
  
  if (repeatPenalty < 1) {
    breakdown.push({
      label: 'ลดจากเล่นซ้ำ',
      value: -Math.floor(totalBeforePenalty * 0.5),
      description: `เล่นซ้ำเกิน 3 ครั้ง (-50%)`
    });
  }
  
  return {
    baseExp,
    levelBonus,
    performanceBonus,
    dailyBonus,
    streakBonus,
    repeatPenalty,
    totalExp,
    breakdown
  };
};