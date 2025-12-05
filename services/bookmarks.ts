import { Bookmark } from '../types';

const BOOKMARKS_STORAGE_KEY = 'lessonBookmarks';

// Bookmark Management
export const saveBookmarksToStorage = (bookmarks: Bookmark[]): void => {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Failed to save bookmarks to localStorage:', error);
  }
};

export const loadBookmarksFromStorage = (): Bookmark[] => {
  try {
    const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Bookmark[];
    }
  } catch (error) {
    console.error('Failed to load bookmarks from localStorage:', error);
  }
  return [];
};

export const isLessonBookmarked = (lessonId: string): boolean => {
  const bookmarks = loadBookmarksFromStorage();
  return bookmarks.some(b => b.lessonId === lessonId);
};

export const addBookmark = (
  lessonId: string,
  courseId: string,
  lessonTitle: string,
  courseTitle: string
): Bookmark => {
  const bookmark: Bookmark = {
    lessonId,
    courseId,
    lessonTitle,
    courseTitle,
    createdAt: new Date().toISOString(),
  };

  const bookmarks = loadBookmarksFromStorage();

  // Avoid duplicates
  if (!bookmarks.some(b => b.lessonId === lessonId)) {
    bookmarks.push(bookmark);
    saveBookmarksToStorage(bookmarks);
  }

  return bookmark;
};

export const removeBookmark = (lessonId: string): void => {
  const bookmarks = loadBookmarksFromStorage();
  const filtered = bookmarks.filter(b => b.lessonId !== lessonId);
  saveBookmarksToStorage(filtered);
};

export const toggleBookmark = (
  lessonId: string,
  courseId: string,
  lessonTitle: string,
  courseTitle: string
): boolean => {
  if (isLessonBookmarked(lessonId)) {
    removeBookmark(lessonId);
    return false;
  } else {
    addBookmark(lessonId, courseId, lessonTitle, courseTitle);
    return true;
  }
};

export const getBookmarksForCourse = (courseId: string): Bookmark[] => {
  const bookmarks = loadBookmarksFromStorage();
  return bookmarks.filter(b => b.courseId === courseId);
};

export const getAllBookmarks = (): Bookmark[] => {
  return loadBookmarksFromStorage();
};
