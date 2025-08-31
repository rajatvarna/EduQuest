import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer, YouTubeProps } from 'react-youtube';
import { Lesson, VideoInteraction, Question } from '../types';
import { ArrowLeftIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon, CheckIcon } from './icons';

interface InteractionModalProps {
    interaction: VideoInteraction;
    onAnswer: (isCorrect: boolean) => void;
}

const InteractionModal: React.FC<InteractionModalProps> = ({ interaction, onAnswer }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const isCorrect = selectedAnswer === interaction.question.correctAnswerIndex;

    const handleSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
    };

    const handleCheck = () => {
        if (selectedAnswer === null) return;
        setIsAnswered(true);
        setTimeout(() => {
            onAnswer(isCorrect);
        }, 1500); // Wait a bit before closing
    };
    
    const getButtonClass = (index: number) => {
        if (!isAnswered) {
          return selectedAnswer === index
            ? 'bg-teal-100 dark:bg-teal-900/50 border-teal-500 ring-2 ring-teal-500/30'
            : 'bg-white dark:bg-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 border-slate-300 dark:border-slate-600';
        }
    
        if (index === interaction.question.correctAnswerIndex) {
          return 'bg-green-100 dark:bg-green-900/50 border-green-600 text-green-800 dark:text-green-200';
        }
        if (index === selectedAnswer) {
          return 'bg-red-100 dark:bg-red-900/50 border-red-600 text-red-800 dark:text-red-200';
        }
        return 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 opacity-60';
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-jump-in border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">{interaction.question.text}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interaction.question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(index)}
                            disabled={isAnswered}
                            className={`p-4 rounded-xl border-b-4 text-lg font-semibold w-full text-left transition-all ${getButtonClass(index)}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                 <div className={`mt-6 transition-opacity ${isAnswered ? 'opacity-0' : 'opacity-100'}`}>
                    <button
                        onClick={handleCheck}
                        disabled={selectedAnswer === null}
                        className="w-full py-3 text-lg font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        Check
                    </button>
                </div>
                {isAnswered && (
                     <div className="mt-6 flex items-center justify-center animate-fade-in text-xl font-bold">
                        {isCorrect ? <CheckIcon className="w-8 h-8 mr-2 text-green-600 dark:text-green-400"/> : <XMarkIcon className="w-8 h-8 mr-2 text-red-600 dark:text-red-400"/>}
                        <span className={`${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{isCorrect ? "Correct!" : "Incorrect!"}</span>
                     </div>
                )}
            </div>
        </div>
    );
};


interface VideoLessonProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  onExit: () => void;
}

const VideoLesson: React.FC<VideoLessonProps> = ({ lesson, onComplete, onExit }) => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeTranscriptIndex, setActiveTranscriptIndex] = useState(-1);
  const [activeInteraction, setActiveInteraction] = useState<VideoInteraction | null>(null);
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(new Set());

  const progressIntervalRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  
  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying && player) {
      progressIntervalRef.current = window.setInterval(() => {
        // FIX: The `player.getCurrentTime()` method returns a Promise, which cannot be directly passed to the `setProgress` state setter.
        // We resolve the promise using `.then()` to get the current time as a number before updating the state and performing other checks.
        player.getCurrentTime().then(currentTime => {
            setProgress(currentTime);

            if (lesson.transcript) {
                // Replace findLastIndex with a compatible method for wider browser support.
                let newIndex = -1;
                for (let i = lesson.transcript.length - 1; i >= 0; i--) {
                    if (currentTime >= lesson.transcript[i].start) {
                        newIndex = i;
                        break;
                    }
                }
                setActiveTranscriptIndex(newIndex);
            }
            
            // Check for video interactions
            if (lesson.videoInteractions) {
                const interaction = lesson.videoInteractions.find(
                    vi => currentTime >= vi.timestamp && !completedInteractions.has(vi.question.id)
                );
                if (interaction) {
                    player.pauseVideo();
                    setActiveInteraction(interaction);
                }
            }
        });
      }, 250);
    } else {
      clearProgressInterval();
    }
    return () => clearProgressInterval();
  }, [isPlaying, player, lesson.transcript, lesson.videoInteractions, completedInteractions]);
  
  useEffect(() => {
    if (activeTranscriptIndex > -1 && transcriptContainerRef.current) {
      const activeElement = transcriptContainerRef.current.children[activeTranscriptIndex] as HTMLElement;
      if (activeElement) {
        const containerRect = transcriptContainerRef.current.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();
        if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
             activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [activeTranscriptIndex]);

  const onReady = (event: { target: YouTubePlayer }) => {
    setPlayer(event.target);
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);
  };
  
  const onStateChange = (event: { data: number }) => {
    setIsPlaying(event.data === 1);
  };

  const handlePlayPause = () => {
    if (!player) return;
    isPlaying ? player.pauseVideo() : player.playVideo();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player || !duration) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = duration * (x / rect.width);
    player.seekTo(newTime, true);
    setProgress(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    player.setVolume(newVolume * 100);
    if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        player.unMute();
    }
  };

  const toggleMute = () => {
      if (!player) return;
      isMuted ? player.unMute() : player.mute();
      setIsMuted(!isMuted);
  };
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };
  
  const hideControls = () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (isPlaying) {
         controlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 2000);
      }
  };

  const handleMouseMove = () => {
      setShowControls(true);
      hideControls();
  };

  const handleTranscriptClick = (time: number) => {
    if (player) {
      player.seekTo(time, true);
      if (!isPlaying) player.playVideo();
    }
  };
  
  const handleInteractionAnswer = (isCorrect: boolean) => {
      if (activeInteraction) {
          setCompletedInteractions(prev => new Set(prev).add(activeInteraction.question.id));
          setActiveInteraction(null);
          player?.playVideo();
      }
  }

  if (!lesson.videoId) {
    return (
      <div className="flex flex-col h-full animate-fade-in">
         <div className="flex items-center mb-6">
            <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 mr-4">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
         </div>
         <div className="flex-grow prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-slate-800/50 rounded-xl p-6 md:p-8 overflow-y-auto mb-24 border border-slate-200 dark:border-slate-800 shadow-inner">
            <h2 className="text-xl font-semibold mb-4">Video Script</h2>
            <p>{lesson.content || "No video script available for this lesson."}</p>
         </div>
      </div>
    );
  }

  // The 'showinfo' parameter is deprecated for YouTube embeds and has been removed.
  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
    },
  };
  
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {activeInteraction && <InteractionModal interaction={activeInteraction} onAnswer={handleInteractionAnswer} />}
      <div className="flex items-center mb-6">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 mr-4">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold truncate">{lesson.title}</h1>
      </div>
      
       <div className="flex-grow flex flex-col lg:flex-row gap-6 mb-24 overflow-hidden">
        {/* Video Player Section */}
        <div 
          className="flex-grow bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-500/10 relative lg:w-2/3"
          onMouseMove={handleMouseMove}
          onMouseLeave={hideControls}
        >
          <YouTube
            videoId={lesson.videoId}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
            className="w-full h-full absolute"
          />
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none`}></div>
          
          <div className={`absolute bottom-0 left-0 right-0 p-4 text-white transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'} pointer-events-auto`}>
            {/* Progress Bar */}
            <div className="group/progress w-full h-4 -translate-y-2 flex items-center cursor-pointer" onClick={handleSeek}>
              <div className="w-full h-1 group-hover/progress:h-1.5 bg-white/30 rounded-full transition-all">
                <div className="h-full bg-teal-500 rounded-full relative" style={{ width: `${(progress / duration) * 100}%` }}>
                    <div className="absolute -right-1.5 -top-1 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handlePlayPause} className="hover:scale-110 transition-transform">
                        {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                    </button>
                    <div className="flex items-center gap-2 group/volume">
                         <button onClick={toggleMute}>
                             {isMuted || volume === 0 ? <SpeakerXMarkIcon className="w-6 h-6"/> : <SpeakerWaveIcon className="w-6 h-6"/>}
                         </button>
                         <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-0 group-hover/volume:w-24 h-1 accent-teal-500 transition-all duration-300"
                         />
                    </div>
                </div>
                <div className="font-mono text-sm">
                    {formatTime(progress)} / {formatTime(duration)}
                </div>
            </div>
          </div>
        </div>

        {/* Transcript Section */}
        {lesson.transcript && (
            <div className="lg:w-1/3 flex flex-col bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner h-full">
                <h3 className="text-lg font-bold p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">Transcript</h3>
                <div ref={transcriptContainerRef} className="flex-grow overflow-y-auto p-2 space-y-1">
                    {lesson.transcript.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleTranscriptClick(item.start)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                index === activeTranscriptIndex
                                ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-100'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 block mb-1">{formatTime(item.start)}</span>
                            <p className="leading-snug">{item.text}</p>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t-2 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl">
            <button
              onClick={() => onComplete(lesson.id)}
              className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Complete Lesson
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoLesson;