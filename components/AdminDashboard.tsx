import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Question } from '../types';
import { PlusIcon, SparklesIcon } from './icons';

interface AdminDashboardProps {
  onCourseCreated: (newCourse: Course) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onCourseCreated }) => {
  const [contentText, setContentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCourse = async () => {
    if (!contentText.trim()) {
      setError('Please enter some content to generate a course.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            lessons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        correctAnswerIndex: { type: Type.INTEGER },
                      },
                      required: ['text', 'options', 'correctAnswerIndex'],
                    },
                  },
                },
                required: ['title', 'questions'],
              },
            },
          },
          required: ['title', 'lessons'],
      };

      const prompt = `Based on the following content, generate a short educational course. The course should have a concise, engaging title and one lesson. The lesson should also have a title and contain exactly 5 multiple-choice questions that test the main concepts of the text. Each question must have 4 options and a correct answer index (0-3).

Content:
---
${contentText}
---
`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const jsonResponse = result.text;
      const parsedCourse = JSON.parse(jsonResponse);

      // Add IDs to the generated content
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: parsedCourse.title,
        lessons: parsedCourse.lessons.map((lesson: any, lIndex: number) => ({
          id: `lesson-${Date.now()}-${lIndex}`,
          title: lesson.title,
          type: 'QUIZ',
          questions: lesson.questions.map((q: Question, qIndex: number) => ({
            ...q,
            id: `q-${Date.now()}-${lIndex}-${qIndex}`,
          })),
        })),
      };

      onCourseCreated(newCourse);
      
    } catch (e: any) {
      console.error(e);
      setError('Failed to generate course. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Admin Dashboard</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Create a new course using AI from text content.</p>

      <div className="space-y-4">
        <label htmlFor="course-content" className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
          Paste your course content here:
        </label>
        <textarea
          id="course-content"
          value={contentText}
          onChange={(e) => setContentText(e.target.value)}
          placeholder="For example: 'The mitochondria is the powerhouse of the cell. It generates most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy...'"
          className="w-full h-64 p-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700 resize-y"
          disabled={isLoading}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleGenerateCourse}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-6 h-6 mr-2" />
              Generate Course with AI
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
