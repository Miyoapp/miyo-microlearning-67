
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { CategoriaLanding } from '@/types/landing';

interface CategoryCardProps {
  categoria: CategoriaLanding;
  onClick?: (categoria: CategoriaLanding) => void;
  currentlyPlaying: string | null;
  onAudioPlay: (categoryId: string) => void;
  onAudioStop: () => void;
}

const CategoryCard = ({ 
  categoria, 
  onClick, 
  currentlyPlaying, 
  onAudioPlay, 
  onAudioStop 
}: CategoryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const isPlaying = currentlyPlaying === categoria.id;

  const getImageForCategory = (nombre: string, imagenUrl: string) => {
    if (nombre.toLowerCase().includes('antes de dormir') && !imagenUrl) {
      return 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=400&q=80';
    }
    return imagenUrl;
  };

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
    if (onClick) {
      onClick(categoria);
    }
  };

  const handleAudioEnded = () => {
    onAudioStop();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  const imageUrl = getImageForCategory(categoria.nombre, categoria.imagen_url);

  return (
    <div 
      className={`group relative bg-white rounded-3xl shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-110 hover:-translate-y-2 hover:shadow-2xl`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Audio element */}
      {categoria.audio_preview_url && (
        <audio
          ref={audioRef}
          src={categoria.audio_preview_url}
          preload="none"
          onEnded={handleAudioEnded}
          onTimeUpdate={handleTimeUpdate}
        />
      )}
      
      <div className="overflow-hidden rounded-t-3xl">
        {/* Image container con efecto parallax */}
        <div className="relative h-56 bg-gradient-to-br from-miyo-100 to-miyo-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={categoria.nombre}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-miyo-600 text-4xl font-bold opacity-20">
                {categoria.nombre.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-40`} />
          
          {categoria.audio_preview_url && (
            <button
              onClick={handlePlayPause}
              className={`absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full p-3 transition-all duration-300 transform z-10 ${
                isHovered || isPlaying ? 'scale-110 opacity-100' : 'scale-100 opacity-80'
              } hover:bg-white hover:scale-125 shadow-lg`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" style={{ color: '#5e17eb' }} />
              ) : (
                <Play className="w-5 h-5 ml-0.5" style={{ color: '#5e17eb' }} />
              )}
            </button>
          )}

          {isPlaying && (
            <div className="absolute bottom-4 right-4">
              <div className="flex space-x-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 16 + 8}px`,
                      animationDelay: `${i * 0.1}s`,
                      backgroundColor: '#5e17eb'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="transition-all duration-300">
        {isHovered && categoria.audio_preview_url ? (
          <div className="bg-miyo-800 text-white p-4 h-[100px] flex flex-col justify-center rounded-b-3xl">
            <div className="flex items-center gap-3">
              <button onClick={handlePlayPause} className="bg-white rounded-full p-2 flex-shrink-0">
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-miyo-800" />
                ) : (
                  <Play className="w-5 h-5 text-miyo-800 ml-0.5" />
                )}
              </button>
              <div className="flex-grow">
                <span className="font-semibold text-base">Listen</span>
                <div className="w-full bg-miyo-700 rounded-full h-1 mt-1.5">
                  <div className="bg-white h-1 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 relative h-[100px]">
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 transition-all duration-300 group-hover:text-miyo-800`}>
              {categoria.nombre}
            </h3>
            {categoria.descripcion && (
              <p className={`text-gray-600 text-sm line-clamp-2 transition-all duration-300 group-hover:text-gray-700`}>
                {categoria.descripcion}
              </p>
            )}

            <div className={`absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-miyo-600 to-miyo-800 rounded-full transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 opacity-0 group-hover:opacity-100`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
