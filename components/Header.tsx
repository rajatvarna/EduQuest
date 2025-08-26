import React from 'react';
import { UserStats } from '../types';
import { StarIcon, FlameIcon, HeartIcon, UserCircleIcon, WrenchScrewdriverIcon, SunIcon, MoonIcon, EduQuestLogo } from './icons';

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
        <button onClick={onNavigateHome} className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md" aria-label="Go to homepage">
            <EduQuestLogo className="h-8 w-auto text-teal-500"/>
            <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">EduQuest</span>
        </button>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-100 dark:bg-yellow-500/20 px-3 py-1 rounded-full text-sm">
            <StarIcon className="h-5 w-5" />
            <span>{userStats.points}</span>
          </div>
          <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 font-bold bg-orange-100 dark:bg-orange-500/20 px-3 py-1 rounded-full text-sm">
            <FlameIcon className="h-5 w-5" />
            <span>{userStats.streak}</span>
          </div>
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-500/20 px-3 py-1 rounded-full text-sm">
            <HeartIcon className="h-5 w-5" />
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