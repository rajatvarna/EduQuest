import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { Lesson, Highlight, Note, HighlightColor } from '../types';
import { ArrowLeftIcon, PaintBrushIcon, TrashIcon, ClipboardDocumentListIcon, PlusIcon } from './icons';
import {
  getHighlightsForLesson,
  getNotesForLesson,
  addHighlight,
  removeHighlight,
  addNote,
  updateNote,
  removeNote,
} from '../services/annotations';

interface ReadingLessonProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  onExit: () => void;
}

interface SelectionInfo {
  text: string;
  x: number;
  y: number;
}

const HIGHLIGHT_COLORS: { color: HighlightColor; class: string; label: string }[] = [
  { color: 'yellow', class: 'bg-yellow-200 dark:bg-yellow-600/40', label: 'Yellow' },
  { color: 'green', class: 'bg-green-200 dark:bg-green-600/40', label: 'Green' },
  { color: 'blue', class: 'bg-blue-200 dark:bg-blue-600/40', label: 'Blue' },
  { color: 'pink', class: 'bg-pink-200 dark:bg-pink-600/40', label: 'Pink' },
  { color: 'purple', class: 'bg-purple-200 dark:bg-purple-600/40', label: 'Purple' },
];

const ReadingLesson: React.FC<ReadingLessonProps> = ({ lesson, onComplete, onExit }) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load highlights and notes for this lesson
    setHighlights(getHighlightsForLesson(lesson.id));
    setNotes(getNotesForLesson(lesson.id));
  }, [lesson.id]);

  const contentHtml = lesson.content ? marked(lesson.content) : '';

  const handleTextSelection = () => {
    const selectedText = window.getSelection();
    if (selectedText && selectedText.toString().trim().length > 0) {
      const range = selectedText.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelection({
        text: selectedText.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY - 10,
      });
    } else {
      setSelection(null);
    }
  };

  const handleHighlight = (color: HighlightColor) => {
    if (!selection) return;

    // For simplicity, we'll store the text and timestamp
    // In a production app, you'd want to store precise DOM positions
    const newHighlight = addHighlight(
      lesson.id,
      selection.text,
      color,
      Date.now(), // Using timestamp as a simple offset
      Date.now()
    );

    setHighlights([...highlights, newHighlight]);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleRemoveHighlight = (highlightId: string) => {
    removeHighlight(highlightId);
    setHighlights(highlights.filter(h => h.id !== highlightId));
  };

  const handleAddNote = () => {
    if (newNoteText.trim()) {
      const newNote = addNote(lesson.id, newNoteText.trim());
      setNotes([...notes, newNote]);
      setNewNoteText('');
    }
  };

  const handleUpdateNote = (noteId: string) => {
    if (editingNoteText.trim()) {
      updateNote(noteId, editingNoteText.trim());
      setNotes(notes.map(n =>
        n.id === noteId
          ? { ...n, text: editingNoteText.trim(), updatedAt: new Date().toISOString() }
          : n
      ));
      setEditingNoteId(null);
      setEditingNoteText('');
    }
  };

  const handleRemoveNote = (noteId: string) => {
    removeNote(noteId);
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const startEditingNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  // Process HTML to add highlight markers
  const processedHtml = React.useMemo(() => {
    let html = contentHtml;

    // Sort highlights by creation time to apply them consistently
    const sortedHighlights = [...highlights].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Apply highlights to the HTML
    sortedHighlights.forEach(highlight => {
      const colorConfig = HIGHLIGHT_COLORS.find(c => c.color === highlight.color);
      if (colorConfig) {
        // Escape special regex characters in the text
        const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedText})`, 'gi');

        // Only highlight the first occurrence to avoid nested highlights
        html = html.replace(regex, (match) => {
          return `<mark class="${colorConfig.class} rounded px-1" data-highlight-id="${highlight.id}">${match}</mark>`;
        });
      }
    });

    return html;
  }, [contentHtml, highlights]);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 mr-4">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNotesPanel(!showNotesPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              showNotesPanel
                ? 'bg-teal-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            <ClipboardDocumentListIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Notes ({notes.length})</span>
          </button>
        </div>
      </div>

      <div className="flex-grow flex gap-4 overflow-hidden mb-24">
        {/* Main Content Area */}
        <div
          className={`transition-all duration-300 ${
            showNotesPanel ? 'flex-1' : 'flex-1'
          }`}
        >
          <div
            ref={contentRef}
            className="h-full prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-slate-800/50 rounded-xl p-6 md:p-8 overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-inner"
            onMouseUp={handleTextSelection}
          >
            <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
          </div>

          {/* Highlight Color Picker Popover */}
          {selection && (
            <div
              className="fixed z-50 animate-fade-in"
              style={{
                left: `${selection.x}px`,
                top: `${selection.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-2 flex items-center gap-2">
                <PaintBrushIcon className="w-4 h-4 text-slate-500" />
                {HIGHLIGHT_COLORS.map(({ color, class: colorClass, label }) => (
                  <button
                    key={color}
                    onClick={() => handleHighlight(color)}
                    className={`w-8 h-8 rounded ${colorClass} hover:scale-110 transition-transform border-2 border-slate-300 dark:border-slate-600`}
                    title={label}
                    aria-label={`Highlight with ${label}`}
                  />
                ))}
                <button
                  onClick={() => setSelection(null)}
                  className="ml-2 p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  aria-label="Cancel"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Panel */}
        {showNotesPanel && (
          <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col animate-fade-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-5 h-5 text-teal-500" />
                My Notes
              </h3>
            </div>

            {/* Add New Note */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write a note..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim()}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add Note
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notes.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                  <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notes yet</p>
                </div>
              ) : (
                notes.map(note => (
                  <div
                    key={note.id}
                    className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 border border-slate-200 dark:border-slate-600"
                  >
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-500 rounded bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateNote(note.id)}
                            className="flex-1 px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditingNote}
                            className="flex-1 px-3 py-1 text-sm bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-400 dark:hover:bg-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap mb-2">
                          {note.text}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingNote(note)}
                              className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveNote(note.id)}
                              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Highlights Section */}
            {highlights.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <PaintBrushIcon className="w-4 h-4 text-teal-500" />
                  Highlights ({highlights.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {highlights.map(highlight => {
                    const colorConfig = HIGHLIGHT_COLORS.find(c => c.color === highlight.color);
                    return (
                      <div
                        key={highlight.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <div className={`flex-shrink-0 w-4 h-4 rounded ${colorConfig?.class}`} />
                        <p className="flex-1 text-slate-700 dark:text-slate-300 text-xs line-clamp-2">
                          {highlight.text}
                        </p>
                        <button
                          onClick={() => handleRemoveHighlight(highlight.id)}
                          className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          aria-label="Remove highlight"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 border-t-2 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <span className="hidden sm:inline font-semibold text-slate-600 dark:text-slate-300 truncate pr-4">
            {lesson.title}
          </span>
          <button
            onClick={() => onComplete(lesson.id)}
            className="w-full sm:w-auto flex-shrink-0 py-3 px-6 text-lg font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Complete Lesson
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingLesson;
