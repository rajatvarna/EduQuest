import React, { useState, useMemo, useEffect } from 'react';
import { marked } from 'marked';
import { Lesson, Question, MatchingItem } from '../types';
import { CheckIcon, XMarkIcon, ArrowLeftIcon, ArrowPathIcon } from './icons';

interface LessonProps {
  lesson: Lesson;
  userHearts: number;
  onAnswer: (questionId: string, isCorrect: boolean) => void;
  onComplete: (lessonId: string) => void;
  onExit: () => void;
  isCompleted: boolean;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


const QuizLesson: React.FC<LessonProps> = ({ lesson, userHearts, onAnswer, onComplete, onExit, isCompleted }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // State for different answer types
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null); // For MCQ
  const [textAnswer, setTextAnswer] = useState(''); // For Fill-in-the-blank
  const [matchingSelections, setMatchingSelections] = useState<{promptId: string | null, selections: Record<string, string>}>({ promptId: null, selections: {} }); // For Matching
  const [sequencingAnswers, setSequencingAnswers] = useState<string[]>([]); // For Sequencing

  const [shuffledAnswers, setShuffledAnswers] = useState<MatchingItem[]>([]);
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);

  const currentQuestion = lesson.questions?.[currentIndex];
  
  useEffect(() => {
    // Reset states when question changes
    setIsAnswerChecked(false);
    setSelectedAnswer(null);
    setTextAnswer('');
    setMatchingSelections({ promptId: null, selections: {} });
    setSequencingAnswers([]);
    
    if (currentQuestion?.type === 'MATCHING') {
      setShuffledAnswers(shuffleArray(currentQuestion.answers));
    }
    if (currentQuestion?.type === 'SEQUENCING') {
      setShuffledItems(shuffleArray(currentQuestion.items));
    }

  }, [currentIndex, currentQuestion]);

  
  const contentHtml = useMemo(() => lesson.content ? marked(lesson.content) : '', [lesson.content]);

  const progress = useMemo(() => ((currentIndex) / (lesson.questions?.length || 1)) * 100, [currentIndex, lesson.questions?.length]);
  
  if (!currentQuestion) {
      return <div>Loading question...</div>
  }

  const isAnswerComplete = () => {
    switch(currentQuestion.type) {
        case 'MULTIPLE_CHOICE':
            return selectedAnswer !== null;
        case 'FILL_IN_THE_BLANK':
            return textAnswer.trim() !== '';
        case 'MATCHING':
            return Object.keys(matchingSelections.selections).length === currentQuestion.prompts.length;
        case 'SEQUENCING':
            return sequencingAnswers.length === currentQuestion.items.length;
        default:
            return false;
    }
  }

  const checkIsCorrect = (): boolean => {
    switch (currentQuestion.type) {
      case 'MULTIPLE_CHOICE':
        return selectedAnswer === currentQuestion.correctAnswerIndex;
      case 'FILL_IN_THE_BLANK':
        return textAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
      case 'MATCHING':
        return currentQuestion.prompts.every(
          (prompt) => matchingSelections.selections[prompt.id] === prompt.id
        );
      case 'SEQUENCING':
        return sequencingAnswers.every((item, index) => item === currentQuestion.items[index]);
      default:
        return false;
    }
  };


  const handleCheckAnswer = () => {
    if (!isAnswerComplete()) return;
    
    const correct = checkIsCorrect();
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    // Don't charge hearts for reviewing a completed lesson
    if (!correct && !isCompleted) {
        onAnswer(currentQuestion.id, false);
    } else {
        onAnswer(currentQuestion.id, correct);
    }
  };

  const handleNext = () => {
    if (lesson.questions && currentIndex < lesson.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(lesson.id);
    }
  };

  const handleMatchingClick = (type: 'prompt' | 'answer', id: string) => {
    if (isAnswerChecked) return;

    if (type === 'prompt') {
      // If clicking an already selected prompt, deselect it
      if (matchingSelections.promptId === id) {
        setMatchingSelections(prev => ({ ...prev, promptId: null }));
      } else {
        setMatchingSelections(prev => ({ ...prev, promptId: id }));
      }
    } else if (type === 'answer' && matchingSelections.promptId) {
      // Find the prompt id for this answer if it's already selected
      const existingPrompt = Object.keys(matchingSelections.selections).find(
        pId => matchingSelections.selections[pId] === id
      );
      
      const newSelections = {...matchingSelections.selections};
      
      // If this answer was matched to another prompt, unmatch it
      if (existingPrompt) {
        delete newSelections[existingPrompt];
      }

      setMatchingSelections({
        promptId: null,
        selections: {
          ...newSelections,
          [matchingSelections.promptId]: id,
        }
      });
    }
  };
  
  const handleSequencingClick = (item: string) => {
    if(isAnswerChecked) return;
    setSequencingAnswers(prev => [...prev, item]);
  }
  
  const resetSequencing = () => {
      if(isAnswerChecked) return;
      setSequencingAnswers([]);
  }

  const noHeartsLeft = userHearts === 0 && !isCorrect && isAnswerChecked && !isCompleted;

  const renderQuestionBody = () => {
    switch(currentQuestion.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {currentQuestion.options.map((option, index) => {
              const getButtonClass = () => {
                if (!isAnswerChecked) {
                  return selectedAnswer === index
                    ? 'bg-teal-100 dark:bg-teal-900/50 border-teal-500 ring-2 ring-teal-500/30'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 border-slate-300 dark:border-slate-600';
                }
                if (index === currentQuestion.correctAnswerIndex) return 'bg-green-100 dark:bg-green-900/50 border-green-600 text-green-800 dark:text-green-200';
                if (index === selectedAnswer) return 'bg-red-100 dark:bg-red-900/50 border-red-600 text-red-800 dark:text-red-200';
                return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 opacity-60';
              };
              return (
                <button key={index} onClick={() => setSelectedAnswer(index)} disabled={isAnswerChecked}
                  className={`p-4 rounded-xl border-b-4 text-lg font-semibold w-full text-left transition-all active:translate-y-0.5 active:border-b-2 ${getButtonClass()}`}>
                  {option}
                </button>
              )
            })}
          </div>
        );

      case 'FILL_IN_THE_BLANK':
        const parts = currentQuestion.text.split('___');
        return (
          <div className="flex items-center justify-center text-2xl md:text-3xl font-semibold flex-wrap gap-2">
            <span>{parts[0]}</span>
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={isAnswerChecked}
              className={`w-40 text-center font-bold text-2xl md:text-3xl bg-transparent border-b-2 focus:outline-none transition-colors ${
                isAnswerChecked 
                  ? (isCorrect ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-red-500 text-red-600 dark:text-red-400') 
                  : 'border-slate-400 dark:border-slate-500 focus:border-teal-500'
              }`}
              autoFocus
            />
            <span>{parts[1]}</span>
          </div>
        );
      
      case 'MATCHING':
        return (
          <div className="w-full flex justify-center gap-8">
            {/* Prompts Column */}
            <div className="w-1/2 space-y-3">
              {currentQuestion.prompts.map(prompt => {
                const isSelected = matchingSelections.promptId === prompt.id;
                const isMatched = matchingSelections.selections[prompt.id];
                return (
                  <button key={prompt.id} onClick={() => handleMatchingClick('prompt', prompt.id)} disabled={isAnswerChecked}
                    className={`w-full p-3 text-lg font-semibold rounded-lg border-2 transition-all ${
                      isSelected ? 'border-teal-500 ring-2 ring-teal-500/50' : 
                      isMatched ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 opacity-80' : 
                      'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}>
                    {prompt.content}
                  </button>
                )
              })}
            </div>
            {/* Answers Column */}
            <div className="w-1/2 space-y-3">
              {shuffledAnswers.map(answer => {
                const matchedPromptId = Object.keys(matchingSelections.selections).find(pId => matchingSelections.selections[pId] === answer.id);
                const isMatched = !!matchedPromptId;
                const isCorrectMatch = isAnswerChecked && matchedPromptId === answer.id;
                const isIncorrectMatch = isAnswerChecked && isMatched && matchedPromptId !== answer.id;

                const getButtonClass = () => {
                  if(isAnswerChecked) {
                    if (isCorrectMatch) return 'bg-green-100 dark:bg-green-900/50 border-green-500';
                    if (isIncorrectMatch) return 'bg-red-100 dark:bg-red-900/50 border-red-500';
                    return 'bg-slate-100 dark:bg-slate-700 opacity-60'
                  }
                  if (isMatched) return 'bg-slate-100 dark:bg-slate-700 border-slate-400 dark:border-slate-500 opacity-60'
                  return 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }

                return (
                  <button key={answer.id} onClick={() => handleMatchingClick('answer', answer.id)} disabled={isAnswerChecked || isMatched}
                    className={`w-full p-3 text-lg font-semibold rounded-lg border-2 transition-all ${getButtonClass()}`}>
                    {answer.content}
                  </button>
                )
              })}
            </div>
          </div>
        )
      
      case 'SEQUENCING':
        const availableItems = shuffledItems.filter(item => !sequencingAnswers.includes(item));
        return (
          <div className="w-full flex flex-col items-center gap-6">
            {/* Answer Area */}
            <div className="w-full min-h-[6rem] bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 flex flex-wrap gap-2 items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
              {sequencingAnswers.map((item, index) => {
                const isCorrectItem = isAnswerChecked && currentQuestion.items[index] === item;
                return (
                  <div key={`${item}-${index}`} className={`px-4 py-2 text-lg font-semibold rounded-lg transition-colors ${
                    isAnswerChecked ? (isCorrectItem ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-white' : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-white animate-shake') : 'bg-white dark:bg-slate-700 shadow-sm'
                  }`}>
                    {item}
                  </div>
                )
              })}
              {sequencingAnswers.length === 0 && <span className="text-slate-500">Click the items below in the correct order.</span>}
            </div>

            {/* Choices Area */}
            <div className="w-full flex flex-wrap gap-3 items-center justify-center">
              {availableItems.map(item => (
                <button key={item} onClick={() => handleSequencingClick(item)} disabled={isAnswerChecked}
                  className="px-4 py-2 text-lg font-semibold bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50">
                  {item}
                </button>
              ))}
            </div>
            {sequencingAnswers.length > 0 && <button onClick={resetSequencing} disabled={isAnswerChecked} className="text-sm text-slate-500 hover:text-teal-500 disabled:opacity-50 flex items-center gap-1"><ArrowPathIcon className="w-4 h-4" /> Reset</button>}
          </div>
        )

      default: return null;
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-4">
         <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 mr-4">
             <ArrowLeftIcon className="w-6 h-6"/>
         </button>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
          <div
            className="bg-teal-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4">
        {lesson.content && currentIndex === 0 && (
            <div className="prose dark:prose-invert max-w-none mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </div>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{currentQuestion.text}</h2>
        {renderQuestionBody()}
      </div>
      
      <div className={`fixed bottom-0 left-0 right-0 p-4 border-t-2 ${isAnswerChecked ? (isCorrect ? 'border-green-300 dark:border-green-800' : 'border-red-300 dark:border-red-800') : 'border-slate-200 dark:border-slate-800'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm`}>
        <div className="container mx-auto max-w-5xl">
            {isAnswerChecked ? (
                <div className="flex items-center justify-between animate-fade-in">
                    <div className="flex items-center">
                        {isCorrect ? <CheckIcon className="w-8 h-8 mr-2 text-green-600 dark:text-green-400"/> : <XMarkIcon className="w-8 h-8 mr-2 text-red-600 dark:text-red-400"/>}
                        <span className={`text-xl font-bold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{isCorrect ? "Correct!" : "Incorrect!"}</span>
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={noHeartsLeft}
                        className={`px-8 py-3 rounded-lg font-bold text-base transition-transform hover:scale-105 shadow-md ${isCorrect ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'} disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-600`}
                    >
                        {lesson.questions && currentIndex < lesson.questions.length - 1 ? 'Next' : 'Finish'}
                    </button>
                </div>
            ) : (
                 <button
                    onClick={handleCheckAnswer}
                    disabled={!isAnswerComplete()}
                    className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    Check
                  </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuizLesson;