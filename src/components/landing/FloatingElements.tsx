import React from 'react';
import { motion } from 'framer-motion';

const FloatingElements: React.FC = () => {
  const circles = [
    { size: 'w-32 h-32', position: 'top-10 left-10', delay: 0 },
    { size: 'w-24 h-24', position: 'top-1/4 right-20', delay: 0.5 },
    { size: 'w-40 h-40', position: 'bottom-20 left-1/4', delay: 1 },
    { size: 'w-20 h-20', position: 'bottom-1/3 right-10', delay: 1.5 },
    { size: 'w-16 h-16', position: 'top-1/2 left-1/3', delay: 2 },
    { size: 'w-28 h-28', position: 'top-20 right-1/3', delay: 2.5 }
  ];

  const floatingAnimation = {
    y: [0, -20, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {circles.map((circle, index) => (
        <motion.div
          key={index}
          className={`absolute ${circle.size} ${circle.position}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: circle.delay, duration: 1 }}
        >
          {/* Círculo principal */}
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-br from-miyo-100/20 to-miyo-200/10 border border-miyo-200/20"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: circle.delay
            }}
          />
          
          {/* Efecto de pulso interno */}
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-br from-miyo-200/30 to-miyo-300/20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: circle.delay + 1
            }}
          />
          
          {/* Punto central brillante */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-miyo-400/50"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: circle.delay + 0.5
            }}
          />
        </motion.div>
      ))}
      
      {/* Partículas adicionales más pequeñas */}
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={`particle-${index}`}
          className="absolute w-1 h-1 bg-miyo-300/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;