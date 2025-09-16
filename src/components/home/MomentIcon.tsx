import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MomentIconProps {
  icon: LucideIcon;
  gradient: string;
}

const MomentIcon: React.FC<MomentIconProps> = ({ icon: Icon, gradient }) => {
  return (
    <motion.div
      className="relative"
      whileHover={{
        rotate: [0, -10, 10, 0],
        scale: 1.1,
        transition: { duration: 0.6, ease: "easeInOut" }
      }}
    >
      {/* Fondo con gradiente */}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300`}>
        {/* Efecto de brillo interno */}
        <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Icono */}
        <Icon 
          className="w-8 h-8 text-white relative z-10"
          strokeWidth={2}
        />
      </div>
      
      {/* Efecto de pulso */}
      <motion.div
        className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} opacity-30`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default MomentIcon;