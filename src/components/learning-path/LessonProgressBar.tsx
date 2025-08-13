
import React from 'react';

interface LessonProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  disabled?: boolean;
}

const LessonProgressBar: React.FC<LessonProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  disabled = false
}) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const value = parseFloat(e.target.value);
    onSeek(value);
  };

  const validDuration = duration || 1;
  const validCurrentTime = Math.min(currentTime, validDuration);
  const progressPercentage = (validCurrentTime / validDuration) * 100;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="range"
          min={0}
          max={validDuration}
          value={validCurrentTime}
          onChange={handleSeek}
          disabled={disabled}
          className={`w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'
          }`}
          style={{
            background: disabled 
              ? '#e5e7eb'
              : `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${progressPercentage}%, #e5e7eb ${progressPercentage}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Progress indicator */}
        <div
          className={`absolute top-0 h-2 bg-indigo-600 rounded-full transition-all duration-100 ${
            disabled ? 'opacity-50' : ''
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Thumb */}
        <div
          className={`absolute top-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full transform -translate-y-1/2 transition-all duration-100 ${
            disabled ? 'opacity-50' : 'hover:scale-110'
          }`}
          style={{ left: `calc(${progressPercentage}% - 8px)` }}
        />
      </div>
    </div>
  );
};

export default LessonProgressBar;
