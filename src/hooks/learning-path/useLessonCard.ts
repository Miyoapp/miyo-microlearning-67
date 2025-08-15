
import { useState, useCallback } from 'react';
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
  const [playbackRate, setPlaybackRate] = useState(1);

  console.log('🎵 useLessonCard:', {
    lessonTitle: lesson.title,
    canPlay,
    isCurrent,
    isGloballyPlaying
  });

  // For display purposes - we'll get real values from global state later
  const currentTime = 0;
  const duration = lesson.duracion * 60; // Convert minutes to seconds

  const handlePlayPause = useCallback(() => {
    console.log('🎵 handlePlayPause clicked for:', lesson.title, { canPlay, isCurrent, isGloballyPlaying });
    
    if (!canPlay) {
      console.log('🚫 Cannot play lesson:', lesson.title);
      return;
    }

    if (!isCurrent) {
      // If this lesson is not current, select it with auto-play
      console.log('🎯 Selecting non-current lesson with auto-play:', lesson.title);
      onLessonClick(lesson, true);
      return;
    }

    // If this is the current lesson, toggle play/pause
    console.log('🎵 Toggling current lesson:', lesson.title, 'shouldPlay:', !isGloballyPlaying);
    onLessonClick(lesson, !isGloballyPlaying);
  }, [canPlay, isCurrent, isGloballyPlaying, onLessonClick, lesson]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // For now, just log - we'll need to communicate this to global state
    const value = parseFloat(e.target.value);
    console.log('🎯 Seek requested for:', lesson.title, 'to:', value);
    // TODO: Communicate seek to global audio player
  }, [lesson.title]);

  const handleSkipBackward = useCallback(() => {
    console.log('⏪ Skip backward requested for:', lesson.title);
    // TODO: Communicate skip backward to global audio player
  }, [lesson.title]);

  const handleSkipForward = useCallback(() => {
    console.log('⏩ Skip forward requested for:', lesson.title);
    // TODO: Communicate skip forward to global audio player
  }, [lesson.title]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    console.log('🎛️ Speed change requested for:', lesson.title, 'to:', rate + 'x');
    setPlaybackRate(rate);
    // TODO: Communicate speed change to global audio player
  }, [lesson.title]);

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Use global state for playing status
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
