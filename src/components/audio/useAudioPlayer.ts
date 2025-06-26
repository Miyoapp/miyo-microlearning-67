
import { useState, useRef, useEffect, useCallback } from 'react';
import { Lesson } from '../../types';

interface UseAudioPlayerProps {
  lesson: Lesson | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onComplete: () => void;
  onProgressUpdate?: (position: number) => void;
}

const useAudioPlayer = ({ lesson, isPlaying, onTogglePlay, onComplete, onProgressUpdate }: UseAudioPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Reset player when lesson changes
  useEffect(() => {
    if (lesson && audioRef.current) {
      console.log("🎵 Lesson changed to:", lesson.title, "isCompleted:", lesson.isCompleted);
      setCurrentTime(0);
      setDuration(0);
      
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.load();
      
      // Set initial properties
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = playbackRate;
    }
  }, [lesson?.id, volume, isMuted, playbackRate]);
  
  // MEJORADO: Handle play/pause when isPlaying state changes with detailed logging
  useEffect(() => {
    console.log('🎧🎧🎧 AUDIO PLAYER - isPlaying effect triggered:', {
      hasAudioRef: !!audioRef.current,
      hasLesson: !!lesson,
      lessonTitle: lesson?.title,
      isPlaying,
      timestamp: new Date().toLocaleTimeString()
    });

    if (!audioRef.current || !lesson) {
      console.log('❌ AUDIO PLAYER - Missing audioRef or lesson, cannot proceed');
      return;
    }
    
    const audio = audioRef.current;
    
    if (isPlaying) {
      console.log("▶️▶️▶️ AUDIO PLAYER - Starting playback for lesson:", lesson.title);
      console.log('🔊 AUDIO PLAYER - Calling audio.play()...');
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('✅✅✅ AUDIO PLAYER - Audio playback started successfully:', lesson.title);
        }).catch(error => {
          console.error("❌❌❌ AUDIO PLAYER - Audio playback failed:", error);
          console.error('🚫 AUDIO PLAYER - Error details:', {
            lessonTitle: lesson.title,
            audioSrc: audio.src,
            audioReadyState: audio.readyState,
            audioNetworkState: audio.networkState
          });
          onTogglePlay();
        });
      }
    } else {
      console.log("⏸️⏸️⏸️ AUDIO PLAYER - Pausing audio for lesson:", lesson.title);
      audio.pause();
    }
  }, [isPlaying, lesson?.id, onTogglePlay]);
  
  // Update audio properties when they change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);
  
  // Update time display and progress
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      setCurrentTime(newCurrentTime);
      
      // Only update progress for incomplete lessons
      if (onProgressUpdate && lesson && !lesson.isCompleted) {
        const progressPercent = (newCurrentTime / duration) * 100;
        console.log('📊 Updating progress for incomplete lesson:', lesson.title, 'progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson, onProgressUpdate]);
  
  // Handle metadata loaded
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded, duration:", newDuration);
      setDuration(newDuration);
    }
  }, []);
  
  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    if (lesson) {
      console.log("🏁 Audio ended for lesson:", lesson.title);
      setCurrentTime(0);
      onComplete();
    }
  }, [lesson, onComplete]);
  
  // Handle seek
  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      setCurrentTime(value);
      audioRef.current.currentTime = value;
      
      // Update progress when seeking for incomplete lessons
      if (onProgressUpdate && duration > 0 && lesson && !lesson.isCompleted) {
        const progressPercent = (value / duration) * 100;
        console.log('🎯 Seek: Updating progress for incomplete lesson:', lesson.title, 'progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson, onProgressUpdate]);
  
  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
  }, []);
  
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
  }, []);

  return {
    audioRef,
    currentTime,
    duration,
    isMuted,
    volume,
    playbackRate,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    handlePlaybackRateChange,
    handleMetadata,
    updateTime,
    handleAudioEnded
  };
};

export default useAudioPlayer;
