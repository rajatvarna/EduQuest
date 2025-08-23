import React from 'react';
import { StarIcon, FlameIcon } from './icons';

interface LessonCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointsEarned: number;
  currentStreak: number;
}

const LessonCompleteModal: React.FC<LessonCompleteModalProps> = ({ isOpen, onClose, pointsEarned, currentStreak }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all animate-jump-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-teal-500 mb-4">Lesson Complete!</h2>
        
        <div className="space-y-4 my-6">
            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Points Earned</span>
                <div className="flex items-center font-bold text-lg text-yellow-500">
                    <StarIcon className="w-6 h-6 mr-1" />
                    <span>+{pointsEarned}</span>
                </div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Daily Streak</span>
                <div className="flex items-center font-bold text-lg text-orange-500">
                    <FlameIcon className="w-6 h-6 mr-1" />
                    <span>{currentStreak}</span>
                </div>
            </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-transform hover:scale-105"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LessonCompleteModal;