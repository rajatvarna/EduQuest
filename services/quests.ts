import { DailyQuest, QuestType } from '../types';

// Generate daily quests for a given date
export const generateDailyQuests = (date: Date = new Date()): DailyQuest[] => {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  return [
    {
      id: `quest-lessons-${dateStr}`,
      title: 'Complete 3 Lessons',
      description: 'Finish any 3 lessons today',
      type: 'COMPLETE_LESSONS',
      target: 3,
      progress: 0,
      reward: 50,
      completed: false,
      date: dateStr,
    },
    {
      id: `quest-questions-${dateStr}`,
      title: 'Answer 10 Questions',
      description: 'Answer 10 questions correctly',
      type: 'ANSWER_QUESTIONS',
      target: 10,
      progress: 0,
      reward: 30,
      completed: false,
      date: dateStr,
    },
    {
      id: `quest-streak-${dateStr}`,
      title: 'Maintain Your Streak',
      description: 'Keep your learning streak alive',
      type: 'MAINTAIN_STREAK',
      target: 1,
      progress: 0,
      reward: 20,
      completed: false,
      date: dateStr,
    },
    {
      id: `quest-xp-${dateStr}`,
      title: 'Earn 100 XP',
      description: 'Collect 100 XP today',
      type: 'EARN_XP',
      target: 100,
      progress: 0,
      reward: 50,
      completed: false,
      date: dateStr,
    },
    {
      id: `quest-perfect-${dateStr}`,
      title: 'Get 2 Perfect Scores',
      description: 'Complete 2 lessons with 100% accuracy',
      type: 'PERFECT_SCORES',
      target: 2,
      progress: 0,
      reward: 80,
      completed: false,
      date: dateStr,
    },
  ];
};

// Check if quests need to be reset (new day)
export const shouldResetQuests = (currentQuests: DailyQuest[]): boolean => {
  if (currentQuests.length === 0) return true;

  const today = new Date().toISOString().split('T')[0];
  const questDate = currentQuests[0]?.date;

  return questDate !== today;
};

// Update quest progress
export const updateQuestProgress = (
  quests: DailyQuest[],
  questType: QuestType,
  increment: number = 1
): DailyQuest[] => {
  return quests.map(quest => {
    if (quest.type === questType && !quest.completed) {
      const newProgress = Math.min(quest.progress + increment, quest.target);
      const isCompleted = newProgress >= quest.target;

      return {
        ...quest,
        progress: newProgress,
        completed: isCompleted,
      };
    }
    return quest;
  });
};

// Get total XP rewards from completed quests
export const getCompletedQuestsRewards = (quests: DailyQuest[]): number => {
  return quests.reduce((total, quest) => {
    return quest.completed ? total + quest.reward : total;
  }, 0);
};

// Get quest completion percentage
export const getQuestCompletionPercentage = (quests: DailyQuest[]): number => {
  if (quests.length === 0) return 0;
  const completed = quests.filter(q => q.completed).length;
  return Math.round((completed / quests.length) * 100);
};

// Get quests by completion status
export const getQuestsByStatus = (quests: DailyQuest[], completed: boolean): DailyQuest[] => {
  return quests.filter(q => q.completed === completed);
};

// Save quests to localStorage
export const saveQuestsToStorage = (quests: DailyQuest[]): void => {
  try {
    localStorage.setItem('dailyQuests', JSON.stringify(quests));
  } catch (error) {
    console.error('Failed to save quests to localStorage:', error);
  }
};

// Load quests from localStorage
export const loadQuestsFromStorage = (): DailyQuest[] => {
  try {
    const stored = localStorage.getItem('dailyQuests');
    if (stored) {
      const quests = JSON.parse(stored) as DailyQuest[];

      // Check if they need to be reset
      if (shouldResetQuests(quests)) {
        return generateDailyQuests();
      }

      return quests;
    }
  } catch (error) {
    console.error('Failed to load quests from localStorage:', error);
  }

  return generateDailyQuests();
};
