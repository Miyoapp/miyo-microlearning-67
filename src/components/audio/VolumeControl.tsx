
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleMute: () => void;
}

const VolumeControl = ({ volume, isMuted, onVolumeChange, onToggleMute }: VolumeControlProps) => {
  return (
    <div className="flex items-center">
      <button 
        onClick={onToggleMute}
        className="text-gray-600 hover:text-miyo-800 mr-2"
        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={onVolumeChange}
        className="w-20 accent-miyo-800 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
};

export default VolumeControl;
