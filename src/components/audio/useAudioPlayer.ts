
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
  
  // DEBUGGING: Log when props change
  useEffect(() => {
    console.log('🎵🎵🎵 useAudioPlayer - Props changed:', {
      lessonTitle: lesson?.title || 'NO LESSON',
      isPlaying,
      hasAudioRef: !!audioRef.current,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [lesson?.id, isPlaying]);
  
  // Reset player when lesson changes (WITHOUT playbackRate dependency)
  useEffect(() => {
    if (lesson && audioRef.current) {
      console.log("🎵 AUDIO RESET - Lesson changed to:", lesson.title, "isCompleted:", lesson.isCompleted);
      setCurrentTime(0);
      setDuration(0);
      
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.load();
      
      console.log("🎵 AUDIO RESET - Setting initial properties");
      // Set initial properties (volume and existing playback rate)
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = playbackRate; // Use current playbackRate, don't reset it
    }
  }, [lesson?.id, volume, isMuted]); // REMOVED playbackRate from dependencies
  
  // Handle playback rate changes separately (WITHOUT restarting audio)
  useEffect(() => {
    if (audioRef.current) {
      console.log("🏃‍♂️ PLAYBACK RATE - Updating to:", playbackRate + "x");
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);
  
  // Handle volume and mute changes separately
  useEffect(() => {
    if (audioRef.current) {
      console.log("🔊 VOLUME - Updating to:", isMuted ? 'MUTED' : volume);
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // CRITICAL: Handle play/pause when isPlaying state changes
  useEffect(() => {
    if (!audioRef.current || !lesson) {
      console.log("❌ PLAY/PAUSE - Missing audio ref or lesson:", { hasAudio: !!audioRef.current, hasLesson: !!lesson });
      return;
    }
    
    const audio = audioRef.current;
    
    console.log("🎮🎮🎮 PLAY/PAUSE EFFECT - isPlaying changed to:", isPlaying, "for lesson:", lesson.title);
    
    if (isPlaying) {
      console.log("▶️▶️▶️ ATTEMPTING TO PLAY audio for lesson:", lesson.title);
      console.log("🎵 Audio element state:", {
        src: audio.src,
        readyState: audio.readyState,
        paused: audio.paused,
        currentTime: audio.currentTime,
        duration: audio.duration
      });
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("✅✅✅ AUDIO PLAYBACK STARTED successfully for:", lesson.title);
          })
          .catch(error => {
            console.error("❌❌❌ AUDIO PLAYBACK FAILED:", error);
            console.error("❌ Audio element details:", {
              src: audio.src,
              readyState: audio.readyState,
              networkState: audio.networkState,
              error: audio.error
            });
            onTogglePlay(); // Reset the playing state
          });
      }
    } else {
      console.log("⏸️⏸️⏸️ PAUSING audio for lesson:", lesson.title);
      audio.pause();
      console.log("✅ Audio paused successfully");
    }
  }, [isPlaying, lesson?.id, onTogglePlay]);
  
  // Update time display and progress
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      setCurrentTime(newCurrentTime);
      
      // Only update progress for incomplete lessons
      if (onProgressUpdate && lesson && !lesson.isCompleted) {
        const progressPercent = (newCurrentTime / duration) * 100;
        console.log('📊 Progress update for incomplete lesson:', lesson.title, 'progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson, onProgressUpdate]);
  
  // Handle metadata loaded
  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      console.log("📋📋📋 METADATA LOADED - duration:", newDuration, "for lesson:", lesson?.title);
      setDuration(newDuration);
    }
  }, [lesson?.title]);
  
  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    if (lesson) {
      console.log("🏁🏁🏁 AUDIO ENDED for lesson:", lesson.title);
      setCurrentTime(0);
      onComplete();
    }
  }, [lesson, onComplete]);
  
  // Handle seek
  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      console.log("🎯 SEEK to:", value, "seconds");
      setCurrentTime(value);
      audioRef.current.currentTime = value;
      
      // Update progress when seeking for incomplete lessons
      if (onProgressUpdate && duration > 0 && lesson && !lesson.isCompleted) {
        const progressPercent = (value / duration) * 100;
        console.log('🎯 Seek progress update for incomplete lesson:', lesson.title, 'progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson, onProgressUpdate]);
  
  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    console.log("🔊 Volume change to:", value);
    setVolume(value);
    setIsMuted(value === 0);
  }, []);
  
  const toggleMute = useCallback(() => {
    console.log("🔇 Toggle mute - current:", isMuted);
    setIsMuted(prev => !prev);
  }, [isMuted]);
  
  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate: number) => {
    console.log("🎛️ Speed control: Changing playback rate from", playbackRate + "x", "to", rate + "x");
    setPlaybackRate(rate);
  }, [playbackRate]);

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
