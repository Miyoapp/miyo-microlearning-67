
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

const AudioControls = ({ isPlaying, onPlayPause }: AudioControlsProps) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button className="text-gray-600 hover:text-miyo-800 transition-colors" aria-label="Previous">
        <SkipBack size={22} />
      </button>
      
      <button 
        onClick={onPlayPause}
        className="w-10 h-10 bg-miyo-800 rounded-full flex items-center justify-center text-white hover:bg-miyo-700 transition-colors"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
      </button>
      
      <button className="text-gray-600 hover:text-miyo-800 transition-colors" aria-label="Next">
        <SkipForward size={22} />
      </button>
    </div>
  );
};

export default AudioControls;
