import { Course } from '../types';

export const initialCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Spanish for Beginners',
    description: 'Learn the fundamentals of Spanish including greetings, numbers, and basic grammar. Perfect for complete beginners!',
    category: 'LANGUAGES',
    difficulty: 'BEGINNER',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Greetings & Basics',
        type: 'QUIZ',
        difficulty: 'BEGINNER',
        estimatedDuration: 10,
        questions: [
          {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            text: 'Which of these means "Hello"?',
            options: ['Adiós', 'Hola', 'Gracias', 'Por favor'],
            correctAnswerIndex: 1,
          },
          {
            id: 'q2',
            type: 'MULTIPLE_CHOICE',
            text: 'How do you say "Thank you"?',
            options: ['De nada', 'Sí', 'Lo siento', 'Gracias'],
            correctAnswerIndex: 3,
          },
          {
            id: 'q-fib-1',
            type: 'FILL_IN_THE_BLANK',
            text: 'You say "good morning" with "buenos ___".',
            correctAnswer: 'días',
          },
          {
            id: 'q-seq-1',
            type: 'SEQUENCING',
            text: 'Put the numbers in order from one to three.',
            items: ['uno', 'dos', 'tres'],
          },
          {
            id: 'q-match-1',
            type: 'MATCHING',
            text: 'Match the English words to their Spanish translations.',
            prompts: [
              { id: 'm1', content: 'Water' },
              { id: 'm2', content: 'Milk' },
              { id: 'm3', content: 'Bread' },
            ],
            answers: [
              { id: 'm1', content: 'Agua' },
              { id: 'm2', content: 'Leche' },
              { id: 'm3', content: 'Pan' },
            ],
          },
        ],
      },
      {
        id: 'lesson-new-1',
        title: 'Understanding "Ser" and "Estar"',
        type: 'READING',
        difficulty: 'INTERMEDIATE',
        estimatedDuration: 5,
        content: `In Spanish, both "ser" and "estar" translate to "to be" in English, but they are used in different contexts and are not interchangeable. Understanding the difference is crucial for speaking Spanish correctly.\n\n**Ser is used for permanent or lasting attributes.** If you're talking about something that is a fundamental characteristic of a person or thing, you use "ser". Think of it with the acronym DOCTOR:\n- **D**escription: "Yo soy alto" (I am tall).\n- **O**ccupation: "Ella es médica" (She is a doctor).\n- **C**haracteristic: "Ellos son inteligentes" (They are intelligent).\n- **T**ime: "Son las dos de la tarde" (It is 2 in the afternoon).\n- **O**rigin: "Somos de México" (We are from Mexico).\n- **R**elationship: "Él es mi hermano" (He is my brother).\n\n**Estar is used for temporary states and locations.** If you are talking about how something is at the moment, or where it is located, you use "estar". Think of it with the acronym PLACE:\n- **P**osition: "El libro está en la mesa" (The book is on the table).\n- **L**ocation: "Estamos en el parque" (We are in the park).\n- **A**ction: "Estoy comiendo" (I am eating - progressive tense).\n- **C**ondition: "Ella está cansada" (She is tired).\n- **E**motion: "Yo estoy feliz" (I am happy).\n\nRemember, a person's location is always described with "estar", even if they live there permanently. "Mi casa está en Madrid" (My house is in Madrid). Mastering "ser" and "estar" takes practice, but these rules are a great starting point!`,
      },
      {
        id: 'lesson-2',
        title: 'Numbers 1-5',
        type: 'QUIZ',
        difficulty: 'BEGINNER',
        estimatedDuration: 4,
        questions: [
          {
            id: 'q4',
            type: 'MULTIPLE_CHOICE',
            text: 'What is "Three" in Spanish?',
            options: ['Uno', 'Dos', 'Tres', 'Cuatro'],
            correctAnswerIndex: 2,
          },
          {
            id: 'q5',
            type: 'MULTIPLE_CHOICE',
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
        difficulty: 'BEGINNER',
        estimatedDuration: 6,
        videoId: '_1sQ2a2c2VE', // A public domain video ID for Spanish conversation
        transcript: [
          { start: 0.8, text: "Hola, buenos días." },
          { start: 3.0, text: "Buenos días. ¿Cómo estás?" },
          { start: 5.2, text: "Muy bien, gracias. ¿Y usted?" },
          { start: 7.5, text: "Bien, gracias." },
          { start: 9.0, text: "¿Cómo se llama usted?" },
          { start: 11.2, text: "Me llamo David. ¿Y usted?" },
          { start: 13.5, text: "Me llamo Mónica." },
          { start: 15.0, text: "Mucho gusto, Mónica." },
          { start: 16.8, text: "Igualmente, David." },
          { start: 18.5, text: "¿De dónde es usted?" },
          { start: 20.2, text: "Soy de los Estados Unidos." },
          { start: 22.5, text: "Ah, ¡qué bien!" }
        ],
        videoInteractions: [
            {
                timestamp: 8,
                question: {
                    id: 'viq-1',
                    type: 'MULTIPLE_CHOICE',
                    text: 'What does "Bien, gracias" mean?',
                    options: ['Hello, thank you', 'Good, thank you', 'My name is, thank you', 'Goodbye, thank you'],
                    correctAnswerIndex: 1,
                }
            },
            {
                timestamp: 17,
                question: {
                    id: 'viq-2',
                    type: 'MULTIPLE_CHOICE',
                    text: 'What is a good response to "Mucho gusto"?',
                    options: ['Adiós', 'Hola', 'Igualmente', 'Gracias'],
                    correctAnswerIndex: 2,
                }
            }
        ]
      }
    ],
  },
  {
    id: 'course-2',
    title: 'French Fundamentals',
    description: 'Master essential French phrases and pronunciation. Start your journey to fluency!',
    category: 'LANGUAGES',
    difficulty: 'BEGINNER',
    lessons: [
        {
            id: 'lesson-3',
            title: 'Basic Phrases',
            type: 'QUIZ',
            difficulty: 'BEGINNER',
            estimatedDuration: 4,
            questions: [
                {
                    id: 'q6',
                    type: 'MULTIPLE_CHOICE',
                    text: 'How do you say "Hello" in French?',
                    options: ['Bonjour', 'Au revoir', 'Merci', 'Oui'],
                    correctAnswerIndex: 0,
                },
                {
                    id: 'q7',
                    type: 'MULTIPLE_CHOICE',
                    text: 'What does "Merci" mean?',
                    options: ['Yes', 'Goodbye', 'Thank you', 'Please'],
                    correctAnswerIndex: 2,
                },
            ],
        },
    ],
  }
];