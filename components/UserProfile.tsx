import React, { useState, useEffect } from 'react';
import { User, UserStats } from '../types';
import { StarIcon, FlameIcon, HeartIcon, PencilIcon, ArrowLeftOnRectangleIcon, CameraIcon, ArrowLeftIcon, UserCircleIcon } from './icons';

interface UserProfileProps {
  user: User;
  userStats: UserStats;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, userStats, onUpdateUser, onLogout, onNavigateHome }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  
  useEffect(() => {
      setName(user.name);
  }, [user.name]);

  const handleSave = () => {
    onUpdateUser({ ...user, name });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
      setName(user.name);
      setIsEditing(false);
  }

  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string; }> = ({ icon, label, value, color }) => (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-8">
       <div className="relative text-center">
         <button onClick={onNavigateHome} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
             <ArrowLeftIcon className="w-6 h-6"/>
         </button>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Profile & Stats</h2>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-8">
            <div className="relative mb-6 sm:mb-0">
                <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UserCircleIcon className="w-24 h-24 text-slate-400 dark:text-slate-500"/>
                </div>
                <button className="absolute bottom-1 right-1 bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-teal-500">
                    <CameraIcon className="w-5 h-5"/>
                    <span className="sr-only">Change avatar</span>
                </button>
            </div>

            <div className="flex-grow text-center sm:text-left">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-3xl font-bold bg-transparent border-b-2 border-teal-500 focus:outline-none w-full"
                            autoFocus
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-3 justify-center sm:justify-start">
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{user.name}</h1>
                        <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-teal-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <PencilIcon className="w-5 h-5"/>
                        </button>
                    </div>
                )}
                <p className="text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
                {isEditing && (
                    <div className="mt-4 flex gap-2 justify-center sm:justify-start">
                        <button onClick={handleSave} className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-600">Save</button>
                        <button onClick={handleCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-10 border-t border-slate-200 dark:border-slate-700 pt-8">
             <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Your Stats</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={<StarIcon className="w-6 h-6 text-yellow-600"/>} label="Total Points" value={userStats.points} color="bg-yellow-200/50 dark:bg-yellow-500/20" />
                <StatCard icon={<FlameIcon className="w-6 h-6 text-orange-600"/>} label="Current Streak" value={userStats.streak} color="bg-orange-200/50 dark:bg-orange-500/20" />
                <StatCard icon={<HeartIcon className="w-6 h-6 text-red-600"/>} label="Hearts Left" value={userStats.hearts} color="bg-red-200/50 dark:bg-red-500/20" />
             </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button onClick={onLogout} className="inline-flex items-center justify-center px-6 py-3 bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-semibold rounded-lg shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-slate-500 transition-colors">
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
            Logout
        </button>
      </div>

    </div>
  );
};

export default UserProfile;
