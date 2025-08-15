
import { useCallback } from 'react';
import { Lesson } from '@/types';

interface UseLessonCardProps {
  lesson: Lesson;
  canPlay: boolean;
  isCurrent: boolean;
  isGloballyPlaying: boolean;
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
}

export function useLessonCard({ 
  lesson, 
  canPlay, 
  isCurrent, 
  isGloballyPlaying,
  onLessonClick 
}: UseLessonCardProps) {
  
  console.log('🎯🎯🎯 useLessonCard hook:', {
    lessonTitle: lesson.title,
    canPlay,
    isCurrent,
    isGloballyPlaying,
    timestamp: new Date().toLocaleTimeString()
  });

  // SIMPLIFIED: Only handle the play/pause button logic
  const handlePlayPause = useCallback(() => {
    console.log('🎵🎵🎵 LessonCard PLAY/PAUSE clicked:', {
      lessonTitle: lesson.title,
      canPlay,
      isCurrent,
      isGloballyPlaying,
      action: !canPlay ? 'BLOCKED' : !isCurrent ? 'SELECT_AND_PLAY' : isGloballyPlaying ? 'PAUSE' : 'PLAY'
    });
    
    if (!canPlay) {
      console.log('🚫 Cannot play lesson (locked):', lesson.title);
      return;
    }

    if (!isCurrent) {
      // If this lesson is not current, select it first (with auto-play)
      console.log('🎯🎯🎯 SELECTING non-current lesson with AUTO-PLAY:', lesson.title);
      onLessonClick(lesson, true);
      return;
    }

    // If this is the current lesson, toggle play/pause through global handler
    console.log('🎵🎵🎵 TOGGLING current lesson play state:', lesson.title, 'from', isGloballyPlaying, 'to', !isGloballyPlaying);
    onLessonClick(lesson, !isGloballyPlaying);
  }, [canPlay, isCurrent, isGloballyPlaying, onLessonClick, lesson]);

  // REMOVED: All local audio handling - we only use global state now
  // No local audio element, no seek handling, no skip functions
  // All audio control is handled by the global AudioPlayer

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate duration from lesson data
  const duration = lesson.duracion * 60; // Convert minutes to seconds
  
  return {
    // Use global state for playing status
    isPlaying: isCurrent && isGloballyPlaying,
    currentTime: 0, // We don't track individual progress in cards anymore
    duration,
    playbackRate: 1, // Default rate, actual rate controlled by global player
    handlePlayPause,
    // REMOVED: handleSeek, handleSkipBackward, handleSkipForward, handlePlaybackRateChange
    // These are now only available in the global AudioPlayer
    formatTime
  };
}
