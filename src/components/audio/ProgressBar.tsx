
import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number) => void;
}

const ProgressBar = ({ currentTime, duration, onSeek }: ProgressBarProps) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onSeek(value);
  };

  const validDuration = duration || 1;
  const validCurrentTime = Math.min(currentTime, validDuration);

  return (
    <div className="w-full mt-3">
      <input
        type="range"
        min={0}
        max={validDuration}
        value={validCurrentTime}
        onChange={handleSeek}
        className="w-full accent-miyo-800 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #5e16ea 0%, #5e16ea ${(validCurrentTime / validDuration) * 100}%, #e5e7eb ${(validCurrentTime / validDuration) * 100}%, #e5e7eb 100%)`
        }}
      />
    </div>
  );
};

export default ProgressBar;
