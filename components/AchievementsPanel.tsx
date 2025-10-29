import React from 'react';
import { Achievement } from '../types';
import { ALL_ACHIEVEMENTS } from '../services/achievements';
import { CheckCircleIcon, LockClosedIcon } from './icons';

interface AchievementsPanelProps {
  unlockedAchievements: Achievement[];
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ unlockedAchievements }) => {
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
          Achievements
        </h3>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {unlockedAchievements.length} / {ALL_ACHIEVEMENTS.length} Unlocked
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-teal-500 to-cyan-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(unlockedAchievements.length / ALL_ACHIEVEMENTS.length) * 100}%` }}
        ></div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ALL_ACHIEVEMENTS.map(achievement => {
          const unlockedAchievement = unlockedAchievements.find(a => a.id === achievement.id);
          const isUnlocked = unlockedIds.has(achievement.id);

          return (
            <div
              key={achievement.id}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${isUnlocked
                  ? 'bg-white dark:bg-slate-800 border-teal-500 dark:border-teal-400 shadow-md hover:shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 opacity-60'
                }
              `}
            >
              {/* Lock/Check Indicator */}
              <div className="absolute top-2 right-2">
                {isUnlocked ? (
                  <CheckCircleIcon className="w-6 h-6 text-teal-500 dark:text-teal-400" />
                ) : (
                  <LockClosedIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                )}
              </div>

              {/* Icon */}
              <div className={`text-4xl mb-2 ${!isUnlocked && 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>

              {/* Title & Description */}
              <h4 className={`font-bold mb-1 ${isUnlocked ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                {achievement.title}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                {achievement.description}
              </p>

              {/* Reward */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  +{achievement.reward} XP
                </span>
                {unlockedAchievement?.unlockedAt && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(unlockedAchievement.unlockedAt)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPanel;
