import React, { useState, useCallback, useEffect } from 'react';
import { Course, Lesson, UserStats, User, LevelInfo } from './types';
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
import QuestBot from './components/QuestBot';
import { ChatBubbleLeftRightIcon } from './components/icons';

type View = 'course_selection' | 'course_view' | 'lesson' | 'admin' | 'profile';
type Theme = 'light' | 'dark';

const XP_PER_LEVEL = 100;

const calculateLevelInfo = (xp: number): LevelInfo => {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const xpForCurrentLevel = (level - 1) * XP_PER_LEVEL;
    const xpForNextLevel = level * XP_PER_LEVEL;
    const xpInLevel = xp - xpForCurrentLevel;
    return {
        level,
        xpInLevel,
        xpForNextLevel: XP_PER_LEVEL,
        progress: (xpInLevel / XP_PER_LEVEL) * 100,
        totalXpForNextLevel: xpForNextLevel,
    };
};


const App: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<View>('course_selection');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lessonCompleteData, setLessonCompleteData] = useState<{ xpEarned: number } | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

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
                setUserAnswers(data.userAnswers);
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

  useEffect(() => {
      if (userStats) {
          setLevelInfo(calculateLevelInfo(userStats.xp));
      }
  }, [userStats]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLogin = async (credentials: Pick<User, 'email' | 'password'>) => {
      const data = await api.login(credentials.email, credentials.password!);
      setUser(data.user);
      setUserStats(data.userStats);
      setCompletedLessonIds(new Set(data.completedLessonIds));
      setUserAnswers(data.userAnswers);
      setIsAuthenticated(true);
  }

  const handleRegister = async (credentials: Pick<User, 'name' | 'email' | 'password'>) => {
    const data = await api.register(credentials);
    setUser(data.user);
    setUserStats(data.userStats);
    setCompletedLessonIds(new Set());
    setUserAnswers({});
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

  const handleAnswer = useCallback(async (questionId: string, isCorrect: boolean) => {
    if (!userStats || !user) return;
    
    // Record the answer
    const updatedAnswers = await api.recordAnswer({ userId: user.id, questionId, isCorrect });
    setUserAnswers(updatedAnswers);

    if (isCorrect) {
      setUserStats(prev => prev ? ({ ...prev, xp: prev.xp + 10 }) : null);
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
  }, [user, userStats]);

  const completeLesson = useCallback(async (lessonId: string) => {
    const lesson = activeCourse?.lessons.find(l => l.id === lessonId);
    if (!lesson || !user || !userStats) return;

    let xpEarned = 0;
    if (lesson.type === 'QUIZ' && lesson.questions) {
      xpEarned = lesson.questions.length * 10;
    } else if (lesson.type === 'READING' || lesson.type === 'VIDEO') {
      xpEarned = 15;
    }
    
    const wasAlreadyCompleted = completedLessonIds.has(lessonId);
    
    const { updatedUserStats, updatedCompletedLessonIds } = await api.completeLesson({
        userId: user.id,
        lessonId,
        xpEarned,
        wasAlreadyCompleted
    });

    setUserStats(updatedUserStats);
    setCompletedLessonIds(new Set(updatedCompletedLessonIds));
    
    setLessonCompleteData({ xpEarned });
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
  
  const handleUpdateCourse = (course: Course) => {
    setActiveCourse(course);
  };

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
          <div className="min-h-screen flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
          </div>
      )
  }

  const renderContent = () => {
    switch(view) {
      case 'course_selection':
        return <CourseSelection courses={courses} onSelectCourse={handleSelectCourse} />;
      case 'course_view':
        if (!activeCourse || !userStats || !user) {
            handleNavigateHome(); // Should not happen, but as a fallback
            return null;
        }
        return <CourseView 
            course={activeCourse} 
            user={user}
            onStartLesson={startLesson} 
            userHearts={userStats.hearts} 
            onBack={handleNavigateHome}
            completedLessonIds={completedLessonIds}
            userAnswers={userAnswers}
            onUpdateCourse={handleUpdateCourse}
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
         if (!user || !userStats || !levelInfo) {
             handleLogout(); // Should not happen if authenticated, but as fallback
             return null;
         }
         return <UserProfile 
            user={user}
            userStats={userStats}
            levelInfo={levelInfo}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onNavigateHome={handleNavigateHome}
         />;
      default:
        return <CourseSelection courses={courses} onSelectCourse={handleSelectCourse} />;
    }
  }

  return (
    <div className="antialiased text-slate-800 dark:text-slate-200 min-h-screen flex flex-col">
      {!isAuthenticated ? (
        <Auth onLogin={handleLogin} onRegister={handleRegister} />
      ) : userStats && levelInfo ? (
        <>
          <Header 
            userStats={userStats} 
            levelInfo={levelInfo}
            onNavigateToAdmin={() => setView('admin')}
            onNavigateHome={handleNavigateHome}
            onNavigateToProfile={() => setView('profile')}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <main className="flex-grow container mx-auto p-4 md:p-8 w-full max-w-5xl">
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
              xpEarned={lessonCompleteData.xpEarned}
              currentStreak={userStats.streak}
            />
          )}

          <QuestBot 
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
            activeLesson={activeLesson}
          />

          <button
            onClick={() => setIsChatbotOpen(true)}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-4 rounded-full shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 focus:ring-cyan-500"
            aria-label="Ask QuestBot"
            title="Ask QuestBot"
          >
            <ChatBubbleLeftRightIcon className="w-8 h-8"/>
          </button>
        </>
      ) : null}
    </div>
  );
};

export default App;