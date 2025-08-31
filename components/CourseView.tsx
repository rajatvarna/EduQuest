import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Lesson, Question, User } from '../types';
import { LockClosedIcon, PlayCircleIcon, ArrowLeftIcon, CheckCircleIcon, ArrowPathIcon, QuestionMarkCircleIcon, DocumentTextIcon, VideoCameraIcon, SparklesIcon } from './icons';

interface CourseViewProps {
  course: Course;
  user: User;
  onStartLesson: (lesson: Lesson) => void;
  onUpdateCourse: (course: Course) => void;
  userHearts: number;
  onBack: () => void;
  completedLessonIds: Set<string>;
  userAnswers: Record<string, boolean>;
}

const CourseView: React.FC<CourseViewProps> = ({ course, user, onStartLesson, onUpdateCourse, userHearts, onBack, completedLessonIds, userAnswers }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const incorrectAnswers = useMemo(() => {
    const incorrect: Question[] = [];
    course.lessons.forEach(lesson => {
      if (lesson.type === 'QUIZ' && lesson.questions) {
        lesson.questions.forEach(q => {
          if (userAnswers[q.id] === false) {
            incorrect.push(q);
          }
        });
      }
    });
    return incorrect;
  }, [course.lessons, userAnswers]);
  
  const handleGenerateReviewLesson = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A concise title for the review lesson, like 'Personalized Review: [Topic]'." },
          type: { type: Type.STRING, enum: ['QUIZ'] },
          content: { type: Type.STRING, description: "A clear, well-formatted explanation of the core concept the student is struggling with. Use markdown for formatting." },
          questions: {
            type: Type.ARRAY,
            description: "An array of 2 new, distinct multiple-choice questions to test the user's understanding of the provided explanation.",
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 option strings." },
                correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array." },
              },
              required: ['text', 'options', 'correctAnswerIndex'],
            },
          },
        },
        required: ['title', 'type', 'content', 'questions'],
      };

      const prompt = `You are an expert tutor. A student has answered the following questions incorrectly. Your task is to create a personalized review lesson in JSON format.

1.  Analyze the incorrectly answered questions to identify the common underlying topic the student is struggling with.
2.  Write a clear, concise explanation of this topic. This will be the 'content' of the lesson. Use markdown for clarity (e.g., headings, bold text, lists).
3.  Create 2 new, distinct multiple-choice questions to test their understanding of your explanation. These will be the 'questions'.
4.  Provide a 'title' for this review lesson, like "Personalized Review: [Topic Name]".
5.  The 'type' of the lesson must be 'QUIZ'.

Incorrect questions:
---
${JSON.stringify(incorrectAnswers, null, 2)}
---

Provide your output as a single, valid JSON object matching the schema.`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const jsonResponse = result.text;
      const parsedLesson = JSON.parse(jsonResponse);
      
      const newLesson: Lesson = {
          id: `lesson-review-${Date.now()}`,
          title: parsedLesson.title,
          type: 'QUIZ',
          content: parsedLesson.content,
          questions: parsedLesson.questions.map((q: Question, qIndex: number) => ({
              ...q,
              id: `q-review-${Date.now()}-${qIndex}`
          }))
      };

      const updatedCourse = {
          ...course,
          lessons: [...course.lessons, newLesson]
      };
      onUpdateCourse(updatedCourse);

    } catch (e) {
      console.error(e);
      setGenerationError("Sorry, I couldn't generate a review lesson right now. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };


  const getTimelineIcon = (lessonType: Lesson['type']) => {
    switch (lessonType) {
      case 'QUIZ':
        return <QuestionMarkCircleIcon className="w-6 h-6 text-white" />;
      case 'READING':
        return <DocumentTextIcon className="w-6 h-6 text-white" />;
      case 'VIDEO':
        return <VideoCameraIcon className="w-6 h-6 text-white" />;
      default:
        return null;
    }
  };
  
  const getLessonDescription = (lessonType: Lesson['type']) => {
      switch (lessonType) {
          case 'QUIZ':
            return 'Challenge yourself with a new quiz.';
          case 'READING':
            return 'Read through this essential material.';
          case 'VIDEO':
            return 'Watch this short, informative video.';
          default:
            return '';
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative text-center">
         <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
             <ArrowLeftIcon className="w-6 h-6"/>
         </button>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{course.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Complete the lessons to master the course!</p>
      </div>

      {incorrectAnswers.length >= 2 && (
        <div className="bg-teal-500/10 dark:bg-teal-900/30 border border-teal-500/20 rounded-xl p-4 text-center">
          <h4 className="font-semibold text-teal-800 dark:text-teal-200">Struggling with a few topics?</h4>
          <p className="text-sm text-teal-700 dark:text-teal-300 mt-1 mb-3">Let our AI create a personalized review lesson just for you.</p>
          <button 
            onClick={handleGenerateReviewLesson}
            disabled={isGenerating}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg shadow-md hover:shadow-lg transition-all disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
               <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Generate Review Lesson
               </>
            )}
          </button>
          {generationError && <p className="text-red-500 text-xs mt-2">{generationError}</p>}
        </div>
      )}

      <div className="relative pl-10">
        {/* Vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-300 dark:border-slate-700"></div>

        <ul className="space-y-10">
          {course.lessons.map((lesson) => {
            const isCompleted = completedLessonIds.has(lesson.id);
            const isQuiz = lesson.type === 'QUIZ';
            const isLocked = isQuiz && userHearts === 0 && !isCompleted;

            return (
              <li key={lesson.id} className="relative">
                  <div className={`absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white dark:border-slate-900 ${
                    lesson.title.toLowerCase().includes('review') ? 'bg-purple-500' :
                    isCompleted ? 'bg-green-500' : 
                    isLocked ? 'bg-slate-400 dark:bg-slate-600' : 'bg-teal-500'
                  }`}>
                      {lesson.title.toLowerCase().includes('review') ? (
                          <SparklesIcon className="w-6 h-6 text-white" />
                      ) : isCompleted ? (
                          <CheckCircleIcon className="w-6 h-6 text-white" fill="none" stroke="currentColor"/>
                      ) : isLocked ? (
                          <LockClosedIcon className="w-6 h-6 text-white" />
                      ) : (
                          getTimelineIcon(lesson.type)
                      )}
                  </div>
                  <div className={`ml-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg transition-all duration-300 border ${
                    lesson.title.toLowerCase().includes('review') ? 'border-purple-500/40' : 'border-slate-200 dark:border-slate-700'
                  } flex flex-col ${isCompleted ? 'opacity-80' : isLocked ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-1 hover:shadow-xl hover:border-teal-500/40'}`}>
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{lesson.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">{
                           lesson.title.toLowerCase().includes('review') ? 'A special lesson to help you improve.' : getLessonDescription(lesson.type)}</p>
                      </div>
                      <button
                          onClick={() => onStartLesson(lesson)}
                          disabled={isLocked}
                          className={`mt-6 self-start inline-flex items-center justify-center px-4 py-2 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed ${
                            lesson.title.toLowerCase().includes('review') && !isLocked
                            ? 'text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-md hover:shadow-lg focus:ring-indigo-500'
                            : isCompleted 
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus:ring-slate-500'
                            : isLocked
                            ? 'bg-slate-300 dark:bg-slate-600 text-slate-500'
                            : 'text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-md hover:shadow-lg focus:ring-cyan-500'
                          }`}
                      >
                          {isCompleted ? (
                             <>
                               <ArrowPathIcon className="w-5 h-5 mr-2"/> Review
                             </>
                          ) : isLocked ? (
                             <>
                                <LockClosedIcon className="w-5 h-5 mr-2"/> No Hearts
                             </>
                          ) : (
                             <>
                               <PlayCircleIcon className="w-5 h-5 mr-2"/> Start
                             </>
                          )}
                      </button>
                  </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  );
};

export default CourseView;