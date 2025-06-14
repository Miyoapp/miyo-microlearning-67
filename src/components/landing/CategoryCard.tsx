
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
  const isPlaying = currentlyPlaying === categoria.id;

  // Imagen por defecto para "Antes de dormir"
  const getImageForCategory = (nombre: string, imagenUrl: string) => {
    if (nombre.toLowerCase().includes('antes de dormir') && !imagenUrl) {
      return 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=400&q=80';
    }
    return imagenUrl;
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
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

  const imageUrl = getImageForCategory(categoria.nombre, categoria.imagen_url);

  return (
    <div 
      className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform ${
        isHovered ? 'scale-105 -translate-y-2' : 'scale-100 translate-y-0'
      }`}
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
        />
      )}
      
      {/* Image container con efecto parallax */}
      <div className="relative h-56 bg-gradient-to-br from-miyo-100 to-miyo-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={categoria.nombre}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
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
        
        {/* Overlay gradient */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-40' : 'opacity-0'
        }`} />
        
        {/* Play button con diseño mejorado */}
        {categoria.audio_preview_url && (
          <button
            onClick={handlePlayPause}
            className={`absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full p-3 transition-all duration-300 transform ${
              isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-80'
            } hover:bg-white hover:scale-125 shadow-lg`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" style={{ color: '#5e17eb' }} />
            ) : (
              <Play className="w-5 h-5 ml-0.5" style={{ color: '#5e17eb' }} />
            )}
          </button>
        )}

        {/* Indicador de audio activo */}
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
      
      {/* Content con animaciones */}
      <div className="p-6 relative">
        <h3 className={`text-xl font-semibold text-gray-900 mb-2 transition-all duration-300 ${
          isHovered ? 'text-miyo-800 transform translate-x-1' : ''
        }`}>
          {categoria.nombre}
        </h3>
        {categoria.descripcion && (
          <p className={`text-gray-600 text-sm line-clamp-2 transition-all duration-300 ${
            isHovered ? 'text-gray-700' : ''
          }`}>
            {categoria.descripcion}
          </p>
        )}

        {/* Barra de acento decorativa */}
        <div className={`absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-miyo-600 to-miyo-800 rounded-full transition-all duration-300 transform ${
          isHovered ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
        }`} />
      </div>
    </div>
  );
};

export default CategoryCard;
