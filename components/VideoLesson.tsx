import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import { Lesson } from '../types';
import { ArrowLeftIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './icons';

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

  const progressIntervalRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying && player) {
      progressIntervalRef.current = window.setInterval(async () => {
        const currentTime = await player.getCurrentTime();
        setProgress(currentTime);
      }, 250);
    } else {
      clearProgressInterval();
    }
    return () => clearProgressInterval();
  }, [isPlaying, player]);

  const onReady = (event: { target: YouTubePlayer }) => {
    setPlayer(event.target);
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);
  };
  
  const onStateChange = (event: { data: number }) => {
    // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 1) { // Playing
        setIsPlaying(true);
    } else { // Paused, ended, etc.
        setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player || !duration) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = duration * percentage;
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
      if(isMuted) {
          player.unMute();
          setIsMuted(false);
      } else {
          player.mute();
          setIsMuted(true);
      }
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
      if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
         controlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 2000);
      }
  };

  const handleMouseMove = () => {
      setShowControls(true);
      hideControls();
  };

  if (!lesson.videoId) {
    return (
      <div className="flex flex-col h-full animate-fade-in">
         <div className="flex items-center mb-6">
            <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 mr-4">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
         </div>
        <p>Video not found for this lesson.</p>
      </div>
    );
  }

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      iv_load_policy: 3,
    },
  };
  
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center mb-6">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 mr-4">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
      </div>
      
      <div 
        className="flex-grow bg-black rounded-xl overflow-hidden mb-24 shadow-2xl ring-1 ring-slate-500/10 relative"
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