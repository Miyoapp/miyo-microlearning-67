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
  const [isCompleted, setIsCompleted] = useState(false); // Track completion state
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

  // Reset audio when lesson changes - FIXED: Don't reset completion state if lesson is already completed
  useEffect(() => {
    if (audioRef.current) {
      console.log("🎵 Initializing audio for lesson:", lesson.title, "savedProgress:", savedProgress);
      const audio = audioRef.current;
      
      // FIXED: Only reset completion state if the lesson is NOT already completed
      if (savedProgress?.is_completed) {
        // Lesson is completed - maintain completed state
        console.log("✅ Lesson is completed, maintaining completed state");
        setIsCompleted(true);
      } else {
        // Lesson is not completed - reset completion state for new lesson
        setIsCompleted(false);
      }
      
      // FIXED: Initialize currentTime based on saved progress
      if (savedProgress?.is_completed) {
        // For completed lessons, show 100% progress
        console.log("✅ Lesson is completed, will set to 100% after metadata loads");
        setCurrentTime(0); // Will be set to duration after metadata loads
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

  // NEW: Direct play/pause control for immediate response
  const handleDirectToggle = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const newPlayingState = !actualIsPlaying;

    console.log('🎵 Direct toggle:', lesson.title, 'new state:', newPlayingState);

    if (newPlayingState) {
      // When starting playback, reset completion state to allow normal progress tracking
      // ONLY if not already at the end
      if (duration > 0 && currentTime < duration) {
        setIsCompleted(false);
      }
      
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
  }, [actualIsPlaying, lesson.title, onPlayStateChange, duration, currentTime]);

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

  // Update time and progress - FIXED: Respect completion state for display
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      
      // FIXED: Only update currentTime if not completed OR if actively playing and not at the end
      if (!isCompleted || (actualIsPlaying && newCurrentTime < duration)) {
        setCurrentTime(newCurrentTime);
      } else if (isCompleted && !actualIsPlaying) {
        // Maintain currentTime at duration for completed lessons when not playing
        setCurrentTime(duration);
      }
      
      // FIXED: Always update progress during active playback, regardless of completion status
      if (onProgressUpdate && actualIsPlaying) {
        const progressPercent = (newCurrentTime / duration) * 100;
        console.log('📊 Updating progress during playback:', lesson.title, 'progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson.title, onProgressUpdate, actualIsPlaying, isCompleted]);

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
        setIsCompleted(true);
      } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
        // For lessons with partial progress, calculate saved time
        const savedTime = (savedProgress.current_position / 100) * newDuration;
        console.log("📍 Setting partial progress to:", savedTime, "seconds (", savedProgress.current_position + "%)");
        setCurrentTime(savedTime);
        audioRef.current.currentTime = savedTime;
      }
    }
  }, [lesson.title, savedProgress]);

  // Handle audio ended - FIXED: Ensure proper completion handling with persistent state
  const handleAudioEnded = useCallback(() => {
    console.log("🏁 Audio ended for lesson:", lesson.title, "isCompleted:", lesson.isCompleted);
    
    setActualIsPlaying(false);
    if (onPlayStateChange) {
      onPlayStateChange(false);
    }
    
    // FIXED: Mark as completed and maintain currentTime at duration
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

  // Handle seek - FIXED: Always allow seeking and progress updates during playback
  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      console.log('🎯 Seeking to position:', value, 'for lesson:', lesson.title);
      
      // Reset completion state when seeking away from the end during playback
      if (actualIsPlaying && value < duration) {
        setIsCompleted(false);
      }
      
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
