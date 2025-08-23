
import React, { useState, useMemo } from 'react';
import { Lesson, Question } from '../types';
import { CheckIcon, XMarkIcon, ArrowLeftIcon } from './icons';

interface LessonProps {
  lesson: Lesson;
  userHearts: number;
  onAnswer: (isCorrect: boolean) => void;
  onComplete: (pointsEarned: number) => void;
  onExit: () => void;
}

const LessonComponent: React.FC<LessonProps> = ({ lesson, userHearts, onAnswer, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const currentQuestion = lesson.questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswerIndex;

  const progress = useMemo(() => ((currentIndex) / lesson.questions.length) * 100, [currentIndex, lesson.questions.length]);

  const handleSelectAnswer = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerChecked(true);
    onAnswer(isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < lesson.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      onComplete(lesson.questions.length * 10); // 10 points per question
    }
  };

  const getButtonClass = (index: number) => {
    if (!isAnswerChecked) {
      return selectedAnswer === index
        ? 'bg-teal-200 dark:bg-teal-800 border-teal-500'
        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600';
    }

    if (index === currentQuestion.correctAnswerIndex) {
      return 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200';
    }
    if (index === selectedAnswer) {
      return 'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200';
    }
    return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 opacity-50';
  };
  
  const noHeartsLeft = userHearts === 0 && !isCorrect && isAnswerChecked;

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
              className={`p-4 rounded-xl border-2 text-lg font-semibold w-full text-left transition-all ${getButtonClass(index)}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {isAnswerChecked && (
         <div className={`fixed bottom-0 left-0 right-0 p-4 text-white text-center font-bold ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
            <div className="container mx-auto max-w-4xl flex items-center justify-between">
              <div className="flex items-center">
                {isCorrect ? <CheckIcon className="w-8 h-8 mr-2"/> : <XMarkIcon className="w-8 h-8 mr-2"/>}
                <span className="text-xl">{isCorrect ? "Correct!" : "Incorrect!"}</span>
              </div>
              <button
                onClick={handleNext}
                disabled={noHeartsLeft}
                className={`px-8 py-3 rounded-lg font-bold text-base transition ${isCorrect ? 'bg-white text-green-500 hover:bg-green-100' : 'bg-white text-red-500 hover:bg-red-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {currentIndex < lesson.questions.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
          </div>
      )}

      {!isAnswerChecked && (
          <div className="p-4 border-t-2 border-slate-200 dark:border-slate-700">
             <button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
                className="w-full py-4 text-xl font-bold text-white bg-teal-500 rounded-xl hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                Check
              </button>
          </div>
      )}

    </div>
  );
};

export default LessonComponent;
