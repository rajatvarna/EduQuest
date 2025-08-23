
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
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all animate-jump-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-red-500 mx-auto mb-4">
            <HeartIcon className="w-20 h-20 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">You ran out of hearts!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Get EduQuest Pro for unlimited hearts, no ads, and to support free education. For now, you can get more hearts for free.
        </p>
        <div className="space-y-3">
          <button 
            onClick={onSubscribe}
            className="w-full py-3 px-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-transform hover:scale-105"
          >
            Get Unlimited Hearts
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 px-4 text-teal-500 font-bold rounded-xl hover:bg-teal-100 dark:hover:bg-slate-700 transition-colors"
          >
            No Thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;