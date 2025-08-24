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
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Choose Your Learning Path</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Select a course to begin your adventure.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => onSelectCourse(course)}
            className="text-left p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 focus:ring-teal-500 transform hover:scale-[1.02]"
          >
            <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center mr-4">
                    <BookOpenIcon className="w-7 h-7 text-teal-500"/>
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