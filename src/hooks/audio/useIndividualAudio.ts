
import { useState, useRef, useEffect, useCallback } from 'react';
import { Lesson } from '@/types';
import { useTransitionState } from './useTransitionState';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastPlayingState = useRef(isPlaying);

  // NEW: Transition state management
  const { isTransitioning, preservedState, startTransition, endTransition } = useTransitionState();

  console.log('🎵 useIndividualAudio for lesson:', lesson.title, {
    isPlaying,
    actualIsPlaying,
    currentTime,
    duration,
    playbackRate,
    isTransitioning,
    preservedState,
    isCompleted: lesson.isCompleted,
    savedProgress
  });

  // Reset audio when lesson changes - IMPROVED: Handle transitions
  useEffect(() => {
    if (audioRef.current) {
      console.log("🎵 Initializing audio for lesson:", lesson.title, "savedProgress:", savedProgress);
      const audio = audioRef.current;
      
      // If we're transitioning and this is a new lesson, preserve state briefly
      if (!isTransitioning) {
        // FIXED: Initialize currentTime based on saved progress
        if (savedProgress?.is_completed) {
          console.log("✅ Lesson is completed, will set to 100% after metadata loads");
          setCurrentTime(0); // Will be set to duration after metadata loads
        } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
          const savedTimePercent = savedProgress.current_position / 100;
          console.log("📍 Lesson has partial progress:", savedProgress.current_position + "%");
          setCurrentTime(0); // Will be calculated after metadata loads
        } else {
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
    }
  }, [lesson.id, savedProgress?.current_position, savedProgress?.is_completed, isTransitioning]);

  // NEW: Direct play/pause control for immediate response
  const handleDirectToggle = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const newPlayingState = !actualIsPlaying;

    console.log('🎵 Direct toggle:', lesson.title, 'new state:', newPlayingState);

    if (newPlayingState) {
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

  // Update time and progress - FIXED: Always update progress during playback
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      setCurrentTime(newCurrentTime);
      
      // FIXED: Always update progress during active playback, regardless of completion status
      if (onProgressUpdate && actualIsPlaying) {
        const progressPercent = (newCurrentTime / duration) * 100;
        console.log('📊 Updating progress during playback:', lesson.title, 'progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson.title, onProgressUpdate, actualIsPlaying]);

  // Handle metadata loaded - FIXED: Initialize with saved progress after metadata loads
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded for", lesson.title, "duration:", newDuration, "savedProgress:", savedProgress);
      setDuration(newDuration);
      
      // FIXED: Set initial currentTime based on saved progress after metadata loads
      if (savedProgress?.is_completed) {
        // For completed lessons, show at 100%
        console.log("✅ Setting completed lesson to 100%");
        setCurrentTime(newDuration);
        audioRef.current.currentTime = newDuration;
      } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
        // For lessons with partial progress, calculate saved time
        const savedTime = (savedProgress.current_position / 100) * newDuration;
        console.log("📍 Setting partial progress to:", savedTime, "seconds (", savedProgress.current_position + "%)");
        setCurrentTime(savedTime);
        audioRef.current.currentTime = savedTime;
      }
    }
  }, [lesson.title, savedProgress]);

  // IMPROVED: Handle audio ended with better transition coordination
  const handleAudioEnded = useCallback(() => {
    console.log("🏁 Audio ended for lesson:", lesson.title, "isCompleted:", lesson.isCompleted);
    
    setActualIsPlaying(false);
    if (onPlayStateChange) {
      onPlayStateChange(false);
    }
    
    // IMPROVED: Preserve state for visual continuity during auto-advance
    const finalTime = duration;
    console.log("🎯 Audio ended - preserving 100% state for transition:", lesson.title);
    
    // Start transition to preserve visual state
    startTransition(finalTime, duration);
    
    // Update progress visual
    setCurrentTime(finalTime);
    
    // Ensure onProgressUpdate(100) is called BEFORE onComplete
    if (onProgressUpdate) {
      console.log("🎯 Calling onProgressUpdate(100) before onComplete for:", lesson.title);
      onProgressUpdate(100);
    }
    
    // IMPROVED: Reduced delay and better coordination
    setTimeout(() => {
      console.log("🏁 Now calling onComplete after progress update for:", lesson.title);
      onComplete();
      
      // End transition after a brief moment to allow UI update
      setTimeout(() => {
        endTransition();
      }, 300);
    }, 50);
    
  }, [lesson.title, duration, onComplete, onPlayStateChange, onProgressUpdate, startTransition, endTransition]);

  // Handle seek - FIXED: Always allow seeking and progress updates during playback
  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      console.log('🎯 Seeking to position:', value, 'for lesson:', lesson.title);
      setCurrentTime(value);
      audioRef.current.currentTime = value;
      
      // FIXED: Update progress when seeking during active playback
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
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [lesson.title]);

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

  // IMPROVED: Return preserved or current state based on transition
  const effectiveCurrentTime = isTransitioning && preservedState ? preservedState.currentTime : currentTime;
  const effectiveDuration = isTransitioning && preservedState ? preservedState.duration : duration;

  return {
    audioRef,
    currentTime: effectiveCurrentTime,
    duration: effectiveDuration,
    volume,
    isMuted,
    playbackRate,
    actualIsPlaying,
    isTransitioning,
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
