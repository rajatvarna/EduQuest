import React from 'react';
import { Course, Lesson } from '../types';
import { LockClosedIcon, PlayCircleIcon, ArrowLeftIcon, CheckCircleIcon, ArrowPathIcon, QuestionMarkCircleIcon, DocumentTextIcon, VideoCameraIcon } from './icons';

interface CourseViewProps {
  course: Course;
  onStartLesson: (lesson: Lesson) => void;
  userHearts: number;
  onBack: () => void;
  completedLessonIds: Set<string>;
}

const CourseView: React.FC<CourseViewProps> = ({ course, onStartLesson, userHearts, onBack, completedLessonIds }) => {

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
                  <div className={`absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white dark:border-slate-900 ${isCompleted ? 'bg-green-500' : isLocked ? 'bg-slate-400 dark:bg-slate-600' : 'bg-teal-500'}`}>
                      {isCompleted ? (
                          <CheckCircleIcon className="w-6 h-6 text-white" fill="none" stroke="currentColor"/>
                      ) : isLocked ? (
                          <LockClosedIcon className="w-6 h-6 text-white" />
                      ) : (
                          getTimelineIcon(lesson.type)
                      )}
                  </div>
                  <div className={`ml-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 flex flex-col ${isCompleted ? 'opacity-80' : isLocked ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-1 hover:shadow-xl hover:border-teal-500/40'}`}>
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{lesson.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">{getLessonDescription(lesson.type)}</p>
                      </div>
                      <button
                          onClick={() => onStartLesson(lesson)}
                          disabled={isLocked}
                          className={`mt-6 self-start inline-flex items-center justify-center px-4 py-2 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed ${
                            isCompleted 
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