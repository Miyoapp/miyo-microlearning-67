
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
}

export function useLessonCard({ 
  lesson, 
  canPlay, 
  isCurrent, 
  isPlaying,
  onLessonClick,
  onProgressUpdate,
  onLessonComplete
}: UseLessonCardProps) {
  console.log('🎵 useLessonCard for:', lesson.title, {
    canPlay,
    isCurrent,
    isPlaying
  });

  // Handle play/pause toggle
  const handleTogglePlay = useCallback(() => {
    console.log('🎵 handlePlayPause clicked for:', lesson.title, { canPlay, isCurrent, isPlaying });
    
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

    // If this is the current lesson, toggle play/pause
    console.log('🎵 Toggling current lesson:', lesson.title);
    onLessonClick(lesson, !isPlaying);
  }, [canPlay, isCurrent, isPlaying, onLessonClick, lesson]);

  // Handle lesson completion
  const handleComplete = useCallback(() => {
    console.log('🏁 Lesson completed:', lesson.title);
    if (onLessonComplete) {
      onLessonComplete();
    }
  }, [lesson.title, onLessonComplete]);

  // Use individual audio management when this is the current lesson and playing
  const shouldUseAudio = isCurrent && isPlaying;
  const audioHook = useIndividualAudio({
    lesson,
    isPlaying: shouldUseAudio,
    onTogglePlay: handleTogglePlay,
    onComplete: handleComplete,
    onProgressUpdate
  });

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Use audio data when current and playing, otherwise use lesson defaults
  const currentTime = shouldUseAudio ? audioHook.currentTime : 0;
  const duration = shouldUseAudio ? audioHook.duration : (lesson.duracion * 60);

  return {
    isPlaying: isCurrent && isPlaying,
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
