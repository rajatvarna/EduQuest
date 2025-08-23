import React, { useState, useCallback } from 'react';
import { Course, Lesson, UserStats } from './types';
import { initialCourses } from './services/courseService';
import Header from './components/Header';
import CourseSelection from './components/CourseSelection';
import CourseView from './components/CourseView';
import LessonComponent from './components/Lesson';
import SubscriptionModal from './components/SubscriptionModal';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';

type View = 'course_selection' | 'course_view' | 'lesson' | 'admin';

const App: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    points: 120,
    streak: 3,
    hearts: 5,
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [view, setView] = useState<View>('course_selection');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);
  
  const handleNavigateHome = () => {
      setActiveCourse(null);
      setActiveLesson(null);
      setView('course_selection');
  }

  const handleSelectCourse = (course: Course) => {
    setActiveCourse(course);
    setView('course_view');
  };

  const startLesson = (lesson: Lesson) => {
    if (userStats.hearts > 0) {
      setActiveLesson(lesson);
      setView('lesson');
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
    setView('course_view');
  }, []);

  const exitLesson = () => {
    setActiveLesson(null);
    setView('course_view');
  };
  
  const handleCourseCreated = (newCourse: Course) => {
    setCourses(prev => [...prev, newCourse]);
    setView('course_selection');
  }

  const refillHearts = () => {
    setUserStats(prev => ({...prev, hearts: 5}));
    setIsModalOpen(false);
  }

  const renderContent = () => {
    switch(view) {
      case 'course_selection':
        return <CourseSelection courses={courses} onSelectCourse={handleSelectCourse} />;
      case 'course_view':
        if (!activeCourse) {
            handleNavigateHome(); // Should not happen, but as a fallback
            return null;
        }
        return <CourseView course={activeCourse} onStartLesson={startLesson} userHearts={userStats.hearts} onBack={handleNavigateHome} />;
      case 'lesson':
        if (!activeLesson) {
            exitLesson(); // Should not happen
            return null;
        }
        return <LessonComponent
          lesson={activeLesson}
          userHearts={userStats.hearts}
          onAnswer={handleAnswer}
          onComplete={completeLesson}
          onExit={exitLesson}
        />;
       case 'admin':
         return <AdminDashboard onCourseCreated={handleCourseCreated} />;
      default:
        return <CourseSelection courses={courses} onSelectCourse={handleSelectCourse} />;
    }
  }

  return (
    <div className="font-sans antialiased text-slate-800 dark:text-slate-200 min-h-screen flex flex-col">
      {!isAuthenticated ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <>
          <Header 
            userStats={userStats} 
            onLogout={handleLogout} 
            onNavigateToAdmin={() => setView('admin')}
            onNavigateHome={handleNavigateHome}
          />
          <main className="flex-grow container mx-auto p-4 md:p-8 w-full max-w-4xl">
            {renderContent()}
          </main>
          <SubscriptionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onSubscribe={refillHearts}
          />
        </>
      )}
    </div>
  );
};

export default App;
