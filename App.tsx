
import React, { useState, useCallback } from 'react';
import { Course, Lesson, UserStats } from './types';
import { courseData } from './services/courseService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LessonComponent from './components/Lesson';
import SubscriptionModal from './components/SubscriptionModal';

const App: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    points: 120,
    streak: 3,
    hearts: 5,
  });

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const course: Course = courseData;

  const startLesson = (lesson: Lesson) => {
    if (userStats.hearts > 0) {
      setActiveLesson(lesson);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setUserStats(prev => ({ ...prev, points: prev.points + 10 }));
    } else {
      setUserStats(prev => {
        const newHearts = Math.max(0, prev.hearts - 1);
        if (newHearts === 0) {
          setIsModalOpen(true);
        }
        return { ...prev, hearts: newHearts };
      });
    }
  }, []);

  const completeLesson = useCallback((pointsEarned: number) => {
    setUserStats(prev => ({
      ...prev,
      points: prev.points + pointsEarned,
      streak: prev.streak + 1, // Simplified streak logic
    }));
    setActiveLesson(null);
  }, []);

  const exitLesson = () => {
      setActiveLesson(null);
  }

  const refillHearts = () => {
    setUserStats(prev => ({...prev, hearts: 5}));
    setIsModalOpen(false);
    // In a real app, this would be tied to a subscription purchase
  }

  return (
    <div className="font-sans antialiased text-slate-800 dark:text-slate-200 min-h-screen flex flex-col">
      <Header userStats={userStats} />
      <main className="flex-grow container mx-auto p-4 md:p-8 w-full max-w-4xl">
        {activeLesson ? (
          <LessonComponent
            lesson={activeLesson}
            userHearts={userStats.hearts}
            onAnswer={handleAnswer}
            onComplete={completeLesson}
            onExit={exitLesson}
          />
        ) : (
          <Dashboard course={course} onStartLesson={startLesson} userHearts={userStats.hearts} />
        )}
      </main>
      <SubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubscribe={refillHearts}
      />
    </div>
  );
};

export default App;
