import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import MomentIcon from './MomentIcon';

interface MomentCardProps {
  moment: {
    id: number;
    title: string;
    icon: LucideIcon;
    description: string;
    gradient: string;
  };
  onClick: () => void;
}

const MomentCard: React.FC<MomentCardProps> = ({ moment, onClick }) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    hover: {
      y: -8,
      scale: 1.02
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="glass rounded-2xl p-6 h-full transition-all duration-300 group-hover:shadow-xl group-hover:bg-white/80">
        {/* Icono */}
        <div className="flex justify-center mb-6">
          <MomentIcon 
            icon={moment.icon} 
            gradient={moment.gradient}
          />
        </div>
        
        {/* Contenido */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
            {moment.title}
          </h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
            {moment.description}
          </p>
        </div>
        
        {/* Indicador de hover */}
        <div className="mt-6 flex justify-center">
          <motion.div
            className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MomentCard;