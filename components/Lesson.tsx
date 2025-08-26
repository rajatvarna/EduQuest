import React, { useState, useMemo } from 'react';
import { Lesson, Question } from '../types';
import { CheckIcon, XMarkIcon, ArrowLeftIcon } from './icons';

interface LessonProps {
  lesson: Lesson;
  userHearts: number;
  onAnswer: (isCorrect: boolean) => void;
  onComplete: (lessonId: string) => void;
  onExit: () => void;
  isCompleted: boolean;
}

const QuizLesson: React.FC<LessonProps> = ({ lesson, userHearts, onAnswer, onComplete, onExit, isCompleted }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const currentQuestion = lesson.questions?.[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswerIndex;

  const progress = useMemo(() => ((currentIndex) / (lesson.questions?.length || 1)) * 100, [currentIndex, lesson.questions?.length]);
  
  if (!currentQuestion) {
      return <div>Loading question...</div>
  }

  const handleSelectAnswer = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerChecked(true);
    // Don't charge hearts for reviewing a completed lesson
    if (!isCorrect && !isCompleted) {
        onAnswer(false);
    } else if (isCorrect) {
        onAnswer(true);
    }
  };

  const handleNext = () => {
    if (lesson.questions && currentIndex < lesson.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      onComplete(lesson.id);
    }
  };

  const getButtonClass = (index: number) => {
    if (!isAnswerChecked) {
      return selectedAnswer === index
        ? 'bg-teal-100 dark:bg-teal-900/50 border-teal-500 ring-2 ring-teal-500/30'
        : 'bg-white dark:bg-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 border-slate-300 dark:border-slate-600';
    }

    if (index === currentQuestion.correctAnswerIndex) {
      return 'bg-green-100 dark:bg-green-900/50 border-green-600 text-green-800 dark:text-green-200';
    }
    if (index === selectedAnswer) {
      return 'bg-red-100 dark:bg-red-900/50 border-red-600 text-red-800 dark:text-red-200';
    }
    return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 opacity-60';
  };
  
  const noHeartsLeft = userHearts === 0 && !isCorrect && isAnswerChecked && !isCompleted;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-4">
         <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 mr-4">
             <ArrowLeftIcon className="w-6 h-6"/>
         </button>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
          <div
            className="bg-teal-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{currentQuestion.text}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={isAnswerChecked}
              className={`p-4 rounded-xl border-b-4 text-lg font-semibold w-full text-left transition-all active:translate-y-0.5 active:border-b-2 ${getButtonClass(index)}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div className={`fixed bottom-0 left-0 right-0 p-4 border-t-2 ${isAnswerChecked ? (isCorrect ? 'border-green-300 dark:border-green-800' : 'border-red-300 dark:border-red-800') : 'border-slate-200 dark:border-slate-800'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm`}>
        <div className="container mx-auto max-w-5xl">
            {isAnswerChecked ? (
                <div className="flex items-center justify-between animate-fade-in">
                    <div className="flex items-center">
                        {isCorrect ? <CheckIcon className="w-8 h-8 mr-2 text-green-600 dark:text-green-400"/> : <XMarkIcon className="w-8 h-8 mr-2 text-red-600 dark:text-red-400"/>}
                        <span className={`text-xl font-bold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{isCorrect ? "Correct!" : "Incorrect!"}</span>
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={noHeartsLeft}
                        className={`px-8 py-3 rounded-lg font-bold text-base transition-transform hover:scale-105 shadow-md ${isCorrect ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'} disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-600`}
                    >
                        {lesson.questions && currentIndex < lesson.questions.length - 1 ? 'Next' : 'Finish'}
                    </button>
                </div>
            ) : (
                 <button
                    onClick={handleCheckAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    Check
                  </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuizLesson;