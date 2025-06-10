
import React from 'react';
import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  className?: string;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ className = '' }) => {
  return (
    <div 
      className={`absolute top-2 right-2 inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${className}`}
    >
      <Crown className="w-3 h-3" />
      <span>Premium</span>
    </div>
  );
};

export default PremiumBadge;
