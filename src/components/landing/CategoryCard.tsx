
import React from 'react';
import { Play } from 'lucide-react';
import { CategoriaLanding } from '@/types/landing';

interface CategoryCardProps {
  categoria: CategoriaLanding;
  onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ categoria, onClick }) => {
  return (
    <div 
      className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
      onClick={onClick}
    >
      {/* Imagen de fondo */}
      <div 
        className="aspect-[4/3] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${categoria.imagen_url})` }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
        
        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
          {/* Etiqueta de categoría */}
          <div className="self-start">
            <span className="inline-block px-3 py-1 bg-miyo-800 bg-opacity-80 rounded-full text-sm font-medium">
              Categoría
            </span>
          </div>
          
          {/* Título y botón play */}
          <div className="flex items-end justify-between">
            <div className="flex-1 mr-4">
              <h3 className="text-lg font-bold leading-tight mb-1">
                {categoria.nombre}
              </h3>
              {categoria.descripcion && (
                <p className="text-sm opacity-90 line-clamp-2">
                  {categoria.descripcion}
                </p>
              )}
            </div>
            
            {/* Botón de play */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition-all duration-300 hover:scale-110">
                <Play className="w-5 h-5 text-miyo-800 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
