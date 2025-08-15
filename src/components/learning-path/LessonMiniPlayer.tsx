
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Lesson } from '@/types';
import ProgressBar from '@/components/audio/ProgressBar';
import SpeedControl from '@/components/audio/SpeedControl';
import TimeDisplay from '@/components/audio/TimeDisplay';

interface LessonMiniPlayerProps {
  lesson: Lesson;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSeek: (value: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onPlaybackRateChange: (rate: number) => void;
}

const LessonMiniPlayer: React.FC<LessonMiniPlayerProps> = ({
  lesson,
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  isMuted,
  onTogglePlay,
  onSeek,
  onSkipBack,
  onSkipForward,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange
}) => {
  const validDuration = duration || (lesson.duracion * 60);
  
  return (
    <div className="mt-3 space-y-3">
      {/* Controls Row */}
      <div className="flex items-center justify-between">
        {/* Left: Skip and Play Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onSkipBack}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            title="Retroceder 15s"
          >
            <SkipBack size={16} />
          </button>
          
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-full bg-[#5e16ea] text-white hover:bg-[#4a11ba] transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="white" />}
          </button>
          
          <button
            onClick={onSkipForward}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            title="Adelantar 15s"
          >
            <SkipForward size={16} />
          </button>
        </div>
        
        {/* Right: Speed and Volume */}
        <div className="flex items-center space-x-3">
          <SpeedControl 
            playbackRate={playbackRate}
            onPlaybackRateChange={onPlaybackRateChange}
          />
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleMute}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <Volume2 size={16} className={isMuted ? "text-gray-400" : "text-gray-600"} />
            </button>
            
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume * 100}
              onChange={(e) => onVolumeChange(parseInt(e.target.value) / 100)}
              className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5e16ea]"
            />
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <ProgressBar 
        currentTime={currentTime}
        duration={validDuration}
        onSeek={onSeek}
      />
      
      {/* Time Display */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <TimeDisplay currentTime={currentTime} duration={validDuration} />
        {lesson.isCompleted && (
          <span className="text-green-600 font-medium">✓ Completada</span>
        )}
      </div>
    </div>
  );
};

export default LessonMiniPlayer;
