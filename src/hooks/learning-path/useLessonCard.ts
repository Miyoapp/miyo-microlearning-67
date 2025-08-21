
import { useState, useCallback, useEffect, useRef } from 'react';
import { Lesson } from '@/types';
import { useIndividualAudio } from '@/hooks/audio/useIndividualAudio';

interface UseLessonCardProps {
  lesson: Lesson;
  canPlay: boolean;
  isCurrent: boolean;
  isPlaying: boolean;
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
  savedProgress?: {
    current_position: number;
    is_completed: boolean;
  };
}

export function useLessonCard({ 
  lesson, 
  canPlay, 
  isCurrent, 
  isPlaying,
  onLessonClick,
  onProgressUpdate,
  onLessonComplete,
  savedProgress
}: UseLessonCardProps) {
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  
  // NEW: Add temporary completion state to preserve visual display
  const [temporaryIsCompleted, setTemporaryIsCompleted] = useState(false);
  const [showTemporaryCompletion, setShowTemporaryCompletion] = useState(false);
  const temporaryCompletionTimer = useRef<NodeJS.Timeout | null>(null);
  
  console.log('🎵 useLessonCard for:', lesson.title, {
    canPlay,
    isCurrent,
    isPlaying,
    localIsPlaying,
    savedProgress: savedProgress ? {
      current_position: savedProgress.current_position,
      is_completed: savedProgress.is_completed
    } : null,
    temporaryIsCompleted,
    showTemporaryCompletion
  });

  // Handle lesson completion with temporary state preservation
  const handleComplete = useCallback(() => {
    console.log('🏁 Lesson completed:', lesson.title);
    setLocalIsPlaying(false);
    
    // NEW: Set temporary completion state to preserve 100% visual display
    setTemporaryIsCompleted(true);
    setShowTemporaryCompletion(true);
    
    // Clear any existing timer
    if (temporaryCompletionTimer.current) {
      clearTimeout(temporaryCompletionTimer.current);
    }
    
    // Preserve temporary completion for 3 seconds to allow DB update
    temporaryCompletionTimer.current = setTimeout(() => {
      setShowTemporaryCompletion(false);
    }, 3000);
    
    if (onLessonComplete) {
      onLessonComplete();
    }
  }, [lesson.title, onLessonComplete]);

  // Clean up timer on unmount or lesson change
  useEffect(() => {
    return () => {
      if (temporaryCompletionTimer.current) {
        clearTimeout(temporaryCompletionTimer.current);
      }
    };
  }, [lesson.id]);

  // Reset temporary state when lesson changes
  useEffect(() => {
    setTemporaryIsCompleted(false);
    setShowTemporaryCompletion(false);
    if (temporaryCompletionTimer.current) {
      clearTimeout(temporaryCompletionTimer.current);
    }
  }, [lesson.id]);

  // Handle actual audio state changes for current lesson
  const handlePlayStateChange = useCallback((newIsPlaying: boolean) => {
    console.log('🔄 Audio state changed for:', lesson.title, 'new state:', newIsPlaying);
    if (isCurrent) {
      setLocalIsPlaying(newIsPlaying);
    }
  }, [isCurrent, lesson.title]);

  const shouldUseAudio = isCurrent;
  const audioHook = useIndividualAudio({
    lesson,
    isPlaying: isCurrent ? isPlaying : false,
    onTogglePlay: () => {
      console.log('🎵 Audio hook onTogglePlay called for:', lesson.title);
    },
    onComplete: useCallback(() => {
      console.log('🏁 Lesson completed:', lesson.title);
      setLocalIsPlaying(false);
      
      // NEW: Set temporary completion state
      setTemporaryIsCompleted(true);
      setShowTemporaryCompletion(true);
      
      if (temporaryCompletionTimer.current) {
        clearTimeout(temporaryCompletionTimer.current);
      }
      
      temporaryCompletionTimer.current = setTimeout(() => {
        setShowTemporaryCompletion(false);
      }, 3000);
      
      if (onLessonComplete) {
        onLessonComplete();
      }
    }, [lesson.title, onLessonComplete]),
    onProgressUpdate,
    onPlayStateChange: useCallback((newIsPlaying: boolean) => {
      console.log('🔄 Audio state changed for:', lesson.title, 'new state:', newIsPlaying);
      if (isCurrent) {
        setLocalIsPlaying(newIsPlaying);
      }
    }, [isCurrent, lesson.title]),
    savedProgress
  });

  // Handle play/pause with clear separation of concerns
  const handleTogglePlay = useCallback(() => {
    console.log('🎵 handleTogglePlay clicked for:', lesson.title, { canPlay, isCurrent, isPlaying, localIsPlaying });
    
    if (!canPlay) {
      console.log('🚫 Cannot play lesson:', lesson.title);
      return;
    }

    if (!isCurrent) {
      // Different lesson - select it with auto-play
      console.log('🎯 Selecting different lesson:', lesson.title);
      onLessonClick(lesson, true);
      return;
    }

    // CURRENT LESSON: Handle play/pause directly without going through global state
    console.log('🎵 Direct toggle for current lesson:', lesson.title);
    audioHook.handleDirectToggle();
    
  }, [canPlay, isCurrent, isPlaying, localIsPlaying, onLessonClick, lesson, audioHook]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // FIXED: Improved progress calculation with temporary completion state
  const currentTime = shouldUseAudio ? 
    audioHook.currentTime : 
    (
      // NEW: Check temporary completion first, then saved progress
      (showTemporaryCompletion && temporaryIsCompleted) ? (lesson.duracion * 60) :
      savedProgress?.is_completed ? (lesson.duracion * 60) : 
      savedProgress?.current_position ? (savedProgress.current_position / 100 * lesson.duracion * 60) : 0
    );
  
  const duration = shouldUseAudio ? audioHook.duration : (lesson.duracion * 60);
  
  const effectiveIsPlaying = isCurrent ? (audioHook.actualIsPlaying || localIsPlaying) : false;

  return {
    isPlaying: effectiveIsPlaying,
    currentTime,
    duration,
    playbackRate: audioHook.playbackRate,
    volume: audioHook.volume,
    isMuted: audioHook.isMuted,
    handlePlayPause: useCallback(() => {
      console.log('🎵 handleTogglePlay clicked for:', lesson.title, { canPlay, isCurrent, isPlaying, localIsPlaying });
      
      if (!canPlay) {
        console.log('🚫 Cannot play lesson:', lesson.title);
        return;
      }

      if (!isCurrent) {
        console.log('🎯 Selecting different lesson:', lesson.title);
        onLessonClick(lesson, true);
        return;
      }

      console.log('🎵 Direct toggle for current lesson:', lesson.title);
      audioHook.handleDirectToggle();
      
    }, [canPlay, isCurrent, isPlaying, localIsPlaying, onLessonClick, lesson, audioHook]),
    handleSeek: audioHook.handleSeek,
    handleSkipBackward: audioHook.handleSkipBackward,
    handleSkipForward: audioHook.handleSkipForward,
    handlePlaybackRateChange: audioHook.handlePlaybackRateChange,
    handleVolumeChange: audioHook.handleVolumeChange,
    toggleMute: audioHook.toggleMute,
    formatTime: useCallback((seconds: number) => {
      if (!seconds || isNaN(seconds)) return '0:00';
      
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []),
    audioRef: shouldUseAudio ? audioHook.audioRef : null,
    handleMetadata: audioHook.handleMetadata,
    updateTime: audioHook.updateTime,
    handleAudioEnded: audioHook.handleAudioEnded
  };
}
