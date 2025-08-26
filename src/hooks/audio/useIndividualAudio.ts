
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
  isAutoAdvanceReplay?: boolean; // NEW: Flag to distinguish auto-advance from manual replay
}

export function useIndividualAudio({
  lesson,
  isPlaying,
  onTogglePlay,
  onComplete,
  onProgressUpdate,
  onPlayStateChange,
  savedProgress,
  isAutoAdvanceReplay = false // NEW: Default to manual replay
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
    isAutoAdvanceReplay, // NEW: Log the replay type
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
        
        // FIXED: Distinguish between auto-advance and manual replay for completed lessons
        if (savedProgress?.is_completed) {
          if (isAutoAdvanceReplay) {
            console.log("⏭️ Auto-advance replay - will start near end for quick completion");
            setCurrentTime(0); // Will be set properly in metadata handler
          } else {
            console.log("🔁 Manual replay - will start from beginning for full playback");
            audio.currentTime = 0;
            setCurrentTime(0);
          }
        } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
          console.log("📍 Partial progress lesson - will set position after metadata");
          setCurrentTime(0);
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
    isInitialized.current = true;
  }, [lesson.id, savedProgress?.current_position, savedProgress?.is_completed, volume, isMuted, playbackRate, isAutoAdvanceReplay]);

  // Direct play/pause control for immediate response
  const handleDirectToggle = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const newPlayingState = !actualIsPlaying;

    console.log('🎵 Direct toggle:', lesson.title, 'new state:', newPlayingState);

    if (newPlayingState) {
      // FIXED: Only start near end for auto-advance replays of completed lessons
      if (savedProgress?.is_completed && isAutoAdvanceReplay && audio.duration > 0) {
        const nearEndTime = Math.max(0, audio.duration - 2); // 2 seconds from end
        console.log('⏭️ Auto-advance replay - starting near end for quick completion:', nearEndTime);
        audio.currentTime = nearEndTime;
        setCurrentTime(nearEndTime);
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
        
        // FIXED: Only start near end for auto-advance replays of completed lessons
        if (savedProgress?.is_completed && isAutoAdvanceReplay && audio.duration > 0) {
          const nearEndTime = Math.max(0, audio.duration - 2); // 2 seconds from end
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

  // Handle metadata loaded
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded for", lesson.title, "duration:", newDuration, "savedProgress:", savedProgress);
      setDuration(newDuration);
      
      // FIXED: Set initial position based on saved progress and replay type
      if (savedProgress?.is_completed) {
        if (isAutoAdvanceReplay) {
          const nearEndTime = Math.max(0, newDuration - 2); // 2 seconds from end for auto-advance
          console.log("⏭️ Auto-advance replay - setting near end position:", nearEndTime);
          setCurrentTime(nearEndTime);
          audioRef.current.currentTime = nearEndTime;
        } else {
          console.log("🔁 Manual replay - starting from beginning for full playback");
          setCurrentTime(0);
          audioRef.current.currentTime = 0;
        }
      } else if (savedProgress?.current_position && savedProgress.current_position > 0) {
        const savedTime = (savedProgress.current_position / 100) * newDuration;
        console.log("📍 Setting partial progress to:", savedTime, "seconds");
        setCurrentTime(savedTime);
        audioRef.current.currentTime = savedTime;
      }
    }
  }, [lesson.title, savedProgress, isAutoAdvanceReplay]);

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

  // FIXED: Show real-time progress during active playback, even for completed lessons
  const effectiveCurrentTime = () => {
    // CRITICAL FIX: During active playback, ALWAYS show real currentTime
    if (actualIsPlaying) {
      console.log("🔄 Active playback - showing real-time progress:", currentTime);
      return currentTime;
    }
    
    // Only show 100% when NOT playing AND lesson is completed
    if (savedProgress?.is_completed && !actualIsPlaying) {
      const effectiveDuration = duration || lesson.duracion;
      if (effectiveDuration > 0) {
        console.log("✅ Completed lesson (not playing) - showing 100% progress");
        return effectiveDuration;
      }
    }
    
    // For all other cases (partial progress, new lessons), show current time
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
    isTransitioning: false, // Simplified - no more transitions
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
    endTransition: () => {} // No-op for backward compatibility
  };
}
