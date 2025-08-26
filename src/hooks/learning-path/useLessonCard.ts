
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

  // Handle audio state changes for current lesson
  const handlePlayStateChange = useCallback((newIsPlaying: boolean) => {
    console.log('🔄 Audio state changed for:', lesson.title, 'new state:', newIsPlaying);
    if (isCurrent) {
      setLocalIsPlaying(newIsPlaying);
    }
  }, [isCurrent, lesson.title]);

  // Use individual audio management
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

    // Current lesson - handle play/pause directly
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

  // SIMPLIFIED: Always use audio hook data - it handles completed lessons internally
  const currentTime = audioHook.currentTime;
  const duration = audioHook.duration;
  
  // Use actual audio state for current lesson
  const effectiveIsPlaying = isCurrent ? (audioHook.actualIsPlaying || localIsPlaying) : false;

  return {
    isPlaying: effectiveIsPlaying,
    currentTime,
    duration,
    playbackRate: audioHook.playbackRate,
    volume: audioHook.volume,
    isMuted: audioHook.isMuted,
    isTransitioning: false, // Simplified - no more transitions
    handlePlayPause: handleTogglePlay,
    handleSeek: audioHook.handleSeek,
    handleSkipBackward: audioHook.handleSkipBackward,
    handleSkipForward: audioHook.handleSkipForward,
    handlePlaybackRateChange: audioHook.handlePlaybackRateChange,
    handleVolumeChange: audioHook.handleVolumeChange,
    toggleMute: audioHook.toggleMute,
    formatTime,
    // Audio element and handlers for the current lesson
    audioRef: isCurrent ? audioHook.audioRef : null,
    handleMetadata: audioHook.handleMetadata,
    updateTime: audioHook.updateTime,
    handleAudioEnded: audioHook.handleAudioEnded
  };
}
