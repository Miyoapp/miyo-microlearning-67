
import { useState, useRef, useEffect, useCallback } from 'react';
import { Lesson } from '@/types';

interface UseLessonCardProps {
  lesson: Lesson;
  canPlay: boolean;
  isCurrent: boolean;
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
}

export function useLessonCard({ lesson, canPlay, isCurrent, onLessonClick }: UseLessonCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Create audio element for this lesson
  useEffect(() => {
    if (canPlay && lesson.urlAudio) {
      const audio = new Audio(lesson.urlAudio);
      audio.preload = 'metadata';
      audio.playbackRate = playbackRate;
      
      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        // Trigger lesson completion and auto-advance
        onLessonClick(lesson, false);
      });

      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
        audioRef.current = null;
      };
    }
  }, [lesson.urlAudio, canPlay, playbackRate, onLessonClick, lesson]);

  // Handle play/pause when this lesson becomes current
  useEffect(() => {
    if (audioRef.current) {
      if (isCurrent && isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isCurrent, isPlaying]);

  // Stop other players when this one starts
  useEffect(() => {
    if (isPlaying && isCurrent) {
      // Pause all other audio elements
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(audio => {
        if (audio !== audioRef.current) {
          audio.pause();
        }
      });
    }
  }, [isPlaying, isCurrent]);

  const handlePlayPause = useCallback(() => {
    if (!canPlay || !audioRef.current) return;

    if (!isCurrent) {
      // If this lesson is not current, select it first
      onLessonClick(lesson, true);
      return;
    }

    setIsPlaying(!isPlaying);
  }, [canPlay, isCurrent, isPlaying, onLessonClick, lesson]);

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
    isPlaying: isCurrent && isPlaying,
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
