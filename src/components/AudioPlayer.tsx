
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Lesson } from '../types';

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
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  // Update volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
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
  
  // Format time display (mm:ss)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
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
  
  // If no lesson is selected, don't render the player
  if (!lesson) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-player z-40 transition-transform duration-300 animate-slide-up">
      <div className="miyo-container py-4">
        <audio
          ref={audioRef}
          src={lesson.audioUrl || "https://download.samplelib.com/mp3/sample-15s.mp3"}
          onTimeUpdate={updateTime}
          onLoadedMetadata={handleMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="w-10 h-10 bg-miyo-100 rounded-full flex items-center justify-center mr-3">
              <Headphones size={20} className="text-miyo-800" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{lesson.title}</p>
              <p className="text-sm text-gray-500">{formatTime(currentTime)} / {lesson.duration}:00</p>
            </div>
          </div>
          
          <div className="flex-1 mx-0 md:mx-6">
            <div className="flex items-center justify-center space-x-4">
              <button className="text-gray-600 hover:text-miyo-800 transition-colors" aria-label="Previous">
                <SkipBack size={22} />
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 bg-miyo-800 rounded-full flex items-center justify-center text-white hover:bg-miyo-700 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
              </button>
              
              <button className="text-gray-600 hover:text-miyo-800 transition-colors" aria-label="Next">
                <SkipForward size={22} />
              </button>
            </div>
            
            <div className="w-full mt-3">
              <input
                type="range"
                min={0}
                max={duration || lesson.duration * 60}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-miyo-800 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex items-center mt-3 md:mt-0">
            <button 
              onClick={toggleMute}
              className="text-gray-600 hover:text-miyo-800 mr-2"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 accent-miyo-800 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
