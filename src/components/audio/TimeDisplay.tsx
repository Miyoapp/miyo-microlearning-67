
interface TimeDisplayProps {
  currentTime: number;
  duration: string | number;
}

const TimeDisplay = ({ currentTime, duration }: TimeDisplayProps) => {
  // Format time display (mm:ss)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <p className="text-sm text-gray-500">{formatTime(currentTime)} / {duration}</p>
  );
};

export default TimeDisplay;
