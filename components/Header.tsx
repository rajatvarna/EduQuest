import React from 'react';
import { UserStats } from '../types';
import { StarIcon, FlameIcon, HeartIcon, UserCircleIcon, WrenchScrewdriverIcon, SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  userStats: UserStats;
  onNavigateToAdmin: () => void;
  onNavigateHome: () => void;
  onNavigateToProfile: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ userStats, onNavigateToAdmin, onNavigateHome, onNavigateToProfile, theme, toggleTheme }) => {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-4xl">
        <button onClick={onNavigateHome} className="focus:outline-none">
            <h1 className="text-xl md:text-2xl font-bold text-teal-500">
            EduQuest
            </h1>
        </button>
        <div className="flex items-center space-x-2 sm:space-x-4">
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
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

          <button onClick={toggleTheme} title="Toggle Theme" className="p-2 rounded-full text-slate-500 hover:text-teal-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-slate-800">
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
          </button>
          <button onClick={onNavigateToAdmin} title="Admin Dashboard" className="p-2 rounded-full text-slate-500 hover:text-teal-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-slate-800">
             <WrenchScrewdriverIcon className="h-6 w-6" />
           </button>
           <button onClick={onNavigateToProfile} title="Profile" className="p-2 rounded-full text-slate-500 hover:text-teal-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-slate-800">
             <UserCircleIcon className="h-7 w-7" />
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
