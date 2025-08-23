
export interface UserStats {
  points: number;
  streak: number;
  hearts: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'QUIZ' | 'READING' | 'VIDEO';
  questions?: Question[];
  content?: string; // For READING type
  videoId?: string; // For VIDEO type (e.g., YouTube video ID)
}

export interface Course {
  id:string;
  title: string;
  lessons: Lesson[];
}