
import React from 'react';
import { UserStats } from '../types';
import { StarIcon, FlameIcon, HeartIcon } from './icons';

interface HeaderProps {
  userStats: UserStats;
}

const Header: React.FC<HeaderProps> = ({ userStats }) => {
  return (
    <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-4xl">
        <h1 className="text-xl md:text-2xl font-bold text-teal-500">
          EduQuest
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-yellow-500 font-bold">
            <StarIcon className="h-6 w-6" />
            <span>{userStats.points}</span>
          </div>
          <div className="flex items-center space-x-1 text-orange-500 font-bold">
            <FlameIcon className="h-6 w-6" />
            <span>{userStats.streak}</span>
          </div>
          <div className="flex items-center space-x-1 text-red-500 font-bold">
            <HeartIcon className="h-6 w-6" />
            <span>{userStats.hearts}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
