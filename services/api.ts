import { initialCourses } from './courseService';
import { Course, User, UserStats } from '../types';

// --- MOCK DATABASE using localStorage ---
const DB = {
  getItem: <T>(key: string): T | null => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  setItem: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

// --- DATABASE INITIALIZATION ---
// Initialize courses if they don't exist
if (!DB.getItem('courses')) {
  DB.setItem('courses', initialCourses);
}

// Initialize users if they don't exist, adding a default user for social login
if (!DB.getItem('users')) {
  DB.setItem('users', [
    { id: 'user-1', name: 'Alex Doe', email: 'alex.doe@example.com', password: 'password123' },
    { id: 'user-social', name: 'Social User', email: 'social@example.com', password: 'password123' }
  ]);
}
if (!DB.getItem('userStats')) {
    DB.setItem('userStats', {
        'user-1': { xp: 120, streak: 3, hearts: 5 },
        'user-social': { xp: 50, streak: 1, hearts: 5 },
    });
}
if (!DB.getItem('userProgress')) {
    DB.setItem('userProgress', {});
}
if (!DB.getItem('userAnswers')) {
    DB.setItem('userAnswers', {});
}


// --- API SIMULATION ---
const simulateNetwork = (delay = 500) => new Promise(res => setTimeout(res, delay));

const MOCK_JWT_SECRET = 'your-super-secret-jwt-key';

// Mock function to "create" a JWT
const createToken = (payload: object): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  // In a real app, this would be a cryptographic signature
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${MOCK_JWT_SECRET}`);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Mock function to "verify" a JWT
const verifyToken = (token: string): { userId: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    // In a real app, you would also verify the signature
    return payload;
  } catch (e) {
    return null;
  }
};


// --- AUTHENTICATION API ---

export const login = async (email: string, password?: string): Promise<{ user: User; userStats: UserStats; completedLessonIds: string[]; userAnswers: Record<string, boolean>; token: string }> => {
  await simulateNetwork();
  const users = DB.getItem<User[]>('users') || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const token = createToken({ userId: user.id });
  DB.setItem('authToken', token);
  
  const userStats = (DB.getItem<Record<string, UserStats>>('userStats') || {})[user.id];
  const userProgress = (DB.getItem<Record<string, string[]>>('userProgress') || {})[user.id] || [];
  const userAnswers = (DB.getItem<Record<string, Record<string, boolean>>>('userAnswers') || {})[user.id] || {};

  return { user, userStats, completedLessonIds: userProgress, userAnswers, token };
};

export const register = async (credentials: Pick<User, 'name' | 'email' | 'password'>): Promise<{ user: User; userStats: UserStats; token: string }> => {
    await simulateNetwork(1000);
    const users = DB.getItem<User[]>('users') || [];

    if (users.some(u => u.email === credentials.email)) {
        throw new Error('An account with this email already exists.');
    }
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
    };
    
    const newUserStats: UserStats = {
        xp: 0,
        streak: 0,
        hearts: 5,
    };

    users.push(newUser);
    DB.setItem('users', users);
    
    const allStats = DB.getItem<Record<string, UserStats>>('userStats') || {};
    allStats[newUser.id] = newUserStats;
    DB.setItem('userStats', allStats);

    const allAnswers = DB.getItem<Record<string, Record<string, boolean>>>('userAnswers') || {};
    allAnswers[newUser.id] = {};
    DB.setItem('userAnswers', allAnswers);

    const token = createToken({ userId: newUser.id });
    DB.setItem('authToken', token);

    return { user: newUser, userStats: newUserStats, token };
};


export const getMe = async (): Promise<{ user: User; userStats: UserStats; completedLessonIds: string[]; userAnswers: Record<string, boolean> } | null> => {
  await simulateNetwork(200);
  const token = DB.getItem<string>('authToken');
  if (!token) {
    throw new Error('No auth token found');
  }

  const payload = verifyToken(token);
  if (!payload) {
    DB.setItem('authToken', null);
    throw new Error('Invalid token');
  }

  const users = DB.getItem<User[]>('users') || [];
  const user = users.find(u => u.id === payload.userId);

  if (!user) {
    throw new Error('User not found');
  }
  
  const userStats = (DB.getItem<Record<string, UserStats>>('userStats') || {})[user.id];
  const userProgress = (DB.getItem<Record<string, string[]>>('userProgress') || {})[user.id] || [];
  const userAnswers = (DB.getItem<Record<string, Record<string, boolean>>>('userAnswers') || {})[user.id] || {};
  
  return { user, userStats, completedLessonIds: userProgress, userAnswers };
};

export const logout = (): void => {
  DB.setItem('authToken', null);
};

// --- DATA API ---

export const getCourses = async (): Promise<Course[]> => {
  await simulateNetwork();
  return DB.getItem<Course[]>('courses') || [];
};

export const createCourse = async (newCourse: Course): Promise<Course> => {
    await simulateNetwork();
    const courses = DB.getItem<Course[]>('courses') || [];
    courses.push(newCourse);
    DB.setItem('courses', courses);
    return newCourse;
}

export const updateUser = async (updatedUser: User): Promise<User> => {
    await simulateNetwork(300);
    const users = DB.getItem<User[]>('users') || [];
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex === -1) {
        throw new Error("User not found");
    }
    const { password, ...userToSave } = updatedUser; // Don't save password field from update form
    users[userIndex] = { ...users[userIndex], ...userToSave };
    DB.setItem('users', users);
    return users[userIndex];
}

export const recordAnswer = async ({ userId, questionId, isCorrect }: { userId: string; questionId: string; isCorrect: boolean }): Promise<Record<string, boolean>> => {
    await simulateNetwork(100);
    const allAnswers = DB.getItem<Record<string, Record<string, boolean>>>('userAnswers') || {};
    if (!allAnswers[userId]) {
        allAnswers[userId] = {};
    }
    allAnswers[userId][questionId] = isCorrect;
    DB.setItem('userAnswers', allAnswers);
    return allAnswers[userId];
}


export const completeLesson = async (
    { userId, lessonId, xpEarned, wasAlreadyCompleted }: 
    { userId: string; lessonId: string; xpEarned: number; wasAlreadyCompleted: boolean }
): Promise<{ updatedUserStats: UserStats; updatedCompletedLessonIds: string[] }> => {
    await simulateNetwork(300);

    const allStats = DB.getItem<Record<string, UserStats>>('userStats') || {};
    const currentUserStats = allStats[userId];

    const allProgress = DB.getItem<Record<string, string[]>>('userProgress') || {};
    const currentUserProgress = allProgress[userId] || [];
    
    if (!wasAlreadyCompleted) {
        currentUserStats.xp += xpEarned;
        currentUserStats.streak += 1;
        currentUserProgress.push(lessonId);
    } else {
        // Only award a small amount of XP for reviewing
        currentUserStats.xp += Math.floor(xpEarned / 4);
    }

    allStats[userId] = currentUserStats;
    allProgress[userId] = currentUserProgress;
    
    DB.setItem('userStats', allStats);
    DB.setItem('userProgress', allProgress);

    return { updatedUserStats: currentUserStats, updatedCompletedLessonIds: currentUserProgress };
};