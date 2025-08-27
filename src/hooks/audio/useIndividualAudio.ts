
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
  isAutoAdvanceReplay?: boolean;
}

export function useIndividualAudio({
  lesson,
  isPlaying,
  onTogglePlay,
  onComplete,
  onProgressUpdate,
  onPlayStateChange,
  savedProgress,
  isAutoAdvanceReplay = false
}: UseIndividualAudioProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [actualIsPlaying, setActualIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastPlayingState = useRef(isPlaying);
  const lastLessonId = useRef(lesson.id);
  const isInitialized = useRef(false);

  console.log('🎵 useIndividualAudio for lesson:', lesson.title, {
    isPlaying,
    actualIsPlaying,
    currentTime,
    duration,
    playbackRate,
    isCompleted: savedProgress?.is_completed,
    isAutoAdvanceReplay,
    savedProgress
  });

  // Initialize lesson when it changes
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const isNewLesson = lastLessonId.current !== lesson.id;
      
      if (isNewLesson) {
        console.log("🔄 Lesson changed from", lastLessonId.current, "to", lesson.id);
        
        lastLessonId.current = lesson.id;
        
        // Always start from beginning for new lesson loads
        console.log("🆕 New lesson load - starting from beginning");
        audio.currentTime = 0;
        setCurrentTime(0);
        
        audio.volume = isMuted ? 0 : volume;
        audio.playbackRate = playbackRate;
        setDuration(0);
        setActualIsPlaying(false);
        
        audio.load();
      }
    }
    isInitialized.current = true;
  }, [lesson.id, volume, isMuted, playbackRate]);

  // Direct play/pause control for immediate response
  const handleDirectToggle = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const newPlayingState = !actualIsPlaying;

    console.log('🎵 Direct toggle:', lesson.title, 'new state:', newPlayingState);

    if (newPlayingState) {
      // FIXED: Only apply auto-advance logic when explicitly requested AND lesson is completed
      if (savedProgress?.is_completed && isAutoAdvanceReplay && audio.duration > 0) {
        const nearEndTime = Math.max(0, audio.duration - 2);
        console.log('⏭️ Auto-advance replay - starting near end for quick completion:', nearEndTime);
        audio.currentTime = nearEndTime;
        setCurrentTime(nearEndTime);
      }
      // For all other cases (manual replay, new lessons), start where audio is positioned
      
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
  }, [actualIsPlaying, lesson.title, onPlayStateChange, savedProgress?.is_completed, isAutoAdvanceReplay]);

  // Handle external play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !isInitialized.current) return;

    const audio = audioRef.current;
    const stateChanged = lastPlayingState.current !== isPlaying;
    lastPlayingState.current = isPlaying;

    if (stateChanged && isPlaying !== actualIsPlaying) {
      if (isPlaying) {
        console.log("▶️ External trigger: Playing audio for lesson:", lesson.title);
        
        // FIXED: Only apply auto-advance logic when explicitly requested AND lesson is completed
        if (savedProgress?.is_completed && isAutoAdvanceReplay && audio.duration > 0) {
          const nearEndTime = Math.max(0, audio.duration - 2);
          console.log('⏭️ External auto-advance replay - starting near end:', nearEndTime);
          audio.currentTime = nearEndTime;
          setCurrentTime(nearEndTime);
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
  }, [isPlaying, lesson.id, lesson.title, actualIsPlaying, onPlayStateChange, savedProgress?.is_completed, isAutoAdvanceReplay]);

  // Listen to actual audio events
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Update time during playback
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      setCurrentTime(newCurrentTime);
      
      // Always update progress during active playback
      if (onProgressUpdate && actualIsPlaying) {
        const progressPercent = (newCurrentTime / duration) * 100;
        console.log('📊 Updating progress during playback:', lesson.title, 'progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson.title, onProgressUpdate, actualIsPlaying]);

  // FIXED: Handle metadata loaded with correct initialization logic
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded for", lesson.title, "duration:", newDuration, "savedProgress:", savedProgress);
      setDuration(newDuration);
      
      // CRITICAL FIX: Correct initialization logic for different lesson states
      if (savedProgress?.is_completed) {
        // COMPLETED LESSONS: Initialize at 100% to show completion status
        console.log("✅ Completed lesson - initializing at 100% progress");
        setCurrentTime(newDuration);
        audioRef.current.currentTime = newDuration;
      } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
        // INCOMPLETE LESSONS: Restore saved progress
        const savedTime = (savedProgress.current_position / 100) * newDuration;
        console.log("📍 Incomplete lesson - restoring progress to:", savedTime, "seconds");
        setCurrentTime(savedTime);
        audioRef.current.currentTime = savedTime;
      } else {
        // NEW LESSONS: Start at beginning
        console.log("🆕 New lesson - starting at beginning");
        setCurrentTime(0);
        audioRef.current.currentTime = 0;
      }
    }
  }, [lesson.title, savedProgress]);

  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    console.log("🏁 Audio ended for lesson:", lesson.title);
    
    setActualIsPlaying(false);
    if (onPlayStateChange) {
      onPlayStateChange(false);
    }
    
    // Update visual state to 100%
    const finalTime = duration;
    setCurrentTime(finalTime);
    
    // Update progress to 100% before completion
    if (onProgressUpdate) {
      console.log("🎯 Setting progress to 100% before completion");
      onProgressUpdate(100);
    }
    
    // Trigger completion after a brief delay
    setTimeout(() => {
      console.log("🏁 Triggering lesson completion");
      onComplete();
    }, 100);
    
  }, [lesson.title, duration, onComplete, onPlayStateChange, onProgressUpdate]);

  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      console.log('🎯 Seeking to position:', value, 'for lesson:', lesson.title);
      setCurrentTime(value);
      audioRef.current.currentTime = value;
      
      if (onProgressUpdate && duration > 0 && actualIsPlaying) {
        const progressPercent = (value / duration) * 100;
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson.title, onProgressUpdate, actualIsPlaying]);

  const handleSkipBackward = useCallback(() => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [lesson.title]);

  const handleSkipForward = useCallback(() => {
    if (audioRef.current) {
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

  // FIXED: Standard player behavior - always show real currentTime during active use
  const effectiveCurrentTime = () => {
    // CRITICAL FIX: Always show real-time progress for standard player behavior
    // Only show completion state (100%) when audio is not actively being used
    if (!actualIsPlaying && savedProgress?.is_completed && currentTime >= duration - 1) {
      console.log("🏆 Showing completion state for completed lesson at rest");
      return duration;
    }
    
    console.log("🔄 Standard player - showing real-time progress:", currentTime);
    return currentTime;
  };
    
  const effectiveDuration = duration || lesson.duracion;

  return {
    audioRef,
    currentTime: effectiveCurrentTime(),
    duration: effectiveDuration,
    volume,
    isMuted,
    playbackRate,
    actualIsPlaying,
    isTransitioning: false,
    handleDirectToggle,
    handleSeek,
    handleSkipBackward,
    handleSkipForward,
    handleVolumeChange,
    toggleMute,
    handlePlaybackRateChange,
    handleMetadata,
    updateTime,
    handleAudioEnded,
    endTransition: () => {}
  };
}
