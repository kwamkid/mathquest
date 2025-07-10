// lib/game/generators/types.ts

import { Question, QuestionType } from '../../../types';
import { LevelConfig } from '../config';

/**
 * Interface สำหรับ Grade Generator แต่ละระดับชั้น
 */
export interface GradeGenerator {
  /**
   * สร้างโจทย์ตาม level และ config
   */
  generateQuestion(level: number, config: LevelConfig): Question;
  
  /**
   * สร้างโจทย์คำปัญหา (Word Problem)
   */
  generateWordProblem(level: number, config: LevelConfig): Question;
  
  /**
   * ดึงประเภทโจทย์ที่ใช้ได้ใน level นี้
   */
  getAvailableQuestionTypes(level: number): QuestionType[];
  
  /**
   * ตรวจสอบว่า level นี้รองรับหรือไม่
   */
  supportsLevel(level: number): boolean;
}

/**
 * ข้อมูลสำหรับสร้างโจทย์
 */
export interface QuestionContext {
  grade: string;
  level: number;
  config: LevelConfig;
  questionType: QuestionType;
  difficulty: number;
}

/**
 * ตัวเลือกสำหรับการสร้างโจทย์
 */
export interface GenerationOptions {
  includeChoices?: boolean;
  maxChoices?: number;
  allowNegative?: boolean;
  forcePositive?: boolean;
  roundToInteger?: boolean;
  includeHints?: boolean;
}

/**
 * ผลลัพธ์การสร้างโจทย์
 */
export interface GenerationResult {
  question: Question;
  metadata?: {
    difficulty: number;
    topic: string;
    timeEstimate?: number; // วินาที
    hints?: string[];
  };
}

/**
 * Abstract base class สำหรับ Generator
 */
export abstract class BaseGenerator implements GradeGenerator {
  protected gradeName: string;
  
  constructor(gradeName: string) {
    this.gradeName = gradeName;
  }
  
  abstract generateQuestion(level: number, config: LevelConfig): Question;
  abstract generateWordProblem(level: number, config: LevelConfig): Question;
  abstract getAvailableQuestionTypes(level: number): QuestionType[];
  
  supportsLevel(level: number): boolean {
    return level >= 1 && level <= 100;
  }
  
  /**
   * Helper method สำหรับสร้าง Question object
   */
  protected createQuestion(
    question: string,
    answer: number,
    type: QuestionType,
    difficulty: number,
    choices?: number[]
  ): Question {
    return {
      id: this.generateId(),
      question,
      answer,
      choices,
      type,
      difficulty
    };
  }
  
  /**
   * สร้าง unique ID
   */
  protected generateId(): string {
    return `${this.gradeName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}