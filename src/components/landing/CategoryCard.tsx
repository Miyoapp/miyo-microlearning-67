
import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { CategoriaLanding } from '@/types/landing';

interface CategoryCardProps {
  categoria: CategoriaLanding;
}

const CategoryCard = ({ categoria }: CategoryCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef] = useState<HTMLAudioElement | null>(null);

  // Imagen por defecto para "Antes de dormir"
  const getImageForCategory = (nombre: string, imagenUrl: string) => {
    if (nombre.toLowerCase().includes('antes de dormir') && !imagenUrl) {
      return 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=400&q=80';
    }
    return imagenUrl;
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!categoria.audio_preview_url) return;
    
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const imageUrl = getImageForCategory(categoria.nombre, categoria.imagen_url);

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
      {/* Audio element */}
      {categoria.audio_preview_url && (
        <audio
          ref={(ref) => {
            if (ref) {
              (audioRef as any) = ref;
              ref.addEventListener('ended', () => setIsPlaying(false));
            }
          }}
          src={categoria.audio_preview_url}
          preload="none"
        />
      )}
      
      {/* Image container */}
      <div className="relative h-48 bg-gradient-to-br from-miyo-100 to-miyo-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={categoria.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback en caso de error de imagen
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
        
        {/* Play button overlay */}
        {categoria.audio_preview_url && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors">
              {isPlaying ? (
                <Pause className="w-6 h-6 text-miyo-800" />
              ) : (
                <Play className="w-6 h-6 text-miyo-800 ml-0.5" />
              )}
            </div>
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-miyo-800 transition-colors">
          {categoria.nombre}
        </h3>
        {categoria.descripcion && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {categoria.descripcion}
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
