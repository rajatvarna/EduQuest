import React, { useState, useCallback, useEffect } from 'react';
import { Course, Lesson, UserStats, User } from './types';
import { initialCourses } from './services/courseService';
import Header from './components/Header';
import CourseSelection from './components/CourseSelection';
import CourseView from './components/CourseView';
import QuizLesson from './components/Lesson';
import ReadingLesson from './components/ReadingLesson';
import VideoLesson from './components/VideoLesson';
import SubscriptionModal from './components/SubscriptionModal';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import LessonCompleteModal from './components/LessonCompleteModal';
import UserProfile from './components/UserProfile';

type View = 'course_selection' | 'course_view' | 'lesson' | 'admin' | 'profile';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    points: 120,
    streak: 3,
    hearts: 5,
  });

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>('course_selection');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lessonCompleteData, setLessonCompleteData] = useState<{ pointsEarned: number } | null>(null);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLogin = () => {
      setIsAuthenticated(true);
      setUser({ id: 'user-1', name: 'Alex Doe', email: 'alex.doe@example.com' });
  }
  const handleLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
  }
  
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
    // Quizzes require hearts if not completed yet
    if (lesson.type === 'QUIZ' && userStats.hearts <= 0 && !completedLessonIds.has(lesson.id)) {
      setIsModalOpen(true);
    } else {
      setActiveLesson(lesson);
      setView('lesson');
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

  const completeLesson = useCallback((lessonId: string) => {
    const lesson = activeCourse?.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    let pointsEarned = 0;
    if (lesson.type === 'QUIZ' && lesson.questions) {
      pointsEarned = lesson.questions.length * 10;
    } else if (lesson.type === 'READING' || lesson.type === 'VIDEO') {
      pointsEarned = 5; // A small reward for completing content
    }
    
    // Only update streak and completed status if it's a new completion
    if (!completedLessonIds.has(lessonId)) {
        setUserStats(prev => ({
            ...prev,
            points: prev.points + pointsEarned,
            streak: prev.streak + 1, 
        }));
        setCompletedLessonIds(prev => new Set(prev).add(lessonId));
    } else {
      // If re-completing, just give points, no streak
      setUserStats(prev => ({
          ...prev,
          points: prev.points + pointsEarned,
      }));
    }
    
    setLessonCompleteData({ pointsEarned });
    setActiveLesson(null);
  }, [activeCourse, completedLessonIds]);

  const handleCloseCompleteModal = () => {
    setLessonCompleteData(null);
    setView('course_view');
  }

  const exitLesson = () => {
    setActiveLesson(null);
    setView('course_view');
  };
  
  const handleCourseCreated = (newCourse: Course) => {
    setCourses(prev => [...prev, newCourse]);
    setView('course_selection');
  }

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

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
        return <CourseView 
            course={activeCourse} 
            onStartLesson={startLesson} 
            userHearts={userStats.hearts} 
            onBack={handleNavigateHome}
            completedLessonIds={completedLessonIds}
        />;
      case 'lesson':
        if (!activeLesson) {
            exitLesson(); // Should not happen
            return null;
        }
        switch(activeLesson.type) {
          case 'QUIZ':
            return <QuizLesson
              lesson={activeLesson}
              userHearts={userStats.hearts}
              onAnswer={handleAnswer}
              onComplete={completeLesson}
              onExit={exitLesson}
              isCompleted={completedLessonIds.has(activeLesson.id)}
            />;
          case 'READING':
            return <ReadingLesson
              lesson={activeLesson}
              onComplete={completeLesson}
              onExit={exitLesson}
            />;
          case 'VIDEO':
            return <VideoLesson
              lesson={activeLesson}
              onComplete={completeLesson}
              onExit={exitLesson}
            />;
          default:
            exitLesson();
            return null;
        }
       case 'admin':
         return <AdminDashboard onCourseCreated={handleCourseCreated} />;
       case 'profile':
         if (!user) {
             handleLogout(); // Should not happen if authenticated, but as fallback
             return null;
         }
         return <UserProfile 
            user={user}
            userStats={userStats}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onNavigateHome={handleNavigateHome}
         />;
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
            onNavigateToAdmin={() => setView('admin')}
            onNavigateHome={handleNavigateHome}
            onNavigateToProfile={() => setView('profile')}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <main className="flex-grow container mx-auto p-4 md:p-8 w-full max-w-4xl">
            {renderContent()}
          </main>
          <SubscriptionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onSubscribe={refillHearts}
          />
          {lessonCompleteData && (
            <LessonCompleteModal 
              isOpen={!!lessonCompleteData}
              onClose={handleCloseCompleteModal}
              pointsEarned={lessonCompleteData.pointsEarned}
              currentStreak={userStats.streak}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
