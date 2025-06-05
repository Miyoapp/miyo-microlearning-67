
import { useState, useRef, useEffect } from 'react';
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
      console.log("Lesson changed to:", lesson.title);
      setCurrentTime(0);
      audioRef.current.currentTime = 0;
      audioRef.current.load(); // Force reload of the audio element
      
      // Set initial volume and playback rate
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [lesson?.id]); // Only depend on lesson ID to avoid unnecessary reloads
  
  // Handle play/pause when isPlaying state changes
  useEffect(() => {
    if (!audioRef.current || !lesson) return;
    
    const audio = audioRef.current;
    
    if (isPlaying) {
      console.log("Playing audio for lesson:", lesson.title);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio playback failed:", error);
          onTogglePlay(); // Reset the playing state
        });
      }
    } else {
      console.log("Pausing audio");
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
  const updateTime = () => {
    if (audioRef.current) {
      const newCurrentTime = audioRef.current.currentTime;
      setCurrentTime(newCurrentTime);
      
      // Update progress in database every 5 seconds or significant changes
      if (onProgressUpdate && duration > 0) {
        const progressPercent = (newCurrentTime / duration) * 100;
        onProgressUpdate(progressPercent);
      }
    }
  };
  
  // Handle metadata loaded
  const handleMetadata = () => {
    if (audioRef.current) {
      console.log("Audio metadata loaded, duration:", audioRef.current.duration);
      setDuration(audioRef.current.duration);
    }
  };
  
  // Handle audio ended event - when it reaches 100%
  const handleAudioEnded = () => {
    if (lesson) {
      console.log("Audio ended naturally, marking lesson complete:", lesson.title);
      onComplete();
      
      // Dispatch custom event to signal lesson ended for auto-advancing
      console.log("Dispatching lessonEnded event for lesson:", lesson.id);
      const event = new CustomEvent('lessonEnded', { 
        detail: { lessonId: lesson.id }
      });
      window.dispatchEvent(event);
    }
  };
  
  // Handle seek
  const handleSeek = (value: number) => {
    setCurrentTime(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      
      // Update progress immediately when seeking
      if (onProgressUpdate && duration > 0) {
        const progressPercent = (value / duration) * 100;
        onProgressUpdate(progressPercent);
      }
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

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
