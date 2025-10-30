import React, { useState, useCallback, useEffect } from 'react';
import { Course, Lesson, UserStats, User, LevelInfo, Achievement, DailyQuest } from './types';
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
import DailyQuestsPanel from './components/DailyQuestsPanel';
import QuestBot from './components/QuestBot';
import { ChatBubbleLeftRightIcon } from './components/icons';
import { useToast } from './components/ToastContext';
import { getNewlyUnlockedAchievements, calculateXPWithMultiplier, getCurrentStreakMilestone } from './services/achievements';
import { loadQuestsFromStorage, saveQuestsToStorage, updateQuestProgress, shouldResetQuests, generateDailyQuests } from './services/quests';

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

  // Gamification state
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [perfectScores, setPerfectScores] = useState(0);
  const [questPanelOpen, setQuestPanelOpen] = useState(false);

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

  // Load gamification data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Load achievements
      const storedAchievements = localStorage.getItem(`achievements_${user.id}`);
      if (storedAchievements) {
        setAchievements(JSON.parse(storedAchievements));
      }

      // Load perfect scores count
      const storedPerfectScores = localStorage.getItem(`perfectScores_${user.id}`);
      if (storedPerfectScores) {
        setPerfectScores(parseInt(storedPerfectScores));
      }

      // Load and possibly reset daily quests
      const quests = loadQuestsFromStorage();
      setDailyQuests(quests);
    }
  }, [isAuthenticated, user]);

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

      // Update quest progress for correct answers
      const updatedQuests = updateQuestProgress(dailyQuests, 'ANSWER_QUESTIONS', 1);
      setDailyQuests(updatedQuests);
      saveQuestsToStorage(updatedQuests);
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
  }, [user, userStats, dailyQuests]);

  const completeLesson = useCallback(async (lessonId: string) => {
    const lesson = activeCourse?.lessons.find(l => l.id === lessonId);
    if (!lesson || !user || !userStats) return;

    // Calculate base XP
    let baseXP = 0;
    if (lesson.type === 'QUIZ' && lesson.questions) {
      baseXP = lesson.questions.length * 10;
    } else if (lesson.type === 'READING' || lesson.type === 'VIDEO') {
      baseXP = 15;
    }

    // Apply streak multiplier
    const xpEarned = calculateXPWithMultiplier(baseXP, userStats.streak);

    const wasAlreadyCompleted = completedLessonIds.has(lessonId);

    const { updatedUserStats, updatedCompletedLessonIds } = await api.completeLesson({
        userId: user.id,
        lessonId,
        xpEarned,
        wasAlreadyCompleted
    });

    setUserStats(updatedUserStats);
    setCompletedLessonIds(new Set(updatedCompletedLessonIds));

    // Update daily quests
    if (!wasAlreadyCompleted) {
      let updatedQuests = updateQuestProgress(dailyQuests, 'COMPLETE_LESSONS', 1);
      updatedQuests = updateQuestProgress(updatedQuests, 'EARN_XP', xpEarned);

      // Check for perfect score in quiz
      if (lesson.type === 'QUIZ' && lesson.questions) {
        const allCorrect = lesson.questions.every(q => userAnswers[q.id] === true);
        if (allCorrect) {
          updatedQuests = updateQuestProgress(updatedQuests, 'PERFECT_SCORES', 1);
          setPerfectScores(prev => prev + 1);
          localStorage.setItem(`perfectScores_${user.id}`, (perfectScores + 1).toString());
        }
      }

      setDailyQuests(updatedQuests);
      saveQuestsToStorage(updatedQuests);

      // Check for newly completed quests
      const newlyCompletedQuests = updatedQuests.filter((q, idx) =>
        q.completed && !dailyQuests[idx].completed
      );
      newlyCompletedQuests.forEach(quest => {
        showToast(`Quest Complete: ${quest.title}!`, 'success', 3000);
      });

      // Check for achievements
      const questionTypesAnswered = new Set(
        Object.keys(userAnswers).map(qId => {
          // Find question type from all courses
          for (const course of courses) {
            for (const l of course.lessons) {
              const q = l.questions?.find(question => question.id === qId);
              if (q) return q.type;
            }
          }
          return '';
        }).filter(Boolean)
      );

      const coursesCompleted = courses.filter(course =>
        course.lessons.every(l => updatedCompletedLessonIds.includes(l.id))
      ).length;

      const newAchievements = getNewlyUnlockedAchievements(achievements, {
        lessonsCompleted: updatedCompletedLessonIds.length,
        coursesCompleted,
        streak: updatedUserStats.streak,
        xp: updatedUserStats.xp,
        perfectScores: perfectScores + (lesson.type === 'QUIZ' && lesson.questions?.every(q => userAnswers[q.id] === true) ? 1 : 0),
        questionTypesAnswered,
      });

      if (newAchievements.length > 0) {
        const allAchievements = [...achievements, ...newAchievements];
        setAchievements(allAchievements);
        localStorage.setItem(`achievements_${user.id}`, JSON.stringify(allAchievements));

        // Show achievement notifications
        newAchievements.forEach(achievement => {
          showToast(`🏆 ${achievement.title} unlocked! +${achievement.reward} XP`, 'success', 4000);
        });
      }
    }

    setLessonCompleteData({ xpEarned });
    setActiveLesson(null);
  }, [activeCourse, completedLessonIds, user, userStats, dailyQuests, achievements, userAnswers, courses, perfectScores, showToast]);

  const markLessonAsComplete = useCallback(async (lessonId: string) => {
    const lesson = activeCourse?.lessons.find(l => l.id === lessonId);
    if (!lesson || !user) return;
    
    const wasAlreadyCompleted = completedLessonIds.has(lessonId);
    if (wasAlreadyCompleted) return;

    const { updatedUserStats, updatedCompletedLessonIds } = await api.completeLesson({
        userId: user.id,
        lessonId,
        xpEarned: 0, // No XP for quick-marking
        wasAlreadyCompleted: false
    });

    setUserStats(updatedUserStats);
    setCompletedLessonIds(new Set(updatedCompletedLessonIds));
  }, [activeCourse, completedLessonIds, user]);

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
        return <CourseSelection courses={courses} onSelectCourse={handleSelectCourse} completedLessonIds={completedLessonIds} />;
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
            onMarkAsComplete={markLessonAsComplete}
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
            achievements={achievements}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onNavigateHome={handleNavigateHome}
         />;
      default:
        return <CourseSelection courses={courses} onSelectCourse={handleSelectCourse} completedLessonIds={completedLessonIds} />;
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
            onToggleQuests={() => setQuestPanelOpen(!questPanelOpen)}
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

          <DailyQuestsPanel
            isOpen={questPanelOpen}
            onClose={() => setQuestPanelOpen(false)}
            quests={dailyQuests}
          />

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
