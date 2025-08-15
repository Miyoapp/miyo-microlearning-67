
import { useState, useRef, useEffect, useCallback } from 'react';
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  console.log('🎵 useLessonCard:', {
    lessonTitle: lesson.title,
    canPlay,
    isCurrent,
    isGloballyPlaying,
    hasAudio: !!audioRef.current
  });

  // Create audio element for this lesson
  useEffect(() => {
    if (canPlay && lesson.urlAudio) {
      console.log('🎵 Creating audio element for:', lesson.title);
      const audio = new Audio(lesson.urlAudio);
      audio.preload = 'metadata';
      audio.playbackRate = playbackRate;
      
      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        console.log('🎵 Audio metadata loaded for:', lesson.title, 'duration:', audio.duration);
        setDuration(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        console.log('🎵 Audio ended for:', lesson.title);
        setCurrentTime(0);
        // Trigger lesson completion through global handler
        onLessonClick(lesson, false);
      });

      audioRef.current = audio;

      return () => {
        console.log('🎵 Cleaning up audio for:', lesson.title);
        audio.pause();
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
        audioRef.current = null;
      };
    }
  }, [lesson.urlAudio, canPlay, playbackRate, onLessonClick, lesson]);

  // Handle play/pause when this lesson becomes current and global state changes
  useEffect(() => {
    if (audioRef.current && isCurrent) {
      console.log('🎵 Global playback state changed for current lesson:', lesson.title, 'playing:', isGloballyPlaying);
      if (isGloballyPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    } else if (audioRef.current && !isCurrent) {
      // Ensure non-current lessons are paused
      audioRef.current.pause();
    }
  }, [isCurrent, isGloballyPlaying, lesson.title]);

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

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const value = parseFloat(e.target.value);
    setCurrentTime(value);
    audioRef.current.currentTime = value;
  }, []);

  const handleSkipBackward = useCallback(() => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, audioRef.current.currentTime - 15);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const handleSkipForward = useCallback(() => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(duration, audioRef.current.currentTime + 15);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

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
