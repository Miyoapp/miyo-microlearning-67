
import { useState, useRef, useEffect } from 'react';
import { Lesson } from '../types';
import LessonInfo from './audio/LessonInfo';
import AudioControls from './audio/AudioControls';
import ProgressBar from './audio/ProgressBar';
import VolumeControl from './audio/VolumeControl';
import SpeedControl from './audio/SpeedControl';

interface AudioPlayerProps {
  lesson: Lesson | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onComplete: () => void;
}

const AudioPlayer = ({ lesson, isPlaying, onTogglePlay, onComplete }: AudioPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Reset player when lesson changes
  useEffect(() => {
    if (lesson) {
      setCurrentTime(0);
      setHasCompleted(false);
      setIsEnded(false);
      
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
          }, 100);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [lesson, isPlaying]);
  
  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !lesson) return;
    
    const handlePlay = async () => {
      try {
        if (isPlaying && !isEnded) {
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
  }, [isPlaying, onTogglePlay, lesson, isEnded]);
  
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
        onComplete(); // This will mark the lesson as complete in the system
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
          onEnded={() => {
            setIsEnded(true);
            // Only trigger automatic advance to next lesson on actual audio end (100%)
            if (isPlaying) {
              // The audio has naturally ended, let's proceed to next lesson
              const event = new CustomEvent('lessonEnded', { detail: { lessonId: lesson.id } });
              window.dispatchEvent(event);
            }
          }}
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
                onPlayPause={onTogglePlay} 
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
