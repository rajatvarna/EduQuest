import { Achievement, AchievementCondition, StreakMilestone } from '../types';

// Define all available achievements
export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    condition: 'FIRST_LESSON',
    reward: 50,
  },
  {
    id: 'course-complete',
    title: 'Course Master',
    description: 'Complete an entire course',
    icon: '🏆',
    condition: 'COURSE_COMPLETE',
    reward: 200,
  },
  {
    id: 'perfect-score',
    title: 'Perfectionist',
    description: 'Get all questions correct in a quiz',
    icon: '💯',
    condition: 'PERFECT_SCORE',
    reward: 100,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    condition: 'STREAK_7',
    reward: 150,
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: '⚡',
    condition: 'STREAK_30',
    reward: 500,
  },
  {
    id: 'streak-100',
    title: 'Century Scholar',
    description: 'Maintain a 100-day learning streak',
    icon: '👑',
    condition: 'STREAK_100',
    reward: 2000,
  },
  {
    id: 'lessons-10',
    title: 'Knowledge Seeker',
    description: 'Complete 10 lessons',
    icon: '📚',
    condition: 'LESSONS_10',
    reward: 100,
  },
  {
    id: 'lessons-50',
    title: 'Dedicated Learner',
    description: 'Complete 50 lessons',
    icon: '🎓',
    condition: 'LESSONS_50',
    reward: 500,
  },
  {
    id: 'lessons-100',
    title: 'Knowledge Master',
    description: 'Complete 100 lessons',
    icon: '🌟',
    condition: 'LESSONS_100',
    reward: 1000,
  },
  {
    id: 'xp-1000',
    title: 'Rising Star',
    description: 'Earn 1,000 XP',
    icon: '⭐',
    condition: 'XP_1000',
    reward: 100,
  },
  {
    id: 'xp-5000',
    title: 'XP Legend',
    description: 'Earn 5,000 XP',
    icon: '💫',
    condition: 'XP_5000',
    reward: 500,
  },
  {
    id: 'all-question-types',
    title: 'Question Master',
    description: 'Answer all 4 types of questions correctly',
    icon: '🎪',
    condition: 'ALL_QUESTION_TYPES',
    reward: 200,
  },
];

// Streak milestones with XP multipliers
export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7, title: 'Week Warrior', multiplier: 1.2, badge: '🔥' },
  { days: 14, title: '2-Week Champion', multiplier: 1.3, badge: '🔥🔥' },
  { days: 30, title: 'Monthly Master', multiplier: 1.5, badge: '⚡' },
  { days: 60, title: '2-Month Legend', multiplier: 1.7, badge: '⚡⚡' },
  { days: 100, title: 'Century Scholar', multiplier: 2.0, badge: '👑' },
];

// Check if an achievement condition is met
export const checkAchievementCondition = (
  condition: AchievementCondition,
  data: {
    lessonsCompleted: number;
    coursesCompleted: number;
    streak: number;
    xp: number;
    perfectScores: number;
    questionTypesAnswered: Set<string>;
  }
): boolean => {
  switch (condition) {
    case 'FIRST_LESSON':
      return data.lessonsCompleted >= 1;
    case 'COURSE_COMPLETE':
      return data.coursesCompleted >= 1;
    case 'PERFECT_SCORE':
      return data.perfectScores >= 1;
    case 'STREAK_7':
      return data.streak >= 7;
    case 'STREAK_30':
      return data.streak >= 30;
    case 'STREAK_100':
      return data.streak >= 100;
    case 'LESSONS_10':
      return data.lessonsCompleted >= 10;
    case 'LESSONS_50':
      return data.lessonsCompleted >= 50;
    case 'LESSONS_100':
      return data.lessonsCompleted >= 100;
    case 'XP_1000':
      return data.xp >= 1000;
    case 'XP_5000':
      return data.xp >= 5000;
    case 'ALL_QUESTION_TYPES':
      return data.questionTypesAnswered.size >= 4;
    default:
      return false;
  }
};

// Get newly unlocked achievements
export const getNewlyUnlockedAchievements = (
  currentAchievements: Achievement[],
  data: {
    lessonsCompleted: number;
    coursesCompleted: number;
    streak: number;
    xp: number;
    perfectScores: number;
    questionTypesAnswered: Set<string>;
  }
): Achievement[] => {
  const unlockedIds = new Set(currentAchievements.map(a => a.id));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ALL_ACHIEVEMENTS) {
    if (!unlockedIds.has(achievement.id) && checkAchievementCondition(achievement.condition, data)) {
      newlyUnlocked.push({
        ...achievement,
        unlockedAt: new Date().toISOString(),
      });
    }
  }

  return newlyUnlocked;
};

// Get current streak multiplier
export const getStreakMultiplier = (streak: number): number => {
  // Find the highest milestone reached
  let multiplier = 1.0;
  for (const milestone of STREAK_MILESTONES) {
    if (streak >= milestone.days) {
      multiplier = milestone.multiplier;
    } else {
      break; // Milestones are sorted, so we can break early
    }
  }
  return multiplier;
};

// Get current streak milestone
export const getCurrentStreakMilestone = (streak: number): StreakMilestone | null => {
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    if (streak >= STREAK_MILESTONES[i].days) {
      return STREAK_MILESTONES[i];
    }
  }
  return null;
};

// Get next streak milestone
export const getNextStreakMilestone = (streak: number): StreakMilestone | null => {
  for (const milestone of STREAK_MILESTONES) {
    if (streak < milestone.days) {
      return milestone;
    }
  }
  return null; // Already at max milestone
};

// Calculate XP with streak multiplier
export const calculateXPWithMultiplier = (baseXP: number, streak: number): number => {
  const multiplier = getStreakMultiplier(streak);
  return Math.floor(baseXP * multiplier);
};
