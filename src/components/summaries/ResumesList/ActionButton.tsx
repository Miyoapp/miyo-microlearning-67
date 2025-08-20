
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  variant, 
  children, 
  onClick, 
  icon: Icon,
  disabled = false 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-miyo-600 to-miyo-700 text-white hover:from-miyo-700 hover:to-miyo-800';
      case 'secondary':
        return 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200';
      case 'danger':
        return 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100';
      default:
        return '';
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all 
        hover:-translate-y-0.5 disabled:hover:translate-y-0
        ${getVariantClasses()}
      `}
      variant="ghost"
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  );
};

export default ActionButton;
