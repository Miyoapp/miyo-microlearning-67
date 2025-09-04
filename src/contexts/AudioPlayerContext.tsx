
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
  
  // Saved positions cache for resumption
  const [savedPositions, setSavedPositions] = useState<Map<string, number>>(new Map());
  
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
    
    setCurrentLesson(lesson);
    setCurrentPodcast(podcast);
    setIsLoading(true);
    setHasError(false);
    setIsReady(false);
    
    // Load saved position for this lesson
    if (user) {
      try {
        const { data } = await supabase
          .from('user_lesson_progress')
          .select('current_position')
          .eq('user_id', user.id)
          .eq('lesson_id', lesson.id)
          .single();
        
        if (data?.current_position) {
          setSavedPositions(prev => new Map(prev).set(lesson.id, data.current_position));
          console.log('📍 Cached saved position for lesson:', lesson.title, data.current_position + 's');
        }
      } catch (error) {
        console.log('No saved position found for lesson:', lesson.title);
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
    
    // Simply toggle the playing state - don't call selectLesson
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
    if (audioRef.current && currentLesson) {
      setDuration(audioRef.current.duration);
      setIsReady(true);
      setIsLoading(false);
      setHasError(false);
      console.log('🎵 AudioPlayer: Metadata loaded');
      
      // Seek to saved position if available
      const savedPosition = savedPositions.get(currentLesson.id);
      if (savedPosition && savedPosition > 0 && savedPosition < audioRef.current.duration) {
        console.log('⏭️ Seeking to saved position:', savedPosition + 's');
        audioRef.current.currentTime = savedPosition;
        setCurrentTime(savedPosition);
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
