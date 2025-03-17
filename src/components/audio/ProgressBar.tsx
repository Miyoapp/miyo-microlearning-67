
import { useState } from 'react';

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

  return (
    <div className="w-full mt-3">
      <input
        type="range"
        min={0}
        max={duration || 1}
        value={currentTime}
        onChange={handleSeek}
        className="w-full accent-miyo-800 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
};

export default ProgressBar;
