
import { Course } from '../types';

export const courseData: Course = {
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
    {
      id: 'lesson-3',
      title: 'Common Animals',
      type: 'QUIZ',
      questions: [
        {
          id: 'q6',
          text: 'The animal "el gato" is a...',
          options: ['Dog', 'Bird', 'Fish', 'Cat'],
          correctAnswerIndex: 3,
        },
        {
          id: 'q7',
          text: 'How do you say "Dog"?',
          options: ['El perro', 'El pájaro', 'El pez', 'El caballo'],
          correctAnswerIndex: 0,
        },
        {
            id: 'q8',
            text: 'Which animal is "el caballo"?',
            options: ['The bird', 'The fish', 'The horse', 'The dog'],
            correctAnswerIndex: 2,
        }
      ],
    },
     {
      id: 'lesson-4',
      title: 'Food Items',
      type: 'QUIZ',
      questions: [
        {
          id: 'q9',
          text: 'What is "Bread"?',
          options: ['Queso', 'Manzana', 'Pan', 'Pollo'],
          correctAnswerIndex: 2,
        },
        {
          id: 'q10',
          text: '"Manzana" is the word for which fruit?',
          options: ['Banana', 'Apple', 'Orange', 'Grape'],
          correctAnswerIndex: 1,
        },
      ],
    },
  ],
};
