import { useState, useRef, useEffect, useCallback } from 'react';
import { Lesson } from '@/types';

interface UseIndividualAudioProps {
  lesson: Lesson;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onComplete: () => void;
  onProgressUpdate?: (position: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  savedProgress?: {
    current_position: number;
    is_completed: boolean;
  };
}

export function useIndividualAudio({
  lesson,
  isPlaying,
  onTogglePlay,
  onComplete,
  onProgressUpdate,
  onPlayStateChange,
  savedProgress
}: UseIndividualAudioProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [actualIsPlaying, setActualIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastPlayingState = useRef(isPlaying);

  console.log('🎵 useIndividualAudio for lesson:', lesson.title, {
    isPlaying,
    actualIsPlaying,
    currentTime,
    duration,
    playbackRate,
    isCompleted: lesson.isCompleted,
    localIsCompleted: isCompleted,
    savedProgress
  });

  // Reset audio when lesson changes - FIXED: Always start fresh to allow replay
  useEffect(() => {
    if (audioRef.current) {
      console.log("🎵 Initializing audio for lesson:", lesson.title, "savedProgress:", savedProgress);
      const audio = audioRef.current;
      
      // FIXED: Always reset completion state to false to allow replay
      // This ensures completed lessons can be played again from 0%
      setIsCompleted(false);
      
      // FIXED: Initialize currentTime based on saved progress but don't lock it
      if (savedProgress?.is_completed) {
        // For completed lessons, start from 0 to allow replay
        console.log("✅ Lesson is completed, but starting fresh for replay");
        setCurrentTime(0);
        audio.currentTime = 0;
      } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
        // For lessons with partial progress, calculate saved time
        const savedTimePercent = savedProgress.current_position / 100;
        console.log("📍 Lesson has partial progress:", savedProgress.current_position + "%");
        setCurrentTime(0); // Will be calculated after metadata loads
      } else {
        // For new lessons, start from beginning
        console.log("🆕 New lesson, starting from 0");
        audio.currentTime = 0;
        setCurrentTime(0);
      }
      
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = playbackRate;
      setDuration(0);
      setActualIsPlaying(false);
      audio.load();
    }
  }, [lesson.id, savedProgress?.current_position, savedProgress?.is_completed]);

  // FIXED: Direct play/pause control - always allow replay
  const handleDirectToggle = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const newPlayingState = !actualIsPlaying;

    console.log('🎵 Direct toggle:', lesson.title, 'new state:', newPlayingState);

    if (newPlayingState) {
      // FIXED: Always reset completion state when starting playback
      // This allows completed lessons to be replayed properly
      setIsCompleted(false);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setActualIsPlaying(true);
          if (onPlayStateChange) {
            onPlayStateChange(true);
          }
        }).catch(error => {
          console.error("❌ Audio playback failed:", error);
          setActualIsPlaying(false);
          if (onPlayStateChange) {
            onPlayStateChange(false);
          }
        });
      }
    } else {
      audio.pause();
      setActualIsPlaying(false);
      if (onPlayStateChange) {
        onPlayStateChange(false);
      }
    }
  }, [actualIsPlaying, lesson.title, onPlayStateChange]);

  // Handle external play/pause state changes (from global state)
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const stateChanged = lastPlayingState.current !== isPlaying;
    lastPlayingState.current = isPlaying;

    // Only react to external changes, not our own direct changes
    if (stateChanged && isPlaying !== actualIsPlaying) {
      if (isPlaying) {
        console.log("▶️ External trigger: Playing audio for lesson:", lesson.title);
        // Reset completion state when starting playback
        setIsCompleted(false);
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setActualIsPlaying(true);
          }).catch(error => {
            console.error("❌ Audio playback failed:", error);
            setActualIsPlaying(false);
            if (onPlayStateChange) {
              onPlayStateChange(false);
            }
          });
        }
      } else {
        console.log("⏸️ External trigger: Pausing audio for lesson:", lesson.title);
        audio.pause();
        setActualIsPlaying(false);
      }
    }
  }, [isPlaying, lesson.id, lesson.title, actualIsPlaying, onPlayStateChange]);

  // NEW: Listen to actual audio events to track real state
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handlePlay = () => {
      console.log('🎵 Audio play event for:', lesson.title);
      setActualIsPlaying(true);
    };

    const handlePause = () => {
      console.log('⏸️ Audio pause event for:', lesson.title);
      setActualIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [lesson.title]);

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

  // FIXED: Update time - always reflect real audio progress
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      
      // FIXED: Always update currentTime with real audio progress
      // Never force it to duration based on completion state
      setCurrentTime(newCurrentTime);
      
      // Update progress during active playback
      if (onProgressUpdate && actualIsPlaying) {
        const progressPercent = (newCurrentTime / duration) * 100;
        console.log('📊 Updating progress during playback:', lesson.title, 'progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson.title, onProgressUpdate, actualIsPlaying]);

  // Handle metadata loaded - FIXED: Set initial position but don't lock currentTime
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded for", lesson.title, "duration:", newDuration, "savedProgress:", savedProgress);
      setDuration(newDuration);
      
      // Set initial position based on saved progress
      if (savedProgress?.is_completed) {
        // For completed lessons, show as completed initially but allow replay
        console.log("✅ Completed lesson loaded, showing 100% initially");
        setCurrentTime(newDuration);
        audioRef.current.currentTime = newDuration;
      } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
        // For lessons with partial progress, set saved position
        const savedTime = (savedProgress.current_position / 100) * newDuration;
        console.log("📍 Setting partial progress to:", savedTime, "seconds (", savedProgress.current_position + "%)");
        setCurrentTime(savedTime);
        audioRef.current.currentTime = savedTime;
      }
    }
  }, [lesson.title, savedProgress]);

  // Handle audio ended - mark as completed and call onComplete
  const handleAudioEnded = useCallback(() => {
    console.log("🏁 Audio ended for lesson:", lesson.title);
    
    setActualIsPlaying(false);
    if (onPlayStateChange) {
      onPlayStateChange(false);
    }
    
    // Mark as completed and set to end
    setIsCompleted(true);
    setCurrentTime(duration);
    
    // Ensure onProgressUpdate(100) is called BEFORE onComplete
    if (onProgressUpdate) {
      console.log("🎯 Calling onProgressUpdate(100) before onComplete for:", lesson.title);
      onProgressUpdate(100);
    }
    
    // Small delay to ensure DB update before onComplete
    setTimeout(() => {
      console.log("🏁 Now calling onComplete after progress update for:", lesson.title);
      onComplete();
    }, 100);
    
  }, [lesson.title, duration, onComplete, onPlayStateChange, onProgressUpdate]);

  // Handle seek - allow seeking anywhere
  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      console.log('🎯 Seeking to position:', value, 'for lesson:', lesson.title);
      
      // Reset completion state when seeking away from the end
      if (value < duration) {
        setIsCompleted(false);
      }
      
      setCurrentTime(value);
      audioRef.current.currentTime = value;
      
      // Update progress when seeking during active playback
      if (onProgressUpdate && duration > 0 && actualIsPlaying) {
        const progressPercent = (value / duration) * 100;
        console.log('📊 Updating seek progress during playback:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson.title, onProgressUpdate, actualIsPlaying]);

  const handleSkipBackward = useCallback(() => {
    if (audioRef.current) {
      console.log('⏪ Skip backward for lesson:', lesson.title);
      const newTime = Math.max(0, audioRef.current.currentTime - 15);
      
      // Reset completion state when skipping backward
      if (newTime < duration) {
        setIsCompleted(false);
      }
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [lesson.title, duration]);

  const handleSkipForward = useCallback(() => {
    if (audioRef.current) {
      console.log('⏩ Skip forward for lesson:', lesson.title);
      const newTime = Math.min(duration, audioRef.current.currentTime + 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration, lesson.title]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

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
    actualIsPlaying,
    handleDirectToggle,
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
