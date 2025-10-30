import React, { useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon, StarIcon, FlameIcon, HeartIcon, SparklesIcon } from './icons';

export type ToastType = 'success' | 'error' | 'info' | 'xp' | 'streak' | 'hearts';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 dark:bg-green-600 text-white';
      case 'error':
        return 'bg-red-500 dark:bg-red-600 text-white';
      case 'xp':
        return 'bg-purple-500 dark:bg-purple-600 text-white';
      case 'streak':
        return 'bg-orange-500 dark:bg-orange-600 text-white';
      case 'hearts':
        return 'bg-pink-500 dark:bg-pink-600 text-white';
      default:
        return 'bg-blue-500 dark:bg-blue-600 text-white';
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={iconClass} />;
      case 'error':
        return <XMarkIcon className={iconClass} />;
      case 'xp':
        return <StarIcon className={iconClass} />;
      case 'streak':
        return <FlameIcon className={iconClass} />;
      case 'hearts':
        return <HeartIcon className={iconClass} />;
      default:
        return <SparklesIcon className={iconClass} />;
    }
  };

  return (
    <div
      className={`
        ${getToastStyles()}
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        min-w-[280px] max-w-md
        animate-toast-in
        pointer-events-auto
      `}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <p className="font-medium text-sm flex-1">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
