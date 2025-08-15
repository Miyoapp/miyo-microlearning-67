
import { useState, useRef, useCallback, useEffect } from 'react';
import { Lesson } from '@/types';

interface UseLessonMiniPlayerProps {
  lesson: Lesson;
  isActive: boolean;
  onLessonComplete: () => void;
  onProgressUpdate: (position: number) => void;
}

export function useLessonMiniPlayer({ 
  lesson, 
  isActive, 
  onLessonComplete, 
  onProgressUpdate 
}: UseLessonMiniPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Pause audio when lesson becomes inactive
  useEffect(() => {
    if (!isActive && isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isActive, isPlaying]);

  // Update audio element playback state
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && isActive) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isActive]);

  const handleTogglePlay = useCallback(() => {
    if (!isActive) return;
    setIsPlaying(!isPlaying);
  }, [isActive, isPlaying]);

  const handleSeek = useCallback((value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  }, []);

  const handleSkipBack = useCallback(() => {
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

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    const dur = audioRef.current.duration || (lesson.duracion * 60);
    
    setCurrentTime(time);
    
    // Update progress
    const progressPercentage = (time / dur) * 100;
    onProgressUpdate(progressPercentage);
  }, [lesson.duracion, onProgressUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || (lesson.duracion * 60));
  }, [lesson.duracion]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(duration);
    onLessonComplete();
  }, [duration, onLessonComplete]);

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    handleTogglePlay,
    handleSeek,
    handleSkipBack,
    handleSkipForward,
    handleVolumeChange,
    handleToggleMute,
    handlePlaybackRateChange,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded
  };
}
