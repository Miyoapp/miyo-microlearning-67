
import { useState, useCallback } from 'react';
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
  
  console.log('🎵 useLessonCard for:', lesson.title, {
    canPlay,
    isCurrent,
    isPlaying,
    localIsPlaying,
    savedProgress: savedProgress ? {
      current_position: savedProgress.current_position,
      is_completed: savedProgress.is_completed
    } : null
  });

  // Handle lesson completion
  const handleComplete = useCallback(() => {
    console.log('🏁 Lesson completed:', lesson.title);
    setLocalIsPlaying(false);
    if (onLessonComplete) {
      onLessonComplete();
    }
  }, [lesson.title, onLessonComplete]);

  // Handle actual audio state changes for current lesson
  const handlePlayStateChange = useCallback((newIsPlaying: boolean) => {
    console.log('🔄 Audio state changed for:', lesson.title, 'new state:', newIsPlaying);
    if (isCurrent) {
      setLocalIsPlaying(newIsPlaying);
    }
  }, [isCurrent, lesson.title]);

  // Use individual audio management when this is the current lesson
  const shouldUseAudio = isCurrent;
  const audioHook = useIndividualAudio({
    lesson,
    isPlaying: isCurrent ? isPlaying : false,
    onTogglePlay: () => {
      console.log('🎵 Audio hook onTogglePlay called for:', lesson.title);
    },
    onComplete: handleComplete,
    onProgressUpdate,
    onPlayStateChange: handlePlayStateChange,
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

  // FIXED: Properly display progress for current vs non-current lessons
  const currentTime = shouldUseAudio ? 
    // For current lesson: use real audio time (which handles completion state correctly)
    audioHook.currentTime : 
    // For non-current lessons: display based on saved progress
    (savedProgress?.is_completed ? (lesson.duracion * 60) : 
     savedProgress?.current_position ? (savedProgress.current_position / 100 * lesson.duracion * 60) : 0);
  
  const duration = shouldUseAudio ? audioHook.duration : (lesson.duracion * 60);
  
  // Use actual audio state for current lesson, false for others
  const effectiveIsPlaying = isCurrent ? (audioHook.actualIsPlaying || localIsPlaying) : false;

  return {
    isPlaying: effectiveIsPlaying,
    currentTime,
    duration,
    playbackRate: audioHook.playbackRate,
    volume: audioHook.volume,
    isMuted: audioHook.isMuted,
    handlePlayPause: handleTogglePlay,
    handleSeek: audioHook.handleSeek,
    handleSkipBackward: audioHook.handleSkipBackward,
    handleSkipForward: audioHook.handleSkipForward,
    handlePlaybackRateChange: audioHook.handlePlaybackRateChange,
    handleVolumeChange: audioHook.handleVolumeChange,
    toggleMute: audioHook.toggleMute,
    formatTime,
    // Audio element and handlers for the current lesson
    audioRef: shouldUseAudio ? audioHook.audioRef : null,
    handleMetadata: audioHook.handleMetadata,
    updateTime: audioHook.updateTime,
    handleAudioEnded: audioHook.handleAudioEnded
  };
}
