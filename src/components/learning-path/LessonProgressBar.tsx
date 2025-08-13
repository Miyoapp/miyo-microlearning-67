
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
    </div>
  );
};

export default LessonProgressBar;
