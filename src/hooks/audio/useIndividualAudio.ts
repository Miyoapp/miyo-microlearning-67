import { useState, useRef, useEffect, useCallback } from 'react';
import { Lesson } from '@/types';

interface UseIndividualAudioProps {
  lesson: Lesson;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onComplete: () => void;
  onProgressUpdate?: (position: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function useIndividualAudio({
  lesson,
  isPlaying,
  onTogglePlay,
  onComplete,
  onProgressUpdate,
  onPlayStateChange
}: UseIndividualAudioProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [actualIsPlaying, setActualIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastPlayingState = useRef(isPlaying);

  console.log('🎵 useIndividualAudio for lesson:', lesson.title, {
    isPlaying,
    actualIsPlaying,
    currentTime,
    duration,
    playbackRate,
    isCompleted: lesson.isCompleted
  });

  // Reset audio when lesson changes with smart initialization for completed lessons
  useEffect(() => {
    if (audioRef.current) {
      console.log("🎵 Initializing audio for lesson:", lesson.title, "isCompleted:", lesson.isCompleted);
      const audio = audioRef.current;
      
      // NUEVO: Para lecciones completadas, inicializar al final
      if (lesson.isCompleted && duration > 0) {
        console.log("✅ Completed lesson - initializing progress at 100%");
        audio.currentTime = duration;
        setCurrentTime(duration);
      } else {
        audio.currentTime = 0;
        setCurrentTime(0);
      }
      
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = playbackRate;
      setDuration(0);
      setActualIsPlaying(false);
      audio.load();
    }
  }, [lesson.id, lesson.isCompleted]);

  // NUEVO: Cuando se carga metadata, inicializar posición para lecciones completadas
  useEffect(() => {
    if (duration > 0 && lesson.isCompleted) {
      console.log("📊 Duration loaded for completed lesson - setting progress to 100%");
      setCurrentTime(duration);
      if (audioRef.current) {
        audioRef.current.currentTime = duration;
      }
    }
  }, [duration, lesson.isCompleted]);

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

  // Update time and progress - MEJORADO: Inteligente para replay vs primera vez
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      setCurrentTime(newCurrentTime);
      
      // OPTIMIZADO: Solo actualizar progreso si no es replay de lección completada
      if (onProgressUpdate && !lesson.isCompleted) {
        const progressPercent = (newCurrentTime / duration) * 100;
        console.log('📊 Updating progress for incomplete lesson:', lesson.title, 'progress:', progressPercent);
        onProgressUpdate(progressPercent);
      } else if (lesson.isCompleted) {
        console.log('🔄 Replay mode - not updating progress for completed lesson:', lesson.title);
      }
    }
  }, [duration, lesson.isCompleted, lesson.title, onProgressUpdate]);

  // Handle metadata loaded
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded for", lesson.title, "duration:", newDuration, "isCompleted:", lesson.isCompleted);
      setDuration(newDuration);
      
      // NUEVO: Para lecciones completadas, inicializar al final inmediatamente
      if (lesson.isCompleted) {
        console.log("✅ Setting completed lesson to 100% after metadata load");
        setCurrentTime(newDuration);
        audioRef.current.currentTime = newDuration;
      }
    }
  }, [lesson.title, lesson.isCompleted]);

  // Handle audio ended - CORREGIDO: Mantener progreso para lecciones completadas
  const handleAudioEnded = useCallback(() => {
    console.log("🏁 Audio ended for lesson:", lesson.title, "isCompleted:", lesson.isCompleted);
    
    setActualIsPlaying(false);
    if (onPlayStateChange) {
      onPlayStateChange(false);
    }
    
    // CRÍTICO: Para lecciones completadas (replay), mantener progreso al 100%
    if (lesson.isCompleted) {
      console.log("✅ Completed lesson ended - maintaining progress at 100%");
      setCurrentTime(duration); // Mantener al final, no resetear a 0
    } else {
      console.log("🎯 New lesson completed - resetting for next cycle");
      setCurrentTime(0); // Solo resetear para lecciones nuevas
    }
    
    onComplete();
  }, [lesson.title, lesson.isCompleted, duration, onComplete, onPlayStateChange]);

  // Handle seek - MEJORADO: Progreso inteligente durante seek
  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      console.log('🎯 Seeking to position:', value, 'for lesson:', lesson.title, 'isCompleted:', lesson.isCompleted);
      setCurrentTime(value);
      audioRef.current.currentTime = value;
      
      // OPTIMIZADO: Solo actualizar progreso en BD si no es replay
      if (onProgressUpdate && duration > 0 && !lesson.isCompleted) {
        const progressPercent = (value / duration) * 100;
        console.log('📊 Updating seek progress for incomplete lesson:', progressPercent);
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
