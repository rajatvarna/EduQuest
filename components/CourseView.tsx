import React from 'react';
import { Course, Lesson } from '../types';
import { LockClosedIcon, PlayCircleIcon, ArrowLeftIcon } from './icons';

interface CourseViewProps {
  course: Course;
  onStartLesson: (lesson: Lesson) => void;
  userHearts: number;
  onBack: () => void;
}

const CourseView: React.FC<CourseViewProps> = ({ course, onStartLesson, userHearts, onBack }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative text-center">
         <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
             <ArrowLeftIcon className="w-6 h-6"/>
         </button>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{course.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Complete the lessons to master the course!</p>
      </div>
      <div className="relative pl-10">
        {/* Vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

        <ul className="space-y-10">
          {course.lessons.map((lesson, index) => (
            <li key={lesson.id} className="relative">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold border-4 border-slate-50 dark:border-slate-900">
                    {index + 1}
                </div>
                <div className="ml-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{lesson.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Challenge yourself with a new quiz.</p>
                    <button
                        onClick={() => onStartLesson(lesson)}
                        disabled={userHearts === 0}
                        className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {userHearts > 0 ? (
                           <>
                             <PlayCircleIcon className="w-5 h-5 mr-2"/> Start
                           </>
                        ) : (
                           <>
                              <LockClosedIcon className="w-5 h-5 mr-2"/> No Hearts
                           </>
                        )}
                    </button>
                </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseView;
