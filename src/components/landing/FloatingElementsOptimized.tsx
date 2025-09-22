import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceOptimization, getMotionProps } from '@/hooks/usePerformanceOptimization';

const FloatingElementsOptimized: React.FC = () => {
  const config = usePerformanceOptimization();
  
  // Don't render on mobile or low-end devices
  if (config.disableMotion || config.simplifyEffects) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static decorative elements for mobile */}
        <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-gradient-to-br from-miyo-100/20 to-miyo-200/10 border border-miyo-200/20" />
        <div className="absolute top-1/4 right-20 w-12 h-12 rounded-full bg-gradient-to-br from-miyo-100/20 to-miyo-200/10 border border-miyo-200/20" />
        <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-gradient-to-br from-miyo-100/20 to-miyo-200/10 border border-miyo-200/20" />
      </div>
    );
  }

  const circles = [
    { size: 'w-24 h-24', position: 'top-10 left-10', delay: 0 },
    { size: 'w-16 h-16', position: 'top-1/4 right-20', delay: 1 },
    { size: 'w-20 h-20', position: 'bottom-20 left-1/4', delay: 2 }
  ];

  const simpleFloating = {
    y: [0, -10, 0],
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: circle.delay, duration: 1 }}
        >
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-br from-miyo-100/20 to-miyo-200/10 border border-miyo-200/20"
            {...getMotionProps({ animate: simpleFloating }, config)}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElementsOptimized;