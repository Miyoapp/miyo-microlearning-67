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
  
  // FIXED: Prevent reset during auto-advance transitions
  const [wasCompletedBeforeChange, setWasCompletedBeforeChange] = useState(false);
  const [isAutoAdvanceTransition, setIsAutoAdvanceTransition] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastPlayingState = useRef(isPlaying);
  const lastLessonId = useRef(lesson.id);

  console.log('🎵 useIndividualAudio for lesson:', lesson.title, {
    isPlaying,
    actualIsPlaying,
    currentTime,
    duration,
    playbackRate,
    isCompleted: lesson.isCompleted,
    localIsCompleted: isCompleted,
    savedProgress,
    wasCompletedBeforeChange,
    isAutoAdvanceTransition
  });

  // FIXED: Detect auto-advance transitions and preserve completion state
  useEffect(() => {
    // Check if lesson changed
    if (lastLessonId.current !== lesson.id) {
      console.log("🔄 Lesson change detected:", lastLessonId.current, "->", lesson.id);
      
      // Store current completion state before change
      setWasCompletedBeforeChange(isCompleted);
      
      // Detect if this is an auto-advance transition (previous lesson was completed and playing)
      const wasAutoAdvance = isCompleted && actualIsPlaying;
      setIsAutoAdvanceTransition(wasAutoAdvance);
      
      console.log("🔄 Transition analysis:", {
        wasCompleted: isCompleted,
        wasPlaying: actualIsPlaying,
        isAutoAdvance: wasAutoAdvance
      });
      
      lastLessonId.current = lesson.id;
    }
  }, [lesson.id, isCompleted, actualIsPlaying]);

  // FIXED: Initialize state correctly without resetting completion during auto-advance
  useEffect(() => {
    if (audioRef.current) {
      console.log("🎵 Initializing audio for lesson:", lesson.title, "savedProgress:", savedProgress);
      const audio = audioRef.current;
      
      // FIXED: Don't reset completion during auto-advance transitions
      if (!isAutoAdvanceTransition) {
        // Normal initialization - use saved progress
        const shouldShowCompleted = savedProgress?.is_completed || false;
        setIsCompleted(shouldShowCompleted);
        console.log("✅ Normal init - set completion to:", shouldShowCompleted);
      } else {
        // Auto-advance transition - preserve previous lesson's completion visually
        // But use new lesson's actual completion state for logic
        const newLessonCompleted = savedProgress?.is_completed || false;
        setIsCompleted(newLessonCompleted);
        console.log("🔄 Auto-advance init - set completion to:", newLessonCompleted);
        
        // Reset the flag after handling
        setIsAutoAdvanceTransition(false);
      }
      
      // Initialize currentTime and audio position
      if (savedProgress?.is_completed) {
        console.log("✅ Completed lesson loaded, showing 100%");
        setCurrentTime(0); // Will be set to duration after metadata loads
      } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
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
  }, [lesson.id, savedProgress?.current_position, savedProgress?.is_completed, isAutoAdvanceTransition]);

  // FIXED: Improved handleDirectToggle - preserve auto-advance capability
  const handleDirectToggle = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const newPlayingState = !actualIsPlaying;

    console.log('🎵 Direct toggle:', lesson.title, 'new state:', newPlayingState, {
      isCompleted,
      currentTime,
      duration,
      savedProgressCompleted: savedProgress?.is_completed
    });

    if (newPlayingState) {
      // FIXED: Don't automatically reset completion - be smarter about it
      // Only reset if this is truly a replay from start, not a completed lesson continuing
      const isReallyReplayingFromStart = audio.currentTime < 5 && !savedProgress?.is_completed;
      
      if (isReallyReplayingFromStart) {
        console.log("🔄 Resetting completion - true replay from start");
        setIsCompleted(false);
      } else {
        console.log("▶️ Preserving completion state - continuing completed lesson or mid-play");
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
  }, [actualIsPlaying, lesson.title, onPlayStateChange, duration, isCompleted, savedProgress?.is_completed]);

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
        
        // FIXED: Same logic as handleDirectToggle
        const isReallyReplayingFromStart = audio.currentTime < 5 && !savedProgress?.is_completed;
        
        if (isReallyReplayingFromStart) {
          setIsCompleted(false);
        }
        
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
  }, [isPlaying, lesson.id, lesson.title, actualIsPlaying, onPlayStateChange, duration, savedProgress?.is_completed]);

  // Listen to actual audio events to track real state
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

  // FIXED: Improved time update - show correct progress for completed vs active lessons
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      
      if (actualIsPlaying) {
        setCurrentTime(newCurrentTime);
        
        if (onProgressUpdate) {
          const progressPercent = (newCurrentTime / duration) * 100;
          console.log('📊 Updating progress during playback:', lesson.title, 'progress:', progressPercent.toFixed(1) + '%');
          onProgressUpdate(progressPercent);
        }
      } else {
        // FIXED: For completed lessons that are not playing, show full duration
        // For paused lessons, show actual current time
        if (isCompleted && !actualIsPlaying) {
          setCurrentTime(duration);
        } else {
          setCurrentTime(newCurrentTime);
        }
      }
    }
  }, [duration, lesson.title, onProgressUpdate, actualIsPlaying, isCompleted]);

  // Handle metadata loaded - set initial position correctly
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded for", lesson.title, "duration:", newDuration, "savedProgress:", savedProgress);
      setDuration(newDuration);
      
      // Set initial position based on saved progress
      if (savedProgress?.is_completed) {
        console.log("✅ Completed lesson loaded, setting to end");
        setCurrentTime(newDuration);
        audioRef.current.currentTime = newDuration;
      } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
        const savedTime = (savedProgress.current_position / 100) * newDuration;
        console.log("📍 Setting partial progress to:", savedTime, "seconds (", savedProgress.current_position + "%)");
        setCurrentTime(savedTime);
        audioRef.current.currentTime = savedTime;
      }
    }
  }, [lesson.title, savedProgress]);

  // FIXED: Improved handleAudioEnded - ensure auto-advance works for all cases
  const handleAudioEnded = useCallback(() => {
    console.log("🏁 Audio ended for lesson:", lesson.title, {
      wasOriginallyCompleted: savedProgress?.is_completed,
      currentlyCompleted: isCompleted
    });
    
    setActualIsPlaying(false);
    if (onPlayStateChange) {
      onPlayStateChange(false);
    }
    
    // Mark as completed and set to end
    setIsCompleted(true);
    setCurrentTime(duration);
    
    // FIXED: Call progress update first, then onComplete for auto-advance
    if (onProgressUpdate) {
      console.log("🎯 Calling onProgressUpdate(100) before onComplete for:", lesson.title);
      onProgressUpdate(100);
    }
    
    // FIXED: Always call onComplete for auto-advance - whether first completion or replay
    console.log("🏁 Calling onComplete for auto-advance:", lesson.title);
    setTimeout(() => {
      onComplete();
    }, 100);
    
  }, [lesson.title, duration, onComplete, onPlayStateChange, onProgressUpdate, savedProgress?.is_completed, isCompleted]);

  // Handle seek - allow seeking anywhere
  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      console.log('🎯 Seeking to position:', value, 'for lesson:', lesson.title);
      
      // Reset completion state when seeking away from the end
      if (value < duration * 0.95) {
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
      if (newTime < duration * 0.95) {
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
    handleSeek: useCallback((value: number) => {
      if (audioRef.current) {
        console.log('🎯 Seeking to position:', value, 'for lesson:', lesson.title);
        
        if (value < duration * 0.95) {
          setIsCompleted(false);
        }
        
        setCurrentTime(value);
        audioRef.current.currentTime = value;
        
        if (onProgressUpdate && duration > 0 && actualIsPlaying) {
          const progressPercent = (value / duration) * 100;
          console.log('📊 Updating seek progress during playback:', progressPercent.toFixed(1) + '%');
          onProgressUpdate(progressPercent);
        }
      }
    }, [duration, lesson.title, onProgressUpdate, actualIsPlaying]),
    handleSkipBackward: useCallback(() => {
      if (audioRef.current) {
        console.log('⏪ Skip backward for lesson:', lesson.title);
        const newTime = Math.max(0, audioRef.current.currentTime - 15);
        
        if (newTime < duration * 0.95) {
          setIsCompleted(false);
        }
        
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }, [lesson.title, duration]),
    handleSkipForward: useCallback(() => {
      if (audioRef.current) {
        console.log('⏩ Skip forward for lesson:', lesson.title);
        const newTime = Math.min(duration, audioRef.current.currentTime + 15);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }, [duration, lesson.title]),
    handleVolumeChange: useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      setVolume(value);
      setIsMuted(value === 0);
    }, []),
    toggleMute: useCallback(() => {
      setIsMuted(prev => !prev);
    }, []),
    handlePlaybackRateChange: useCallback((rate: number) => {
      console.log("🎛️ Changing playback rate to", rate + "x", "for lesson:", lesson.title);
      setPlaybackRate(rate);
    }, [lesson.title]),
    handleMetadata: useCallback(() => {
      if (audioRef.current) {
        const newDuration = audioRef.current.duration;
        console.log("📋 Audio metadata loaded for", lesson.title, "duration:", newDuration, "savedProgress:", savedProgress);
        setDuration(newDuration);
        
        if (savedProgress?.is_completed) {
          console.log("✅ Completed lesson loaded, setting to end");
          setCurrentTime(newDuration);
          audioRef.current.currentTime = newDuration;
        } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
          const savedTime = (savedProgress.current_position / 100) * newDuration;
          console.log("📍 Setting partial progress to:", savedTime, "seconds (", savedProgress.current_position + "%)");
          setCurrentTime(savedTime);
          audioRef.current.currentTime = savedTime;
        }
      }
    }, [lesson.title, savedProgress]),
    updateTime,
    handleAudioEnded
  };
}
