export interface UserStats {
  xp: number;
  streak: number;
  hearts: number;
  lastActivityDate?: string; // ISO date string for streak calculation
  streakMultiplier?: number; // XP multiplier based on streak milestones
  totalLessonsCompleted?: number;
  totalCoursesCompleted?: number;
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

export type LessonDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Lesson {
  id:string;
  title: string;
  type: 'QUIZ' | 'READING' | 'VIDEO';
  questions?: Question[];
  content?: string; // For READING type or VIDEO script
  videoId?: string; // For VIDEO type (e.g., YouTube video ID)
  transcript?: TranscriptItem[];
  videoInteractions?: VideoInteraction[];
  difficulty?: LessonDifficulty;
  estimatedDuration?: number; // in minutes
}

export type CourseCategory = 'PROGRAMMING' | 'SCIENCE' | 'LANGUAGES' | 'BUSINESS' | 'ARTS' | 'MATH' | 'OTHER';

export interface Course {
  id:string;
  title: string;
  lessons: Lesson[];
  description?: string;
  category?: CourseCategory;
  difficulty?: LessonDifficulty;
  imageUrl?: string;
}

// Achievement System
export type AchievementCondition =
  | 'FIRST_LESSON'
  | 'COURSE_COMPLETE'
  | 'PERFECT_SCORE'
  | 'STREAK_7'
  | 'STREAK_30'
  | 'STREAK_100'
  | 'LESSONS_10'
  | 'LESSONS_50'
  | 'LESSONS_100'
  | 'XP_1000'
  | 'XP_5000'
  | 'ALL_QUESTION_TYPES';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or icon name
  condition: AchievementCondition;
  reward: number; // bonus XP
  unlockedAt?: string; // ISO date string
}

// Daily Quest System
export type QuestType =
  | 'COMPLETE_LESSONS'
  | 'ANSWER_QUESTIONS'
  | 'MAINTAIN_STREAK'
  | 'EARN_XP'
  | 'PERFECT_SCORES';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  target: number; // e.g., 3 lessons, 10 questions
  progress: number;
  reward: number; // bonus XP
  completed: boolean;
  date: string; // ISO date string for the day this quest is active
}

// Streak Milestone
export interface StreakMilestone {
  days: number;
  title: string;
  multiplier: number; // XP multiplier (e.g., 1.2 = 20% bonus)
  badge: string; // emoji
}