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
  const lastLessonId = useRef(lesson.id);
  const isInitialized = useRef(false);

  // Transition state management
  const { isTransitioning, preservedState, startTransition, endTransition, shouldPreserveState } = useTransitionState();

  console.log('🎵 useIndividualAudio for lesson:', lesson.title, {
    isPlaying,
    actualIsPlaying,
    currentTime,
    duration,
    playbackRate,
    isTransitioning,
    preservedState,
    isCompleted: savedProgress?.is_completed,
    savedProgress
  });

  // FIXED: Smart lesson change detection and state preservation
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const isNewLesson = lastLessonId.current !== lesson.id;
      
      if (isNewLesson) {
        console.log("🔄 Lesson changed from", lastLessonId.current, "to", lesson.id);
        lastLessonId.current = lesson.id;
        
        // If we're preserving state from a completed lesson, don't reset immediately
        if (!shouldPreserveState(lesson.id)) {
          console.log("🎵 Initializing new lesson:", lesson.title);
          
          // CRITICAL FIX: Always start completed lessons from beginning when replaying
          if (savedProgress?.is_completed) {
            console.log("✅ Completed lesson - starting from beginning for replay");
            audio.currentTime = 0;
            setCurrentTime(0);
          } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
            console.log("📍 Partial progress lesson - will set position after metadata");
            setCurrentTime(0); // Will be set after metadata loads
          } else {
            console.log("🆕 New lesson - starting from beginning");
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
    }
    isInitialized.current = true;
  }, [lesson.id, savedProgress?.current_position, savedProgress?.is_completed, shouldPreserveState, volume, isMuted, playbackRate]);

  // Direct play/pause control for immediate response
  const handleDirectToggle = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const newPlayingState = !actualIsPlaying;

    console.log('🎵 Direct toggle:', lesson.title, 'new state:', newPlayingState);

    if (newPlayingState) {
      // CRITICAL FIX: For completed lessons, always start from beginning
      if (savedProgress?.is_completed && audio.currentTime >= audio.duration - 1) {
        console.log('🔄 Completed lesson replay - resetting to start');
        audio.currentTime = 0;
        setCurrentTime(0);
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
  }, [actualIsPlaying, lesson.title, onPlayStateChange, savedProgress?.is_completed]);

  // Handle external play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !isInitialized.current) return;

    const audio = audioRef.current;
    const stateChanged = lastPlayingState.current !== isPlaying;
    lastPlayingState.current = isPlaying;

    if (stateChanged && isPlaying !== actualIsPlaying) {
      if (isPlaying) {
        console.log("▶️ External trigger: Playing audio for lesson:", lesson.title);
        
        // CRITICAL FIX: For completed lessons, start from beginning
        if (savedProgress?.is_completed && audio.currentTime >= audio.duration - 1) {
          console.log('🔄 External play of completed lesson - resetting to start');
          audio.currentTime = 0;
          setCurrentTime(0);
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
  }, [isPlaying, lesson.id, lesson.title, actualIsPlaying, onPlayStateChange, savedProgress?.is_completed]);

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

  // Handle playback rate changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // FIXED: Update time with transition awareness
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      
      // During transitions, don't update time to preserve visual state
      if (!isTransitioning) {
        setCurrentTime(newCurrentTime);
      }
      
      // Always update progress during active playback
      if (onProgressUpdate && actualIsPlaying) {
        const progressPercent = (newCurrentTime / duration) * 100;
        console.log('📊 Updating progress during playback:', lesson.title, 'progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson.title, onProgressUpdate, actualIsPlaying, isTransitioning]);

  // Handle metadata loaded
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded for", lesson.title, "duration:", newDuration, "savedProgress:", savedProgress);
      setDuration(newDuration);
      
      // Set initial position based on saved progress
      if (savedProgress?.current_position && savedProgress.current_position > 0 && !savedProgress.is_completed) {
        const savedTime = (savedProgress.current_position / 100) * newDuration;
        console.log("📍 Setting partial progress to:", savedTime, "seconds");
        setCurrentTime(savedTime);
        audioRef.current.currentTime = savedTime;
      }
    }
  }, [lesson.title, savedProgress]);

  // IMPROVED: Handle audio ended with better transition management
  const handleAudioEnded = useCallback(() => {
    console.log("🏁 Audio ended for lesson:", lesson.title);
    
    setActualIsPlaying(false);
    if (onPlayStateChange) {
      onPlayStateChange(false);
    }
    
    // CRITICAL: Start transition BEFORE updating states
    const finalTime = duration;
    console.log("🎯 Starting transition to preserve 100% state");
    startTransition(finalTime, duration, lesson.id);
    
    // Update visual state to 100%
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
    
  }, [lesson.title, duration, onComplete, onPlayStateChange, onProgressUpdate, startTransition, lesson.id]);

  // Handle seek
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

  // IMPROVED: Return effective state considering transitions
  const effectiveCurrentTime = isTransitioning && preservedState && preservedState.lessonId === lesson.id 
    ? preservedState.currentTime 
    : currentTime;
    
  const effectiveDuration = isTransitioning && preservedState && preservedState.lessonId === lesson.id
    ? preservedState.duration 
    : duration;

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
    handleAudioEnded,
    endTransition
  };
}
