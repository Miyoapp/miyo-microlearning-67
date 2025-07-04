
import React from 'react';
import { CategoriaLanding } from '@/types/landing';

interface CategoryScrollCardProps {
  categoria: CategoriaLanding;
  onClick?: () => void;
}

const CategoryScrollCard = ({ categoria, onClick }: CategoryScrollCardProps) => {
  // Imagen por defecto para "Antes de dormir"
  const getImageForCategory = (nombre: string, imagenUrl: string) => {
    if (nombre.toLowerCase().includes('antes de dormir') && !imagenUrl) {
      return 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=400&q=80';
    }
    return imagenUrl;
  };

  const imageUrl = getImageForCategory(categoria.nombre, categoria.imagen_url);

  return (
    <div 
      className="relative h-40 w-72 mx-3 rounded-2xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-105 flex-shrink-0"
      onClick={onClick}
    >
      {/* Imagen de fondo */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={categoria.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-miyo-100 to-miyo-200 flex items-center justify-center">
          <div className="text-miyo-600 text-4xl font-bold opacity-20">
            {categoria.nombre.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      
      {/* Overlay con nombre de categoría */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
        <div className="p-4 w-full">
          <h3 className="text-white font-semibold text-lg drop-shadow-lg">
            {categoria.nombre}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default CategoryScrollCard;
