export interface UserStats {
  xp: number;
  streak: number;
  hearts: number;
}

export interface LevelInfo {
    level: number;
    xpInLevel: number;
    xpForNextLevel: number;
    progress: number;
    totalXpForNextLevel: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  password?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface TranscriptItem {
  text: string;
  start: number; // in seconds
}

export interface VideoInteraction {
    timestamp: number;
    question: Question;
}

export interface Lesson {
  id:string;
  title: string;
  type: 'QUIZ' | 'READING' | 'VIDEO';
  questions?: Question[];
  content?: string; // For READING type or VIDEO script
  videoId?: string; // For VIDEO type (e.g., YouTube video ID)
  transcript?: TranscriptItem[];
  videoInteractions?: VideoInteraction[];
}

export interface Course {
  id:string;
  title: string;
  lessons: Lesson[];
}
