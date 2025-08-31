import React from 'react';
import { HeartIcon } from './icons';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all animate-jump-in border border-slate-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-red-500 mx-auto mb-4">
            <HeartIcon className="w-20 h-20 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">You ran out of hearts!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Get EduQuest Pro for unlimited hearts and exclusive features. For now, you can get a free refill to continue learning!
        </p>
        <div className="space-y-3">
          <button 
            onClick={onSubscribe}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all hover:scale-105 shadow-lg"
          >
            Get Free Refill
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 px-4 text-teal-500 font-bold rounded-xl hover:bg-teal-100/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            No Thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
