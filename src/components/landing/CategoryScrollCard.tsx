
import React from 'react';
import { CategoriaLanding } from '@/types/landing';
import { getOptimizedCloudinaryUrl, CloudinaryPresets } from '@/utils/cloudinary';

interface CategoryScrollCardProps {
  categoria: CategoriaLanding;
  onClick?: () => void;
}

const CategoryScrollCard = ({ categoria, onClick }: CategoryScrollCardProps) => {
  // Mapeo de imágenes de Cloudinary para cada categoría
  const getImageForCategory = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    
    if (nombreLower.includes('productividad')) {
      return 'https://res.cloudinary.com/dyjx9cjat/image/upload/v1753193121/productividad_djlbni.jpg';
    }
    if (nombreLower.includes('bienestar')) {
      return 'https://res.cloudinary.com/dyjx9cjat/image/upload/v1753193108/bienestar_hoklc1.jpg';
    }
    if (nombreLower.includes('relaciones') || nombreLower.includes('humanas')) {
      return 'https://res.cloudinary.com/dyjx9cjat/image/upload/v1753193119/relaciones_humanas_b91shk.jpg';
    }
    if (nombreLower.includes('espiritualidad')) {
      return 'https://res.cloudinary.com/dyjx9cjat/image/upload/v1753193121/espiritualidad_qyd5m1.jpg';
    }
    if (nombreLower.includes('autoconocimiento')) {
      return 'https://res.cloudinary.com/dyjx9cjat/image/upload/v1753193118/autoconocimiento_gecxqp.jpg';
    }
    if (nombreLower.includes('habilidades') || nombreLower.includes('personales') || nombreLower.includes('desarrollo')) {
      return 'https://res.cloudinary.com/dyjx9cjat/image/upload/v1753193108/habilidadespersonales_n8bijl.jpg';
    }
    
    // Fallback a la imagen original o una imagen por defecto
    return categoria.imagen_url || 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=400&q=80';
  };

  const imageUrl = getImageForCategory(categoria.nombre);

  return (
    <div 
      className="relative h-40 w-72 mx-3 rounded-2xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-105 flex-shrink-0"
      onClick={onClick}
    >
      {/* Imagen de fondo */}
      <img
        src={getOptimizedCloudinaryUrl(imageUrl, CloudinaryPresets.CATEGORY_IMAGE)}
        alt={categoria.nombre}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      
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
