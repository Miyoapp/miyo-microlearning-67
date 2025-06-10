
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PremiumBadgeProps {
  className?: string;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ className = '' }) => {
  return (
    <Badge 
      className={`absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold text-xs px-2 py-1 shadow-lg ${className}`}
    >
      PREMIUM
    </Badge>
  );
};

export default PremiumBadge;
