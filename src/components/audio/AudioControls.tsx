
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const AudioControls = ({ isPlaying, onPlayPause, onPrevious, onNext }: AudioControlsProps) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button 
        onClick={onPrevious}
        className="text-gray-600 hover:text-miyo-800 transition-colors disabled:opacity-50" 
        aria-label="Anterior"
        disabled={!onPrevious}
      >
        <SkipBack size={22} />
      </button>
      
      <button 
        onClick={onPlayPause}
        className="w-10 h-10 bg-miyo-800 rounded-full flex items-center justify-center text-white hover:bg-miyo-700 transition-colors"
        aria-label={isPlaying ? "Pausar" : "Reproducir"}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
      </button>
      
      <button 
        onClick={onNext}
        className="text-gray-600 hover:text-miyo-800 transition-colors disabled:opacity-50" 
        aria-label="Siguiente"
        disabled={!onNext}
      >
        <SkipForward size={22} />
      </button>
    </div>
  );
};

export default AudioControls;
