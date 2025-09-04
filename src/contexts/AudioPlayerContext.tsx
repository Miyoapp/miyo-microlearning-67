
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Lesson, Podcast } from '@/types';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Pause position tracking
  pausedAt: number | null;
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
  
  // Callback for lesson completion
  setOnLessonCompletedCallback: (callback: (() => void) | null) => void;
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
  const { updateCourseProgress } = useUserProgress();
  
  // Audio element ref
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Callback for lesson completion - allows external refresh triggers
  const [onLessonCompletedCallback, setOnLessonCompletedCallback] = useState<(() => void) | null>(null);
  
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
  
  // Pause position tracking
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  
  // Progress tracking
  const lastUpdateTime = useRef(0);

  // Direct lesson progress functions
  const markLessonComplete = useCallback(async (lessonId: string, courseId: string) => {
    if (!user) return;

    try {
      console.log('🎯 Marking lesson complete:', lessonId);
      
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          is_completed: true,
          current_position: 100,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Error marking lesson complete:', error);
      } else {
        console.log('✅ Lesson marked complete successfully');
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  }, [user]);

  const updateLessonPosition = useCallback(async (lessonId: string, courseId: string, position: number) => {
    if (!user || position < 5) return; // Don't update for very small positions

    try {
      console.log('📍 Updating lesson position:', lessonId, position);
      
      const updates: any = {
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        current_position: Math.round(position),
        updated_at: new Date().toISOString()
      };

      // If position >= 100, mark as completed
      if (position >= 100) {
        updates.is_completed = true;
        updates.current_position = 100;
      }

      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert(updates, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Error updating lesson position:', error);
      }
    } catch (error) {
      console.error('Error updating lesson position:', error);
    }
  }, [user]);
  
  const selectLesson = useCallback(async (lesson: Lesson, podcast: Podcast, shouldAutoPlay = false) => {
    console.log('🎵 AudioPlayer: Selecting lesson:', lesson.title);
    
    // Avoid unnecessary reload if selecting the same lesson
    if (currentLesson?.id === lesson.id) {
      console.log('🎵 Same lesson already selected, just toggling play state');
      if (shouldAutoPlay && !isPlaying) {
        setIsPlaying(true);
      }
      return;
    }
    
    // Reset pause position when changing lessons
    setPausedAt(null);
    
    setCurrentLesson(lesson);
    setCurrentPodcast(podcast);
    setIsLoading(true);
    setHasError(false);
    setIsReady(false);
    
    // Fetch saved position from DB for lessons in progress
    if (user) {
      try {
        const { data: progress } = await supabase
          .from('user_lesson_progress')
          .select('current_position, is_completed')
          .eq('user_id', user.id)
          .eq('lesson_id', lesson.id)
          .maybeSingle();
        
        if (progress && !progress.is_completed && progress.current_position > 0) {
          setPausedAt(progress.current_position);
          console.log('🎵 Found saved position for lesson:', progress.current_position);
        }
      } catch (error) {
        console.error('Error fetching lesson progress:', error);
      }
    }
    
    if (audioRef.current) {
      audioRef.current.src = lesson.urlAudio;
      audioRef.current.load();
      
      if (shouldAutoPlay) {
        setIsPlaying(true);
      }
    }
  }, [currentLesson, isPlaying, user]);
  
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentLesson) return;
    
    console.log('🎵 AudioPlayer: Toggle play - Current state:', isPlaying);
    
    if (isPlaying) {
      // Save current position when pausing
      setPausedAt(audioRef.current.currentTime);
      console.log('⏸️ Saved pause position:', audioRef.current.currentTime);
    } else if (pausedAt !== null && audioRef.current.readyState >= 2) {
      // Restore position when resuming if we have a saved position
      audioRef.current.currentTime = pausedAt;
      console.log('▶️ Restored position from pause:', pausedAt);
      setPausedAt(null);
    }
    
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentLesson, pausedAt]);
  
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
      console.log('📊 AudioPlayer: Progress update:', currentLesson.title, time.toFixed(1) + 's');
      updateLessonPosition(currentLesson.id, currentPodcast.id, time);
    }
  }, [currentLesson, currentPodcast, user, updateLessonPosition]);
  
  const onLessonComplete = useCallback(async () => {
    if (!currentLesson || !currentPodcast || !user) return;
    
    console.log('✅ AudioPlayer: Lesson completed:', currentLesson.title);
    
    // Mark lesson as complete first
    await markLessonComplete(currentLesson.id, currentPodcast.id);
    
    // CRITICAL SEQUENCE: DB update -> Callback -> Auto-advance
    setTimeout(async () => {
      console.log('🔄 AudioPlayer: Starting DEFINITIVE post-completion sequence'); 
      
      // Step 1: Force refresh of lessons progress - WAIT for completion
      if (onLessonCompletedCallback) {
        console.log('🔄 AudioPlayer: Executing lessons refresh callback...');
        await onLessonCompletedCallback();
        console.log('✅ AudioPlayer: Lessons refresh callback completed');
      }
      
      // Step 2: LONGER delay to ensure complete database and UI sync
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Now proceed with auto-advance
      const currentIndex = currentPodcast.lessons.findIndex(l => l.id === currentLesson.id);
      const nextLesson = currentPodcast.lessons[currentIndex + 1];
      
      if (nextLesson) {
        console.log('🎯 AudioPlayer: Auto-advancing to next lesson:', nextLesson.title);
        selectLesson(nextLesson, currentPodcast, true);
      } else {
        console.log('🏁 AudioPlayer: Course completed!');
        setIsPlaying(false);
        updateCourseProgress(currentPodcast.id, { progress_percentage: 100 });
      }
    }, 1000); // INCREASED to 1000ms for complete synchronization
  }, [currentLesson, currentPodcast, user, markLessonComplete, updateCourseProgress, selectLesson, onLessonCompletedCallback]);
  
  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsReady(true);
      setIsLoading(false);
      setHasError(false);
      console.log('🎵 AudioPlayer: Metadata loaded');
      
      // Restore saved position if available
      if (pausedAt !== null && pausedAt > 0 && pausedAt < audioRef.current.duration) {
        audioRef.current.currentTime = pausedAt;
        console.log('🎵 Restored saved position:', pausedAt);
        setPausedAt(null);
      }
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
    pausedAt,
    
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
    onLessonComplete,
    setOnLessonCompletedCallback
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
