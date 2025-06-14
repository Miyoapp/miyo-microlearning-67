import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { CategoriaLanding } from '@/types/landing';

interface CategoryCardProps {
  categoria: CategoriaLanding;
  expanded: boolean;
  onClick?: (categoria: CategoriaLanding) => void;
  currentlyPlaying: string | null;
  onAudioPlay: (categoryId: string) => void;
  onAudioStop: () => void;
}

const CategoryCard = ({
  categoria,
  expanded,
  onClick,
  currentlyPlaying,
  onAudioPlay,
  onAudioStop
}: CategoryCardProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const isPlaying = currentlyPlaying === categoria.id;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
        audio.currentTime = 0;
        setProgress(0);
      }
    }
  }, [isPlaying]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!categoria.audio_preview_url) return;
    if (isPlaying) {
      onAudioStop();
    } else {
      onAudioPlay(categoria.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) onClick(categoria);
  };

  const handleAudioEnded = () => {
    onAudioStop();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const percentage =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  return (
    <div
      className={`
        relative w-full h-full flex flex-col items-center justify-between bg-[#f8f5fd] rounded-[26px] shadow-xl transition-all duration-300
        ${expanded ? 'scale-105 z-20' : 'scale-95 opacity-70 z-10'}
        hover:scale-105 hover:opacity-90 cursor-pointer
      `}
      onClick={handleCardClick}
      style={{
        boxShadow: expanded
          ? '0 10px 32px rgba(94,23,235,0.20)'
          : '0 2px 16px rgba(94,23,235,0.05)',
        border: expanded
          ? '2.5px solid #675AFF'
          : '1.5px solid #eee'
      }}
    >
      {/* Imagen */}
      <div className="relative flex flex-col items-center w-full h-full px-4 pt-6 pb-4">
        <img
          src={categoria.imagen_url}
          alt={categoria.nombre}
          className={`w-full object-contain mx-auto transition-all duration-300
            ${expanded ? 'h-[205px] mb-4' : 'h-[110px] mb-2'}
          `}
          style={{
            borderRadius: '18px'
          }}
        />

        {/* Play/Pause Button ALWAYS VISIBLE IF audio_preview*/}
        {categoria.audio_preview_url && (
          <button
            onClick={handlePlayPause}
            tabIndex={0}
            className={`
              absolute
              bottom-4 right-4 z-30
              bg-white border-2 border-[#5e17eb] shadow-md
              flex items-center justify-center
              rounded-full
              w-14 h-14
              transition-all duration-300
              ${expanded ? "scale-110" : "scale-100"}
              hover:bg-[#f8f5fd]
            `}
            style={{
              color: '#5e17eb'
            }}
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
          >
            {isPlaying
              ? <Pause className="w-8 h-8" style={{ color: '#5e17eb' }} />
              : <Play className="w-8 h-8" style={{ color: '#5e17eb' }} />
            }
          </button>
        )}
        {/* Audio Element HIDDEN */}
        {categoria.audio_preview_url && (
          <audio
            ref={audioRef}
            src={categoria.audio_preview_url}
            preload="none"
            onEnded={handleAudioEnded}
            onTimeUpdate={handleTimeUpdate}
          />
        )}
      </div>
      {/* Nombre y descripción */}
      <div className={`px-4 w-full flex flex-col ${expanded ? "mb-5" : ""}`}>
        <h3 className={`text-center font-bold ${expanded ? 'text-xl' : 'text-lg'} text-[#2a2a33] mb-2`}>
          {categoria.nombre}
        </h3>
        {expanded && categoria.descripcion && (
          <p className="text-center text-gray-700 text-sm">{categoria.descripcion}</p>
        )}
        {/* Barra de progreso mini solo si expanded */}
        {expanded && categoria.audio_preview_url && (
          <div className="mt-2 w-full flex flex-col items-center">
            <div className="w-36 h-2 bg-[#423463] rounded-full overflow-hidden">
              <div
                className="bg-[#fff] h-2 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Tiempo total del audio preview */}
            {audioRef.current && audioRef.current.duration ? (
              <span className="mt-1 text-gray-700 text-xs font-semibold">
                {formatDuration(audioRef.current.duration)}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper para dar formato a segundos
function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default CategoryCard;
