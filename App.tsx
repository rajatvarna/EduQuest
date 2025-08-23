import React, { useState, useCallback, useEffect } from 'react';
import { Course, Lesson, UserStats, User } from './types';
import * as api from './services/api';
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
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>('course_selection');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lessonCompleteData, setLessonCompleteData] = useState<{ pointsEarned: number } | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    const checkSession = async () => {
        setIsLoading(true);
        try {
            const data = await api.getMe();
            if (data) {
                setUser(data.user);
                setUserStats(data.userStats);
                setCompletedLessonIds(new Set(data.completedLessonIds));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.log("No active session");
        } finally {
            setIsLoading(false);
        }
    };
    checkSession();
  }, []);
  
  useEffect(() => {
      const fetchCourses = async () => {
          const fetchedCourses = await api.getCourses();
          setCourses(fetchedCourses);
      };
      fetchCourses();
  }, [isAuthenticated]);

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

  const handleLogin = async (credentials: Pick<User, 'email' | 'password'>) => {
      const data = await api.login(credentials.email, credentials.password!);
      setUser(data.user);
      setUserStats(data.userStats);
      setCompletedLessonIds(new Set(data.completedLessonIds));
      setIsAuthenticated(true);
  }

  const handleRegister = async (credentials: Pick<User, 'name' | 'email' | 'password'>) => {
    const data = await api.register(credentials);
    setUser(data.user);
    setUserStats(data.userStats);
    setCompletedLessonIds(new Set());
    setIsAuthenticated(true);
  }
  
  const handleLogout = () => {
      api.logout();
      setIsAuthenticated(false);
      setUser(null);
      setUserStats(null);
      setActiveCourse(null);
      setActiveLesson(null);
      setView('course_selection');
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
    if (userStats && lesson.type === 'QUIZ' && userStats.hearts <= 0 && !completedLessonIds.has(lesson.id)) {
      setIsModalOpen(true);
    } else {
      setActiveLesson(lesson);
      setView('lesson');
    }
  };

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (!userStats) return;
    if (isCorrect) {
      setUserStats(prev => prev ? ({ ...prev, points: prev.points + 10 }) : null);
    } else {
      setUserStats(prev => {
        if (!prev) return null;
        const newHearts = Math.max(0, prev.hearts - 1);
        if (newHearts === 0) {
          setIsModalOpen(true);
        }
        return { ...prev, hearts: newHearts };
      });
    }
  }, [userStats]);

  const completeLesson = useCallback(async (lessonId: string) => {
    const lesson = activeCourse?.lessons.find(l => l.id === lessonId);
    if (!lesson || !user || !userStats) return;

    let pointsEarned = 0;
    if (lesson.type === 'QUIZ' && lesson.questions) {
      pointsEarned = lesson.questions.length * 10;
    } else if (lesson.type === 'READING' || lesson.type === 'VIDEO') {
      pointsEarned = 5;
    }
    
    const wasAlreadyCompleted = completedLessonIds.has(lessonId);
    
    const { updatedUserStats, updatedCompletedLessonIds } = await api.completeLesson({
        userId: user.id,
        lessonId,
        pointsEarned,
        wasAlreadyCompleted
    });

    setUserStats(updatedUserStats);
    setCompletedLessonIds(new Set(updatedCompletedLessonIds));
    
    setLessonCompleteData({ pointsEarned });
    setActiveLesson(null);
  }, [activeCourse, completedLessonIds, user, userStats]);

  const handleCloseCompleteModal = () => {
    setLessonCompleteData(null);
    setView('course_view');
  }

  const exitLesson = () => {
    setActiveLesson(null);
    setView('course_view');
  };
  
  const handleCourseCreated = async (newCourse: Course) => {
    await api.createCourse(newCourse);
    const updatedCourses = await api.getCourses();
    setCourses(updatedCourses);
    setView('course_selection');
  }

  const handleUpdateUser = async (updatedUser: User) => {
    const savedUser = await api.updateUser(updatedUser);
    setUser(savedUser);
  };

  const refillHearts = () => {
    if (!userStats) return;
    setUserStats(prev => prev ? ({...prev, hearts: 5}) : null);
    setIsModalOpen(false);
  }
  
  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
              <div className="w-16 h-16 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
          </div>
      )
  }

  const renderContent = () => {
    switch(view) {
      case 'course_selection':
        return <CourseSelection courses={courses} onSelectCourse={handleSelectCourse} />;
      case 'course_view':
        if (!activeCourse || !userStats) {
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
        if (!activeLesson || !userStats) {
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
         if (!user || !userStats) {
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
        <Auth onLogin={handleLogin} onRegister={handleRegister} />
      ) : userStats ? (
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
      ) : null}
    </div>
  );
};

export default App;
