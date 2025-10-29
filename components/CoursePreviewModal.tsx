import React from 'react';
import { Course, Lesson } from '../types';
import { XMarkIcon, CheckCircleIcon, BookOpenIcon, QuestionMarkCircleIcon, VideoCameraIcon } from './icons';

interface CoursePreviewModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onConfirm: () => void;
  onEdit?: (course: Course) => void;
}

const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({
  isOpen,
  course,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !course) return null;

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'READING':
        return <BookOpenIcon className="w-5 h-5 text-blue-500" />;
      case 'VIDEO':
        return <VideoCameraIcon className="w-5 h-5 text-purple-500" />;
      case 'QUIZ':
        return <QuestionMarkCircleIcon className="w-5 h-5 text-teal-500" />;
      default:
        return null;
    }
  };

  const getLessonTypeBadge = (type: string) => {
    const styles = {
      READING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      VIDEO: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      QUIZ: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    };
    return styles[type as keyof typeof styles] || styles.QUIZ;
  };

  const totalQuestions = course.lessons.reduce(
    (sum, lesson) => sum + (lesson.questions?.length || 0),
    0
  );

  const questionTypes = course.lessons.reduce((acc, lesson) => {
    lesson.questions?.forEach(q => {
      acc[q.type] = (acc[q.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl my-8 transform transition-all animate-jump-in border border-slate-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Course Preview
            </h2>
            <h3 className="text-xl font-semibold text-teal-600 dark:text-teal-400">
              {course.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close preview"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Course Stats */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {course.lessons.length}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Lessons</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {totalQuestions}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {totalQuestions * 10}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total XP</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {Object.keys(questionTypes).length}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Question Types</p>
            </div>
          </div>

          {/* Question Type Breakdown */}
          {Object.keys(questionTypes).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {Object.entries(questionTypes).map(([type, count]) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                >
                  {type.replace(/_/g, ' ')}: {count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Lessons List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Course Structure
          </h4>
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getLessonIcon(lesson.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Lesson {index + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getLessonTypeBadge(lesson.type)}`}>
                        {lesson.type}
                      </span>
                    </div>
                    <h5 className="font-semibold text-slate-800 dark:text-white mb-1">
                      {lesson.title}
                    </h5>
                    {lesson.questions && lesson.questions.length > 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {lesson.questions.length} question{lesson.questions.length !== 1 ? 's' : ''} • {lesson.questions.length * 10} XP
                      </p>
                    )}
                    {lesson.type === 'VIDEO' && lesson.videoId && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Video ID: {lesson.videoId === 'YOUTUBE_VIDEO_ID_HERE' ? '⚠️ Placeholder - needs replacement' : lesson.videoId}
                      </p>
                    )}
                    {lesson.type === 'READING' && lesson.content && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {lesson.content.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all hover:scale-105 shadow-md flex items-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Create Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursePreviewModal;
