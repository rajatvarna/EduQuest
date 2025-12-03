import React from 'react';
import { Lesson, QuestionType } from '../types';
import { CheckCircleIcon, XMarkIcon, StarIcon } from './icons';

interface QuizSummaryProps {
  lesson: Lesson;
  userAnswers: Record<string, boolean>;
  xpEarned: number;
  onContinue: () => void;
  onReviewWrong: () => void;
}

interface QuestionStats {
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

const QuizSummary: React.FC<QuizSummaryProps> = ({
  lesson,
  userAnswers,
  xpEarned,
  onContinue,
  onReviewWrong
}) => {
  if (!lesson.questions) return null;

  // Calculate overall stats
  const totalQuestions = lesson.questions.length;
  const correctCount = lesson.questions.filter(q => userAnswers[q.id] === true).length;
  const incorrectCount = lesson.questions.filter(q => userAnswers[q.id] === false).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPerfectScore = correctCount === totalQuestions;

  // Calculate stats by question type
  const statsByType: Record<QuestionType, QuestionStats> = {
    MULTIPLE_CHOICE: { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
    FILL_IN_THE_BLANK: { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
    MATCHING: { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
    SEQUENCING: { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
  };

  lesson.questions.forEach(q => {
    statsByType[q.type].total++;
    if (userAnswers[q.id] === true) {
      statsByType[q.type].correct++;
    } else if (userAnswers[q.id] === false) {
      statsByType[q.type].incorrect++;
    }
  });

  // Calculate accuracy per type
  Object.keys(statsByType).forEach(type => {
    const typeKey = type as QuestionType;
    const stats = statsByType[typeKey];
    if (stats.total > 0) {
      stats.accuracy = Math.round((stats.correct / stats.total) * 100);
    }
  });

  const getTypeLabel = (type: QuestionType): string => {
    const labels: Record<QuestionType, string> = {
      MULTIPLE_CHOICE: 'Multiple Choice',
      FILL_IN_THE_BLANK: 'Fill in the Blank',
      MATCHING: 'Matching',
      SEQUENCING: 'Sequencing',
    };
    return labels[type];
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAccuracyBgColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'bg-green-500';
    if (accuracy >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center relative overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          {isPerfectScore ? (
            <>
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-teal-500 mb-2">Perfect Score!</h2>
              <p className="text-slate-600 dark:text-slate-300">You nailed every question!</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Quiz Complete!</h2>
              <p className="text-slate-600 dark:text-slate-300">Here's how you did</p>
            </>
          )}
        </div>

        {/* Overall Stats */}
        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-white">{totalQuestions}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Total Questions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{correctCount}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Correct</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{incorrectCount}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Incorrect</div>
            </div>
          </div>

          {/* Accuracy Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Accuracy</span>
              <span className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getAccuracyBgColor(accuracy)}`}
                style={{ width: `${accuracy}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* XP Earned */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <StarIcon className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">XP Earned</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">+{xpEarned}</div>
            </div>
          </div>
        </div>

        {/* Breakdown by Question Type */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Performance by Question Type</h3>
          <div className="space-y-3">
            {(Object.keys(statsByType) as QuestionType[]).map(type => {
              const stats = statsByType[type];
              if (stats.total === 0) return null;

              return (
                <div key={type} className="bg-white dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{getTypeLabel(type)}</span>
                    <span className={`font-bold ${getAccuracyColor(stats.accuracy)}`}>{stats.accuracy}%</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span className="text-slate-600 dark:text-slate-400">{stats.correct} correct</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XMarkIcon className="w-4 h-4 text-red-500" />
                      <span className="text-slate-600 dark:text-slate-400">{stats.incorrect} incorrect</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getAccuracyBgColor(stats.accuracy)}`}
                      style={{ width: `${stats.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {incorrectCount > 0 && (
            <button
              onClick={onReviewWrong}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Review Incorrect ({incorrectCount})
            </button>
          )}
          <button
            onClick={onContinue}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all hover:scale-105 shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSummary;
