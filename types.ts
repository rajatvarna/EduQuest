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

export type QuestionType = 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'MATCHING' | 'SEQUENCING';

export interface BaseQuestion {
  id: string;
  text: string;
  type: QuestionType;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'MULTIPLE_CHOICE';
  options: string[];
  correctAnswerIndex: number;
}

export interface FillInTheBlankQuestion extends BaseQuestion {
  type: 'FILL_IN_THE_BLANK';
  correctAnswer: string;
}

export interface MatchingItem {
  id: string;
  content: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'MATCHING';
  prompts: MatchingItem[];
  answers: MatchingItem[]; // The correct answer is when prompt.id === answer.id
}

export interface SequencingQuestion extends BaseQuestion {
  type: 'SEQUENCING';
  items: string[]; // This is the correct order. The UI will shuffle them.
}

export type Question = MultipleChoiceQuestion | FillInTheBlankQuestion | MatchingQuestion | SequencingQuestion;


export interface TranscriptItem {
  text: string;
  start: number; // in seconds
}

export interface VideoInteraction {
    timestamp: number;
    question: MultipleChoiceQuestion;
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