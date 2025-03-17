
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SpeedControlProps {
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
}

const SpeedControl = ({ playbackRate, onPlaybackRateChange }: SpeedControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSpeedSelect = (speed: number) => {
    onPlaybackRateChange(speed);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="flex items-center text-gray-600 hover:text-miyo-800 transition-colors px-2 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
      >
        <span>{playbackRate}x</span>
        <ChevronDown size={14} className="ml-1" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-md shadow-lg py-1 z-10 min-w-20">
          {speeds.map(speed => (
            <button
              key={speed}
              onClick={() => handleSpeedSelect(speed)}
              className={`block w-full text-left px-4 py-1 text-sm ${
                speed === playbackRate ? 'bg-miyo-100 text-miyo-800' : 'hover:bg-gray-100'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpeedControl;
