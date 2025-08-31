import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import * as pdfjsLib from 'pdfjs-dist';
import { Course, Question, Lesson, MatchingItem } from '../types';
import * as api from '../services/api';
import { PlusIcon, SparklesIcon, DocumentArrowUpIcon, XMarkIcon } from './icons';

// Set workerSrc for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;


interface AdminDashboardProps {
  onCourseCreated: (newCourse: Course) => void;
}

type InputMode = 'text' | 'pdf';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onCourseCreated }) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [contentText, setContentText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setSelectedFile(null);
      setError('Please select a valid PDF file.');
    }
  };

  const parsePdf = async (file: File): Promise<string> => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async (event) => {
        if (!event.target?.result) {
          return reject(new Error("Failed to read file"));
        }
        try {
          const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Using 'str' property check for TextItem
            const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
            fullText += pageText + '\n';
          }
          resolve(fullText);
        } catch (error) {
          reject(error);
        }
      };
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsArrayBuffer(file);
    });
  };


  const handleGenerateCourse = async () => {
    let contentToProcess = contentText;
    
    setIsLoading(true);
    setError(null);

    if (mode === 'pdf') {
      if (!selectedFile) {
        setError('Please select a PDF file to generate the course.');
        setIsLoading(false);
        return;
      }
      try {
        contentToProcess = await parsePdf(selectedFile);
      } catch (e) {
        console.error("PDF Parsing Error:", e);
        setError("Failed to parse PDF file. It might be corrupted or protected.");
        setIsLoading(false);
        return;
      }
    }

    if (!contentToProcess.trim()) {
      setError('The content is empty. Please paste text or upload a PDF with text.');
      setIsLoading(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const questionSchema = {
        type: Type.OBJECT,
        properties: {
          questionType: { type: Type.STRING, enum: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'MATCHING', 'SEQUENCING'] },
          text: { type: Type.STRING, description: "The question text. For FILL_IN_THE_BLANK, include '___' as a placeholder." },
          // MULTIPLE_CHOICE
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "For MULTIPLE_CHOICE only. An array of 4 option strings." },
          correctAnswerIndex: { type: Type.INTEGER, description: "For MULTIPLE_CHOICE only. The 0-based index of the correct answer." },
          // FILL_IN_THE_BLANK
          correctAnswer: { type: Type.STRING, description: "For FILL_IN_THE_BLANK only. The word(s) that fill the blank." },
          // MATCHING
          matchingPairs: {
            type: Type.ARRAY,
            description: "For MATCHING only. An array of 3-4 objects, each with a 'prompt' and 'answer' key.",
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
              required: ['prompt', 'answer'],
            },
          },
          // SEQUENCING
          sequencingItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "For SEQUENCING only. An array of 3-5 strings in the correct order."
          },
        },
        required: ['questionType', 'text'],
      };

      const responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A concise, engaging title for the entire course." },
            lessons: {
              type: Type.ARRAY,
              description: "An array of lessons covering the main sections of the text.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "A clear, descriptive title for this lesson." },
                  type: { type: Type.STRING, description: "The type of lesson: 'READING', 'VIDEO', or 'QUIZ'." },
                  content: { type: Type.STRING, description: "For 'READING' lessons, the summarized text content. For 'VIDEO' lessons, a short, engaging video script. Omit for 'QUIZ' lessons." },
                  videoId: { type: Type.STRING, description: "For 'VIDEO' lessons, a placeholder ID like 'YOUTUBE_VIDEO_ID_HERE'. Omit for other types." },
                  questions: {
                    type: Type.ARRAY,
                    description: "An array of 3-5 questions for 'QUIZ' lessons. Omit for other types.",
                    items: questionSchema,
                  },
                },
                required: ['title', 'type'],
              },
            },
          },
          required: ['title', 'lessons'],
      };

      const prompt = `You are an expert instructional designer creating a multi-format mini-course from the provided text.
      
Your task is to:
1.  Create a concise, engaging 'title' for the entire course.
2.  Analyze the text and break it down into logical sections. Create a 'lessons' array based on these sections.
3.  Structure the course with a variety of lesson types:
    - The first lesson should be a 'READING' type, with 'content' providing a summary or introduction.
    - For one of the most important concepts, create a 'VIDEO' lesson. For this, provide a short, engaging video 'script' as the 'content' and a placeholder 'videoId' ('YOUTUBE_VIDEO_ID_HERE').
    - All other sections should be 'QUIZ' lessons. For each QUIZ lesson, create 3-4 questions with a VARIETY of types: 'MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'MATCHING', and 'SEQUENCING'.
4.  Follow these rules for creating questions in the JSON:
    - **questionType:** MUST be one of 'MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'MATCHING', 'SEQUENCING'.
    - **text:** The question prompt. For 'FILL_IN_THE_BLANK', include '___' where the blank should be.
    - **For 'MULTIPLE_CHOICE':** Provide 'options' (an array of 4 strings) and a 'correctAnswerIndex'.
    - **For 'FILL_IN_THE_BLANK':** Provide the 'correctAnswer' string.
    - **For 'MATCHING':** Provide 'matchingPairs' (an array of {prompt, answer} objects).
    - **For 'SEQUENCING':** Provide 'sequencingItems' (an array of strings in the correct order).
5.  Ensure your entire output is a single, valid JSON object matching the provided schema. Do not include markdown formatting.

Content to analyze:
---
${contentToProcess.substring(0, 20000)}
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

      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: parsedCourse.title,
        lessons: parsedCourse.lessons.map((lesson: any, lIndex: number): Lesson => {
          let questions;
          if (lesson.questions) {
            questions = lesson.questions.map((q: any, qIndex: number): Question => {
              const baseQuestion = {
                id: `q-${Date.now()}-${lIndex}-${qIndex}`,
                text: q.text,
              };
              switch (q.questionType) {
                case 'FILL_IN_THE_BLANK':
                  return { ...baseQuestion, type: 'FILL_IN_THE_BLANK', correctAnswer: q.correctAnswer };
                case 'MATCHING':
                  return {
                    ...baseQuestion,
                    type: 'MATCHING',
                    prompts: q.matchingPairs.map((p: {prompt: string}, i: number): MatchingItem => ({ id: `m-p-${i}`, content: p.prompt })),
                    answers: q.matchingPairs.map((p: {answer: string}, i: number): MatchingItem => ({ id: `m-p-${i}`, content: p.answer })),
                  };
                case 'SEQUENCING':
                  return { ...baseQuestion, type: 'SEQUENCING', items: q.sequencingItems };
                case 'MULTIPLE_CHOICE':
                default:
                  return { ...baseQuestion, type: 'MULTIPLE_CHOICE', options: q.options, correctAnswerIndex: q.correctAnswerIndex };
              }
            });
          }
          return {
            id: `lesson-${Date.now()}-${lIndex}`,
            title: lesson.title,
            type: lesson.type,
            content: lesson.content,
            videoId: lesson.videoId,
            questions: questions,
          };
        }),
      };

      await onCourseCreated(newCourse);
      
    } catch (e: any) {
      console.error(e);
      setError('Failed to generate course. The AI model might have returned an unexpected format. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const TabButton: React.FC<{active: boolean, onClick: () => void, children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-base font-semibold rounded-t-lg transition-colors border-b-2 ${
        active
          ? 'text-teal-500 border-teal-500'
          : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-teal-500 dark:hover:text-teal-400 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="p-8 bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl animate-fade-in border border-slate-200 dark:border-slate-800">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Admin Dashboard</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Create a new course using AI from text or a PDF document.</p>

        <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
            <nav className="-mb-px flex space-x-4">
                <TabButton active={mode === 'text'} onClick={() => setMode('text')}>Paste Text</TabButton>
                <TabButton active={mode === 'pdf'} onClick={() => setMode('pdf')}>Upload PDF</TabButton>
            </nav>
        </div>

      <div className="space-y-4">
        {mode === 'text' && (
             <textarea
              id="course-content"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="For example: 'The mitochondria is the powerhouse of the cell...'"
              className="w-full h-64 p-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700/50 resize-y animate-fade-in"
              disabled={isLoading}
            />
        )}
        
        {mode === 'pdf' && (
            <div className="animate-fade-in">
              <input type="file" id="pdf-upload" className="hidden" onChange={handleFileChange} accept=".pdf" disabled={isLoading} />
              <label htmlFor="pdf-upload" className={`w-full h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors ${isLoading ? 'cursor-not-allowed bg-slate-100 dark:bg-slate-700' : 'cursor-pointer border-slate-300 dark:border-slate-600 hover:border-teal-500 hover:bg-teal-500/10 dark:hover:bg-slate-700/50'}`}>
                <DocumentArrowUpIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-2"/>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {selectedFile ? 'File selected:' : 'Click to upload or drag & drop'}
                </span>
                {selectedFile && (
                    <span className="mt-2 text-sm text-teal-500 font-medium bg-teal-50 dark:bg-teal-900/50 px-3 py-1 rounded-full flex items-center">
                        {selectedFile.name}
                        <button 
                            onClick={(e) => { e.preventDefault(); setSelectedFile(null); }} 
                            className="ml-2 text-teal-600 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-100"
                        >
                            <XMarkIcon className="w-4 h-4"/>
                        </button>
                    </span>
                )}
                {!selectedFile && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PDF up to 10MB</p>}
              </label>
            </div>
        )}
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleGenerateCourse}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all hover:scale-105"
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