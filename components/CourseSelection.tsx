import React from 'react';
import { Course } from '../types';
import { BookOpenIcon } from './icons';

interface CourseSelectionProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

const CourseSelection: React.FC<CourseSelectionProps> = ({ courses, onSelectCourse }) => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">Welcome to EduQuest</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto">Choose a course to start your learning adventure. New skills are just a click away.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => onSelectCourse(course)}
            className="group text-left p-6 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 focus:ring-teal-500 transform hover:scale-[1.03]"
          >
            <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-200 dark:from-teal-900/70 dark:to-cyan-900/70 rounded-lg flex items-center justify-center mr-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <BookOpenIcon className="w-7 h-7 text-teal-600 dark:text-teal-300"/>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{course.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400">{course.lessons.length} Lessons</p>
                </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Dive into the fundamentals and start building your skills today.
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CourseSelection;