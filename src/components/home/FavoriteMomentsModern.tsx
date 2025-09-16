import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MomentCard from './MomentCard';
import FloatingElements from '../landing/FloatingElements';
import { Car, Dumbbell, Train, Coffee, Moon } from 'lucide-react';

const FavoriteMomentsModern = () => {
  const navigate = useNavigate();

  const moments = [
    {
      id: 1,
      title: "Mientras manejas",
      icon: Car,
      description: "Aprovecha cada trayecto para crecer profesionalmente",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      id: 2,
      title: "Entrenando",
      icon: Dumbbell,
      description: "Fortalece tu mente mientras fortaleces tu cuerpo",
      gradient: "from-green-400 to-green-600"
    },
    {
      id: 3,
      title: "En transporte",
      icon: Train,
      description: "Convierte cada viaje en una oportunidad de aprendizaje",
      gradient: "from-purple-400 to-purple-600"
    },
    {
      id: 4,
      title: "Tomando café",
      icon: Coffee,
      description: "Momentos de pausa perfectos para nuevas ideas",
      gradient: "from-orange-400 to-orange-600"
    },
    {
      id: 5,
      title: "Antes de dormir",
      icon: Moon,
      description: "Termina el día con pensamientos que inspiran",
      gradient: "from-indigo-400 to-indigo-600"
    }
  ];

  const handleMomentClick = () => {
    navigate('/login?mode=signup');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Elementos flotantes de fondo */}
      <FloatingElements />
      
      <motion.div 
        className="miyo-container relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Título principal */}
          <motion.div 
            className="text-center mb-16"
            variants={titleVariants}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-6">
              Elige tu momento favorito para aprender
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada momento del día es perfecto para expandir tus conocimientos
            </p>
          </motion.div>

          {/* Grid de momentos */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
            variants={gridVariants}
          >
            {moments.map((moment) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                onClick={handleMomentClick}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default FavoriteMomentsModern;