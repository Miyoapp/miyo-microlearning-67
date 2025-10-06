import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGlassEffect } from '@/hooks/useGlassEffect';

interface CategoryCardProps {
  categoria?: {
    id: string;
    emoji?: string;
    title?: string;
    description?: string;
  };
  category?: {
    id: string;
    emoji: string;
    title: string;
    description: string;
  };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ categoria, category }) => {
  const navigate = useNavigate();
  const { glassClass } = useGlassEffect();
  
  // Support both prop names for backwards compatibility
  const item = category || categoria;
  
  if (!item) return null;

  const handleClick = () => {
    navigate('/login?mode=signup');
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={cardVariants}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className={`relative h-full ${glassClass} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:bg-white/70`}>
        {/* Gradiente de fondo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-miyo-50/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Contenido */}
        <div className="relative z-10">
          {/* Icono con animación */}
          <motion.div 
            className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {item.emoji}
          </motion.div>
          
          {/* Título */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-miyo-800 transition-colors duration-300">
            {item.title}
          </h3>
          
          {/* Descripción */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {item.description}
          </p>
          
          {/* Indicador de hover */}
          <div className="mt-4 flex items-center text-miyo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            Explorar →
          </div>
        </div>
        
        {/* Brillo sutil en hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-700 rounded-2xl" />
      </div>
    </motion.div>
  );
};

export default CategoryCard;