
import { useState, useRef, useEffect } from 'react';
import { Lesson } from '../types';
import LessonInfo from './audio/LessonInfo';
import AudioControls from './audio/AudioControls';
import ProgressBar from './audio/ProgressBar';
import VolumeControl from './audio/VolumeControl';
import SpeedControl from './audio/SpeedControl';

interface AudioPlayerProps {
  lesson: Lesson | null;
  onComplete: () => void;
}

const AudioPlayer = ({ lesson, onComplete }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
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
      setIsPlaying(false);
      
      // Small delay to ensure UI updates before playing
      setTimeout(() => {
        setIsPlaying(true);
      }, 300);
    }
  }, [lesson]);
  
  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio playback failed:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
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
      
      // Check if the lesson is complete (95% listened)
      if (audioRef.current.currentTime >= audioRef.current.duration * 0.95) {
        onComplete();
      }
    }
  };
  
  // Handle metadata loaded
  const handleMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  // Handle play/pause toggle
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
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
  
  // If no lesson is selected, don't render the player
  if (!lesson) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-player z-40 transition-transform duration-300 animate-slide-up">
      <div className="miyo-container py-4">
        <audio
          ref={audioRef}
          src={lesson.audioUrl || "https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3"}
          onTimeUpdate={updateTime}
          onLoadedMetadata={handleMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <LessonInfo 
              title={lesson.title} 
              currentTime={currentTime} 
              duration={`${lesson.duration}:00`} 
            />
          </div>
          
          <div className="flex-1 mx-0 md:mx-6">
            <div className="flex items-center justify-center">
              <AudioControls 
                isPlaying={isPlaying} 
                onPlayPause={handlePlayPause} 
              />
              <div className="ml-4">
                <SpeedControl 
                  playbackRate={playbackRate}
                  onPlaybackRateChange={handlePlaybackRateChange}
                />
              </div>
            </div>
            
            <ProgressBar 
              currentTime={currentTime} 
              duration={duration || lesson.duration * 60} 
              onSeek={handleSeek} 
            />
          </div>
          
          <div className="flex items-center mt-3 md:mt-0">
            <VolumeControl 
              volume={volume} 
              isMuted={isMuted} 
              onVolumeChange={handleVolumeChange} 
              onToggleMute={toggleMute} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
