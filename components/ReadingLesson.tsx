import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import { Lesson, Question } from '../types';
import { ArrowLeftIcon } from './icons';

interface InlineQuestionCardProps {
  question: Question;
  userAnswer: number | null;
  isCorrect: boolean | null;
  onSelectAnswer: (optionIndex: number) => void;
  isShaking: boolean;
  isAnswered: boolean;
}

const InlineQuestionCard: React.FC<InlineQuestionCardProps> = ({ question, userAnswer, isCorrect, onSelectAnswer, isShaking, isAnswered }) => {
    const getButtonClass = (index: number) => {
        if (!isAnswered) {
             return 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600';
        }

        if (isCorrect) {
            return index === question.correctAnswerIndex
                ? 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-700 dark:text-green-200 cursor-default'
                : 'bg-slate-100 dark:bg-slate-800 opacity-50 cursor-default';
        }

        // Incorrectly answered
        if (index === userAnswer) { // The incorrect selected answer
            return 'bg-red-100 dark:bg-red-900/50 border-red-500 text-red-700 dark:text-red-200';
        }

        return 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600';
    };

    return (
        <div className={`my-6 p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 not-prose shadow-lg ${isShaking ? 'animate-shake' : ''}`}>
            <p className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">{question.text}</p>
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectAnswer(index)}
                        disabled={isCorrect === true}
                        className={`w-full text-left p-3 rounded-lg border-b-2 transition-all font-semibold ${getButtonClass(index)}`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

interface ReadingLessonProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  onExit: () => void;
}

const ReadingLesson: React.FC<ReadingLessonProps> = ({ lesson, onComplete, onExit }) => {
  const [answers, setAnswers] = useState<Record<string, { selected: number | null, isCorrect: boolean | null }>>({});
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    const question = lesson.inlineQuestions?.find(q => q.id === questionId);
    if (!question || (answers[questionId]?.isCorrect)) return;

    const isCorrect = optionIndex === question.correctAnswerIndex;
    setAnswers(prev => ({ ...prev, [questionId]: { selected: optionIndex, isCorrect } }));

    if (!isCorrect) {
        const newIncorrect = new Set(incorrectAttempts);
        newIncorrect.add(questionId);
        setIncorrectAttempts(newIncorrect);
        setTimeout(() => {
            const resetIncorrect = new Set(incorrectAttempts);
            // This allows re-triggering animation on subsequent wrong clicks
            setIncorrectAttempts(resetIncorrect);
        }, 500);
    }
  };

  const allQuestionsAnsweredCorrectly = useMemo(() => {
    const inlineQuestions = lesson.inlineQuestions || [];
    if (inlineQuestions.length === 0) return true;
    return inlineQuestions.every(q => answers[q.id]?.isCorrect === true);
  }, [answers, lesson.inlineQuestions]);

  const contentParts = useMemo(() => lesson.content?.split(/(\[QUESTION-\d+\])/g) || [lesson.content], [lesson.content]);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center mb-6">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 mr-4">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
      </div>
      
      <div className="flex-grow prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-slate-800/50 rounded-xl p-6 md:p-8 overflow-y-auto mb-24 border border-slate-200 dark:border-slate-800 shadow-inner">
        {contentParts.map((part, index) => {
          const match = /\[QUESTION-(\d+)\]/.exec(part || '');
          if (match) {
            const questionIndex = parseInt(match[1], 10) - 1;
            const question = lesson.inlineQuestions?.[questionIndex];
            if (!question) return <p key={index}>{part}</p>;
            
            return (
              <InlineQuestionCard
                key={question.id}
                question={question}
                userAnswer={answers[question.id]?.selected ?? null}
                isCorrect={answers[question.id]?.isCorrect ?? null}
                onSelectAnswer={(optionIndex) => handleSelectAnswer(question.id, optionIndex)}
                isShaking={incorrectAttempts.has(question.id)}
                isAnswered={!!answers[question.id]}
              />
            );
          }
          return <div key={index} dangerouslySetInnerHTML={{ __html: marked(part || '') }} />;
        })}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t-2 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
            <span className="hidden sm:inline font-semibold text-slate-600 dark:text-slate-300 truncate pr-4">{lesson.title}</span>
            <button
              onClick={() => onComplete(lesson.id)}
              disabled={!allQuestionsAnsweredCorrectly}
              className="w-full sm:w-auto flex-shrink-0 py-3 px-6 text-lg font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
            >
              {allQuestionsAnsweredCorrectly ? 'Complete Lesson' : 'Answer all questions to continue'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingLesson;