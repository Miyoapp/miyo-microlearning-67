
import { useState, useRef, useEffect } from 'react';
import { Lesson } from '../../types';

interface UseAudioPlayerProps {
  lesson: Lesson | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onComplete: () => void;
}

const useAudioPlayer = ({ lesson, isPlaying, onTogglePlay, onComplete }: UseAudioPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasCompleted, setHasCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Reset player when lesson changes
  useEffect(() => {
    if (lesson) {
      setCurrentTime(0);
      setHasCompleted(false);
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        
        // Delay auto-play to avoid race conditions
        if (isPlaying) {
          const timer = setTimeout(() => {
            if (audioRef.current) {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch(error => {
                  console.error("Audio playback failed:", error);
                  // Only toggle play if it's still supposed to be playing
                  if (isPlaying) {
                    onTogglePlay();
                  }
                });
              }
            }
          }, 300); // Increased delay for better stability
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [lesson, isPlaying, onTogglePlay]);
  
  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !lesson) return;
    
    const handlePlay = async () => {
      try {
        if (isPlaying) {
          await audioRef.current?.play();
        } else {
          audioRef.current?.pause();
        }
      } catch (error) {
        console.error("Audio playback failed:", error);
        if (isPlaying) {
          onTogglePlay();
        }
      }
    };
    
    handlePlay();
  }, [isPlaying, onTogglePlay, lesson]);
  
  // Update volume, mute state, and playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);
  
  // Update time display and check for completion
  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Mark lesson as complete at 95% but don't advance yet
      if (!hasCompleted && audioRef.current.currentTime >= audioRef.current.duration * 0.95) {
        setHasCompleted(true);
        onComplete(); // This marks the lesson as complete in the system
      }
    }
  };
  
  // Handle metadata loaded
  const handleMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  // Handle seek
  const handleSeek = (value: number) => {
    setCurrentTime(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
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
    hasCompleted,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    handlePlaybackRateChange,
    handleMetadata,
    updateTime
  };
};

export default useAudioPlayer;
