
import { useCallback } from 'react';
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
  
  console.log('🎵 useLessonCard for:', lesson.title, {
    canPlay,
    isCurrent,
    isPlaying,
    savedProgress: savedProgress ? {
      current_position: savedProgress.current_position,
      is_completed: savedProgress.is_completed
    } : null
  });

  // Handle lesson completion
  const handleComplete = useCallback(() => {
    console.log('🏁 Lesson completed:', lesson.title);
    if (onLessonComplete) {
      onLessonComplete();
    }
  }, [lesson.title, onLessonComplete]);

  // UNIFIED: Simple play state handling - no local state
  const handlePlayStateChange = useCallback((newIsPlaying: boolean) => {
    console.log('🔄 Audio state changed for:', lesson.title, 'new state:', newIsPlaying);
    // Let the audio hook handle all state management
  }, [lesson.title]);

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

  // UNIFIED: Simple play/pause handling for all lessons
  const handleTogglePlay = useCallback(() => {
    console.log('🎵 handleTogglePlay clicked for:', lesson.title, { 
      canPlay, 
      isCurrent, 
      isPlaying, 
      actualIsPlaying: audioHook.actualIsPlaying
    });
    
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
    
  }, [canPlay, isCurrent, isPlaying, onLessonClick, lesson, audioHook]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // UNIFIED: Use audio hook data directly - no special logic
  const currentTime = audioHook.currentTime;
  const duration = audioHook.duration;
  
  // UNIFIED: Simple playing state - only actualIsPlaying from audio hook
  const effectiveIsPlaying = isCurrent ? audioHook.actualIsPlaying : false;

  return {
    isPlaying: effectiveIsPlaying,
    currentTime,
    duration,
    playbackRate: audioHook.playbackRate,
    volume: audioHook.volume,
    isMuted: audioHook.isMuted,
    isTransitioning: false,
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
