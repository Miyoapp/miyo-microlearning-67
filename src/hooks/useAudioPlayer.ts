
import { useState, useCallback, useRef, useEffect } from 'react';
import { Lesson } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';

interface AudioPlayerState {
  currentLessonId: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isReady: boolean;
  error: boolean;
}

interface UseAudioPlayerProps {
  lessons?: Lesson[];
  onLessonComplete?: (lessonId: string) => void;
  onProgressUpdate?: (lessonId: string, position: number) => void;
}

export function useAudioPlayer({ lessons = [], onLessonComplete, onProgressUpdate }: UseAudioPlayerProps = {}) {
  const [state, setState] = useState<AudioPlayerState>({
    currentLessonId: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    isReady: false,
    error: false
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { lessonProgress, updateLessonPosition } = useUserLessonProgress();
  const progressUpdateTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get saved progress for a lesson
  const getSavedProgress = useCallback((lessonId: string) => {
    return lessonProgress.find(p => p.lesson_id === lessonId);
  }, [lessonProgress]);

  // Calculate display progress for a lesson
  const getDisplayProgress = useCallback((lessonId: string) => {
    const savedProgress = getSavedProgress(lessonId);
    const lesson = lessons.find(l => l.id === lessonId);
    const lessonDuration = lesson?.duracion || 0;
    
    // If this is the current lesson and it's playing, show real-time progress
    if (lessonId === state.currentLessonId && state.isPlaying) {
      return Math.min(state.currentTime, lessonDuration);
    }
    
    // If lesson is completed, show full duration
    if (savedProgress?.is_completed) {
      return lessonDuration;
    }
    
    // Show saved progress or 0
    return savedProgress?.current_position || 0;
  }, [state.currentLessonId, state.isPlaying, state.currentTime, getSavedProgress, lessons]);

  // Update audio time and handle progress
  const updateTime = useCallback(() => {
    if (!audioRef.current || !state.currentLessonId) return;
    
    const time = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 0;
    
    setState(prev => ({
      ...prev,
      currentTime: time,
      duration: duration
    }));

    // Throttled progress update
    if (progressUpdateTimeout.current) {
      clearTimeout(progressUpdateTimeout.current);
    }
    
    progressUpdateTimeout.current = setTimeout(() => {
      if (onProgressUpdate && state.currentLessonId) {
        onProgressUpdate(state.currentLessonId, time);
      }
    }, 1000);

    // Check for lesson completion (98% threshold to account for buffering)
    if (time >= duration * 0.98 && duration > 0) {
      handleLessonComplete();
    }
  }, [state.currentLessonId, onProgressUpdate]);

  // Handle lesson completion
  const handleLessonComplete = useCallback(() => {
    if (!state.currentLessonId) return;
    
    console.log('🎯 Audio player: Lesson completed:', state.currentLessonId);
    
    setState(prev => ({ ...prev, isPlaying: false }));
    
    if (onLessonComplete) {
      onLessonComplete(state.currentLessonId);
    }
  }, [state.currentLessonId, onLessonComplete]);

  // Play a lesson
  const play = useCallback(async (lesson: Lesson) => {
    console.log('▶️ Audio player: Playing lesson:', lesson.title);
    
    // If it's a different lesson, change the audio source
    if (!audioRef.current || state.currentLessonId !== lesson.id) {
      // Create or update audio element
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener('loadedmetadata', () => {
          setState(prev => ({
            ...prev,
            duration: audioRef.current?.duration || 0,
            isReady: true,
            error: false
          }));
        });
        audioRef.current.addEventListener('timeupdate', updateTime);
        audioRef.current.addEventListener('ended', handleLessonComplete);
        audioRef.current.addEventListener('error', () => {
          setState(prev => ({ ...prev, error: true, isPlaying: false }));
        });
      }
      
      audioRef.current.src = lesson.urlAudio;
      audioRef.current.load();
      
      setState(prev => ({
        ...prev,
        currentLessonId: lesson.id,
        currentTime: 0,
        duration: lesson.duracion || 0,
        isReady: false,
        error: false
      }));
    }
    
    try {
      await audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('🚨 Audio play failed:', error);
      setState(prev => ({ ...prev, error: true, isPlaying: false }));
    }
  }, [state.currentLessonId, updateTime, handleLessonComplete]);

  // Pause current lesson
  const pause = useCallback(() => {
    console.log('⏸️ Audio player: Pausing');
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Toggle play/pause for current lesson
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else if (audioRef.current && state.currentLessonId) {
      audioRef.current.play().catch(error => {
        console.error('🚨 Audio toggle play failed:', error);
        setState(prev => ({ ...prev, error: true }));
      });
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [state.isPlaying, state.currentLessonId, pause]);

  // Seek to specific time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  // Skip backward 15 seconds
  const skipBackward = useCallback(() => {
    const newTime = Math.max(0, state.currentTime - 15);
    seek(newTime);
  }, [state.currentTime, seek]);

  // Skip forward 15 seconds
  const skipForward = useCallback(() => {
    const newTime = Math.min(state.duration, state.currentTime + 15);
    seek(newTime);
  }, [state.currentTime, state.duration, seek]);

  // Set playback rate
  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  // Set muted state
  const setMuted = useCallback((muted: boolean) => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', updateTime);
        audioRef.current.removeEventListener('ended', handleLessonComplete);
        audioRef.current = null;
      }
      if (progressUpdateTimeout.current) {
        clearTimeout(progressUpdateTimeout.current);
      }
    };
  }, [updateTime, handleLessonComplete]);

  return {
    // State
    currentLessonId: state.currentLessonId,
    currentTime: state.currentTime,
    duration: state.duration,
    isPlaying: state.isPlaying,
    isReady: state.isReady,
    error: state.error,
    
    // Controls
    play,
    pause,
    togglePlay,
    seek,
    skipBackward,
    skipForward,
    setPlaybackRate,
    setVolume,
    setMuted,
    
    // Progress
    getDisplayProgress,
    getSavedProgress
  };
}
