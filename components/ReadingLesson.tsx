import React from 'react';
import { Lesson } from '../types';
import { ArrowLeftIcon } from './icons';

// FIX: Define the missing 'ReadingLessonProps' interface.
interface ReadingLessonProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  onExit: () => void;
}

const ReadingLesson: React.FC<ReadingLessonProps> = ({ lesson, onComplete, onExit }) => {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center mb-6">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 mr-4">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
      </div>
      
      <div className="flex-grow prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-slate-800/50 rounded-xl p-6 md:p-8 overflow-y-auto mb-24 border border-slate-200 dark:border-slate-800 shadow-lg">
        {lesson.content?.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph.split('\n').map((line, lineIndex) => <React.Fragment key={lineIndex}>{line}<br/></React.Fragment>)}</p>
        ))}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t-2 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl">
            <button
              onClick={() => onComplete(lesson.id)}
              className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Complete Lesson
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingLesson;