
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Lesson, Podcast } from '@/types';
import { useUserLessonProgress } from '@/hooks/useUserLessonProgress';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';

interface AudioPlayerState {
  // Core playback state
  currentLesson: Lesson | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  
  // Audio settings
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  
  // Loading states
  isLoading: boolean;
  isReady: boolean;
  hasError: boolean;
  
  // Course data
  currentPodcast: Podcast | null;
}

interface AudioPlayerActions {
  // Lesson control
  selectLesson: (lesson: Lesson, podcast: Podcast, shouldAutoPlay?: boolean) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  
  // Audio settings
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;
  
  // Progress handling
  onProgressUpdate: (time: number) => void;
  onLessonComplete: () => void;
}

type AudioPlayerContextType = AudioPlayerState & AudioPlayerActions;

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { markLessonComplete, updateLessonPosition } = useUserLessonProgress();
  const { updateCourseProgress } = useUserProgress();
  
  // Audio element ref
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Core state
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Audio settings
  const [volume, setVolumeState] = useState(1);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Progress tracking
  const lastUpdateTime = useRef(0);
  
  const selectLesson = useCallback((lesson: Lesson, podcast: Podcast, shouldAutoPlay = false) => {
    console.log('🎵 AudioPlayer: Selecting lesson:', lesson.title);
    
    setCurrentLesson(lesson);
    setCurrentPodcast(podcast);
    setIsLoading(true);
    setHasError(false);
    setIsReady(false);
    
    if (audioRef.current) {
      audioRef.current.src = lesson.urlAudio;
      audioRef.current.load();
      
      if (shouldAutoPlay) {
        setIsPlaying(true);
      }
    }
  }, []);
  
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentLesson) return;
    
    console.log('🎵 AudioPlayer: Toggle play:', !isPlaying);
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentLesson]);
  
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);
  
  const skipForward = useCallback((seconds = 15) => {
    if (audioRef.current) {
      const newTime = Math.min(duration, currentTime + seconds);
      seekTo(newTime);
    }
  }, [currentTime, duration, seekTo]);
  
  const skipBackward = useCallback((seconds = 15) => {
    if (audioRef.current) {
      const newTime = Math.max(0, currentTime - seconds);
      seekTo(newTime);
    }
  }, [currentTime, seekTo]);
  
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);
  
  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);
  
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  }, [isMuted]);
  
  const onProgressUpdate = useCallback((time: number) => {
    if (!currentLesson || !currentPodcast || !user) return;
    
    const now = Date.now();
    if (now - lastUpdateTime.current < 2000) return; // Throttle updates
    lastUpdateTime.current = now;
    
    if (time > 5) {
      console.log('📊 AudioPlayer: Progress update:', currentLesson.title, time.toFixed(1) + '%');
      updateLessonPosition(currentLesson.id, currentPodcast.id, time);
    }
  }, [currentLesson, currentPodcast, user, updateLessonPosition]);
  
  const onLessonComplete = useCallback(() => {
    if (!currentLesson || !currentPodcast || !user) return;
    
    console.log('✅ AudioPlayer: Lesson completed:', currentLesson.title);
    
    // Mark lesson as complete
    markLessonComplete(currentLesson.id, currentPodcast.id);
    updateLessonPosition(currentLesson.id, currentPodcast.id, duration);
    
    // Check if we should auto-advance
    const currentIndex = currentPodcast.lessons.findIndex(l => l.id === currentLesson.id);
    const nextLesson = currentPodcast.lessons[currentIndex + 1];
    
    if (nextLesson && !nextLesson.isLocked) {
      console.log('⏭️ AudioPlayer: Auto-advancing to next lesson:', nextLesson.title);
      selectLesson(nextLesson, currentPodcast, true);
    } else {
      console.log('🏁 AudioPlayer: Course completed or no more lessons');
      setIsPlaying(false);
      
      // Check if course is completed
      const allCompleted = currentPodcast.lessons.every(lesson => lesson.isCompleted);
      if (allCompleted) {
        updateCourseProgress(currentPodcast.id, { progress_percentage: 100 });
      }
    }
  }, [currentLesson, currentPodcast, user, duration, markLessonComplete, updateLessonPosition, updateCourseProgress, selectLesson]);
  
  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsReady(true);
      setIsLoading(false);
      setHasError(false);
      console.log('🎵 AudioPlayer: Metadata loaded');
    }
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      onProgressUpdate(time);
    }
  };
  
  const handleEnded = () => {
    console.log('🎵 AudioPlayer: Audio ended');
    onLessonComplete();
  };
  
  const handleError = () => {
    console.error('🚨 AudioPlayer: Audio error');
    setHasError(true);
    setIsLoading(false);
    setIsReady(false);
    setIsPlaying(false);
  };
  
  const handleCanPlay = () => {
    setIsReady(true);
    setIsLoading(false);
  };
  
  // Sync playing state with audio element
  useEffect(() => {
    if (!audioRef.current || !isReady) return;
    
    const audio = audioRef.current;
    
    if (isPlaying && audio.paused) {
      console.log('▶️ AudioPlayer: Starting playback');
      audio.play().catch(error => {
        console.error('🚨 Play failed:', error);
        setHasError(true);
        setIsPlaying(false);
      });
    } else if (!isPlaying && !audio.paused) {
      console.log('⏸️ AudioPlayer: Pausing playback');
      audio.pause();
    }
  }, [isPlaying, isReady]);
  
  const contextValue: AudioPlayerContextType = {
    // State
    currentLesson,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    isLoading,
    isReady,
    hasError,
    currentPodcast,
    
    // Actions
    selectLesson,
    togglePlay,
    seekTo,
    skipForward,
    skipBackward,
    setVolume,
    setPlaybackRate,
    toggleMute,
    onProgressUpdate,
    onLessonComplete
  };
  
  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {/* Single global audio element */}
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        onCanPlay={handleCanPlay}
        preload="metadata"
      />
      {children}
    </AudioPlayerContext.Provider>
  );
};
