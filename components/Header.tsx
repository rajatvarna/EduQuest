import React from 'react';
import { UserStats } from '../types';
import { StarIcon, FlameIcon, HeartIcon, UserCircleIcon, WrenchScrewdriverIcon } from './icons';

interface HeaderProps {
  userStats: UserStats;
  onLogout: () => void;
  onNavigateToAdmin: () => void;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ userStats, onLogout, onNavigateToAdmin, onNavigateHome }) => {
  return (
    <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-4xl">
        <button onClick={onNavigateHome} className="focus:outline-none">
            <h1 className="text-xl md:text-2xl font-bold text-teal-500">
            EduQuest
            </h1>
        </button>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-1 text-yellow-500 font-bold">
            <StarIcon className="h-6 w-6" />
            <span>{userStats.points}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 text-orange-500 font-bold">
            <FlameIcon className="h-6 w-6" />
            <span>{userStats.streak}</span>
          </div>
          <div className="flex items-center space-x-1 text-red-500 font-bold">
            <HeartIcon className="h-6 w-6" />
            <span>{userStats.hearts}</span>
          </div>
          <button onClick={onNavigateToAdmin} title="Admin Dashboard" className="text-slate-500 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400">
             <WrenchScrewdriverIcon className="h-7 w-7" />
           </button>
           <button onClick={onLogout} title="Logout" className="text-slate-500 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400">
             <UserCircleIcon className="h-8 w-8" />
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
