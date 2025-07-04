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