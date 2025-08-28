
import { useState, useRef, useCallback, useEffect } from 'react';
import { Lesson, Podcast } from '@/types';
import { User } from '@supabase/supabase-js';

interface CentralizedAudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseCentralizedAudioProps {
  currentLesson: Lesson | null;
  podcast: Podcast | null;
  user: User | null;
  onProgressUpdate: (position: number) => void;
  onLessonComplete: () => void;
}

export function useCentralizedAudio({
  currentLesson,
  podcast,
  user,
  onProgressUpdate,
  onLessonComplete
}: UseCentralizedAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  
  const [audioState, setAudioState] = useState<CentralizedAudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    isMuted: false,
    isLoading: false,
    error: null
  });

  // Create new audio element when lesson changes
  useEffect(() => {
    console.log('🎵 CentralizedAudio: Creating audio element for lesson:', currentLesson?.title);
    
    // Cleanup previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('loadedmetadata', handleMetadata);
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.removeEventListener('ended', handleAudioEnded);
      audioRef.current.removeEventListener('error', handleAudioError);
      audioRef.current.removeEventListener('canplay', handleCanPlay);
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    }

    if (currentLesson?.urlAudio) {
      setAudioState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const audio = new Audio(currentLesson.urlAudio);
      audio.volume = audioState.volume;
      audio.playbackRate = audioState.playbackRate;
      audio.muted = audioState.isMuted;
      
      audio.addEventListener('loadedmetadata', handleMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('error', handleAudioError);
      audio.addEventListener('canplay', handleCanPlay);
      
      audioRef.current = audio;
    } else {
      audioRef.current = null;
      setAudioState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        currentTime: 0, 
        duration: 0, 
        isLoading: false 
      }));
    }

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, [currentLesson?.id]);

  // Audio event handlers
  const handleMetadata = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      console.log('🎵 Audio metadata loaded, duration:', duration);
      setAudioState(prev => ({ 
        ...prev, 
        duration,
        isLoading: false 
      }));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      setAudioState(prev => ({ ...prev, currentTime }));
    }
  };

  const handleAudioEnded = () => {
    console.log('🎵 Audio ended, calling onLessonComplete');
    setAudioState(prev => ({ ...prev, isPlaying: false }));
    onLessonComplete();
  };

  const handleAudioError = () => {
    console.error('🚨 Audio error for lesson:', currentLesson?.title);
    setAudioState(prev => ({ 
      ...prev, 
      error: 'Error loading audio', 
      isLoading: false,
      isPlaying: false 
    }));
  };

  const handleCanPlay = () => {
    setAudioState(prev => ({ ...prev, isLoading: false }));
  };

  // Progress update interval
  useEffect(() => {
    if (audioState.isPlaying && audioRef.current) {
      progressUpdateInterval.current = setInterval(() => {
        if (audioRef.current) {
          onProgressUpdate(audioRef.current.currentTime);
        }
      }, 2000);
    } else {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
        progressUpdateInterval.current = null;
      }
    }

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, [audioState.isPlaying, onProgressUpdate]);

  // Control functions
  const play = useCallback(async () => {
    if (!audioRef.current) return;
    
    try {
      console.log('▶️ CentralizedAudio: Starting playback');
      await audioRef.current.play();
      setAudioState(prev => ({ ...prev, isPlaying: true, error: null }));
    } catch (error) {
      console.error('🚨 Play failed:', error);
      setAudioState(prev => ({ 
        ...prev, 
        error: 'Playback failed', 
        isPlaying: false 
      }));
    }
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    
    console.log('⏸️ CentralizedAudio: Pausing playback');
    audioRef.current.pause();
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlayPause = useCallback(() => {
    if (audioState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [audioState.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    console.log('🎯 CentralizedAudio: Seeking to:', time);
    audioRef.current.currentTime = time;
    setAudioState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const skipBackward = useCallback(() => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, audioRef.current.currentTime - 15);
    seek(newTime);
  }, [seek]);

  const skipForward = useCallback(() => {
    if (!audioRef.current) return;
    const newTime = Math.min(audioState.duration, audioRef.current.currentTime + 15);
    seek(newTime);
  }, [seek, audioState.duration]);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = volume;
    setAudioState(prev => ({ ...prev, volume }));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.playbackRate = rate;
    setAudioState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    const newMuted = !audioState.isMuted;
    audioRef.current.muted = newMuted;
    setAudioState(prev => ({ ...prev, isMuted: newMuted }));
  }, [audioState.isMuted]);

  return {
    // State
    ...audioState,
    
    // Controls
    play,
    pause,
    togglePlayPause,
    seek,
    skipBackward,
    skipForward,
    setVolume,
    setPlaybackRate,
    toggleMute,
    
    // Utilities
    formatTime: (timeInSeconds: number) => {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
}
