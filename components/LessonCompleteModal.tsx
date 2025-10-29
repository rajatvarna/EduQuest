import React, { useEffect } from 'react';
import { StarIcon, FlameIcon } from './icons';
import Confetti from './Confetti';
import { useToast } from './ToastContext';
import { getCurrentStreakMilestone } from '../services/achievements';

interface LessonCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  xpEarned: number;
  currentStreak: number;
}

const LessonCompleteModal: React.FC<LessonCompleteModalProps> = ({ isOpen, onClose, xpEarned, currentStreak }) => {
  const { showToast } = useToast();
  const streakMilestone = getCurrentStreakMilestone(currentStreak);

  useEffect(() => {
    if (isOpen && currentStreak > 0) {
      setTimeout(() => {
        showToast(`${currentStreak} day streak!`, 'streak', 3000);
      }, 500);
    }
  }, [isOpen, currentStreak, showToast]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all animate-jump-in relative overflow-hidden border border-slate-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        {isOpen && <Confetti />}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_#2dd4bf_0%,_transparent_40%)] animate-beams opacity-20 dark:opacity-10"></div>
        <div className="relative z-10">
            <h2 className="text-3xl font-bold text-teal-500 mb-4">Lesson Complete!</h2>
            
            <div className="space-y-4 my-6">
                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">XP Gained</span>
                    <div className="flex items-center font-bold text-lg text-yellow-500">
                        <StarIcon className="w-6 h-6 mr-1" />
                        <span>+{xpEarned}</span>
                    </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Daily Streak</span>
                    <div className="flex items-center font-bold text-lg text-orange-500">
                        <FlameIcon className="w-6 h-6 mr-1" />
                        <span>{currentStreak}</span>
                    </div>
                </div>
                {streakMilestone && (
                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600">
                        <div className="text-center">
                            <div className="text-3xl mb-1">{streakMilestone.badge}</div>
                            <div className="font-bold text-orange-800 dark:text-orange-300">{streakMilestone.title}</div>
                            <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                                {streakMilestone.multiplier}x XP Multiplier Active!
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all hover:scale-105 shadow-lg"
            >
              Continue
            </button>
        </div>
      </div>
    </div>
  );
};

export default LessonCompleteModal;