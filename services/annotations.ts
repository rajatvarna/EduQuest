import { Highlight, Note, HighlightColor } from '../types';

// Storage keys
const HIGHLIGHTS_STORAGE_KEY = 'lessonHighlights';
const NOTES_STORAGE_KEY = 'lessonNotes';

// Highlight Management
export const saveHighlightsToStorage = (highlights: Highlight[]): void => {
  try {
    localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(highlights));
  } catch (error) {
    console.error('Failed to save highlights to localStorage:', error);
  }
};

export const loadHighlightsFromStorage = (): Highlight[] => {
  try {
    const stored = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Highlight[];
    }
  } catch (error) {
    console.error('Failed to load highlights from localStorage:', error);
  }
  return [];
};

export const getHighlightsForLesson = (lessonId: string): Highlight[] => {
  const allHighlights = loadHighlightsFromStorage();
  return allHighlights.filter(h => h.lessonId === lessonId);
};

export const addHighlight = (
  lessonId: string,
  text: string,
  color: HighlightColor,
  startOffset: number,
  endOffset: number
): Highlight => {
  const highlight: Highlight = {
    id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    lessonId,
    text,
    color,
    startOffset,
    endOffset,
    createdAt: new Date().toISOString(),
  };

  const allHighlights = loadHighlightsFromStorage();
  allHighlights.push(highlight);
  saveHighlightsToStorage(allHighlights);

  return highlight;
};

export const removeHighlight = (highlightId: string): void => {
  const allHighlights = loadHighlightsFromStorage();
  const filtered = allHighlights.filter(h => h.id !== highlightId);
  saveHighlightsToStorage(filtered);
};

// Note Management
export const saveNotesToStorage = (notes: Note[]): void => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes to localStorage:', error);
  }
};

export const loadNotesFromStorage = (): Note[] => {
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Note[];
    }
  } catch (error) {
    console.error('Failed to load notes from localStorage:', error);
  }
  return [];
};

export const getNotesForLesson = (lessonId: string): Note[] => {
  const allNotes = loadNotesFromStorage();
  return allNotes.filter(n => n.lessonId === lessonId);
};

export const addNote = (
  lessonId: string,
  text: string,
  highlightId?: string
): Note => {
  const note: Note = {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    lessonId,
    text,
    highlightId,
    createdAt: new Date().toISOString(),
  };

  const allNotes = loadNotesFromStorage();
  allNotes.push(note);
  saveNotesToStorage(allNotes);

  return note;
};

export const updateNote = (noteId: string, text: string): void => {
  const allNotes = loadNotesFromStorage();
  const note = allNotes.find(n => n.id === noteId);
  if (note) {
    note.text = text;
    note.updatedAt = new Date().toISOString();
    saveNotesToStorage(allNotes);
  }
};

export const removeNote = (noteId: string): void => {
  const allNotes = loadNotesFromStorage();
  const filtered = allNotes.filter(n => n.id !== noteId);
  saveNotesToStorage(filtered);
};
