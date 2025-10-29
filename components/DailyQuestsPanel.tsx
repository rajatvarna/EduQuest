import React from 'react';
import { DailyQuest } from '../types';
import { CheckCircleIcon, StarIcon } from './icons';

interface DailyQuestsPanelProps {
  quests: DailyQuest[];
}

const DailyQuestsPanel: React.FC<DailyQuestsPanelProps> = ({ quests }) => {
  const completedCount = quests.filter(q => q.completed).length;
  const totalRewards = quests.reduce((sum, q) => q.completed ? sum + q.reward : sum, 0);

  const getQuestIcon = (questType: string) => {
    switch (questType) {
      case 'COMPLETE_LESSONS':
        return '📚';
      case 'ANSWER_QUESTIONS':
        return '❓';
      case 'MAINTAIN_STREAK':
        return '🔥';
      case 'EARN_XP':
        return '⭐';
      case 'PERFECT_SCORES':
        return '💯';
      default:
        return '🎯';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Daily Quests
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Complete quests to earn bonus XP!
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {completedCount}/{quests.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            +{totalRewards} XP earned
          </div>
        </div>
      </div>

      {/* Quests List */}
      <div className="space-y-3">
        {quests.map(quest => {
          const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

          return (
            <div
              key={quest.id}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${quest.completed
                  ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 dark:border-teal-400'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0 mt-1">
                  {getQuestIcon(quest.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        {quest.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {quest.description}
                      </p>
                    </div>
                    {quest.completed && (
                      <CheckCircleIcon className="w-6 h-6 text-teal-500 dark:text-teal-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          quest.completed
                            ? 'bg-teal-500 dark:bg-teal-400'
                            : 'bg-gradient-to-r from-teal-500 to-cyan-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Progress Text & Reward */}
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${quest.completed ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {quest.progress} / {quest.target}
                      {quest.completed && ' ✓'}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold">
                      <StarIcon className="w-4 h-4" />
                      <span>+{quest.reward} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All Complete Bonus */}
      {completedCount === quests.length && (
        <div className="mt-4 p-4 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg text-white animate-fade-in">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🎉</span>
            <div className="text-center">
              <div className="font-bold">All Quests Complete!</div>
              <div className="text-sm opacity-90">Come back tomorrow for new challenges</div>
            </div>
            <span className="text-2xl">🎉</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyQuestsPanel;
