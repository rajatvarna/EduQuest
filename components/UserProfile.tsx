import React, { useState, useEffect, useRef } from 'react';
import { User, UserStats, LevelInfo } from '../types';
import { StarIcon, FlameIcon, HeartIcon, PencilIcon, ArrowLeftOnRectangleIcon, CameraIcon, ArrowLeftIcon, UserCircleIcon } from './icons';
import ActivityHeatmap from './ActivityHeatmap';

interface UserProfileProps {
  user: User;
  userStats: UserStats;
  levelInfo: LevelInfo;
  onUpdateUser: (updatedUser: User) => Promise<void>;
  onLogout: () => void;
  onNavigateHome: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, userStats, levelInfo, onUpdateUser, onLogout, onNavigateHome }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
      setName(user.name);
  }, [user.name]);
  
  // Mock activity data for the heatmap
  const generateMockActivityData = () => {
    const data = [];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        if (Math.random() > 0.3) { // 70% chance of activity on a day
            data.push({
                date: date.toISOString().split('T')[0],
                count: Math.floor(Math.random() * 5) + 1, // 1 to 5 activities
            });
        }
    }
    return data;
  }
  const [activityData] = useState(generateMockActivityData());


  const handleSave = async () => {
    if (isSaving || name.trim() === '' || name.trim() === user.name) return;
    setIsSaving(true);
    await onUpdateUser({ ...user, name: name.trim() });
    setIsSaving(false);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
      setName(user.name);
      setIsEditing(false);
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

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

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center">
            <div className="relative mb-4">
                <div className="w-36 h-36 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-slate-900 shadow-lg">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircleIcon className="w-32 h-32 text-slate-400 dark:text-slate-500"/>
                    )}
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-teal-500"
                    aria-label="Change avatar"
                    title="Change avatar"
                >
                    <CameraIcon className="w-5 h-5"/>
                </button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>
            
            <div className="bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300 text-sm font-bold px-3 py-1 rounded-full mb-4">
                Level {levelInfo.level}
            </div>

            <div className="flex-grow text-center w-full max-w-sm">
                 {isEditing ? (
                    <div className="animate-fade-in w-full space-y-4">
                        <div>
                            <label htmlFor="displayName" className="sr-only">Display Name</label>
                            <input
                                id="displayName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-3xl font-bold text-center bg-slate-100 dark:bg-slate-700/50 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                            />
                        </div>
                        <div className="flex gap-2 justify-center">
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving || name.trim() === '' || name.trim() === user.name} 
                                className="px-4 py-2 w-24 bg-teal-500 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-600 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed flex justify-center items-center transition-colors"
                            >
                                {isSaving ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Save'}
                            </button>
                            <button onClick={handleCancel} disabled={isSaving} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-60 transition-colors">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 justify-center">
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white truncate">{user.name}</h1>
                        <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-teal-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Edit name">
                            <PencilIcon className="w-5 h-5"/>
                        </button>
                    </div>
                )}
                <p className="text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
            </div>
             <div className="w-full max-w-sm mt-6 text-center">
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-500" style={{width: `${levelInfo.progress}%`}}></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
                    {levelInfo.xpInLevel} / {levelInfo.xpForNextLevel} XP to next level
                </p>
            </div>
        </div>

        <div className="mt-10 border-t border-slate-200 dark:border-slate-700 pt-8">
             <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Your Stats</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={<StarIcon className="w-6 h-6 text-yellow-600"/>} label="Total XP" value={userStats.xp} color="bg-yellow-200/50 dark:bg-yellow-500/20" />
                <StatCard icon={<FlameIcon className="w-6 h-6 text-orange-600"/>} label="Current Streak" value={userStats.streak} color="bg-orange-200/50 dark:bg-orange-500/20" />
                <StatCard icon={<HeartIcon className="w-6 h-6 text-red-600"/>} label="Hearts Left" value={userStats.hearts} color="bg-red-200/50 dark:bg-red-500/20" />
             </div>
        </div>
        
        <div className="mt-10 border-t border-slate-200 dark:border-slate-700 pt-8">
             <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Learning Activity</h3>
             <ActivityHeatmap data={activityData}/>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button onClick={onLogout} className="inline-flex items-center justify-center px-6 py-3 bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-semibold rounded-lg shadow-sm hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-slate-500 transition-colors">
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
            Logout
        </button>
      </div>

    </div>
  );
};

export default UserProfile;