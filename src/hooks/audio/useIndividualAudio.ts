
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
  const [progress, setProgress] = useState(0); // ✅ SIMPLIFIED: Single progress state
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
    progress,
    duration,
    playbackRate,
    savedProgress
  });

  // ✅ FIXED: Initialize visual progress based on saved state
  useEffect(() => {
    if (savedProgress?.is_completed) {
      // ✅ Completed lessons show 100% on reload
      console.log("📊 Initializing completed lesson UI at 100%:", lesson.title);
      setProgress(100);
    } else if (savedProgress?.current_position >= 0) {
      console.log("📊 Initializing lesson progress:", lesson.title, "at", savedProgress.current_position + "%");
      setProgress(savedProgress.current_position);
    } else {
      console.log("📊 Initializing new lesson at 0%:", lesson.title);
      setProgress(0);
    }
  }, [lesson.id, savedProgress]);

  // Initialize lesson when it changes
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const isNewLesson = lastLessonId.current !== lesson.id;
      
      if (isNewLesson) {
        console.log("🔄 Lesson changed from", lastLessonId.current, "to", lesson.id);
        
        lastLessonId.current = lesson.id;
        
        // Reset audio settings
        audio.volume = isMuted ? 0 : volume;
        audio.playbackRate = playbackRate;
        setDuration(0);
        setActualIsPlaying(false);
        
        audio.load();
      }
    }
    isInitialized.current = true;
  }, [lesson.id, volume, isMuted, playbackRate]);

  // ✅ FIXED: Connect timeupdate event listener
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (duration > 0) {
        const newCurrentTime = audio.currentTime;
        const newProgress = (newCurrentTime / duration) * 100;
        
        setCurrentTime(newCurrentTime);
        
        // ✅ FIXED: Always update visual progress during playback
        if (actualIsPlaying) {
          console.log('📊 Updating visual progress during playback:', lesson.title, 'progress:', newProgress.toFixed(1) + '%');
          setProgress(newProgress);
          
          // Update database progress for non-completed lessons
          if (onProgressUpdate && newProgress < 100 && !savedProgress?.is_completed) {
            onProgressUpdate(newProgress);
          }
        }
      }
    };

    const handlePlay = () => {
      console.log('🎵 Audio play event for:', lesson.title);
      setActualIsPlaying(true);
    };

    const handlePause = () => {
      console.log('⏸️ Audio pause event for:', lesson.title);
      setActualIsPlaying(false);
    };

    // ✅ CRITICAL: Connect timeupdate event
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [lesson.title, duration, actualIsPlaying, onProgressUpdate, savedProgress]);

  // Direct play/pause control for immediate response
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

  // Handle external play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !isInitialized.current) return;

    const audio = audioRef.current;
    const stateChanged = lastPlayingState.current !== isPlaying;
    lastPlayingState.current = isPlaying;

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

  // ✅ FIXED: Improved metadata handling for completed lessons
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded for", lesson.title, "duration:", newDuration, "savedProgress:", savedProgress);
      setDuration(newDuration);

      if (savedProgress?.is_completed) {
        // ✅ FIXED: Completed lessons start at 0 for playback but show 100% in UI
        console.log("🔄 Completed lesson - setting audio position to 0 for replay");
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        // Progress stays at 100% until playback starts
      } else if (savedProgress?.current_position >= 0) {
        const savedTime = (savedProgress.current_position / 100) * newDuration;
        console.log("📍 Setting audio position to:", savedTime, "seconds");
        audioRef.current.currentTime = savedTime;
        setCurrentTime(savedTime);
      } else {
        console.log("🆕 New lesson - starting at beginning");
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
    }
  }, [lesson.title, savedProgress]);

  // ✅ FIXED: Improved audio completion handling
  const handleAudioEnded = useCallback(() => {
    console.log("🏁 Audio ended for lesson:", lesson.title);
    
    setActualIsPlaying(false);
    if (onPlayStateChange) {
      onPlayStateChange(false);
    }
    
    // Set progress to 100% and update final time
    const finalTime = duration;
    setCurrentTime(finalTime);
    setProgress(100);
    
    // Update progress to 100% before completion
    if (onProgressUpdate) {
      console.log("🎯 Setting progress to 100% before completion");
      onProgressUpdate(100);
    }
    
    // Trigger completion with better timing
    requestAnimationFrame(() => {
      console.log("🏁 Triggering lesson completion with improved timing");
      onComplete();
    });
    
  }, [lesson.title, duration, onComplete, onPlayStateChange, onProgressUpdate]);

  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      console.log('🎯 Seeking to position:', value, 'for lesson:', lesson.title);
      setCurrentTime(value);
      audioRef.current.currentTime = value;
      
      // Update visual progress immediately
      if (duration > 0) {
        const progressPercent = (value / duration) * 100;
        setProgress(progressPercent);
        
        // Only update database for non-completed lessons during playback
        if (onProgressUpdate && actualIsPlaying && !savedProgress?.is_completed) {
          onProgressUpdate(progressPercent);
        }
      }
    }
  }, [duration, lesson.title, onProgressUpdate, actualIsPlaying, savedProgress]);

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

  // ✅ FIXED: Use progress state directly for consistency
  const effectiveCurrentTime = duration > 0 ? (progress / 100) * duration : currentTime;
  const effectiveDuration = duration || lesson.duracion;

  return {
    audioRef,
    currentTime: effectiveCurrentTime,
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
    updateTime: () => {}, // ✅ FIXED: No longer needed as separate function
    handleAudioEnded,
    endTransition: () => {}
  };
}
