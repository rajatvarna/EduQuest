
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
  type: 'QUIZ';
  questions: Question[];
}

export interface Course {
  id:string;
  title: string;
  lessons: Lesson[];
}