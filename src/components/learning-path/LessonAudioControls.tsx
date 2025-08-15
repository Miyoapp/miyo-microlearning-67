
import React, { useState } from 'react';
import { RotateCcw, RotateCw, ChevronDown } from 'lucide-react';

interface LessonAudioControlsProps {
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  disabled?: boolean;
}

const LessonAudioControls: React.FC<LessonAudioControlsProps> = ({
  playbackRate,
  onPlaybackRateChange,
  onSeekBackward,
  onSeekForward,
  disabled = false
}) => {
  const [isSpeedOpen, setIsSpeedOpen] = useState(false);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSpeedSelect = (speed: number) => {
    onPlaybackRateChange(speed);
    setIsSpeedOpen(false);
  };

  return (
    <div className="flex items-center justify-between mt-2">
      {/* Seek controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onSeekBackward}
          disabled={disabled}
          className={`p-1 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Retroceder 15s"
        >
          <RotateCcw size={16} />
        </button>
        
        <button
          onClick={onSeekForward}
          disabled={disabled}
          className={`p-1 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Avanzar 15s"
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* Speed control */}
      <div className="relative">
        <button
          onClick={() => setIsSpeedOpen(!isSpeedOpen)}
          disabled={disabled}
          className={`flex items-center space-x-1 px-2 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>{playbackRate}x</span>
          <ChevronDown size={12} />
        </button>
        
        {isSpeedOpen && !disabled && (
          <div className="absolute bottom-full right-0 mb-1 bg-white rounded-md shadow-lg py-1 z-10 min-w-16 border">
            {speeds.map(speed => (
              <button
                key={speed}
                onClick={() => handleSpeedSelect(speed)}
                className={`block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 ${
                  speed === playbackRate ? 'bg-indigo-50 text-indigo-700' : ''
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonAudioControls;
