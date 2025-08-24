import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Lesson } from '../types';
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon } from './icons';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface QuestBotProps {
  isOpen: boolean;
  onClose: () => void;
  activeLesson: Lesson | null;
}

const QuestBot: React.FC<QuestBotProps> = ({ isOpen, onClose, activeLesson }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        let systemInstruction = "You are QuestBot, a friendly and encouraging AI tutor for the EduQuest learning platform. Your goal is to help users understand the course material without giving away direct answers to quiz questions. Explain concepts clearly, provide examples, and ask guiding questions to help the user arrive at the answer themselves. Keep your tone positive and supportive. Start every conversation with a friendly greeting.";

        const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction
          },
        });
        
        setChat(newChat);
        
        let firstMessage = 'Hi there! I\'m QuestBot. How can I help you today?';
        if (activeLesson) {
            firstMessage = `Hi! I see you're working on the lesson "${activeLesson.title}". Ask me anything about it!`;
        }
        setMessages([{ role: 'model', text: firstMessage }]);
        
      } catch (error) {
        console.error("Failed to initialize QuestBot:", error);
        setMessages([{ role: 'model', text: 'Sorry, I am unable to connect right now.' }]);
      }
    }
  }, [isOpen, activeLesson]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessageStream({ message: input });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = modelResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Oops! Something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center z-50 p-0 sm:p-4">
      <div 
        className="bg-white dark:bg-slate-900 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-none sm:rounded-2xl shadow-2xl flex flex-col transform transition-all animate-slide-in-up"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center">
            <SparklesIcon className="w-6 h-6 text-teal-500 mr-2" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">QuestBot Tutor</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:text-teal-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-slate-800">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-teal-500"/></div>}
              <div className={`p-3 rounded-2xl max-w-xs md:max-w-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-teal-500 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none'}`}>
                {msg.text}
                {isLoading && index === messages.length -1 && msg.role === 'model' && <span className="inline-block w-2 h-4 bg-slate-600 dark:bg-slate-300 animate-pulse ml-1"></span>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 dark:bg-slate-800 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-full text-white bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-5 h-5"/>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default QuestBot;