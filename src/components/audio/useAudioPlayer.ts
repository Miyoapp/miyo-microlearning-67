
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
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Reset player when lesson changes
  useEffect(() => {
    if (lesson) {
      setCurrentTime(0);
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.load(); // Force reload of the audio element
        
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
          }, 800); // Increased delay for better stability
          
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
  
  // Update time display
  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
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
    // Mark the lesson as complete
    if (lesson) {
      console.log("Audio ended naturally, marking lesson complete");
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
