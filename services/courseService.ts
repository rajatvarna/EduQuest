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
        id: 'lesson-new-1',
        title: 'Understanding "Ser" and "Estar"',
        type: 'READING',
        content: `In Spanish, both "ser" and "estar" translate to "to be" in English, but they are used in different contexts and are not interchangeable. Understanding the difference is crucial for speaking Spanish correctly.\n\n**Ser is used for permanent or lasting attributes.** If you're talking about something that is a fundamental characteristic of a person or thing, you use "ser". Think of it with the acronym DOCTOR:\n- **D**escription: "Yo soy alto" (I am tall).\n- **O**ccupation: "Ella es médica" (She is a doctor).\n- **C**haracteristic: "Ellos son inteligentes" (They are intelligent).\n- **T**ime: "Son las dos de la tarde" (It is 2 in the afternoon).\n- **O**rigin: "Somos de México" (We are from Mexico).\n- **R**elationship: "Él es mi hermano" (He is my brother).\n\n**Estar is used for temporary states and locations.** If you are talking about how something is at the moment, or where it is located, you use "estar". Think of it with the acronym PLACE:\n- **P**osition: "El libro está en la mesa" (The book is on the table).\n- **L**ocation: "Estamos en el parque" (We are in the park).\n- **A**ction: "Estoy comiendo" (I am eating - progressive tense).\n- **C**ondition: "Ella está cansada" (She is tired).\n- **E**motion: "Yo estoy feliz" (I am happy).\n\nRemember, a person's location is always described with "estar", even if they live there permanently. "Mi casa está en Madrid" (My house is in Madrid). Mastering "ser" and "estar" takes practice, but these rules are a great starting point!`
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
        id: 'lesson-new-2',
        title: 'Video: Basic Conversation',
        type: 'VIDEO',
        videoId: '_1sQ2a2c2VE' // A public domain video ID for Spanish conversation
      }
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