
import { useState, useCallback } from 'react';
import { Lesson } from '@/types';

interface UseLessonCardProps {
  lesson: Lesson;
  canPlay: boolean;
  isCurrent: boolean;
  isGloballyPlaying: boolean;
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  globalCurrentTime?: number;
  globalDuration?: number;
}

export function useLessonCard({ 
  lesson, 
  canPlay, 
  isCurrent, 
  isGloballyPlaying,
  onLessonClick,
  globalCurrentTime = 0,
  globalDuration = 0
}: UseLessonCardProps) {
  const [playbackRate, setPlaybackRate] = useState(1);

  console.log('🎵 useLessonCard (UI ONLY):', {
    lessonTitle: lesson.title,
    canPlay,
    isCurrent,
    isGloballyPlaying,
    globalCurrentTime,
    globalDuration
  });

  // Use global audio data when this is the current lesson, otherwise use lesson defaults
  const currentTime = isCurrent ? globalCurrentTime : 0;
  const duration = isCurrent ? globalDuration : (lesson.duracion * 60);

  const handlePlayPause = useCallback(() => {
    console.log('🎵 handlePlayPause clicked for:', lesson.title, { canPlay, isCurrent, isGloballyPlaying });
    
    if (!canPlay) {
      console.log('🚫 Cannot play lesson:', lesson.title);
      return;
    }

    if (!isCurrent) {
      // If this lesson is not current, select it first (with auto-play)
      console.log('🎯 Selecting non-current lesson:', lesson.title);
      onLessonClick(lesson, true);
      return;
    }

    // If this is the current lesson, toggle play/pause through global handler
    console.log('🎵 Toggling current lesson:', lesson.title);
    onLessonClick(lesson, !isGloballyPlaying);
  }, [canPlay, isCurrent, isGloballyPlaying, onLessonClick, lesson]);

  // These handlers will send commands to the global audio player
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isCurrent) return;
    
    const value = parseFloat(e.target.value);
    console.log('🎯 Seek command for current lesson:', lesson.title, 'to position:', value);
    // This will be handled by the global audio player through a callback
  }, [isCurrent, lesson.title]);

  const handleSkipBackward = useCallback(() => {
    if (!isCurrent) return;
    
    console.log('⏪ Skip backward command for current lesson:', lesson.title);
    // This will be handled by the global audio player through a callback
  }, [isCurrent, lesson.title]);

  const handleSkipForward = useCallback(() => {
    if (!isCurrent) return;
    
    console.log('⏩ Skip forward command for current lesson:', lesson.title);
    // This will be handled by the global audio player through a callback
  }, [isCurrent, lesson.title]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    console.log('🎛️ Speed change command for lesson:', lesson.title, 'to rate:', rate);
    setPlaybackRate(rate);
    // This will be handled by the global audio player through a callback
  }, [lesson.title]);

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Use global state for playing status when this is the current lesson
    isPlaying: isCurrent && isGloballyPlaying,
    currentTime,
    duration,
    playbackRate,
    handlePlayPause,
    handleSeek,
    handleSkipBackward,
    handleSkipForward,
    handlePlaybackRateChange,
    formatTime
  };
}
