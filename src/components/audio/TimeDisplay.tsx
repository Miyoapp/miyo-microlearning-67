
import { formatMinutesToTime } from '@/lib/formatters';

interface TimeDisplayProps {
  currentTime: number;
  duration: string | number;
}

const TimeDisplay = ({ currentTime, duration }: TimeDisplayProps) => {
  // Format time display (mm:ss) - handles seconds correctly
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Format the duration value consistently as seconds
  const formattedDuration = typeof duration === 'number' 
    ? formatTime(duration) // Always treat as seconds and format as MM:SS
    : duration; // Keep string values as-is

  return (
    <p className="text-sm text-gray-500">{formatTime(currentTime)} / {formattedDuration}</p>
  );
};

export default TimeDisplay;
