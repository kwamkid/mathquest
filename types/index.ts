// types/index.ts

import { UserAvatarData } from './avatar';

export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar: string;  // เก็บ basic avatar ID (emoji) สำหรับ backward compatibility
  avatarData?: UserAvatarData;  // ระบบ avatar ใหม่
  school: string;
  grade: Grade;
  level: number;
  experience: number;
  totalScore: number;
  dailyStreak: number;
  lastLoginDate: string;
  registrationCode: string;
  createdAt: string;
  isActive: boolean;
  levelScores?: Record<string, LevelScore>; // เพิ่มฟิลด์นี้
  playStreak?: number; // จำนวนวันที่เล่นต่อเนื่อง
  lastPlayedAt?: string; // วันที่เล่นล่าสุด
  currentTitleBadge?: string;  // ฉายาที่เลือกใช้
  ownedTitleBadges?: string[]; // ฉายาที่มี
  badges?: string[];      // เหรียญตราที่ได้รับ
}

export enum Grade {
  K1 = 'K1',
  K2 = 'K2',
  K3 = 'K3',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
  P5 = 'P5',
  P6 = 'P6',
  M1 = 'M1',
  M2 = 'M2',
  M3 = 'M3',
  M4 = 'M4',
  M5 = 'M5',
  M6 = 'M6',
}

export interface GameSession {
  id: string;
  userId: string;
  grade: Grade;
  level: number;
  questions: Question[];
  answers: Answer[];
  score: number;
  startTime: string;
  endTime?: string;
  status: 'playing' | 'completed' | 'abandoned';
}

export interface Question {
  id: string;
  question: string;
  answer: number;
  choices?: number[];
  type: QuestionType;
  difficulty: number;
}

export enum QuestionType {
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  MULTIPLICATION = 'multiplication',
  DIVISION = 'division',
  MIXED = 'mixed',
  WORD_PROBLEM = 'word_problem',
}

export interface Answer {
  questionId: string;
  userAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface RegistrationCode {
  id: string;
  code: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

export interface Ranking {
  userId: string;
  username: string;
  displayName?: string;
  avatar: string;
  grade: Grade;
  level: number;
  totalScore: number;
  rank: number;
}

export interface DailyScore {
  userId: string;
  date: string; // YYYY-MM-DD
  score: number;
  sessionsCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
}

// เพิ่มใน types/index.ts

// เพิ่ม interface สำหรับเก็บคะแนนแต่ละ level
export interface LevelScore {
  level: number;
  highScore: number;
  lastPlayed: string;
  playCount: number;
}