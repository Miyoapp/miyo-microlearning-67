
import { useState, useRef, useEffect, useCallback } from 'react';
import { Lesson } from '@/types';

interface UseIndividualAudioProps {
  lesson: Lesson;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onComplete: () => void;
  onProgressUpdate?: (position: number) => void;
}

export function useIndividualAudio({
  lesson,
  isPlaying,
  onTogglePlay,
  onComplete,
  onProgressUpdate
}: UseIndividualAudioProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  console.log('🎵 useIndividualAudio for lesson:', lesson.title, {
    isPlaying,
    currentTime,
    duration,
    playbackRate
  });

  // Reset audio when lesson changes
  useEffect(() => {
    if (audioRef.current) {
      console.log("🎵 Initializing audio for lesson:", lesson.title);
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = playbackRate;
      setCurrentTime(0);
      setDuration(0);
      audio.load();
    }
  }, [lesson.id]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (isPlaying) {
      console.log("▶️ Playing audio for lesson:", lesson.title);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("❌ Audio playback failed:", error);
          onTogglePlay();
        });
      }
    } else {
      console.log("⏸️ Pausing audio for lesson:", lesson.title);
      audio.pause();
    }
  }, [isPlaying, lesson.id, onTogglePlay]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle playback rate changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Update time and progress
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      setCurrentTime(newCurrentTime);
      
      if (onProgressUpdate && !lesson.isCompleted) {
        const progressPercent = (newCurrentTime / duration) * 100;
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson.isCompleted, onProgressUpdate]);

  // Handle metadata loaded
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded for", lesson.title, "duration:", newDuration);
      setDuration(newDuration);
    }
  }, [lesson.title]);

  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    console.log("🏁 Audio ended for lesson:", lesson.title);
    setCurrentTime(0);
    onComplete();
  }, [lesson.title, onComplete]);

  // Handle seek
  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      console.log('🎯 Seeking to position:', value, 'for lesson:', lesson.title);
      setCurrentTime(value);
      audioRef.current.currentTime = value;
      
      if (onProgressUpdate && duration > 0 && !lesson.isCompleted) {
        const progressPercent = (value / duration) * 100;
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson.isCompleted, lesson.title, onProgressUpdate]);

  // Handle skip backward
  const handleSkipBackward = useCallback(() => {
    if (audioRef.current) {
      console.log('⏪ Skip backward for lesson:', lesson.title);
      const newTime = Math.max(0, audioRef.current.currentTime - 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [lesson.title]);

  // Handle skip forward
  const handleSkipForward = useCallback(() => {
    if (audioRef.current) {
      console.log('⏩ Skip forward for lesson:', lesson.title);
      const newTime = Math.min(duration, audioRef.current.currentTime + 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration, lesson.title]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate: number) => {
    console.log("🎛️ Changing playback rate to", rate + "x", "for lesson:", lesson.title);
    setPlaybackRate(rate);
  }, [lesson.title]);

  return {
    audioRef,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    handleSeek,
    handleSkipBackward,
    handleSkipForward,
    handleVolumeChange,
    toggleMute,
    handlePlaybackRateChange,
    handleMetadata,
    updateTime,
    handleAudioEnded
  };
}
