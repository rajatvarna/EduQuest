import React, { useState, useMemo } from 'react';
import { Course, CourseCategory, LessonDifficulty } from '../types';
import { BookOpenIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from './icons';

interface CourseSelectionProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  completedLessonIds: Set<string>;
}

type CompletionFilter = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';

const CourseSelection: React.FC<CourseSelectionProps> = ({ courses, onSelectCourse, completedLessonIds }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'ALL'>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<LessonDifficulty | 'ALL'>('ALL');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('ALL');

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        course.title.toLowerCase().includes(searchLower) ||
        (course.description?.toLowerCase().includes(searchLower) ?? false);

      // Category filter
      const matchesCategory = selectedCategory === 'ALL' || course.category === selectedCategory;

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'ALL' || course.difficulty === selectedDifficulty;

      // Completion filter
      const completedLessonsCount = course.lessons.filter(lesson => completedLessonIds.has(lesson.id)).length;
      const totalLessons = course.lessons.length;
      const isCompleted = completedLessonsCount === totalLessons && totalLessons > 0;
      const isInProgress = completedLessonsCount > 0 && completedLessonsCount < totalLessons;
      const isNotStarted = completedLessonsCount === 0;

      const matchesCompletion = completionFilter === 'ALL' ||
        (completionFilter === 'COMPLETED' && isCompleted) ||
        (completionFilter === 'IN_PROGRESS' && isInProgress) ||
        (completionFilter === 'NOT_STARTED' && isNotStarted);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesCompletion;
    });
  }, [courses, searchQuery, selectedCategory, selectedDifficulty, completionFilter, completedLessonIds]);

  const hasActiveFilters = searchQuery || selectedCategory !== 'ALL' || selectedDifficulty !== 'ALL' || completionFilter !== 'ALL';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedDifficulty('ALL');
    setCompletionFilter('ALL');
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">Welcome to EduQuest</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto">Choose a course to start your learning adventure. New skills are just a click away.</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title or description..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3 justify-center items-center">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <FunnelIcon className="h-5 w-5" />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CourseCategory | 'ALL')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="PROGRAMMING">Programming</option>
            <option value="SCIENCE">Science</option>
            <option value="LANGUAGES">Languages</option>
            <option value="BUSINESS">Business</option>
            <option value="ARTS">Arts</option>
            <option value="MATH">Math</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as LessonDifficulty | 'ALL')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          {/* Completion Filter */}
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value as CompletionFilter)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">All Courses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No courses found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Try adjusting your search or filters
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCourses.map(course => {
          const completedLessonsCount = course.lessons.filter(lesson => completedLessonIds.has(lesson.id)).length;
          const totalLessonsCount = course.lessons.length;
          const progress = totalLessonsCount > 0 ? (completedLessonsCount / totalLessonsCount) * 100 : 0;

          return (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className="group text-left p-6 bg-white dark:bg-slate-800/80 bg-grid-pattern dark:bg-grid-pattern-dark rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 focus:ring-teal-500 transform hover:scale-[1.03]"
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
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Dive into the fundamentals and start building your skills today.
              </p>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Progress</span>
                    <span className="text-sm font-bold text-teal-500 dark:text-teal-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-teal-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </button>
          )
        })}
        </div>
      )}
    </div>
  );
};

export default CourseSelection;