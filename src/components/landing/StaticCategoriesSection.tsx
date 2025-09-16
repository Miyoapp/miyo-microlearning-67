import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CategoryCard from './CategoryCard';
import FloatingElements from './FloatingElements';

const categoriesData = [
  {
    id: '1',
    emoji: '🧠',
    title: 'Autoconocimiento',
    description: 'Descubre quién eres realmente y conecta con tu propósito interior'
  },
  {
    id: '2',
    emoji: '🚀',
    title: 'Desarrollo Personal',
    description: 'Construye hábitos poderosos y transforma tu mentalidad'
  },
  {
    id: '3',
    emoji: '⚡',
    title: 'Productividad',
    description: 'Optimiza tu tiempo y logra más con menos esfuerzo'
  },
  {
    id: '4',
    emoji: '🌟',
    title: 'Bienestar',
    description: 'Cultiva la paz interior y el equilibrio en tu vida diaria'
  },
  {
    id: '5',
    emoji: '🤝',
    title: 'Relaciones Humanas',
    description: 'Mejora tus conexiones y construye vínculos auténticos'
  },
  {
    id: '6',
    emoji: '💼',
    title: 'Liderazgo Consciente',
    description: 'Desarrolla un liderazgo auténtico que inspire y transforme'
  }
];

const StaticCategoriesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleExplorarCursos = () => {
    navigate('/login?mode=signup');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.4
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 1 }
    }
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <FloatingElements />
      
      <motion.div 
        className="miyo-container relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Título y subtítulo */}
          <motion.div 
            className="text-center mb-16"
            variants={titleVariants}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tu camino empieza aquí
            </h2>
            <p className="text-xl text-gray-600">
              Explora temas que te inspiren, reten y desarrollen
            </p>
          </motion.div>

          {/* Grid de categorías */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
            variants={gridVariants}
          >
            {categoriesData.map((category) => (
              <CategoryCard 
                key={category.id}
                category={category}
              />
            ))}
          </motion.div>

          {/* Botón CTA */}
          <motion.div 
            className="text-center"
            variants={buttonVariants}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-miyo-800 to-miyo-600 hover:from-miyo-700 hover:to-miyo-500 text-white px-8 py-4 h-auto text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={handleExplorarCursos}
            >
              🎧 Explorar cursos
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default StaticCategoriesSection;