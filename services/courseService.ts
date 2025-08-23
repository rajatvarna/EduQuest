import { Course } from '../types';

export const initialCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Spanish for Beginners',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Greetings & Basics',
        type: 'QUIZ',
        questions: [
          {
            id: 'q1',
            text: 'Which of these means "Hello"?',
            options: ['Adiós', 'Hola', 'Gracias', 'Por favor'],
            correctAnswerIndex: 1,
          },
          {
            id: 'q2',
            text: 'How do you say "Thank you"?',
            options: ['De nada', 'Sí', 'Lo siento', 'Gracias'],
            correctAnswerIndex: 3,
          },
          {
            id: 'q3',
            text: 'What is "Water"?',
            options: ['Agua', 'Leche', 'Pan', 'Vino'],
            correctAnswerIndex: 0,
          },
        ],
      },
      {
        id: 'lesson-2',
        title: 'Numbers 1-5',
        type: 'QUIZ',
        questions: [
          {
            id: 'q4',
            text: 'What is "Three" in Spanish?',
            options: ['Uno', 'Dos', 'Tres', 'Cuatro'],
            correctAnswerIndex: 2,
          },
          {
            id: 'q5',
            text: 'Which number is "Cinco"?',
            options: ['One', 'Five', 'Three', 'Two'],
            correctAnswerIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    title: 'French Fundamentals',
    lessons: [
        {
            id: 'lesson-3',
            title: 'Basic Phrases',
            type: 'QUIZ',
            questions: [
                {
                    id: 'q6',
                    text: 'How do you say "Hello" in French?',
                    options: ['Bonjour', 'Au revoir', 'Merci', 'Oui'],
                    correctAnswerIndex: 0,
                },
                {
                    id: 'q7',
                    text: 'What does "Merci" mean?',
                    options: ['Yes', 'Goodbye', 'Thank you', 'Please'],
                    correctAnswerIndex: 2,
                },
            ],
        },
    ],
  }
];
